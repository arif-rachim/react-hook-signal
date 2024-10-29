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
    onChange?: (data?: Record<string, SqlValue>) => void,
    label?: string,
    query: QueryType,
    config: ColumnsConfig,
    container: Container,
    errorMessage?: string,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
    valueToRowData?: (value?: string | number) => Promise<Record<string, SqlValue>>,
    rowDataToText?: (data?: Record<string, SqlValue>) => string,
    itemToKey?: (data?: Record<string, SqlValue>) => string | number
}, ref: ForwardedRef<HTMLLabelElement>) {
    const {
        inputStyle,
        style,
        errorMessage,
        label,
        onChange,
        value,
        config,
        container,
        query,
        valueToRowData,
        rowDataToText,
        itemToKey
    } = props;
    const propsRef = useRef({valueToRowData, rowDataToText});
    propsRef.current = {valueToRowData, rowDataToText}

    useEffect(() => {
        (async () => {
            if (propsRef.current && propsRef.current.valueToRowData) {
                const result = await propsRef.current.valueToRowData(value)
                if (result) {
                    setRowData(result);
                }
            }
        })();
    }, [value]);

    const [rowData, setRowData] = useState<Record<string, SqlValue> | undefined>();
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
                       if (onChange) {
                           onChange(props.value)
                       } else {
                           setRowData(props.value);
                       }
                       setTimeout(() => setShowPopup(false), 100)
                   }}
                   style={{}}
                   focusedRow={rowData} container={container}
                   filterable={true} sortable={true} pageable={true} itemToKey={itemToKey}
        />
    </div>;

    const [showPopup, setShowPopup] = useState(false);
    const text = (rowDataToText ? rowDataToText(rowData) : defaultRowDataToText(rowData)) ?? '';

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
                      errorMessage={errorMessage}
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