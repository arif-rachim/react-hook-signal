import {useAppContext} from "../../hooks/useAppContext.ts";
import {Button} from "../../button/Button.tsx";
import {MdAdd} from "react-icons/md";
import {notifiable} from "react-hook-signal";
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
                if(scope === 'application'){
                    updateApplication(app => {
                        app.callables = callables;
                    })
                }else{
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

        return <div style={{display: 'flex', flexDirection: 'column', padding: 10}}>
            <Button
                style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginBottom: 5}}
                onClick={() => editCallable()}
            >
                {'Add Callable'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdAdd style={{fontSize: 20}}/>
                </div>
            </Button>
            <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                {() => {
                    return allCallablesSignal.get().map(callable => {
                        return <div style={{display: 'flex', gap: 10, padding: '5px 5px'}} key={callable.id}>

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
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }} onClick={() => editCallable(callable)}>
                                <Icon.Detail style={{fontSize: 18}}/>
                            </div>
                        </div>
                    })
                }}
            </notifiable.div>
        </div>
    }
}
