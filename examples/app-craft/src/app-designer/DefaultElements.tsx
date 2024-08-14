import {element, Element} from "./LayoutBuilderProps.ts";
import {z} from "zod";
import {BORDER} from "./Border.ts";
import {useSelectedDragContainer} from "./hooks/useSelectedDragContainer.ts";
import {useAppContext} from "./hooks/useAppContext.ts";
import {isEmpty} from "../utils/isEmpty.ts";
import {useUpdateDragContainer} from "./hooks/useUpdateSelectedDragContainer.ts";
import {CSSProperties, LegacyRef} from "react";
import {colors} from "stock-watch/src/utils/colors.ts";
import {PageInputSelector} from "./page-selector/PageInputSelector.tsx";
import {Container} from "./AppDesigner.tsx";
import {Icon} from "./Icon.ts";
import {DataGroup} from "./data-group/DataGroup.tsx";
import {Button} from "./button/Button.tsx";
import {notifiable} from "react-hook-signal";

export const DefaultElements: Record<string, Element> = {
    input: element({
        icon: Icon.Input,
        property: {
            value: z.string(),
            onChange: z.function().args(z.string()).returns(z.promise(z.void())),
        },
        component: (props, ref) => {
            const {value, onChange, style} = props;
            if (style?.border === 'unset') {
                style.border = BORDER
            }
            return <notifiable.input
                ref={ref}
                value={value}
                onChange={async (e) => {
                    const val = e.target.value;
                    if (onChange) {
                        await onChange(val);
                    }
                }}
                style={{...style,border:BORDER, borderRadius: 20}}
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
            const {onClick, label} = props;
            return <Button ref={ref as LegacyRef<HTMLButtonElement>} onClick={() => {
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
            style: z.object({
                fontSize: z.number().optional(),
                color: z.string().optional(),
                border : z.string().optional(),
                borderTop : z.string().optional(),
                borderLeft : z.string().optional(),
                borderRight : z.string().optional(),
                borderBottom : z.string().optional(),
            })
        },
        component: (props, ref) => {
            const {style, title, containerStyle} = props;
            return <div ref={ref as LegacyRef<HTMLDivElement>} style={{...style}}>{title}</div>
        }
    })
}


function PageSelectionPropertyEditor(props: { propertyName: string }) {
    const containerSignal = useSelectedDragContainer();
    const context = useAppContext();
    const container = containerSignal.get();
    const {propertyName} = props;
    const hasError = context.allErrorsSignal.get().find(i => i.type === 'property' && i.propertyName === propertyName && i.containerId === container?.id) !== undefined;
    let isFormulaEmpty = true;

    if (container && container.properties[propertyName]) {
        const formula = container.properties[propertyName].formula;
        isFormulaEmpty = isEmpty(formula);
    }
    const update = useUpdateDragContainer();
    const style: CSSProperties = {
        width: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: 0,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 0,
        backgroundColor: isFormulaEmpty ? colors.grey : colors.green,
        padding: 0
    };
    return <div style={{display: 'flex'}}>

        <PageInputSelector value={''} style={style} onChange={(value) => {
            const containerId = containerSignal.get()?.id;
            if (containerId) {
                update(containerId, (selectedContainer: Container) => {
                    if (value) {
                        selectedContainer.properties = {
                            ...selectedContainer.properties,
                            [propertyName]: {formula: `module.exports = "${value}"`, dependencies: []}
                        }
                        return selectedContainer;
                    } else {
                        selectedContainer.properties = {...selectedContainer.properties};
                        delete selectedContainer.properties[propertyName];
                        return selectedContainer;
                    }

                });
            }
        }}/>
        <div style={{
            display: 'flex',
            padding: '0px 5px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)',
            border: BORDER,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20
        }}>
            {hasError && <Icon.Error style={{fontSize: 18, color: colors.red}}/>}
            {!hasError && <Icon.Checked style={{fontSize: 18, color: colors.green}}/>}
        </div>
    </div>
}
