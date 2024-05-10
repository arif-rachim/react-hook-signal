import {dataSource} from "./dataSource.ts";

const exchangeSet = new Set<string>();
for (const data of dataSource) {
    exchangeSet.add(data.exchange)
}
export const exchange = Array.from(exchangeSet);
