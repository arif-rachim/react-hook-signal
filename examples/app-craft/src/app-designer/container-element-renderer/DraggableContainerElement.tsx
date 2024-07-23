import {useSignal, useSignalEffect} from "react-hook-signal";
import {CSSProperties, useContext, useEffect, useState} from "react";
import {useRefresh} from "../../utils/useRefresh.ts";
import {Container} from "../AppDesigner.tsx";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {dropZones} from "../dropZones.ts";
import {ElementRenderer} from "./ElementRenderer.tsx";
import {BORDER} from "../Border.ts";
import {BasicDragEvent, CancellableEvent, ElementProps} from "../LayoutBuilderProps.ts";
import {ContainerRenderer} from "./ContainerRenderer.tsx";
import {addNewContainer} from "./draggable-container-element-tools/addNewContainer.ts";
import {swapContainerLocation} from "./draggable-container-element-tools/swapContainerLocation.ts";

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

const FEATHER = 5;

function justifyContent(container: Container): CSSProperties["justifyContent"] {
    if (container.type === 'vertical') {
        if (container.verticalAlign === 'top') {
            return 'flex-start';
        }
        if (container.verticalAlign === 'center') {
            return 'center';
        }
        if (container.verticalAlign === 'bottom') {
            return 'flex-end';
        }
        if (container.verticalAlign === '') {
            return '';
        }
    }
    if (container.type === 'horizontal') {
        if (container.horizontalAlign === 'left') {
            return 'flex-start';
        }
        if (container.horizontalAlign === 'center') {
            return 'center';
        }
        if (container.horizontalAlign === 'right') {
            return 'flex-end';
        }
        if (container.horizontalAlign === '') {
            return '';
        }
    }
    return ''
}

function alignItems(container: Container): CSSProperties["alignItems"] {
    if (container.type === 'vertical') {
        if (container.horizontalAlign === 'left') {
            return 'flex-start';
        }
        if (container.horizontalAlign === 'center') {
            return 'center';
        }
        if (container.horizontalAlign === 'right') {
            return 'flex-end';
        }
        if (container.horizontalAlign === '') {
            return '';
        }
    }
    if (container.type === 'horizontal') {
        if (container.verticalAlign === 'top') {
            return 'flex-start';
        }
        if (container.verticalAlign === 'center') {
            return 'center';
        }
        if (container.verticalAlign === 'bottom') {
            return 'flex-end';
        }
        if (container.verticalAlign === '') {
            return '';
        }
    }
    return ''
}

/**
 * DraggableContainer is a component used to display containers that can be dragged and dropped within a design interface.
 */
export function DraggableContainerElement(props: { container: Container }) {
    const {container: containerProp} = props;
    const containerSignal = useSignal(containerProp);
    const [computedStyle, setComputedStyle] = useState<CSSProperties>({})
    useEffect(() => {
        containerSignal.set(containerProp);
    }, [containerSignal, containerProp]);
    const {
        elements: elementsLib,
        activeDropZoneIdSignal,
        hoveredDragContainerIdSignal,
        selectedDragContainerIdSignal,
        uiDisplayModeSignal,
        allContainersSignal
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

    function onDragStart(event: BasicDragEvent) {
        event.stopPropagation();
        if(event.dataTransfer === undefined || event.dataTransfer === null) {
            return;
        }
        event.dataTransfer.setData('text/plain', containerSignal.get().id);
    }

    function onDragOver(event: BasicDragEvent) {
        event.stopPropagation()
        event.preventDefault();
        mousePosition.set(event);
    }

    function onDrop(event: BasicDragEvent) {
        event.stopPropagation();
        event.preventDefault();
        if(event.dataTransfer === null || event.dataTransfer === undefined){
            return;
        }
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

    function onSelected(event: CancellableEvent) {
        event.preventDefault();
        event.stopPropagation();
        selectedDragContainerIdSignal.set(containerSignal.get().id);
        activeDropZoneIdSignal.set('');
    }

    function onMouseOver(event: CancellableEvent) {
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



    useSignalEffect(() => {
        const mode = uiDisplayModeSignal.get();
        const container: Container = containerSignal.get();
        const isFocused = selectedDragContainerIdSignal.get() === container?.id;
        const isHovered = hoveredDragContainerIdSignal.get() === container?.id;
        const isRoot = container?.parent === '';
        const styleFromSignal = {
            border: mode === 'design' ? BORDER : 'unset',
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

            justifyContent: justifyContent(container),
            alignItems: alignItems(container),
        };

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

    const elementProps: ElementProps = {
        draggable: true,
        style: computedStyle,
        onDragStart,
        onDragOver,
        onDrop,
        onDragEnd,
        onMouseOver,
        onClick: onSelected,
        ['data-element-id']: props.container?.id
    };

    if (elementsLib[containerProp?.type]) {
        return <ElementRenderer container={containerProp} elementProps={elementProps}/>
    }

    return <ContainerRenderer container={containerProp} elementProps={elementProps}/>
}