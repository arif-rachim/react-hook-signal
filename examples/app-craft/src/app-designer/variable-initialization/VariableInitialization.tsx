import {useRecordErrorMessage} from "../hooks/useRecordErrorMessage.ts";
import {AnySignal, effect, useComputed, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {Fetcher, FetcherInstance, Variable, VariableInstance} from "../AppDesigner.tsx";
import {undefined, z, ZodType} from "zod";
import {useNavigateSignal} from "../hooks/useNavigateSignal.tsx";
import {useAppContext} from "../hooks/useAppContext.ts";
import {createRequest} from "../panels/fetchers/editor/createRequest.ts";
import {dbSchemaInitialization} from "./dbSchemaInitialization.ts";
import {callableInitialization} from "./callableSchemaInitialization.ts";
import {debounce} from "../../utils/debounce.ts";

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

function initializeVariablesAndFetchers(
    fetchers: Array<Fetcher>,
    variables: Array<Variable>,
    variablesInstance: Array<VariableInstance>,
    variableInitialValue: Record<string, unknown>,
    errorMessage: ReturnType<typeof useRecordErrorMessage>,
    navigateSignal: Signal.Computed<Record<string, (param: unknown) => void>>,
    call: Record<string, (...args: unknown[]) => unknown>,
    allVariablesSignalInstance: Signal.State<Array<VariableInstance>>) {

    const fetchersInstance: Array<FetcherInstance> = [];
    const destructorCallbacks: Array<() => void> = [];

    for (const fetcher of fetchers) {
        const fun = new Function('createRequest', 'fetcher', `return (inputs) => new Promise(resolve => {
            const {address,requestInit} = createRequest(fetcher,inputs);
            fetch(address,requestInit).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            }).then(data => resolve({result:data})).catch(error => resolve({error:error.message}))
            })`);
        const fetchRequest: FetcherInstance['instance'] = fun(createRequest, fetcher);
        fetchersInstance.push({id: fetcher.id, instance: fetchRequest});
    }

    for (const v of variables) {
        const variableIndex = variablesInstance.findIndex(vi => vi.id === v.id);
        if (v.type === 'state') {

            const module = {exports: {}};
            if (v.name in variableInitialValue && variableInitialValue[v.name] !== undefined && variableInitialValue[v.name] !== null) {
                if (variableIndex >= 0) {
                    continue;
                }
                module.exports = variableInitialValue[v.name] as unknown as typeof module.exports;
                const state = new Signal.State(module.exports);
                variablesInstance.push({id: v.id, instance: state});
                errorMessage.variableValue({variableId: v.id});
            } else {
                const params = ['module', v.functionCode];
                try {
                    const init = new Function(...params);
                    init.call(null, module);
                    if (variableIndex >= 0) {
                        // we do not recreate state if its already exist !
                        (variablesInstance[variableIndex].instance as Signal.State<unknown>).set(module.exports)
                        continue;
                    }
                    const state = new Signal.State(module.exports);
                    variablesInstance.push({id: v.id, instance: state});
                    errorMessage.variableValue({variableId: v.id});
                } catch (err) {
                    errorMessage.variableValue({variableId: v.id, err})
                }
            }
        } else {
            // we do not recreate effect or computed if its already exist !
            if (variableIndex >= 0) {
                continue;
            }
            const dependencies = (v.dependencies ?? []).map(d => {
                const isVariable = variables.findIndex(i => i.id === d) >= 0;
                const isFetcher = fetchers.findIndex(i => i.id === d) >= 0;
                if (isVariable) {
                    const name = variables.find(i => i.id === d)?.name;
                    const instance = variablesInstance.find(i => i.id === d)?.instance;
                    return {name, instance}
                }
                if (isFetcher) {
                    const name = fetchers.find(i => i.id === d)?.name;
                    const instance = fetchersInstance.find(i => i.id === d)?.instance;
                    return {name, instance}
                }
                return {name: undefined, instance: undefined}
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
                            errorMessage.variableValue({variableId: v.id})
                        } catch (err) {
                            errorMessage.variableValue({variableId: v.id, err})
                        }
                        return module.exports;
                    });
                    variablesInstance.push({id: v.id, instance: computed});
                    errorMessage.variableValue({variableId: v.id});
                } catch (err) {
                    errorMessage.variableValue({variableId: v.id, err})
                }
            }
            if (v.type === 'effect') {
                const params = ['navigate', 'db', 'call', ...dependencies.map(d => d.name), v.functionCode];
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
                        const instances = [navigate, db, call, ...dependencies.map(d => d.instance)]
                        try {
                            init.call(null, ...instances);
                            errorMessage.variableValue({variableId: v.id})
                        } catch (err) {
                            errorMessage.variableValue({variableId: v.id, err})
                        }
                    });
                    destructorCallbacks.push(destructor);
                    errorMessage.variableValue({variableId: v.id})
                } catch (err) {
                    errorMessage.variableValue({variableId: v.id, err})
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
        const variables = allApplicationVariablesSignal.get() ?? [];
        // there is no fetchers in application level
        const fetchers:Fetcher[] = [];
        // there is no variable initial value in application level
        const variableInitialValue = {};
        const call = callableInitialization(allCallablesSignal.get() ?? []);
        const variablesInstance: Array<VariableInstance> = allApplicationVariablesSignalInstance.get();
        return initializeVariablesAndFetchers(fetchers, variables, variablesInstance, variableInitialValue, errorMessage, navigateSignal, call, allVariablesSignalInstance);
    });

    useSignalEffect(() => {
        const variables = allVariablesSignal.get() ?? [];
        const fetchers = allFetchersSignal.get() ?? [];
        const variableInitialValue = variableInitialValueSignal.get() ?? {};
        const call = callableInitialization(allCallablesSignal.get() ?? []);
        const variablesInstance: Array<VariableInstance> = allVariablesSignalInstance.get();
        return initializeVariablesAndFetchers(fetchers, variables, variablesInstance, variableInitialValue, errorMessage, navigateSignal, call, allVariablesSignalInstance);
    });
    return <></>
}



