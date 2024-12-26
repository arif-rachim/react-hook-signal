import {useAppContext} from "./useAppContext.ts";
import {useUpdatePageSignal} from "./useUpdatePageSignal.ts";
import {useUpdateApplication} from "./useUpdateApplication.ts";
import {Callable} from "../../app/designer/AppDesigner.tsx";

export function useUpdateCallable(scope: 'page' | 'application') {
    const {allPageCallablesSignal, allApplicationCallablesSignal} = useAppContext();
    const updatePage = useUpdatePageSignal();
    const updateApplication = useUpdateApplication();
    return function updateVariable(callable: Callable) {
        const callables = scope === 'page' ? [...allPageCallablesSignal.get()] : [...allApplicationCallablesSignal.get()];
        const indexOfVariable = callables.findIndex(i => i.id === callable.id);
        if (indexOfVariable >= 0) {
            callables.splice(indexOfVariable, 1, {...callable});
        } else {
            callables.push({...callable});
        }
        if (scope === 'page') {
            updatePage({type: 'callable', callables: callables});
        } else {
            updateApplication(original => {
                original.callables = callables
            })
        }
    }
}