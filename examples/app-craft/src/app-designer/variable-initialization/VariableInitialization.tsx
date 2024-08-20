import {useRecordErrorMessage} from "../hooks/useRecordErrorMessage.ts";
import {AnySignal, effect, useComputed, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {Variable, VariableInstance} from "../AppDesigner.tsx";
import {undefined, z, ZodType} from "zod";
import {useNavigateSignal} from "../hooks/useNavigateSignal.tsx";
import {useAppContext} from "../hooks/useAppContext.ts";
import {dbSchemaInitialization} from "./dbSchemaInitialization.ts";
import {callableInitialization} from "./callableSchemaInitialization.ts";
import {debounce} from "../../utils/debounce.ts";
import {EMPTY_ARRAY} from "../../utils/EmptyArray.ts";
import {fetchersInitialization} from "./fetcherSchemaInitialization.ts";
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

function initializeVariables(
    fetchers: Record<string, (input: Record<string, unknown>) => unknown>,
    applicationVariables: Array<Variable>,
    applicationVariablesInstance: Array<VariableInstance>,
    variables: Array<Variable>,
    variableInitialValue: Record<string, unknown>,
    errorMessage: ReturnType<typeof useRecordErrorMessage>,
    navigateSignal: Signal.Computed<Record<string, (param: unknown) => void>>,
    call: Record<string, (...args: unknown[]) => unknown>,
    allVariablesSignalInstance: Signal.State<Array<VariableInstance>>) {
    console.log('Error',errorMessage);
    const variablesInstance: Array<VariableInstance> = [];
    const destructorCallbacks: Array<() => void> = [];

    for (const v of variables) {
        if (v.type === 'state') {
            const module = {exports: {}};
            if (v.name in variableInitialValue && variableInitialValue[v.name] !== undefined && variableInitialValue[v.name] !== null) {
                module.exports = variableInitialValue[v.name] as unknown as typeof module.exports;
                const state = new Signal.State(module.exports);
                variablesInstance.push({id: v.id, instance: state});
                //errorMessage.variableValue({variableId: v.id});
            } else {
                const params = ['module', v.functionCode];
                try {
                    const init = new Function(...params);
                    init.call(null, module);
                    const state = new Signal.State(module.exports);
                    variablesInstance.push({id: v.id, instance: state});
                    //errorMessage.variableValue({variableId: v.id});
                } catch (err) {
                    //errorMessage.variableValue({variableId: v.id, err})
                }
            }
        }else {
            const dependencies = (v.dependencies ?? []).map(d => {
                const allVariables = [...variables, ...applicationVariables];
                const allVariablesInstance = [...variablesInstance,...applicationVariablesInstance];
                const name = allVariables.find(i => i.id === d)?.name;
                const instance = allVariablesInstance.find(i => i.id === d)?.instance;
                return {name, instance}
            }) as Array<{ name: string, instance: AnySignal<unknown> }>;

            if (v.type === 'computed') {
                const params = ['module', ...dependencies.map(d => d.name), v.functionCode];
                try {
                    const init = new Function(...params);

                    const computed = new Signal.Computed(() => {
                        for (const dep of dependencies) {
                            if (dep && dep.instance && 'get' in dep.instance) {
                                dep.instance.get();
                            }
                        }
                        const module: { exports: unknown } = {exports: undefined};
                        const instances = [module, ...dependencies.map(d => d.instance)]
                        try {
                            init.call(null, ...instances);
                            //errorMessage.variableValue({variableId: v.id})
                        } catch (err) {
                            //errorMessage.variableValue({variableId: v.id, err})
                        }
                        return module.exports;
                    });
                    variablesInstance.push({id: v.id, instance: computed});
                    //errorMessage.variableValue({variableId: v.id});
                } catch (err) {
                    //errorMessage.variableValue({variableId: v.id, err})
                }
            }
            if (v.type === 'effect') {
                const params = ['navigate', 'db', 'call', 'fetchers', ...dependencies.map(d => d.name), v.functionCode];
                try {
                    const func = new Function(...params) as (...args: unknown[]) => void
                    const init = debounce(func, 100);
                    const destructor = effect(() => {
                        const navigate = navigateSignal.get();
                        for (const dep of dependencies) {
                            if (dep && dep.instance && 'get' in dep.instance) {
                                dep.instance.get();
                            }
                        }
                        const instances = [navigate, db, call, fetchers, ...dependencies.map(d => d.instance)]
                        try {
                            init.call(null, ...instances);
                            //errorMessage.variableValue({variableId: v.id})
                        } catch (err) {
                            //errorMessage.variableValue({variableId: v.id, err})
                        }
                    });
                    destructorCallbacks.push(destructor);
                    //errorMessage.variableValue({variableId: v.id})
                } catch (err) {
                    //errorMessage.variableValue({variableId: v.id, err})
                }
            }
        }
    }
    allVariablesSignalInstance.set(variablesInstance);
    return () => {
        destructorCallbacks.forEach(d => d());
        console.log('[destructorCallbacks] INVOKED !')
    }
}

export function VariableInitialization() {

    const errorMessage = useRecordErrorMessage();
    const {
        allVariablesSignal,
        allFetchersSignal,
        allVariablesSignalInstance,
        variableInitialValueSignal,
        allCallablesSignal,
        allApplicationVariablesSignal,
        allApplicationVariablesSignalInstance,
    } = useAppContext();

    const navigateSignal = useNavigateSignal();

    const validatorsApplicationComputed = useComputed<Array<{ variableId: string, validator: ZodType }>>(() => {
        return createValidator(allApplicationVariablesSignal.get(), errorMessage);
    });

    const validatorsComputed = useComputed<Array<{ variableId: string, validator: ZodType }>>(() => {
        return createValidator(allVariablesSignal.get(), errorMessage);
    });

    useSignalEffect(() => {
        const variableInstances = allApplicationVariablesSignalInstance.get();
        const variableValidators = validatorsApplicationComputed.get();
        validateVariables(variableInstances, variableValidators, errorMessage);
    });

    useSignalEffect(() => {
        const variableInstances = allVariablesSignalInstance.get();
        const variableValidators = validatorsComputed.get();
        validateVariables(variableInstances, variableValidators, errorMessage);
    });

    useSignalEffect(() => {
        const variables = allApplicationVariablesSignal.get() ?? EMPTY_ARRAY;
        const call = untrack(() => callableInitialization(allCallablesSignal.get() ?? []));
        const variableInitialValue = {};
        const fetchers = {};
        const applicationVariables:Array<Variable> = [];
        const applicationVariablesInstance:Array<VariableInstance> = [];
        return initializeVariables(fetchers, applicationVariables, applicationVariablesInstance, variables, variableInitialValue, errorMessage, navigateSignal, call, allApplicationVariablesSignalInstance);
    });

    useSignalEffect(() => {
        const variables = allVariablesSignal.get() ?? [];
        const applicationVariables = allApplicationVariablesSignal.get() ?? EMPTY_ARRAY;
        const call = untrack(() => callableInitialization(allCallablesSignal.get() ?? []));
        const fetchers = untrack(() => fetchersInitialization(allFetchersSignal.get() ?? EMPTY_ARRAY));
        const variableInitialValue = variableInitialValueSignal.get() ?? {};
        const applicationVariablesInstance = allApplicationVariablesSignalInstance.get();
        return initializeVariables(fetchers, applicationVariables, applicationVariablesInstance, variables, variableInitialValue, errorMessage, navigateSignal, call, allVariablesSignalInstance);
    });
    return <></>
}
