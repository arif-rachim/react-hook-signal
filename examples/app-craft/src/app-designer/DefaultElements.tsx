import {element, Element} from "./LayoutBuilderProps.ts";
import {z, ZodRawShape, ZodType} from "zod";
import {CSSProperties, forwardRef, LegacyRef, MutableRefObject} from "react";
import {Icon} from "./Icon.ts";
import {Button} from "./button/Button.tsx";
import {PageSelectionPropertyEditor} from "./data-group/PageSelectionPropertyEditor.tsx";
import {Container} from "./AppDesigner.tsx";
import {ContainerRendererIdContext} from "./panels/design/container-renderer/ContainerRenderer.tsx";
import {QueryGrid} from "./query-grid/QueryGrid.tsx";
import {ConfigPropertyEditor} from "./query-grid/ConfigPropertyEditor.tsx";
import {IconType} from "react-icons";
import {cssPropertiesSchema} from "./zod-schema/cssPropertiesSchema.ts";
import {DataRenderer} from "./data-renderer/DataRenderer.tsx";
import {faultToIconByStatusId} from "../components/fault-status-icon/faultToIconByStatusId.tsx";
import {TextInput} from "./form/text-input/TextInput.tsx";
import {DateInput} from "./form/date-input/DateInput.tsx";
import {DateRangeInput} from "./form/date-input/DateRangeInput.tsx";
import {SelectInput} from "./form/select-input/SelectInput.tsx";
import {zodSchemaToZodType} from "./zodSchemaToJson.ts";
import {createCustomPropertyEditor} from "./data-renderer/CustomPropertyEditor.tsx";
import {DateTimeInput} from "./form/date-input/DateTimeInput.tsx";
import {useContainerLayoutHook} from "./form/container/useContainerLayoutHook.tsx";
import {useContainerStyleHook} from "./form/container/useContainerStyleHook.ts";
import {Form} from "./form/Form.tsx";

const ZodSqlValue = z.union([z.number(), z.string(), z.instanceof(Uint8Array), z.null()]);

