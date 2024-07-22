import {useSelectedDragContainer} from "../useSelectedDragContainer.ts";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {notifiable, useSignal} from "react-hook-signal";
import {Editor} from "@monaco-editor/react";
import {onBeforeMountHandler} from "../onBeforeHandler.ts";
import {Button} from "../button/Button.tsx";
import {BORDER} from "../Border.ts";
import {LabelContainer} from "../label-container/LabelContainer.tsx";
import {DependencySelector} from "../DependencySelector.tsx";
import {useShowModal} from "../../modal/useShowModal.ts";
import {ContainerPropertyType} from "../AppDesigner.tsx";
import {ZodType} from "zod";
import {zodTypeToJson} from "../zodSchemaToJson.ts";
import {Icon} from "../Icon.ts";

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
    const showModal = useShowModal();
    const returnType = props.type;

    async function showDependencySelector() {
        const props = propsSignal.get();
        const result = await showModal<Array<string> | 'cancel'>(closePanel => {
            return <AppDesignerContext.Provider value={context}>
                <DependencySelector
                    closePanel={closePanel}
                    value={props.dependencies ?? []}
                    signalsToFilterOut={[]}
                />
            </AppDesignerContext.Provider>
        });
        if (result !== 'cancel') {
            props.dependencies = result;
            propsSignal.set({...props});
        }

    }

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
            <notifiable.div
                style={{border: BORDER, display: 'flex', gap: 5, padding: 5, flexGrow: 1, minHeight: 22}}
                onClick={showDependencySelector}>{() => {
                const props = propsSignal.get();
                const allVariables = allVariablesSignal.get();
                return props.dependencies.map(dep => {
                    const variable = allVariables.find(i => i.id === dep);
                    return <div key={dep} style={{border: BORDER, borderRadius: 3, padding: '3px 5px'}}>
                        {variable?.name}
                    </div>
                })
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
