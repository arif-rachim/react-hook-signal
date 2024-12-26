import {CSSProperties, useState} from "react";
import {useSignalEffect} from "react-hook-signal";
import {LabelContainer} from "../../../../core/components/LabelContainer.tsx";
import {BORDER} from "../../../../core/style/Border.ts";
import {useSelectedDragContainer} from "../../../../core/hooks/useSelectedDragContainer.ts";
import {useUpdateSelectedDragContainer} from "../../../../core/hooks/useUpdateSelectedDragContainer.ts";
import {
    alignItems,
    horizontalAlign,
    justifyContent,
    verticalAlign
} from "../../../../core/utils/justifyContentAlignItems.ts";


export function VerticalHorizontalAlignmentPropertyEditor<T extends 'verticalAlign' | 'horizontalAlign'>(props: {
    property: T,
    label: string,
    style?: CSSProperties,
    styleLabel?: CSSProperties,
    dataSource: Array<string>
}) {
    const selectedDragContainer = useSelectedDragContainer();
    const updateSelectedDragContainer = useUpdateSelectedDragContainer();
    const {property, label, dataSource} = props;
    const [value, setValue] = useState<string | undefined>();
    useSignalEffect(() => {
        const container = selectedDragContainer.get();
        if (container === undefined) {
            return;
        }
        if (property === undefined) {
            return;
        }
        const defaultStyle = container.properties.defaultStyle ?? {};
        const type = defaultStyle.flexDirection === 'row' ? 'horizontal' : 'vertical';
        if (property === 'verticalAlign') {
            const value = verticalAlign({
                type,
                alignItems: defaultStyle.alignItems,
                justifyContent: defaultStyle.justifyContent
            });
            setValue(value);
        } else {
            const value = horizontalAlign({
                type,
                alignItems: defaultStyle.alignItems,
                justifyContent: defaultStyle.justifyContent
            });
            setValue(value);
        }
    })

    return <LabelContainer label={label} style={props.style} styleLabel={{width: 100, ...props.styleLabel}}>
        <select
            style={{
                width: '100%',
                border: BORDER,
                padding: '5px 10px',
                borderRadius: 20,
            }}
            value={value}
            onChange={(e) => {
                const value = e.target.value;
                updateSelectedDragContainer((selectedContainer) => {
                    selectedContainer.properties = {...selectedContainer.properties};
                    selectedContainer.properties.defaultStyle = {...selectedContainer.properties.defaultStyle};
                    const type = selectedContainer.properties.defaultStyle.flexDirection === 'row' ? 'horizontal' : 'vertical';
                    const defaultStyle = selectedContainer.properties.defaultStyle;
                    const currentVerticalAlign = verticalAlign({
                        type,
                        alignItems: defaultStyle.alignItems,
                        justifyContent: defaultStyle.justifyContent
                    })
                    const currentHorizontalAlign = horizontalAlign({
                        type,
                        alignItems: defaultStyle.alignItems,
                        justifyContent: defaultStyle.justifyContent
                    });
                    defaultStyle.alignItems = alignItems({
                        type,
                        verticalAlign: currentVerticalAlign,
                        horizontalAlign: currentHorizontalAlign,
                        [property]: value
                    });
                    defaultStyle.justifyContent = justifyContent({
                        type,
                        verticalAlign: currentVerticalAlign,
                        horizontalAlign: currentHorizontalAlign,
                        [property]: value
                    });
                })
            }}>
            {dataSource.map(key => {
                return <option value={key} key={key}>{key}</option>
            })}
        </select>
    </LabelContainer>
}