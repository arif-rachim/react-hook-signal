import {CancellableEvent} from "../LayoutBuilderProps.ts";

export function dragElementCloneDragImage(props:{dragElement?: Element|null, event: CancellableEvent & {
        dataTransfer: DataTransfer | null;
        clientX: number;
        clientY: number
    }}) {
    const {dragElement,event} = props;
    if (dragElement === null || dragElement === undefined) {
        return;
    }
    const clone = dragElement.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.top = '-9999px'; // Move it off-screen so it doesn't interfere
    document.body.appendChild(clone);
    if('dataTransfer' in event && event.dataTransfer){
        event.dataTransfer.setDragImage(clone, 0, 0);
    }
    setTimeout(() => {
        document.body.removeChild(clone);
    }, 0);
}