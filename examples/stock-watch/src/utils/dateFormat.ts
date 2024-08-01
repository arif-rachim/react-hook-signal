/**
 * Pads a number with leading zeros if necessary.
 * @param {number} d - The number to pad.
 * @returns {string} The padded number as a string.
 */
const pad = (d: number): string => d <= 9 ? `0${d}` : `${d}`;
const monthsAbbreviated = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * Converts a date string or Date object to a Date object.
 * @param {Date | string} date - The date string or Date object.
 * @returns {Date | undefined} The Date object, or undefined if invalid input.
 */
function toDate(date?: Date | string): Date | undefined {
    if (!date) return;
    return typeof date === 'string' ? new Date(date) : date;
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
 * Formats a Date object as "DD-MMM-YYYY".
 * @param {Date | string} param - The Date object or date string.
 * @returns {string} The formatted date string.
 */
export function format_ddMMM(param?: Date | string): string {
    const date = toDate(param);
    if(date === undefined){
        return '';
    }
    const day = pad(date.getDate());
    const monthAbbrev = monthsAbbreviated[date.getMonth()];
    return `${day} ${monthAbbrev}`;
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
