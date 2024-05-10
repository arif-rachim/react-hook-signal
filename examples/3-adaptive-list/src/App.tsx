import './App.css'
import {Stock} from "./model/Stock.ts";
import {useComputed, useSignal} from "react-hook-signal";
import {useRef} from "react";
import {StockList} from "./comp/StockList.tsx";
import {StockListHeader} from "./comp/StockListHeader.tsx";
import {dataSource} from "./model/dataSource.ts";
import {exchange} from "./model/exchange.ts";
import {StockListFooter} from "./comp/StockListFooter.tsx";

function App() {

    const data = useSignal<Array<Stock>>(dataSource);
    const hideSearch = useSignal(false);
    const scrollSpeed = useSignal(0);
    const search = useSignal('');
    const selectedExchange = useSignal<number>(-1);
    const isSearchFocused = useSignal(false);

    const filteredData = useComputed(() => {
        const dataValue = data.get();
        const selectedExchangeIndex = selectedExchange.get();
        const selectedExchangeValue = exchange[selectedExchangeIndex];
        const searchValue = search.get().toUpperCase();
        return dataValue.filter(data => {
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
        />
        <StockList.List data={filteredData} onScroll={(e: { target: { scrollTop: number } }) => {
            const {clientY, timeStamp} = scrollInfoRef.current;
            const currentClientY = e.target.scrollTop;
            const currentTimestamp = performance.now();
            const distance = Math.abs(currentClientY - clientY);
            const timeElapsed = currentTimestamp - timeStamp;
            scrollSpeed.set(distance / timeElapsed);
            hideSearch.set(clientY < currentClientY);
            scrollInfoRef.current = {clientY: currentClientY, timeStamp: currentTimestamp};
        }} style={{paddingTop: 150}}/>
        <StockListFooter selectedExchange={selectedExchange} />
    </div>
}

export default App

