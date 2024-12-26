import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {useUpdatePageSignal} from "../../../../core/hooks/useUpdatePageSignal.ts";
import {useUpdateApplication} from "../../../../core/hooks/useUpdateApplication.ts";
import {Query} from "../database/getTables.ts";

export function useUpdateQueries(scope: 'page' | 'application') {
    const {allPageQueriesSignal, allApplicationQueriesSignal} = useAppContext();
    const updatePage = useUpdatePageSignal();
    const updateApplication = useUpdateApplication();
    return function updateQuery(query: Query) {
        const queries = scope === 'page' ? [...allPageQueriesSignal.get()] : [...allApplicationQueriesSignal.get()];
        const indexOfVariable = queries.findIndex(i => i.id === query.id);
        if (indexOfVariable >= 0) {
            queries.splice(indexOfVariable, 1, {...query});
        } else {
            queries.push({...query});
        }
        if (scope === 'page') {
            updatePage({type: 'query', queries: queries});
        } else {
            updateApplication(original => {
                original.queries = queries
            })
        }
    }
}