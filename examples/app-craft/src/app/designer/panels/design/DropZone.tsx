import {CSSProperties, useEffect, useId} from "react";
import {notifiable, useComputed} from "react-hook-signal";
import {dropZones} from "./dropZones.ts";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";

/**
 * Creates a drop zone element for dragging and dropping items.
 */
export function DropZone(props: {
    precedingSiblingId: string,
    parentContainerId: string
}) {
    const id = useId();
    const {activeDropZoneIdSignal} = useAppContext<AppDesignerContext>()
    useEffect(() => {
        const item = {
            id: id,
            ...props
        }
        dropZones.push(item);
        return () => {
            dropZones.splice(dropZones.indexOf(item), 1);
        }
    }, [id, props]);
    const computedStyle = useComputed(() => {
        const isFocused = id === activeDropZoneIdSignal.get();
        const style: CSSProperties = {
            backgroundColor: 'rgba(0,0,0,0)',
            minWidth: 10,
            minHeight: 10,
            position: 'absolute',
            height: `calc(100%)`,
            width: `calc(100%)`,
            transition: 'background-color 300ms ease-in-out',
            zIndex: -1
        };
        if (isFocused) {
            style.backgroundColor = `rgba(84, 193, 240, 0.5)`;
            style.zIndex = 1;
        }
        return style;
    })
    const containerStyle: CSSProperties = {
        minWidth: 0,
        minHeight: 0,
        backgroundColor: 'rgba(84,193,240,0.5)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    };
    return <div style={containerStyle}>
        <notifiable.div id={id} style={computedStyle}></notifiable.div>
    </div>
}