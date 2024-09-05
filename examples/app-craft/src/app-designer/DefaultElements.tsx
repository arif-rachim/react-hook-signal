import {element, Element} from "./LayoutBuilderProps.ts";
import {z} from "zod";
import {BORDER} from "./Border.ts";
import {CSSProperties, forwardRef, LegacyRef, MutableRefObject, ReactNode, useEffect, useState} from "react";
import {Icon} from "./Icon.ts";
import {DataGroup} from "./data-group/DataGroup.tsx";
import {Button} from "./button/Button.tsx";
import {notifiable, useSignal, useSignalEffect} from "react-hook-signal";
import {PageSelectionPropertyEditor} from "./data-group/PageSelectionPropertyEditor.tsx";
import {useAppContext} from "./hooks/useAppContext.ts";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {Container} from "./AppDesigner.tsx";
import {DropZone} from "./panels/design/container-renderer/drop-zone/DropZone.tsx";
import {DraggableContainerElement} from "./panels/design/container-renderer/DraggableContainerElement.tsx";
import {ContainerRendererIdContext} from "./panels/design/container-renderer/ContainerRenderer.tsx";
import {Signal} from "signal-polyfill";
import {ContainerElement} from "../app-viewer/ContainerElement.tsx";
import {QueryGrid} from "./query-grid/QueryGrid.tsx";
import {faultToIconByStatusId} from "../components/fault-status-icon/FaultStatusIcon.tsx";
import {ConfigPropertyEditor} from "./query-grid/ConfigPropertyEditor.tsx";
import {IconType} from "react-icons";
import {cssPropertiesSchema} from "./zod-schema/cssPropertiesSchema.ts";
export const DefaultElements: Record<string, Element> = {
    container: element({
        icon: Icon.Container,
        property: {
            style: cssPropertiesSchema
        },
        component: (props, ref) => {
            return <LayoutContainer ref={ref} {...props}/>
        }
    }),
    input: element({
        icon: Icon.Input,
        property: {
            value: z.string(),
            onChange: z.function().args(z.string()).returns(z.union([z.promise(z.void()), z.void()])),
            style: cssPropertiesSchema,
            type: z.enum(['text', 'number', 'password'])
        },
        component: (props, ref) => {
            const {value, onChange, style, type} = props;
            if (style?.border === 'unset') {
                style.border = BORDER
            }
            return <notifiable.input
                type={type}
                ref={ref}
                value={value ?? ''}
                onChange={async (e) => {
                    const val = e.target.value;
                    if (onChange) {
                        await onChange(val);
                    }
                }}
                style={{...style, border: BORDER, borderRadius: 20}}
            />
        }
    }),
    dataGroup: element({
        icon: Icon.Table,
        property: {
            data: z.array(z.record(z.unknown())),
            component: z.string(),
            keyId: z.string(),
            direction: z.enum(['vertical', 'horizontal']),
        },
        propertyEditor: {
            component: {
                label: 'component',
                component: PageSelectionPropertyEditor
            }
        },
        component: ({component, style, data, direction, keyId}, ref) => {
            return <DataGroup data={data} style={style} keyId={keyId} component={component} direction={direction}
                              ref={ref}/>
        }
    }),
    button: element({
        icon: Icon.Button,
        property: {
            onClick: z.function().returns(z.void()),
            label: z.string()
        },
        component: (props, ref) => {
            const {onClick, style} = props;
            let {label} = props;
            label = label ?? 'Add label here';
            return <Button style={{width: style.width, height: style.height}} ref={ref as LegacyRef<HTMLButtonElement>}
                           onClick={() => {
                               onClick()
                           }}>
                {label}
            </Button>
        }
    }),
    title: element({
        icon: Icon.Title,
        property: {
            title: z.string(),
            style: cssPropertiesSchema
        },
        component: (props, ref) => {
            const {style} = props;
            let {title} = props;
            title = title ?? 'Add text here'
            return <div ref={ref as LegacyRef<HTMLDivElement>} style={{flexShrink: 0, ...style}}>{title}</div>
        }
    }),
    queryGrid: element({
        icon: Icon.Grid,
        property: {
            query: z.function().args(z.record(z.unknown()).optional(), z.number().optional()).returns(z.promise(z.object({
                error: z.string().optional(),
                data: z.array(z.record(z.union([z.number(), z.string(), z.instanceof(Uint8Array), z.null()]))).optional(),
                totalPage: z.number().optional(),
                currentPage: z.number().optional(),
                columns: z.array(z.string()).optional()
            }))),
            config: z.record(z.object({
                hidden: z.boolean().optional(),
                width: z.union([z.string(), z.number()]).optional(),
                rendererPageId: z.string().optional(),
                title: z.string().optional()
            })),
            focusedRow: z.record(z.unknown(z.unknown())),
            onFocusedRowChange: z.function().args(z.unknown()).optional(),
            refreshQueryKey: z.string().optional()
        },
        component: (props, ref) => {
            const {query, style, config, focusedRow, onFocusedRowChange, container, refreshQueryKey} = props;

            return <QueryGrid ref={ref} query={query} style={style} columnsConfig={config}
                              onFocusedRowChange={onFocusedRowChange} focusedRow={focusedRow} container={container}
                              refreshQueryKey={refreshQueryKey}/>
        },
        propertyEditor: {
            config: {
                label: 'config',
                component: ConfigPropertyEditor
            }
        }
    }),
    faultStatusIcon: element({
        icon: Icon.FaultIcon as unknown as IconType,
        property: {
            value: z.number()
        },
        component: (props, ref) => {
            return <div ref={ref as MutableRefObject<HTMLDivElement>} style={props.style}>
                {faultToIconByStatusId(props.value)}
            </div>
        }
    })
}

/**
 *
 * export type QueryType = (inputs?: Record<string, unknown>, page?: number) => Promise<{
 *     error?: string,
 *     data: Record<string, number | string | Uint8Array | null>[],
 *     columns: Column[],
 *     totalPage: number,
 *     currentPage: number
 * }>
 */

const viewMode = new Signal.Computed(() => 'view');

const LayoutContainer = forwardRef(function LayoutContainer(props: {
    container: Container,
    style: CSSProperties,
    ["data-element-id"]: string
}, ref) {

    const {container, ...elementProps} = props;
    const [elements, setElements] = useState<ReactNode[]>([]);
    const {uiDisplayModeSignal, allContainersSignal} = useAppContext<AppDesignerContext>();
    const displayMode = uiDisplayModeSignal ?? viewMode;
    const containerSignal = useSignal(container);

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
    const {style} = elementProps;
    return <ContainerRendererIdContext.Provider value={elementProps["data-element-id"]}>
        <div ref={ref as LegacyRef<HTMLDivElement>}
             style={style}
             data-element-id={elementProps["data-element-id"]}
        >
            {elements}
        </div>
    </ContainerRendererIdContext.Provider>
})
