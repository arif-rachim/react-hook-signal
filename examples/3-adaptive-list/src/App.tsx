import './App.css'
import {dataSource as data} from "./model/Stock.ts";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {useRef} from "react";
import {StockList} from "./comp/StockList.tsx";
import {StockListHeader} from "./comp/StockListHeader.tsx";
import {exchange} from "./model/exchange.ts";
import {StockListFooter} from "./comp/StockListFooter.tsx";
import {jokes} from "./comp/jokes.ts";
import {StockDetail, StockDetailConfig} from "./comp/StockDetail.tsx";

function App() {

    const hideSearch = useSignal(false);
    const scrollSpeed = useSignal(0);
    const search = useSignal('');
    const selectedExchange = useSignal<number>(0);
    const isSearchFocused = useSignal(false);
    const timeoutId = useRef<number>(0);
    const showBusyMessage = useSignal(false);
    const detailProps = useSignal<(StockDetailConfig & {showDetail:boolean})|undefined>(undefined);
    useSignalEffect(() => {
        const isFast = scrollSpeed.get() > 30;
        if(isFast){
            clearTimeout(timeoutId.current);
            showBusyMessage.set(true);
            timeoutId.current = setTimeout(() => {
                showBusyMessage.set(false);
            },1000) as unknown as number;
        }
    });
    const filteredData = useComputed(() => {
        const dataValue = data.get();
        const exchangeValue = exchange.get()??[];
        const selectedExchangeIndex = selectedExchange.get();
        const selectedExchangeValue = exchangeValue[selectedExchangeIndex];
        const searchValue = search.get().toUpperCase();
        return (dataValue[selectedExchangeValue]??[]).filter(data => {
            if (selectedExchangeValue && data.exchange !== selectedExchangeValue) {
                return false;
            }
            return data.tickerSymbol.toUpperCase().indexOf(searchValue) >= 0
        })
    });

    const scrollInfoRef = useRef({timeStamp: performance.now(), clientY: 0});

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
        <StockListHeader
            isSearchFocused={isSearchFocused}
            hideSearch={hideSearch}
            search={search}
            selectedExchange={selectedExchange}
        />
        <notifiable.div style={{position:'absolute',top:300,width:'100%',textAlign:'center',backgroundColor:'black',zIndex:15}}>
            {() => {
                if(showBusyMessage.get()) {
                    const joke = jokes[Math.round(Math.random() * (jokes.length - 1))]
                    return <div style={{padding: 10}}>{joke}</div>
                }
                return <></>
            }}
        </notifiable.div>
        <StockList.List data={filteredData} onScroll={(e: { target: { scrollTop: number } }) => {
            const {clientY, timeStamp} = scrollInfoRef.current;
            const currentClientY = e.target.scrollTop;
            const currentTimestamp = performance.now();
            const distance = Math.abs(currentClientY - clientY);
            const timeElapsed = currentTimestamp - timeStamp;
            scrollSpeed.set(distance / timeElapsed);
            hideSearch.set(clientY < currentClientY);
            scrollInfoRef.current = {clientY: currentClientY, timeStamp: currentTimestamp};
        }} style={{paddingTop: 170}} onClick={(props) => {
            detailProps.set({...props,showDetail:true});
        }}/>
        <StockListFooter selectedExchange={selectedExchange} highlightBottom={false} />
        <StockDetail config={detailProps} />
    </div>
}

export default App

