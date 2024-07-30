import {VariablesPanel} from "../variable-editor/VariablesPanel.tsx";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {MdAdd, MdHorizontalDistribute, MdVerticalDistribute} from "react-icons/md";
import {IconType} from "react-icons";
import CollapsibleLabelContainer from "../collapsible-panel/CollapsibleLabelContainer.tsx";
import {BORDER} from "../Border.ts";
import {Button} from "../button/Button.tsx";
import {notifiable, useSignal} from "react-hook-signal";
import {Icon} from "../Icon.ts";
import {Page} from "../AppDesigner.tsx";
import {useShowModal} from "../../modal/useShowModal.ts";
import {isEmpty} from "../../utils/isEmpty.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {useUpdatePageSignal} from "../hooks/useUpdatePageSignal.ts";
import {createNewBlankPage} from "../createNewBlankPage.ts";

export function LeftPanel() {
    return <div style={{
        display: 'flex',
        backgroundColor: 'rgba(0,0,0,0.01)',
        flexDirection: 'column',
        width: 250,
        flexShrink:0,
        borderRight: BORDER,
        overflow: 'auto'
    }}>
        <PagesPanel/>
        <ElementsPanel/>
        <VariablesPanel/>
    </div>
}

function ElementsPanel() {
    const {elements} = useContext(AppDesignerContext);
    return <CollapsibleLabelContainer label={'Components'}
                                      styleContent={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
        <DraggableItem icon={MdVerticalDistribute} draggableDataType={'vertical'}/>
        <DraggableItem icon={MdHorizontalDistribute} draggableDataType={'horizontal'}/>
        {
            Object.keys(elements).map((key) => {
                const Icon = elements[key].icon;
                return <DraggableItem icon={Icon} draggableDataType={key} key={key}/>
            })
        }
    </CollapsibleLabelContainer>
}


function DraggableItem(props: { draggableDataType: string, icon: IconType }) {
    const Icon = props.icon;
    const {activeDropZoneIdSignal} = useContext(AppDesignerContext);
    return <div
        style={{
            border: BORDER,
            padding: 5,
            borderRadius: 5,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            height: 50,
            flexShrink: 0,
            flexGrow: 0
        }} onDragStart={(e) => e.dataTransfer.setData('text/plain', props.draggableDataType)}
        draggable={true} onDragEnd={() => activeDropZoneIdSignal.set('')}>
        <Icon fontSize={18}/>
    </div>
}


function PagesPanel() {
    const {allPagesSignal, activePageIdSignal,allErrorsSignal} = useContext(AppDesignerContext);
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

    return <CollapsibleLabelContainer label={'Pages'}>
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
    </CollapsibleLabelContainer>
}

function PageNameDialog(props: { closePanel: (param?: string) => void, allPages: Array<Page>, page: Page }) {
    const valueSignal = useSignal(props.page.name);
    const errorSignal = useSignal('');

    function nameIsValid() {
        const name = valueSignal.get();
        if (isEmpty(name)) {
            return 'Name is required';
        }
        const existingPage = props.allPages.find(i => i.name === name && i.id !== props.page.id);
        if (existingPage) {
            return 'Name is already taken'
        }
        return '';
    }

    return <div style={{display: 'flex', flexDirection: "column", gap: 10, width: 300}}>
        <div style={{fontSize: 22, padding: '10px 20px', borderBottom: BORDER}}>Add Page</div>
        <div style={{display: 'flex', flexDirection: 'column', padding: '0px 20px'}}>
            <label style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{marginLeft: 10}}>Page Name :</div>
                <notifiable.input style={{border: BORDER, borderRadius: 5, padding: '5px 10px'}}
                                  value={valueSignal}
                                  onKeyDown={(e) => {
                                      if (e.key === " ") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                      }
                                  }}
                                  onChange={(event) => {
                                      const dom = event.target;
                                      const cursorPosition = dom.selectionStart;
                                      const val = dom.value;
                                      valueSignal.set(val);
                                      setTimeout(() => {
                                          dom.setSelectionRange(cursorPosition, cursorPosition);
                                      }, 0);
                                  }}

                />
                <notifiable.div style={{color: colors.red}}>
                    {() => {
                        return errorSignal.get()
                    }}
                </notifiable.div>
            </label>
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            borderTop: BORDER,
            padding: '10px 20px',
            gap: 10
        }}>
            <Button onClick={() => {
                const errorMessage = nameIsValid();
                errorSignal.set(errorMessage);
                if (isEmpty(errorMessage)) {
                    props.closePanel(valueSignal.get());
                }
            }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <div>{'Save'}</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18}}>
                    <Icon.Save/></div>
            </Button>
            <Button onClick={() => {
                props.closePanel();
            }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <div>{'Close'}</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18}}>
                    <Icon.Exit/></div>
            </Button>
        </div>
    </div>
}