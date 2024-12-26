import {CSSProperties, ForwardedRef, forwardRef, useContext, useEffect, useRef, useState} from "react";
import {TextInput} from "../text-input/TextInput.tsx";
import {format_ddMMMyyyy, toDate} from "../../../utils/dateFormat.ts";
import {DatePicker} from "./DatePicker.tsx";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {FormContext} from "../Form.tsx";
import {isDate} from "./isDate.ts";
import {useShowPopUp} from "../../hooks/useShowPopUp.tsx";
import {useForwardedRef} from "../../hooks/useForwardedRef.ts";
import {DivWithClickOutside} from "../../div-with-click-outside/DivWithClickOutside.tsx"
import {useAppContext} from "../../hooks/useAppContext.ts";

export const DateInput = forwardRef(function DateInput(props: {
    name?: string,
    value?: Date | string,
    onChange?: (value?: Date | string) => void,
    disabled?: boolean,
    label?: string,
    error?: string,
    style?: CSSProperties,
    inputStyle?: CSSProperties,
}, forwardedRef: ForwardedRef<HTMLLabelElement>) {
    const ref = useForwardedRef(forwardedRef);
    const {inputStyle, style, error, label, onChange, value, disabled, name} = props;
    const nameSignal = useSignal(name);
    const [localValue, setLocalValue] = useState<Date | undefined>();
    const [localError, setLocalError] = useState<string | undefined>(error);
    const context = useAppContext();
    const isDesignMode = 'uiDisplayModeSignal' in context && context.uiDisplayModeSignal.get() === 'design';

    const propsRef = useRef({userIsChangingData: false});

    useEffect(() => {
        nameSignal.set(name);
    }, [name, nameSignal]);

    useEffect(() => {
        const result: Date | undefined = toDate(value);
        setLocalValue(result);
    }, [value]);

    useEffect(() => {
        setLocalError(error);
    }, [error]);

    const formContext = useContext(FormContext);

    useSignalEffect(() => {
        const formValue = formContext?.value.get();
        const name = nameSignal.get();
        if (name && formValue && name in formValue) {
            const value = formValue[name];
            const result: Date | undefined = toDate(value);
            setLocalValue(result);
        }
    });

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
                          if (name && formContext) {
                              const newFormVal = {...formContext.value.get()};
                              newFormVal[name] = typeIsString ? format_ddMMMyyyy(newDate) : newDate;
                              const errors = {...formContext.errors.get()};
                              delete errors[name];
                              formContext.value.set(newFormVal);
                              formContext.errors.set(errors)
                          } else {
                              if (onChange) {
                                  onChange(typeIsString ? format_ddMMMyyyy(newDate) : newDate);
                              } else {
                                  setLocalValue(newDate);
                              }
                          }
                      }}
                      onBlur={(newVal) => {
                          if (propsRef.current.userIsChangingData) {
                              propsRef.current.userIsChangingData = false;
                              const date = toDate(newVal);
                              if (isDate(date)) {
                                  const typeIsString = typeof value === 'string';
                                  if (name && formContext) {
                                      const newFormVal = {...formContext.value.get()};
                                      newFormVal[name] = typeIsString ? format_ddMMMyyyy(date) : date;
                                      const errors = {...formContext.errors.get()};
                                      delete errors[name];
                                      formContext.value.set(newFormVal);
                                      formContext.errors.set(errors)
                                  } else {
                                      if (onChange) {
                                          onChange(typeIsString ? format_ddMMMyyyy(date) : date);
                                      } else {
                                          setLocalValue(date);
                                      }
                                  }
                              }
                          }
                      }}
                      onKeyDown={() => {
                          propsRef.current.userIsChangingData = true;
                      }}
    />
})