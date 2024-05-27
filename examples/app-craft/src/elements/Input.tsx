import {InputHTMLAttributes, useEffect, useRef, useState} from 'react';

export default function Input(props: InputHTMLAttributes<HTMLInputElement> ) {
    const {value: valueProps, onChange: onChangeProps, ...properties} = props;
    const [value, setValue] = useState(valueProps);
    useEffect(() => setValue(valueProps), [valueProps]);
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
                const cursorPosition = e.target.selectionStart;
                const value = e.target.value;
                setValue(value);
                setTimeout(() => {
                    const dom = inputRef.current!;
                    if (isInputElement(dom)) {
                        dom.setSelectionRange(cursorPosition, cursorPosition);
                    }
                }, 0);
                if (onChangeProps) {
                    onChangeProps(e)
                }
            }}
            {...properties}
        />
    );
}

function isInputElement(value: unknown): value is HTMLInputElement {
    return value !== undefined && value !== null && typeof value === 'object';
}
