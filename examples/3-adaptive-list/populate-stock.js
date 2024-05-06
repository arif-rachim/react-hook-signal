import puppeteer from "puppeteer";
import {load} from "cheerio";
import fs from "fs";
import {symbols} from "./src/model/stock-list.js";
const MAX_ATTEMPT = 10;
const MAX_REUSE_BROWSER = 10000000;
async function fetchSite(address, selector, attempt, page) {
    try {
        await page.goto(address);
        await page.waitForSelector(selector,{timeout:120000});
        return await page.content();
    } catch (error) {
        if (attempt < MAX_ATTEMPT) {
            attempt = attempt + 1;
            console.log(`[${attempt}/${MAX_ATTEMPT} fetching]`, address);
            return fetchSite(address, selector, attempt, page)
        }
        console.log(error);
        console.error('Error fetching website:', address);
        return null;
    }
}

const downloadSymbol = async (symbol, index, browser) => {
    console.log('[fetching]', index, symbol);
    const pageOne = await withPage(browser);
    const pageTwo = await withPage(browser);
    const profileHtml = await pageOne((page) => fetchSite(`https://stockanalysis.com/stocks/${symbol}/company/`, '[data-test="profile-desc"]', 0, page));
    const overviewHtml = await pageTwo((page) => fetchSite(`https://stockanalysis.com/stocks/${symbol}/`, '[data-test="overview-quote"]', 0, page));

    if (isEmpty(profileHtml) || isEmpty(overviewHtml)) {
        console.log('[ERROR] data is null');
        return null;
    }
    const profile = parseProfile(profileHtml);
    const overview = parseOverview(overviewHtml);

    function findAddress() {
        const address = Object.keys(profile).find(key => key.startsWith('Address: '));
        if (address && address.length > 9) {
            return address.slice(9)
        }
        return [];
    }

    if (isEmpty(overview.Volume) || isEmpty(profile.Name)) {
        console.log('[ERROR] profile or overview is null ');
        return [];
    }
    if (index % 10 === 0) {
        saveFile();
    }
    return [
        profile.Name,
        profile.Description,
        profile.Country,
        profile.Founded,
        profile['IPO Date'],
        profile.Industry,
        profile.Sector,
        profile.Employees,
        profile.CEO,
        findAddress(),
        profile.Phone,
        profile.Website,
        profile['Ticker Symbol'],
        profile.Exchange,
        profile['Reporting Currency'],
        profile['CIK Code'],
        profile['CUSIP Number'],
        profile['ISIN Number'],
        profile['Employer ID'],
        profile['SIC Code'],
        profile.executives,
        overview['Market Cap'],
        overview["Revenue (ttm)"],
        overview["Net Income (ttm)"],
        overview["Shares Out"],
        overview["EPS (ttm)"],
        overview["PE Ratio"],
        overview["Forward PE"],
        overview["Dividend"],
        overview["Ex-Dividend Date"],
        overview["Volume"],
        overview["Open"],
        overview["Previous Close"],
        overview["Day's Range"],
        overview["52-Week Range"],
        overview["Beta"],
        overview["Analysts"],
        overview["Price Target"],
        overview["Earnings Date"],
    ];
}

/*

 */
function parseOverview(overview) {
    const $ = load(overview);
    const result = {};
    $('[data-test="overview-info"] tr').each((_, tr) => {
        const tds = $(tr).find('td');
        Object.assign(result, {[$(tds[0]).text()]: $(tds[1]).text()});
    })
    $('[data-test="overview-quote"] tr').each((_, tr) => {
        const tds = $(tr).find('td');
        Object.assign(result, {[$(tds[0]).text()]: $(tds[1]).text()});
    })
    return result;
}

// Function to parse HTML content and query elements
function parseProfile(html) {
    const $ = load(html);
    const Description = $('[data-test="profile-desc"]').text();
    const Name = $('div.text-center.text-2xl.font-semibold').text();
    const data = {};
    const executives = {};
    // company description
    $('table.w-full:nth-child(3) tr').each((_, tr) => {
        const tds = $(tr).find('td');
        Object.assign(data, {[$(tds[0]).text()]: $(tds[1]).text()});
    })
    // CEO
    $('table.w-full:nth-child(2) tr').each((_, tr) => {
        const tds = $(tr).find('td');
        if ($(tds[1]).text() && $(tds[0]).text()) {
            Object.assign(executives, {[$(tds[1]).text()]: $(tds[0]).text()});
        }
    })
    // contact details & stock details
    $('table.w-full:nth-child(1) tr').each((index, tr) => {
        const tds = $(tr).find('td');
        Object.assign(data, {[$(tds[0]).text()]: $(tds[1]).text()});
    })

    return {
        Name,
        Description,
        ...data,
        executives
    }
}

const global = {
    index: 0,
    companies: [],
    savingFile: false
}

async function downloadResource(index, browser) {
    if (index < symbols.length - 1) {
        const company = await downloadSymbol(symbols[index], index, browser);
        if (company && company.length > 0) {
            global.companies.push(company);
        }
    }
}

async function withPage(browser) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (req.resourceType() === 'stylesheet' || req.resourceType() === 'font' || req.resourceType() === 'image' || req.resourceType() === 'script') {
            req.abort();
        } else {
            req.continue();
        }
    });
    page.on('response', async response => {
        const status = response.status();
        if (status === 404 || status === 500) {
            console.log(`Error ${status}`);
        }
    });
    return async (callback) => {
        try {
            return await callback(page);
        } catch (err) {
            console.error(err);
        } finally {
            page.close();
        }
    };
}

async function withBrowser() {
    const browser = await puppeteer.launch();
    return async (callback) => {
        try {
            return await callback(browser);
        } finally {
            console.log('[browser-closed]');
            await browser.close();
        }
    }
}
function hasNext(){
    return global.index < (symbols.length - 1);
}
// Main function to fetch website, parse HTML, and query elements
function main() {


    async function downloader(browser){
        let running = 0;
        while (hasNext() && running < MAX_REUSE_BROWSER) {
            const index = global.index++;
            await downloadResource(index, browser);
            running++;
        }
    }
    async function browserSpawner(){
        let browserCallback = await withBrowser();
        while (hasNext()){
            await browserCallback((browser) => downloader(browser))
            browserCallback = await withBrowser();
        }
    }
    // run 5 spawner
    browserSpawner().then();
    browserSpawner().then();
    browserSpawner().then();
    browserSpawner().then();
    browserSpawner().then();
}

function saveFile() {
    if (global.savingFile) {
        return;
    }
    global.savingFile = true;
    fs.writeFile('src/model/stocks-data.ts', `export const stocks = ` + JSON.stringify(global.companies), err => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('src/model/stocks-data.ts created');
        global.savingFile = false;
    });

}

main();

function isEmpty(val) {
    return val === undefined || val === null || val === '';
}