import {z, ZodType} from "zod";
import {printNode, zodToTs} from "zod-to-ts";

export function zodSchemaToJson(schemaCode: string) {
    let returnType = z.any();
    try {
        const fun = new Function('z', `return (${schemaCode})`);
        returnType = fun.call(null, z);
    } catch (err) {
        console.error('zodSchemaToJson', err)
    }
    return zodTypeToJson(returnType)
}

export function zodTypeToJson(type: ZodType) {
    try {
        return printNode(zodToTs(type).node)
    } catch (_) {
        // we dont need to print this error
    }
    return printNode(zodToTs(z.any()).node)
}