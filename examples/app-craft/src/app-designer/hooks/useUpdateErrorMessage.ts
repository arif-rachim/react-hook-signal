import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {VariableType} from "../AppDesigner.tsx";
import {isEmpty} from "../../utils/isEmpty.ts";

export function useUpdateErrorMessage() {
    const {allErrorsSignal} = useContext(AppDesignerContext);
    return function update(type: VariableType | 'container', referenceId: string, message?: string, propertyName?: string) {
        const allErrors = allErrorsSignal.get();
        const existingError = allErrors.findIndex(i => i.referenceId === referenceId && i.type === type && (type === 'container' ? i.propertyName === propertyName : true));
        const copyError = [...allErrors];
        if (existingError > 0) {
            if (isEmpty(message)) {
                copyError.splice(existingError, 1);
            } else {
                copyError.splice(existingError, 1, {type, message: message!, referenceId, propertyName});
            }
        } else {
            if (!isEmpty(message)) {
                copyError.push({type, message: message!, referenceId, propertyName})
            }
        }
        allErrorsSignal.set(copyError);
    };
}