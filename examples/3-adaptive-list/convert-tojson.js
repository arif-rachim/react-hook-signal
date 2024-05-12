import fs from "fs"

const data = fs.readFileSync('./src/model/stocks-data.json', 'utf8');

const stocks = JSON.parse(data);
Object.keys(stocks).forEach(stock => {
    stocks[stock] = (stocks[stock] || []).sort((a,b) =>  {
        const marketCapA = convertToNumber(a.marketCap);
        const marketCapB = convertToNumber(b.marketCap);
        return marketCapB - marketCapA;
    });
})
function convertToNumber(marketCap) {
    if (marketCap.endsWith('T')) {
        return parseFloat(marketCap) * 1e12;
    }if (marketCap.endsWith('B')) {
        return parseFloat(marketCap) * 1e9;
    } else if (marketCap.endsWith('M')) {
        return parseFloat(marketCap) * 1e6;
    } else {
        return parseFloat(marketCap);
    }
}
fs.writeFile('stocks-data-sort.json', `${JSON.stringify(stocks)}`, (err) => {
    if (err) {
        console.error('Error writing to file:', err);
        return;
    }
    console.log('Data has been written to file successfully.');
});