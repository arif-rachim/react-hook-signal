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

/**
 * Represents the main application component.
 */
function App() {

    /**
     * Creates a signal to indicate whether the search is hidden or not.
     */
    const isSearchHidden = useSignal(false);

    /**
     * A variable representing the scroll velocity.
     */
    const scrollVelocity = useSignal(0);

    /**
     * Represents the search term used to perform a search using the Signal API.
     */
    const searchTerm = useSignal('');

    /**
     * Represents the selected exchange index.
     */
    const selectedExchangeIndex = useSignal<number>(0);

    /**
     * Represents the focus state of a search field.
     */
    const isSearchFieldFocused = useSignal(false);

    /**
     * The reference to the timeout identifier.
     */
    const timeoutId = useRef<number>(0);

    /**
     * Represents the state of whether the busy message is shown or not.
     */
    const isBusyMessageShown = useSignal(false);

    /**
     * Represents the stock detail property.
     */
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

    /**
     * Returns filtered stock data based on selected exchange and search term.
     */
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

    /**
     * A reference object that contains scroll information.
     */
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
