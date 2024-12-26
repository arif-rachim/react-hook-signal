import {Variable} from "../../app/designer/AppDesigner.tsx";
import {sortSignal} from "../style/sortSignal.ts";
import {useUpdatePageSignal} from "./useUpdatePageSignal.ts";
import {useAppContext} from "./useAppContext.ts";
import {useUpdateApplication} from "./useUpdateApplication.ts";

export function useUpdateVariable(scope: 'page' | 'application') {
    const {allPageVariablesSignal, allApplicationVariablesSignal} = useAppContext();
    const updatePage = useUpdatePageSignal();
    const updateApplication = useUpdateApplication();
    return function updateVariable(variable: Variable) {
        const variables = scope === 'page' ? [...allPageVariablesSignal.get()] : [...allApplicationVariablesSignal.get()];
        const indexOfVariable = variables.findIndex(i => i.id === variable.id);
        if (indexOfVariable >= 0) {
            variables.splice(indexOfVariable, 1, {...variable});
        } else {
            variables.push({...variable});
        }
        if (scope === 'page') {
            updatePage({type: 'variable', variables: variables.sort(sortSignal)});
        } else {
            updateApplication(original => {
                original.variables = variables.sort(sortSignal)
            })
        }
    }
}