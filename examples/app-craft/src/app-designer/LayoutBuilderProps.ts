import {IconType} from "react-icons";
import {CSSProperties, ForwardRefRenderFunction} from "react";
import {Page} from "./AppDesigner.tsx";
import {z, ZodRawShape} from "zod";

/**
 * Represents the props for the LayoutBuilder component.
 */
export type LayoutBuilderProps = {
    elements: Record<string, Element>,
    value: Array<Page>,
    onChange: (param: Array<Page>) => void
}

// InferType will use the TypeMap to infer the actual types
type InferType<T extends ZodRawShape> = {
    [k in keyof T]: z.infer<T[k]>;
};
export type CancellableEvent = { stopPropagation: () => void, preventDefault: () => void };
export type BasicDragEvent = CancellableEvent & { dataTransfer: DataTransfer | null, clientX: number, clientY: number };
export type ElementProps = {
    draggable: boolean,
    style: CSSProperties,
    onDragStart: (event: BasicDragEvent) => void,
    onDragOver: (event: BasicDragEvent) => void,
    onDrop: (event: BasicDragEvent) => void,
    onDragEnd: (event: BasicDragEvent) => void,
    onMouseOver: (event: CancellableEvent) => void,
    onClick: (event: CancellableEvent) => void,
    ['data-element-id']: string
}

interface Element<T extends ZodRawShape = ZodRawShape> {
    icon: IconType,
    // eslint-disable-next-line
    component: ForwardRefRenderFunction<HTMLElement, (InferType<T> & { style: CSSProperties })>,
    property: T
}

export function element<T extends ZodRawShape>(props: {
    property: T,
    icon: IconType,
    // eslint-disable-next-line
    component: ForwardRefRenderFunction<HTMLElement, (InferType<T> & { style: CSSProperties })>,
    // eslint-disable-next-line
}): any {
    return props;
}