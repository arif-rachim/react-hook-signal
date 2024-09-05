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

export const createCallablePanel = (scope: 'page' | 'application') => {
    return function CallablePanel() {
        const focusedItemSignal = useSignal<string>('');
        const context = useAppContext<AppDesignerContext>();
        const {allApplicationCallablesSignal, allPageCallablesSignal} = context;
        const allCallablesSignal = scope === 'application' ? allApplicationCallablesSignal : allPageCallablesSignal;

        const updatePage = useUpdatePageSignal();
        const showModal = useShowModal();
        const addPanel = useAddDashboardPanel();
        const updateApplication = useUpdateApplication();

        async function deleteCallable(callable: Callable) {
            const deleteVariableConfirm = await showModal<string>(closePanel => {
                return <ConfirmationDialog message={'Are you sure you want to delete this callable ?'}
                                           closePanel={closePanel}/>
            })
            if (deleteVariableConfirm === 'Yes') {
                const callables = allCallablesSignal.get().filter(i => i.id !== callable.id);
                if (scope === 'application') {
                    updateApplication(app => {
                        app.callables = callables;
                    })
                } else {
                    updatePage({type: 'callable', callables: callables})
                }
            }
        }

        function editCallable(callable?: Callable) {
            const panelId = callable?.id ?? guid();
            addPanel({
                position: 'mainCenter',
                component: () => {
                    return <CallableEditorPanel callableId={callable?.id} panelId={panelId} scope={scope}/>
                },
                title: callable ? `Edit ${callable.name}` : `Add Callable`,
                Icon: Icon.Component,
                id: panelId,
                tag: {
                    type: 'CallableEditorPanel'
                },
                visible: () => true,
            })
        }

        return <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', padding: 10}}>
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
                    onClick={() => editCallable()}
                >
                    {'Add Callable'}
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <MdAdd style={{fontSize: 20}}/>
                    </div>
                </Button>
            </div>
            <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                {() => {
                    const focusedItem = focusedItemSignal.get();
                    return allCallablesSignal.get().map(callable => {
                        const isFocused = focusedItem === callable.id;
                        return <div style={{
                            display: 'flex',
                            gap: 5,
                            padding: '0px 10px 2px 10px',
                            backgroundColor: isFocused ? 'rgba(0,0,0,0.1)' : 'unset'
                        }} key={callable.id} onClick={() => {
                            focusedItemSignal.set(callable.id);
                            editCallable(callable)
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
                            }} onClick={() => deleteCallable(callable)}>
                                <Icon.Delete style={{fontSize: 18}}/>
                            </div>
                        </div>
                    })
                }}
            </notifiable.div>
        </div>
    }
}
