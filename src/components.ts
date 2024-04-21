import React, {ComponentType, createElement, JSX, PropsWithChildren, useState} from "react"
import {useSignal, useSignalEffect} from "./hooks.ts";

/**
 * Type representing a function returning a value.
 * @template T The type of value returned by the function.
 */
export type Lambda<T> = () => T;

/**
 * Type ensuring that the value is not undefined.
 * @template T The type to ensure is not undefined.
 */
export type Definite<T> = T extends undefined ? never : T;

/**
 * Type representing a value that can be a lambda, a signal, or a normal value.
 * @template T The type of the value.
 */
export type Computable<T> = Lambda<T> | AnySignal<T> | T;

/**
 * Props where the value of each property can be a lambda, a signal, or a normal value.
 * @template T The type of the props object.
 */
export type ComputableProps<T> = {
    [K in keyof T]: K extends `on${string}` ? T[K] : K extends 'key' ? T[K] : Computable<Definite<T[K]>>;
};

/**
 * Type representing HTML notifiable components.
 */
export type HtmlNotifiableComponents = {
    [K in keyof JSX.IntrinsicElements]: ComponentType<ComputableProps<JSX.IntrinsicElements[K]>>;
};

/**
 * Props for notifiable components.
 * @template T The type of the component props.
 */
type NotifiableProps<T extends object> = PropsToComputable<T> & HandlerPropsToAppend<T>;

/**
 * Type representing any signal.
 * @template T The type of value returned by the signal.
 */
export type AnySignal<T> = { get(): T };

/**
 * Function that converts props to computable.
 */
type PropsToComputable<T> = {
    [K in keyof T as T[K] extends (...args: unknown[]) => unknown ? never : K extends 'key' ? never : K]: Computable<T[K]>;
}

/**
 * Function that appends 'Handler' to handler props.
 */
type HandlerPropsToAppend<T> = {
    [K in keyof T as T[K] extends (...args: unknown[]) => unknown ? K extends string ? `${K}Handler` : never : never]: T[K];
}

/**
 * Type representing a signal or a lambda.
 */
type SignalLambdaNormal = 'signal' | 'lambda' | 'normal'

/**
 * Checks if a value is of a specific type.
 * @param {string} attributeName The name of the attribute.
 * @param {unknown} value The value to check.
 * @param {SignalLambdaNormal} type The type to check against.
 * @returns {boolean} True if the value is of the specified type, otherwise false.
 */
function isOfType<T extends SignalLambdaNormal>(attributeName: string, value: unknown, type: T): value is InferIsOfType<T> {
    switch (type) {
        case "signal":
            return value !== undefined && value !== null && typeof value === 'object' && 'get' in value
        case "lambda":
            return !attributeName.endsWith('Handler') && value !== undefined && value !== null && typeof value === 'function'
        default :
            return true
    }
}

/**
 * Infer the type of value based on SignalLambdaNormal type.
 * @template T The type of the value.
 * @template Key The type of the key.
 */
type InferIsOfType<T extends SignalLambdaNormal> = T extends 'signal' ? AnySignal<unknown> : T extends 'lambda' ? Lambda<unknown> : unknown

/**
 * Infer the value type based on the key.
 * @template T The type of the value.
 * @template Key The type of the key.
 */
type InferSignalLambdaValue<T, Key> = Key extends `${string}Handler` ? T : T extends Lambda<infer A> ? A : T extends AnySignal<infer B> ? B : T;

/**
 * Removes the 'Handler' suffix from a string.
 * @param {string} val The string to remove the suffix from.
 * @returns {string} The string without the 'Handler' suffix.
 */
function removeHandler(val: string): string {
    return val.endsWith('Handler') ? val.slice(0, -'Handler'.length) : val;
}

/**
 * Proxy object for generating notifiable HTML elements.
 * @type {HtmlNotifiableComponents}
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
 * @param {keyof JSX.IntrinsicElements} key The key representing the HTML element type.
 * @returns {React.FC<ComputableProps<JSX.IntrinsicElements[K]>>} The notifiable HTML element component.
 * @template K The type of the HTML element.
 */
function createNotifiableHtmlElement<K extends keyof JSX.IntrinsicElements>(key: K): React.FC<ComputableProps<JSX.IntrinsicElements[K]>> {

    function HtmlElement(props: JSX.IntrinsicElements[K]) {
        return createElement(key, props)
    }

    const NotifiableHtmlElement = React.memo(function NotifiableHtmlElement(props: ComputableProps<Parameters<typeof HtmlElement>[0]>) {
        let notifiableProps = {} as NotifiableProps<Parameters<typeof HtmlElement>[0]>;
        for (const [key, value] of Object.entries(props)) {
            notifiableProps = {...notifiableProps, [key.startsWith("on") ? `${key}Handler` : key]: value}
        }
        return Notifiable({component: HtmlElement, componentRenderStrategy: 'functionCall', ...notifiableProps})
    })
    NotifiableHtmlElement.displayName = `n.${key}`
    return NotifiableHtmlElement;
}

/**
 * Filters props based on the specified type.
 * @param {P} props The props object to filter.
 * @param {SignalLambdaNormal} type The type to filter by.
 * @returns {Partial<{[Key in keyof P]: InferSignalLambdaValue<P[Key], Key>}>} The filtered props object.
 * @template P The type of the props object.
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
 * @param {object} propsWithComponent The props object containing the component and its props.
 * @param {ComponentType<T>} propsWithComponent.component The component type.
 * @param {'functionCall' | 'createElement'} [propsWithComponent.componentRenderStrategy] The rendering strategy.
 * @returns {React.ReactNode} The rendered notifiable component.
 * @template T The type of the component props.
 */
export function Notifiable<T extends object>(propsWithComponent: {
    component: ComponentType<T>,
    componentRenderStrategy?: 'functionCall' | 'createElement'
} & NotifiableProps<T>): React.ReactNode {
    const {component, componentRenderStrategy, ...props} = propsWithComponent;

    const normalProps = filterPropsByType<typeof props>(props, 'normal');

    const [signalProps, setSignalProps] = useState(function initialSignalProps() {
        return filterPropsByType(props, 'signal')
    });

    useSignalEffect(function updateSignalProps() {
        return setSignalProps(filterPropsByType(props, 'signal'))
    })

    const lambdaPropsSignal = useSignal(function updateLambdaProps() {
        return filterPropsByType(props, 'lambda');
    })

    const [lambdaProps, setLambdaProps] = useState(function initialLambdaProps() {
        return lambdaPropsSignal.get()
    });

    useSignalEffect(function whenLambdaPropsChanged() {
        return setLambdaProps(lambdaPropsSignal.get())
    })

    const mergedProps = ({...normalProps, ...signalProps, ...lambdaProps}) as PropsWithChildren<T>

    const children = (mergedProps && 'children' in mergedProps ? mergedProps.children : undefined);

    if (isFunctionalComponent(component) && componentRenderStrategy === 'functionCall') {
        return component(mergedProps)
    } else {
        return createElement(component as ComponentType, mergedProps, children);
    }
}

/**
 * Checks if a value is a functional component.
 * @param {unknown} value The value to check.
 * @returns {value is React.FC} True if the value is a functional component, otherwise false.
 */
function isFunctionalComponent(value: unknown): value is React.FC {
    return value !== undefined && value !== null && typeof value === 'function'
}