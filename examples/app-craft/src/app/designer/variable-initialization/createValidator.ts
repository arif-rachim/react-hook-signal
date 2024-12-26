import {Variable} from "../AppDesigner.tsx";
import {useRecordErrorMessage} from "../../../core/hooks/useRecordErrorMessage.ts";
import {z, ZodType} from "zod";

export function createValidator(variables: Array<Variable>, errorMessage: ReturnType<typeof useRecordErrorMessage>) {
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
}