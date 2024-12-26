export function wrapWithZObjectIfNeeded(text: string) {
    text = (text ?? '').trim();
    if (text.includes('module.exports')) {
        text = text.replace('module.exports', '').trim();
    }
    if (text.startsWith('=')) {
        text = text.substring(1, text.length).trim();
    }
    if (text.startsWith('{') && text.endsWith('}')) {
        return `z.object(${text})`;
    }
    return text;
}