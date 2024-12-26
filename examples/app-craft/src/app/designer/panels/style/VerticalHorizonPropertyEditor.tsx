import {BORDER} from "../../../../core/style/Border.ts";
import {LabelContainer} from "../../../../core/components/LabelContainer.tsx";
import {CSSProperties, useState} from "react";
import {useSelectedDragContainer} from "../../../../core/hooks/useSelectedDragContainer.ts";
import {useUpdateSelectedDragContainer} from "../../../../core/hooks/useUpdateSelectedDragContainer.ts";
import {useSignalEffect} from "react-hook-signal";

export function VerticalHorizonPropertyEditor(props: {
    label: string,
    style?: CSSProperties,
    styleLabel?: CSSProperties
}) {
    const selectedDragContainer = useSelectedDragContainer();
    const updateSelectedDragContainer = useUpdateSelectedDragContainer();
    const [value, setValue] = useState<string | undefined>();

    useSignalEffect(() => {
        const container = selectedDragContainer.get();
        if (container === undefined) {
            return;
        }
        const defaultStyle = container.properties.defaultStyle ?? {};
        setValue(defaultStyle.flexDirection === 'row' ? 'horizontal' : 'vertical');
    })


    return <LabelContainer label={props.label} style={props.style} styleLabel={{width: 100, ...props.styleLabel}}>
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
                    selectedContainer.properties.defaultStyle.flexDirection = value === 'horizontal' ? 'row' : 'column'
                })
            }}>
            {[{label: 'Vertical', value: 'vertical'}, {label: 'Horizontal', value: 'horizontal'}].map(item => {
                return <option value={item.value} key={item.value}>{item.label}</option>
            })}
        </select>
    </LabelContainer>
}