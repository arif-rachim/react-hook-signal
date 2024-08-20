import {Container} from "../app-designer/AppDesigner.tsx";
import {useAppContext} from "../app-designer/hooks/useAppContext.ts";
import {AppViewerContext} from "./AppViewerContext.ts";
import {CSSProperties, useEffect, useState} from "react";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {BORDER} from "../app-designer/Border.ts";
import {ElementStyleProps} from "../app-designer/LayoutBuilderProps.ts";
import {ElementRenderer} from "./ElementRenderer.tsx";

/**
 * The ContainerElement component renders a container element based on the provided props.
 */
export function ContainerElement(props: { container: Container }) {
    const {elements} = useAppContext<AppViewerContext>();
    const {container} = props;
    const [computedStyle, setComputedStyle] = useState<CSSProperties>({})
    const containerSignal = useSignal(container);

    useEffect(() => {
        containerSignal.set(container);
    }, [containerSignal, container]);

    useSignalEffect(() => {
        const container: Container | undefined = containerSignal.get();
        const isRoot = container?.parent === '';
        const isContainer = container?.type === 'container';
        const styleFromSignal = {

            border: isContainer ? undefined : BORDER,
            background: 'white',
            minWidth: container?.properties?.defaultStyle?.minWidth,
            minHeight: container?.properties?.defaultStyle?.minHeight,

            paddingTop: container?.properties?.defaultStyle?.paddingTop,
            paddingRight: container?.properties?.defaultStyle?.paddingRight,
            paddingBottom: container?.properties?.defaultStyle?.paddingBottom,
            paddingLeft: container?.properties?.defaultStyle?.paddingLeft,

            marginTop: container?.properties?.defaultStyle?.marginTop,
            marginRight: container?.properties?.defaultStyle?.marginRight,
            marginBottom: container?.properties?.defaultStyle?.marginBottom,
            marginLeft: container?.properties?.defaultStyle?.marginLeft,

            display: 'flex',
            flexDirection: container?.properties?.defaultStyle?.flexDirection ?? 'column',
            width: isRoot ? '100%' : container?.properties?.defaultStyle?.width,
            height: isRoot ? '100%' : container?.properties?.defaultStyle?.height,
            position: 'relative',
            gap: container?.properties?.defaultStyle?.gap,
            justifyContent: container?.properties?.defaultStyle?.justifyContent,
            alignItems: container?.properties?.defaultStyle?.alignItems,
        };
        setComputedStyle(styleFromSignal as CSSProperties)
    });

    const elementProps: ElementStyleProps = {
        style: computedStyle,
        ['data-element-id']: container?.id ?? '',
        container : container
    };
    if (elements && elements[container?.type]) {
        return <ElementRenderer container={container} elementProps={elementProps}/>
    }
    return <></>
}
