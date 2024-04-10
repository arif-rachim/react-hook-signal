import React, {ComponentType, createElement, JSX, PropsWithChildren, useState} from "react"
import {useSignal, useSignalEffect} from "./hooks.ts";

export type Lambda<T> = () => T
export type Definite<T> = T extends undefined ? never : T;
export type Computable<T> = Lambda<T> | AnySignal<T> | T

export type ComputableProps<T> = {
    [K in keyof T]: K extends `on${string}` ? T[K] : K extends 'key' ? T[K] : Computable<Definite<T[K]>>
}

export type InferPropsParameter<K extends typeof supportedHTMLTags[number]> = JSX.IntrinsicElements[K];

export type HtmlNotifiableComponents = {
    [K in keyof JSX.IntrinsicElements]: ComponentType<ComputableProps<InferPropsParameter<K>>>;
};

export type AnySignal<T> = { get(): T }

const supportedHTMLTags = [
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "big",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "keygen",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "menu",
    "menuitem",
    "meta",
    "meter",
    "nav",
    "noindex",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "param",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "search",
    "slot",
    "script",
    "section",
    "select",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "template",
    "tbody",
    "td",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
    "webview",
    "svg",
    "animate",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "defs",
    "desc",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "foreignObject",
    "g",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "set",
    "stop",
    "switch",
    "symbol",
    "text",
    "textPath",
    "tspan",
    "use",
    "view"
] as const;

type SignalLambdaNormal = 'signal' | 'lambda' | 'normal'

function isOfType<T extends SignalLambdaNormal>(attributeName: string, value: unknown, type: T): value is InferIsOfType<T> {
    switch (type) {
        case "signal":
            return value !== undefined && value !== null && typeof value === 'object' && 'get' in value
        case "lambda":
            return !attributeName.startsWith('on') && value !== undefined && value !== null && typeof value === 'function'
        case "normal":
            return true
        default :
            return false
    }
}

type InferIsOfType<T extends SignalLambdaNormal> = T extends 'signal' ? AnySignal<unknown> : T extends 'lambda' ? Lambda<unknown> : unknown

type InferSignalLambdaValue<T, Key> = Key extends `on${string}` ? T : T extends Lambda<infer A> ? A : T extends AnySignal<infer B> ? B : T;

function filterPropsByType<P>(props: P, type: SignalLambdaNormal) {
    return Object.entries(props!).reduce(function mapPropsByType(acc, [key, value]) {
        if (type === 'lambda' && isOfType(key, value, 'lambda')) {
            return {...acc, [key]: value.call(undefined)}
        }
        if (type === 'signal' && isOfType(key, value, 'signal')) {
            return {...acc, [key]: value.get()}
        }
        if (type === 'normal' && isOfType(key, value, 'normal')) {
            return {...acc, [key]: value}
        }
        return acc;
    }, {} as Partial<{ [Key in keyof P]: InferSignalLambdaValue<P[Key], Key> }>)
}

export const notifiable = supportedHTMLTags.reduce(function mapToNotifiableComponent(signal, key) {
    return {...signal, [key]: createNotifiableHtmlElement(key)};
}, {}) as HtmlNotifiableComponents;


function createNotifiableHtmlElement<K extends keyof JSX.IntrinsicElements>(key: K) {

    function HtmlElement(props: JSX.IntrinsicElements[K]) {
        return createElement(key, props)
    }

    const NotifiableHtmlElement = React.memo(function NotifiableHtmlElement(props: ComputableProps<Parameters<typeof HtmlElement>[0]>) {
        return Notifiable({component: HtmlElement,componentRenderStrategy:'functionCall', ...props})
    })
    NotifiableHtmlElement.displayName = `n.${key}`
    return NotifiableHtmlElement;
}


export function Notifiable<T extends object>(propsWithComponent: { component: ComponentType<T>,componentRenderStrategy?:'functionCall'|'createElement' } & ComputableProps<T>) {
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