import {Variable} from "../AppDesigner.tsx";
import {sortSignal} from "../sortSignal.ts";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";

export function useUpdateVariable(){
    const {allVariablesSignal} = useContext(AppDesignerContext);
    return function updateVariable(variable:Variable){
        const variables = [...allVariablesSignal.get()];
        const indexOfVariable = variables.findIndex(i => i.id === variable.id);
        if (indexOfVariable >= 0) {
            variables.splice(indexOfVariable, 1, {...variable});
        } else {
            variables.push({...variable});
        }
        allVariablesSignal.set(variables.sort(sortSignal));
    }
}