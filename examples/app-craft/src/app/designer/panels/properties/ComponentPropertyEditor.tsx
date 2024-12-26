import {notifiable, useSignal} from "react-hook-signal";
import {Editor} from "@monaco-editor/react";
import {initiateSchemaTS} from "../../editor/initiateSchemaTS.ts";
import {Button} from "../../../button/Button.tsx";
import {Container, ContainerPropertyType} from "../../AppDesigner.tsx";
import {zodTypeToJson} from "../../../../core/utils/zodSchemaToJson.ts";
import {BORDER} from "../../../../core/style/Border.ts";
import {useUpdateDragContainer} from "../../../../core/hooks/useUpdateSelectedDragContainer.ts";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {useRemoveDashboardPanel} from "../../../../core/style/useRemoveDashboardPanel.ts";
import {z, ZodType, ZodTypeAny} from "zod";
import {useContext, useEffect} from "react";
import {PanelIsFocusedContext} from "../../../Dashboard.tsx";

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
    const isFocused = useContext(PanelIsFocusedContext);
    const isFocusedSignal = useSignal(isFocused);
    useEffect(() => {
        isFocusedSignal.set(isFocused);
    }, [isFocused, isFocusedSignal]);
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

    // let's find parents form
    const parentFormSchema = getParentFormSchema(selectedDragContainer, context.allContainersSignal.get())

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
                if(!isFocusedSignal.get()) {
                    return false;
                }
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

                            formSchema: parentFormSchema
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
                alignItems: 'center'
            }} icon={'IoIosSave'}>
                {'Save'}
            </Button>
            <Button onClick={async () => {
                propsSignal.set(initialValue);
                isModified.set(false);
            }} style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }} icon={'IoIosUndo'}>
                {'Reset'}
            </Button>
        </div>
    </div>
}

function createNewProps(): ContainerPropertyType {
    return {
        formula: '',
    }
}


function getParentFormSchema(selectedContainer: Container, allContainers: Container[]) {
    const container = allContainers.find(i => i.id === selectedContainer?.parent);
    if (container) {
        if (container.type !== 'form') {
            if (container.parent) {
                return getParentFormSchema(container, allContainers);
            }
            return '';
        }
        if ('schema' in container.properties && container.properties.schema && container.properties.schema.formula) {
            try {
                const fun = new Function('module', 'z', container.properties.schema.formula);
                const module: { exports: ZodType | undefined } = {exports: undefined};
                fun.apply(null, [module, z]);
                if (module.exports) {
                    const type = module.exports as ZodType
                    return zodTypeToJson(type)
                }
            } catch (err) {
                console.error(err);
            }
        }
    }
    return '';
}