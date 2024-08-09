import {CSSProperties, useState} from "react";
import {useSignalEffect} from "react-hook-signal";
import {LabelContainer} from "../../../label-container/LabelContainer.tsx";
import {BORDER} from "../../../Border.ts";
import {useSelectedDragContainer} from "../../../hooks/useSelectedDragContainer.ts";
import {useUpdateSelectedDragContainer} from "../../../hooks/useUpdateSelectedDragContainer.ts";
import {Container} from "../../../AppDesigner.tsx";


export function VerticalHorizontalAlignmentPropertyEditor<T extends keyof Pick<Container, 'verticalAlign' | 'horizontalAlign'>>(props: {
    property: T,
    label: string,
    style?: CSSProperties,
    styleLabel?: CSSProperties,
    dataSource: Array<Container[T]>
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
        setValue(container[property])
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
                    selectedContainer[property] = value as Container[T]
                })
            }}>
            {dataSource.map(key => {
                return <option value={key} key={key}>{key}</option>
            })}
        </select>
    </LabelContainer>
}