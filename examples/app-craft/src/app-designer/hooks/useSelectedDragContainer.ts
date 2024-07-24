import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {useComputed} from "react-hook-signal";

/**
 * Retrieves the selected drag container from the AppDesignerContext.
 */
export function useSelectedDragContainer() {
    const {selectedDragContainerIdSignal, allContainersSignal} = useContext(AppDesignerContext);
    return useComputed(() => {
        const selectedDragContainerId = selectedDragContainerIdSignal.get();
        return allContainersSignal.get().find(i => i.id === selectedDragContainerId);
    })
}