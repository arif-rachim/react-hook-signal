import {element, Element} from "./LayoutBuilderProps.ts";
import {z} from "zod";
import {BORDER} from "./Border.ts";
import {LegacyRef} from "react";
import {Icon} from "./Icon.ts";
import {DataGroup} from "./data-group/DataGroup.tsx";
import {Button} from "./button/Button.tsx";
import {notifiable} from "react-hook-signal";
import {PageSelectionPropertyEditor} from "./data-group/PageSelectionPropertyEditor.tsx";

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
            const {style, title} = props;
            return <div ref={ref as LegacyRef<HTMLDivElement>} style={{...style}}>{title}</div>
        }
    })
}

