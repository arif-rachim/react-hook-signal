import {useAppContext} from "../../hooks/useAppContext.ts";
import {Button} from "../../button/Button.tsx";
import {MdAdd} from "react-icons/md";
import {notifiable, useSignal} from "react-hook-signal";
import {Callable} from "../../AppDesigner.tsx";
import {guid} from "../../../utils/guid.ts";
import {Icon} from "../../Icon.ts";
import {useAddDashboardPanel} from "../../dashboard/useAddDashboardPanel.tsx";
import CallableEditorPanel from "./editor/CallableEditorPanel.tsx";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {useUpdatePageSignal} from "../../hooks/useUpdatePageSignal.ts";
import {useShowModal} from "../../../modal/useShowModal.ts";
import {ConfirmationDialog} from "../../ConfirmationDialog.tsx";
import {useUpdateApplication} from "../../hooks/useUpdateApplication.ts";
import {BORDER} from "../../Border.ts";
import {useRemoveDashboardPanel} from "../../dashboard/useRemoveDashboardPanel.ts";


function AddButton(props:{editCallable: () => void}) {
    return <div style={{display: 'flex', padding: 10}}>
        <Button
            style={{
                display: 'flex',
                flexGrow: 1,
                alignItems: 'center',
                gap: 5,
                justifyContent: 'center',
                padding: '0px 10px 2px 10px',
                background: 'rgba(0,0,0,0.0)',
                border: '1px solid rgba(0,0,0,0.2)',
                color: '#333',
            }}
            onClick={() => props.editCallable()}
        >
            {'Add Callable'}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MdAdd style={{fontSize: 20}}/>
            </div>
        </Button>
    </div>;
}

export function CallablePanel() {
    const focusedItemSignal = useSignal<string>('');
    const context = useAppContext<AppDesignerContext>();
    const {allApplicationCallablesSignal, allPageCallablesSignal} = context;

    const updatePage = useUpdatePageSignal();
    const showModal = useShowModal();
    const addPanel = useAddDashboardPanel();
    const updateApplication = useUpdateApplication();
    const removePanel = useRemoveDashboardPanel();
    async function deleteCallable(callable: Callable, scope: 'application' | 'page') {
        const deleteVariableConfirm = await showModal<string>(closePanel => {
            return <ConfirmationDialog message={'Are you sure you want to delete this callable ?'}
                                       closePanel={closePanel}/>
        })
        if (deleteVariableConfirm === 'Yes') {
            if (scope === 'application') {
                const callables = allApplicationCallablesSignal.get().filter(i => i.id !== callable.id);
                updateApplication(app => {
                    app.callables = callables;
                })
            } else {
                const callables = allPageCallablesSignal.get().filter(i => i.id !== callable.id);
                updatePage({type: 'callable', callables: callables})
            }
            removePanel(callable.id)
        }
    }

    function editCallable(callable?: Callable,scope?:'application'|'page') {
        const panelId = callable?.id ?? guid();
        addPanel({
            position: 'mainCenter',
            component: () => {
                return <CallableEditorPanel callableId={callable?.id} panelId={panelId} scope={scope ?? 'page'}/>
            },
            title: callable ? `Edit ${callable.name}` : `Add Callable`,
            Icon: Icon.Component,
            id: panelId,
            tag: {
                type: 'CallableEditorPanel'
            }
        })
    }

    return <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', borderBottom: BORDER}}>
            <div style={{paddingBottom: 2, paddingLeft: 15, fontWeight: 'bold', marginTop: 10, flexGrow: 1}}>Page
            </div>
            <AddButton editCallable={() => {
                editCallable(undefined, 'page')
            }}/>
        </div>

        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const focusedItem = focusedItemSignal.get();
                if (allPageCallablesSignal.get().length === 0) {
                    return <div style={{textAlign: 'center', fontStyle: 'italic'}}>No Page Callable</div>
                }
                return allPageCallablesSignal.get().map(callable => {
                    const isFocused = focusedItem === callable.id;
                    return <div style={{
                        display: 'flex',
                        gap: 5,
                        padding: '0px 10px 2px 15px',
                        backgroundColor: isFocused ? 'rgba(0,0,0,0.1)' : 'unset'
                    }} key={callable.id} onClick={() => {
                        focusedItemSignal.set(callable.id);
                        editCallable(callable,'page')
                    }}>

                        <div style={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{callable.name}</div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} onClick={() => deleteCallable(callable, 'page')}>
                            <Icon.Delete style={{fontSize: 18}}/>
                        </div>
                    </div>
                })
            }}
        </notifiable.div>
        <div style={{display: 'flex', borderBottom: BORDER}}>
            <div style={{paddingBottom: 2, paddingLeft: 15, fontWeight: 'bold', marginTop: 10, flexGrow: 1}}>App
            </div>
            <AddButton editCallable={() => {
                editCallable(undefined, 'application')
            }}/>
        </div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const focusedItem = focusedItemSignal.get();
                if (allApplicationCallablesSignal.get().length === 0) {
                    return <div style={{textAlign: 'center', fontStyle: 'italic'}}>No Application Callable</div>
                }
                return allApplicationCallablesSignal.get().map(callable => {
                    const isFocused = focusedItem === callable.id;
                    return <div style={{
                        display: 'flex',
                        gap: 5,
                        padding: '0px 10px 2px 15px',
                        backgroundColor: isFocused ? 'rgba(0,0,0,0.1)' : 'unset'
                    }} key={callable.id} onClick={() => {
                        focusedItemSignal.set(callable.id);
                        editCallable(callable,'application')
                    }} >

                        <div style={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{callable.name}</div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} onClick={() => deleteCallable(callable, 'application')}>
                            <Icon.Delete style={{fontSize: 18}}/>
                        </div>
                    </div>
                })
            }}
        </notifiable.div>
    </div>
}

