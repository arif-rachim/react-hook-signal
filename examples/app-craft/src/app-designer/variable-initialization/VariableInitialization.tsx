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
import untrack = Signal.subtle.untrack;

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

function initializeVariables(props: {
    navigate: (path:string,param?:unknown) => Promise<void>,
    variables: Array<Variable>,
    variableInitialValue: Record<string, unknown>,
    allVariablesSignalInstance: Signal.State<Array<VariableInstance>>,
    errorMessage: ReturnType<typeof useRecordErrorMessage>,
    app: FormulaDependencyParameter,
    page: FormulaDependencyParameter
}) {
    const {
        navigate,
        variables,
        variableInitialValue,
        allVariablesSignalInstance,
        app,
        page
    } = props;

    const variablesInstance: Array<VariableInstance> = [];
    const destructorCallbacks: Array<() => void> = [];
    for (const v of variables) {
        if (v.type === 'state') {
            const module = {exports: {}};
            if (v.name in variableInitialValue && variableInitialValue[v.name] !== undefined && variableInitialValue[v.name] !== null) {
                module.exports = variableInitialValue[v.name] as unknown as typeof module.exports;
                const state = new Signal.State(module.exports);
                variablesInstance.push({id: v.id, instance: state});
            } else {
                const params = ['module', v.functionCode];
                try {
                    const init = new Function(...params);
                    init.call(null, module);
                    const state = new Signal.State(module.exports);
                    variablesInstance.push({id: v.id, instance: state});
                    //errorMessage.variableValue({variableId:v.id});
                } catch (err) {
                    //errorMessage.variableValue({variableId:v.id,err});
                }
            }
        } else {

            if (v.type === 'computed') {
                const params = ['module', 'app', 'page', v.functionCode];
                try {
                    const init = new Function(...params);
                    const computed = new Signal.Computed(() => {
                        const module: { exports: unknown } = {exports: undefined};
                        const instances = [module, app, page]
                        try {
                            init.call(null, ...instances);
                            //errorMessage.variableValue({variableId:v.id});
                        } catch (err) {
                            //errorMessage.variableValue({variableId:v.id,err});
                            console.error(err);
                        }
                        return module.exports;
                    });
                    variablesInstance.push({id: v.id, instance: computed});
                    //errorMessage.variableValue({variableId:v.id});
                } catch (err) {
                    //errorMessage.variableValue({variableId:v.id,err});
                    console.error(err);
                }
            }
            if (v.type === 'effect') {
                const params = ['navigate', 'db', 'app', 'page', v.functionCode];
                try {
                    const func = new Function(...params) as (...args: unknown[]) => void
                    const destructor = effect(() => {
                        const instances = [navigate, db, app, page]
                        try {
                            func.call(null, ...instances);
                            //errorMessage.variableValue({variableId:v.id});
                        } catch (err) {
                            //errorMessage.variableValue({variableId:v.id,err});
                            console.error(err);
                        }
                    });
                    destructorCallbacks.push(destructor);
                    //errorMessage.variableValue({variableId:v.id});
                } catch (err) {
                    //errorMessage.variableValue({variableId:v.id,err});
                    console.error(err);
                }
            }
        }
    }
    allVariablesSignalInstance.set(variablesInstance);
    return () => {
        destructorCallbacks.forEach(d => d());
    }
}


export type QueryType = (inputs?: Record<string, unknown>, page?: number) => Promise<{
    error?: string,
    data: Record<string, number | string | Uint8Array | null>[],
    columns: string[],
    totalPage: number,
    currentPage: number
}>

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

        const allApplicationVariables = allApplicationVariablesSignal.get();
        const allApplicationVariablesInstance = allApplicationVariablesSignalInstance.get();

        const allPageVariables = allPageVariablesSignal.get();
        const allPageVariablesInstance = allPageVariablesSignalInstance.get();

        const appVar = allApplicationVariables.reduce((res, v) => {
            if (v.type === 'effect') {
                return res;
            }
            const variableInstance = allApplicationVariablesInstance.find(variable => variable.id === v.id);
            if (variableInstance) {
                res[v.name] = variableInstance.instance
            }
            return res;
        }, {} as Record<string, AnySignal<unknown>>);
        const pageVar = allPageVariables.reduce((res, v) => {
            if (v.type === 'effect') {
                return res;
            }
            const variableInstance = allPageVariablesInstance.find(variable => variable.id === v.id);
            if (variableInstance) {
                res[v.name] = variableInstance.instance
            }

            return res;
        }, {} as Record<string, AnySignal<unknown>>);

        const appQueries = queryInitialization(allApplicationQueriesSignal.get());
        const pageQueries = queryInitialization(allPageQueriesSignal.get());

        const app: FormulaDependencyParameter = {
            var: appVar,
            query: appQueries,
        }

        const page: FormulaDependencyParameter = {
            var: pageVar,
            query: pageQueries
        }

        app.fetch = fetcherInitialization({
            allFetchers: allApplicationFetchersSignal.get(),
            app,
            page
        })

        page.fetch = fetcherInitialization({
            allFetchers: allPageFetchersSignal.get(),
            app,
            page
        });

        app.call = callableInitialization({
            allCallables: allApplicationCallablesSignal.get(),
            app,
            page
        })

        page.call = callableInitialization({
            allCallables: allPageCallablesSignal.get(),
            app,
            page
        })
        return {app, page};
    });

    useSignalEffect(() => {
        const variables = allApplicationVariablesSignal.get() ?? [];
        const variableInitialValue = {};
        const appScope = untrack(() => appScopesSignal.get());
        return initializeVariables({
            allVariablesSignalInstance: allApplicationVariablesSignalInstance,
            app: appScope.app,
            page: appScope.page,
            variables,
            variableInitialValue,
            errorMessage,
            navigate
        });
    });

    useSignalEffect(() => {
        const variables = allPageVariablesSignal.get() ?? [];
        const variableInitialValue = variableInitialValueSignal.get() ?? {};
        const appScope = untrack(() => appScopesSignal.get());
        return initializeVariables({
            allVariablesSignalInstance: allPageVariablesSignalInstance,
            app: appScope.app,
            page: appScope.page,
            variables,
            variableInitialValue,
            errorMessage,
            navigate
        });
    });
    return <VariableInitializationContext.Provider value={appScopesSignal}>
        {props.children}
    </VariableInitializationContext.Provider>
}

export const VariableInitializationContext = createContext<AnySignal<{
    app: FormulaDependencyParameter,
    page: FormulaDependencyParameter
}>>(new Signal.State({app: {}, page: {}}));