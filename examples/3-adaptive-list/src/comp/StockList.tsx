import {createResponsiveList} from "../responsive-list/createResponsiveList.tsx";
import {Stock} from "../model/Stock.ts";
import {AnySignal, Notifiable, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {useContext, useEffect, useId} from "react";
import {delay} from "../utils/delay.ts";
import {LineChart} from "./LineChart.tsx";
import {colors} from "../utils/colors.ts";
import {StockDetailConfig} from "./StockDetail.tsx";

/**
 * Variable to create a responsive list of stocks.
 */
export const StockList = createResponsiveList<Stock,{onClick:(props:StockDetailConfig) => void}>().breakPoint({s: 400, m: 600, l: 900, xl: 1200}).renderer({
    tickerSymbol: ({value}) => value,
    earningsDate: ({value}) => value,
    name: ({value}) => value,
    priceTarget: ({value}) => value,
    marketCap: ({value}) => value,
    currentPrice: (props:{currentPrice:Signal.State<number>}) => {
        const currentPrice = props.currentPrice as Signal.State<number>;
        return <notifiable.div style={{fontSize: 18, fontWeight: 500}} >{currentPrice}</notifiable.div>
    },
    chart: function Chart(props: unknown) {
        const {color,data} = props as unknown as {data:AnySignal<Array<number>>,color:AnySignal<string>};
        return <Notifiable component={LineChart} data={data} height={42} width={100}
                                backgroundColor={'black'} lineColor={color} gradientColors={() => [color.get(),'black']}/>
    }
}).template({
    s: function Template({Slot, item, index}) {
        const {properties} = useContext(StockList.ListContext)
        const openPrice = parseFloat(item.open);
        const currentPrice = useSignal(openPrice);
        const isBullish = useSignal(Math.random() < 0.7);
        const data = useSignal<Array<number>>([]);
        const id = useId();
        const onClick = properties.onClick;

        useEffect(() => {
            const result = [];
            let nextPrice = openPrice;
            for (let i = 0; i < 50; i++) {
                const random = Math.random();
                const baseMovement = (openPrice * 0.01);
                const randomBaseMovement = random * baseMovement;
                const movement = (randomBaseMovement * (isBullish.get() ? 1 : -1)) * ((Math.random() < 0.4) ? -1 : 1);
                nextPrice = parseFloat((nextPrice + movement).toFixed(2));
                result.push(nextPrice);
            }
            data.set(result);
            currentPrice.set(nextPrice);
        }, [currentPrice, data, isBullish, item.name, openPrice]);

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


        useSignalEffect(() => {
            const value = currentPrice.get();
            const array = data.get();
            array.push(value);
            if (array.length > 50) {
                array.shift();
            }
            data.set([...array]);
        });

        const color = useComputed(() => {
            const lastRecord = data.get()[data.get().length - 1];
            return lastRecord < openPrice ? colors.red : colors.green
        })

        return <div id={id} style={{
            gap: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            padding: '20px 20px',
            borderBottom:'1px solid rgba(255,255,255,0.1)'
        }} onClick={() => {
            if (onClick && typeof onClick === 'function') {
                const itemRect = document.getElementById(id)!.getBoundingClientRect();
                onClick({item,index,itemRect,color,data,isBullish,currentPrice});
            }
            
        }}>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1,zIndex:1}}>
                <Slot for={'tickerSymbol'} style={{flexGrow: 1, fontSize: 22, fontWeight: 700}}/>
                <Slot for={'name'} style={{color: 'rgba(255,255,255,0.5)'}}/>
            </div>
            <div style={{flexGrow: 1, display: 'flex', position: 'relative'}}>
                <div style={{position: 'absolute', right: 0, top: 0}}>
                    <Slot for={'chart'} color={color} data={data}/>
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5}}>
                <Slot for={'currentPrice'} currentPrice={currentPrice}/>
                <Notifiable component={Slot} for={'marketCap'} style={() => ({
                    backgroundColor: isBullish.get() ? '#00B050' : '#B21016',
                    padding: '2px 5px',
                    fontWeight: 600,
                    borderRadius: 5,
                    minWidth: 70,
                    display: 'flex',
                    justifyContent: 'flex-end'
                })} />
            </div>
        </div>
    }
});
