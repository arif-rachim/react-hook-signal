import {Button} from "../../button/Button.tsx";
import {MdAdd} from "react-icons/md";
import {notifiable, useSignal} from "react-hook-signal";
import {colors} from "stock-watch/src/utils/colors.ts";
import {Icon} from "../../Icon.ts";
import {Fetcher} from "../../AppDesigner.tsx";
import {useAddDashboardPanel} from "../../dashboard/useAddDashboardPanel.tsx";
import {guid} from "../../../utils/guid.ts";
import {FetcherEditorPanel} from "./editor/FetcherEditorPanel.tsx";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {ConfirmationDialog} from "../../ConfirmationDialog.tsx";
import {useShowModal} from "../../../modal/useShowModal.ts";
import {useUpdatePageSignal} from "../../hooks/useUpdatePageSignal.ts";
import {useUpdateApplication} from "../../hooks/useUpdateApplication.ts";

export const createFetcherPanel = (scope: 'page' | 'application') => {
    return function FetchersPanel() {
        const focusedItemSignal = useSignal<string>('');
        const context = useAppContext();
        const {allPageFetchersSignal, allApplicationFetchersSignal} = context;
        const allFetchersSignal = scope === 'application' ? allApplicationFetchersSignal : allPageFetchersSignal;

        const updatePage = useUpdatePageSignal();
        const updateApplication = useUpdateApplication();
        const showModal = useShowModal();
        const addPanel = useAddDashboardPanel();

        async function deleteFetcher(fetcher: Fetcher) {
            const deleteVariableConfirm = await showModal<string>(closePanel => {
                return <ConfirmationDialog message={'Are you sure you want to delete this fetcher ?'}
                                           closePanel={closePanel}/>
            })
            if (deleteVariableConfirm === 'Yes') {
                const fetchers = allFetchersSignal.get().filter(i => i.id !== fetcher.id);
                if (scope === 'application') {
                    updateApplication(app => {
                        app.fetchers = fetchers;
                    })
                } else {
                    updatePage({type: 'fetcher', fetchers: fetchers})
                }
            }
        }

        function editFetcher(fetcher?: Fetcher) {
            const panelId = fetcher?.id ?? guid();
            addPanel({
                position: 'mainCenter',
                component: () => {
                    return <FetcherEditorPanel fetcherId={fetcher?.id} panelId={panelId} scope={scope}/>
                },
                title: fetcher ? `Edit ${fetcher.name}` : `Add Fetcher`,
                Icon: Icon.Component,
                id: panelId,
                tag: {
                    type: 'FetcherEditorPanel'
                },
                visible: () => true
            })
        }

        return <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', padding: 10}}>
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
                    onClick={() => editFetcher()}
                >
                    {'Add Fetcher'}
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <MdAdd style={{fontSize: 20}}/>
                    </div>
                </Button>
            </div>
            <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                {() => {
                    const focusedItem = focusedItemSignal.get();
                    return allFetchersSignal.get().map(fetcher => {
                        const isFocused = fetcher.id === focusedItem;
                        return <div style={{
                            display: 'flex',
                            gap: 5,
                            padding: '0px 10px 2px 10px',
                            backgroundColor: isFocused ? 'rgba(0,0,0,0.1)' : 'unset'
                        }} key={fetcher.id} onClick={() => {
                            focusedItemSignal.set(fetcher.id);
                            editFetcher(fetcher)
                        }}>
                            <notifiable.div>
                                {() => {
                                    const allErrors = context.allErrorsSignal.get();
                                    const error = allErrors.find(e => e.type === 'fetcher' && e.fetcherId === fetcher.id);
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
                            }}>{fetcher.name}</div>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }} onClick={() => deleteFetcher(fetcher)}>
                                <Icon.Delete style={{fontSize: 18}}/>
                            </div>
                        </div>
                    })
                }}
            </notifiable.div>
        </div>
    }
}

