import {ElementProps} from "../../../LayoutBuilderProps.ts";
import {Container} from "../../../AppDesigner.tsx";
import {createContext, ReactNode, useEffect, useState} from "react";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {DropZone} from "./drop-zone/DropZone.tsx";
import {DraggableContainerElement} from "./DraggableContainerElement.tsx";
import {useAppContext} from "../../../hooks/useAppContext.ts";
import {AppDesignerContext} from "../../../AppDesignerContext.ts";

export function ContainerRenderer(props: { elementProps: ElementProps, container: Container }) {
    const {elementProps} = props;
    const [elements, setElements] = useState<ReactNode[]>([]);
    const {uiDisplayModeSignal, allContainersSignal} = useAppContext<AppDesignerContext>();
    const containerSignal = useSignal(props.container);
    const containerProp = props.container;

    useEffect(() => {
        containerSignal.set(containerProp);
    }, [containerSignal, containerProp]);

    useSignalEffect(() => {
        const mode = uiDisplayModeSignal.get();
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
            result.push(<DraggableContainerElement container={childContainer} key={childId}/>)
            if (mode === 'design') {
                result.push(<DropZone precedingSiblingId={childId} key={`drop-zone-${i}-${container?.id}`}
                                      parentContainerId={container?.id ?? ''}/>);
            }
        }
        setElements(result);
    });
    const {onDrop, onClick, onDragEnd, onDragOver, onDragStart, onMouseOver, style, draggable} = elementProps;
    return <ContainerRendererIdContext.Provider value={elementProps["data-element-id"]}>
        <div
        draggable={draggable}
        style={style}
        onMouseOver={onMouseOver}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onDrop={onDrop}
        data-element-id={elementProps["data-element-id"]}
    >
        {elements}
    </div></ContainerRendererIdContext.Provider>
}

export const ContainerRendererIdContext = createContext<string>('')