export function isEmpty(value: unknown) {
    return value === undefined || value === null || value === '' || value.toString().trim() === '';
}