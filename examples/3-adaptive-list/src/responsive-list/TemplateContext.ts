import {createContext} from "react";
import {TemplateContextData} from "./types.ts";

/**
 * Create a context for a row in a table.
 */
export const TemplateContext = createContext<TemplateContextData<unknown>|undefined>(undefined);
