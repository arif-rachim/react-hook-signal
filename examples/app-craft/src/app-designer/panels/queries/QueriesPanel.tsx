import {useAppContext} from "../../hooks/useAppContext.ts";
import {Button} from "../../button/Button.tsx";
import {MdAdd} from "react-icons/md";
import {notifiable} from "react-hook-signal";
import {guid} from "../../../utils/guid.ts";
import {Icon} from "../../Icon.ts";
import {useAddDashboardPanel} from "../../dashboard/useAddDashboardPanel.tsx";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {useUpdatePageSignal} from "../../hooks/useUpdatePageSignal.ts";
import {useShowModal} from "../../../modal/useShowModal.ts";
import {ConfirmationDialog} from "../../ConfirmationDialog.tsx";
import {useUpdateApplication} from "../../hooks/useUpdateApplication.ts";
import {Query} from "../database/service/getTables.ts";
import QueryEditorPanel from "./editor/QueryEditorPanel.tsx";

export const createQueriesPanel = (scope: 'page' | 'application') => {
    return function CallablePanel() {
        const context = useAppContext<AppDesignerContext>();
        const {allApplicationQueriesSignal, allPageQueriesSignal} = context;
        const allQueriesSignal = scope === 'application' ? allApplicationQueriesSignal : allPageQueriesSignal;

        const updatePage = useUpdatePageSignal();
        const showModal = useShowModal();
        const addPanel = useAddDashboardPanel();
        const updateApplication = useUpdateApplication();

        async function deleteQuery(query: Query) {
            const deleteVariableConfirm = await showModal<string>(closePanel => {
                return <ConfirmationDialog message={'Are you sure you want to delete this query ?'}
                                           closePanel={closePanel}/>
            })
            if (deleteVariableConfirm === 'Yes') {
                const queries = allQueriesSignal.get().filter(i => i.id !== query.id);
                if(scope === 'application'){
                    updateApplication(app => {
                        app.queries = queries;
                    })
                }else{
                    updatePage({type: 'query', queries: queries})
                }
            }
        }

        function editQuery(query?: Query) {
            const panelId = query?.id ?? guid();
            addPanel({
                position: 'mainCenter',
                component: () => {
                    return <QueryEditorPanel queryId={query?.id} panelId={panelId} scope={scope} />
                },
                title: query ? `Edit ${query?.name}` : `Add Query`,
                Icon: Icon.Component,
                id: panelId,
                tag: {
                    type: 'QueryEditorPanel'
                },
                visible: () => true,
            })
        }

        return <div style={{display: 'flex', flexDirection: 'column', padding: 10}}>
            <Button
                style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', padding:'0px 10px 2px 10px',background:'rgba(0,0,0,0.0)',border:'1px solid rgba(0,0,0,0.2)',color:'#333',marginBottom:5}}
                onClick={() => editQuery()}
            >
                {'Add Query'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdAdd style={{fontSize: 20}}/>
                </div>
            </Button>
            <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                {() => {
                    return allQueriesSignal.get().map(query => {
                        return <div style={{display: 'flex', gap: 10, padding: '5px 5px'}} key={query.id}>

                            <div style={{
                                flexGrow: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>{query.name}</div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }} onClick={() => deleteQuery(query)}>
                                <Icon.Delete style={{fontSize: 18}}/>
                            </div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }} onClick={() => editQuery(query)}>
                                <Icon.Detail style={{fontSize: 18}}/>
                            </div>
                        </div>
                    })
                }}
            </notifiable.div>
        </div>
    }
}
