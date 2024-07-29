import {Variable} from "../AppDesigner.tsx";
import {sortSignal} from "../sortSignal.ts";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {useUpdatePageSignal} from "./useUpdatePageSignal.ts";

export function useUpdateVariable(){
    const {allVariablesSignal} = useContext(AppDesignerContext);
    const updatePage = useUpdatePageSignal();
    return function updateVariable(variable:Variable){
        const variables = [...allVariablesSignal.get()];
        const indexOfVariable = variables.findIndex(i => i.id === variable.id);
        if (indexOfVariable >= 0) {
            variables.splice(indexOfVariable, 1, {...variable});
        } else {
            variables.push({...variable});
        }
        updatePage({type:'variable',variables:variables.sort(sortSignal)});
    }
}