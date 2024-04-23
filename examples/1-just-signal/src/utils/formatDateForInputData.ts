export function formatDateForInputDate(date?: Date) {
    // Check if the input is a valid Date object
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return ''
    }

    // Get the year, month, and day from the Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so we add 1 and pad with zero if needed
    const day = String(date.getDate()).padStart(2, '0'); // Pad with zero if needed

    // Format the date as "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
}