import {CSSProperties} from "react";

export function Checkbox<T extends { label: string, value: string }>(props: {
    data: Array<T>,
    value: Array<string>,
    onChange: (value: Array<string>) => void,
    style?: CSSProperties
}) {
    const {data, style, onChange, value} = props;
    return <div style={{display: 'flex', flexDirection: 'row',minHeight:27, ...style}}>
        {data.map(d => {
            const isChecked = value.indexOf(d.value) >= 0;
            return <label style={{display:'flex',flexDirection:'row',gap:0,padding:'3px 5px'}} key={d.value}><input type={'checkbox'}  checked={isChecked} onChange={() => {
                if (isChecked) {
                    onChange(value.filter(v => v !== d.value));
                } else {
                    onChange([...value, d.value])
                }
            }}/><div>{d.label}</div></label>
        })}
    </div>
}