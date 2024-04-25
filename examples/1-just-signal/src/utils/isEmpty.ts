/**
 * Checks if a value is empty or not.
 * @param {unknown} value - The value to be checked.
 * @returns {boolean} true if the value is empty, otherwise false.
 */
export function isEmpty(value: unknown): boolean {
    return value === undefined || value === null || value === '' || value.toString().trim() === '';
}
