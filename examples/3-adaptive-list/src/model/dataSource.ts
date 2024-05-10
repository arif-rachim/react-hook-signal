import {stocksDataSource} from "./Stock.ts";

export const dataSource = stocksDataSource.filter((stock) => ['BATS', 'NYSEARCA'].indexOf(stock.exchange) < 0)
