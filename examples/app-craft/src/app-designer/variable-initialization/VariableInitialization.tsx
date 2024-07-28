import {useRecordErrorMessage} from "../hooks/useRecordErrorMessage.ts";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {AnySignal, effect, useComputed, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {VariableInstance} from "../AppDesigner.tsx";
import {undefined, z, ZodType} from "zod";

export function VariableInitialization() {
    const errorMessage = useRecordErrorMessage();
    const {allVariablesSignal, allVariablesSignalInstance} = useContext(AppDesignerContext);


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
        const variablesInstance: Array<VariableInstance> = [];
        const destructorCallbacks: Array<() => void> = [];

        for (const v of variables) {
            if (v.type === 'state') {
                const params = ['module', v.functionCode];
                const module = {exports: {}};
                try {
                    const init = new Function(...params);
                    init.call(null, module);
                    const state = new Signal.State(module.exports);
                    variablesInstance.push({id: v.id, instance: state});
                    errorMessage.variableValue({variableId: v.id});
                } catch (err) {
                    errorMessage.variableValue({variableId: v.id, err})
                }
            } else {
                const dependencies = (v.dependencies ?? []).map(d => {
                    const name = allVariablesSignal.get().find(i => i.id === d)?.name;
                    const instance = variablesInstance.find(i => i.id === d)?.instance;
                    return {name, instance}
                }) as Array<{ name: string, instance: AnySignal<unknown> }>;

                if (v.type === 'computed') {
                    const params = ['module', ...dependencies.map(d => d.name), v.functionCode];
                    try{
                        const init = new Function(...params);

                        const computed = new Signal.Computed(() => {
                            for (const dep of dependencies) {
                                dep.instance.get();
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
                    }catch(err){
                        errorMessage.variableValue({variableId: v.id, err})
                    }

                }
                if (v.type === 'effect') {
                    const params = [...dependencies.map(d => d.name), v.functionCode];
                    try{
                        const init = new Function(...params);
                        const destructor = effect(() => {
                            for (const dep of dependencies) {
                                dep.instance.get();
                            }
                            const instances = [...dependencies.map(d => d.instance)]
                            try {
                                init.call(null, ...instances);
                                errorMessage.variableValue({variableId: v.id})
                            } catch (err) {
                                errorMessage.variableValue({variableId: v.id, err})
                            }
                        });
                        destructorCallbacks.push(destructor);
                        errorMessage.variableValue({variableId: v.id})
                    }catch(err){
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