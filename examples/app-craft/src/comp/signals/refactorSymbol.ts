import * as monaco from "monaco-editor";

export function refactorSymbol(
    code: string,
    oldSymbol: string,
    newSymbol: string
): string {
    const model = monaco.editor.createModel(code, 'javascript');
    const wordSeparators = ' .,;~`!@#$%^&*()+=[]{}|\\\'"<>/?\n\r\t';
    const matches = model.findMatches(oldSymbol, false, false, true, wordSeparators, true);

    matches.forEach(match => {
        const range = match.range;
        model.applyEdits([
            {
                range: range,
                text: newSymbol,
            },
        ]);
    });

    const newCode = model.getValue();
    model.dispose(); // Dispose of the temporary model
    return newCode;
}