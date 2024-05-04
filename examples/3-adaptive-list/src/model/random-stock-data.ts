import {faker} from "@faker-js/faker";
import {Stock} from "./Stock.ts";
// Function to generate random stock data
const generateRandomStockData = (): Stock => {
    const symbol =  'sample';
    const companyName = faker.company.name();
    const latestPrice = parseFloat(faker.finance.amount());
    const change = parseFloat(faker.finance.amount(-10, 10));
    const changePercent = parseFloat(faker.finance.amount(-5, 5,2));
    const high = parseFloat(faker.finance.amount(latestPrice, latestPrice * 1.1,2));
    const low = parseFloat(faker.finance.amount(latestPrice * 0.9, latestPrice,2));
    const open = parseFloat(faker.finance.amount(low, high,2));
    const previousClose = parseFloat(faker.finance.amount(low, high,2));
    const volume = faker.number.int({ min: 1000, max: 1000000 });

    return {
        symbol,
        companyName,
        latestPrice,
        change,
        changePercent,
        high,
        low,
        open,
        previousClose,
        volume
    };
};

// Generate 2000 records of random stock data
const generateRandomStockDataArray = (count: number): Stock[] => {
    const stocks: Stock[] = [];
    for (let i = 0; i < count; i++) {
        stocks.push(generateRandomStockData());
    }
    return stocks;
};
// create a function to generate thick name
// import a library chart from internet
// introduce some animation
export const randomStockData = generateRandomStockDataArray(2000);
