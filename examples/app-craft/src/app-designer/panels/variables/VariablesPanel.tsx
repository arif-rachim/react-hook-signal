import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {useUpdatePageSignal} from "../../hooks/useUpdatePageSignal.ts";
import {useShowModal} from "../../../modal/useShowModal.ts";
import {Variable, VariableType} from "../../AppDesigner.tsx";
import {VariableEditorPanel} from "./editor/VariableEditorPanel.tsx";
import {ConfirmationDialog} from "../../ConfirmationDialog.tsx";
import {sortSignal} from "../../sortSignal.ts";
import {notifiable, useSignal} from "react-hook-signal";
import {Button} from "../../button/Button.tsx";
import {MdAdd} from "react-icons/md";
import {colors} from "stock-watch/src/utils/colors.ts";
import {Icon} from "../../Icon.ts";
import {useAddDashboardPanel} from "../../dashboard/useAddDashboardPanel.tsx";
import {guid} from "../../../utils/guid.ts";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {useUpdateApplication} from "../../hooks/useUpdateApplication.ts";
import {Signal} from "signal-polyfill";
import {BORDER} from "../../Border.ts";
import {useRemoveDashboardPanel} from "../../dashboard/useRemoveDashboardPanel.ts";

function RenderVariable(props: {
    isFocused: boolean,
    variable: Variable,
    focusedItemSignal: Signal.State<string>,
    editVariable: (forType: VariableType, variable?: Variable) => Promise<void>,
    context: AppDesignerContext,
    deleteVariable: (variable: Variable) => Promise<void>
}) {
    const {isFocused, focusedItemSignal, editVariable, variable, deleteVariable, context} = props;
    return <div style={{
        display: 'flex',
        gap: 5,
        padding: '0px 10px 2px 10px',
        backgroundColor: isFocused ? 'rgba(0,0,0,0.1)' : 'unset'
    }} key={variable.id} onClick={() => {
        focusedItemSignal.set(variable.id);
        editVariable('state', variable).then()
    }}>
        <notifiable.div>
            {() => {
                const allErrors = context.allErrorsSignal.get();
                const error = allErrors.find(e => e.type === 'variable' && e.variableId === variable.id);
                if (error) {
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
        <div style={{
            flexGrow: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }}>{variable.name}</div>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }} onClick={() => deleteVariable(variable)}>
            <Icon.Delete style={{fontSize: 18}}/>
        </div>
    </div>;
}

function AddButtons(props: { editVariable: (forType: VariableType) => Promise<void> }) {
    const {editVariable} = props;
    return <div style={{display: 'flex', padding: 10}}>
        <Button onClick={() => editVariable('state')}
                style={{
                    display: 'flex',
                    flexGrow: 1,
                    alignItems: 'center',
                    gap: 5,
                    justifyContent: 'center',
                    padding: '0px 5px 2px 10px',
                    background: 'rgba(0,0,0,0.0)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    color: '#333',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,

                }}>
            {'State'}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MdAdd style={{fontSize: 20}}/>
            </div>
        </Button>
        <Button onClick={() => editVariable('computed')}
                style={{
                    display: 'flex',
                    flexGrow: 1,
                    alignItems: 'center',
                    gap: 5,
                    justifyContent: 'center',
                    padding: '0px 5px 2px 5px',
                    background: 'rgba(0,0,0,0.0)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    color: '#333',
                    borderRadius: 0,
                    borderLeft: 'unset',
                    borderRight: 'unset'
                }}>
            {'Computed'}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MdAdd style={{fontSize: 20}}/>
            </div>
        </Button>
        <Button onClick={() => editVariable('effect')}
                style={{
                    display: 'flex',
                    flexGrow: 1,
                    alignItems: 'center',
                    gap: 5,
                    justifyContent: 'center',
                    padding: '0px 5px 2px 5px',
                    background: 'rgba(0,0,0,0.0)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    color: '#333',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0
                }}>
            {'Effect'}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MdAdd style={{fontSize: 20}}/>
            </div>
        </Button>
    </div>;
}

/**
 * Represents a panel for managing variables.
 */
export function VariablesPanel() {
    const focusedItemSignal = useSignal<string>('');
    const context = useAppContext<AppDesignerContext>();
    const {allPageVariablesSignal, allApplicationVariablesSignal} = context;

    const updatePage = useUpdatePageSignal();
    const showModal = useShowModal();
    const addPanel = useAddDashboardPanel();
    const updateApplication = useUpdateApplication();
    const removePanel = useRemoveDashboardPanel();

    async function editVariable(forType: VariableType, variable?: Variable, scope?: 'page' | 'application') {
        const panelId = variable?.id ?? guid();
        addPanel({
            position: 'mainCenter',
            component: () => {
                return <VariableEditorPanel variableId={variable?.id} defaultType={forType} panelId={panelId}
                                            scope={scope ?? 'page'}/>
            },
            title: `${variable?.name ? variable?.name : `Add ${forType}`}`,
            Icon: Icon.Component,
            id: panelId,
            tag: {
                variableId: panelId,
                type: 'VariableEditorPanel'
            }
        })
    }

    async function deleteVariable(variable: Variable, scope: 'page' | 'application') {
        const deleteVariableConfirm = await showModal<string>(closePanel => {
            return <ConfirmationDialog message={'Are you sure you want to delete this variable ?'}
                                       closePanel={closePanel}/>
        })
        if (deleteVariableConfirm === 'Yes') {
            if (scope === 'page') {
                const variables = allPageVariablesSignal.get().filter(i => i.id !== variable?.id);
                updatePage({type: 'variable', variables: variables.sort(sortSignal)});
            }
            if (scope === 'application') {
                const variables = allApplicationVariablesSignal.get().filter(i => i.id !== variable?.id);
                updateApplication(app => {
                    app.variables = variables.sort(sortSignal);
                });
            }
            removePanel(variable.id);
        }
    }

    return <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', borderBottom: BORDER, alignItems: 'center'}}>
            <div style={{paddingBottom: 2, paddingLeft: 15, fontWeight: 'bold', flexGrow: 1}}>Page</div>
            <AddButtons editVariable={(forType) => editVariable(forType, undefined, 'page')}/>
        </div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const variables = allPageVariablesSignal.get();
                const focusedVariable = focusedItemSignal.get();
                if (variables.length === 0) {
                    return <div style={{textAlign: 'center', fontStyle: 'italic'}}>No Page Variable</div>
                }
                return variables.map(variable => {
                    const isFocused = focusedVariable === variable.id;
                    return <RenderVariable key={variable.id} isFocused={isFocused} variable={variable}
                                           focusedItemSignal={focusedItemSignal}
                                           editVariable={(forType, variable) => editVariable(forType, variable, 'page')}
                                           context={context}
                                           deleteVariable={(variable) => deleteVariable(variable, 'page')}/>
                })
            }}
        </notifiable.div>
        <div style={{display: 'flex', borderBottom: BORDER, alignItems: 'center'}}>
            <div style={{paddingBottom: 2, paddingLeft: 15, fontWeight: 'bold', flexGrow: 1}}>App</div>
            <AddButtons editVariable={(forType) => editVariable(forType, undefined, 'application')}/>
        </div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const variables = allApplicationVariablesSignal.get();
                const focusedVariable = focusedItemSignal.get();
                if (variables.length === 0) {
                    return <div style={{textAlign: 'center', fontStyle: 'italic'}}>No Application Variable</div>
                }
                return variables.map(variable => {
                    const isFocused = focusedVariable === variable.id;
                    return <RenderVariable isFocused={isFocused} variable={variable}
                                           focusedItemSignal={focusedItemSignal}
                                           editVariable={(forType, variable) => editVariable(forType, variable, 'application')}
                                           context={context}
                                           deleteVariable={(variable) => deleteVariable(variable, 'application')}/>
                })
            }}
        </notifiable.div>
    </div>
}


