import {VariablesPanel} from "../variable-editor/VariablesPanel.tsx";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {MdHorizontalDistribute, MdVerticalDistribute} from "react-icons/md";
import {IconType} from "react-icons";
import CollapsibleLabelContainer from "../collapsible-panel/CollapsibleLabelContainer.tsx";
import {BORDER} from "../Border.ts";

export function LeftPanel() {
    return <div style={{
        display: 'flex',
        backgroundColor: 'rgba(0,0,0,0.01)',
        flexDirection: 'column',
        width: 250,
        borderRight: BORDER,
        overflow:'auto'
    }}>
        <ElementsPanel/>
        <VariablesPanel/>
    </div>
}

function ElementsPanel() {
    const {elements} = useContext(AppDesignerContext);
    return <CollapsibleLabelContainer label={'Components'} styleContent={{flexDirection: 'row', flexWrap: 'wrap',gap:10}}>
        <DraggableItem icon={MdVerticalDistribute} draggableDataType={'vertical'}/>
        <DraggableItem icon={MdHorizontalDistribute} draggableDataType={'horizontal'}/>
        {
            Object.keys(elements).map((key) => {
                const Icon = elements[key].icon;
                return <DraggableItem icon={Icon} draggableDataType={key} key={key}/>
            })
        }
    </CollapsibleLabelContainer>
}


function DraggableItem(props: { draggableDataType: string, icon: IconType }) {
    const Icon = props.icon;
    const {activeDropZoneIdSignal} = useContext(AppDesignerContext);
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
