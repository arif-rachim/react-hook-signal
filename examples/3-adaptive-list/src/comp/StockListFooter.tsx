import {Signal} from "signal-polyfill";
import {notifiable, useComputed} from "react-hook-signal";
import {exchange} from "../model/exchange.ts";

export function StockListFooter(props: {
    selectedExchange: Signal.State<number>,
    highlightBottom: boolean
}) {
    const {selectedExchange, highlightBottom} = props;
    const exchangeElements = useComputed(() => {
        const exchangeValue = exchange.get();
        const selectedExchangeValue = selectedExchange.get();
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
                selectedExchange.set(index)
            }}>{item}</div>
        })
    })
    return <>
        <notifiable.div style={() => {
            const selectedExchangeValue = selectedExchange.get();
            const width = (100 / exchange.get().length);
            return {
                position: 'absolute',
                bottom: 0,
                left: `${(width * selectedExchangeValue).toFixed(2)}%`,
                width: `${width.toFixed(2)}%`,
                height: 60,
                borderBottom: highlightBottom ? '5px solid white' : undefined,
                borderTop: !highlightBottom ? '5px solid white' : undefined,
                zIndex: 11,
                transition: 'all 100ms linear'
            }
        }}></notifiable.div>
        <notifiable.div style={{
            display: 'flex',
            flexDirection: 'row',
            position: 'absolute',
            bottom: 0,
            backgroundColor: 'black',
            width: '100%',
            zIndex: 10,
            transition: 'all 300ms linear'
        }}>
            {exchangeElements}
        </notifiable.div>
    </>;
}