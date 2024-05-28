import {createContext} from "react";
import {Signal} from "signal-polyfill";
import {AnySignalType, Component} from "./Component.ts";

export const ComponentContext = createContext<{
    components: Signal.State<Component[]>,
    signals: Signal.State<AnySignalType[]>,
    focusedComponent: Signal.State<Component | undefined>
} | undefined>(undefined);

