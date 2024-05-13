import './App.css';
import { dataSource as stockData } from "./model/Stock.ts";
import { notifiable, useComputed, useSignal, useSignalEffect } from "react-hook-signal";
import { useRef } from "react";
import { StockList } from "./comp/StockList.tsx";
import { StockListHeader } from "./comp/StockListHeader.tsx";
import { exchangeData } from "./model/exchange.ts";
import { StockListFooter } from "./comp/StockListFooter.tsx";
import { jokes } from "./comp/jokes.ts";
import { StockDetailComponent, StockDetailConfig } from "./comp/StockDetail.tsx";

function App() {

    const isSearchHidden = useSignal(false);
    const scrollVelocity = useSignal(0);
    const searchTerm = useSignal('');
    const selectedExchangeIndex = useSignal<number>(0);
    const isSearchFieldFocused = useSignal(false);
    const timeoutId = useRef<number>(0);
    const isBusyMessageShown = useSignal(false);
    const stockDetailProps = useSignal<(StockDetailConfig & { showDetail: boolean }) | undefined>(undefined);

    useSignalEffect(() => {
        const isFastScroll = scrollVelocity.get() > 30;
        if(isFastScroll){
            clearTimeout(timeoutId.current);
            isBusyMessageShown.set(true);
            timeoutId.current = setTimeout(() => {
                isBusyMessageShown.set(false);
            }, 1000) as unknown as number;
        }
    });

    const filteredStockData = useComputed(() => {
        const stockDataValue = stockData.get();
        const exchangeDataValue = exchangeData.get() ?? [];
        const selectedExchangeValue = exchangeDataValue[selectedExchangeIndex.get()];
        const searchValue = searchTerm.get().toUpperCase();
        return (stockDataValue[selectedExchangeValue] ?? []).filter(stock => {
            if (selectedExchangeValue && stock.exchange !== selectedExchangeValue) {
                return false;
            }
            return stock.tickerSymbol.toUpperCase().indexOf(searchValue) >= 0
        });
    });

    const scrollInfoRef = useRef({ timeStamp: performance.now(), clientY: 0 });

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
            isSearchFieldFocused={isSearchFieldFocused}
            isSearchHidden={isSearchHidden}
            searchTerm={searchTerm}
            selectedExchangeIndex={selectedExchangeIndex}
        />
        <notifiable.div style={{ position: 'absolute', top: 300, width: '100%', textAlign: 'center', backgroundColor: 'black', zIndex: 15 }}>
            {() => {
                if (isBusyMessageShown.get()) {
                    const randomJoke = jokes[Math.round(Math.random() * (jokes.length - 1))]
                    return <div style={{ padding: 10 }}>{randomJoke}</div>
                }
                return <></>
            }}
        </notifiable.div>
        <StockList.List data={filteredStockData} onScroll={(e: { target: { scrollTop: number } }) => {
            const { clientY, timeStamp } = scrollInfoRef.current;
            const currentClientY = e.target.scrollTop;
            const currentTimestamp = performance.now();
            const distance = Math.abs(currentClientY - clientY);
            const timeElapsed = currentTimestamp - timeStamp;
            scrollVelocity.set(distance / timeElapsed);
            isSearchHidden.set(clientY < currentClientY);
            scrollInfoRef.current = { clientY: currentClientY, timeStamp: currentTimestamp };
        }} style={{ paddingTop: 170 }} onClick={(props) => {
            stockDetailProps.set({ ...props, showDetail: true });
        }}/>
        <StockListFooter selectedExchangeIndex={selectedExchangeIndex} highlightBottom={false} />
        <StockDetailComponent configuration={stockDetailProps} />
    </div>
}

export default App;
