import {VariableInstance} from "../AppDesigner.tsx";
import {ZodType} from "zod";
import {useRecordErrorMessage} from "../../../core/hooks/useRecordErrorMessage.ts";

export function validateVariables(variableInstances: Array<VariableInstance>, variableValidators: Array<{
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