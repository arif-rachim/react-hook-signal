import {useRecordErrorMessage} from "../hooks/useRecordErrorMessage.ts";
import {AnySignal, effect, useComputed, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {FetcherInstance, VariableInstance} from "../AppDesigner.tsx";
import {undefined, z, ZodType} from "zod";
import {useNavigateSignal} from "../hooks/useNavigateSignal.tsx";
import {useAppContext} from "../hooks/useAppContext.ts";
import {createRequest} from "../panels/fetchers/editor/createRequest.ts";

export function VariableInitialization() {
    const errorMessage = useRecordErrorMessage();
    const {
        allVariablesSignal,
        allFetchersSignal,
        allVariablesSignalInstance,
        variableInitialValueSignal
    } = useAppContext();
    const navigateSignal = useNavigateSignal();

    const validatorsComputed = useComputed<Array<{ variableId: string, validator: ZodType }>>(() => {
        const variables = allVariablesSignal.get();
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
    })

    useSignalEffect(() => {
        const variableInstances = allVariablesSignalInstance.get();
        const variableValidators = validatorsComputed.get();
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
    })

    useSignalEffect(() => {
        const variables = allVariablesSignal.get();
        const fetchers = allFetchersSignal.get();
        const variableInitialValue = variableInitialValueSignal.get();
        const variablesInstance: Array<VariableInstance> = [];
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
            if (v.type === 'state') {
                const module = {exports: {}};
                if (v.name in variableInitialValue && variableInitialValue[v.name] !== undefined && variableInitialValue[v.name] !== null) {
                    module.exports = variableInitialValue[v.name] as unknown as typeof module.exports;
                    const state = new Signal.State(module.exports);
                    variablesInstance.push({id: v.id, instance: state});
                    errorMessage.variableValue({variableId: v.id});
                } else {
                    const params = ['module', v.functionCode];
                    try {
                        const init = new Function(...params);
                        init.call(null, module);
                        const state = new Signal.State(module.exports);
                        variablesInstance.push({id: v.id, instance: state});
                        errorMessage.variableValue({variableId: v.id});
                    } catch (err) {
                        errorMessage.variableValue({variableId: v.id, err})
                    }
                }
            } else {
                const dependencies = (v.dependencies ?? []).map(d => {
                    const isVariable = allVariablesSignal.get().findIndex(i => i.id === d) >= 0;
                    const isFetcher = allFetchersSignal.get().findIndex(i => i.id === d) >= 0;
                    if (isVariable) {
                        const name = allVariablesSignal.get().find(i => i.id === d)?.name;
                        const instance = variablesInstance.find(i => i.id === d)?.instance;
                        return {name, instance}
                    }
                    if (isFetcher) {
                        const name = allFetchersSignal.get().find(i => i.id === d)?.name;
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
                    const params = ['navigate', ...dependencies.map(d => d.name), v.functionCode];
                    try {
                        const init = new Function(...params);
                        const destructor = effect(() => {
                            const navigate = navigateSignal.get();
                            for (const dep of dependencies) {
                                if (dep && dep.instance && 'get' in dep.instance) {
                                    dep.instance.get();
                                }
                            }
                            const instances = [navigate, ...dependencies.map(d => d.instance)]
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
        }
    });
    return <></>
}