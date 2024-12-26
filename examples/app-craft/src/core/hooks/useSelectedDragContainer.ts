import {useComputed} from "react-hook-signal";
import {useAppContext} from "./useAppContext.ts";
import {AppDesignerContext} from "../../app/designer/AppDesignerContext.ts";

/**
 * Retrieves the selected drag container from the AppDesignerContext.
 */
export function useSelectedDragContainer() {
    const {selectedDragContainerIdSignal, allContainersSignal} = useAppContext<AppDesignerContext>();
    return useComputed(() => {
        const selectedDragContainerId = selectedDragContainerIdSignal.get();
        return allContainersSignal.get().find(i => i.id === selectedDragContainerId);
    })
}