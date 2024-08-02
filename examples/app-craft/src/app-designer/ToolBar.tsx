import {
    CSSProperties,
    type DragEvent as ReactDragEvent,
    HTMLAttributes,
    type MouseEvent as ReactMouseEvent
} from "react";
import {notifiable, useComputed} from "react-hook-signal";
import {MdArrowUpward, MdCancel, MdDragIndicator} from "react-icons/md";
import {useSelectedDragContainer} from "./hooks/useSelectedDragContainer.ts";
import {useUpdatePageSignal} from "./hooks/useUpdatePageSignal.ts";
import {useAppContext} from "./hooks/useAppContext.ts";
import {AppDesignerContext} from "./AppDesignerContext.ts";

/**
 * Represents a toolbar component that provides actions for a container.
 */
export function ToolBar() {
    const {
        selectedDragContainerIdSignal,
        allContainersSignal,
        activeDropZoneIdSignal,
        hoveredDragContainerIdSignal,
        uiDisplayModeSignal
    } = useAppContext<AppDesignerContext>();
    const containerSignal = useSelectedDragContainer();
    const updatePage = useUpdatePageSignal();

    function preventClick(event: ReactMouseEvent<HTMLElement>) {
        event.preventDefault();
        event.stopPropagation();
    }

    const computedStyle = useComputed(() => {
        const container = containerSignal.get();
        const displayMode = uiDisplayModeSignal.get();
        const style: CSSProperties = {
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            position: 'absolute',
            padding: '3px 5px',
            borderRadius: 5,
            color: 'white',
            fontSize: 18
        };
        if (displayMode === "view") {
            return style as CSSProperties;
        }
        if (container === undefined) {
            return style as CSSProperties;
        }
        const isRoot = container.parent === '';
        if (isRoot) {
            return style as CSSProperties;
        }
        const element = document.querySelector(`[data-element-id="${container.id}"]`);
        if (element === null) {
            return style as CSSProperties;
        }


        const {top, left, width} = element.getBoundingClientRect();
        style.display = 'flex';
        style.top = top - 15;
        style.left = left + width - 70;
        return style as CSSProperties;
    })

    function onFocusUp() {
        const container = containerSignal.get();
        if (container === undefined) {
            return
        }
        if (container.parent) {
            selectedDragContainerIdSignal.set(container.parent);
        }
    }

    function onDelete() {
        let allContainers = allContainersSignal.get();
        const container = containerSignal.get();
        if (container === undefined) {
            return;
        }
        allContainers = allContainers.filter(s => s.id !== container.id);
        const parent = allContainers.find(s => s.id === container.parent);
        if (parent) {
            const newParent = {...parent};
            newParent.children = newParent.children.filter(s => s !== container.id);
            allContainers.splice(allContainers.indexOf(parent), 1, newParent);
        }
        updatePage({type: 'container', containers: allContainers});
    }

    function onDragStart(event: ReactDragEvent) {
        event.stopPropagation();
        const container = containerSignal.get();
        if (container === undefined) {
            return;
        }
        event.dataTransfer.setData('text/plain', container.id);
    }

    function onDragEnd() {
        activeDropZoneIdSignal.set('');
        selectedDragContainerIdSignal.set('');
    }

    function onMouseOver(event: ReactMouseEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();
        hoveredDragContainerIdSignal.set(containerSignal.get()?.id ?? '');
    }

    const elementProps: (HTMLAttributes<HTMLElement>) = {
        draggable: true,
        onDragStart,
        onDragEnd,
        onMouseOver,
    }

    return <notifiable.div style={computedStyle} onClick={preventClick} {...elementProps}>
        <MdArrowUpward onClick={onFocusUp}/>
        <MdDragIndicator/>
        <MdCancel onClick={onDelete}/>
    </notifiable.div>
}
