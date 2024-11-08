import {useShowModal} from "../../../modal/useShowModal.ts";
import {createNewBlankPage} from "../../createNewBlankPage.ts";
import {isEmpty} from "../../../utils/isEmpty.ts";
import {Page} from "../../AppDesigner.tsx";
import {useUpdatePageSignal} from "../../hooks/useUpdatePageSignal.ts";
import {Button} from "../../button/Button.tsx";
import {notifiable, useSignal} from "react-hook-signal";
import {Icon} from "../../Icon.ts";
import {PageNameDialog} from "./PageNameDialog.tsx";
import {useAddDashboardPanel} from "../../dashboard/useAddDashboardPanel.tsx";
import {DesignPanel} from "../design/DesignPanel.tsx";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {CSSProperties} from "react";
import {colors} from "stock-watch/src/utils/colors.ts";
import {guid} from "../../../utils/guid.ts";
import {useRefactorPageName} from "../../hooks/useRefactorPageName.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";

type TreeNode = {
    [key: string]: {
        children?: TreeNode,
        isOpen?: boolean,
        pageId?: string,
        path: string
    }
}

function convertToTree(allPages: Array<Page>, folders: string[]): TreeNode {
    const treeNode = {} as TreeNode;
    allPages.forEach(page => {
        const paths = (page.name ?? '').split('/');
        const parentPaths = [...paths];
        parentPaths.splice(parentPaths.length - 1, 1);
        paths.reduce((treeNode, path) => {
            treeNode[path] = treeNode[path] ?? {
                path: '',
                children: {},
                isOpen: false,
                pageId: page.id // later we will remove this un-necessary page-id
            }
            return treeNode[path].children ?? {};
        }, treeNode);
    });
    cleanUpChildrenPageId(treeNode, '', folders);
    return treeNode;
}

function cleanUpChildrenPageId(node: TreeNode, parentPath: string, openedFolders: string[]) {
    Object.keys(node).forEach(key => {
        const nodeElement = node[key];
        nodeElement.path = [parentPath, key].filter(p => p).join('/');
        nodeElement.isOpen = openedFolders.includes(nodeElement.path);
        const childrenKeys = Object.keys(nodeElement.children as Record<string, unknown>)
        if (childrenKeys.length > 0) {
            delete nodeElement.pageId;
            cleanUpChildrenPageId(nodeElement.children!, nodeElement.path, openedFolders);
        } else {
            delete nodeElement.isOpen;
            delete nodeElement.children;
        }
    })
}

export function PagesPanel() {
    const {allPagesSignal, activePageIdSignal, allErrorsSignal} = useAppContext();

    const showModal = useShowModal();
    const addPanel = useAddDashboardPanel();
    const updatePage = useUpdatePageSignal();
    const refactorPage = useRefactorPageName();

    async function addPage() {
        const page = createNewBlankPage({name: ''});
        page.name = await showModal<string>(closePanel => {
            return <PageNameDialog closePanel={closePanel} allPages={allPagesSignal.get()} page={page}/>
        });
        page.id = guid();
        if (!isEmpty(page.name)) {
            updatePage({type: 'add-page', page})
        }
    }

    function deletePage(page: Page) {
        updatePage({type: 'delete-page', pageId: page.id})
    }

    async function clonePage(page: Page) {
        const newPage = structuredClone(page);
        newPage.id = guid();
        newPage.fetchers.forEach(f => f.id = guid())
        newPage.queries.forEach(q => q.id = guid())
        newPage.callables.forEach(q => q.id = guid())
        newPage.containers.forEach(container => {
            const oldId = container.id;
            const newId = guid();
            container.id = newId;
            newPage.containers.forEach(c => {
                if (c.children.includes(oldId)) {
                    c.children.splice(c.children.indexOf(oldId), 1, newId);
                }
                if (c.parent === oldId) {
                    c.parent = newId;
                }
            })
        })
        // here we need to prompt edit
        const newName = await showModal<string>(closePanel => {
            return <PageNameDialog closePanel={closePanel} allPages={allPagesSignal.get()} page={newPage}
                                   isForClone={true}/>
        });
        if (newName) {
            newPage.name = newName;
            updatePage({type: 'add-page', page: newPage})
        }
    }

    async function editPage(page: Page) {
        const currentName = page.name;
        const newName = await showModal<string>(closePanel => {
            return <PageNameDialog closePanel={closePanel} allPages={allPagesSignal.get()} page={page}/>
        });
        if (newName) {
            updatePage({type: 'page-name', name: newName, pageId: page.id})
            refactorPage({newName: newName, currentName: currentName});
        }
    }

    const openedFoldersSignal = useSignal<string[]>([]);
    return <div style={{display: 'flex', flexDirection: 'column'}}>
        <Button onClick={() => addPage()}
                style={{
                    margin: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    justifyContent: 'center',
                    padding: '0px 10px 2px 10px',
                    background: 'rgba(0,0,0,0.0)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    color: '#333',
                    marginBottom: 5
                }} icon={'IoMdAdd'}>
            {'Add New Page'}
        </Button>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const activePageId = activePageIdSignal.get()
                const allPages = allPagesSignal.get().sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
                const folders = openedFoldersSignal.get();
                const pages = convertToTree(allPages, folders);
                const focusedPath = allPages.find(p => p.id === activePageId)?.name ?? '';
                return <RenderTree data={pages} onToggle={(path) => {
                    const folders = openedFoldersSignal.get();
                    if (folders.includes(path)) {
                        openedFoldersSignal.set(folders.filter(p => p !== path))
                    } else {
                        openedFoldersSignal.set([...folders, path]);
                    }
                }} paddingLeft={0} focusedPath={focusedPath} onFocusedPathChange={path => {
                    const page = allPages.find(p => p.name === path);
                    if (page) {
                        allErrorsSignal.set([]);
                        activePageIdSignal.set(page.id);
                        addPanel({
                            position: 'mainCenter',
                            component: () => {
                                return <DesignPanel/>
                            },
                            title: page.name,
                            Icon: Icon.Page,
                            id: page.id,
                            tag: {
                                type: 'DesignPanel'
                            }
                        })
                    }
                }} onRenamePath={path => {
                    const page = allPages.find(p => p.name === path);
                    if (page) {
                        editPage(page).then();
                    }
                }} onDeletePath={path => {
                    const page = allPages.find(p => p.name === path);
                    if (page) {
                        deletePage(page);
                    }
                }} onClonePage={path => {
                    const page = allPages.find(p => p.name === path);
                    if (page) {
                        clonePage(page).then();
                    }
                }}/>
            }}
        </notifiable.div>
    </div>
}

