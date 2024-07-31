import {useContext} from "react";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {MdHorizontalDistribute, MdVerticalDistribute} from "react-icons/md";
import {DraggableItem} from "./DraggableItem.tsx";

export function ElementsPanel() {
    const {elements} = useContext(AppDesignerContext);
    return <div style={{display:'flex',flexDirection: 'row', flexWrap: 'wrap', gap: 10,justifyContent:'space-between',padding:10}}>
        <DraggableItem icon={MdVerticalDistribute} draggableDataType={'vertical'}/>
        <DraggableItem icon={MdHorizontalDistribute} draggableDataType={'horizontal'}/>
        {
            Object.keys(elements).map((key) => {
                const Icon = elements[key].icon;
                return <DraggableItem icon={Icon} draggableDataType={key} key={key}/>
            })
        }
    </div>
}
