import {dataSource} from "./Stock.ts";
import {Signal} from "signal-polyfill";

export const exchange = new Signal.Computed(() => Object.keys(dataSource.get()));