function RenderTree(props: {
    data: TreeNode,
    style?: CSSProperties,
    styleLabel?: CSSProperties,
    paddingLeft: number,
    onToggle: (path: string) => void,
    focusedPath: string,
    onFocusedPathChange: (path: string) => void,
    onDeletePath: (path: string) => void,
    onRenamePath: (path: string) => void,
    onClonePage: (path: string) => void
}) {
    const {
        data,
        paddingLeft,
        onToggle,
        focusedPath,
        onFocusedPathChange,
        onDeletePath,
        onRenamePath,
        onClonePage
    } = props;
    const {activeDropZoneIdSignal} = useAppContext<AppDesignerContext>();
    return Object.keys(data).sort((a, b) => {
        const aNodeIsFolder = data[a].pageId !== undefined;
        const bNodeIsFolder = data[b].pageId !== undefined;
        if (aNodeIsFolder && !bNodeIsFolder) {
            return 1;
        }
        if (!aNodeIsFolder && bNodeIsFolder) {
            return -1;
        }
        return 0;
    }).map(key => {
        const node = data[key];
        const isFolder = node.pageId === undefined;
        const isOpen = node.isOpen
        const isFocused = node.path === focusedPath;


        /**

         data-element-id={props.draggableDataType}
         style={{
         padding: 5,
         borderRadius: 5,
         backgroundColor: 'white',
         display: 'flex',
         flexDirection:'column',
         alignItems: 'center',
         justifyContent: 'center',
         width: '20%',
         height: 50,
         flexShrink: 0,
         flexGrow: 0
         }} onDragStart={(event) => {
         event.dataTransfer.setData('text/plain', props.draggableDataType);
         const dragElement = document.querySelector(`[data-element-id="${props.draggableDataType}"]`);
         if (dragElement === null) {
         return;
         }
         const clone = dragElement.cloneNode(true) as HTMLElement;
         clone.style.position = 'absolute';
         clone.style.top = '-9999px'; // Move it off-screen so it doesn't interfere
         document.body.appendChild(clone);

         //event.dataTransfer.setDragImage(clone, 0, 0);
         setTimeout(() => {
         document.body.removeChild(clone);
         }, 0);
         }}
         draggable={true} onDragEnd={() => activeDropZoneIdSignal.set('')}

         */


        return <div key={key} style={{
            display: 'flex',
            flexDirection: 'column',
            background: isFocused ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.9)', ...props.style
        }}>
            <div style={{display: 'flex', paddingLeft: paddingLeft, alignItems: 'center', gap: 5, paddingRight: 5}}
                 data-element-id={node.pageId}
                 onClick={() => {
                     if (isFolder) {
                         onToggle(node.path)
                     } else {
                         onFocusedPathChange(node.path);
                     }
                 }} onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', node.pageId ?? '');
                const dragElement = document.querySelector(`[data-element-id="${node.pageId}"]`);
                if (dragElement === null) {
                    return;
                }
                const clone = dragElement.cloneNode(true) as HTMLElement;
                clone.style.position = 'absolute';
                clone.style.top = '-9999px'; // Move it off-screen so it doesn't interfere
                document.body.appendChild(clone);
                setTimeout(() => {
                    document.body.removeChild(clone);
                }, 0);
            }} draggable={true} onDragEnd={() => activeDropZoneIdSignal.set('')}>
                <div style={{width: 10}}>
                    {isFolder && isOpen && <Icon.ChevronDown/>}
                    {isFolder && !isOpen && <Icon.ChevronRight/>}
                </div>
                <div style={{display: 'flex'}}>
                    {isFolder &&
                        <Icon.Folder style={{color: colors.yellow}}/>
                    }
                    {!isFolder &&
                        <Icon.Component style={{color: colors.grey}}/>
                    }
                </div>
                <div style={{flexGrow: 1, ...props.styleLabel}}>
                    {key}
                </div>
                {!isFolder && isFocused &&
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }} onClick={() => onDeletePath(node.path)}>
                        <Icon.Delete style={{fontSize: 18}}/>
                    </div>
                }
                {!isFolder && isFocused &&
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }} onClick={() => onRenamePath(node.path)}>
                        <Icon.Edit style={{fontSize: 18}}/>
                    </div>
                }
                {!isFolder && isFocused &&
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }} onClick={() => onClonePage(node.path)}>
                        <Icon.SaveAs style={{fontSize: 18}}/>
                    </div>
                }
            </div>
            {isFolder && isOpen &&
                <RenderTree data={node.children ?? {}} styleLabel={props.styleLabel} paddingLeft={paddingLeft + 20}
                            onToggle={onToggle} focusedPath={focusedPath}
                            onFocusedPathChange={onFocusedPathChange}
                            onDeletePath={onDeletePath}
                            onRenamePath={onRenamePath}
                            onClonePage={onClonePage}
                />
            }
        </div>
    })
}