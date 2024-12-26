import {useEffect, useState} from "react";

const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const dayOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FR', 'SAT', 'SUN'];
export type Action = 'idle' | 'startDateSelected';

function checkStyle(sameDay: (a?: Date, b?: Date) => (boolean ), date: Date | undefined, thisDate: Date, rangeEnabled: boolean, toDate: Date | undefined, endDate: Date | undefined, insideDate: (from?: Date, to?: Date, value?: Date) => (boolean)) {
    let highlightBackground = sameDay(date, thisDate);
    const isFirstSelection = sameDay(thisDate, date);
    const isLastSelection = rangeEnabled ? sameDay(thisDate, toDate) : sameDay(thisDate, date);
    if (rangeEnabled) {
        if (sameDay(endDate, thisDate)) {
            highlightBackground = true;
        } else if (insideDate(date, toDate, thisDate)) {
            highlightBackground = true;
        }
    }
    return {highlightBackground, isFirstSelection, isLastSelection};
}

export function DatePicker(props: {
    value?: Date, onChange: (date?: Date) => void, range?: {
        enabled: boolean,
        endDate?: Date | undefined,
        onEndDateChange?: (date?: Date) => void,
        action?: Action,
        onAction?: (action: Action) => void
    },
    defaultDisplayMonth?: { month: number, year: number }
}) {
    const now = new Date();
    const {value, onChange, range,defaultDisplayMonth} = props;
    const [date, setDate] = useState<Date | undefined>(value);
    const [toDate, setToDate] = useState<Date | undefined>(value);
    const [action, setAction] = useState<Action>('idle');
    const rangeEnabled = range?.enabled === true;
    const {endDate, onEndDateChange, action: propsAction, onAction} = range ? range : {
        endDate: undefined,
        onEndDateChange: undefined,
        action: undefined,
        onAction: undefined
    };

    useEffect(() => {
        if (propsAction) {
            setAction(propsAction);
        }
    }, [propsAction]);

    useEffect(() => {
        setDate(value);
    }, [value]);

    useEffect(() => {
        if (rangeEnabled) {
            setToDate(endDate);
        }
    }, [rangeEnabled, endDate]);

    const [displayMonth, setDisplayMonth] = useState<{ month: number, year: number }>(date ? {
        month: date.getMonth(),
        year: date.getFullYear()
    } : defaultDisplayMonth ? defaultDisplayMonth : {month: now.getMonth(), year: now.getFullYear()});
    const daysInMonth = new Date(displayMonth.year, displayMonth.month + 1, 0).getDate();
    const startDay = new Date(displayMonth.year, displayMonth.month, 1).getDay();
    const adjustedStartDay = (startDay === 0 ? 6 : startDay - 1);
    const calendarDays = [];

    const prevMonthDays = new Date(displayMonth.year, displayMonth.month, 0).getDate();

    function sameDay(a?: Date, b?: Date) {
        if (a && b) {
            return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
        }
        return false;
    }

    function insideDate(from?: Date, to?: Date, value?: Date) {
        if (from && to && value) {
            return from.getTime() <= value.getTime() && value.getTime() <= to?.getTime()
        }
        return false;
    }

    for (let i = prevMonthDays - adjustedStartDay + 1; i <= prevMonthDays; i++) {

        const thisDate = new Date(displayMonth.year, displayMonth.month - 1, i);
        const {
            highlightBackground,
            isFirstSelection,
            isLastSelection
        } = checkStyle(sameDay, date, thisDate, rangeEnabled, toDate, endDate, insideDate);
        calendarDays.push(<div key={`prev-month-${i}`} style={{
            display: 'flex',
            width: '14.2%',
            flexShrink: 0,
            justifyContent: 'center',
            background: highlightBackground ? 'blue' : 'white',
            color: highlightBackground ? 'white' : 'black',
            borderTopLeftRadius: isFirstSelection ? 20 : 0,
            borderBottomLeftRadius: isFirstSelection ? 20 : 0,
            borderTopRightRadius: isLastSelection ? 20 : 0,
            borderBottomRightRadius: isLastSelection ? 20 : 0,
            opacity: 0.3
        }}>{i}</div>)
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const thisDate = new Date(displayMonth.year, displayMonth.month, i);
        let highlightBackground = sameDay(date, thisDate);
        if (rangeEnabled) {
            if (sameDay(endDate, thisDate)) {
                highlightBackground = true;
            } else if (insideDate(date, toDate, thisDate)) {
                highlightBackground = true;
            }
        }

        const isFirstSelection = sameDay(thisDate, date);
        const isLastSelection = rangeEnabled ? sameDay(thisDate, toDate) : sameDay(thisDate, date);

        calendarDays.push(<div key={`${i}`} style={{
            display: 'flex',
            width: '14.2%',
            flexShrink: 0,
            justifyContent: 'center',
            background: highlightBackground ? 'blue' : 'white',
            color: highlightBackground ? 'white' : 'black',
            borderTopLeftRadius: isFirstSelection ? 20 : 0,
            borderBottomLeftRadius: isFirstSelection ? 20 : 0,
            borderTopRightRadius: isLastSelection ? 20 : 0,
            borderBottomRightRadius: isLastSelection ? 20 : 0
        }} onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (rangeEnabled) {
                if (action === 'idle') {
                    if (onChange) {
                        onChange(thisDate);
                    } else {
                        setDate(thisDate);
                    }
                    if (onEndDateChange) {
                        onEndDateChange(undefined);
                    } else {
                        setToDate(undefined);
                    }
                    if (onAction) {
                        onAction('startDateSelected')
                    } else {
                        setAction('startDateSelected');
                    }

                } else if (action === 'startDateSelected') {
                    if (date && thisDate < date) {
                        if (onChange) {
                            onChange(thisDate);
                        } else {
                            setDate(thisDate);
                        }
                        if (onEndDateChange) {
                            onEndDateChange(undefined);
                        } else {
                            setToDate(undefined);
                        }
                        return false;
                    }
                    if (onEndDateChange) {
                        onEndDateChange(thisDate);
                    } else {
                        setToDate(thisDate);
                    }
                    if (onAction) {
                        onAction('idle')
                    } else {
                        setAction('idle');
                    }
                }
            } else {
                if (onChange) {
                    onChange(thisDate);
                } else {
                    setDate(thisDate);
                }
            }
        }}>{i}</div>)
    }

    const totalDisplays = 42;
    const daysNeeded = totalDisplays - calendarDays.length
    for (let i = 1; i <= daysNeeded; i++) {

        const thisDate = new Date(displayMonth.year, displayMonth.month + 1, i);
        const {
            highlightBackground,
            isFirstSelection,
            isLastSelection
        } = checkStyle(sameDay, date, thisDate, rangeEnabled, toDate, endDate, insideDate);

        calendarDays.push(<div key={`next-month-${i}`} style={{
            display: 'flex',
            width: '14.2%',
            flexShrink: 0,
            justifyContent: 'center',
            background: highlightBackground ? 'blue' : 'white',
            color: highlightBackground ? 'white' : 'black',
            borderTopLeftRadius: isFirstSelection ? 20 : 0,
            borderBottomLeftRadius: isFirstSelection ? 20 : 0,
            borderTopRightRadius: isLastSelection ? 20 : 0,
            borderBottomRightRadius: isLastSelection ? 20 : 0,
            opacity: 0.3
        }}>{i}</div>)
    }
    return <div style={{display: 'flex', flexDirection: 'column', width: 250}}>
        <div style={{display: 'flex', gap: 5}}>
            <div>{month[displayMonth.month]}</div>
            <div>{displayMonth.year}</div>
            <div style={{flexGrow: 1}}></div>
            <div onClick={() => {
                let {year, month} = displayMonth;
                month--;
                if (month < 0) {
                    year--;
                    month = 11
                }
                setDisplayMonth({year, month})
            }}>Prev
            </div>
            <div onClick={() => {
                let {year, month} = displayMonth;
                month++;
                if (month > 11) {
                    year++;
                    month = 0
                }
                setDisplayMonth({year, month})
            }}>Next
            </div>
        </div>

        <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {dayOfWeek.map(d => {
                return <div key={d}
                            style={{display: 'flex', width: '14.2%', flexShrink: 0, justifyContent: 'center'}}>{d}</div>
            })}
            {calendarDays}
        </div>
    </div>
}