import {Container} from "../app-designer/AppDesigner.tsx";
import {ElementStyleProps} from "../app-designer/LayoutBuilderProps.ts";
import {useAppContext} from "../app-designer/hooks/useAppContext.ts";
import {AppViewerContext} from "./AppViewerContext.ts";
import {EmptyComponent} from "../app-designer/empty-component/EmptyComponent.tsx";
import {CSSProperties, forwardRef, useEffect, useMemo, useRef, useState} from "react";
import {
    PropertyInitialization
} from "../app-designer/panels/design/container-renderer/property-initialization/PropertyInitialization.tsx";
import ErrorBoundary from "../app-designer/ErrorBoundary.tsx";

/**
 * Renders an element inside a container with specified props.
 */
export function ElementRenderer(props: { container: Container, elementProps: ElementStyleProps }) {
    const {container, elementProps} = props;
    const context = useAppContext<AppViewerContext>();
    const {component} = context && context.elements && container.type in context.elements ? context.elements[container.type] : {component: EmptyComponent};
    const ref = useRef<HTMLElement | null>(null);

    const propsRef = useRef(elementProps);
    propsRef.current = elementProps;

    const Component = useMemo(() => {
        return forwardRef(component)
    }, [component])
    const [componentProps, setComponentProps] = useState<Record<string, unknown>>({})
    useEffect(() => {
        const element = ref.current;
        if (element) {
            element.setAttribute('data-element-id', propsRef.current["data-element-id"]);
        }
    }, [Component]);
    const {style,...componentProperties} = componentProps;
    const defaultStyle = (style ?? {}) as CSSProperties;
    return <>
        <PropertyInitialization container={props.container} setComponentProps={setComponentProps}/>
        <ErrorBoundary container={container}>
            <Component ref={ref} key={container?.id} container={container} data-element-id={elementProps["data-element-id"]} {...componentProperties} style={{...elementProps.style,...defaultStyle}}/>
        </ErrorBoundary>
    </>
}
