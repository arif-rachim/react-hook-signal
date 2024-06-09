import {CSSProperties} from "react";
import {ComponentConfig} from "./ComponentLibrary.tsx";
import {AnySignal} from "../../../../dist";

export interface Component {
    style: CSSProperties,
    id: string,
    parent: string,
    children: string[],
    componentType: keyof (typeof ComponentConfig),
    events: {
        onClick?: EventType
    }
}

export interface EventType {
    signalDependencies: string[],
    mutableSignals: string[],
    formula: string,
    name: string,
}

export interface LabelComponent extends Component {
    label: string
}

export interface FormulaValue{
    name:string,
    formula:string,
    signalDependencies: string[]

}

export interface InputComponent extends LabelComponent {
    value: FormulaValue,
    errorMessage: FormulaValue,
    name: string,
    events: LabelComponent['events'] & {
        onChange?: EventType
    }
}

interface Signal {
    id: string,
    name: string,
    type: unknown
}

export interface SignalState extends Signal {
    type: 'State',
    formula: string,
}

export interface SignalComputed extends Signal {
    type: 'Computed',
    signalDependencies: string[],
    formula: string,
}

export interface SignalEffect extends Signal {
    type: 'Effect'
    signalDependencies: string[],
    mutableSignals: string[],
    formula: string,
}


export type AnySignalType = SignalState | SignalComputed | SignalEffect;


export interface View {
    id: string,
    name: string,
    description: string,
    tag: string[],
    components: Component[],
    signals: AnySignalType[]
}

export type SignalStateContextData = Array<{ signal: AnySignal<unknown>, type: AnySignalType }>