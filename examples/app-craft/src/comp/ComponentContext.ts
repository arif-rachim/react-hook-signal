import {createContext} from "react";
import {Signal} from "signal-polyfill";
import {Component} from "./Component.ts";

export const ComponentContext = createContext<{
    components: Signal.State<Component[]>,
    focusedComponent: Signal.State<Component | undefined>
} | undefined>(undefined);

