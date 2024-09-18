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
import {Signal} from "signal-polyfill";
import {BORDER} from "../../Border.ts";
import {useRemoveDashboardPanel} from "../../dashboard/useRemoveDashboardPanel.ts";

function RenderFetcher(props: {
    isFocused: boolean,
    fetcher: Fetcher,
    focusedItemSignal: Signal.State<string>,
    editFetcher: (fetcher?: Fetcher) => void,
    deleteFetcher: (fetcher: Fetcher) => Promise<void>
}) {
    const {editFetcher, deleteFetcher, isFocused, fetcher, focusedItemSignal} = props;
    const context = useAppContext();
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
    </div>;
}

function AddButtons(props: { editFetcher: () => void }) {
    const {editFetcher} = props;
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
            onClick={() => editFetcher()}
        >
            {'Fetcher'}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MdAdd style={{fontSize: 20}}/>
            </div>
        </Button>
    </div>
}

export function FetchersPanel() {
    const focusedItemSignal = useSignal<string>('');
    const context = useAppContext();
    const {allPageFetchersSignal, allApplicationFetchersSignal} = context;

    const updatePage = useUpdatePageSignal();
    const updateApplication = useUpdateApplication();
    const showModal = useShowModal();
    const addPanel = useAddDashboardPanel();
    const removePanel = useRemoveDashboardPanel();

    async function deleteFetcher(fetcher: Fetcher, scope: 'page' | 'application') {
        const deleteVariableConfirm = await showModal<string>(closePanel => {
            return <ConfirmationDialog message={'Are you sure you want to delete this fetcher ?'}
                                       closePanel={closePanel}/>
        })
        if (deleteVariableConfirm === 'Yes') {
            if (scope === 'application') {
                const fetchers = allApplicationFetchersSignal.get().filter(i => i.id !== fetcher.id);
                updateApplication(app => {
                    app.fetchers = fetchers;
                })
            } else {
                const fetchers = allPageFetchersSignal.get().filter(i => i.id !== fetcher.id);
                updatePage({type: 'fetcher', fetchers: fetchers})
            }
            removePanel(fetcher.id);
        }
    }

    function editFetcher(fetcher?: Fetcher, scope?: 'application' | 'page') {
        const panelId = fetcher?.id ?? guid();
        addPanel({
            position: 'mainCenter',
            component: () => {
                return <FetcherEditorPanel fetcherId={fetcher?.id} panelId={panelId} scope={scope ?? 'page'}/>
            },
            title: fetcher ? `Edit ${fetcher.name}` : `Add Fetcher`,
            Icon: Icon.Component,
            id: panelId,
            tag: {
                type: 'FetcherEditorPanel'
            }
        })
    }

    return <div style={{display: 'flex', flexDirection: 'column'}}>

        <div style={{display: 'flex', borderBottom: BORDER}}>
            <div style={{paddingBottom: 2, paddingLeft: 15, fontWeight: 'bold', marginTop: 10, flexGrow: 1}}>Page
            </div>
            <AddButtons editFetcher={() => {
                editFetcher(undefined, 'page')
            }}/>
        </div>


        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const focusedItem = focusedItemSignal.get();
                if (allPageFetchersSignal.get().length === 0) {
                    return <div style={{textAlign: 'center', fontStyle: 'italic'}}>No Page Fetcher</div>
                }
                return allPageFetchersSignal.get().map(fetcher => {
                    const isFocused = fetcher.id === focusedItem;
                    return <RenderFetcher isFocused={isFocused} fetcher={fetcher} focusedItemSignal={focusedItemSignal}
                                          editFetcher={(fetcher) => {
                                              editFetcher(fetcher, 'page');
                                          }} deleteFetcher={(fetcher) => {
                        return deleteFetcher(fetcher, 'page');
                    }} key={fetcher.id}/>
                })
            }}
        </notifiable.div>
        <div style={{display: 'flex', borderBottom: BORDER}}>
            <div style={{paddingBottom: 2, paddingLeft: 15, fontWeight: 'bold', marginTop: 10, flexGrow: 1}}>App
            </div>
            <AddButtons editFetcher={() => {
                editFetcher(undefined, 'application')
            }}/>
        </div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const focusedItem = focusedItemSignal.get();
                if (allApplicationFetchersSignal.get().length === 0) {
                    return <div style={{textAlign: 'center', fontStyle: 'italic'}}>No Application Fetcher</div>
                }
                return allApplicationFetchersSignal.get().map(fetcher => {
                    const isFocused = fetcher.id === focusedItem;
                    return <RenderFetcher isFocused={isFocused} fetcher={fetcher} focusedItemSignal={focusedItemSignal}
                                          editFetcher={(fetcher) => {
                                              editFetcher(fetcher, 'application');
                                          }} deleteFetcher={(fetcher) => {
                        return deleteFetcher(fetcher, 'application');
                    }}/>
                })
            }}
        </notifiable.div>
    </div>
}

