import {MdHorizontalDistribute, MdVerticalDistribute} from "react-icons/md";
import {DraggableItem} from "./DraggableItem.tsx";
import {useAppContext} from "../../hooks/useAppContext.ts";

export function ElementsPanel() {
    const {elements} = useAppContext();
    return <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between',
        padding: 10
    }}>
        <DraggableItem icon={MdVerticalDistribute} draggableDataType={'vertical'}/>
        <DraggableItem icon={MdHorizontalDistribute} draggableDataType={'horizontal'}/>
        {
            Object.keys(elements ?? {}).map((key) => {
                if (elements && key in elements) {
                    const Icon = elements[key].icon;
                    return <DraggableItem icon={Icon} draggableDataType={key} key={key}/>
                }
                return <></>
            })
        }
    </div>
}
