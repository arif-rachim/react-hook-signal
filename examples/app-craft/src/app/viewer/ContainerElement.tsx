import {Container} from "../designer/AppDesigner.tsx";
import {useAppContext} from "../../core/hooks/useAppContext.ts";
import {AppViewerContext} from "./context/AppViewerContext.ts";
import {CSSProperties, useEffect, useState} from "react";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {ElementStyleProps} from "../designer/LayoutBuilderProps.ts";
import {ElementRenderer} from "./ElementRenderer.tsx";
import {EmptyComponent} from "../designer/components/empty-component/EmptyComponent.tsx";

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
        const styleFromSignal = {display: 'flex', position: 'relative', ...container?.properties?.defaultStyle}
        if (isRoot) {
            styleFromSignal['width'] = styleFromSignal['width'] ?? '100%';
            styleFromSignal['height'] = styleFromSignal['height'] ?? '100%';
        }
        styleFromSignal['flexDirection'] = styleFromSignal['flexDirection'] ?? 'column';
        setComputedStyle(styleFromSignal as CSSProperties)
    });

    const elementProps: ElementStyleProps = {
        style: computedStyle,
        ['data-element-id']: container?.id ?? '',
        container: container
    };
    if (elements && elements[container?.type]) {
        return <ElementRenderer container={container} elementProps={elementProps}/>
    }
    return <EmptyComponent />
}
