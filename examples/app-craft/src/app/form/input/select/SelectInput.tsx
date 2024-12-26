import {CSSProperties, ForwardedRef, forwardRef, useRef} from "react";
import {TextInput} from "../text/TextInput.tsx";
import {QueryGrid} from "../../../data/QueryGrid.tsx";
import {QueryType} from "../../../designer/variable-initialization/AppVariableInitialization.tsx";
import {ColumnsConfig} from "../../../designer/panels/database/TableEditor.tsx";
import {Container} from "../../../designer/AppDesigner.tsx";
import {SqlValue} from "sql.js";
import {useShowPopUp} from "../../../../core/hooks/useShowPopUp.tsx";
import {DivWithClickOutside} from "../../../designer/components/DivWithClickOutside.tsx"
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {useFormInput} from "../../useFormInput.ts";

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
    disabled?: boolean
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
    const {
        localValue,
        localError,
        handleValueChange
    } = useFormInput<typeof value, Record<string, SqlValue> | undefined>({
        name,
        value,
        error,
        disabled,
        onChange,
        valueToLocalValue: async (params) => {
            if (valueToRowData) {
                return await valueToRowData(params)
            }
        }
    });

    const context = useAppContext();
    const isDesignMode = 'uiDisplayModeSignal' in context && context.uiDisplayModeSignal.get() === 'design';
    const propsRef = useRef({valueToRowData, rowDataToText, rowDataToValue});
    propsRef.current = {valueToRowData, rowDataToText, rowDataToValue}
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
                          if (disabled) {
                              return;
                          }
                          if (isDesignMode) {
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
                                                paddingBottom: filterable ? 0 : 15,
                                                borderBottomLeftRadius: 10,
                                                borderBottomRightRadius: 10,
                                                borderLeft: '1px solid rgba(0,0,0,0.1)',
                                                borderRight: '1px solid rgba(0,0,0,0.1)',
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
                          if (propsRef.current.rowDataToValue) {
                              handleValueChange(propsRef.current.rowDataToValue(props.value));
                          }
                      }}
    />
})