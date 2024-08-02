import {IconType} from "react-icons";
import {BORDER} from "../../Border.ts";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";

export function DraggableItem(props: { draggableDataType: string, icon: IconType }) {
    const Icon = props.icon;
    const {activeDropZoneIdSignal} = useAppContext<AppDesignerContext>();
    return <div
        style={{
            border: BORDER,
            padding: 5,
            borderRadius: 5,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            height: 50,
            flexShrink: 0,
            flexGrow: 0
        }} onDragStart={(e) => e.dataTransfer.setData('text/plain', props.draggableDataType)}
        draggable={true} onDragEnd={() => activeDropZoneIdSignal.set('')}>
        <Icon fontSize={18}/>
    </div>
}