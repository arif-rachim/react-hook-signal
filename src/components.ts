import React, {ComponentType, createElement, FC, FunctionComponent, JSX, PropsWithChildren, useState} from "react"
import {useComputed, useSignalEffect} from "./hooks.ts";

/**
 * Type representing a function returning a value.
 */
export type Lambda<T> = () => T;

/**
 * Type representing a value that can be a lambda, a signal, or a normal value.
 */
export type Computable<T> = Lambda<T> | AnySignal<T> | T;

/**
 * Props where the value of each property can be a lambda, a signal, or a normal value.
 */
export type ComputableProps<T> = {
    [K in keyof T]: K extends `on${string}` ? T[K] : Computable<T[K]>;
};

/**
 * Type representing HTML notifiable components.
 */
export type HtmlNotifiableComponents = {
    [K in keyof JSX.IntrinsicElements]: FunctionComponent<ComputableProps<InferAttribute<JSX.IntrinsicElements[K]>>>;
};

type InferAttribute<T> = T extends React.DetailedHTMLProps<infer V,unknown> ? (V & {ref?:unknown}): never;

/**
 * Props for notifiable components.
 */
type NotifiableProps<T extends object> = PropsToComputable<T> & HandlerPropsToAppend<T>;

/**
 * Type representing any signal.
 */
export type AnySignal<T> = { get(): T };

/**
 * Function that converts props to computable.
 */
type PropsToComputable<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T as T[K] extends (((...args: any[]) => any) | undefined) ? never : K extends 'key' ? never : K]: Computable<T[K]>;
}

/**
 * Function that appends 'Handler' to handler props.
 */
type HandlerPropsToAppend<T> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [K in keyof T as T[K] extends (((...args: any[]) => any) | undefined) ? K extends string ? `${K}Handler` : never : never]: T[K];
}

/**
 * Type representing a signal or a lambda.
 */
type SignalLambdaNormal = 'signal' | 'lambda' | 'normal'

/**
 * Checks if a value is of a specific type.
 */
function isOfType<T extends SignalLambdaNormal>(attributeName: string, value: unknown, type: T): value is InferIsOfType<T> {
    if (type === "signal") {
        return value !== void 0 && value !== null && typeof value === "object" && "get" in value;
    }
    if (type === "lambda") {
        return !attributeName.endsWith("Handler") && value !== void 0 && value !== null && typeof value === "function";
    }
    return true;
}

/**
 * Infer the type of value based on SignalLambdaNormal type.
 */
type InferIsOfType<T extends SignalLambdaNormal> = T extends 'signal' ? AnySignal<unknown> : T extends 'lambda' ? Lambda<unknown> : unknown

/**
 * Infer the value type based on the key.
 */
type InferSignalLambdaValue<T, Key> = Key extends `${string}Handler` ? T : T extends Lambda<infer A> ? A : T extends AnySignal<infer B> ? B : T;

/**
 * Removes the 'Handler' suffix from a string.
 */
function removeHandler(val: string): string {
    return val.endsWith('Handler') ? val.slice(0, -'Handler'.length) : val;
}

/**
 * Proxy object for generating notifiable HTML elements.
 */
export const notifiable: HtmlNotifiableComponents = new Proxy<Partial<HtmlNotifiableComponents>>({}, {

    get: function (target, symbol) {
        const prop = symbol as keyof HtmlNotifiableComponents;
        if (prop in target && target[prop] !== undefined) {
            return target[prop];
        }
        Reflect.set(target, prop, createNotifiableHtmlElement(prop));
        return target[prop];
    },
}) as HtmlNotifiableComponents;

/**
 * Creates a notifiable HTML element component.
 */
function createNotifiableHtmlElement<K extends keyof JSX.IntrinsicElements>(key: K) {

    function HtmlElement(props: JSX.IntrinsicElements[K]) {
        return createElement(key, props)
    }

    const NotifiableHtmlElement = React.memo(React.forwardRef(function NotifiableHtmlElement(props: ComputableProps<Parameters<typeof HtmlElement>[0]>,ref) {
        let notifiableProps = {} as NotifiableProps<Parameters<typeof HtmlElement>[0]>;
        for (const [key, value] of Object.entries(props)) {
            notifiableProps = {...notifiableProps, [key.startsWith("on") ? `${key}Handler` : key]: value}
        }
        return Notifiable({component: HtmlElement, _element: true,ref, ...notifiableProps})
    }))
    NotifiableHtmlElement.displayName = key;
    return NotifiableHtmlElement;
}

/**
 * Filters props based on the specified type.
 */
function filterPropsByType<P>(props: P, type: SignalLambdaNormal): Partial<{ [Key in keyof P]: InferSignalLambdaValue<P[Key], Key>; }> {

    return Object.entries(props!).reduce(function mapPropsByType(acc, [key, value]) {
        if (type === 'lambda' && isOfType(key, value, 'lambda')) {
            return {...acc, [key]: value.call(undefined)}
        }
        if (type === 'signal' && isOfType(key, value, 'signal')) {
            return {...acc, [key]: value.get()}
        }
        if (type === 'normal' && isOfType(key, value, 'normal')) {
            return {...acc, [removeHandler(key)]: value}
        }
        return acc;
    }, {} as Partial<{ [Key in keyof P]: InferSignalLambdaValue<P[Key], Key> }>)
}

/**
 * Creates a notifiable React component.
 */
export function Notifiable<T extends object>(propsWithComponent: {
    component: ComponentType<T>} & NotifiableProps<T>): React.ReactNode {
    type PropsWithComponentType = typeof propsWithComponent & {_element?:boolean}
    const {component,_element, ...props} = propsWithComponent as PropsWithComponentType;
    const normalProps = filterPropsByType(props, "normal");
    const [signalProps, setSignalProps] = useState(() => filterPropsByType(props, "signal"));
    useSignalEffect(() => setSignalProps(filterPropsByType(props, "signal")));
    const lambdaPropsSignal = useComputed(() => filterPropsByType(props, "lambda"));
    const [lambdaProps, setLambdaProps] = useState(() => lambdaPropsSignal.get());
    useSignalEffect(() => setLambdaProps(lambdaPropsSignal.get()));

    const mergedProps = { ...normalProps, ...signalProps, ...lambdaProps } as PropsWithChildren<T> & {_element?:boolean};
    const children = mergedProps && "children" in mergedProps ? mergedProps.children : void 0;

    if (_element) {
        delete mergedProps._element;
        return (component as FC)(mergedProps);
    } else {
        return createElement(component, mergedProps, children);
    }
}