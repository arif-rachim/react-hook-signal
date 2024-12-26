import {Fetcher} from "../../AppDesigner.tsx";
import {useUpdatePageSignal} from "../../../../core/hooks/useUpdatePageSignal.ts";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {useUpdateApplication} from "../../../../core/hooks/useUpdateApplication.ts";

export function useUpdateFetcher(scope: 'page' | 'application') {
    const {allPageFetchersSignal, allApplicationFetchersSignal} = useAppContext();
    const updatePage = useUpdatePageSignal();
    const updateApplication = useUpdateApplication();
    return function updateFetcher(fetcher: Fetcher) {
        const fetchers = scope === 'page' ? [...allPageFetchersSignal.get()] : [...allApplicationFetchersSignal.get()];
        const indexOfVariable = fetchers.findIndex(i => i.id === fetcher.id);
        if (indexOfVariable >= 0) {
            fetchers.splice(indexOfVariable, 1, {...fetcher});
        } else {
            fetchers.push({...fetcher});
        }
        if (scope === 'page') {
            updatePage({type: 'fetcher', fetchers: fetchers});
        } else {
            updateApplication(original => {
                original.fetchers = fetchers
            })
        }
    }
}