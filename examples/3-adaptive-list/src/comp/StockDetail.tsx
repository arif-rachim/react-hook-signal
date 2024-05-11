import {AnySignal, Notifiable, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Stock} from "../model/Stock.ts";
import {Signal} from "signal-polyfill";
import {useId} from "react";
import {IoArrowBack} from "react-icons/io5";
import {LineChart} from "./LineChart.tsx";

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
    const showDetail = useComputed(() => props.config?.get()?.showDetail ?? false);
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
    const animationStyle = useComputed(() => {
        if (props.config === undefined || props.config.get() === undefined) {
            return;
        }
        const itemRect = props.config.get()!.itemRect;
        if (itemRect === undefined) {
            return {__html: ''}
        }
        return {
            __html: `
@keyframes list-to-detail {
    from {
        top: ${itemRect?.top}px;
        left: ${itemRect?.left}px;
        height : ${itemRect?.height}px;
        width : ${itemRect?.width}px;
    }
    to {
        top: 0px;
        left: 0px;
        height : 100%;
        width : 100%;
    }
}
.animate-in {
    animation-name: list-to-detail;
    animation-duration:${transitionDuration}ms;
    animation-timing-function: linear;
    animation-direction:normal;
    animation-iteration-count:1;
    animation-fill-mode:forwards;
}
.animate-out {
    animation-name: list-to-detail;
    animation-duration:${transitionDuration}ms;
    animation-timing-function: linear;
    animation-direction:reverse;
    animation-iteration-count:1;
    animation-fill-mode:forwards;
}`
        }
    })
    useSignalEffect(() => {
        if (props.config === undefined || props.config.get() === undefined) {
            return;
        }
        const showDetailValue = config.get()!.showDetail;
        const hasStyle = animationStyle.get()!.__html !== '';
        if (!hasStyle) {
            return;
        }
        const element = document.getElementById(elementId)!;
        if (showDetailValue === undefined) {
            return;
        }
        if (showDetailValue) {
            element.classList.remove('animate-out');
            void element.offsetWidth;
            element.classList.add('animate-in');
            element.style.zIndex = '20';
        }
        if (!showDetailValue) {
            element.classList.remove('animate-in');
            void element.offsetWidth;
            element.addEventListener('animationend', (props) => {
                if (props.animationName === 'list-to-detail') {
                    element.style.zIndex = '-1';
                }
            }, {once: true})
            element.classList.add('animate-out');
        }
    })
    const item = useComputed(() => props.config?.get()?.item)
    return <div id={elementId}
                style={{position: 'absolute', padding: '20px 20px', gap: 10, display: 'flex', background: 'black'}}>
        <notifiable.style dangerouslySetInnerHTML={animationStyle}/>
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
                transition:`all ${transitionDuration}ms linear`,
            }
        }}>
            <Notifiable component={LineChart} data={data} height={() => showDetail.get() ? 300 : 42}
                        width={() => showDetail.get() ? (document.body.getBoundingClientRect().width - 40) : 200}
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
}