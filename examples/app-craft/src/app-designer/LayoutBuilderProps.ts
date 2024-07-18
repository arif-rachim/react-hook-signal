import {IconType} from "react-icons";
import type {FC as ReactFC} from "react";
import {Container, Variable} from "./AppDesigner.tsx";

/**
 * Represents the props for the LayoutBuilder component.
 */
export type LayoutBuilderProps = {
    elements: Record<string, {
        icon: IconType,
        component: ReactFC,
        property: Record<string, ValueCallbackType>
    }>,
    value: { containers: Array<Container>, variables: Array<Variable> },
    onChange: (param: { containers: Array<Container>, variables: Array<Variable> }) => void
}

/**
 * Represents a type that can be either 'value' or 'callback'.
 */
export type ValueCallbackType = 'value' | 'callback';