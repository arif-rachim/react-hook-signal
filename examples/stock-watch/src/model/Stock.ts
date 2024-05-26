import {Signal} from "signal-polyfill";

/**
 * Represents a stock information.
 */
export interface Stock {
    name: string,
    description: string,
    country: string,
    founded: string,
    iPODate: string,
    industry: string,
    sector: string,
    employees: string,
    cEO: string,
    address: string,
    phone: string,
    website: string,
    tickerSymbol: string,
    exchange: string,
    reportingCurrency: string,
    cIKCode: string,
    cUSIPNumber: string,
    iSINNumber: string,
    employerID: string,
    sICCode: string,
    executives: Record<string,string>,
    marketCap: string,
    revenue: string,
    netIncome: string,
    sharesOut: string,
    ePS: string,
    pERatio: string,
    forwardPE: string,
    dividend: string,
    exDividendDate: string,
    volume: string,
    open: string,
    previousClose: string,
    daysRange: string,
    week52Range: string,
    beta: string,
    analysts: string,
    priceTarget: string,
    earningsDate: string,
}

/**
 * Represents the data source for stocks.
 */
export const dataSource = new Signal.State<Record<string, Array<Stock>>>({});

(async function loadDataSource() {
    const response = await fetch('https://raw.githubusercontent.com/arif-rachim/react-hook-signal/main/examples/3-adaptive-list/src/model/stocks-data-sort.json');
    const text = await response.text()
    dataSource.set(JSON.parse(text) as unknown as Record<string, Array<Stock>>)
})();

