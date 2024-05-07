import './App.css'
import {Stock, stocksDataSource} from "./model/Stock.ts";
import {createResponsiveList} from "./responsive-list/createResponsiveList.tsx";
import {AnySignal, Notifiable, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {IoEllipsisHorizontal, IoSearch} from "react-icons/io5";
import {IoIosCloseCircle} from "react-icons/io";
import {
    forwardRef,
    ForwardRefExoticComponent,
    RefAttributes,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react";
import {Area, AreaChart, YAxis} from "recharts";
import {delay} from "./utils/delay.ts";
import {Signal} from "signal-polyfill";

function App() {

    const data = useSignal<Array<Stock>>(stocksDataSource);
    const isSearchFocused = useSignal(false);
    const [search, setSearch] = useState('');
    const searchSignal = useSignal(search);
    const hideSearch = useSignal(false);
    useEffect(() => {
        searchSignal.set(search);
    }, [search, searchSignal]);
    const doneElement = useComputed(() => {
        const isSearchFocusedValue = isSearchFocused.get();
        return isSearchFocusedValue ? <div style={{color: 'deepskyblue', fontSize: 18}}>Done</div> : <></>
    })

    const filteredData = useComputed(() => {
        const dataValue = data.get();
        const searchValue = searchSignal.get().toLowerCase();
        return dataValue.filter(data => data.tickerSymbol.toLowerCase().indexOf(searchValue) >= 0)
    });
    const prevScrollPos = useRef(0);
    const detailPanelRef = useRef<Attributes<typeof DetailPanel> | null>(null);
    return <div style={{
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        backgroundColor: '#000',
        color: 'rgba(255,255,255,0.9)',
        userSelect: 'none'
    }}>
        <notifiable.div style={() => {
            const searchFocused = isSearchFocused.get();
            return {
                padding: searchFocused ? 0 : 20,
                display: 'flex',
                flexDirection: 'row',
                height: searchFocused ? 0 : 90,
                opacity: searchFocused ? 0 : 1,
                transition: 'all 300ms linear',
                overflow: 'hidden',
                zIndex: 1
            }
        }}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
                <div style={{fontSize: 32, fontWeight: 'bold'}}>Stocks</div>
                <div style={{fontSize: 28, fontWeight: 'bold', color: 'rgba(255,255,255,0.5)'}}>6 May</div>
            </div>
            <div style={{flexGrow: 1}}></div>
            <div style={{
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 5,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}><IoEllipsisHorizontal style={{fontSize: 22, color: 'deepskyblue'}}/></div>
        </notifiable.div>
        <notifiable.div style={() => {
            const hideSearchValue = hideSearch.get();
            return {
                display: 'flex',
                flexDirection: 'row',
                padding: '0px 20px',
                marginTop: hideSearchValue ? -36 : 20,
                marginBottom: hideSearchValue ? 0 : 20,
                gap: 10,
                alignItems: 'center',
                overflow: 'hidden',
                opacity: hideSearchValue ? 0 : 1,
                transition: 'all 300ms linear'
            }
        }}>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative'}}>
                <notifiable.input style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px 5px 30px',
                    fontSize: 18,
                    height: 36,
                    borderRadius: 20
                }}
                                  onFocus={() => isSearchFocused.set(true)} onBlur={() => isSearchFocused.set(false)}
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                />
                <IoSearch
                    style={{position: 'absolute', top: 7, left: 5, fontSize: 22, color: 'rgba(255,255,255,0.5)'}}/>
                {search &&
                    <IoIosCloseCircle style={{position: 'absolute', top: 7, right: 5, fontSize: 20}} onClick={() => {
                        setSearch('');
                    }}/>
                }
            </div>
            <notifiable.div style={() => {
                const searchFocused = isSearchFocused.get();
                return {
                    width: searchFocused ? 40 : 0,
                    opacity: searchFocused ? 1 : 0,
                    transition: 'all 300ms linear'
                }
            }}>
                {doneElement}
            </notifiable.div>
        </notifiable.div>
        <AdaptiveList.List data={filteredData} onScroll={(e) => {
            const prevPos = prevScrollPos.current;
            const current = e.target.scrollTop;
            const scrollDown = prevPos < current;
            prevScrollPos.current = current;
            hideSearch.set(scrollDown);
        }} onClick={({item}: { item: Stock }) => {
            detailPanelRef.current!.showSelectedStock(item);
        }}></AdaptiveList.List>
        <DetailPanel ref={detailPanelRef} />
    </div>
}

type Attributes<T> = T extends ForwardRefExoticComponent<infer V> ? V extends RefAttributes<infer C> ? C : never : never;
export default App

const AdaptiveList = createResponsiveList<Stock>().breakPoint({s: 400, m: 600, l: 900, xl: 1200}).renderer({
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
    open: (props) => {
        const currentPrice = props.currentPrice as Signal.State<number>;
        return <notifiable.div>{currentPrice}</notifiable.div>
    },
    chart: function Chart(props: unknown) {

        if (!isChartProps(props)) {
            throw new Error('Props is not for chart');
        }
        const currentPrice = props.currentPrice as Signal.State<number>;
        const minValue = parseFloat(props.item.open);
        const data = useSignal<Array<{ value: number }>>(Array.from({length: 50}).map(() => ({value: minValue})));
        useSignalEffect(() => {
            const value = currentPrice.get();
            const array = data.get();
            array.push({value});
            if (array.length > 50) {
                array.shift();
            }
            data.set([...array]);
        })
        return <Notifiable component={GradientAreaChart} data={data} minValue={minValue}/>
    }
}).template({
    s: function SmallTemplate({Slot, item, index}) {
        const {properties} = useContext(AdaptiveList.ListContext)
        const openPrice = parseFloat(item.open);
        const currentPrice = useSignal(openPrice);
        const isBullish = useSignal(Math.random() < 0.7);
        const onClick = properties.onClick;
        useEffect(() => {
            let stop = false;
            (async () => {
                while (!stop) {
                    const random = Math.random();
                    const delayInMs = 1000 + (random * 1000);
                    await delay(delayInMs);
                    if (!stop) {
                        const baseMovement = (openPrice * 0.01);
                        const randomBaseMovement = random * baseMovement;
                        const movement = (randomBaseMovement * (isBullish.get() ? 1 : -1)) * ((Math.random() < 0.3) ? -1 : 1);
                        const nextValue = parseFloat((currentPrice.get() + movement).toFixed(2));
                        currentPrice.set(nextValue)
                    }
                }
            })();
            return () => {
                stop = true;
            }
        }, []);

        return <div style={{
            gap: 10,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            padding: '20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        }} onClick={() => {
            if (onClick && typeof onClick === 'function') {
                onClick({item, index});
            }
        }}>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1,}}>
                <Slot for={'tickerSymbol'} style={{flexGrow: 1, fontSize: 22, fontWeight: 700}}/>
                <Slot for={'name'} style={{color: 'rgba(255,255,255,0.5)'}}/>
            </div>
            <div style={{flexGrow: 1, display: 'flex', position: 'relative'}}>
                <div style={{position: 'absolute', right: 0, top: 0}}>
                    <Slot for={'chart'} currentPrice={currentPrice}/>
                </div>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5}}>
                <Slot for={'open'} style={{fontSize: 18, fontWeight: 500}} currentPrice={currentPrice}/>
                <Slot for={'marketCap'} style={{fontSize: 12}} isBullish={isBullish}/>
            </div>
        </div>
    }
}).list();

