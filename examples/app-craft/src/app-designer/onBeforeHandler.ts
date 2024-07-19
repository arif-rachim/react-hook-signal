import {Monaco} from "@monaco-editor/react";
import {Variable} from "./AppDesigner.tsx";
import {ZodType} from "zod";
import {printNode, zodToTs} from "zod-to-ts";
import zodDefinition from "./zod-definition.txt?raw";

/**
 * Executes the onBeforeMountHandler function.
 */
export const onBeforeMountHandler = (props: {
    allVariables: Array<Variable>,
    dependencies: Array<string>,
    returnType:ZodType
}) => (monaco: Monaco) => {
    const {allVariables, dependencies,returnType} = props;

    const composedLibrary = allVariables.filter(i => dependencies.includes(i.id)).map(i => {
        let type = `Signal.State<any>`;
        if (i.type === 'computed') {
            type = 'Signal.Computed<any>'
        }
        return `declare const ${i.name}:${type}`
    }).join('\n');
    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
    });

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true,
    });
    // extra libraries
    monaco.languages.typescript.javascriptDefaults.addExtraLib(zodDefinition, "ts:filename/zod-source.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(signalSource(printNode(zodToTs(returnType).node)), "ts:filename/signal.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composedLibrary, "ts:filename/local-source.d.ts");
}

const signalSource = (returnType:string) => `
declare const module:{exports:${returnType}};
declare namespace Signal {
    export class State<T> {
        #private;
        readonly [NODE]: SignalNode<T>;
        constructor(initialValue: T, options?: Signal.Options<T>);
        get(): T;
        set(newValue: T): void;
    }
    export class Computed<T> {
        #private;
        readonly [NODE]: ComputedNode<T>;
        constructor(computation: () => T, options?: Signal.Options<T>);
        get(): T;
    }
    type AnySignal<T = any> = State<T> | Computed<T>;
    type AnySink = Computed<any> | subtle.Watcher;
    export namespace subtle {
        function untrack<T>(cb: () => T): T;
        function introspectSources(sink: AnySink): AnySignal[];
        function introspectSinks(signal: AnySignal): AnySink[];
        function hasSinks(signal: AnySignal): boolean;
        function hasSources(signal: AnySink): boolean;
        class Watcher {
            #private;
            readonly [NODE]: ReactiveNode;
            constructor(notify: (this: Watcher) => void);
            watch(...signals: AnySignal[]): void;
            unwatch(...signals: AnySignal[]): void;
            getPending(): Computed<any>[];
        }
        function currentComputed(): Computed<any> | undefined;
        const watched: unique symbol;
        const unwatched: unique symbol;
    }
    export interface Options<T> {
        equals?: (this: AnySignal<T>, t: T, t2: T) => boolean;
        [Signal.subtle.watched]?: (this: AnySignal<T>) => void;
        [Signal.subtle.unwatched]?: (this: AnySignal<T>) => void;
    }
    export {};
}`
