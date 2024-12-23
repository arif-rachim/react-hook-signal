import {Signal} from "signal-polyfill";
import {Container, Page} from "../../../../AppDesigner.tsx";
import {guid} from "../../../../../utils/guid.ts";
import {dropZones} from "../drop-zone/dropZones.ts";
import {useUpdatePageSignal} from "../../../../hooks/useUpdatePageSignal.ts";

/**
 * Adds a new container to the list of all containers.
 */
export function addNewContainer(allContainersSignal: Signal.Computed<Array<Container>>, config: {
    type: 'vertical' | 'horizontal' | string
}, dropZoneId: Signal.State<string>, updatePage: ReturnType<typeof useUpdatePageSignal>) {
    const {parentContainerId, insertionIndex} = getContainerIdAndIndexToPlaced(allContainersSignal, dropZoneId);
    const type = config.type;
    const properties = {};

    const newContainer: Container = {
        id: guid(),
        type: type,
        children: [],
        parent: parentContainerId,
        properties: properties
    }
    const newAllContainers = [...allContainersSignal.get().map(n => {
        if (n.id === parentContainerId) {
            if (insertionIndex >= 0) {
                const newChildren = [...n.children]
                newChildren.splice(insertionIndex + 1, 0, newContainer.id);
                return {...n, children: newChildren}
            } else {
                return {...n, children: [newContainer.id, ...n.children]}
            }
        }
        return n;
    }), newContainer];
    updatePage({type: 'container', containers: newAllContainers});
}

export function addPageElement(page: Page, allContainersSignal: Signal.Computed<Array<Container>>, dropZoneId: Signal.State<string>, updatePage: ReturnType<typeof useUpdatePageSignal>) {
    const {parentContainerId, insertionIndex} = getContainerIdAndIndexToPlaced(allContainersSignal, dropZoneId);
    const type = 'element';
    const properties = {
        component: {
            formula: `module.exports = "${page.id}"`
        },
        properties: {
            formula: `module.exports = {}`
        }
    };

    const newContainer: Container = {
        id: guid(),
        type: type,
        children: [],
        parent: parentContainerId,
        properties: properties
    }
    const newAllContainers = [...allContainersSignal.get().map(n => {
        if (n.id === parentContainerId) {
            if (insertionIndex >= 0) {
                const newChildren = [...n.children]
                newChildren.splice(insertionIndex + 1, 0, newContainer.id);
                return {...n, children: newChildren}
            } else {
                return {...n, children: [newContainer.id, ...n.children]}
            }
        }
        return n;
    }), newContainer];
    updatePage({type: 'container', containers: newAllContainers});
}


/**
 * Returns the container ID and insertion index for placing a container in a drop zone.
 */
function getContainerIdAndIndexToPlaced(allContainersSignal: Signal.Computed<Array<Container>>, dropZoneId: Signal.State<string>) {
    const dropZoneElementId = dropZoneId.get();
    const dropZoneElement = document.getElementById(dropZoneElementId);
    if (dropZoneElement === null) {
        return {parentContainerId: '', insertionIndex: 0};
    }
    const {parentContainerId, precedingSiblingId} = dropZones.find(s => s.id === dropZoneElementId)!;
    const container = allContainersSignal.get().find(i => i.id === parentContainerId);
    const insertionIndex = container?.children.indexOf(precedingSiblingId ?? '') ?? 0;
    return {parentContainerId, insertionIndex};
}