function isChartProps(value: unknown): value is { currentPrice: AnySignal<number>, item: Stock } {
    return value !== null && value !== undefined && typeof value === 'object' && 'currentPrice' in value && 'item' in value;
}

function GradientAreaChart(props: { data: Array<{ value: number }>, minValue: number }) {
    const data = props.data;
    const minValue = props.minValue;
    const lastData = data?.[data?.length - 1]?.value;
    const maxValue = Math.max(...data.map(entry => entry.value))
    const decreasingColor = '#B21016';
    const increasingColor = '#00B050';
    const increasing = lastData > minValue;
    return (
        <AreaChart data={props.data} margin={{top: 0, right: 0, left: 0, bottom: 0}} width={200} height={43}>
            <defs>
                <linearGradient id="decreasing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={decreasingColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={decreasingColor} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="increasing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={increasingColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={increasingColor} stopOpacity={0}/>
                </linearGradient>
            </defs>
            <YAxis domain={[props.minValue, maxValue]} opacity={0}/>
            <Area type="monotone"
                  dataKey="value"
                  stroke={increasing ? increasingColor : decreasingColor}
                  fill={`url(#${increasing ? 'increasing' : 'decreasing'})`} isAnimationActive={true}
                  animateNewValues={false}/>
        </AreaChart>
    );
}

const DetailPanel = forwardRef<{ showSelectedStock: (stock: Stock) => void }>(function DetailPanel(_ , ref) {
    const selectedStock = useSignal<Stock | undefined>(undefined)
    const dragRef = useRef({startY: 0, startTop: 0});
    const divRef = useRef<HTMLDivElement | null>(null);
    const dragDirection = useSignal<'up' | 'down' | undefined>(undefined);
    const topOffset = useSignal(window.innerHeight);
    useSignalEffect(() => {
        const topValue = topOffset.get();
        divRef.current!.style.top = `${topValue}px`;
    })

    useImperativeHandle(ref, () => {
        return {
            showSelectedStock: (item: Stock) => {
                selectedStock.set(item);
                if (divRef.current && divRef.current?.style) {
                    divRef.current!.style.transition = 'top 200ms linear';
                    topOffset.set(300);
                }
            }
        }
    })
    const startDragging = useCallback((e:({clientY:number} | {targetTouches:React.TouchList})) => {
        let clientY:number = 0
        if(isTouch(e)){
            clientY = e.targetTouches[0].clientY;
        }
        if(isMouseDrag(e)){
            clientY = e.clientY;
        }
        divRef.current!.style.transition = '';
        dragRef.current.startY = clientY;
        dragRef.current.startTop = divRef.current?.offsetTop ?? 0;

        function drag(e:({clientY:number} | {targetTouches:TouchList})) {
            let clientY:number = 0
            if(isTouch(e)){
                clientY = e.targetTouches[0].clientY;
            }
            if(isMouseDrag(e)){
                clientY = e.clientY;
            }
            const deltaY = clientY - dragRef.current.startY;
            if (deltaY > 0) {
                dragDirection.set('down');
            } else {
                dragDirection.set('up');
            }
            if (divRef.current && divRef.current?.style) {
                const top = dragRef.current.startTop + deltaY;
                if (top > 50) {
                    topOffset.set(top);
                }
            }
        }

        function stopDragging() {
            if ((divRef.current?.offsetTop ?? 0) > (window.innerHeight - 300)) {
                divRef.current!.style.transition = 'top 200ms linear';
                topOffset.set(window.innerHeight);
            }

            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDragging);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', stopDragging);
        }

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', stopDragging);
    }, [dragDirection, topOffset]);

    return <div ref={divRef} style={{
        position: 'absolute',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        width: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        borderTop: '1px solid rgba(255,255,255,0.2)',
        overflow: 'auto',
        userSelect: 'none'
    }} onMouseDown={startDragging} onTouchStart={startDragging}>
        <button style={{position: 'absolute', top: 0}}></button>
        <notifiable.h1>{clientY}</notifiable.h1>
        <notifiable.div>{() => selectedStock.get()?.tickerSymbol}</notifiable.div>
        <notifiable.div>{() => selectedStock.get()?.name}</notifiable.div>
        <notifiable.div>{() => selectedStock.get()?.description}</notifiable.div>
    </div>
})

function isTouch(e:unknown):e is {targetTouches:TouchList}{
    return e !== null && e !== undefined && typeof e === 'object' && 'targetTouches' in e && (e.targetTouches as TouchList).length > 0
}

function isMouseDrag(e:unknown):e is {clientY:number}{
    return e !== null && e !== undefined && typeof e === 'object' && 'clientY' in e;
}

const startScrolling = new Signal.State<boolean>(false);
const clientY = new Signal.State(0);
const clientYInitial = new Signal.State(0);
const delta = new Signal.Computed(() => {
    return clientY.get() - clientYInitial.get();
});
document.body.addEventListener('touchstart', function(event) {
    // Prevent pull-to-refresh behavior
    const initialValue = event.targetTouches[0].clientY
    clientYInitial.set(initialValue);
    clientY.set(initialValue);
    startScrolling.set(true);
}, { passive: false });
document.body.addEventListener('touchmove', function(event) {
    // Prevent pull-to-refresh behavior
    clientY.set(event.targetTouches[0].clientY);
    event.preventDefault();
}, { passive: false });

document.body.addEventListener('touchend', function() {
    // Prevent pull-to-refresh behavior
    startScrolling.set(false);
}, { passive: false });