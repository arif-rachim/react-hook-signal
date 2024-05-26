import {createContext} from "react";
import {ListContextData} from "./types.ts";

/**
 * Context variable for a list component.
 */
export const ListContext = createContext<ListContextData<unknown,unknown, unknown, unknown,unknown>|undefined>(undefined)
