import {ElementStyleProps, LayoutBuilderProps} from "../LayoutBuilderProps.ts";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {createNewBlankPage} from "../createNewBlankPage.ts";
import {Container, Page, Variable, VariableInstance} from "../AppDesigner.tsx";
import {Signal} from "signal-polyfill";
import {ErrorType} from "../errors/ErrorType.ts";
import {
    createContext,
    CSSProperties,
    forwardRef,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import {VariableInitialization} from "../variable-initialization/VariableInitialization.tsx";
import ErrorBoundary from "../ErrorBoundary.tsx";
import {BORDER} from "../Border.ts";
import {
    PropertyInitialization
} from "../panels/design/container-renderer/property-initialization/PropertyInitialization.tsx";
import {alignItems, justifyContent} from "../../utils/justifyContentAlignItems.ts";

/**
 * Represents the context of an app viewer.
 */
export interface AppViewerContext {
    allPagesSignal: Signal.State<Array<Page>>;
    activePageIdSignal: Signal.State<string>;
    allContainersSignal: Signal.Computed<Array<Container>>;
    allVariablesSignal: Signal.Computed<Array<Variable>>;
    variableInitialValueSignal: Signal.State<Record<string, unknown>>;
    allVariablesSignalInstance: Signal.State<Array<VariableInstance>>;
    allErrorsSignal: Signal.State<Array<ErrorType>>;
    elements: LayoutBuilderProps['elements'];
}

/**
 * Context object for the App Viewer.
 */
export const AppViewerContext = createContext<AppViewerContext>({
    allPagesSignal: new Signal.State<Array<Page>>([]),
    activePageIdSignal: new Signal.State(''),
    allContainersSignal: new Signal.Computed<Array<Container>>(() => []),
    variableInitialValueSignal: new Signal.State<Record<string, unknown>>({}),
    allVariablesSignal: new Signal.Computed<Array<Variable>>(() => []),
    allVariablesSignalInstance: new Signal.State<Array<VariableInstance>>([]),
    allErrorsSignal: new Signal.State<Array<ErrorType>>([]),
    elements: {},
})
/**
 * Renders the application viewer component.
 */
export default function AppViewer(props: LayoutBuilderProps) {
    const allPagesSignal = useSignal<Array<Page>>([createNewBlankPage()])
    const activePageIdSignal = useSignal<string>('');
    const variableInitialValueSignal = useSignal<Record<string, unknown>>({})
    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);
    const allVariablesSignal = useComputed<Array<Variable>>(() => {
        const activePageId = activePageIdSignal.get();
        const allPages = allPagesSignal.get();
        return allPages.find(i => i.id === activePageId)?.variables ?? []
    });
    const allContainersSignal = useComputed<Array<Container>>(() => {
        const activePageId = activePageIdSignal.get();
        const allPages = allPagesSignal.get();
        return allPages.find(i => i.id === activePageId)?.containers ?? []
    });
    const {value, onChange} = props;
    useEffect(() => {
        if (value && value.length > 0) {
            allPagesSignal.set(value);
            const currentActivePageId = activePageIdSignal.get();
            const hasSelection = value.findIndex(i => i.id === currentActivePageId) >= 0;
            if (!hasSelection) {
                allErrorsSignal.set([]);
                variableInitialValueSignal.set({});
                activePageIdSignal.set(value[1].id)
            }
        }
    }, [activePageIdSignal, allErrorsSignal, allPagesSignal, value, variableInitialValueSignal]);
    useSignalEffect(() => {
        onChange(allPagesSignal.get());
    })
    const context: AppViewerContext = {
        allPagesSignal,
        activePageIdSignal,
        allContainersSignal,
        variableInitialValueSignal,
        allVariablesSignal,
        allVariablesSignalInstance,
        allErrorsSignal,
        elements: props.elements
    }

    return <AppViewerContext.Provider value={context}>
        <ErrorBoundary>
            <VariableInitialization context={context}/>
            <notifiable.div style={{flexGrow: 1, overflow: 'auto'}}>
                {() => {
                    const container = allContainersSignal.get().find(item => item.parent === '');
                    if (container) {
                        return <ContainerElement container={container}/>
                    }
                    return <></>
                }}
            </notifiable.div>
        </ErrorBoundary>
    </AppViewerContext.Provider>
}

/**
 * The ContainerElement component renders a container element based on the provided props.
 */
function ContainerElement(props: { container: Container }) {
    const {elements} = useContext(AppViewerContext);
    const {container} = props;
    const [computedStyle, setComputedStyle] = useState<CSSProperties>({})
    const containerSignal = useSignal(container);

    useEffect(() => {
        containerSignal.set(container);
    }, [containerSignal, container]);


    useSignalEffect(() => {
        const container: Container | undefined = containerSignal.get();
        const isRoot = container?.parent === '';
        const styleFromSignal = {
            border: BORDER,
            background: 'white',
            minWidth: container?.minWidth,
            minHeight: container?.minHeight,

            paddingTop: container?.paddingTop,
            paddingRight: container?.paddingRight,
            paddingBottom: container?.paddingBottom,
            paddingLeft: container?.paddingLeft,

            marginTop: container?.marginTop,
            marginRight: container?.marginRight,
            marginBottom: container?.marginBottom,
            marginLeft: container?.marginLeft,

            display: 'flex',
            flexDirection: container?.type === 'horizontal' ? 'row' : 'column',
            width: isRoot ? '100%' : container?.width,
            height: isRoot ? '100%' : container?.height,
            position: 'relative',
            gap: container?.gap,
            justifyContent: justifyContent(container),
            alignItems: alignItems(container),
        };
        setComputedStyle(styleFromSignal as CSSProperties)
    });

    const elementProps: ElementStyleProps = {
        style: computedStyle,
        ['data-element-id']: container?.id
    };
    if (elements[container?.type]) {
        return <ElementRenderer container={container} elementProps={elementProps}/>
    }

    return <ContainerRenderer container={container} elementProps={elementProps}/>
}


/**
 * Renders a container with its child elements.
 */
function ContainerRenderer(props: { elementProps: ElementStyleProps, container: Container }) {
    const {elementProps} = props;
    const [elements, setElements] = useState<ReactNode[]>([]);
    const {allContainersSignal} = useContext(AppViewerContext);
    const containerSignal = useSignal(props.container);
    const containerProp = props.container;

    useEffect(() => {
        containerSignal.set(containerProp);
    }, [containerSignal, containerProp]);

    useSignalEffect(() => {
        const container: Container | undefined = containerSignal.get();
        const children = container?.children ?? [];
        const result: Array<ReactNode> = [];
        for (let i = 0; i < children?.length; i++) {
            const childId = children[i];
            const childContainer = allContainersSignal.get().find(i => i.id === childId)!;
            result.push(<ContainerElement container={childContainer} key={childId}/>)
        }
        setElements(result);
    });
    const {style} = elementProps;
    return <div
        style={style}
        data-element-id={elementProps["data-element-id"]}>
        {elements}
    </div>
}

/**
 * Renders an element inside a container with specified props.
 */
function ElementRenderer(props: { container: Container, elementProps: ElementStyleProps }) {
    const {container, elementProps} = props;
    const context = useContext(AppViewerContext);
    const {component} = context.elements[container.type];
    const ref = useRef<HTMLElement>(null);

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
    return <>
        <PropertyInitialization container={props.container} setComponentProps={setComponentProps} context={context}/>
        <Component ref={ref} key={container?.id} {...componentProps} style={elementProps.style}/>
    </>
}