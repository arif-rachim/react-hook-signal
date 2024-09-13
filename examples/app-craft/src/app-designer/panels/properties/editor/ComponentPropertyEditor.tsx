import {notifiable, useSignal} from "react-hook-signal";
import {Editor} from "@monaco-editor/react";
import {initiateSchemaTS} from "../../../initiateSchemaTS.ts";
import {Button} from "../../../button/Button.tsx";
import {ContainerPropertyType} from "../../../AppDesigner.tsx";
import {zodTypeToJson} from "../../../zodSchemaToJson.ts";
import {Icon} from "../../../Icon.ts";
import {BORDER} from "../../../Border.ts";
import {useUpdateDragContainer} from "../../../hooks/useUpdateSelectedDragContainer.ts";
import {useAppContext} from "../../../hooks/useAppContext.ts";
import {useRemoveDashboardPanel} from "../../../dashboard/useRemoveDashboardPanel.ts";
import {ZodTypeAny} from "zod";

/**
 * ComponentPropertyEditor is a React component that renders a property editor panel for a component.
 */
export function ComponentPropertyEditor(props: {
    name: string,
    containerId: string,
    panelId: string,
    returnTypeZod?: ZodTypeAny,
}) {
    const context = useAppContext();
    const removePanel = useRemoveDashboardPanel();
    const {
        allPageVariablesSignal,
        allApplicationVariablesSignal,
        allPageFetchersSignal,
        allPageCallablesSignal,
        elements,
        allPagesSignal,
        allTablesSignal,
        allApplicationCallablesSignal,
        allPageQueriesSignal,
        allApplicationQueriesSignal,
        allApplicationFetchersSignal
    } = context;

    const selectedDragContainer = context.allContainersSignal.get().find(c => c.id === props.containerId)!;
    const returnTypeZod = props.returnTypeZod ? props.returnTypeZod : elements ? elements[selectedDragContainer?.type]?.property[props.name] : undefined;
    const initialValue = (selectedDragContainer?.properties[props.name]) ?? createNewProps();
    const propsSignal = useSignal<ContainerPropertyType>(initialValue);
    const isModified = useSignal<boolean>(false)
    const update = useUpdateDragContainer();
    if (returnTypeZod === undefined) {
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

                const allPages = allPagesSignal.get();
                const allTables = allTablesSignal.get();
                const formula = props.formula;

                const allApplicationQueries = allApplicationQueriesSignal.get();
                const allApplicationVariables = allApplicationVariablesSignal.get();
                const allApplicationCallables = allApplicationCallablesSignal.get();
                const allApplicationFetchers = allApplicationFetchersSignal.get();

                const allPageQueries = allPageQueriesSignal.get();
                const allPageVariables = allPageVariablesSignal.get();
                const allPageFetchers = allPageFetchersSignal.get();
                const allPageCallables = allPageCallablesSignal.get();

                const returnType = zodTypeToJson(returnTypeZod);
                return <Editor
                    language="javascript"
                    beforeMount={(monaco) => {
                        const dtsContent = initiateSchemaTS({
                            returnType,
                            allPages,
                            allTables,

                            allApplicationQueries,
                            allApplicationVariables,
                            allApplicationFetchers,
                            allApplicationCallables,

                            allPageQueries,
                            allPageVariables,
                            allPageFetchers,
                            allPageCallables,
                        })
                        monaco.languages.typescript.javascriptDefaults.addExtraLib(dtsContent, "ts:filename/validation-source.d.ts");
                    }}
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
