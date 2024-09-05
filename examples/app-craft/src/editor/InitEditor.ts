import {loader} from "@monaco-editor/react";

import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import signalDefinition from "./signal-definition.txt?raw";
import zodDefinition from "./zod-definition.txt?raw";

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    },
};

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

monaco.languages.typescript.javascriptDefaults.addExtraLib(signalDefinition, "ts:filename/signal-source.d.ts");
monaco.languages.typescript.javascriptDefaults.addExtraLib(zodDefinition, "ts:filename/zod-source.d.ts");

monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems(model, position) {
        const word = model.getWordUntilPosition(position)
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        }
        return {
            suggestions: [
                {
                    label: 'SELECT',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'SELECT',
                    range: range
                },
                {
                    label: 'FROM',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'FROM',
                    range: range
                },
                {
                    label: 'WHERE',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'WHERE',
                    range: range
                }
            ]
        }
    }
})
monaco.languages.setLanguageConfiguration('sql', {
    comments: {
        lineComment: '--',
        blockComment: ['/*', '*/']
    },
    brackets: [
        ['(', ')'],
        ['[', ']']
    ],
    autoClosingPairs: [
        {open: '(', close: ')'},
        {open: '[', close: ']'}
    ]
})

loader.config({monaco});
loader.init();