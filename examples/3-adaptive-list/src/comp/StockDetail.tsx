import {AnySignal, Notifiable, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Stock} from "../model/Stock.ts";
import {Signal} from "signal-polyfill";
import {useId} from "react";
import {IoArrowBack} from "react-icons/io5";
import {LineChart} from "./LineChart.tsx";
import {useAnimatedStyle} from "../utils/useAnimatedStyle.ts";
import {Area, AreaChart, CartesianGrid, Tooltip, YAxis} from "recharts";

const transitionDuration = 300;
export type StockDetailConfig = {
    item: Stock,
    index: number,
    itemRect: DOMRect,
    color: AnySignal<string>,
    data: AnySignal<Array<number>>,
    isBullish: AnySignal<boolean>,
    currentPrice: AnySignal<number>
}

export function StockDetail(props: {
    config: Signal.State<(StockDetailConfig & { showDetail: boolean }) | undefined>
}) {
    const elementId = useId();
    const config = props.config;
    const showDetail = useComputed(() => props.config?.get()?.showDetail);
    const isBullish = useSignal(false);
    const data = useSignal<Array<number>>([]);
    const color = useSignal<string>('');
    const currentPrice = useSignal<number>(0);

    useSignalEffect(() => {
        if (props.config === undefined || props.config.get() === undefined) {
            return;
        }
        const {
            data: propsData,
            color: propsColor,
            isBullish: propsIsBullish,
            currentPrice: propsCurrentPrice
        } = props.config!.get()!;
        data.set(propsData?.get() ?? []);
        color.set(propsColor?.get() ?? '');
        currentPrice.set(propsCurrentPrice?.get() ?? 0);
        isBullish.set(propsIsBullish?.get() ?? false);
    })

    const [style, setStyle] = useAnimatedStyle({
        position: 'absolute',
        padding: '20px 20px',
        display: 'flex',
        flexDirection: 'column',
        background: 'black',
        top: -100,
        left: 0,
        width: '100%',
        height: 0,
        zIndex: 20
    });
    useSignalEffect((): void => {
        const showDetailValue = showDetail.get();
        const domRect = config.get()?.itemRect
        if (domRect === undefined) {
            return;
        }
        if (showDetailValue) {

            setStyle({
                from: {
                    top: domRect.top,
                    left: domRect.left,
                    width: domRect.width,
                    height: domRect.height,
                }, to: {
                    top: 0,
                    left: 0,
                    width: domRect.width,
                    height: document.body.getBoundingClientRect().height,
                },
                duration: transitionDuration,
                onBeforeStarted: () => {
                    return {
                        zIndex: 20
                    }
                }
            })
        }
        if (!showDetailValue) {
            setStyle({
                to: {
                    top: domRect.top,
                    left: domRect.left,
                    width: domRect.width,
                    height: domRect.height,
                }, from: {
                    top: 0,
                    left: 0,
                    width: domRect.width,
                    height: document.body.getBoundingClientRect().height,
                },
                duration: transitionDuration,
                onAfter: () => {
                    return {
                        zIndex: -1
                    }
                }
            })
        }
    });

    const item = useComputed(() => props.config?.get()?.item)

    return <notifiable.div id={elementId}
                           style={style}>
        <div style={{display: 'flex', flexDirection: 'row', gap: 10}}>
            <notifiable.div style={() => {
                const showDetailValue = showDetail.get();
                return {
                    width: showDetailValue ? 40 : 0,
                    transition: `all ${transitionDuration}ms linear`,
                    textAlign: 'right',
                    overflow: 'hidden'
                }
            }} onClick={() => config.set({...config.get()!, showDetail: false})}><IoArrowBack style={{fontSize: 40}}/>
            </notifiable.div>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                <notifiable.div style={() => {
                    const showDetailValue = showDetail.get();
                    return {
                        fontSize: showDetailValue ? 44 : 22,
                        lineHeight: showDetailValue ? 1 : 1,
                        fontWeight: 700,
                        transition: `all ${transitionDuration}ms ease-in-out`,
                        zIndex: 1
                    }
                }}>{() => item.get()?.tickerSymbol}</notifiable.div>
                <notifiable.div
                    style={{
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: 10,
                        zIndex: 1
                    }}>{() => item.get()?.name}</notifiable.div>
            </div>
            <notifiable.div style={() => {
                const showDetailValue = showDetail.get();
                return {
                    position: 'absolute',
                    right: showDetailValue ? 20 : 100,
                    top: showDetailValue ? 100 : 20,
                    transition: `all ${transitionDuration}ms linear`,
                }
            }}>
                <Notifiable component={LineChart} data={data} height={() => showDetail.get() ? 300 : 42}
                            width={() => {
                                const itemRect = config.get()?.itemRect;
                                const showDetailValue = showDetail.get();
                                if(itemRect === undefined) {
                                    return 0;
                                }
                                if(showDetailValue) {
                                    return itemRect.width - 100
                                }
                                return 200;
                            }}
                            backgroundColor={'black'} lineColor={color} gradientColors={() => [color.get(), 'black']}/>
            </notifiable.div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5}}>
                <notifiable.div style={{fontSize: 18, fontWeight: 500}}>{currentPrice}</notifiable.div>
                <notifiable.div style={() => ({
                    backgroundColor: isBullish.get() ? '#00B050' : '#B21016',
                    padding: '2px 5px',
                    fontWeight: 600,
                    borderRadius: 5,
                    minWidth: 70,
                    display: 'flex',
                    justifyContent: 'flex-end'
                })}>{() => item.get()?.marketCap}</notifiable.div>
            </div>
        </div>
        <svg>
            <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <notifiable.stop offset={0} stopColor={color} stopOpacity={0.9}/>
                <notifiable.stop offset={1} stopColor={color} stopOpacity={0.2} />
            </linearGradient>
        </svg>
        <div style={{display:'flex',flexDirection:'column',marginTop:-140}}>
            <Notifiable component={AreaChart}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                        width={() => {
                            const domRect = config.get()?.itemRect;
                            if(domRect === undefined) {
                                return 0;
                            }
                            return domRect.width - 40
                        }}
                        height={300}
                        data={() => {
                            return data.get().map(i => ({value: i}))
                        }}
            >
                <CartesianGrid strokeDasharray="4 1" />
                <Tooltip  />
                <YAxis domain={['dataMin']} />
                <Area type="monotone" dataKey={'value'} stroke="green"  fill="url(#fillGradient)" isAnimationActive={false}/>
            </Notifiable>
        </div>
    </notifiable.div>
}
