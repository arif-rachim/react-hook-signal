import {useCallback, useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {isEmpty} from "../../utils/isEmpty.ts";
import {ErrorType} from "../errors/ErrorType.ts";
import {ZodError} from "zod";

// eslint-disable-next-line
type Error = unknown;

export function useRecordErrorMessage() {
    const {allErrorsSignal} = useContext(AppDesignerContext);

    const recordError = useCallback(function recordError(e: ErrorType) {
        const allErrors = allErrorsSignal.get();
        const existingError = allErrors.findIndex(i => {
            if (i.type === e.type && i.category === e.category) {
                if (i.type === 'property' && e.type === 'property') {
                    return i.propertyName === e.propertyName && e.containerId === e.containerId;
                }
                if (i.type === 'variable' && e.type === 'variable') {
                    return i.variableId === e.variableId;
                }
            }
            return false
        });
        const copyError = [...allErrors];

        if (existingError >= 0) {
            if (copyError[existingError].message === e.message) {
                return;
            }
            if (isEmpty(e.message)) {
                copyError.splice(existingError, 1);
                allErrorsSignal.set(copyError);
            } else {
                copyError.splice(existingError, 1, e);
                allErrorsSignal.set(copyError);
            }
        } else {
            if (!isEmpty(e.message)) {
                copyError.push(e)
                allErrorsSignal.set(copyError);
            }
        }

    }, [allErrorsSignal]);

    function variableSchema(props: { variableId: string, err?: Error }) {
        recordError({
            type: 'variable',
            category: 'schema',
            variableId: props.variableId,
            message: extractErrorMessage(props.err)
        })
    }

    function variableValue(props: { variableId: string, err?: Error }) {
        recordError({
            type: 'variable',
            category: 'value',
            variableId: props.variableId,
            message: extractErrorMessage(props.err)
        })
    }

    function variableValidation(props: { variableId: string, err?: Error }) {

        recordError({
            type: 'variable',
            category: 'validation',
            variableId: props.variableId,
            message: extractErrorMessage(props.err)
        })
    }


    function propertySchema(props: { containerId: string, propertyName: string, err?: Error }) {
        recordError({
            type: 'property',
            category: 'schema',
            containerId: props.containerId,
            propertyName: props.propertyName,
            message: extractErrorMessage(props.err)
        })
    }

    function propertyValue(props: { containerId: string, propertyName: string, err?: Error }) {
        recordError({
            type: 'property',
            category: 'value',
            containerId: props.containerId,
            propertyName: props.propertyName,
            message: extractErrorMessage(props.err)
        })
    }

    function propertyValidation(props: { containerId: string, propertyName: string, err?: Error }) {
        recordError({
            type: 'property',
            category: 'validation',
            containerId: props.containerId,
            propertyName: props.propertyName,
            message: extractErrorMessage(props.err)
        })
    }

    function propertyInvocation(props: { containerId: string, propertyName: string, err?: Error }) {
        recordError({
            type: 'property',
            category: 'invocation',
            containerId: props.containerId,
            propertyName: props.propertyName,
            message: extractErrorMessage(props.err)
        })
    }

    return {
        variableSchema,
        variableValue,
        variableValidation,
        propertyValue,
        propertySchema,
        propertyValidation,
        propertyInvocation
    }
}

function extractErrorMessage(err:unknown){
    if(err instanceof ZodError){
        return (err?.errors ?? []).map(z => `${z.code} ${z.path} is ${z.message}`).join('\n')
    }
    if(err instanceof TypeError){
        return err.message
    }
    if(err instanceof Error){
        return err.message
    }
    return '';
}