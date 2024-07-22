import {IconType} from "react-icons";
import {FC as ReactFC, HTMLAttributes} from "react";
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

// InferType will use the TypeMap to infer the actual types
type InferType<T extends ZodType> = {
    [k in keyof z.infer<T>]: z.infer<T>[k];
};

export type ElementProps = Pick<HTMLAttributes<HTMLElement>, 'draggable'|'style'|'onDragStart'|'onDragOver'|'onDrop'|'onDragEnd'|'onMouseOver'|'onClick'> & {['data-element-id']:string}

interface Element<T extends ZodType = ZodType> {
    icon: IconType,
    component: ReactFC<(InferType<T> & {properties:ElementProps})>,
    property: T
}

export function element<T extends ZodType>(props: {
    property: T,
    icon: IconType,
    component: ReactFC<InferType<T> & {properties:ElementProps}>
    // eslint-disable-next-line
}):any {
    return props;
}