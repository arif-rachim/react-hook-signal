import {useRecordErrorMessage} from "../hooks/useRecordErrorMessage.ts";
import {AnySignal, effect, useComputed, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {Variable, VariableInstance} from "../AppDesigner.tsx";
import {undefined, z, ZodType} from "zod";
import {useNavigateSignal} from "../hooks/useNavigateSignal.tsx";
import {useAppContext} from "../hooks/useAppContext.ts";
import {dbSchemaInitialization} from "./dbSchemaInitialization.ts";
import {callableInitialization} from "./callableSchemaInitialization.ts";
import {fetcherInitialization} from "./fetcherSchemaInitialization.ts";
import {queryInitialization} from "./queryInitialization.ts";
import {createContext, PropsWithChildren} from "react";
import {QueryTypeResult} from "../query-grid/QueryGrid.tsx";


const db = dbSchemaInitialization()

function createValidator(variables: Array<Variable>, errorMessage: ReturnType<typeof useRecordErrorMessage>) {
    const result: Array<{ variableId: string, validator: ZodType }> = [];
    for (const variable of variables) {
        if (variable.type === 'effect') {
            continue;
        }
        try {
            const fun = new Function('z', `return ${variable.schemaCode}`);
            const validator = fun.call(null, z) as ZodType;
            result.push({variableId: variable.id, validator: validator});
            errorMessage.variableSchema({variableId: variable.id});
        } catch (err) {
            errorMessage.variableSchema({variableId: variable.id, err})
        }
    }
    return result;
}

function validateVariables(variableInstances: Array<VariableInstance>, variableValidators: Array<{
    variableId: string;
    validator: ZodType
}>, errorMessage: ReturnType<typeof useRecordErrorMessage>) {
    for (const instances of variableInstances) {
        const index = variableValidators.findIndex(v => v.variableId === instances.id);
        if (index >= 0) {
            const {validator} = variableValidators[index]!
            if (validator) {
                try {
                    validator.parse(instances.instance.get())
                    errorMessage.variableValidation({variableId: instances.id});
                } catch (err) {
                    errorMessage.variableValidation({variableId: instances.id, err});
                }
            }
        }
    }
}

const initiateComputed = (app: FormulaDependencyParameter, page: FormulaDependencyParameter) => (v: Variable) => {
    const params = ['module', 'app', 'page', v.functionCode];
    try {
        const init = new Function(...params);
        const computed = new Signal.Computed(() => {
            const module: { exports: unknown } = {exports: undefined};
            const instances = [module, app, page]
            try {
                init.call(null, ...instances);
            } catch (err) {
                console.error(err);
            }
            return module.exports;
        });
        return {id: v.id, instance: computed};
    } catch (err) {
        console.error(err);
    }
    return {
        id: v.id,
        instance: new Signal.Computed(() => {
        })
    }
}

const initiateState = (variableInitialValue: Record<string, unknown>) => (v: Variable) => {
    const module = {exports: {}};
    if (v.name in variableInitialValue && variableInitialValue[v.name] !== undefined && variableInitialValue[v.name] !== null) {
        module.exports = variableInitialValue[v.name] as unknown as typeof module.exports;
        const state = new Signal.State(module.exports);
        return {id: v.id, instance: state}
    } else {
        const params = ['module', v.functionCode];
        try {
            const init = new Function(...params);
            init.call(null, module);
            const state = new Signal.State(module.exports);
            return {id: v.id, instance: state}
        } catch (err) {
            console.error(err);
        }
    }
    return {
        instance: new Signal.State(undefined),
        id: v.id
    }
}

function initiateEffect(props: {
    navigate: (path: string, param?: unknown) => Promise<void>,
    variables: Array<Variable>,
    app: FormulaDependencyParameter,
    page: FormulaDependencyParameter
}) {
    const {
        navigate,
        variables,
        app,
        page
    } = props;

    const destructorCallbacks: Array<() => void> = [];
    for (const v of variables) {
        if (v.type !== 'effect') {
            continue;
        }
        const params = ['navigate', 'db', 'app', 'page', v.functionCode];
        try {
            const func = new Function(...params) as (...args: unknown[]) => void
            const destructor = effect(() => {
                const instances = [navigate, db, app, page]
                try {
                    func.call(null, ...instances);
                } catch (err) {
                    console.error(err);
                }
            });
            destructorCallbacks.push(destructor);
        } catch (err) {
            console.error(err);
        }
    }
    return () => {
        destructorCallbacks.forEach(d => d());
    }
}


export type QueryType = (inputs?: Record<string, unknown>, page?: number) => Promise<QueryTypeResult>

export type FetchType = (inputs?: Record<string, unknown>) => Promise<Record<string, unknown> & { error?: string }>
export type FormulaDependencyParameter = {
    var?: Record<string, AnySignal<unknown>>,
    call?: Record<string, (...args: unknown[]) => unknown>,
    fetch?: Record<string, FetchType>,
    query?: Record<string, QueryType>,
}

export function VariableInitialization(props: PropsWithChildren) {

    const errorMessage = useRecordErrorMessage();
    const {
        allPageVariablesSignal,
        allPageVariablesSignalInstance,
        allPageQueriesSignal,
        allPageCallablesSignal,
        allPageFetchersSignal,
        variableInitialValueSignal,
        allApplicationCallablesSignal,
        allApplicationVariablesSignal,
        allApplicationVariablesSignalInstance,
        allApplicationFetchersSignal,
        allApplicationQueriesSignal,
    } = useAppContext();

    const navigate = useNavigateSignal();

    const validatorsApplicationComputed = useComputed<Array<{ variableId: string, validator: ZodType }>>(() => {
        return createValidator(allApplicationVariablesSignal.get(), errorMessage);
    });

    const validatorsComputed = useComputed<Array<{ variableId: string, validator: ZodType }>>(() => {
        return createValidator(allPageVariablesSignal.get(), errorMessage);
    });

    useSignalEffect(() => {
        const variableInstances = allApplicationVariablesSignalInstance.get();
        const variableValidators = validatorsApplicationComputed.get();
        validateVariables(variableInstances, variableValidators, errorMessage);
    });

    useSignalEffect(() => {
        const variableInstances = allPageVariablesSignalInstance.get();
        const variableValidators = validatorsComputed.get();
        validateVariables(variableInstances, variableValidators, errorMessage);
    });


    const appScopesSignal = useComputed(() => {

        const allApplicationVariablesInstance = allApplicationVariablesSignalInstance.get();
        const appVar = variablesInstanceToDictionary(allApplicationVariablesInstance, allApplicationVariablesSignal.get());
        const appQueries = queryInitialization(allApplicationQueriesSignal.get());
        const app: FormulaDependencyParameter = {
            var: appVar,
            query: appQueries,
        }
        app.fetch = fetcherInitialization({
            allFetchers: allApplicationFetchersSignal.get(),
            app,
            page: {}
        })
        app.call = callableInitialization({
            allCallables: allApplicationCallablesSignal.get(),
            app,
            page: {},
            navigate
        })
        return {app};
    });

    const pageScopesSignal = useComputed(() => {
        const {app} = appScopesSignal.get();
        const allPageVariablesInstance = allPageVariablesSignalInstance.get();
        const pageVar = variablesInstanceToDictionary(allPageVariablesInstance, allPageVariablesSignal.get());
        const pageQueries = queryInitialization(allPageQueriesSignal.get());
        const page: FormulaDependencyParameter = {
            var: pageVar,
            query: pageQueries
        }
        page.fetch = fetcherInitialization({
            allFetchers: allPageFetchersSignal.get(),
            app,
            page
        });
        page.call = callableInitialization({
            allCallables: allPageCallablesSignal.get(),
            app,
            page,
            navigate
        })
        return {page};
    });

    useSignalEffect(() => {
        const variables = allApplicationVariablesSignal.get() ?? [];
        const stateInstances: Array<VariableInstance> = variables.filter(v => v.type === 'state').map(initiateState({}));
        const computedInstance = variables.filter(v => v.type === 'computed').map(initiateComputed({
            var: variablesInstanceToDictionary(stateInstances, variables)
        }, {}))
        allApplicationVariablesSignalInstance.set([...stateInstances, ...computedInstance]);
    });

    useSignalEffect(() => {
        const applicationVariables = allApplicationVariablesSignal.get() ?? [];
        const applicationVariablesInstance = allApplicationVariablesSignalInstance.get();
        const variableInitialValue = variableInitialValueSignal.get() ?? {};
        const variables = allPageVariablesSignal.get() ?? [];
        const stateInstances: Array<VariableInstance> = variables.filter(v => v.type === 'state').map(initiateState(variableInitialValue));
        const computedInstance = variables.filter(v => v.type === 'computed').map(initiateComputed({
            var: variablesInstanceToDictionary(applicationVariablesInstance, applicationVariables),
        }, {
            var: variablesInstanceToDictionary(stateInstances, variables),
        }))
        allPageVariablesSignalInstance.set([...stateInstances, ...computedInstance]);
    });

    useSignalEffect(() => {
        const {app} = appScopesSignal.get();
        const variables = allApplicationVariablesSignal.get();
        return initiateEffect({
            app,
            page: {},
            navigate,
            variables
        })
    })
    useSignalEffect(() => {
        const {app} = appScopesSignal.get();
        const {page} = pageScopesSignal.get();

        const variables = allPageVariablesSignal.get();
        return initiateEffect({
            app,
            page,
            navigate,
            variables
        })
    })
    const scopeSignals = useComputed(() => {
        return {
            app: appScopesSignal.get().app,
            page: pageScopesSignal.get().page
        }
    })
    return <VariableInitializationContext.Provider value={scopeSignals}>
        {props.children}
    </VariableInitializationContext.Provider>
}

export const VariableInitializationContext = createContext<AnySignal<{
    app: FormulaDependencyParameter,
    page: FormulaDependencyParameter
}>>(new Signal.State({app: {}, page: {}}));

function variablesInstanceToDictionary(variableInstances: Array<VariableInstance>, variables: Array<Variable>): Record<string, AnySignal<unknown>> {
    return variableInstances.reduce((res, variableInstance) => {
        const v = variables.find(v => variableInstance.id === v.id);
        if (v) {
            res[v.name] = variableInstance.instance
        }
        return res;
    }, {} as Record<string, AnySignal<unknown>>);
}