import sqlite from "../../app/designer/panels/database/sqlite.ts";
import {getTables} from "../../app/designer/panels/database/getTables.ts";
import {useUpdateApplication} from "./useUpdateApplication.ts";

export function useDeleteSqlLite() {
    const updateApplication = useUpdateApplication();
    return async function deleteSqlLite() {
        const result = await sqlite({type: 'deleteFromFile'});
        if (!result.errors) {
            const result = await getTables();
            updateApplication(old => {
                old.tables = result;
            });
        }
    }
}