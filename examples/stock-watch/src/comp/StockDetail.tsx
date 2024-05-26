import {AnySignal, Notifiable, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Stock} from "../model/Stock.ts";
import {Signal} from "signal-polyfill";
import {CSSProperties, useId, useRef} from "react";
import {IoArrowBack} from "react-icons/io5";
import {SetStyleProps, useAnimatedStyle} from "../utils/useAnimatedStyle.ts";
import {Area, AreaChart, CartesianGrid, YAxis} from "recharts";
import {colors} from "../utils/colors.ts";

/**
 * The duration in milliseconds for a transition animation.
 */
const TRANSITION_DURATION = 300;

/**
 * Represents the configuration details of a stock item.
 */
export type StockDetailConfig = {
    item: Stock,
    index: number,
    itemRect: DOMRect,
    color: AnySignal<string>,
    data: AnySignal<Array<number>>,
    isBullish: AnySignal<boolean>,
    currentPrice: AnySignal<number>
}

/**
 * Renders a stock detail component.
 */
export function StockDetailComponent(props: {
    configuration: Signal.State<(StockDetailConfig & { showDetail: boolean }) | undefined>
}) {
    /**
     * This variable represents the ID of an HTML element.
     */
    const elementId = useId();

    /**
     * Represents a variable configuration object.
     */
    const configuration = props.configuration;

    /**
     * Determines if a given indicator is bullish.
     */
    const isBullish = useSignal(false);

    /**
     * Represents a variable named `data` of type `useSignal<Array<number>>`.
     */
    const data = useSignal<Array<number>>([]);

    /**
     * Represents a color signal
     */
    const color = useSignal<string>('');

    /**
     * Represents the current price.
     */
    const currentPrice = useSignal<number>(0);

    /**
     * Represents the style options for a chart.
     */
    const [chartStyle, setChartStyle] = useAnimatedStyle({height: 42});

    /**
     * Represents the computed value of the 'showDetail' property.
     *
     * showDetail is calculated by using a computed function that retrieves the 'showDetail'
     * value from the 'configuration' object passed in 'props'. If the 'showDetail' property exists
     * and has a value, it returns that value. Otherwise, it returns undefined.
     */
    const showDetail = useComputed(() => props.configuration?.get()?.showDetail);

    useSignalEffect(() => {
        if (props.configuration === undefined || props.configuration.get() === undefined) {
            return;
        }
        const {
            data: propsData,
            color: propsColor,
            isBullish: propsIsBullish,
            currentPrice: propsCurrentPrice
        } = props.configuration!.get()!;
        data.set(propsData?.get() ?? []);
        color.set(propsColor?.get() ?? '');
        currentPrice.set(propsCurrentPrice?.get() ?? 0);
        isBullish.set(propsIsBullish?.get() ?? false);
    })

    /**
     * Represents the style of a variable.
     */
    const [style, setStyle] = useAnimatedStyle({
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        background: 'black',
        overflow: 'hidden',
        top: -100,
        left: 0,
        width: '100%',
        height: 0,
        zIndex: 20,
        gap: 20
    });

    /**
     * Ref variable for a function that can be used to reverse play a chart.
     */
    const reversePlayOriginalChart = useRef<((props: {
        onAfter: SetStyleProps['onAfter']
    }) => void) | undefined>(undefined)
    useSignalEffect((): void => {
        const showDetailValue = showDetail.get();
        const domRect = configuration.get()?.itemRect
        if (domRect === undefined) {
            return;
        }
        if (showDetailValue) {
            reversePlayOriginalChart.current = setStyle({
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
                duration: TRANSITION_DURATION,
                onBefore: () => {
                    return {
                        zIndex: 20
                    }
                }
            })
        }
        if (!showDetailValue) {
            if (reversePlayOriginalChart.current) {
                reversePlayOriginalChart.current({onAfter: () => ({zIndex: -1})});
            }
        }
    });

    /**
     * A variable that is used to compute the value of `item`.
     */
    const item = useComputed(() => props.configuration?.get()?.item)


    const reversePlay = useRef<((props: {
        onBefore: (props: CSSProperties) => CSSProperties
    }) => void) | undefined>(undefined);
    useSignalEffect((): void => {
        const showDetailValue = showDetail.get();
        const domRect = configuration.get()?.itemRect
        if (domRect === undefined) {
            return;
        }
        if (showDetailValue) {
            reversePlay.current = setChartStyle({
                from: {
                    height: 42,
                    width: 160,
                    paddingRight: 20,
                    marginTop: -50,
                    opacity: 1
                },
                to: {
                    height: 100,
                    width: domRect.width - 40,
                    paddingRight: 0,
                    marginTop: 10,
                    opacity: 1
                }
            })
        } else {
            if (reversePlay.current) {
                reversePlay.current({
                    onBefore: () => {
                        const container = document.getElementById(`${elementId}-container`);
                        if(container){
                            container.scrollTop = 0;
                        }
                        return {}
                    }
                });
            }
        }
    });
    return <notifiable.div id={elementId}
                           style={style}>
        <div style={{display: 'flex', flexDirection: 'column', padding: 20}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <notifiable.div style={() => {
                    const showDetailValue = showDetail.get();
                    return {
                        width: showDetailValue ? 40 : 0,
                        transition: `all ${TRANSITION_DURATION}ms linear`,
                        textAlign: 'right',
                        overflow: 'hidden'
                    }
                }} onClick={() => configuration.set({...configuration.get()!, showDetail: false})}><IoArrowBack
                    style={{fontSize: 40}}/>
                </notifiable.div>
                <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                    <notifiable.div style={() => {
                        const showDetailValue = showDetail.get();
                        return {
                            fontSize: showDetailValue ? 44 : 22,
                            lineHeight: showDetailValue ? 1 : 1,
                            fontWeight: 700,
                            transition: `all ${TRANSITION_DURATION}ms ease-in-out`,
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

            <notifiable.div style={() => {
                const {paddingRight, marginTop, opacity} = chartStyle.get();
                return {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    paddingRight,
                    marginTop,
                    opacity
                }
            }}>
                <Notifiable component={AreaChart}
                            margin={{top: 0, right: 0, left: 0, bottom: 0}}
                            width={() => chartStyle.get().width as number}
                            height={() => chartStyle.get().height as number}
                            data={() => {
                                return data.get().map(i => ({value: i}))
                            }}
                >
                    <defs>
                        <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                            <notifiable.stop offset={0} stopColor={color} stopOpacity={0.9}/>
                            <notifiable.stop offset={1} stopColor={color} stopOpacity={0.2}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="10 5" opacity={0.2} vertical={false}/>
                    {/*<Tooltip/>*/}
                    <YAxis domain={['dataMin']} orientation={'right'}/>
                    <Area type="monotone" dataKey={'value'} stroke="url(#fillGradient)" fill="url(#fillGradient)"
                          isAnimationActive={false}/>
                </Notifiable>
            </notifiable.div>
        </div>
        {/* THIS IS CONTAINER PART*/}
        <div id={`${elementId}-container`}
             style={{display: 'flex', flexDirection: 'column', gap: 20, padding: '0 20px', overflow: 'auto'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <h1 style={{fontSize: 22, borderBottom: `1px solid ${colors.grey}`, paddingBottom: 10}}>Profile</h1>
                <Notifiable component={RowRenderComponent} titleOne={'Market Cap'} valueOne={() => item.get()?.marketCap}
                            titleTwo={'Volume'} valueTwo={() => item.get()?.volume}/>
                <Notifiable component={RowRenderComponent} titleOne={'Revenue (ttm)'} valueOne={() => item.get()?.revenue}
                            titleTwo={'Open'} valueTwo={() => item.get()?.open}/>
                <Notifiable component={RowRenderComponent} titleOne={'Net Income (ttm)'} valueOne={() => item.get()?.netIncome}
                            titleTwo={'Previous Close'} valueTwo={() => item.get()?.previousClose}/>
                <Notifiable component={RowRenderComponent} titleOne={'Dividend'} valueOne={() => item.get()?.dividend}
                            titleTwo={'Days Range'} valueTwo={() => item.get()?.daysRange}/>
                <Notifiable component={RowRenderComponent} titleOne={'EPS (ttm)'} valueOne={() => item.get()?.ePS}
                            titleTwo={'52-Week Range'} valueTwo={() => item.get()?.week52Range}/>
                <Notifiable component={RowRenderComponent} titleOne={'PE Ratio'} valueOne={() => item.get()?.pERatio}
                            titleTwo={'Beta'} valueTwo={() => item.get()?.beta}/>
                <Notifiable component={RowRenderComponent} titleOne={'Forward PE'} valueOne={() => item.get()?.forwardPE}
                            titleTwo={'Analysts'} valueTwo={() => item.get()?.analysts}/>


            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <h1 style={{fontSize: 22, borderBottom: `1px solid ${colors.grey}`, paddingBottom: 10}}>
                    <span style={{marginRight: 5, fontSize: 22}}>About</span>
                    <notifiable.span style={{fontSize: 22}}>{() => item.get()?.tickerSymbol}</notifiable.span>
                </h1>
                <notifiable.div style={{gap: 10, display: 'flex', flexDirection: 'column'}}>
                    {() => item.get()?.description.split('.').reduce<{
                        words: string[],
                        skipIndex: number,
                        textToMerge: string
                    }>((result, word, index) => {
                        if (word.length < 100) {
                            result.textToMerge += word;
                            result.skipIndex = index + 1;
                        } else {
                            if (result.skipIndex === index) {
                                result.words.push(result.textToMerge + word);
                                result.textToMerge = ''
                            } else {
                                result.words.push(word)
                            }
                        }
                        return result;
                    }, {words: [], skipIndex: 0, textToMerge: ''}).words.map((sentence, index) => (
                        <p key={index} style={{fontSize:14}}>{sentence}</p>))}
                </notifiable.div>
            </div>
            <div>
                <h1 style={{fontSize: 22, borderBottom: `1px solid ${colors.grey}`, paddingBottom: 10}}>Executives</h1>
                <notifiable.div style={{display: 'table', marginTop: 10}}>
                    {() => {
                        const executives = item.get()?.executives ?? {};
                        return Object.keys(executives).map((key) => {
                            return <div key={key} style={{display: 'table-row'}}>
                                <div style={{
                                    display: 'table-cell',
                                    fontWeight: 500,
                                    fontSize: 14,
                                    padding: '5px 0px'
                                }}>{executives[key]}</div>
                                <div style={{
                                    display: 'table-cell',
                                    fontSize: 12,
                                    color: colors.grey,
                                    padding: 5
                                }}>{key}</div>
                            </div>
                        })
                    }}
                </notifiable.div>
            </div>
        </div>
    </notifiable.div>
}

/**
 * Renders a row component with two columns.
 */
function RowRenderComponent(props: { titleOne: string, valueOne?: string, titleTwo: string, valueTwo?: string }) {
    return <div style={{display: 'flex', flexDirection: 'row', gap: 20}}>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '50%',
            borderBottom: `1px solid rgba(255,255,255,0.2)`,
            gap: 5,
            paddingBottom: 5
        }}>
            <div style={{fontSize: 12}}>{props.titleOne}</div>
            <div style={{fontSize: 16, fontWeight: 500}}>{props.valueOne}</div>
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '50%',
            borderBottom: `1px solid rgba(255,255,255,0.2)`,
            gap: 5
        }}>
            <div style={{fontSize: 12}}>{props.titleTwo}</div>
            <notifiable.div style={{fontSize: 16, fontWeight: 500}}>{props.valueTwo}</notifiable.div>
        </div>
    </div>
}
