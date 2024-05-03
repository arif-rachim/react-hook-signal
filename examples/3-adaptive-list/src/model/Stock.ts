export interface Stock {
    symbol: string;            // The stock symbol (e.g., AAPL for Apple Inc.)
    companyName: string;       // The name of the company
    latestPrice: number;       // The latest price of the stock
    change: number;            // The change in price (e.g., -2.50 for a decrease of $2.50)
    changePercent: number;     // The percentage change in price (e.g., -1.25 for a decrease of 1.25%)
    high: number;              // The highest price of the day
    low: number;               // The lowest price of the day
    open: number;              // The opening price of the day
    previousClose: number;     // The previous day's closing price
    volume: number;            // The trading volume of the day
}