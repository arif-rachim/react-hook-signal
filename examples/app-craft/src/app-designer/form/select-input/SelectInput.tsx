import {CSSProperties, ForwardedRef, forwardRef, useContext, useEffect, useRef, useState} from "react";
import {TextInput} from "../text-input/TextInput.tsx";
import {QueryGrid} from "../../query-grid/QueryGrid.tsx";
import {QueryType} from "../../variable-initialization/AppVariableInitialization.tsx";
import {ColumnsConfig} from "../../panels/database/table-editor/TableEditor.tsx";
import {Container} from "../../AppDesigner.tsx";
import {SqlValue} from "sql.js";
import {FormContext} from "../Form.tsx";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {useShowPopUp} from "../../hooks/useShowPopUp.tsx";
import {DivWithClickOutside} from "../../div-with-click-outside/DivWithClickOutside.tsx"
import {useAppContext} from "../../hooks/useAppContext.ts";

const defaultRowDataToText = (data: unknown) => {
    if (typeof data === "string") {
        return data;
    }
    return JSON.stringify(data)
}
export const SelectInput = forwardRef(function SelectInput(props: {
    name?: string,
    value?: string | number,
    onChange?: (data?: string | number) => void,
    label?: string,
    query: QueryType,
    config: ColumnsConfig,
    container: Container,
    error?: string,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
    popupStyle?: CSSProperties,
    valueToRowData?: (value?: string | number) => Promise<Record<string, SqlValue>>,
    rowDataToText?: (data?: Record<string, SqlValue>) => string,
    rowDataToValue?: (data?: Record<string, SqlValue>) => string | number,
    itemToKey?: (data?: Record<string, SqlValue>) => string | number,
    filterable?: boolean,
    pageable?: boolean,
    sortable?: boolean,
    disabled?:boolean
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
        name,
        popupStyle,
        filterable,
        sortable,
        pageable,
        disabled
    } = props;
    const nameSignal = useSignal(name);
    const [localValue, setLocalValue] = useState<Record<string, SqlValue> | undefined>();
    const [localError, setLocalError] = useState<string | undefined>(error);
    const context = useAppContext();
    const isDesignMode = 'uiDisplayModeSignal' in context && context.uiDisplayModeSignal.get() === 'design';
    const propsRef = useRef({valueToRowData, rowDataToText, rowDataToValue});
    propsRef.current = {valueToRowData, rowDataToText, rowDataToValue}

    useEffect(() => {
        nameSignal.set(name);
    }, [name, nameSignal]);

    useEffect(() => {
        (async () => {
            if (propsRef.current && propsRef.current.valueToRowData) {
                const result = await propsRef.current.valueToRowData(value)
                setLocalValue(result);
            }
        })();
    }, [value]);

    useEffect(() => {
        setLocalError(error);
    }, [error]);

    const formContext = useContext(FormContext);

    useSignalEffect(() => {
        const formValue = formContext?.value.get();
        const name = nameSignal.get();
        if (name && formValue && name in formValue) {
            const value = formValue[name] as string;
            (async () => {
                if (propsRef.current && propsRef.current.valueToRowData) {
                    const result = await propsRef.current.valueToRowData(value)
                    setLocalValue(result);
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

    const text = (rowDataToText ? rowDataToText(localValue) : defaultRowDataToText(localValue)) ?? '';

    const showPopup = useShowPopUp();
    return <TextInput ref={ref}
                      inputStyle={inputStyle}
                      style={style}
                      error={localError}
                      label={label}
                      value={text}
                      disabled={disabled}
                      onFocus={async () => {
                          if(disabled){
                              return;
                          }
                          if(isDesignMode){
                              return;
                          }
                          const props = await showPopup<{
                              value: Record<string, SqlValue>,
                              data: Array<Record<string, SqlValue>>,
                              totalPage: number,
                              currentPage: number,
                              index: number
                          } | false, HTMLLabelElement>(ref, (closePanel, commitLayout) => {

                              return <DivWithClickOutside onClickOutside={() => {
                                  closePanel(false);
                              }}><QueryGrid query={query} columnsConfig={config}
                                            rowPerPage={10}
                                            paginationButtonCount={3}
                                            onFocusedRowChange={closePanel}
                                            style={{
                                                boxShadow: '0px 10px 8px -8px rgba(0,0,0,0.5)',
                                                paddingBottom :filterable ? 0 : 15,
                                                borderBottomLeftRadius: 10,
                                                borderBottomRightRadius: 10,
                                                borderLeft:'1px solid rgba(0,0,0,0.1)',
                                                borderRight:'1px solid rgba(0,0,0,0.1)',
                                                ...popupStyle
                                            }}
                                            focusedRow={localValue}
                                            container={container}
                                            filterable={filterable}
                                            sortable={sortable}
                                            pageable={pageable}
                                            itemToKey={itemToKey}
                                            onQueryResultChange={commitLayout}
                              /></DivWithClickOutside>
                          })
                          if (props === false) {
                              return;
                          }
                          if (name && formContext && propsRef.current.rowDataToValue) {
                              const newFormVal = {...formContext.value.get()};
                              newFormVal[name] = propsRef.current.rowDataToValue(props.value);
                              const errors = {...formContext.errors.get()};
                              delete errors[name];
                              formContext.value.set(newFormVal);
                              formContext.errors.set(errors)
                          } else {
                              if (onChange && propsRef.current.rowDataToValue) {
                                  onChange(propsRef.current.rowDataToValue(props.value))
                              } else {
                                  setLocalValue(props.value);
                              }
                          }
                      }}
    />
})