import type {BindParams, Database, SqlValue} from "sql.js";
const defaultFileName = 'database.db';
const log = (...args) => console.log(...args)

interface SaveToOPFS {
    type: 'saveToFile',
    binaryArray: Uint8Array,
    fileName?: string
}

interface DeleteFromOPFS {
    type: 'deleteFromFile',
    fileName?: string
}

interface LoadFromOPFS {
    type: 'loadFromFile',
    fileName?: string
}

interface ExecuteQuery {
    type: 'executeQuery',
    query: string,
    params?: BindParams,
    fileName?: string
}

type Payload = SaveToOPFS | LoadFromOPFS | ExecuteQuery | DeleteFromOPFS;

export default async function sqlite(payload: Payload): Promise<{ success: boolean, value?: unknown }> {
    if (payload.type === 'saveToFile') {
        const result = await saveToOPFS({
            binaryArray: payload.binaryArray,
            fileName: payload.fileName ?? defaultFileName
        });
        return {value: undefined, success: result.success}
    }
    if (payload.type === 'loadFromFile') {
        const result = await loadFromOPFS({fileName: payload.fileName ?? defaultFileName});
        return {value: result.data, success: result.success}
    }
    if (payload.type === 'executeQuery') {
        const result = await executeQuery({
            fileName: payload.fileName ?? defaultFileName,
            query: payload.query,
            params: payload.params
        });
        return {value: {columns: result.columns, values: result.values}, success: result.success}
    }
    if (payload.type === 'deleteFromFile') {
        const result = await deleteFromOPFS({fileName: payload.fileName ?? defaultFileName});
        return {value: result.data, success: result.success}
    }
    return {success: false, value: 'Unable to identify payload type'}
}

async function saveToOPFS({binaryArray, fileName}: {
    binaryArray: Uint8Array,
    fileName: string
}): Promise<{
    success: boolean
}> {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(fileName, {create: true});
    const writeableStream = await fileHandle.createWritable();
    await writeableStream.write(binaryArray);
    await writeableStream.close();
    return {success: true}
}

async function loadFromOPFS({fileName}: { fileName: string }): Promise<{ success: boolean, data?: Uint8Array }> {
    log('[OPFS]Loading', fileName);
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();
    log('[OPFS]Succesfully loading', fileName);
    return {data: new Uint8Array(arrayBuffer), success: true};
}

async function deleteFromOPFS({fileName}: { fileName: string }): Promise<{ success: boolean, data: string }> {
    log('[OPFS]Removing', fileName);
    const root = await navigator.storage.getDirectory();
    try {
        log('[OPFS]Removing entry', fileName);
        await root.removeEntry(fileName, {recursive: true});
        log('[OPFS]Succesfully removing', fileName);
        return {data: '', success: true};
    } catch (e: unknown) {
        let message = '';
        if (e !== undefined && e !== null && typeof e === 'object' && 'message' in e) {
            message = e.message as string;
        }
        return {data: message, success: false};
    }

}

const database: Record<string, Database> = {};
const initSqlJs = self['initSqlJs'];

async function getDatabase(fileName: string) {
    let db: Database | undefined = undefined;
    if (fileName in database) {
        db = database[fileName];
    } else {
        try {
            const {data, success} = await loadFromOPFS({fileName})
            if (success) {
                log('[DB]opening db', fileName);
                const SQL = await initSqlJs({
                    locateFile: file => `${file}`
                });
                log('[DB]opening db success', fileName);
                db = new SQL.Database(data);
                Object.assign(database,{[fileName]:db});
            }
        } catch (error) {
            log(error);
        }
    }
    return db;
}

async function executeQuery({query, params, fileName}: {
    query: string,
    params?: BindParams,
    fileName: string
}): Promise<{
    success: boolean,
    columns: string[],
    values: SqlValue[][]
}> {
    log('[ExecuteQuery]', query)
    let db = await getDatabase(fileName);
    if (db !== undefined) {
        log('[ExecuteQuery] invoking ', query)
        const result = db.exec(query, params);
        const {columns, values} = result.pop()!;
        log('[ExecuteQuery] result ', values.length, 'records')
        return {
            success: true,
            columns,
            values
        }
    }
    return {
        success: false,
        columns: [],
        values: []
    }
}
