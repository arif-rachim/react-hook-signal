import {Signal} from "signal-polyfill";
import {Container} from "../AppDesigner.tsx";
import {dropZones} from "../panels/design/dropZones.ts";
import {useUpdatePageSignal} from "../../../core/hooks/useUpdatePageSignal.ts";

/**
 * Swaps the location of a container within a list of containers based on the provided parameters.
 */
export function swapContainerLocation(allContainersSignal: Signal.Computed<Array<Container>>, containerToBeSwapped: string, activeDropZoneIdSignal: Signal.State<string>, updatePage: ReturnType<typeof useUpdatePageSignal>) {
    const activeDropZoneId = activeDropZoneIdSignal.get();
    const dropZoneElement = document.getElementById(activeDropZoneId);
    if (dropZoneElement === null) {
        return;
    }
    const {precedingSiblingId, parentContainerId} = dropZones.find(s => s.id === activeDropZoneId)!;
    const allContainers = [...allContainersSignal.get()];
    const targetContainerIndex = allContainers.findIndex(i => i.id === containerToBeSwapped)!;
    const targetContainer = allContainers[targetContainerIndex];
    const currentParentContainerIndex = allContainers.findIndex(i => i.id === targetContainer.parent)!;
    const currentParentContainer = allContainers[currentParentContainerIndex];
    const newParentContainerIndex = allContainers.findIndex(i => i.id === parentContainerId)!;
    const newParentContainer = allContainers[newParentContainerIndex];

    // here we remove the parent children position
    currentParentContainer.children = currentParentContainer.children.filter(s => s !== targetContainer.id);
    // now we have new parent
    targetContainer.parent = parentContainerId;
    const placeAfterIndex = newParentContainer.children.indexOf(precedingSiblingId);

    if (placeAfterIndex >= 0) {
        newParentContainer.children.splice(placeAfterIndex + 1, 0, containerToBeSwapped);
        newParentContainer.children = [...newParentContainer.children];
    } else {
        newParentContainer.children.unshift(containerToBeSwapped);
    }

    allContainers.splice(targetContainerIndex, 1, {...targetContainer});
    allContainers.splice(currentParentContainerIndex, 1, {...currentParentContainer});
    allContainers.splice(newParentContainerIndex, 1, {...newParentContainer});
    updatePage({type: 'container', containers: allContainers});
    activeDropZoneIdSignal.set('');
}
