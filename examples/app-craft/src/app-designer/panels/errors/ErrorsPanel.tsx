import {notifiable} from "react-hook-signal";
import {colors} from "stock-watch/src/utils/colors.ts";
import {ContainerPropertyType} from "../../AppDesigner.tsx";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {ComponentPropertyEditor} from "../properties/editor/ComponentPropertyEditor.tsx";
import {VariableEditorPanel} from "../variables/editor/VariableEditorPanel.tsx";
import {Icon} from "../../Icon.ts";
import {useShowModal} from "../../../modal/useShowModal.ts";
import {useContext} from "react";
import {useUpdateDragContainer} from "../../hooks/useUpdateSelectedDragContainer.ts";
import {useAddDashboardPanel} from "../../../dashboard/useAddDashboardPanel.tsx";

export function ErrorsPanel() {
    const showModal = useShowModal();
    const context = useContext(AppDesignerContext);
    const update = useUpdateDragContainer();
    const addPanel = useAddDashboardPanel();
    const {allErrorsSignal, allContainersSignal, allVariablesSignal} = useContext(AppDesignerContext);
    return <notifiable.div
            style={{display: 'flex', flexDirection: 'column', color: colors.red, overflow: 'auto', maxHeight: 100,padding:'10px 0px'}}>
            {() => {
                let errors = allErrorsSignal.get();
                const containers = allContainersSignal.get();
                const variables = allVariablesSignal.get();
                errors = errors.filter(e => {
                    if (e.type === 'property') {
                        return containers.findIndex(c => e.containerId === c.id) >= 0
                    }
                    if (e.type === 'variable') {
                        return variables.findIndex(c => e.variableId === c.id) >= 0
                    }
                    return false;
                })
                return <>

                    {errors.map(e => {
                        let type: string | undefined = undefined;
                        let name: string | undefined = undefined;
                        let referenceId: string | undefined = undefined;
                        if (e.type === 'property') {
                            const container = containers.find(c => c.id === e.containerId);
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

                        return <div key={`${e.message}-${referenceId}-${name}`}
                                    style={{display: 'flex', flexDirection: 'row', padding: '0px 20px'}}>
                            <div style={{
                                width: 100,
                                flexShrink: 0,
                                padding: '2px 10px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>{type}</div>
                            <div style={{
                                width: 100,
                                flexShrink: 0,
                                padding: '2px 10px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>{name}</div>
                            <div style={{flexGrow: 1, padding: '2px 10px'}}>{e.message}</div>
                            <div style={{
                                width: 50,
                                flexShrink: 0,
                                padding: '2px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }} onClick={async () => {

                                if (e.type === 'property') {
                                    const result = await showModal<ContainerPropertyType>(closePanel => {
                                        return <AppDesignerContext.Provider value={context}>
                                            <ComponentPropertyEditor closePanel={closePanel} name={e.propertyName ?? ''}
                                                                     containerId={e?.containerId ?? ''}/>
                                        </AppDesignerContext.Provider>
                                    });
                                    if (result) {
                                        update(e.containerId ?? '', selectedContainer => {
                                            selectedContainer.properties = {
                                                ...selectedContainer.properties,
                                                [e.propertyName ?? '']: result
                                            }
                                        })
                                    }
                                }

                                if (e.type === 'variable') {
                                    addPanel({
                                        position:'center',
                                        component : () => {
                                            return <VariableEditorPanel variableId={e.variableId} closePanel={() => {}} defaultType={'state'}/>
                                        },
                                        title : 'Edit Variable',
                                        Icon : Icon.Component,
                                        id : e.variableId
                                    })

                                }

                            }}><Icon.Detail style={{fontSize: 18}}/></div>
                        </div>
                    })}
                </>
            }}
        </notifiable.div>
}