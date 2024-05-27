import {CSSProperties} from "react";
import {ComponentConfig} from "./ComponentLibrary.tsx";

export interface Component {
    style: CSSProperties,
    id: string,
    parent: string,
    children: string[],
    componentType: keyof (typeof ComponentConfig),
    signals: Array<AnySignalType>
}

export interface LabelComponent extends Component {
    label: string
}

export interface InputComponent extends LabelComponent {
    value: unknown,
    errorMessage: string,
    name: string
}
interface Signal{
    id: string,
    name: string,
}
export interface SignalState extends Signal{
    type: 'State',
    valueType: "number" | "string" | "boolean" | "Record" | "Array",
    value: unknown,
    privacy: 'private' | 'inheritable'
}

export interface SignalComputed extends Signal{
    type: 'Computed',
    valueType: number | string | boolean | Record<string, unknown> | Array<unknown>,
    dependencySignals: string[],
    formula: string,
    privacy: 'private' | 'inheritable'
}

export interface SignalEffect extends Signal{
    type: 'Effect'
    dependencySignals: string[],
    formula: string,
}

export type AnySignalType = SignalState | SignalComputed | SignalEffect