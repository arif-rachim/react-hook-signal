import React, {ComponentType, createElement, JSX, PropsWithChildren, useState} from "react"
import {useSignal, useSignalEffect} from "./hooks.ts";

export type Lambda<T> = () => T
export type Definite<T> = T extends undefined ? never : T;
export type Computable<T> = Lambda<T> | AnySignal<T> | T

export type ComputableProps<T> = {
    [K in keyof T]: K extends `on${string}` ? T[K] : K extends 'key' ? T[K] : Computable<Definite<T[K]>>
}

export type InferPropsParameter<K extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[K];

export type HtmlNotifiableComponents = {
    [K in keyof JSX.IntrinsicElements]: ComponentType<ComputableProps<InferPropsParameter<K>>>;
};

// this is for Notifiable
type PropsToComputable<T> = {
    [K in keyof T as T[K] extends (...args:unknown[]) => unknown ? never : K extends 'key' ? never : K]: Computable<T[K]>;
}

type HandlerPropsToAppend<T> = {
    [K in keyof T as T[K] extends (...args:unknown[]) => unknown ? K extends string ? `${K}Handler` : never : never]: T[K];
}
type NotifiableProps<T extends object> = PropsToComputable<T> & HandlerPropsToAppend<T>

export type AnySignal<T> = { get(): T }

type SignalLambdaNormal = 'signal' | 'lambda' | 'normal'

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

type InferIsOfType<T extends SignalLambdaNormal> = T extends 'signal' ? AnySignal<unknown> : T extends 'lambda' ? Lambda<unknown> : unknown

type InferSignalLambdaValue<T, Key> = Key extends `${string}Handler` ? T : T extends Lambda<infer A> ? A : T extends AnySignal<infer B> ? B : T;

function filterPropsByType<P>(props: P, type: SignalLambdaNormal) {
    return Object.entries(props!).reduce(function mapPropsByType(acc, [key, value]) {
        if (type === 'lambda' && isOfType(key, value, 'lambda')) {
            return {...acc, [key]: value.call(undefined)}
        }
        if (type === 'signal' && isOfType(key, value, 'signal')) {
            return {...acc, [key]: value.get()}
        }
        if (type === 'normal' && isOfType(key, value, 'normal')) {
            return {...acc, [key.endsWith('Handler') ? key.slice(0,-'Handler'.length) : key]: value}
        }
        return acc;
    }, {} as Partial<{ [Key in keyof P]: InferSignalLambdaValue<P[Key], Key> }>)
}

export const notifiable = new Proxy<Partial<HtmlNotifiableComponents>>({}, {
    get: function(target, symbol) {
        const prop = symbol as keyof HtmlNotifiableComponents;
        if(prop in target && target[prop] !== undefined){
            return target[prop];
        }
        Reflect.set(target,prop,createNotifiableHtmlElement(prop));
        return target[prop];
    },
}) as HtmlNotifiableComponents;

function createNotifiableHtmlElement<K extends keyof JSX.IntrinsicElements>(key: K) {

    function HtmlElement(props: JSX.IntrinsicElements[K]) {
        return createElement(key, props)
    }

    const NotifiableHtmlElement = React.memo(function NotifiableHtmlElement(props: ComputableProps<Parameters<typeof HtmlElement>[0]>) {

        const notifiableProps = Object.entries(props).reduce((result,[key,value]) => {
            return {...result,[key.startsWith('on') ? `${key}Handler`:key] : value}
        },{} ) as NotifiableProps<Parameters<typeof HtmlElement>[0]>;

        return Notifiable({component: HtmlElement,componentRenderStrategy:'functionCall', ...notifiableProps})
    })
    NotifiableHtmlElement.displayName = `n.${key}`
    return NotifiableHtmlElement;
}

export function Notifiable<T extends object>(propsWithComponent: { component: ComponentType<T>,componentRenderStrategy?:'functionCall'|'createElement' } & NotifiableProps<T>) {
    const {component,componentRenderStrategy, ...props} = propsWithComponent;

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

    if(isFunctionalComponent(component) && componentRenderStrategy === 'functionCall'){
        return component(mergedProps)
    }else{
        return createElement(component as ComponentType, mergedProps, children);
    }
}

function isFunctionalComponent(value:unknown):value is React.FC{
    return value !== undefined && value !== null && typeof value === 'function'
}