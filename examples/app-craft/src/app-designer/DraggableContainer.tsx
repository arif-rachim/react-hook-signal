import {Signal} from "signal-polyfill";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {
    CSSProperties,
    type DragEvent as ReactDragEvent,
    HTMLAttributes,
    type MouseEvent as ReactMouseEvent,
    ReactNode,
    useContext,
    useEffect,
    useState
} from "react";
import {useRefresh} from "../utils/useRefresh.ts";
import {Container} from "./AppDesigner.tsx";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {guid} from "../utils/guid.ts";
import {dropZones} from "./dropZones.ts";
import {DropZone} from "./DropZone.tsx";
import {RenderContainer} from "./RenderContainer.tsx";
import {BORDER} from "./Border.ts";

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

const FEATHER = 5;

/**
 * DraggableContainer is a component used to display containers that can be dragged and dropped within a design interface.
 */
export function DraggableContainer(props: {
    allContainersSignal: Signal.State<Array<Container>>,
    container: Container
}) {
    const {container: containerProp, allContainersSignal} = props;
    const containerSignal = useSignal(containerProp);
    const [elements,setElements] = useState<ReactNode[]>([]);
    const [computedStyle,setComputedStyle] = useState<CSSProperties>({})
    useEffect(() => {
        containerSignal.set(containerProp);
    }, [containerSignal, containerProp]);
    const {
        elements: elementsLib,
        activeDropZoneIdSignal,
        hoveredDragContainerIdSignal,
        selectedDragContainerIdSignal,
        uiDisplayModeSignal
    } = useContext(AppDesignerContext);
    const {refresh} = useRefresh('DraggableContainer');
    useSignalEffect(() => {
        uiDisplayModeSignal.get();
        refresh();
    })
    const mousePosition = useSignal<{
        clientX?: number,
        clientY?: number
    }>({clientX: 0, clientY: 0})

    function onDragStart(event: ReactDragEvent) {
        event.stopPropagation();
        event.dataTransfer.setData('text/plain', containerSignal.get().id);
    }

    function onDragOver(event: ReactDragEvent) {
        event.preventDefault();
        event.stopPropagation();
        mousePosition.set(event);
    }

    function onMouseOver(event: ReactMouseEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();
        hoveredDragContainerIdSignal.set(containerSignal.get()?.id);
    }

    useSignalEffect(() => {
        const {clientX: mouseX, clientY: mouseY} = mousePosition.get();
        const container: Container | undefined = containerSignal.get();
        if (mouseX === undefined || mouseY === undefined || mouseX <= 0 || mouseY <= 0) {
            return;
        }
        let nearestDropZoneId = '';
        // const elementsSize:Record<string, DOMRect> = {};
        for (const dropZone of dropZones) {
            const dropZoneElement = document.getElementById(dropZone.id);
            const rect = dropZoneElement?.getBoundingClientRect();
            if (rect === undefined) {
                continue;
            }

            if (mouseX >= (rect.left - FEATHER) && mouseX <= (rect.right + FEATHER) && mouseY >= (rect.top - FEATHER) && mouseY <= (rect.bottom + FEATHER)) {
                nearestDropZoneId = dropZone.id;
            }
        }
        if (nearestDropZoneId === '') {
            const nearestDropZone = {distance: Number.MAX_VALUE, dropZoneId: ''}
            for (const dropZone of dropZones) {
                if (dropZone.parentContainerId === container?.id) {
                    // nice !
                    const rect = document.getElementById(dropZone.id)?.getBoundingClientRect();
                    if (rect === undefined) {
                        continue;
                    }
                    const distanceX = Math.abs(mouseX - (rect.left + (rect.width / 2)));
                    const distanceY = Math.abs(mouseY - (rect.top + (rect.height / 2)));
                    const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
                    if (distance < nearestDropZone.distance) {
                        nearestDropZone.distance = distance;
                        nearestDropZone.dropZoneId = dropZone.id;
                    }
                }
            }
            nearestDropZoneId = nearestDropZone.dropZoneId;
        }
        activeDropZoneIdSignal.set(nearestDropZoneId);
    })

    function onDrop(event: ReactDragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const id = event.dataTransfer.getData('text');
        const keys = Object.keys(elementsLib);
        if (id === VERTICAL || id === HORIZONTAL || keys.indexOf(id) >= 0) {
            addNewContainer(allContainersSignal, {type: id}, activeDropZoneIdSignal);
        } else if (id) {
            swapContainerLocation(allContainersSignal, id, activeDropZoneIdSignal);
        }
    }

    function onDragEnd() {
        activeDropZoneIdSignal.set('');
        selectedDragContainerIdSignal.set('');
    }

    function onSelected(event: ReactMouseEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();
        selectedDragContainerIdSignal.set(containerSignal.get().id);
        activeDropZoneIdSignal.set('');
    }

    useSignalEffect(() => {
        const mode = uiDisplayModeSignal.get();
        const container: Container | undefined = containerSignal.get();
        const children = container?.children ?? [];

        const isContainer = container?.type === 'vertical' || container?.type === 'horizontal'
        const result: Array<ReactNode> = [];
        if (isContainer) {
            if (mode === 'design') {
                result.push(<DropZone precedingSiblingId={''} key={`drop-zone-root-${container?.id}`}
                                      parentContainerId={container?.id ?? ''}/>)
            }
            for (let i = 0; i < children?.length; i++) {
                const childId = children[i];
                const childContainer = allContainersSignal.get().find(i => i.id === childId)!;
                result.push(<DraggableContainer allContainersSignal={allContainersSignal} container={childContainer}
                                                key={childId}/>)
                if (mode === 'design') {
                    result.push(<DropZone precedingSiblingId={childId} key={`drop-zone-${i}-${container?.id}`}
                                          parentContainerId={container?.id ?? ''}/>);
                }
            }
        } else if (elementsLib[container?.type]) {
            result.push(<RenderContainer key={container?.id} container={container} />)
        }
        setElements(result);
    });


    useSignalEffect(() => {
        const mode = uiDisplayModeSignal.get();
        const container: Container = containerSignal.get();
        const isRoot = container?.parent === '';
        const styleFromSignal = {
            border: mode === 'design' ? BORDER : '1px solid rgba(0,0,0,0.5)',
            background: 'white',
            minWidth: container?.minWidth,
            minHeight: container?.minHeight,

            paddingTop: mode === 'design' && container?.paddingTop === '' ? 5 : container?.paddingTop,
            paddingRight: mode === 'design' && container?.paddingRight === '' ? 5 : container?.paddingRight,
            paddingBottom: mode === 'design' && container?.paddingBottom === '' ? 5 : container?.paddingBottom,
            paddingLeft: mode === 'design' && container?.paddingLeft === '' ? 5 : container?.paddingLeft,

            marginTop: container?.marginTop,
            marginRight: container?.marginRight,
            marginBottom: container?.marginBottom,
            marginLeft: container?.marginLeft,

            display: 'flex',
            flexDirection: container?.type === 'horizontal' ? 'row' : 'column',
            width: isRoot ? '100%' : container?.width,
            height: isRoot ? '100%' : container?.height,
            position: 'relative',

            gap: container?.gap,
        };
        const isFocused = selectedDragContainerIdSignal.get() === container?.id;
        const isHovered = hoveredDragContainerIdSignal.get() === container?.id;
        if (isRoot) {
            setComputedStyle(styleFromSignal as CSSProperties)
            return;
        }
        if (isFocused && mode === 'design') {
            styleFromSignal.border = BORDER;
            styleFromSignal.background = 'rgba(14,255,242,0.3)';
        }

        if (isHovered && mode === 'design' && !isFocused) {
            styleFromSignal.background = 'rgba(14,255,242,0.1)';
        }
        setComputedStyle(styleFromSignal as CSSProperties)
    });
    const elementProps:(HTMLAttributes<HTMLElement> & {['data-element-id']:string}) = {
        draggable:true,
        style:computedStyle,
        onDragStart,
        onDragOver,
        onDrop,
        onDragEnd,
        onMouseOver,
        onClick:onSelected,
        ['data-element-id'] : props.container?.id
    };
    return <div {...elementProps}>
        {elements}
    </div>

}


