import {CSSProperties} from "react";
import {ComponentConfig} from "./ComponentLibrary.tsx";
import {AnySignal} from "../../../../dist";

export interface Component {
    style: CSSProperties,
    id: string,
    parent: string,
    children: string[],
    componentType: keyof (typeof ComponentConfig),
    onClick?: SignalEffect,
}

export interface LabelComponent extends Component {
    label: string
}

export interface InputComponent extends LabelComponent {
    value?: SignalComputed,
    errorMessage?: SignalComputed,
    name: string,
    onChange?: SignalEffect
}

interface Signal {
    id: string,
    name: string,
    formula: string,
}

export interface SignalState extends Signal {
    type: 'State',
}

export interface SignalComputed extends Signal {
    type: 'Computed',
    signalDependencies: string[],
}

export interface SignalEffect extends Signal {
    type: 'Effect'
    signalDependencies: string[],
    mutableSignals: string[],
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