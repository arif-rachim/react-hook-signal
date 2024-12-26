import {DraggableItem} from "./DraggableItem.tsx";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";

export function ElementsPanel() {
    const {elements} = useAppContext();
    return <div style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10
    }}>
        {
            Object.keys(elements ?? {}).map((key) => {
                if (elements && key in elements) {
                    const Icon = elements[key].icon;
                    const shortName = elements[key].shortName;
                    return <DraggableItem icon={Icon} draggableDataType={key} key={key} shortName={shortName}/>
                }
                return <></>
            })
        }
    </div>
}
