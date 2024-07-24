import {useSelectedDragContainer} from "../hooks/useSelectedDragContainer.ts";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {notifiable, useSignal} from "react-hook-signal";
import {Editor} from "@monaco-editor/react";
import {onBeforeMountHandler} from "../onBeforeHandler.ts";
import {Button} from "../button/Button.tsx";
import {LabelContainer} from "../label-container/LabelContainer.tsx";
import {ContainerPropertyType} from "../AppDesigner.tsx";
import {ZodFunction, ZodType} from "zod";
import {zodTypeToJson} from "../zodSchemaToJson.ts";
import {Icon} from "../Icon.ts";
import {DependencyInputSelector} from "../dependency-selector/DependencyInputSelector.tsx";
import CollapsibleLabelContainer from "../collapsible-panel/CollapsibleLabelContainer.tsx";
import {BORDER} from "../Border.ts";

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
    const isFunction = returnType instanceof ZodFunction;
    const propertyDescription = "This property can dependent on certain variables, either state or computed. Whenever these state or computed variables are accessed, which occurs through the invocation of the get() method, the block of code will automatically execute. As a result, the updated value of the variable will be automatically bound to the corresponding component property, ensuring that the component always reflects the most current data.";
    const callbackDescription = 'This callback can dependent on certain variables, either state or computed. However, the callback function will not automatically monitor changes in the values of state or computed variables. Instead, the callback is invoked directly by the application based on specific events or triggers.'
    const description = isFunction ? callbackDescription : propertyDescription;
    return <div style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        width: '90vw',
        height: '90vh',
        overflow: 'auto',
        gap: 10,
    }}>
        <div style={{fontSize: 20}}>
            {`Manage ${isFunction ? 'Callback' : 'Property'} : ${props.name} `}
        </div>
        <div>{description}</div>

        <LabelContainer label={'Variable to depend'}>
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
        <CollapsibleLabelContainer label={'Code'} style={{flexGrow: 1}} styleContent={{padding: '5px 10px'}}>
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
        </CollapsibleLabelContainer>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 10,
            borderTop: BORDER,
            paddingTop: 10
        }}>
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
}

function createNewProps(type: ZodType): ContainerPropertyType {
    return {
        type: type,
        formula: '',
        dependencies: []
    }
}
