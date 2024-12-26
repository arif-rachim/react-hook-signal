
const pad = (d: number): string => {
    const a = Math.abs(d);
    return a <= 9 ? `0${a}` : `${a}`
};
const monthsAbbreviated = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function isDdMmmYyyy(value: string) {
    for (const month of monthsAbbreviated) {
        if (value.indexOf(month) > 0) {
            return true;
        }
    }
    return false;
}

export function toDate(date?: unknown): Date | undefined {
    if (date === null || date === undefined || date === '') {
        return undefined;
    }
    if (date instanceof Date) {
        return date
    }
    try {
        if (typeof date === 'string') {
            const dateString = date.toUpperCase();
            if(isDdMmmYyyy(dateString)){
                const [dayString,monthString,yearAndTime] = dateString.split('-')
                const day = parseInt(dayString);
                const month = monthsAbbreviated.indexOf(monthString);
                const year = yearAndTime.length >= '1970'.length ? parseInt(yearAndTime.substring(0, 4)) : 0;
                const hours = yearAndTime.length >= '1970 11'.length ? parseInt(yearAndTime.substring(5, 7)) : 0;
                const minutes = yearAndTime.length >= '1970 11:30'.length ? parseInt(yearAndTime.substring(8, 10)) : 0;
                const seconds = yearAndTime.length >= '1970 11:30:00'.length ? parseInt(yearAndTime.substring(11, 13)) : 0;
                return new Date(year, month, day, hours, minutes, seconds);
            }else{
                const year = dateString.length >= '1970'.length ? parseInt(dateString.substring(0, 4)) : 0;
                const month = dateString.length >= '1970-01'.length ? parseInt(dateString.substring(5, 7)) - 1 : 0;
                const day = dateString.length >= '1970-01-01'.length ? parseInt(dateString.substring(8, 10)) : 0;
                const hours = dateString.length >= '1970-01-01T10'.length ? parseInt(dateString.substring(11, 13)) : 0;
                const minutes = dateString.length >= '1970-01-01T10:10'.length ? parseInt(dateString.substring(14, 16)) : 0;
                const seconds = dateString.length >= '1970-01-01T10:10:11'.length ? parseInt(dateString.substring(17, 19)) : 0;
                return new Date(year, month, day, hours, minutes, seconds);
            }
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

function formatTime(date: Date): string {
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${hours}:${minutes}:${seconds}`;
}

function formatDate(date: Date): string {
    const day = pad(date.getDate());
    const monthAbbrev = monthsAbbreviated[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${monthAbbrev}-${year}`;
}

export function format_ddMMMyyyy(date?: Date | string): string {
    const formattedDate = toDate(date);
    return formattedDate ? formatDate(formattedDate) : '';
}

export function format_hhmm(date?: Date | string): string {
    const formattedDate = toDate(date);
    return formattedDate ? formatTime(formattedDate).substring(0,5) : '';
}

export function format_hhmmss(date?: Date | string): string {
    const formattedDate = toDate(date);
    return formattedDate ? formatTime(formattedDate) : '';
}

export function format_ddMMMyyyy_hhmm(date?: Date | string): string {
    const formattedDate = toDate(date);
    return formattedDate ? `${format_ddMMMyyyy(formattedDate)} ${format_hhmm(formattedDate)}` : '';
}

export function format_yyyyMMdd(date?: Date | string): string {
    const formattedDate = toDate(date);
    if (!formattedDate || isNaN(formattedDate.getTime())) return '';
    const year = formattedDate.getFullYear();
    const month = String(formattedDate.getMonth() + 1).padStart(2, '0');
    const day = String(formattedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
