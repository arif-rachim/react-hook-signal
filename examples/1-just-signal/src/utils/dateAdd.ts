/**
 * Adds a specified number of days to a Date object or date string.
 * @param {Date | string} date - The Date object or date string to which to add days.
 * @param {number} days - The number of days to add.
 * @returns {Date} A new Date object representing the result of adding days to the input date.
 */
export function dateAdd(date: Date | string, days: number): Date {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}
