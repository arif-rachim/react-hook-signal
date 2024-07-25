import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {useShowModal} from "../../modal/useShowModal.ts";
import {notifiable, useComputed} from "react-hook-signal";
import {MdAdd} from "react-icons/md";
import {Variable, VariableType} from "../AppDesigner.tsx";
import {Icon} from "../Icon.ts";
import {ConfirmationDialog} from "../ConfirmationDialog.tsx";
import {VariableEditorPanel} from "./VariableEditorPanel.tsx";
import {sortSignal} from "../sortSignal.ts";
import CollapsibleLabelContainer from "../collapsible-panel/CollapsibleLabelContainer.tsx";
import {Button} from "../button/Button.tsx";
import {colors} from "stock-watch/src/utils/colors.ts";

function renderVariableItem(deleteVariable: (variable?: Variable) => Promise<void>, editVariable: (forType: VariableType, variable?: Variable) => Promise<void>, forType: VariableType,context:AppDesignerContext) {

    return (variable: Variable) => {
        return <div style={{display: 'flex', gap: 10, padding: '5px 5px'}} key={variable.id}>
            <notifiable.div>
                {() => {
                    const allErrors = context.allErrorsSignal.get();
                    const error = allErrors.find(e => e.type === 'variable' && e.referenceId === variable.id);
                    if(error) {
                        return <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: colors.red
                        }}><Icon.Error/></div>
                    }
                    return <></>
                }}
            </notifiable.div>
            <div style={{flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis'}}>{variable.name}</div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }} onClick={() => deleteVariable(variable)}>
                <Icon.Delete style={{fontSize: 18}}/>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }} onClick={() => editVariable(forType, variable)}>
                <Icon.Detail style={{fontSize: 18}}/>
            </div>
        </div>
    };
}

/**
 * Represents a panel for managing variables.
 */
export function VariablesPanel() {
    const context = useContext(AppDesignerContext);
    const {allVariablesSignal} = context;
    const showModal = useShowModal();

    async function editVariable(forType: VariableType, variable?: Variable) {
        const result = await showModal<Variable>(closePanel => {
            return <AppDesignerContext.Provider value={context}>
                <VariableEditorPanel variable={variable} closePanel={closePanel} defaultType={forType}/>
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
        const signalsDependentOnThisVariable = allVariablesSignal.get().filter(i => (i.dependencies ?? []).includes(variable?.id ?? ''));
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

    const stateVariableList = useComputed(() => {
        return allVariablesSignal.get().filter(i => i.type === 'state').map(renderVariableItem(deleteVariable, editVariable, 'state',context));
    })
    const computedVariableList = useComputed(() => {
        return allVariablesSignal.get().filter(i => i.type === 'computed').map(renderVariableItem(deleteVariable, editVariable, 'computed',context));
    })
    const effectVariableList = useComputed(() => {
        return allVariablesSignal.get().filter(i => i.type === 'effect').map(renderVariableItem(deleteVariable, editVariable, 'effect',context));
    })

    return <>
        <CollapsibleLabelContainer label={'State'}>
            <Button onClick={() => editVariable('state')}
                    style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginBottom: 5}}>
                {'Add Signal State'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdAdd style={{fontSize: 20}}/>
                </div>
            </Button>
            <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                {stateVariableList}
            </notifiable.div>
        </CollapsibleLabelContainer>
        <CollapsibleLabelContainer label={'Computed'}>
            <Button onClick={() => editVariable('computed')}
                    style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginBottom: 5}}>
                {'Add Signal Computed'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdAdd style={{fontSize: 20}}/>
                </div>
            </Button>
            <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                {computedVariableList}
            </notifiable.div>
        </CollapsibleLabelContainer>
        <CollapsibleLabelContainer label={'Effect'}>
            <Button onClick={() => editVariable('effect')}
                    style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginBottom: 5}}>
                {'Add Signal Effect'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdAdd style={{fontSize: 20}}/>
                </div>
            </Button>
            <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                {effectVariableList}
            </notifiable.div>
        </CollapsibleLabelContainer>
    </>
}
