import {ElementProps} from "../LayoutBuilderProps.ts";
import {Container} from "../AppDesigner.tsx";
import {ReactNode, useContext, useEffect, useState} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {DropZone} from "../DropZone.tsx";
import {DraggableContainerElement} from "./DraggableContainerElement.tsx";

export function ContainerRenderer(props: { elementProps: ElementProps, container: Container }) {
    const {elementProps} = props;
    const [elements, setElements] = useState<ReactNode[]>([]);
    const {uiDisplayModeSignal, allContainersSignal} = useContext(AppDesignerContext);
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
    return <div {...elementProps}>
        {elements}
    </div>
}