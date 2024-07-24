import {useSelectedDragContainer} from "../useSelectedDragContainer.ts";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {notifiable, useSignal} from "react-hook-signal";
import {Editor} from "@monaco-editor/react";
import {onBeforeMountHandler} from "../onBeforeHandler.ts";
import {Button} from "../button/Button.tsx";
import {LabelContainer} from "../label-container/LabelContainer.tsx";
import {ContainerPropertyType} from "../AppDesigner.tsx";
import {ZodType} from "zod";
import {zodTypeToJson} from "../zodSchemaToJson.ts";
import {Icon} from "../Icon.ts";
import {DependencyInputSelector} from "../dependency-selector/DependencyInputSelector.tsx";

/**
 * ComponentPropertyEditor is a React component that renders a property editor panel for a component.
 */
export function ComponentPropertyEditor(props: {
    closePanel: (param?: ContainerPropertyType) => void,
    name: string,
    type: ZodType
}) {
    const selectedDragContainer = useSelectedDragContainer();
    const initialValue = (selectedDragContainer.get()?.properties[props.name]) ?? createNewProps(props.type);
    const propsSignal = useSignal<ContainerPropertyType>(initialValue);
    const context = useContext(AppDesignerContext);
    const {allVariablesSignal} = context;
    const returnType = props.type;


    return <div style={{
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        width: '90vw',
        height: '90vh',
        gap: 10,
    }}>
        <LabelContainer label={'Dependency'} style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}
                        styleLabel={{width: 80}}>
            <notifiable.div>{() => {
                const props = propsSignal.get();
                return <DependencyInputSelector value={props.dependencies ?? []} valueToIgnore={[]} onChange={(result) => {
                    const item = {...props};
                    item.dependencies = result ?? [];
                    propsSignal.set({...item});
                }} />;
            }}</notifiable.div>
        </LabelContainer>
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', padding: 10, gap: 10}}>
            <notifiable.div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: 'red'
            }}>
                {() => {
                    const props = propsSignal.get();
                    const allVariables = allVariablesSignal.get();
                    const formula = props.formula ?? '';
                    const dependencies = props.dependencies ?? [];
                    return <Editor
                        language="javascript"
                        key={dependencies.join('-')}
                        beforeMount={onBeforeMountHandler({
                            dependencies,
                            allVariables,
                            returnType: zodTypeToJson(returnType)
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
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 10}}>
                <Button onClick={() => props.closePanel(propsSignal.get())} style={{
                    display: 'flex',
                    gap: 5,
                    alignItems: 'center'
                }}>
                    {'Save'}
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon.Save style={{fontSize: 18}}/>
                    </div>
                </Button>
                <Button onClick={() => props.closePanel(undefined)} style={{
                    display: 'flex',
                    gap: 5,
                    alignItems: 'center'
                }}>
                    {'Cancel'}
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <Icon.Exit style={{fontSize: 18}}/>
                    </div>
                </Button>
            </div>
        </div>
    </div>
}

function createNewProps(type: ZodType): ContainerPropertyType {
    return {
        type: type,
        formula: '',
        dependencies: []
    }
}
