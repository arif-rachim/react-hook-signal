import {useSelectedDragContainer} from "./useSelectedDragContainer.ts";
import {useUpdateSelectedDragContainer} from "./useUpdateSelectedDragContainer.ts";
import {useContext} from "react";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {notifiable} from "react-hook-signal";
import {Editor} from "@monaco-editor/react";
import {onBeforeMountHandler} from "./onBeforeHandler.ts";
import {ValueCallbackType} from "./LayoutBuilderProps.ts";
import {Button} from "./Button.tsx";
import {Container} from "./AppDesigner.tsx";

/**
 * ComponentPropertyEditor is a React component that renders a property editor panel for a component.
 */
export function ComponentPropertyEditor(props: { closePanel: () => void, name: string, type: 'value' | 'callback' }) {
    const selectedDragContainer = useSelectedDragContainer();
    const update = useUpdateSelectedDragContainer();
    const {allVariablesSignal} = useContext(AppDesignerContext);
    return <div style={{backgroundColor: '#FAFAFA', width: 600, height: 800, display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', padding: 10, gap: 10}}>
            <notifiable.div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'auto',
                backgroundColor: 'red'
            }}>
                {() => {
                    const container = selectedDragContainer.get();
                    const allVariables = allVariablesSignal.get();
                    let formula = '';
                    if (container !== undefined) {
                        formula = container.properties[props.name]?.formula ?? ''
                    }
                    return <Editor
                        language="javascript"
                        beforeMount={onBeforeMountHandler({dependencies: [], allVariables})}
                        value={formula}
                        options={{selectOnLineNumbers: true}}
                        onChange={(value?: string) => {
                            update((item: Container) => {
                                const name = props.name;
                                const cloneProps = {...item.properties} as Record<string, {
                                    formula: string,
                                    type: ValueCallbackType
                                }>;
                                cloneProps[name] = {formula: value ?? '', type: props.type}
                                item.properties = cloneProps;
                            })
                        }}
                    />
                }}
            </notifiable.div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                <Button onClick={props.closePanel}>Close</Button>
            </div>
        </div>
    </div>
}

