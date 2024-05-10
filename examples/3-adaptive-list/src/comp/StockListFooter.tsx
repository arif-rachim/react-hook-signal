import {Signal} from "signal-polyfill";
import {notifiable, useComputed} from "react-hook-signal";
import {exchange} from "../model/exchange.ts";

export function StockListFooter(props: {
    selectedExchange: Signal.State<number>
}) {
    const {selectedExchange} = props;
    const exchangeElements = useComputed(() => {
        const selectedExchangeValue = selectedExchange.get();
        return exchange.map((item, index, source) => {
            const isSelected = selectedExchangeValue === index;
            return <div style={{
                padding: '20px 0px',
                fontWeight: isSelected ? 700 : 400,
                color: isSelected ? '#FFFFFF' : '#CCCCCC',
                width: `${(100 / source.length).toFixed(2)}%`,
                textAlign: 'center',
                transition: 'all 300ms linear'
            }} key={item} onClick={() => selectedExchange.set(index)}>{item}</div>
        })
    })
    return <>
        <notifiable.div style={() => {
            const selectedExchangeValue = selectedExchange.get();
            const width = (100 / exchange.length);
            return {
                position: 'absolute',
                bottom: 0,
                left: `${(width * selectedExchangeValue).toFixed(2)}%`,
                width: `${width.toFixed(2)}%`,
                height: 60,
                borderTop: '5px solid white',
                zIndex: 10,
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
        }}>{exchangeElements}
        </notifiable.div>
    </>;
}
