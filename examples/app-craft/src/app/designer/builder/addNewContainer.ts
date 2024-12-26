import {Signal} from "signal-polyfill";
import {Container, Page} from "../AppDesigner.tsx";
import {guid} from "../../../core/utils/guid.ts";
import {dropZones} from "../panels/design/dropZones.ts";
import {useUpdatePageSignal} from "../../../core/hooks/useUpdatePageSignal.ts";

export function addNewContainer(allContainersSignal: Signal.Computed<Array<Container>>, config: {
    type: 'vertical' | 'horizontal' | string
}, dropZoneId: Signal.State<string>, updatePage: ReturnType<typeof useUpdatePageSignal>) {
    const type = config.type;
    const properties = {};
    addContainer(allContainersSignal, type, properties, dropZoneId, updatePage);
}

export function addPageElement(page: Page, allContainersSignal: Signal.Computed<Array<Container>>, dropZoneId: Signal.State<string>, updatePage: ReturnType<typeof useUpdatePageSignal>) {
    const type = 'element';
    const properties = {
        component: {
            formula: `module.exports = "${page.id}"`
        },
        properties: {
            formula: `module.exports = {}`
        }
    };
    addContainer(allContainersSignal, type, properties, dropZoneId, updatePage);
}

function addContainer(allContainersSignal: Signal.Computed<Array<Container>>, type: string, properties: Container['properties'], dropZoneId: Signal.State<string>, updatePage: ReturnType<typeof useUpdatePageSignal>) {
    const {parentContainerId, insertionIndex} = getContainerIdAndIndexToPlaced(allContainersSignal, dropZoneId);
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