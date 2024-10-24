import {DatePicker} from "./DatePicker.tsx";
import {useEffect, useState} from "react";

export function DateRangePicker(props: {
    value?: { from: Date, to: Date },
    onChange: (date?: { from: Date, to: Date }) => void
}) {
    const [range, setRange] = useState<{ from?: Date, to?: Date }>();
    const [action, setAction] = useState<'idle' | 'startDateSelected'>("idle");
    const {value, onChange} = props;
    useEffect(() => {
        setRange(value);
    }, [value]);
    return <div style={{display: 'flex', gap: 10}}>
        <DatePicker value={range?.from} onChange={(date) => setRange(old => ({...old, from: date}))}
                    range={{
                        enabled: true,
                        endDate: range?.to,
                        onEndDateChange: (date) => {
                            const from = range?.from;
                            if (from && date && onChange) {
                                const newValue = {from, to: date};
                                onChange(newValue)
                            } else {
                                setRange(old => ({...old, to: date}))
                            }
                        },
                        action,
                        onAction: (act) => setAction(act)
                    }}/>
        <DatePicker value={range?.from} onChange={(date) => setRange(old => ({...old, from: date}))}
                    range={{
                        enabled: true,
                        endDate: range?.to,
                        onEndDateChange: (date) => {
                            const from = range?.from;
                            if (from && date && onChange) {
                                const newValue = {from, to: date};
                                onChange(newValue)
                            } else {
                                setRange(old => ({...old, to: date}))
                            }
                        },
                        action,
                        onAction: (act) => setAction(act)
                    }} defaultDisplayMonth={{
            month: range && range.to && range.to.getMonth() ? range.to.getMonth() : new Date().getMonth() + 1,
            year: range && range.to && range.to.getFullYear() ? range.to.getFullYear()! : new Date().getFullYear()
        }}/>
    </div>
}