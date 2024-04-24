const pad = (d: number) => d <= 0 ? '00' : ((d <= 9 ? `0` : '') + d);
const month = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function ddMMMyyyy(date?: Date | string): string {
    if (date === undefined ) {
        return '';
    }
    if (typeof date === 'string') {
        date = new Date(date)
    }

    return `${pad(date.getDate())}-${month[date.getMonth()]}-${date.getFullYear()}`
}

export function hhmm(date?: Date | string): string {
    if (date === undefined) {
        return '';
    }
    if (typeof date === 'string') {
        date = new Date(date)
    }
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function hhmmss(date?: Date | string): string {
    if (date === undefined) {
        return '';
    }
    if (typeof date === 'string') {
        date = new Date(date)
    }
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function ddMMMyyyyhhmm(date?: Date | string): string {
    if (date === undefined) {
        return '';
    }
    if (typeof date === 'string') {
        date = new Date(date)
    }
    return `${ddMMMyyyy(date)} ${hhmm(date)}`
}

export function yyyyMMdd(date?: Date | string) {
    if (date === undefined) {
        return '';
    }
    if (typeof date === 'string') {
        date = new Date(date)
    }
    if (isNaN(date.getTime())) {
        return ''
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Format the date as "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
}