import {CSSProperties, ForwardedRef, forwardRef, useRef} from "react";
import {TextInput} from "../text/TextInput.tsx";
import {format_ddMMMyyyy, toDate} from "../../../../core/utils/dateFormat.ts";
import {DatePicker} from "./DatePicker.tsx";
import {isDate} from "./isDate.ts";
import {useShowPopUp} from "../../../../core/hooks/useShowPopUp.tsx";
import {useForwardedRef} from "../../../../core/hooks/useForwardedRef.ts";
import {DivWithClickOutside} from "../../../designer/components/DivWithClickOutside.tsx"
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {useFormInput} from "../../useFormInput.ts";

type DateOrString = Date | string

export const DateInput = forwardRef(function DateInput<T extends DateOrString>(props: {
    name?: string,
    value?: T,
    onChange?: (value?: T) => void,
    disabled?: boolean,
    label?: string,
    error?: string,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
}, forwardedRef: ForwardedRef<HTMLLabelElement>) {
    const ref = useForwardedRef(forwardedRef);
    const {inputStyle, style, error, label, onChange, value, disabled, name} = props;
    const {localValue, localError, handleValueChange} = useFormInput<typeof value, Date>({
        name,
        value,
        error,
        valueToLocalValue: param => toDate(param),
        onChange
    });
    const context = useAppContext();
    const isDesignMode = 'uiDisplayModeSignal' in context && context.uiDisplayModeSignal.get() === 'design';
    const propsRef = useRef({userIsChangingData: false});
    const text = format_ddMMMyyyy(localValue);
    const showPopup = useShowPopUp();
    return <TextInput ref={ref}
                      inputStyle={{width: 90, textAlign: 'center', ...inputStyle}}
                      style={style}
                      disabled={disabled}
                      error={localError}
                      label={label}
                      value={text}
                      onFocus={async () => {
                          if (isDesignMode) {
                              return;
                          }
                          const newDate = await showPopup<Date | false, HTMLLabelElement>(ref, (closePanel, commitLayout) => {
                              commitLayout();
                              return <DivWithClickOutside style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  background: 'white',
                                  padding: 10,
                                  marginTop: 1,
                                  borderBottomRightRadius: 5,
                                  borderBottomLeftRadius: 5,
                                  width: 270,
                                  boxShadow: '0px 10px 5px -3px rgba(0,0,0,0.5)'
                              }} onMouseDown={(e) => {
                                  e.preventDefault()
                              }} onClickOutside={() => {
                                  closePanel(false);
                              }}><DatePicker onChange={(newDate) => closePanel(newDate)}
                                             value={localValue}/></DivWithClickOutside>
                          })
                          if (newDate === false) {
                              return;
                          }
                          const typeIsString = typeof value === 'string';
                          const val = typeIsString ? format_ddMMMyyyy(newDate) : newDate;
                          handleValueChange(val as T)
                      }}
                      onBlur={(newVal) => {
                          if (propsRef.current.userIsChangingData) {
                              propsRef.current.userIsChangingData = false;
                              const date = toDate(newVal);
                              if (isDate(date)) {
                                  const typeIsString = typeof value === 'string';
                                  const val = typeIsString ? format_ddMMMyyyy(date) : date;
                                  handleValueChange(val as T)
                              }
                          }
                      }}
                      onKeyDown={() => {
                          propsRef.current.userIsChangingData = true;
                      }}
    />
})