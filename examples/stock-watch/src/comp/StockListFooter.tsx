import {Signal} from "signal-polyfill";
import {notifiable, useComputed} from "react-hook-signal";
import {exchangeData} from "../model/exchange.ts";
import {CSSProperties} from "react";

/**
 * Creates a footer component for the stock list.
 */
export function StockListFooter(props: {
    selectedExchangeIndex: Signal.State<number>,
    highlightBottom: boolean
}) {
    const {selectedExchangeIndex, highlightBottom} = props;
    const exchangeElements = useComputed(() => {
        const exchangeValue = exchangeData.get();
        const selectedExchangeValue = selectedExchangeIndex.get();
        return exchangeValue.map((item, index, source) => {
            const isSelected = selectedExchangeValue === index;
            return <div style={{
                padding: '20px 0px',
                fontWeight: isSelected ? 700 : 400,
                color: isSelected ? '#FFFFFF' : '#CCCCCC',
                width: `${(100 / source.length).toFixed(2)}%`,
                textAlign: 'center',
                transition: 'all 300ms linear'
            }} key={item} onClick={() => {
                selectedExchangeIndex.set(index)
            }}>{item}</div>
        })
    })
    return <>
        <notifiable.div style={() => {
            const selectedExchangeValue = selectedExchangeIndex.get();
            const width = (100 / exchangeData.get().length);
            return {
                display: exchangeData.get().length === 0 ? 'none' : 'block',
                flexDirection: 'row',
                position: 'absolute',
                bottom: 0,
                left: `${(width * selectedExchangeValue).toFixed(2)}%`,
                width: `${width.toFixed(2)}%`,
                height: 60,
                padding:10,
                borderBottom: highlightBottom ? '5px solid white' : undefined,
                borderTop: !highlightBottom ? '5px solid white' : undefined,
                zIndex: 11,
                transition: 'all 100ms linear'
            } as CSSProperties
        }}>
            <div style={{borderRadius:10, width:'100%',height:'100%',backgroundColor:'rgba(255,255,255,0.1)'}}></div>
        </notifiable.div>
        <notifiable.div style={{
            display: 'flex',
            flexDirection: 'row',
            position: 'absolute',
            bottom: 0,
            backgroundColor: 'black',
            width: '100%',
            zIndex: 10,
            transition: 'all 300ms linear',
            borderBottom: highlightBottom ? '1px solid rgba(255,255,255,0.2)' : undefined,
            borderTop: !highlightBottom ? '1px solid rgba(255,255,255,0.2)' : undefined,
        }}>
            {exchangeElements}
        </notifiable.div>
    </>;
}
