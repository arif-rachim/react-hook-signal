export function mapTableInfoTypeToTs(param: string) {
    const type = param.toLowerCase();
    if (type.includes('char')) {
        return 'z.string().nullable()';
    }
    if (type.includes('binary')) {
        return 'z.any()';
    }
    if (type.includes('int')) {
        return 'z.number().nullable()';
    }
    if (type.includes('float')) {
        return 'z.number().nullable()';
    }
    if (type.includes('double')) {
        return 'z.number().nullable()';
    }
    if (type.includes('decimal')) {
        return 'z.number().nullable()';
    }
    if (type.includes('numeric')) {
        return 'z.number().nullable()';
    }
    if (type.includes('date')) {
        return 'z.string().nullable()';
    }
    if (type.includes('time')) {
        return 'z.string().nullable()';
    }
    if (type.includes('year')) {
        return 'z.string().nullable()';
    }
    if (type.includes('bool')) {
        return 'z.number().nullable()';
    }
    if (type.includes('real')) {
        return 'z.number().nullable()';
    }
    if (type.includes('bit')) {
        return 'z.number().nullable()';
    }
    if (type.includes('blob')) {
        return 'z.any()';
    }
    if (type.includes('text')) {
        return 'z.string().nullable()';
    }
    if (type.includes('uniqueidentifier')) {
        return 'z.string().nullable()';
    }
    if (type === "") {
        return 'z.string().nullable()';
    }

    throw new Error('Unable to map [' + type + ']');
}