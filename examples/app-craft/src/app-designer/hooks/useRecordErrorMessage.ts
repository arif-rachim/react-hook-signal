import {useCallback, useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {Error} from "../AppDesigner.tsx";
import {isEmpty} from "../../utils/isEmpty.ts";


export function useRecordErrorMessage() {
    const {allErrorsSignal} = useContext(AppDesignerContext);

    const recordError = useCallback(function recordError(e: Error) {
        const allErrors = allErrorsSignal.get();
        const existingError = allErrors.findIndex(i => i.referenceId === e.referenceId && i.type === e.type && (e.type === 'property' ? i.propertyName === e.propertyName : true));
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


    const recordPropertyError = useCallback(function recordPropertyError(props: {
        referenceId: string,
        propertyName: string,
        error?: unknown
    }) {
        let message = undefined;
        if (props.error !== undefined && props.error !== null && typeof props.error === 'object' && 'message' in props.error && typeof props.error.message === 'string') {
            message = props.error.message;
        }
        recordError({
            type: 'property',
            referenceId: props.referenceId,
            propertyName: props.propertyName,
            message: message
        });
    }, [recordError])

    const recordVariableError = useCallback(function recordVariableError(props: {
        referenceId: string,
        error?: unknown
    }) {
        let message = undefined;
        if (props.error !== undefined && props.error !== null && typeof props.error === 'object' && 'message' in props.error && typeof props.error.message === 'string') {
            message = props.error.message;
        }
        recordError({type: 'variable', referenceId: props.referenceId, propertyName: undefined, message: message});
    }, [recordError])

    function clearVariableError(variableId: string) {
        recordVariableError({referenceId: variableId});
    }

    function clearPropertyError(containerId: string, propertyName: string) {
        recordPropertyError({referenceId: containerId, propertyName})
    }

    return {
        recordPropertyError, recordVariableError, clearVariableError, clearPropertyError
    }
}