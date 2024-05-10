import {createResponsiveList} from "../responsive-list/createResponsiveList.tsx";
import {Stock} from "../model/Stock.ts";
import {AnySignal, Notifiable, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {useContext, useEffect} from "react";
import {delay} from "../utils/delay.ts";
import {LineChart} from "./LineChart.tsx";
import {colors} from "../utils/colors.ts";

export const StockList = createResponsiveList<Stock>().breakPoint({s: 400, m: 600, l: 900, xl: 1200}).renderer({
    tickerSymbol: ({value}) => value,
    earningsDate: ({value}) => value,
    name: ({value}) => value,
    priceTarget: ({value}) => value,
    marketCap: ({value, isBullish}) => {
        const isBullishSignal = isBullish as AnySignal<boolean>;
        return <div style={{
            backgroundColor: isBullishSignal.get() ? '#00B050' : '#B21016',
            padding: '2px 5px',
            fontWeight: 600,
            borderRadius: 5,
            minWidth: 70,
            display: 'flex',
            justifyContent: 'flex-end'
        }}>
            {value}
        </div>
    },
    currentPrice: (props:{currentPrice:Signal.State<number>}) => {
        const currentPrice = props.currentPrice as Signal.State<number>;
        return <notifiable.div>{currentPrice}</notifiable.div>
    },
    chart: function Chart(props: unknown) {
        if (!isChartProps(props)) {
            throw new Error('Props is not for chart');
        }
        const currentPrice = props.currentPrice as Signal.State<number>;
        const minValue = parseFloat(props.item.open);
        const data = props.dataSource as Signal.State<Array<{ value: number }>>;
        useSignalEffect(() => {
            const value = currentPrice.get();
            const array = data.get();
            array.push({value});
            if (array.length > 50) {
                array.shift();
            }
            data.set([...array]);
        });
        const dataSource = useComputed<Array<number>>(() => {
            return data.get().map(i => i.value)
        });
        const color = useComputed(() => {
            const lastRecord = data.get()[data.get().length - 1]?.value;
            return lastRecord < minValue ? colors.red : colors.green
        });
        return <div><Notifiable component={LineChart} data={dataSource} height={42} width={200}
                                backgroundColor={'black'} lineColor={color} gradientColors={() => [color.get(),'black']}/></div>
    }
}).template({
    s: function SmallTemplate({Slot, item, index}) {
        const {properties} = useContext(StockList.ListContext)
        const openPrice = parseFloat(item.open);
        const currentPrice = useSignal(openPrice);
        const isBullish = useSignal(Math.random() < 0.7);
        const onClick = properties.onClick;
        const dataSource = useSignal<Array<{ value: number }>>([]);
        useEffect(() => {
            const data = [];
            let nextPrice = openPrice;
            for (let i = 0; i < 50; i++) {
                const random = Math.random();
                const baseMovement = (openPrice * 0.01);
                const randomBaseMovement = random * baseMovement;
                const movement = (randomBaseMovement * (isBullish.get() ? 1 : -1)) * ((Math.random() < 0.4) ? -1 : 1);
                nextPrice = parseFloat((nextPrice + movement).toFixed(2));
                data.push({value: nextPrice});
            }
            dataSource.set(data);
            currentPrice.set(nextPrice);
        }, [item.name]);
        useEffect(() => {
            let stop = false;
            (async () => {
                while (!stop) {
                    const random = Math.random();
                    const delayInMs = (random * 1000);
                    await delay(delayInMs);
                    if (!stop) {
                        const baseMovement = (openPrice * 0.01);
                        const randomBaseMovement = random * baseMovement;
                        const movement = (randomBaseMovement * (isBullish.get() ? 1 : -1)) * ((Math.random() < 0.4) ? -1 : 1);
                        const nextValue = parseFloat((currentPrice.get() + movement).toFixed(2));
                        currentPrice.set(nextValue)
                    }
                }
            })();
            return () => {
                stop = true;
            }
        }, [currentPrice, isBullish, openPrice]);

        return <div style={{
            gap: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            padding: '20px 20px',
            borderBottom:'1px solid rgba(255,255,255,0.1)'
        }} onClick={() => {
            if (onClick && typeof onClick === 'function') {
                onClick({item, index});
            }
        }}>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1,zIndex:1}}>
                <Slot for={'tickerSymbol'} style={{flexGrow: 1, fontSize: 22, fontWeight: 700}}/>
                <Slot for={'name'} style={{color: 'rgba(255,255,255,0.5)'}}/>
            </div>
            <div style={{flexGrow: 1, display: 'flex', position: 'relative'}}>
                <div style={{position: 'absolute', right: 0, top: 0}}>
                    <Slot for={'chart'} currentPrice={currentPrice} dataSource={dataSource} isBullish={isBullish}/>
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5}}>
                <Slot for={'currentPrice'} style={{fontSize: 18, fontWeight: 500}} currentPrice={currentPrice}/>
                <Slot for={'marketCap'} style={{fontSize: 12}} isBullish={isBullish}/>
            </div>
        </div>
    }
});


function isChartProps(value: unknown): value is {
    currentPrice: AnySignal<number>,
    item: Stock,
    dataSource: Signal.State<Array<{ value: number }>>,
    isBullish:Signal.State<boolean>
} {
    return value !== null && value !== undefined && typeof value === 'object' && 'currentPrice' in value && 'item' in value;
}