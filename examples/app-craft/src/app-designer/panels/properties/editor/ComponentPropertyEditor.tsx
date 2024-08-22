import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {Editor} from "@monaco-editor/react";
import {onBeforeMountHandler} from "../../../onBeforeHandler.ts";
import {Button} from "../../../button/Button.tsx";
import {ContainerPropertyType} from "../../../AppDesigner.tsx";
import {zodTypeToJson} from "../../../zodSchemaToJson.ts";
import {Icon} from "../../../Icon.ts";
import {BORDER} from "../../../Border.ts";
import {useUpdateDragContainer} from "../../../hooks/useUpdateSelectedDragContainer.ts";
import {useAppContext} from "../../../hooks/useAppContext.ts";
import {useRemoveDashboardPanel} from "../../../dashboard/useRemoveDashboardPanel.ts";

/**
 * ComponentPropertyEditor is a React component that renders a property editor panel for a component.
 */
export function ComponentPropertyEditor(props: {
    name: string,
    containerId: string,
    panelId: string
}) {
    const context = useAppContext();
    const removePanel = useRemoveDashboardPanel();
    const {
        allPageVariablesSignal,
        allApplicationVariablesSignal,
        allPageFetchersSignal,
        elements,
        allPagesSignal,
        allTablesSignal,
        allApplicationCallablesSignal,
        allPageQueriesSignal,
        allApplicationQueriesSignal,
        allApplicationFetchersSignal
    } = context;

    const allVariablesSignal = useComputed(() => {
        return [...allPageVariablesSignal.get(), ...allApplicationVariablesSignal.get()]
    })
    const allFetchersSignal = useComputed(() => {
        return [...allPageFetchersSignal.get(), ...allApplicationFetchersSignal.get()]
    })
    const allQueriesSignal = useComputed(() => {
        return [...allPageQueriesSignal.get(), ...allApplicationQueriesSignal.get()]
    })
    const selectedDragContainer = context.allContainersSignal.get().find(c => c.id === props.containerId)!;
    const returnType = elements ? elements[selectedDragContainer?.type]?.property[props.name] : undefined;
    const initialValue = (selectedDragContainer?.properties[props.name]) ?? createNewProps();
    const propsSignal = useSignal<ContainerPropertyType>(initialValue);
    const isModified = useSignal<boolean>(false)
    const update = useUpdateDragContainer();
    if (returnType === undefined) {
        return <></>
    }
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        flexGrow: 1
    }}>
        <notifiable.div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'auto'
        }}>
            {() => {
                const props = propsSignal.get();
                const allVariables = allVariablesSignal.get();
                const allFetchers = allFetchersSignal.get();
                const allQueries = allQueriesSignal.get();
                const allTables = allTablesSignal.get();
                const allCallables = allApplicationCallablesSignal.get();
                const formula = props.formula ?? '';
                const allPages = allPagesSignal.get();
                return <Editor
                    language="javascript"
                    beforeMount={onBeforeMountHandler({
                        allVariables,
                        allFetchers,
                        returnType: zodTypeToJson(returnType),
                        allPages,
                        allTables,
                        allCallables,
                        allQueries
                    })}
                    value={formula}
                    options={{selectOnLineNumbers: true}}
                    onChange={(value?: string) => {
                        const item = {...propsSignal.get()};
                        item.formula = value ?? '';
                        propsSignal.set({...item});
                        isModified.set(true);
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
                removePanel(props.panelId);
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
            <Button onClick={async () => {
                propsSignal.set(initialValue);
                isModified.set(false);
            }} style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }}>
                {'Reset'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon.Reset style={{fontSize: 18}}/>
                </div>
            </Button>
        </div>
    </div>
}

function createNewProps(): ContainerPropertyType {
    return {
        formula: '',
    }
}
