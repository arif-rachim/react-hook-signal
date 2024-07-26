import {useRecordErrorMessage} from "../hooks/useRecordErrorMessage.ts";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {AnySignal, effect, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {VariableInstance} from "../AppDesigner.tsx";

export function VariableInitialization() {
    const {recordVariableError} = useRecordErrorMessage();
    const {allVariablesSignal, allVariablesSignalInstance} = useContext(AppDesignerContext);
    useSignalEffect(() => {
        const variables = allVariablesSignal.get();
        const variablesInstance: Array<VariableInstance> = [];
        const destructorCallbacks: Array<() => void> = [];
        for (const v of variables) {
            if (v.type === 'state') {
                try {
                    const params = ['module', v.functionCode];
                    const init = new Function(...params);
                    const module = {exports: {}};
                    init.call(null, module);
                    const state = new Signal.State(module.exports);
                    variablesInstance.push({id: v.id, instance: state});
                    recordVariableError({referenceId: v.id});
                } catch (err) {
                    recordVariableError({error: err, referenceId: v.id});
                }
            } else {

                const dependencies = (v.dependencies ?? []).map(d => {
                    const name = allVariablesSignal.get().find(i => i.id === d)?.name;
                    if(name === undefined){
                        return false;
                    }
                    const instance = variablesInstance.find(i => i.id === d)?.instance;
                    if(instance === undefined){
                        return false;
                    }
                    return {name, instance}
                }).filter(f => f !== false) as Array<{ name: string, instance: AnySignal<unknown> }>;

                if (v.type === 'computed') {
                    try {
                        const params = ['module', ...dependencies.map(d => d.name), v.functionCode];
                        const init = new Function(...params);
                        const computed = new Signal.Computed(() => {
                            for (const dep of dependencies) {
                                dep.instance.get();
                            }
                            const module: { exports: unknown } = {exports: undefined};
                            const instances = [module, ...dependencies.map(d => d.instance)]
                            init.call(null, ...instances);
                            return module.exports;
                        });
                        variablesInstance.push({id: v.id, instance: computed});
                        recordVariableError({referenceId: v.id});
                    } catch (err) {
                        recordVariableError({error: err, referenceId: v.id});
                    }
                }
                if (v.type === 'effect') {
                    try {
                        const params = [...dependencies.map(d => d.name), v.functionCode];
                        const init = new Function(...params);
                        const destructor = effect(() => {
                            for (const dep of dependencies) {
                                dep.instance.get();
                            }
                            const instances = [...dependencies.map(d => d.instance)]
                            try {
                                init.call(null, ...instances);
                                recordVariableError({referenceId: v.id});
                            } catch (err) {
                                recordVariableError({error: err, referenceId: v.id});
                            }
                        });
                        destructorCallbacks.push(destructor);
                    } catch (err) {
                        recordVariableError({error: err, referenceId: v.id});
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