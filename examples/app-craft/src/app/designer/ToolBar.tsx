import {
    type DragEvent as ReactDragEvent,
    HTMLAttributes,
    type MouseEvent as ReactMouseEvent,
    useContext,
    useRef
} from "react";
import {useComputed, useSignalEffect} from "react-hook-signal";
import {MdArrowUpward, MdCancel, MdDragIndicator} from "react-icons/md";
import {useSelectedDragContainer} from "../../core/hooks/useSelectedDragContainer.ts";
import {useUpdatePageSignal} from "../../core/hooks/useUpdatePageSignal.ts";
import {useAppContext} from "../../core/hooks/useAppContext.ts";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {DashboardContext} from "../Dashboard.tsx";
import {isEmpty} from "../../core/utils/isEmpty.ts";
import {dragElementCloneDragImage} from "./builder/dragElementCloneDragImage.ts";

/**
 * Represents a toolbar component that provides actions for a container.
 */
export function ToolBar() {
    const {
        selectedDragContainerIdSignal,
        allContainersSignal,
        activeDropZoneIdSignal,
        uiDisplayModeSignal,
        activePageIdSignal,
        allPagesSignal
    } = useAppContext<AppDesignerContext>();
    const {selectedPanelSignal, panelsSignal} = useContext(DashboardContext);
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const containerSignal = useSelectedDragContainer();
    const updatePage = useUpdatePageSignal();

    function preventClick(event: ReactMouseEvent<HTMLElement>) {
        event.preventDefault();
        event.stopPropagation();
    }

    const centerPanelComputed = useComputed(() => {
        const mainCenterId = selectedPanelSignal.get().mainCenter;
        return panelsSignal.get().find(p => p.id === mainCenterId);
    })

    useSignalEffect(() => {
        const container = containerSignal.get();
        const displayMode = uiDisplayModeSignal.get();
        const isDesignPanel = centerPanelComputed.get()?.tag?.type === 'DesignPanel';
        const element = toolbarRef.current;
        if (element === undefined || element === null) {
            return;
        }
        if (!isDesignPanel) {
            element.style.display = 'none';
            return;
        }
        if (displayMode === "view") {
            element.style.display = 'none';
            return;
        }
        if (container === undefined) {
            element.style.display = 'none';
            return;
        }
        const isRoot = container.parent === '';
        if (isRoot) {
            element.style.display = 'none';
            return;
        }
        const pageRootId = (allPagesSignal.get().find(p => p.id === activePageIdSignal.get())?.containers ?? []).find(c => isEmpty(c.parent))?.id
        const anchorElement = document.querySelector(`[data-element-id="${container.id}"]`);
        const pageRootElement = document.querySelector(`[data-element-id="${pageRootId}"]`);
        if (anchorElement === null) {
            element.style.display = 'none';
            return;
        }
        const resizeObserver = new ResizeObserver(() => {
            const contentRect = anchorElement.getBoundingClientRect();
            if (contentRect) {
                element.style.display = 'flex';
                element.style.top = `${contentRect.top - 15}px`;
                element.style.left = `${contentRect.left + contentRect.width - 70}px`;
            }
        })
        resizeObserver.observe(anchorElement);
        if (pageRootElement) {
            resizeObserver.observe(pageRootElement);
        }

        return () => {
            if (resizeObserver && anchorElement) {
                resizeObserver.unobserve(anchorElement)
            }
            if (resizeObserver && pageRootElement) {
                resizeObserver.unobserve(pageRootElement)
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
        }
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
        const dragElement = document.querySelector(`[data-element-id="${container.id}"]`);
        dragElementCloneDragImage({dragElement, event});
    }

    function onDragEnd() {
        activeDropZoneIdSignal.set('');
        selectedDragContainerIdSignal.set('');
    }

    function onMouseOver(event: ReactMouseEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();
        //hoveredDragContainerIdSignal.set(containerSignal.get()?.id ?? '');
    }

    const elementProps: (HTMLAttributes<HTMLElement>) = {
        draggable: true,
        onDragStart,
        onDragEnd,
        onMouseOver,
    }

    return <div ref={toolbarRef} style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        position: 'absolute',
        padding: '3px 5px',
        borderRadius: 5,
        color: 'white',
        fontSize: 18
    }} onClick={preventClick} {...elementProps}>
        <MdArrowUpward onClick={onFocusUp}/>
        <MdDragIndicator/>
        <MdCancel onClick={onDelete}/>
    </div>
}
