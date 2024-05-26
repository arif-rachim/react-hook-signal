import {createContext} from "react";
import {ViewContextData} from "./types.ts";

/**
 * Context variable for a list component.
 */
export const ViewContext = createContext<ViewContextData|undefined>(undefined)