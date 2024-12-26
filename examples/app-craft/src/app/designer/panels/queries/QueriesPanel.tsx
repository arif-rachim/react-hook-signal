import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {Button} from "../../../button/Button.tsx";
import {notifiable, useSignal} from "react-hook-signal";
import {guid} from "../../../../core/utils/guid.ts";
import {Icon} from "../../../../core/components/icon/Icon.ts";
import {useAddDashboardPanel} from "../../hooks/useAddDashboardPanel.tsx";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {useUpdatePageSignal} from "../../../../core/hooks/useUpdatePageSignal.ts";
import {useShowModal} from "../../../../core/hooks/modal/useShowModal.ts";
import {ConfirmationDialog} from "../../ConfirmationDialog.tsx";
import {useUpdateApplication} from "../../../../core/hooks/useUpdateApplication.ts";
import {Query} from "../database/getTables.ts";
import QueryEditorPanel from "./QueryEditorPanel.tsx";
import {BORDER} from "../../../../core/style/Border.ts";
import {useRemoveDashboardPanel} from "../../../../core/style/useRemoveDashboardPanel.ts";


function AddButtons(props: { editQueries: () => void }) {
    const {editQueries} = props;
    return <div style={{display: 'flex', padding: 10}}>
        <Button
            style={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                gap: 5,
                justifyContent: 'center',
                padding: '0px 10px 2px 10px',
                background: 'rgba(0,0,0,0.0)',
                border: '1px solid rgba(0,0,0,0.2)',
                color: '#333',
            }}
            onClick={() => editQueries()}
        icon={'IoMdAdd'}>
            {'Queries'}
        </Button>
    </div>
}

export function QueriesPanel() {
    const focusedItemSignal = useSignal<string>('');
    const context = useAppContext<AppDesignerContext>();
    const {allApplicationQueriesSignal, allPageQueriesSignal} = context;

    const updatePage = useUpdatePageSignal();
    const showModal = useShowModal();
    const addPanel = useAddDashboardPanel();
    const updateApplication = useUpdateApplication();
    const removePanel = useRemoveDashboardPanel();

    async function deleteQuery(query: Query, scope: 'application' | 'page') {
        const deleteVariableConfirm = await showModal<string>(closePanel => {
            return <ConfirmationDialog message={'Are you sure you want to delete this query ?'}
                                       closePanel={closePanel}/>
        })
        if (deleteVariableConfirm === 'Yes') {
            if (scope === 'application') {
                const queries = allApplicationQueriesSignal.get().filter(i => i.id !== query.id);
                updateApplication(app => {
                    app.queries = queries;
                })
            } else {
                const queries = allPageQueriesSignal.get().filter(i => i.id !== query.id);
                updatePage({type: 'query', queries: queries})
            }
            removePanel(query.id);
        }
    }

    function editQuery(query?: Query, scope?: 'application' | 'page') {
        const panelId = query?.id ?? guid();
        addPanel({
            position: 'mainCenter',
            component: () => {
                return <QueryEditorPanel queryId={query?.id} panelId={panelId} scope={scope ?? 'page'}/>
            },
            title: query ? `Edit ${query?.name}` : `Add Query`,
            Icon: Icon.Component,
            id: panelId,
            tag: {
                type: 'QueryEditorPanel'
            }
        })
    }

    return <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', borderBottom: BORDER}}>
            <div style={{paddingBottom: 2, paddingLeft: 15, fontWeight: 'bold', marginTop: 10, flexGrow: 1}}>Page
            </div>
            <AddButtons editQueries={() => {
                editQuery(undefined, 'page')
            }}/>
        </div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const focusedItem = focusedItemSignal.get();
                if (allPageQueriesSignal.get().length === 0) {
                    return <div style={{textAlign: 'center', fontStyle: 'italic'}}>No Page Queries</div>
                }
                return allPageQueriesSignal.get().map(query => {
                    const isFocused = focusedItem === query.id;
                    return <div style={{
                        display: 'flex',
                        gap: 5,
                        padding: '0px 10px 2px 10px',
                        backgroundColor: isFocused ? 'rgba(0,0,0,0.1)' : 'unset'
                    }} key={query.id} onClick={() => {
                        focusedItemSignal.set(query.id);
                        editQuery(query, 'page');
                    }}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Icon.Query />
                        </div>
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
                        }} onClick={() => deleteQuery(query, 'page')}>
                            <Icon.Delete style={{fontSize: 18}}/>
                        </div>
                    </div>
                })
            }}
        </notifiable.div>
        <div style={{display: 'flex', borderBottom: BORDER}}>
            <div style={{paddingBottom: 2, paddingLeft: 15, fontWeight: 'bold', marginTop: 10, flexGrow: 1}}>App
            </div>
            <AddButtons editQueries={() => {
                editQuery(undefined, 'application')
            }}/>
        </div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const focusedItem = focusedItemSignal.get();
                if (allApplicationQueriesSignal.get().length === 0) {
                    return <div style={{textAlign: 'center', fontStyle: 'italic'}}>No Application Queries</div>
                }
                return allApplicationQueriesSignal.get().map(query => {
                    const isFocused = focusedItem === query.id;
                    return <div style={{
                        display: 'flex',
                        gap: 5,
                        padding: '0px 10px 2px 10px',
                        backgroundColor: isFocused ? 'rgba(0,0,0,0.1)' : 'unset'
                    }} key={query.id} onClick={() => {
                        focusedItemSignal.set(query.id);
                        editQuery(query, 'application');
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Icon.Query/>
                        </div>
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
                        }} onClick={() => deleteQuery(query, 'application')}>
                            <Icon.Delete style={{fontSize: 18}}/>
                        </div>
                    </div>
                })
            }}
        </notifiable.div>
    </div>
}
