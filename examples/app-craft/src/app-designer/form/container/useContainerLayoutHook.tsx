import {Container} from "../../AppDesigner.tsx";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {ReactNode, useEffect, useState} from "react";
import {DropZone} from "../../panels/design/container-renderer/drop-zone/DropZone.tsx";
import {DraggableContainerElement} from "../../panels/design/container-renderer/DraggableContainerElement.tsx";
import {ContainerElement} from "../../../app-viewer/ContainerElement.tsx";
import {viewMode} from "./viewMode.ts";

export function useContainerLayoutHook(container: Container) {
    const {uiDisplayModeSignal, allContainersSignal} = useAppContext<AppDesignerContext>();
    const displayMode = uiDisplayModeSignal ?? viewMode;
    const containerSignal = useSignal(container);

    const [elements, setElements] = useState<ReactNode[]>([]);

    useEffect(() => {
        containerSignal.set(container);
    }, [containerSignal, container]);


    useSignalEffect(() => {
        const mode = displayMode.get();
        const container: Container | undefined = containerSignal.get();
        const children = container?.children ?? [];
        const result: Array<ReactNode> = [];
        if (mode === 'design') {
            result.push(<DropZone precedingSiblingId={''}
            key={`drop-zone-root-${container?.id}`}
            parentContainerId={container?.id ?? ''}/>)
        }
        for (let i = 0; i < children?.length; i++) {
            const childId = children[i];
            const childContainer = allContainersSignal.get().find(i => i.id === childId)!;
            if (mode === 'design') {
                result.push(<DraggableContainerElement container={childContainer} key={childId}/>)
                result.push(<DropZone precedingSiblingId={childId} key={`drop-zone-${i}-${container?.id}`}
                parentContainerId={container?.id ?? ''}/>);
            } else {
                result.push(<ContainerElement container={childContainer} key={childId}/>)
            }
        }
        setElements(result);
    });
    return {elements, displayMode};
}