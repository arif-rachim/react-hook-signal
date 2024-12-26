import {IconType} from "react-icons";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {CSSProperties} from "react";
import {dragElementCloneDragImage} from "../../builder/dragElementCloneDragImage.ts";

export function DraggableItem(props: {
    draggableDataType: string,
    icon: IconType,
    styleIcon?: CSSProperties,
    shortName: string
}) {
    const Icon = props.icon;
    const {activeDropZoneIdSignal} = useAppContext<AppDesignerContext>();
    return <div data-element-id={props.draggableDataType}
                style={{
                    padding: 5,
                    borderRadius: 5,
                    backgroundColor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20%',
                    height: 50,
                    flexShrink: 0,
                    flexGrow: 0
                }} onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', props.draggableDataType);
        const dragElement = document.querySelector(`[data-element-id="${props.draggableDataType}"]`);
        dragElementCloneDragImage({dragElement, event});
    }}
                draggable={true} onDragEnd={() => activeDropZoneIdSignal.set('')}>
        <div>
            <Icon fontSize={18} style={props.styleIcon}/>
        </div>
        <div>{props.shortName}</div>
    </div>
}