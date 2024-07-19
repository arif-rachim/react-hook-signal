import {CSSProperties, type MouseEvent as ReactMouseEvent, useContext} from "react";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {notifiable, useComputed} from "react-hook-signal";
import {MdArrowUpward, MdCancel, MdDragIndicator} from "react-icons/md";
import {Container} from "./AppDesigner.tsx";

/**
 * Represents a toolbar component that provides actions for a container.
 */
export function ToolBar(props: { container: Container, onDelete: () => void, onFocusUp: () => void }) {
    const {container, onDelete, onFocusUp} = props;
    const {selectedDragContainerIdSignal} = useContext(AppDesignerContext);

    function preventClick(event: ReactMouseEvent<HTMLElement>) {
        event.preventDefault();
        event.stopPropagation();
    }

    const computedStyle = useComputed(() => {
        const style = {
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#666',
            position: 'absolute',
            top: -15,
            right: -1,
            color: 'white',
        };
        const isFocused = selectedDragContainerIdSignal.get() === container?.id;
        if (isFocused) {
            style.display = 'flex';
        }
        return style as CSSProperties;
    })
    return <notifiable.div style={computedStyle} onClick={preventClick}>
        <MdArrowUpward onClick={onFocusUp}/>
        <MdDragIndicator/>
        <MdCancel onClick={onDelete}/>
    </notifiable.div>
}