export const DefaultElements: Record<string, Element> = {
    container: element({
        shortName: 'Container',
        icon: Icon.Container,
        property: {
            style: cssPropertiesSchema,
            onClick: z.function().returns(z.void())
        },
        component: (props, ref) => {
            return <LayoutContainer ref={ref} {...props}/>
        }
    }),
    titleBox: element({
        shortName: 'Title Box',
        icon: Icon.Container,
        property: {
            style: cssPropertiesSchema,
            onClick: z.function().returns(z.void()),
            title: z.string()
        },
        component: (props, ref) => {
            return <TitleBox ref={ref} {...props}/>
        }
    }),
    form: element({
        shortName: 'Form',
        icon: Icon.Container,
        property: {
            style: cssPropertiesSchema,
            value: z.record(z.unknown()),
            onChange: z.function().args(z.record(z.unknown())).returns(z.void())
        },
        component: (props, ref) => {
            return <Form ref={ref as MutableRefObject<HTMLFormElement>} {...props} style={props.style as CSSProperties}/>
        }
    }),
    input: element({
        shortName: 'Input',
        icon: Icon.Input,
        property: {
            value: z.string(),
            name: z.string().optional(),
            label: z.string().optional(),
            error: z.string().optional(),
            onChange: z.function().args(z.string()).returns(z.union([z.promise(z.void()), z.void()])),
            style: cssPropertiesSchema,
            type: z.enum(['text', 'number', 'password']).optional()
        },
        component: (props, ref) => {
            return <TextInput ref={ref as MutableRefObject<HTMLLabelElement>}
                              style={props.style}
                              name={props.name}
                              onChange={props.onChange}
                              value={props.value}
                              label={props.label}
                              error={props.error}
                              type={props.type}
            />
        }
    }),
    date: element({
        shortName: 'Date',
        icon: Icon.Input,
        property: {
            value: z.union([z.date(), z.string()]).optional(),
            label: z.string().optional(),
            error: z.string().optional(),
            onChange: z.function().args(z.union([z.date(), z.string()]).optional()).returns(z.union([z.promise(z.void()), z.void()])),
            style: cssPropertiesSchema,
            inputStyle: cssPropertiesSchema
        },
        component: (props, ref) => {
            return <DateInput ref={ref as MutableRefObject<HTMLLabelElement>} {...props}
                              style={props.style as CSSProperties} inputStyle={props.inputStyle as CSSProperties}/>
        }
    }),
    dateTime: element({
        shortName: 'DateTime',
        icon: Icon.Input,
        property: {
            value: z.union([z.date(), z.string()]).optional(),
            label: z.string().optional(),
            error: z.string().optional(),
            onChange: z.function().args(z.union([z.date(), z.string()]).optional()).returns(z.union([z.promise(z.void()), z.void()])),
            style: cssPropertiesSchema,
            inputStyle: cssPropertiesSchema
        },
        component: (props, ref) => {
            return <DateTimeInput ref={ref as MutableRefObject<HTMLDivElement>} {...props}
                                  style={props.style as CSSProperties} inputStyle={props.inputStyle as CSSProperties}/>
        }
    }),
    range: element({
        shortName: 'Range',
        icon: Icon.Input,
        property: {
            value: z.object({from: z.union([z.date(), z.string()]), to: z.union([z.date(), z.string()])}).optional(),
            label: z.string().optional(),
            error: z.string().optional(),
            onChange: z.function().args(z.object({
                from: z.union([z.date(), z.string()]),
                to: z.union([z.date(), z.string()])
            }).optional()).returns(z.union([z.promise(z.void()), z.void()])),
            style: cssPropertiesSchema,
            inputStyle: cssPropertiesSchema
        },
        component: (props, ref) => {
            return <DateRangeInput ref={ref as MutableRefObject<HTMLLabelElement>} {...props}
                                   style={props.style as CSSProperties} inputStyle={props.inputStyle as CSSProperties}/>
        }
    }),
    select: element({
        shortName: 'Select',
        icon: Icon.Input,
        property: {
            name : z.string().optional(),
            value: z.union([z.string(), z.number()]).optional(),
            label: z.string().optional(),
            error: z.string().optional(),
            onChange: z.function().args(z.union([z.string(), z.number()]).optional()).returns(z.union([z.promise(z.void()), z.void()])),
            style: cssPropertiesSchema,
            inputStyle: cssPropertiesSchema,
            query: z.function().args(z.object({
                params: z.record(ZodSqlValue).optional(),
                page: z.number().optional(),
                filter: z.record(z.unknown()).optional(),
                rowPerPage: z.number().optional(),
                sort: z.array(z.object({column: z.string(), direction: z.enum(['asc', 'desc'])}).optional()).optional(),
            })).returns(z.promise(z.object({
                error: z.string().optional(),
                data: z.array(z.record(z.union([z.number(), z.string()]))).optional(),
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
            valueToRowData: z.function().args(z.union([z.string(), z.number()]).optional()).returns(z.promise(z.record(z.union([z.number(), z.string()])))),
            rowDataToText: z.function().args(z.record(ZodSqlValue).optional()).returns(z.string()),
            rowDataToValue: z.function().args(z.record(ZodSqlValue).optional()).returns(z.union([z.string(),z.number()])),
            itemToKey: z.function().args(z.record(ZodSqlValue).optional()).returns(z.union([z.string(), z.number()]))
        },

        component: (props, ref) => {
            return <SelectInput ref={ref as MutableRefObject<HTMLLabelElement>}
                                style={props.style as CSSProperties} inputStyle={props.inputStyle as CSSProperties}
                                container={props.container}
                                config={props.config}
                                query={props.query}
                                itemToKey={props.itemToKey}
                                rowDataToText={props.rowDataToText}
                                onChange={props.onChange}
                                value={props.value}
                                label={props.label}
                                error={props.error}
                                valueToRowData={props.valueToRowData}
                                rowDataToValue={props.rowDataToValue}
                                name={props.name}
            />
        },
        propertyEditor: {
            config: {
                label: 'config',
                component: ConfigPropertyEditor
            },
            itemToKey: {
                label: 'itemToKey',
                component: createCustomPropertyEditor((props) => {
                    const {element, gridTemporalColumns, propertyName} = props;
                    let returnTypeZod: ZodType = z.any();
                    if (element) {
                        returnTypeZod = element.property[propertyName]
                    }
                    if (gridTemporalColumns) {
                        const param = gridTemporalColumns.reduce((result, key) => {
                            result[key] = ZodSqlValue.optional();
                            return result;
                        }, {} as ZodRawShape);
                        returnTypeZod = z.function().args(z.object(param)).returns(z.union([z.string(), z.number()]))
                    }
                    return returnTypeZod;
                })
            },
            rowDataToText: {
                label: 'rowDataToText',
                component: createCustomPropertyEditor((props) => {
                    const {element, gridTemporalColumns, propertyName} = props;
                    let returnTypeZod: ZodType = z.any();
                    if (element) {
                        returnTypeZod = element.property[propertyName]
                    }
                    if (gridTemporalColumns) {
                        const param = gridTemporalColumns.reduce((result, key) => {
                            result[key] = z.union([z.number(), z.string()]);
                            return result;
                        }, {} as ZodRawShape);
                        returnTypeZod = z.function().args(z.object(param).optional()).returns(z.string())
                    }
                    return returnTypeZod;
                })
            },
            rowDataToValue: {
                label: 'rowDataToValue',
                component: createCustomPropertyEditor((props) => {
                    const {element, gridTemporalColumns, propertyName} = props;
                    let returnTypeZod: ZodType = z.any();
                    if (element) {
                        returnTypeZod = element.property[propertyName]
                    }
                    if (gridTemporalColumns) {
                        const param = gridTemporalColumns.reduce((result, key) => {
                            result[key] = z.union([z.number(), z.string()]);
                            return result;
                        }, {} as ZodRawShape);
                        returnTypeZod = z.function().args(z.object(param).optional()).returns(z.union([z.string(),z.number()]).optional())
                    }
                    return returnTypeZod;
                })
            }
        }
    }),
    element: element({
        shortName: 'Component',
        icon: Icon.Component,
        property: {
            properties: z.record(z.unknown()).optional(),
            component: z.string(),
            style: cssPropertiesSchema
        },
        component: (props, ref) => {
            const {properties, component, style} = props;
            return <DataRenderer style={style} component={component} ref={ref} {...properties}/>
        },
        propertyEditor: {
            component: {
                label: 'component',
                component: PageSelectionPropertyEditor
            },
            properties: {
                label: 'properties',
                component: createCustomPropertyEditor((props) => {
                    const {container, allPagesSignal} = props;
                    const fun = new Function('module', container.properties['component'].formula)
                    const module = {exports: ''};
                    fun.apply(null, [module])
                    const pageId = module.exports;
                    const page = allPagesSignal.get().find(p => p.id === pageId);
                    const returnType = (page?.variables ?? []).filter(v => v.type === 'state').reduce((result, s) => {
                        result[s.name] = zodSchemaToZodType(s.schemaCode).optional()
                        return result;
                    }, {} as ZodRawShape);
                    return z.object(returnType);
                })
            }
        }
    }),
    button: element({
        shortName: 'Button',
        icon: Icon.Button,
        property: {
            onClick: z.function().returns(z.void()),
            label: z.string(),
            style: cssPropertiesSchema
        },
        component: (props, ref) => {
            const {onClick, style} = props;
            let {label} = props;
            label = label ?? 'Add label here';
            delete style.background;
            delete style.backgroundColor;

            return <Button style={style} ref={ref as LegacyRef<HTMLButtonElement>}
                           onClick={() => {
                               onClick()
                           }}>
                {label}
            </Button>
        }
    }),
    title: element({
        shortName: 'Text',
        icon: Icon.Title,
        property: {
            title: z.string(),
            style: cssPropertiesSchema
        },
        component: (props, ref) => {
            const {style} = props;
            let {title} = props;
            if (title && typeof title !== 'string') {
                title = JSON.stringify(title);
            }
            title = title ?? 'Add text here'
            return <div ref={ref as LegacyRef<HTMLDivElement>}
                        style={{flexShrink: 0, lineHeight: 1.1, ...style, minHeight: 12}}>{title}</div>
        }
    }),
    queryGrid: element({
        shortName: 'Table',
        icon: Icon.Grid,
        property: {
            query: z.function().args(z.object({
                params: z.record(ZodSqlValue).optional(),
                page: z.number().optional(),
                filter: z.record(z.unknown()).optional(),
                rowPerPage: z.number().optional(),
                sort: z.array(z.object({column: z.string(), direction: z.enum(['asc', 'desc'])}).optional()).optional(),
            })).returns(z.promise(z.object({
                error: z.string().optional(),
                data: z.array(z.record(z.union([z.number(), z.string()]))).optional(),
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
            focusedRow: z.record(z.union([z.number(), z.string()])),
            onFocusedRowChange: z.function().args(z.object({
                value: z.record(ZodSqlValue),
                data: z.array(z.record(ZodSqlValue)),
                totalPage: z.number(),
                currentPage: z.number(),
                index: z.number()
            })).returns(z.promise(z.void())).optional(),
            refreshQueryKey: z.string().optional(),
            onRowDoubleClick: z.function().args(z.object({
                value: z.record(ZodSqlValue),
                data: z.array(z.record(ZodSqlValue)),
                totalPage: z.number(),
                currentPage: z.number(),
                index: z.number()
            })).returns(z.union([z.promise(z.void()), z.void()])).optional(),
            filterable: z.boolean().optional(),
            sortable: z.boolean().optional(),
            pageable: z.boolean().optional(),
            itemToKey: z.function().args(z.record(ZodSqlValue)).returns(z.union([z.string(), z.number()]))
        },
        component: (props, ref) => {
            const {
                query,
                style,
                config,
                focusedRow,
                onFocusedRowChange,
                container,
                refreshQueryKey,
                onRowDoubleClick,
                filterable,
                sortable,
                pageable,
                itemToKey
            } = props;
            return <QueryGrid ref={ref} query={query} style={style} columnsConfig={config}
                              onFocusedRowChange={onFocusedRowChange}
                              focusedRow={focusedRow} container={container}
                              refreshQueryKey={refreshQueryKey} onRowDoubleClick={onRowDoubleClick}
                              filterable={filterable} sortable={sortable} pageable={pageable}
                              itemToKey={itemToKey}/>
        },
        propertyEditor: {
            config: {
                label: 'config',
                component: ConfigPropertyEditor
            },
            itemToKey: {
                label: 'itemToKey',
                component: createCustomPropertyEditor((props) => {
                    const {element, gridTemporalColumns, propertyName} = props;
                    let returnTypeZod: ZodType = z.any();
                    if (element) {
                        returnTypeZod = element.property[propertyName]
                    }
                    if (gridTemporalColumns) {
                        const param = gridTemporalColumns.reduce((result, key) => {
                            result[key] = ZodSqlValue.optional();
                            return result;
                        }, {} as ZodRawShape);
                        returnTypeZod = z.function().args(z.object(param)).returns(z.union([z.string(), z.number()]))
                    }
                    return returnTypeZod;
                })
            }
        }
    }),
    faultStatusIcon: element({
        shortName: 'Status',
        icon: Icon.FaultIcon as unknown as IconType,
        property: {
            value: z.number()
        },
        component: (props, ref) => {
            const {value} = props;
            return <div ref={ref as MutableRefObject<HTMLDivElement>} style={props.style}>
                {faultToIconByStatusId(value)}
            </div>
        }
    })
} as const;

const TitleBox = forwardRef(function TitleBox(props: {
    container: Container,
    style: CSSProperties,
    onClick: () => void,
    title: string,
    ["data-element-id"]: string
}, ref) {

    const {container, onClick, style, title} = props;
    const containerStyle = useContainerStyleHook(style);
    const {elements, displayMode} = useContainerLayoutHook(container);

    return <ContainerRendererIdContext.Provider value={props["data-element-id"]}>
        <div style={{display: 'flex', flexDirection: 'column-reverse', flexGrow: 1}}>
            <div ref={ref as LegacyRef<HTMLDivElement>}
                 style={{
                     padding: 10,
                     flexGrow: 1,
                     background: 'white',
                     boxShadow: '0 5px 10px -3px rgba(0,0,0,0.1)', ...containerStyle,
                     border: '1px solid rgba(0,0,0,0.1)',
                     borderRadius: 5
                 }}
                 data-element-id={props["data-element-id"]}
                 onClick={() => (displayMode.get() === 'view' && onClick ? onClick() : null)}
            >
                {elements}
            </div>
            <div style={{display: 'flex', flexDirection: 'row', paddingLeft: 10}}>
                <div style={{
                    fontSize: 'smaller',
                    borderTop: '1px solid rgba(0,0,0,0.1)',
                    borderLeft: '1px solid rgba(0,0,0,0.1)',
                    borderRight: '1px solid rgba(0,0,0,0.1)',
                    paddingLeft: 5,
                    paddingTop: 3,
                    paddingRight: 5,
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    lineHeight: 0.8, position: 'relative',
                    bottom: -1,
                    background: 'white'
                }}>{title}</div>
            </div>

        </div>
    </ContainerRendererIdContext.Provider>

})


const LayoutContainer = forwardRef(function LayoutContainer(props: {
    container: Container,
    style: CSSProperties,
    onClick: () => void,
    ["data-element-id"]: string,
}, ref) {
    const {container, onClick, style} = props;
    const containerStyle = useContainerStyleHook(style);
    const {elements, displayMode} = useContainerLayoutHook(container);
    return <ContainerRendererIdContext.Provider value={props["data-element-id"]}>
        <div ref={ref as LegacyRef<HTMLDivElement>}
             style={containerStyle}
             data-element-id={props["data-element-id"]}
             onClick={() => (displayMode.get() === 'view' && onClick ? onClick() : null)}
        >
            {elements}
        </div>
    </ContainerRendererIdContext.Provider>
})
