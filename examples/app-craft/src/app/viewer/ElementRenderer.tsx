import {Container} from "../designer/AppDesigner.tsx";
import {ElementStyleProps} from "../designer/LayoutBuilderProps.ts";
import {useAppContext} from "../../core/hooks/useAppContext.ts";
import {AppViewerContext} from "./context/AppViewerContext.ts";
import {EmptyComponent} from "../designer/components/empty-component/EmptyComponent.tsx";
import {CSSProperties, forwardRef, useEffect, useMemo, useRef, useState} from "react";
import {
    PropertyInitialization
} from "../designer/panels/design/PropertyInitialization.tsx";
import ErrorBoundary from "../../core/components/ErrorBoundary.tsx";

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
    const {style, ...componentProperties} = componentProps;
    const defaultStyle = (style ?? {}) as CSSProperties;
    return <>
        <PropertyInitialization container={props.container} setComponentProps={setComponentProps}/>
        <ErrorBoundary container={container}>
            <Component ref={ref} key={container?.id} container={container}
                       {...componentProperties}
                       style={{...elementProps.style, ...defaultStyle}}/>
        </ErrorBoundary>
    </>
}
