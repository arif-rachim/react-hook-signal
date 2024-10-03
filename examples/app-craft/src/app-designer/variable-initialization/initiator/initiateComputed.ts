import {Variable} from "../../AppDesigner.tsx";
import {Signal} from "signal-polyfill";
import {undefined} from "zod";
import {FormulaDependencyParameter} from "../AppVariableInitialization.tsx";


export const initiateComputed = (app: FormulaDependencyParameter, page: FormulaDependencyParameter) => (v: Variable) => {
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