export function dateAdd(date:Date|string,days:number){
    if (typeof date === 'string') {
        date = new Date(date)
    }
    return new Date(date.getFullYear(),date.getMonth(),date.getDate() + days)
}