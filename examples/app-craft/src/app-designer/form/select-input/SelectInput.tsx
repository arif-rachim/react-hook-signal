import {CSSProperties, ForwardedRef, forwardRef, useContext, useEffect, useRef, useState} from "react";
import {TextInput} from "../text-input/TextInput.tsx";
import {QueryGrid} from "../../query-grid/QueryGrid.tsx";
import {QueryType} from "../../variable-initialization/AppVariableInitialization.tsx";
import {ColumnsConfig} from "../../panels/database/table-editor/TableEditor.tsx";
import {Container} from "../../AppDesigner.tsx";
import {SqlValue} from "sql.js";
import {FormContext} from "../Form.tsx";
import {useSignal, useSignalEffect} from "react-hook-signal";

const defaultRowDataToText = (data: unknown) => {
    if (typeof data === "string") {
        return data;
    }
    return JSON.stringify(data)
}
export const SelectInput = forwardRef(function SelectInput(props: {
    value?: string | number,
    name?: string,
    onChange?: (data?: string | number) => void,
    label?: string,
    query: QueryType,
    config: ColumnsConfig,
    container: Container,
    error?: string,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
    valueToRowData?: (value?: string | number) => Promise<Record<string, SqlValue>>,
    rowDataToText?: (data?: Record<string, SqlValue>) => string,
    rowDataToValue?: (data?: Record<string, SqlValue>) => string | number,
    itemToKey?: (data?: Record<string, SqlValue>) => string | number
}, ref: ForwardedRef<HTMLLabelElement>) {
    const {
        inputStyle,
        style,
        error,
        label,
        onChange,
        value,
        config,
        container,
        query,
        valueToRowData,
        rowDataToText,
        rowDataToValue,
        itemToKey,
        name
    } = props;
    const propsRef = useRef({valueToRowData, rowDataToText, rowDataToValue});
    propsRef.current = {valueToRowData, rowDataToText, rowDataToValue}

    const [localValue, setLocalValue] = useState<Record<string, SqlValue> | undefined>();
    const [localError, setLocalError] = useState<string | undefined>(error);
    const nameSignal = useSignal(name);
    useEffect(() => {
        nameSignal.set(name);
    }, [name, nameSignal]);
    useEffect(() => {
        setLocalError(error);
    }, [error]);
    useEffect(() => {
        (async () => {
            if (propsRef.current && propsRef.current.valueToRowData) {
                const result = await propsRef.current.valueToRowData(value)
                if (result) {
                    setLocalValue(result);
                }
            }
        })();
    }, [value]);
    const formContext = useContext(FormContext);
    useSignalEffect(() => {
        const formValue = formContext?.value.get();

        const name = nameSignal.get();
        if (name && formValue && name in formValue) {
            const value = formValue[name] as string;
            (async () => {
                if (propsRef.current && propsRef.current.valueToRowData) {
                    const result = await propsRef.current.valueToRowData(value)
                    if (result) {
                        setLocalValue(result);
                    }
                }
            })();
        }
    })
    useSignalEffect(() => {
        const formError = formContext?.errors.get();
        const name = nameSignal.get();
        if (name && formError) {
            setLocalError(formError[name]);
        }
    })

    const popupRef = useRef<HTMLDivElement>(null);

    const element = <div style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        padding: 10,
        marginTop: 1,
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        width: 270,
        boxShadow: '0px 10px 5px -3px rgba(0,0,0,0.5)'
    }} ref={popupRef}>
        <QueryGrid query={query} columnsConfig={config}
                   onFocusedRowChange={(props) => {
                       if (name && formContext && propsRef.current.rowDataToValue) {
                           const newFormVal = {...formContext.value.get()};
                           newFormVal[name] = propsRef.current.rowDataToValue(props.value);
                           formContext.value.set(newFormVal);
                       } else {
                           if (onChange && propsRef.current.rowDataToValue) {
                               onChange(propsRef.current.rowDataToValue(props.value))
                           } else {
                               setLocalValue(props.value);
                           }
                       }
                       setTimeout(() => setShowPopup(false), 100)
                   }}
                   style={{}}
                   focusedRow={localValue} container={container}
                   filterable={true} sortable={true} pageable={true} itemToKey={itemToKey}
        />
    </div>;

    const [showPopup, setShowPopup] = useState(false);
    const text = (rowDataToText ? rowDataToText(localValue) : defaultRowDataToText(localValue)) ?? '';

    useEffect(() => {
        function onClick(event: unknown) {
            if (showPopup && event && typeof event === 'object' && 'target' in event && popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setShowPopup(false);
            }
        }

        if (showPopup) {
            setTimeout(() => {
                window.addEventListener('mousedown', onClick);
            }, 100);

        }
        return () => window.removeEventListener('mousedown', onClick);
    }, [showPopup]);
    return <TextInput ref={ref}
                      popup={{position: 'bottom', element, visible: showPopup}}
                      inputStyle={inputStyle}
                      style={style}
                      error={localError}
                      label={label}
                      value={text}
                      onFocus={() => {
                          setShowPopup(true);
                      }}
                      onMouseDown={() => {
                          setShowPopup(true);
                      }}
    />
})