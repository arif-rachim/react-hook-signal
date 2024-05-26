import {
    ForwardRefExoticComponent,
    MutableRefObject,
    PropsWithChildren,
    RefAttributes,
    useEffect,
    useState
} from "react";
import {ListContextData} from "../types.ts";
import {InferContextRef} from "../createResponsiveList.tsx";
import {delay} from "../../utils/delay.ts";
import {ListContext} from "../ListContext.ts";

export function ListContextProvider<V extends RefAttributes<ListContextData<unknown, unknown, unknown, unknown, unknown> | null>, List extends ForwardRefExoticComponent<V>>(props: PropsWithChildren<{
    listRef: MutableRefObject<InferContextRef<List>>
}>) {
    const listRef = props.listRef;
    const [context, setContext] = useState(listRef.current);
    useEffect(() => {
        let exit = false;
        
        async function waitForListToBeMounted() {
            if (listRef.current === null && !exit) {
                await delay(100);
                return waitForListToBeMounted()
            }
        }

        (async () => {
            await waitForListToBeMounted();
            if (exit) {
                return;
            }
            setContext(listRef.current);
        })();
        return () => {
            exit = true
        }
    }, [listRef]);
    const contextValue = context as ListContextData<unknown, unknown, unknown, unknown, unknown> | undefined;
    return <ListContext.Provider value={contextValue}>
        {props.children}
    </ListContext.Provider>
}
