import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {Container} from "../AppDesigner.tsx";

/**
 * A hook that returns a function to update the selected drag container.
 *
 * const updateSelectedDragContainer = useUpdateSelectedDragContainer();
 * updateSelectedDragContainer((selectedContainer) => {
 *   // Update the selected container
 * });
 */
export function useUpdateSelectedDragContainer() {
    const {selectedDragContainerIdSignal} = useContext(AppDesignerContext);
    const updateDragContainer = useUpdateDragContainer();
    return function update(callback: (selectedContainer: Container) => void) {
        return updateDragContainer(selectedDragContainerIdSignal.get(),callback);
    }
}

/**
 * Allows updating a drag container in the AppDesignerContext.
 */
export function useUpdateDragContainer(){
    const { allContainersSignal} = useContext(AppDesignerContext);

    return function update(containerId:string,callback: (selectedContainer: Container) => void) {
        const allContainers = [...allContainersSignal.get()];
        const currentSignalIndex = allContainers.findIndex(i => i.id === containerId);
        const container = {...allContainers[currentSignalIndex]};
        callback(container);
        allContainers.splice(currentSignalIndex, 1, container);
        allContainersSignal.set(allContainers);
    }
}