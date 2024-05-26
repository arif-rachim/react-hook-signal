import {CSSProperties} from "react";
import {ComponentConfig} from "./ComponentLibrary.tsx";

export interface Component {
    style: CSSProperties,
    id: string,
    parent: string,
    children: string[],
    componentType: keyof (typeof ComponentConfig),
}

export interface LabelComponent extends Component{
    label : string
}

export interface InputComponent extends LabelComponent{
    value : unknown,
    errorMessage : string,
    name : string
}