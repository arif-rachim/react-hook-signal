import {createContext} from "react";
import {RowContextData} from "./types.ts";

/**
 * Create a context for a row in a table.
 */
export const RowContext = createContext<RowContextData<unknown>|undefined>(undefined);
