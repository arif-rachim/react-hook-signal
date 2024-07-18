import {useContext} from "react";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {Container} from "./AppDesigner.tsx";

/**
 * A hook that returns a function to update the selected drag container.
 *
 * const updateSelectedDragContainer = useUpdateSelectedDragContainer();
 * updateSelectedDragContainer((selectedContainer) => {
 *   // Update the selected container
 * });
 */
export function useUpdateSelectedDragContainer() {
    const {selectedDragContainerIdSignal, allContainersSignal} = useContext(AppDesignerContext);

    return function update(callback: (selectedContainer: Container) => void) {
        const allContainers = [...allContainersSignal.get()];
        const currentSignalIndex = allContainers.findIndex(i => i.id === selectedDragContainerIdSignal.get());
        const container = {...allContainers[currentSignalIndex]};
        callback(container);
        allContainers.splice(currentSignalIndex, 1, container);
        allContainersSignal.set(allContainers);
    }
}