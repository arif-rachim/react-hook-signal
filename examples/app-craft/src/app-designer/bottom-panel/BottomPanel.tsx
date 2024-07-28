import {Icon} from "../Icon.ts";
import {notifiable} from "react-hook-signal";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import CollapsibleLabelContainer from "../collapsible-panel/CollapsibleLabelContainer.tsx";
import {ContainerPropertyType, Variable} from "../AppDesigner.tsx";
import {ComponentPropertyEditor} from "../property-editor/ComponentPropertyEditor.tsx";
import {useShowModal} from "../../modal/useShowModal.ts";
import {useUpdateDragContainer} from "../hooks/useUpdateSelectedDragContainer.ts";
import {VariableEditorPanel} from "../variable-editor/VariableEditorPanel.tsx";
import {useUpdateVariable} from "../hooks/useUpdateVariable.ts";

export function BottomPanel() {
    const showModal = useShowModal();
    const context = useContext(AppDesignerContext);
    const update = useUpdateDragContainer();
    const updateVariable = useUpdateVariable();
    const {allErrorsSignal, allContainersSignal, allVariablesSignal} = useContext(AppDesignerContext);
    return <div style={{display:'flex',flexDirection:'column',backgroundColor:'rgba(255,255,255,1'}}>

        <CollapsibleLabelContainer label={'Errors'}>
            <notifiable.div
                style={{display: 'flex', flexDirection: 'column', color: colors.red, overflow: 'auto', maxHeight: 100}}>
                {() => {
                    const errors = allErrorsSignal.get();
                    const containers = allContainersSignal.get();
                    const variables = allVariablesSignal.get();

                    return <>

                        {errors.map(e => {
                            let type: string | undefined = undefined;
                            let name: string | undefined = undefined;
                            let referenceId : string | undefined = undefined;
                            if (e.type === 'property') {
                                const container = containers.find(c => c.id === e.containerId)
                                type = container?.type;
                                name = e.propertyName;
                                referenceId = e.containerId;
                            }
                            if (e.type === 'variable') {
                                const v = variables.find(c => c.id === e.variableId)
                                type = v?.type;
                                name = v?.name;
                                referenceId = e.variableId
                            }

                            return <div key={`${referenceId}-${name}`}
                                        style={{display: 'flex', flexDirection: 'row'}}>
                                <div style={{width: 100, flexShrink: 0, padding: '2px 10px'}}>{type}</div>
                                <div style={{width: 100, flexShrink: 0, padding: '2px 10px'}}>{name}</div>
                                <div style={{flexGrow: 1, padding: '2px 10px'}}>{e.message}</div>
                                <div style={{width: 50, flexShrink: 0, padding: '2px 10px',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={async () => {

                                    if(e.type === 'property'){
                                        const result = await showModal<ContainerPropertyType>(closePanel => {
                                            return <AppDesignerContext.Provider value={context}>
                                                <ComponentPropertyEditor closePanel={closePanel} name={e.propertyName??''} containerId={e?.containerId ?? ''}/>
                                            </AppDesignerContext.Provider>
                                        });
                                        if (result) {
                                            update(e.containerId ?? '',selectedContainer => {
                                                selectedContainer.properties = {...selectedContainer.properties, [e.propertyName ?? '']: result}
                                            })
                                        }
                                    }

                                    if(e.type === 'variable'){
                                        const result = await showModal<Variable>(closePanel => {
                                            return <AppDesignerContext.Provider value={context}>
                                                <VariableEditorPanel variableId={e.variableId} closePanel={closePanel} defaultType={'state'}/>
                                            </AppDesignerContext.Provider>
                                        })
                                        if (result) {
                                            updateVariable(result);
                                        }
                                    }

                                }}><Icon.Detail style={{fontSize:18}}/></div>
                            </div>
                        })}
                    </>
                }}
            </notifiable.div>
        </CollapsibleLabelContainer>

    </div>
}