/**
 * Adds a new container to the list of all containers.
 */
function addNewContainer(allContainersSignal: Signal.State<Array<Container>>, config: {
    type: 'vertical' | 'horizontal' | string
}, dropZoneId: Signal.State<string>) {
    const {parentContainerId, insertionIndex} = getContainerIdAndIndexToPlaced(allContainersSignal, dropZoneId);
    const newContainer: Container = {
        id: guid(),
        type: config.type,
        gap: 0,
        children: [],
        parent: parentContainerId,
        width: '',
        height: '',
        minWidth: '24px',
        minHeight: '24px',

        paddingTop: '',
        paddingRight: '',
        paddingBottom: '',
        paddingLeft: '',

        marginTop: '',
        marginRight: '',
        marginBottom: '',
        marginLeft: '',
        properties: {}
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
    allContainersSignal.set(newAllContainers);
}

/**
 * Swaps the location of a container within a list of containers based on the provided parameters.
 */
function swapContainerLocation(allContainersSignal: Signal.State<Array<Container>>, containerToBeSwapped: string, activeDropZoneIdSignal: Signal.State<string>) {
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
    allContainersSignal.set(allContainers);
    activeDropZoneIdSignal.set('');
}

/**
 * Returns the container ID and insertion index for placing a container in a drop zone.
 *
 * @returns {object} - An object containing the parent container ID and the insertion index.
 * - parentContainerId: The ID of the parent container.
 * - insertionIndex: The index where the container should be inserted.
 * If the drop zone element is not found, an empty string for parentContainerId and 0 for insertionIndex are returned.
 */
function getContainerIdAndIndexToPlaced(allContainersSignal: Signal.State<Array<Container>>, dropZoneId: Signal.State<string>) {
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