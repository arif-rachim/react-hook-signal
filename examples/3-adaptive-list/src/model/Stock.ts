import {Signal} from "signal-polyfill";

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

export const dataSource = new Signal.State<Record<string, Array<Stock>>>({});

(async function loadDataSource() {
    const stocksData = await import('./stocks-data-sort.json');
    const result = stocksData.default;
    dataSource.set(result as unknown as Record<string, Array<Stock>>)
})();

