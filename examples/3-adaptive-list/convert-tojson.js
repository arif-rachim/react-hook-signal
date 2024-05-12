import {stocks} from "./src/model/stocks-data.js";
import fs from "fs"

const stocksData = {};
for (const data of stocks) {
    const stock = {
        name: data[0],
        description: data[1],
        country: data[2],
        founded: data[3],
        iPODate: data[4],
        industry: data[5],
        sector: data[6],
        employees: data[7],
        cEO: data[8],
        address: data[9],
        phone: data[10],
        website: data[11],
        tickerSymbol: data[12],
        exchange: data[13],
        reportingCurrency: data[14],
        cIKCode: data[15],
        cUSIPNumber: data[16],
        iSINNumber: data[17],
        employerID: data[18],
        sICCode: data[19],
        executives: data[20],
        marketCap: data[21],
        revenue: data[22],
        netIncome: data[23],
        sharesOut: data[24],
        ePS: data[25],
        pERatio: data[26],
        forwardPE: data[27],
        dividend: data[28],
        exDividendDate: data[29],
        volume: data[30],
        open: data[31],
        previousClose: data[32],
        daysRange: data[33],
        week52Range: data[34],
        beta: data[35],
        analysts: data[36],
        priceTarget: data[37],
        earningsDate: data[38],
    }
    stocksData[stock.exchange] = stocksData[stock.exchange] ?? [];
    stocksData[stock.exchange].push(stock);
}

fs.writeFile('stocks-data-json.js', `export const stocks = ${JSON.stringify(stocksData)}`, (err) => {
    if (err) {
        console.error('Error writing to file:', err);
        return;
    }
    console.log('Data has been written to file successfully.');
});