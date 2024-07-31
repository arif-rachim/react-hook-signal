import {useContext} from "react";
import {AppDesignerContext} from "../../../AppDesignerContext.ts";
import {notifiable, useSignal} from "react-hook-signal";
import {Editor} from "@monaco-editor/react";
import {onBeforeMountHandler} from "../../../onBeforeHandler.ts";
import {Button} from "../../../button/Button.tsx";
import {LabelContainer} from "../../../label-container/LabelContainer.tsx";
import {ContainerPropertyType} from "../../../AppDesigner.tsx";
import {zodTypeToJson} from "../../../zodSchemaToJson.ts";
import {Icon} from "../../../Icon.ts";
import {DependencyInputSelector} from "../../../dependency-selector/DependencyInputSelector.tsx";
import {BORDER} from "../../../Border.ts";
import {useUpdateDragContainer} from "../../../hooks/useUpdateSelectedDragContainer.ts";

/**
 * ComponentPropertyEditor is a React component that renders a property editor panel for a component.
 */
export function ComponentPropertyEditor(props: {
    name: string,
    containerId: string,
}) {
    const context = useContext(AppDesignerContext);
    const {allVariablesSignal, elements, allPagesSignal} = context;
    const selectedDragContainer = context.allContainersSignal.get().find(c => c.id === props.containerId)!;
    const returnType = elements[selectedDragContainer?.type].property[props.name];
    const initialValue = (selectedDragContainer?.properties[props.name]) ?? createNewProps();
    const propsSignal = useSignal<ContainerPropertyType>(initialValue);

    const update = useUpdateDragContainer();
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        flexGrow: 1
    }}>

        <LabelContainer label={'Dependency'} style={{flexDirection: 'row', alignItems: 'center', gap: 10, margin: 10}}>
            <notifiable.div>{() => {
                const props = propsSignal.get();
                return <DependencyInputSelector value={props.dependencies ?? []} valueToIgnore={[]}
                                                onChange={(result) => {
                                                    const item = {...props};
                                                    item.dependencies = result ?? [];
                                                    propsSignal.set({...item});
                                                }}/>;
            }}</notifiable.div>
        </LabelContainer>
        <notifiable.div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            {() => {
                const props = propsSignal.get();
                const allVariables = allVariablesSignal.get();
                const formula = props.formula ?? '';
                const dependencies = props.dependencies ?? [];
                const allPages = allPagesSignal.get();
                return <Editor
                    language="javascript"
                    key={dependencies.join('-')}
                    beforeMount={onBeforeMountHandler({
                        dependencies,
                        allVariables,
                        returnType: zodTypeToJson(returnType),
                        allPages
                    })}
                    value={formula}
                    options={{selectOnLineNumbers: true}}
                    onChange={(value?: string) => {
                        const item = propsSignal.get();
                        item.formula = value ?? '';
                        propsSignal.set({...item});
                    }}
                />
            }}
        </notifiable.div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 10,
            borderTop: BORDER,
            padding: 10
        }}>
            <Button onClick={() => {
                update(props.containerId, selectedContainer => {
                    selectedContainer.properties = {...selectedContainer.properties, [props.name]: propsSignal.get()}
                })
            }} style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }}>
                {'Save'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon.Save style={{fontSize: 18}}/>
                </div>
            </Button>
        </div>
    </div>
}

function createNewProps(): ContainerPropertyType {
    return {
        formula: '',
        dependencies: []
    }
}
