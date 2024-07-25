import {Icon} from "../Icon.ts";
import {notifiable} from "react-hook-signal";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import CollapsibleLabelContainer from "../collapsible-panel/CollapsibleLabelContainer.tsx";
import {ContainerPropertyType} from "../AppDesigner.tsx";
import {ComponentPropertyEditor} from "../property-editor/ComponentPropertyEditor.tsx";
import {useShowModal} from "../../modal/useShowModal.ts";
import {useUpdateDragContainer} from "../hooks/useUpdateSelectedDragContainer.ts";

export function BottomPanel() {
    const showModal = useShowModal();
    const context = useContext(AppDesignerContext);
    const update = useUpdateDragContainer();
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
                            if (e.type === 'property') {
                                const container = containers.find(c => c.id === e.referenceId)
                                type = container?.type;
                                name = e.propertyName;
                            }
                            if (e.type === 'variable') {
                                const v = variables.find(c => c.id === e.referenceId)
                                type = v?.type;
                                name = v?.name;
                            }
                            return <div key={`${e.referenceId}-${e.propertyName}`}
                                        style={{display: 'flex', flexDirection: 'row'}}>
                                <div style={{width: 100, flexShrink: 0, padding: '2px 10px'}}>{type}</div>
                                <div style={{width: 100, flexShrink: 0, padding: '2px 10px'}}>{name}</div>
                                <div style={{flexGrow: 1, padding: '2px 10px'}}>{e.message}</div>
                                <div style={{width: 50, flexShrink: 0, padding: '2px 10px',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={async () => {

                                    if(e.type === 'property'){
                                        const result = await showModal<ContainerPropertyType>(closePanel => {
                                            return <AppDesignerContext.Provider value={context}>
                                                <ComponentPropertyEditor closePanel={closePanel} name={e.propertyName??''} containerId={e?.referenceId ?? ''}/>
                                            </AppDesignerContext.Provider>
                                        });
                                        if (result) {
                                            update(e.referenceId ?? '',selectedContainer => {
                                                selectedContainer.properties = {...selectedContainer.properties, [e.propertyName ?? '']: result}
                                            })
                                        }
                                    }

                                    if(e.type === 'variable'){
                                        // const result = await showModal<Variable>(closePanel => {
                                        //     return <AppDesignerContext.Provider value={context}>
                                        //         <VariableEditorPanel variable={variable} closePanel={closePanel} defaultType={forType}/>
                                        //     </AppDesignerContext.Provider>
                                        // })
                                        // if (result) {
                                        //     const variables = [...allVariablesSignal.get()];
                                        //     const indexOfVariable = variables.findIndex(i => i.id === result.id);
                                        //     if (indexOfVariable >= 0) {
                                        //         variables.splice(indexOfVariable, 1, result);
                                        //     } else {
                                        //         variables.push(result);
                                        //     }
                                        //     allVariablesSignal.set(variables.sort(sortSignal));
                                        // }
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