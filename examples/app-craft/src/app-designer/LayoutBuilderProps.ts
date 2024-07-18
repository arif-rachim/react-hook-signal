import {IconType} from "react-icons";
import type {FC as ReactFC} from "react";
import {Container, Variable} from "./AppDesigner.tsx";
import {z, ZodType} from "zod";

/**
 * Represents the props for the LayoutBuilder component.
 */
export type LayoutBuilderProps = {
    elements: Record<string, Element>,
    value: { containers: Array<Container>, variables: Array<Variable> },
    onChange: (param: { containers: Array<Container>, variables: Array<Variable> }) => void
}

const ValueType = ['string', 'number', 'bigint', 'boolean', 'date', 'array', 'any'] as const;

export type ValueCallbackType = typeof ValueType[number];


// InferType will use the TypeMap to infer the actual types
type InferType<T extends ZodType> = {
    [k in keyof z.infer<T>]: z.infer<T>[k];
};

interface Element<T extends ZodType = ZodType> {
    icon: IconType,
    component: ReactFC<InferType<T>>,
    property: T
}

export function element<T extends ZodType>(props: {
    property: T,
    icon: IconType,
    component: ReactFC<InferType<T>>
}) {
    return props
}

