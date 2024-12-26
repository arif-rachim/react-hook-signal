import sqlite from "../../app/designer/panels/database/sqlite.ts";
import {getTables} from "../../app/designer/panels/database/getTables.ts";
import {useUpdateApplication} from "./useUpdateApplication.ts";

export function useSaveSqlLite() {
    const updateApplication = useUpdateApplication();
    return async function saveSqlLite(data: ArrayBuffer) {
        const result = await sqlite({type: 'saveToFile', binaryArray: new Uint8Array(data)})
        if (!result.errors) {
            const result = await getTables();
            updateApplication(old => {
                old.tables = result;
            })
        }
    }
}