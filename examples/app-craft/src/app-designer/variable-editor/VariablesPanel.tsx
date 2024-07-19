import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {useShowModal} from "../../modal/useShowModal.ts";
import {notifiable, useComputed} from "react-hook-signal";
import {LabelContainer} from "../LabelContainer.tsx";
import {BORDER} from "../Border.ts";
import {MdAdd} from "react-icons/md";
import {Variable} from "../AppDesigner.tsx";
import {Icon} from "../Icon.ts";
import {ConfirmationDialog} from "../ConfirmationDialog.tsx";
import {VariableEditorPanel} from "./VariableEditorPanel.tsx";
import {sortSignal} from "../sortSignal.ts";

/**
 * Represents a panel for managing variables.
 */
export function VariablesPanel() {
    const context = useContext(AppDesignerContext);
    const {allVariablesSignal} = context;
    const showModal = useShowModal();

    async function editVariable(variable?: Variable) {
        const result = await showModal<Variable>(closePanel => {
            return <AppDesignerContext.Provider value={context}>
                <VariableEditorPanel variable={variable} closePanel={closePanel}/>
            </AppDesignerContext.Provider>
        })
        if (result) {
            const variables = [...allVariablesSignal.get()];
            const indexOfVariable = variables.findIndex(i => i.id === result.id);
            if (indexOfVariable >= 0) {
                variables.splice(indexOfVariable, 1, result);
            } else {
                variables.push(result);
            }
            allVariablesSignal.set(variables.sort(sortSignal));
        }
    }

    async function deleteVariable(variable?: Variable) {
        const signalsDependentOnThisVariable = allVariablesSignal.get().filter(i => (i.dependency ?? []).includes(variable?.id ?? ''));
        if (signalsDependentOnThisVariable.length) {
            await showModal(closePanel => {
                const message = <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div>Unable to delete due to signals referred in :</div>
                    {signalsDependentOnThisVariable.map(i => <code key={i.id}>{i.name}</code>)}
                </div>
                return <ConfirmationDialog message={message} closePanel={closePanel} buttons={['Ok']}/>
            });
        } else {
            const deleteVariableConfirm = await showModal<string>(closePanel => {
                return <ConfirmationDialog message={'Are you sure you want to delete this variable ?'}
                                           closePanel={closePanel}/>
            })
            if (deleteVariableConfirm === 'Yes') {
                const variables = allVariablesSignal.get().filter(i => i.id !== variable?.id);
                allVariablesSignal.set(variables.sort(sortSignal));
            }
        }
    }

    const variableList = useComputed(() => {
        return allVariablesSignal.get().map((variable) => {
            return <LabelContainer label={<div style={{display:'flex',height:'100%'}}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: BORDER,
                    paddingRight:5
                }}>
                    {variable.type === 'effect' && <Icon.Effect/>}
                    {variable.type === 'computed' && <Icon.Computed/>}
                    {variable.type === 'state' && <Icon.State/>}
                </div>
                <div style={{display:'flex',alignItems:'center',paddingLeft:5}}>{variable.name}</div>
            </div>} key={variable.id} style={{
                flexDirection: 'row',
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderBottom: BORDER,
            }} styleOnHovered={{backgroundColor: 'rgba(0,0,0,0.1)'}} styleContent={{justifyContent: 'flex-end'}}
                                   styleLabel={{paddingLeft: 5, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: BORDER,
                    padding: '5px'
                }} onClick={() => deleteVariable(variable)}>
                    <Icon.Delete/>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px'
                }} onClick={() => editVariable(variable)}>
                    <Icon.Detail/>
                </div>
            </LabelContainer>
        })
    })
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        backgroundColor: 'rgba(255,255,255,0.9)',
        height: '100%'
    }}>
        <div style={{display: 'flex'}}>
            <input type={'search'} style={{flexGrow: 1,paddingLeft:5, border: 'unset',borderTop:BORDER,borderBottom:BORDER, minWidth: 0, width: 100, flexShrink: 1}}/>
            <div style={{display: 'flex', border: BORDER,borderRight:'unset', alignItems: 'center', cursor: 'pointer'}}
                 onClick={() => editVariable()}>
                <div style={{marginLeft: 5}}>Add</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdAdd style={{fontSize: 20}}/>
                </div>
            </div>
        </div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
            {variableList}
        </notifiable.div>
    </div>
}
