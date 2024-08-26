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
    fetchers: Record<string, (input: Record<string, unknown>) => unknown>,
    variables: Array<Variable>,
    variableInitialValue: Record<string, unknown>,
    errorMessage: ReturnType<typeof useRecordErrorMessage>,
    navigateSignal: Signal.Computed<Record<string, (param: unknown) => void>>,
    call: Record<string, (...args: unknown[]) => unknown>,
    allVariablesSignalInstance: Signal.State<Array<VariableInstance>>,
    queries: Record<string, (input: Record<string, unknown>,page?:number) => unknown>,
}) {
    const {
        navigateSignal,
        call,
        fetchers,
        variables,
        variableInitialValue,
        allVariablesSignalInstance,
        queries
    } = props;

    const variablesInstance: Array<VariableInstance> = [];
    const destructorCallbacks: Array<() => void> = [];
    const navigate = navigateSignal.get();
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
                } catch (err) {
                    console.error(err)
                }
            }
        } else {
            const dependencies = variables.map(v => {
                const instance = variablesInstance.find(i => i.id === v.id)?.instance;
                return {name: v.name, instance}
            }) as Array<{ name: string, instance: AnySignal<unknown> }>;

            if (v.type === 'computed') {
                const params = ['module', ...dependencies.map(d => d.name), v.functionCode];
                try {
                    const init = new Function(...params);
                    const computed = new Signal.Computed(() => {
                        const module: { exports: unknown } = {exports: undefined};
                        const instances = [module, ...dependencies.map(d => d.instance)]
                        try {
                            init.call(null, ...instances);
                        } catch (err) {
                            console.error(err);
                        }
                        return module.exports;
                    });
                    variablesInstance.push({id: v.id, instance: computed});
                } catch (err) {
                    console.error(err);
                }
            }
            if (v.type === 'effect') {
                const params = ['navigate', 'db', 'call', 'fetchers', 'query', ...dependencies.map(d => d.name), v.functionCode];
                try {
                    const func = new Function(...params) as (...args: unknown[]) => void
                    const destructor = effect(() => {
                        const instances = [navigate, db, call, fetchers, queries, ...dependencies.map(d => d.instance)]
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
        }
    }
    allVariablesSignalInstance.set(variablesInstance);
    return () => {
        destructorCallbacks.forEach(d => d());
    }
}

export function VariableInitialization() {

    const errorMessage = useRecordErrorMessage();
    const {
        allPageVariablesSignal,
        allPageFetchersSignal,
        allPageVariablesSignalInstance,
        allPageCallablesSignal,
        allPageQueriesSignal,
        variableInitialValueSignal,
        allApplicationCallablesSignal,
        allApplicationVariablesSignal,
        allApplicationVariablesSignalInstance,
        allApplicationFetchersSignal,
        allApplicationQueriesSignal,
    } = useAppContext();

    const navigateSignal = useNavigateSignal();

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

    const allVariablesSignal = useComputed(() => {
        return [...allApplicationVariablesSignal.get(), ...allPageVariablesSignal.get()]
    })

    const allVariablesSignalInstance = useComputed(() => {
        return [...allApplicationVariablesSignalInstance.get(), ...allPageVariablesSignalInstance.get()]
    });

    const allFetchersSignal = useComputed(() => {
        return [...allApplicationFetchersSignal.get(), ...allPageFetchersSignal.get()]
    })

    const allCallablesSignal = useComputed(() => {
        return [...allApplicationCallablesSignal.get(), ...allPageCallablesSignal.get()]
    })

    const allQueriesSignal = useComputed(() => {
        return [...allApplicationQueriesSignal.get(), ...allPageQueriesSignal.get()]
    })



    useSignalEffect(() => {
        const variables = allApplicationVariablesSignal.get() ;
        const fetchers = untrack(() => fetcherInitialization(allApplicationFetchersSignal.get(), allApplicationVariablesSignal, allApplicationVariablesSignalInstance));
        const call = untrack(() => callableInitialization(allApplicationCallablesSignal.get(), allApplicationFetchersSignal.get(), allApplicationVariablesSignal, allApplicationVariablesSignalInstance,allApplicationQueriesSignal.get()));
        const queries = untrack(() => queryInitialization(allApplicationQueriesSignal.get()))
        const variableInitialValue = {};
        return initializeVariables({
            fetchers,
            variables,
            variableInitialValue,
            errorMessage,
            navigateSignal,
            call,
            queries,
            allVariablesSignalInstance: allApplicationVariablesSignalInstance
        });
    });

    useSignalEffect(() => {
        const variables = allPageVariablesSignal.get() ?? [];
        const fetchers = untrack(() => fetcherInitialization(allFetchersSignal.get(), allVariablesSignal, allVariablesSignalInstance));
        const call = untrack(() => callableInitialization(allCallablesSignal.get(), allFetchersSignal.get(), allVariablesSignal, allVariablesSignalInstance,allQueriesSignal.get()));
        const queries = untrack(() => queryInitialization(allQueriesSignal.get()))
        const variableInitialValue = variableInitialValueSignal.get() ?? {};

        return initializeVariables({
            fetchers,
            variables,
            variableInitialValue,
            errorMessage,
            navigateSignal,
            call,
            queries,
            allVariablesSignalInstance: allPageVariablesSignalInstance,
        });
    });
    return <></>
}
