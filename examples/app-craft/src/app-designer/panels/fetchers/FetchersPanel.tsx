import {Button} from "../../button/Button.tsx";
import {MdAdd} from "react-icons/md";
import {notifiable} from "react-hook-signal";
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

export function FetchersPanel() {
    const context = useAppContext();
    const {allFetchersSignal} = context;
    const updatePage = useUpdatePageSignal();
    const showModal = useShowModal();
    const addPanel = useAddDashboardPanel();

    async function deleteFetcher(fetcher: Fetcher) {
        const deleteVariableConfirm = await showModal<string>(closePanel => {
            return <ConfirmationDialog message={'Are you sure you want to delete this fetcher ?'}
                                       closePanel={closePanel}/>
        })
        if (deleteVariableConfirm === 'Yes') {
            const fetchers = allFetchersSignal.get().filter(i => i.id !== fetcher.id);
            updatePage({type: 'fetcher', fetchers: fetchers})
        }
    }

    function editFetcher(fetcher?: Fetcher) {
        const panelId = fetcher?.id ?? guid();
        addPanel({
            position: 'mainCenter',
            component: () => {
                return <FetcherEditorPanel fetcherId={fetcher?.id} panelId={panelId}/>
            },
            title: fetcher ? `Edit ${fetcher.name}` : `Add Fetcher`,
            Icon: Icon.Component,
            id: panelId,
            tag : {
                type : 'FetcherEditorPanel'
            },
            visible: () => true
        })
    }

    return <div style={{display:'flex',flexDirection:'column',padding:10}}>
            <Button
                style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginBottom: 5}}
                onClick={() => editFetcher()}
            >
                {'Add Fetcher'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdAdd style={{fontSize: 20}}/>
                </div>
            </Button>
            <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                {() => {
                    return allFetchersSignal.get().map(fetcher => {
                        return <div style={{display: 'flex', gap: 10, padding: '5px 5px'}} key={fetcher.id}>
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
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }} onClick={() => editFetcher(fetcher)}>
                                <Icon.Detail style={{fontSize: 18}}/>
                            </div>
                        </div>
                    })
                }}
            </notifiable.div>
    </div>
}