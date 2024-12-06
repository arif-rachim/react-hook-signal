import {z, ZodType} from "zod";
import {printNode, zodToTs} from "zod-to-ts";

export function zodSchemaToZodType(schemaCode: string): ZodType {
    let returnType = z.any();
    try {
        schemaCode = schemaCode.trim();
        if (schemaCode.endsWith(';')) {
            schemaCode = schemaCode.substring(0, schemaCode.length - 1);
        }
        const fun = new Function('z', `return (${schemaCode})`);
        returnType = fun.call(null, z);
    } catch (err) {
        console.error('zodSchemaToJson', err)
    }
    return returnType;
}

export function zodSchemaToJson(schemaCode: string) {
    return zodTypeToJson(zodSchemaToZodType(schemaCode));
}

export function zodTypeToJson(type?: ZodType) {
    type = type ?? z.any();
    try {
        return printNode(zodToTs(type).node)
    } catch (_) {
        // we don't need to print this error
    }
    return printNode(zodToTs(z.any()).node)
}