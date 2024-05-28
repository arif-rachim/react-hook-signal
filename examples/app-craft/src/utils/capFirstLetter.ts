export function capFirstLetter(value:string){
    if(value.length === 0) return value;
    return value.charAt(0).toUpperCase()+value.slice(1);
}

export function lowFirstLetter(value:string){
    if(value.length === 0) return value;
    return value.charAt(0).toLowerCase()+value.slice(1);
}