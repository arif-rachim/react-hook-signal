import {useSignal, useSignalEffect} from "react-hook-signal";
import {CSSProperties, useContext, useEffect, useState} from "react";
import {useRefresh} from "../../../../core/hooks/useRefresh.ts";
import {Container} from "../../AppDesigner.tsx";
import {dropZones} from "./dropZones.ts";
import {ElementRenderer} from "./ElementRenderer.tsx";
import {BasicDragEvent, CancellableEvent, ElementProps} from "../../LayoutBuilderProps.ts";
import {ContainerRendererIdContext} from "./ContainerRenderer.tsx";
import {addNewContainer, addPageElement} from "../../builder/addNewContainer.ts";
import {swapContainerLocation} from "../../builder/swapContainerLocation.ts";
import {useUpdatePageSignal} from "../../../../core/hooks/useUpdatePageSignal.ts";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {isEmpty} from "../../../../core/utils/isEmpty.ts";
import {dragElementCloneDragImage} from "../../builder/dragElementCloneDragImage.ts";

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

const FEATHER = 5;


/**
 * DraggableContainer is a component used to display containers that can be dragged and dropped within a design interface.
 */
export function DraggableContainerElement(props: { container: Container }) {
    const {container: containerProp} = props;
    const containerSignal = useSignal(containerProp);
    const updatePage = useUpdatePageSignal();
    const [computedStyle, setComputedStyle] = useState<CSSProperties>({});
    useEffect(() => {
        containerSignal.set(containerProp);
    }, [containerSignal, containerProp]);
    const {
        elements: elementsLib,
        activeDropZoneIdSignal,
        hoveredDragContainerIdSignal,
        selectedDragContainerIdSignal,
        uiDisplayModeSignal,
        allContainersSignal,
        allPagesSignal
    } = useAppContext<AppDesignerContext>();
    const {refresh} = useRefresh('DraggableContainer');
    useSignalEffect(() => {
        uiDisplayModeSignal.get();
        refresh();
    })
    const mousePosition = useSignal<{
        clientX?: number,
        clientY?: number
    }>({clientX: 0, clientY: 0}, {equals: (t, t2) => t.clientY === t2.clientY && t.clientX === t2.clientX})
    const parentContainerId = useContext(ContainerRendererIdContext);
    useSignalEffect(() => {
        mousePosition.get();
        // we will have a mechanism to set the hovered drag container delayed before finally chose it
        const isContainer = containerSignal.get()?.type === 'container';
        const nextHoveredDragContainerId = (isContainer ? containerSignal.get()?.id : parentContainerId) ?? '';
        hoveredDragContainerIdSignal.set(nextHoveredDragContainerId);
    })

    function onDragStart(event: BasicDragEvent) {
        event.stopPropagation();
        if (event.dataTransfer === undefined || event.dataTransfer === null) {
            return;
        }
        event.dataTransfer.setData('text/plain', containerSignal.get().id);
        const dragElement = document.querySelector(`[data-element-id="${props.container?.id}"]`);
        dragElementCloneDragImage({dragElement, event});
    }

    function onDragOver(event: BasicDragEvent) {
        event.stopPropagation()
        event.preventDefault();
        mousePosition.set(event);
    }

    function onDrop(event: BasicDragEvent) {
        event.stopPropagation();
        event.preventDefault();
        if (event.dataTransfer === null || event.dataTransfer === undefined) {
            return;
        }
        const id = event.dataTransfer.getData('text');
        const keys = Object.keys(elementsLib as Record<string, unknown>);
        const page = allPagesSignal.get().find(p => p.id === id);
        if (page !== undefined) {
            addPageElement(page, allContainersSignal, activeDropZoneIdSignal, updatePage);
        } else if (id === VERTICAL || id === HORIZONTAL || keys.indexOf(id) >= 0) {
            addNewContainer(allContainersSignal, {type: id}, activeDropZoneIdSignal, updatePage);
        } else if (id) {
            swapContainerLocation(allContainersSignal, id, activeDropZoneIdSignal, updatePage);
        }
        setTimeout(onDragEnd, 0);
    }

    function onDragEnd() {
        activeDropZoneIdSignal.set('');
        selectedDragContainerIdSignal.set('');
        hoveredDragContainerIdSignal.set('');
    }

    function onSelected(event: CancellableEvent) {
        const mode = uiDisplayModeSignal.get();
        if (mode === 'design') {
            event.preventDefault();
            event.stopPropagation();
            onDragEnd();
            const containerId = containerSignal.get().id;
            selectedDragContainerIdSignal.set(containerId);
        }
    }

    function onMouseOver(event: CancellableEvent) {
        event.preventDefault();
        event.stopPropagation();
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

    useSignalEffect(() => {
        const mode = uiDisplayModeSignal.get();
        const container: Container | undefined = containerSignal.get();
        const isFocused = selectedDragContainerIdSignal.get() === container?.id;
        const isHovered = hoveredDragContainerIdSignal.get() === container?.id;
        const isRoot = isEmpty(container?.parent);
        const styleFromSignal: CSSProperties = {
            minWidth: container?.properties?.defaultStyle?.minWidth ?? 24,
            minHeight: container?.properties?.defaultStyle?.minHeight ?? 24,

            paddingTop: container?.properties?.defaultStyle?.paddingTop ?? 0,
            paddingRight: container?.properties?.defaultStyle?.paddingRight ?? 0,
            paddingBottom: container?.properties?.defaultStyle?.paddingBottom ?? 0,
            paddingLeft: container?.properties?.defaultStyle?.paddingLeft ?? 0,

            marginTop: container?.properties?.defaultStyle?.marginTop,
            marginRight: container?.properties?.defaultStyle?.marginRight,
            marginBottom: container?.properties?.defaultStyle?.marginBottom,
            marginLeft: container?.properties?.defaultStyle?.marginLeft,

            display: 'flex',
            flexDirection: container?.properties?.defaultStyle?.flexDirection ?? 'column',
            width: isRoot ? '100%' : container?.properties?.defaultStyle?.width,
            height: isRoot ? '100%' : container?.properties?.defaultStyle?.height,
            position: 'relative',
            gap: container?.properties?.defaultStyle?.gap ?? 0,
            alignItems: container?.properties?.defaultStyle?.alignItems,
            justifyContent: container?.properties?.defaultStyle?.justifyContent,
        };

        if (isRoot) {
            setComputedStyle(styleFromSignal as CSSProperties)
            return;
        }
        if (isFocused && mode === 'design') {
            styleFromSignal.background = 'rgba(14,255,242,0.3)';
        }

        if (isHovered && mode === 'design' && !isFocused) {
            styleFromSignal.background = 'rgba(14,255,242,0.1)';
        }

        setComputedStyle(styleFromSignal as CSSProperties)
    });

    const elementProps: ElementProps = {
        draggable: true,
        style: computedStyle,
        onDragStart,
        onDragOver,
        onDrop,
        onDragEnd,
        onMouseOver,
        onClick: onSelected,
        container: props.container,
        ['data-element-id']: props.container?.id
    };
    return <ElementRenderer container={containerProp} elementProps={elementProps}/>
}