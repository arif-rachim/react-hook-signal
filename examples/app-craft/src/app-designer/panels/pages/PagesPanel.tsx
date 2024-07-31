import {useContext} from "react";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {useShowModal} from "../../../modal/useShowModal.ts";
import {createNewBlankPage} from "../../createNewBlankPage.ts";
import {isEmpty} from "../../../utils/isEmpty.ts";
import {Page} from "../../AppDesigner.tsx";
import {useUpdatePageSignal} from "../../hooks/useUpdatePageSignal.ts";
import {Button} from "../../button/Button.tsx";
import {MdAdd} from "react-icons/md";
import {notifiable} from "react-hook-signal";
import {Icon} from "../../Icon.ts";
import {PageNameDialog} from "./PageNameDialog.tsx";

export function PagesPanel() {
    const {allPagesSignal, activePageIdSignal, allErrorsSignal} = useContext(AppDesignerContext);
    const showModal = useShowModal();

    async function addPage() {
        const page = createNewBlankPage();
        page.name = '';
        page.name = await showModal<string>(closePanel => {
            return <PageNameDialog closePanel={closePanel} allPages={allPagesSignal.get()} page={page}/>
        });
        if (!isEmpty(page.name)) {
            updatePage({type: 'add-page', page})
        }
    }

    function deletePage(page: Page) {
        updatePage({type: 'delete-page', pageId: page.id})
    }

    const updatePage = useUpdatePageSignal();

    async function editPage(page: Page) {
        const title = await showModal<string>(closePanel => {
            return <PageNameDialog closePanel={closePanel} allPages={allPagesSignal.get()} page={page}/>
        });
        updatePage({type: 'page-name', name: title, pageId: page.id})
    }

    return <div style={{display:'flex',flexDirection:'column',padding:10}}>
        <Button onClick={() => addPage()}
                style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginBottom: 5}}>
            {'Add New Page'}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MdAdd style={{fontSize: 20}}/>
            </div>
        </Button>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const activePageId = activePageIdSignal.get()
                const allPages = allPagesSignal.get();
                return allPages.map(page => {
                    const isFocused = activePageId === page.id;
                    return <div style={{
                        display: 'flex',
                        gap: 10,
                        padding: '5px 5px',
                        background: isFocused ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.9)',
                        borderRadius: 20
                    }} key={page.id} onClick={() => {
                        allErrorsSignal.set([]);
                        activePageIdSignal.set(page.id);
                    }}>
                        <div></div>
                        <div style={{flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis'}}>{page.name}</div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} onClick={() => deletePage(page)}>
                            <Icon.Delete style={{fontSize: 18}}/>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} onClick={() => editPage(page)}>
                            <Icon.Detail style={{fontSize: 18}}/>
                        </div>
                    </div>
                })
            }}
        </notifiable.div>
    </div>
}