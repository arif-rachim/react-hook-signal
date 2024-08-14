import {IconType} from "react-icons";
import {CSSProperties, ForwardRefRenderFunction, FunctionComponent} from "react";
import {Application} from "./AppDesigner.tsx";
import {z, ZodRawShape} from "zod";

/**
 * Represents the props for the LayoutBuilder component.
 */
export type LayoutBuilderProps = {
    elements?: Record<string, Element>,
    value: Application,
    onChange: (param: Application) => void
}

// InferType will use the TypeMap to infer the actual types
type InferType<T extends ZodRawShape> = {
    [k in keyof T]: z.infer<T[k]>;
};
export type CancellableEvent = { stopPropagation: () => void, preventDefault: () => void };
export type BasicDragEvent = CancellableEvent & { dataTransfer: DataTransfer | null, clientX: number, clientY: number };

export interface ElementStyleProps {
    style: CSSProperties,
    ['data-element-id']: string
}

export interface ElementProps extends ElementStyleProps {
    draggable: boolean,
    onDragStart: (event: BasicDragEvent) => void,
    onDragOver: (event: BasicDragEvent) => void,
    onDrop: (event: BasicDragEvent) => void,
    onDragEnd: (event: BasicDragEvent) => void,
    onMouseOver: (event: CancellableEvent) => void,
    onClick: (event: CancellableEvent) => void,
}

export interface Element<T extends ZodRawShape = ZodRawShape> {
    icon: IconType,
    component: ForwardRefRenderFunction<HTMLElement, (InferType<T> & { style: CSSProperties })>,
    property: T,
    propertyEditor?: {
        [K in keyof T]?: {
            label: string,
            component: FunctionComponent<{ propertyName: string }>
        }
    }
}

export function element<T extends ZodRawShape>(props: {
    property: T,
    propertyEditor?: {
        [K in keyof T]?: {
            label: string,
            component: FunctionComponent<{ propertyName: string }>
        }
    }
    icon: IconType,
    component: ForwardRefRenderFunction<HTMLElement, (InferType<T> & { style: CSSProperties })>,
}): Element<ZodRawShape> {
    return props as Element<ZodRawShape>;
}