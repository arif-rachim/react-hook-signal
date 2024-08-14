export function mapTableInfoTypeToTs(param:string){
    const type = param.toLowerCase();
    if(type.includes('char')){
        return 'string';
    }
    if(type.includes('binary')){
        return 'Uint8Array';
    }
    if(type.includes('int')){
        return 'number';
    }
    if(type.includes('float')){
        return 'number';
    }
    if(type.includes('double')){
        return 'number';
    }
    if(type.includes('decimal')){
        return 'number';
    }
    if(type.includes('numeric')){
        return 'number';
    }
    if(type.includes('date')){
        return 'string';
    }
    if(type.includes('time')){
        return 'string';
    }
    if(type.includes('year')){
        return 'string';
    }
    if(type.includes('bool')){
        return 'number';
    }
    if(type.includes('real')){
        return 'number';
    }
    if(type.includes('blob')){
        return 'Uint8Array';
    }
    if(type.includes('text')){
        return 'string';
    }
    if(type === ""){
        return 'string';
    }
    throw new Error('Unable to map [' + type + ']');
}