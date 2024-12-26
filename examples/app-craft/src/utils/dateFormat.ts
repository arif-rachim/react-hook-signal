/**
 * Pads a number with leading zeros if necessary.
 * @param {number} d - The number to pad.
 * @returns {string} The padded number as a string.
 */
const pad = (d: number): string => {
    const a = Math.abs(d);
    return a <= 9 ? `0${a}` : `${a}`
};
const monthsAbbreviated = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Converts a date string or Date object to a Date object.
 * @param {unknown} date - The date string or Date object.
 * @returns {Date | undefined} The Date object, or undefined if invalid input.
 */
export function toDate(date?: unknown): Date | undefined {
    if (date === null || date === undefined || date === '') {
        return undefined;
    }
    if (date instanceof Date) {
        return date
    }
    try {
        if (typeof date === 'string' && date.length > 17) {
            const year = parseInt(date.substring(0, 4));
            const month = parseInt(date.substring(5, 2)) - 1;
            const day = parseInt(date.substring(8, 2));
            const hours = parseInt(date.substring(11, 2));
            const minutes = parseInt(date.substring(14, 2));
            const seconds = parseInt(date.substring(17, 2));
            return new Date(year, month, day, hours, minutes, seconds);
        }
    } catch (err) {
        console.error(err);
    }
}

export function dateToString(dateOrString: unknown): string | undefined {
    const date = toDate(dateOrString);
    if (date) {
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }
    return date
}

export function dateAdd(dateOrString: unknown, value: number, type: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): Date | undefined {
    const date = toDate(dateOrString);
    if (date) {
        const year = date.getFullYear() + type === 'year' ? value : 0;
        const month = date.getMonth() + type === 'month' ? value : 0;
        const day = date.getDay() + type === 'day' ? value : 0;
        const hours = date.getHours() + type === 'hour' ? value : 0;
        const minutes = date.getMinutes() + type === 'minute' ? value : 0;
        const seconds = date.getSeconds() + type === 'second' ? value : 0;
        return new Date(year, month, day, hours, minutes, seconds);
    }
}

/**
 * Formats the time part of a Date object as "HH:mm:ss".
 * @param {Date} date - The Date object.
 * @returns {string} The formatted time string.
 */
function formatTime(date: Date): string {
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formats the date part of a Date object as "DD-MMM-YYYY".
 * @param {Date} date - The Date object.
 * @returns {string} The formatted date string.
 */
function formatDate(date: Date): string {
    const day = pad(date.getDate());
    const monthAbbrev = monthsAbbreviated[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${monthAbbrev}-${year}`;
}

/**
 * Formats a Date object as "DD-MMM-YYYY".
 * @param {Date | string} date - The Date object or date string.
 * @returns {string} The formatted date string.
 */
export function format_ddMMMyyyy(date?: Date | string): string {
    const formattedDate = toDate(date);
    return formattedDate ? formatDate(formattedDate) : '';
}

/**
 * Formats the time part of a Date object as "HH:mm".
 * @param {Date | string} date - The Date object or date string.
 * @returns {string} The formatted time string.
 */
export function format_hhmm(date?: Date | string): string {
    const formattedDate = toDate(date);
    return formattedDate ? formatTime(formattedDate) : '';
}

/**
 * Formats the time part of a Date object as "HH:mm:ss".
 * @param {Date | string} date - The Date object or date string.
 * @returns {string} The formatted time string.
 */
export function format_hhmmss(date?: Date | string): string {
    const formattedDate = toDate(date);
    return formattedDate ? formatTime(formattedDate) : '';
}

/**
 * Formats a Date object as "DD-MMM-YYYY HH:mm".
 * @param {Date | string} date - The Date object or date string.
 * @returns {string} The formatted date and time string.
 */
export function format_ddMMMyyyy_hhmm(date?: Date | string): string {
    const formattedDate = toDate(date);
    return formattedDate ? `${format_ddMMMyyyy(formattedDate)} ${format_hhmm(formattedDate)}` : '';
}

/**
 * Formats a Date object as "YYYY-MM-DD".
 * @param {Date | string} date - The Date object or date string.
 * @returns {string} The formatted date string.
 */
export function format_yyyyMMdd(date?: Date | string): string {
    const formattedDate = toDate(date);
    if (!formattedDate || isNaN(formattedDate.getTime())) return '';
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
