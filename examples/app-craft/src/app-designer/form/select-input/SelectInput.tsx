import {CSSProperties, ForwardedRef, forwardRef, useEffect, useRef, useState} from "react";
import {TextInput} from "../text-input/TextInput.tsx";
import {QueryGrid} from "../../query-grid/QueryGrid.tsx";
import {QueryType} from "../../variable-initialization/AppVariableInitialization.tsx";
import {ColumnsConfig} from "../../panels/database/table-editor/TableEditor.tsx";
import {Container} from "../../AppDesigner.tsx";
import {SqlValue} from "sql.js";

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
                       if (onChange && propsRef.current.rowDataToValue) {
                           onChange(propsRef.current.rowDataToValue(props.value))
                       } else {
                           setLocalValue(props.value);
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
                      name={name}
                      style={style}
                      error={error}
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