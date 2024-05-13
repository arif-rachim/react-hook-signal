import {dataSource} from "./Stock.ts";
import {Signal} from "signal-polyfill";

/**
 * A computed signal that holds the keys of the data returned by the `dataSource`.
 */
export const exchangeData = new Signal.Computed(() => Object.keys(dataSource.get()));
