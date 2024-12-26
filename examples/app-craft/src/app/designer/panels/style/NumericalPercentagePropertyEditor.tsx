import {CSSProperties, useState} from "react";
import {notifiable, useSignalEffect} from "react-hook-signal";
import {LabelContainer} from "../../../../core/components/LabelContainer.tsx";
import {BORDER} from "../../../../core/style/Border.ts";
import {useSelectedDragContainer} from "../../../../core/hooks/useSelectedDragContainer.ts";
import {useUpdateSelectedDragContainer} from "../../../../core/hooks/useUpdateSelectedDragContainer.ts";
import {PropertyType} from "./PropertyType.ts";

/**
 * A property editor component for handling numerical percentage values.
 *
 * @param {Object} props - The props object containing the following properties:
 *   - property: The property to edit.
 *   - label: The label for the property.
 *   - style: Optional CSS properties for styling the component.
 *   - styleLabel: Optional CSS properties for styling the label.
 */
export function NumericalPercentagePropertyEditor(props: {
    property: PropertyType,
    label: string,
    style?: CSSProperties,
    styleLabel?: CSSProperties
}) {
    const selectedDragContainer = useSelectedDragContainer();
    const updateSelectedDragContainer = useUpdateSelectedDragContainer();
    const [typeOfValue, setTypeOfValue] = useState('n/a');
    const {property, label} = props;
    useSignalEffect(() => {
        const dragContainer = selectedDragContainer.get();
        if (dragContainer === undefined) {
            return;
        }
        dragContainer.properties = dragContainer.properties ?? {};
        dragContainer.properties.defaultStyle = dragContainer.properties.defaultStyle ?? {};
        const val: string = (dragContainer.properties?.defaultStyle[property] ?? '').toString() as unknown as string;
        if (val.endsWith('%')) {
            setTypeOfValue('%');
        } else if (val.endsWith('px')) {
            setTypeOfValue('px');
        } else {
            setTypeOfValue('n.a');
        }
    })

    function extractValue() {
        const selectedDragContainerItem = selectedDragContainer.get();

        if (selectedDragContainerItem === undefined) {
            return '';
        }
        const val: string = (((selectedDragContainerItem.properties?.defaultStyle ?? {})[property]) ?? '').toString();
        if (val.endsWith('%')) {
            return parseInt(val.replace('%', ''))
        }
        if (val.endsWith('px')) {
            return parseInt(val.replace('px', ''))
        }
        return val ?? ''
    }

    return <LabelContainer label={label} style={props.style} styleLabel={{width: 100, ...props.styleLabel}}>
        <notifiable.input style={{
            width: '100%',
            border: BORDER,
            padding: '5px 10px',
            borderRight: 'unset',
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20
        }}
                          value={extractValue}
                          onChange={(e) => {
                              const val = e.target.value;
                              const isPercentage = val.endsWith('%');
                              if (isPercentage) {
                                  setTypeOfValue('%')
                              }
                              const isPixel = val.endsWith('p');
                              if (isPixel) {
                                  setTypeOfValue('px')
                              }

                              updateSelectedDragContainer((selectedContainer) => {
                                  selectedContainer.properties = {...selectedContainer.properties};
                                  selectedContainer.properties.defaultStyle = {...selectedContainer.properties.defaultStyle};
                                  const isNanValue = isNaN(parseInt(val));
                                  if (typeOfValue === 'n.a') {
                                      selectedContainer.properties.defaultStyle[property] = val;
                                  } else if (typeOfValue === 'px' && !isNanValue) {
                                      selectedContainer.properties.defaultStyle[property] = `${val}${typeOfValue}`;
                                  } else if (typeOfValue === '%' && !isNanValue) {
                                      selectedContainer.properties.defaultStyle[property] = `${val}${typeOfValue}`;
                                  } else {
                                      selectedContainer.properties.defaultStyle[property] = val;
                                  }
                              })
                          }}/>
        <select
            style={{border: BORDER, borderTopRightRadius: 20, borderBottomRightRadius: 20}}
            value={typeOfValue}
            onChange={(e) => {
                const typeValue = e.target.value;
                const value = extractValue();
                updateSelectedDragContainer((selectedContainer) => {
                    selectedContainer.properties = {...selectedContainer.properties};
                    selectedContainer.properties.defaultStyle = {...selectedContainer.properties.defaultStyle};
                    if (typeValue !== 'n.a') {
                        selectedContainer.properties.defaultStyle[property] = `${value}${typeValue}`
                    } else {
                        selectedContainer.properties.defaultStyle[property] = `${value}`
                    }
                })
            }}>
            <option value={'n.a'}></option>
            <option value={'px'}>px</option>
            <option value={'%'}>%</option>
        </select>
    </LabelContainer>
}