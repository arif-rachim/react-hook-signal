import {ElementStyleProps, LayoutBuilderProps} from "../app-designer/LayoutBuilderProps.ts";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Container, Fetcher, Page, Variable, VariableInstance} from "../app-designer/AppDesigner.tsx";
import {Signal} from "signal-polyfill";
import {ErrorType} from "../app-designer/errors/ErrorType.ts";
import {CSSProperties, forwardRef, ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {VariableInitialization} from "../app-designer/variable-initialization/VariableInitialization.tsx";
import ErrorBoundary from "../app-designer/ErrorBoundary.tsx";
import {BORDER} from "../app-designer/Border.ts";
import {
    PropertyInitialization
} from "../app-designer/panels/design/container-renderer/property-initialization/PropertyInitialization.tsx";
import {alignItems, justifyContent} from "../utils/justifyContentAlignItems.ts";
import {useAppContext} from "../app-designer/hooks/useAppContext.ts";
import {AppViewerContext} from "./AppViewerContext.ts";
import {isEmpty} from "../utils/isEmpty.ts";
import {EmptyComponent} from "../app-designer/empty-component/EmptyComponent.tsx";
import {createNewBlankApplication} from "../app-designer/createNewBlankApplication.ts";
import {Table} from "../app-designer/panels/database/service/getTables.ts";

/**
 * Renders the application viewer component.
 */
export default function AppViewer(props: LayoutBuilderProps) {
    const applicationSignal = useSignal(createNewBlankApplication());
    const allPagesSignal = useComputed<Array<Page>>(() => applicationSignal.get().pages);
    const activePageIdSignal = useSignal<string>('');
    const variableInitialValueSignal = useSignal<Record<string, unknown>>({})
    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);

    const allTablesSignal = useComputed(() => applicationSignal.get().tables ?? []);
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
    const allFetchersSignal = useComputed<Array<Fetcher>>(() => {
        const activePageId = activePageIdSignal.get();
        const allPages = allPagesSignal.get();
        return allPages.find(i => i.id === activePageId)?.fetchers ?? []
    });
    const {value, onChange} = props;
    useEffect(() => {
        applicationSignal.set(value);
        if (value && value.pages && value.pages.length > 0) {
            const currentActivePageId = activePageIdSignal.get();
            const hasSelection = value.pages.findIndex(i => i.id === currentActivePageId) >= 0;
            if (!hasSelection) {
                allErrorsSignal.set([]);
                variableInitialValueSignal.set({});
                activePageIdSignal.set(value.pages[0].id)
            }
        }
    }, [activePageIdSignal, allErrorsSignal, applicationSignal, value, variableInitialValueSignal]);
    useSignalEffect(() => {
        onChange(applicationSignal.get());
    })
    const context: AppViewerContext = {
        applicationSignal,
        allTablesSignal,
        allPagesSignal,
        activePageIdSignal,
        allContainersSignal,
        variableInitialValueSignal,
        allVariablesSignal,
        allVariablesSignalInstance,
        allErrorsSignal,
        allFetchersSignal,
        elements: props.elements
    }

    return <AppViewerContext.Provider value={context}>
        <ErrorBoundary>
            <VariableInitialization/>
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


export function PageViewer(props: {
    elements: LayoutBuilderProps['elements'],
    page: Page,
    allTables: Array<Table>
} & Record<string, unknown>) {
    const {elements, page, ...properties} = props;
    const variableInitialValueSignal = useSignal<Record<string, unknown>>(properties);
    useEffect(() => {
        variableInitialValueSignal.set(properties);
    }, [properties, variableInitialValueSignal]);

    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allTablesSignal = useComputed(() => props.allTables)
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);
    const allVariablesSignal = useComputed(() => props.page.variables)
    const allContainersSignal = useComputed(() => props.page.containers);
    const allFetchersSignal = useComputed(() => props.page.fetchers);
    const allPagesSignal = useComputed<Array<Page>>(() => [page]);
    const applicationSignal = useSignal(createNewBlankApplication());
    const activePageIdSignal = useSignal(page.id)
    const context: AppViewerContext = {
        applicationSignal,
        allTablesSignal,
        allPagesSignal,
        activePageIdSignal,
        allContainersSignal,
        variableInitialValueSignal,
        allVariablesSignal,
        allVariablesSignalInstance,
        allErrorsSignal,
        allFetchersSignal,
        elements: elements
    }
    return <AppViewerContext.Provider value={context}>
        <ErrorBoundary>
            <VariableInitialization/>
            <notifiable.div style={{flexGrow: 1, overflow: 'auto'}}>
                {() => {
                    const container = context.allContainersSignal.get().find(item => isEmpty(item.parent));
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
        const isContainer = ['vertical', 'horizontal'].includes(container.type);
        const styleFromSignal = {

            border: isContainer ? undefined : BORDER,
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
        ['data-element-id']: container?.id ?? ''
    };
    if (elements && elements[container?.type]) {
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
    const {allContainersSignal} = useAppContext<AppViewerContext>();
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
    return <>
        <PropertyInitialization container={props.container} setComponentProps={setComponentProps}/>
        <Component ref={ref} key={container?.id} {...componentProps} style={elementProps.style}/>
    </>
}
