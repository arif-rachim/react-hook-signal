import {Fetcher} from "../AppDesigner.tsx";
import {useUpdatePageSignal} from "./useUpdatePageSignal.ts";
import {useAppContext} from "./useAppContext.ts";

export function useUpdateFetcher() {
    const {allPageFetchersSignal} = useAppContext();
    const updatePage = useUpdatePageSignal();
    return function updateFetcher(fetcher: Fetcher) {
        const fetchers = [...allPageFetchersSignal.get()];
        const indexOfFetcher = fetchers.findIndex(i => i.id === fetcher.id);
        if (indexOfFetcher >= 0) {
            fetchers.splice(indexOfFetcher, 1, {...fetcher});
        } else {
            fetchers.push({...fetcher});
        }
        updatePage({type: 'fetcher', fetchers: fetchers});
    }
}