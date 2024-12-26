/**
 * Generates a random GUID (Globally Unique Identifier).
 * @returns {string} A randomly generated GUID.
 */
export function guid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function uniqueNumber(): number {
    return parseInt(guid().replace(/-/g,''),16)
}