import React, {createContext, CSSProperties, HTMLProps, PropsWithChildren, ReactNode, useEffect, useState} from "react";
import {IconType} from "react-icons";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {useHoveredOnPress} from "./useHoveredOnPress.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {Signal} from "signal-polyfill";
import {Icon} from "../Icon.ts";
import {BORDER} from "../Border.ts";
import {isEmpty} from "../../utils/isEmpty.ts";
import {useRemoveDashboardPanel} from "./useRemoveDashboardPanel.ts";
import {useAppContext} from "../hooks/useAppContext.ts";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {EmptyComponent} from "../empty-component/EmptyComponent.tsx";
import {ToolBar} from "../ToolBar.tsx";
import {addCenterPanel} from "./centerPanelStacks.ts";

type PanelPosition = 'left' | 'bottom' | 'right' | 'mainCenter' | 'leftBottom' | 'rightBottom'
export type Panel = {
    title: ReactNode,
    Icon: IconType,
    component: React.FC,
    position: PanelPosition
}
type SelectedPanelType = {
    [k in PanelPosition]?: string
}

type PanelType =
    'CallableEditorPanel'
    | 'VariableEditorPanel'
    | 'TableEditor'
    | 'ComponentPropertyEditor'
    | 'FetcherEditorPanel'
    | 'DesignPanel'
    | 'QueryEditorPanel'

export type PanelInstance = Panel & {
    id: string,
    pageId: string | 'global',
    tag?: { containerId?: string, propertyName?: string, variableId?: string, type: PanelType }
}
export const DashboardContext = createContext<{
    panelsSignal: Signal.State<Array<PanelInstance>>,
    selectedPanelSignal: Signal.State<SelectedPanelType>
}>({
    panelsSignal: new Signal.State<Array<PanelInstance>>([]),
    selectedPanelSignal: new Signal.State({})
})

export function Dashboard<T extends Record<string, Panel>>(props: PropsWithChildren<{
    panels: T,
    defaultSelectedPanel: { [k in PanelPosition]?: keyof T },
    onMainCenterClicked: (panel: PanelInstance, selectedPanelSignal: Signal.State<SelectedPanelType>) => void
}>) {
    const panelsSignal = useSignal<Array<PanelInstance>>([]);
    useEffect(() => {
        const result: Array<PanelInstance> = [...panelsSignal.get()];
        Object.keys(props.panels).forEach(p => {
            const isNotExist = result.find(i => i.id === p) === undefined;
            if (isNotExist) {
                result.push({...props.panels[p], id: p, pageId: 'global'})
            }
        })
        panelsSignal.set(result);
    }, [panelsSignal, props.panels]);

    const selectedPanelSignal = useSignal<SelectedPanelType>(props.defaultSelectedPanel as SelectedPanelType);

    useSignalEffect(() => {
        const selectedPanel = {...selectedPanelSignal.get()};

        if (JSON.stringify(selectedPanelSignal.get()) !== JSON.stringify(selectedPanel)) {
            setTimeout(() => {
                selectedPanelSignal.set({...selectedPanel})
            }, 0)
        }
    })

    return (
        <DashboardContext.Provider value={{panelsSignal, selectedPanelSignal}}>
            <div style={{display: 'flex', flexDirection: 'row', height: '100%', overflow: 'auto'}}>
                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRight: BORDER
                }}>
                    {() => {
                        const selectedPanel = selectedPanelSignal.get();
                        const allPanels = panelsSignal.get();
                        return <>
                            <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
                                <RenderIcons panels={allPanels.filter(p => p.position === 'left')}
                                             value={(selectedPanel.left ?? '') as string}
                                             onChange={value => {
                                                 selectedPanelSignal.set({...selectedPanelSignal.get(), left: value})
                                             }}
                                />
                                <div style={{borderTop: BORDER, height: 1}}/>
                                <RenderIcons panels={allPanels.filter(p => p.position === 'leftBottom')}
                                             value={(selectedPanel.leftBottom ?? '') as string}
                                             onChange={value => {
                                                 selectedPanelSignal.set({
                                                     ...selectedPanelSignal.get(),
                                                     leftBottom: value
                                                 })
                                             }}
                                />
                            </div>
                            <RenderIcons panels={allPanels.filter(p => p.position === 'bottom')}
                                         value={(selectedPanel.bottom ?? '') as string}
                                         onChange={value => {
                                             selectedPanelSignal.set({...selectedPanelSignal.get(), bottom: value})
                                         }}
                            />
                        </>
                    }}
                </notifiable.div>
                <div style={{display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', flexGrow: 1}}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        overflow: 'auto',
                        flexGrow: 1,
                    }}>
                        <notifiable.div style={() => {
                            const selectedPanel = selectedPanelSignal.get();
                            const noPanel = isEmpty(selectedPanel.left) && isEmpty(selectedPanel.leftBottom);
                            return {
                                display: noPanel ? 'none' : 'flex',
                                flexDirection: 'column',
                                flexShrink: 0,
                                width: 350,
                                overflow: 'auto',
                                borderRight: BORDER
                            }
                        }}>
                            <RenderPanel panelsSignal={panelsSignal}
                                         selectedPanelSignal={selectedPanelSignal}
                                         position={'left'}/>
                            <RenderPanel panelsSignal={panelsSignal}
                                         selectedPanelSignal={selectedPanelSignal}
                                         position={'leftBottom'}/>
                        </notifiable.div>
                        <div style={{display: 'flex', flexGrow: 1, overflow: 'auto'}}>
                            <RenderTabPanel panelsSignal={panelsSignal} selectedPanelSignal={selectedPanelSignal}
                                            position={'mainCenter'}
                                            onMainCenterClicked={(panel) => props.onMainCenterClicked(panel, selectedPanelSignal)}/>
                        </div>
                        <notifiable.div style={() => {
                            const selectedPanel = selectedPanelSignal.get();
                            const noPanel = isEmpty(selectedPanel.right) && isEmpty(selectedPanel.rightBottom);

                            return {
                                display: noPanel ? 'none' : 'flex',
                                flexDirection: 'column',
                                flexShrink: 0,
                                width: 200,
                                overflow: 'auto',
                                borderLeft: BORDER
                            }
                        }}>
                            <RenderPanel panelsSignal={panelsSignal}
                                         selectedPanelSignal={selectedPanelSignal}
                                         position={'right'}/>
                            <RenderPanel panelsSignal={panelsSignal}
                                         selectedPanelSignal={selectedPanelSignal}
                                         position={'rightBottom'}/>
                        </notifiable.div>
                    </div>
                    <RenderPanel panelsSignal={panelsSignal} selectedPanelSignal={selectedPanelSignal}
                                 position={'bottom'} style={{minHeight: 0}}/>
                </div>
                <notifiable.div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderLeft: BORDER,
                        flexShrink: 0
                    }}>
                    {() => {
                        const allPanels = panelsSignal.get();
                        const selectedPanel = selectedPanelSignal.get();
                        return <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
                            <RenderIcons panels={allPanels.filter(p => p.position === 'right')}
                                         value={(selectedPanel.right ?? '') as string}
                                         onChange={value => {
                                             selectedPanelSignal.set({...selectedPanelSignal.get(), right: value})
                                         }}
                            />
                            <div style={{borderTop: BORDER, height: 1}}/>
                            <RenderIcons panels={allPanels.filter(p => p.position === 'rightBottom')}
                                         value={(selectedPanel.rightBottom ?? '') as string}
                                         onChange={value => {
                                             selectedPanelSignal.set({
                                                 ...selectedPanelSignal.get(),
                                                 rightBottom: value
                                             })
                                         }}
                            />
                        </div>
                    }}
                </notifiable.div>
            </div>
            <ToolBar/>
        </DashboardContext.Provider>
    )
}

function RenderIcons(props: {
    panels: Array<PanelInstance>,
    value: string,
    onChange: (key?: string) => void,
}) {
    const {panels, onChange, value} = props;


    return <div style={{display: 'flex', flexDirection: 'column', padding: '10px 5px', gap: 5}}>
        {panels.map(p => {
            const {Icon} = p
            const isFocused = p.id === value;
            return <RenderIcon key={p.id} isFocused={isFocused} onClick={() => {
                onChange(isFocused ? '' : p.id);
            }}>
                <Icon style={{fontSize: 22}}/>
            </RenderIcon>
        })}
    </div>
}

function RenderIcon(props: PropsWithChildren<{ isFocused: boolean, onClick: () => void, style?: CSSProperties }>) {
    const {ref, isHovered, isOnPress} = useHoveredOnPress();
    const {isFocused, onClick} = props;
    return <div ref={ref} style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: 5,
        justifyContent: 'center',
        backgroundColor: isHovered ? isFocused ? colors.blue : 'rgba(0,0,0,0.1)' : isFocused ? colors.blue : 'rgba(255,255,255,1)',
        boxShadow: isOnPress ? '0px 5px 5px 3px rgba(0,0,0,0.1) inset' : '0px 0px 0px 0px rgba(0,0,0,0) inset',
        color: isFocused ? 'white' : '#333',
        padding: 5,
        ...props.style
    }}
                onClick={() => onClick()}
    >
        {props.children}
    </div>
}

function RenderPanel<T extends SelectedPanelType>(props: {
    selectedPanelSignal: Signal.State<T>,
    position: keyof T,
    panelsSignal: Signal.State<Array<PanelInstance>>,
    style?: CSSProperties
}) {
    const {selectedPanelSignal, position, panelsSignal} = props;
    const panels = useComputed(() => {
        return panelsSignal.get().filter(p => p.position === position)
    })
    return <notifiable.div style={() => {
        const selectedLeftPanelId = selectedPanelSignal.get()[position] as string;
        const hasFocused = !isEmpty(selectedLeftPanelId);
        return {
            display: hasFocused ? 'flex' : 'none',
            flexDirection: 'column',
            overflow: 'auto',
            minHeight: '50%',
            ...props.style
        } as CSSProperties
    }}>
        {() => {
            const selectedLeftPanelId = selectedPanelSignal.get()[position] as string;
            return panels.get().map(panel => {
                const Component = panel?.component ?? EmptyComponent;
                const isFocused = selectedLeftPanelId === panel.id;
                return <div style={{
                    display: isFocused ? 'flex' : 'none',
                    flexDirection: 'column',
                    overflow: 'auto',
                    borderTop: BORDER
                }} key={panel.id}>
                    <div style={{
                        display: 'flex',
                        background: 'rgba(0,0,0,0.05)',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: BORDER

                    }}>
                        <div style={{padding: '5px 10px'}}>
                            {panel?.title}
                        </div>

                        <RenderIcon onClick={() => {
                            selectedPanelSignal.set({...selectedPanelSignal.get(), [position]: ''});
                        }} isFocused={false} style={{margin: '5px 5px'}}>
                            <Icon.Minimize/>
                        </RenderIcon>

                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
                        <Component/>
                    </div>
                </div>
            })

        }}
    </notifiable.div>
}


function RenderTabPanel(props: {
    panelsSignal: Signal.State<Array<PanelInstance>>,
    selectedPanelSignal: Signal.State<SelectedPanelType>,
    position: PanelPosition,
    onMainCenterClicked: (panel: PanelInstance) => void
}) {
    const {panelsSignal, selectedPanelSignal, position} = props;
    const {activePageIdSignal} = useAppContext<AppDesignerContext>();
    const [panelsComputed, setPanelsComputed] = useState<Array<PanelInstance>>([]);
    const [selectedPanel, setSelectedPanel] = useState<SelectedPanelType>({});
    useSignalEffect(() => {
        const panels = panelsSignal.get().filter(p => p.position === position);
        setPanelsComputed(panels)
    });
    useSignalEffect(() => {
        setSelectedPanel(selectedPanelSignal.get())
    })
    const removePanel = useRemoveDashboardPanel();
    const isEmpty = panelsComputed.length === 0;

    return <div style={{
        display: isEmpty ? 'none' : 'flex',
        flexDirection: 'column',
        flexBasis: '50%',
        flexGrow: 1,
        overflow: 'auto',
    }}>
        <div style={{display: isEmpty ? 'none' : 'flex', flexDirection: 'row', borderBottom: BORDER}}>
            {panelsComputed.map(panel => {
                const Econ = panel.tag?.type === 'DesignPanel' ? Icon.Component :
                    panel.tag?.type === 'QueryEditorPanel' ? Icon.Query :
                        panel.tag?.type === 'FetcherEditorPanel' ? Icon.Fetcher :
                            panel.tag?.type === 'CallableEditorPanel' ? Icon.Function :
                                panel.tag?.type === 'VariableEditorPanel' ? Icon.Variable :
                                    panel.tag?.type === 'ComponentPropertyEditor' ? Icon.Property :
                                        panel.tag?.type === 'TableEditor' ? Icon.Table : Icon.Component

                const isSelected = (selectedPanel && panel.id === selectedPanel[position]) ?? false;
                let title = panel.title;
                if (typeof panel.title === 'string') {
                    const paths = panel.title.split('/');
                    title = paths[paths.length - 1];
                }
                return <TabButton onClick={() => {
                    const cloneSelectedPanel = structuredClone(selectedPanelSignal.get());
                    cloneSelectedPanel[position] = panel.id;
                    // if this is the main panel then we need to activate the signal id
                    if (position === 'mainCenter') {
                        activePageIdSignal.set(panel.pageId);
                        props.onMainCenterClicked(panel)
                        addCenterPanel(panel.id);
                    }
                    selectedPanelSignal.set(cloneSelectedPanel);
                }} key={panel.id} isSelected={isSelected}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Econ/></div>
                    <div
                        style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{title}</div>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removePanel(panel.id);

                    }}><Icon.Close/>
                    </div>
                </TabButton>
            })}
        </div>
        <div style={{flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
            {panelsComputed.map(panel => {
                const isDesignPanel = panel.tag?.type === 'DesignPanel';
                const isSelected = (selectedPanel && panel.id === selectedPanel[position]) ?? false;
                // if its design panel, we need to ensure only one component mounted at a time, so here we use EmptyComponent to replace it
                const Component = isDesignPanel && !isSelected ? EmptyComponent : panel.component ?? EmptyComponent;
                return <div style={{
                    display: isSelected ? 'flex' : 'none',
                    flexDirection: 'column',
                    overflow: 'auto',
                    flexGrow: 1
                }} key={panel.id}>
                    <Component/>
                </div>
            })}
        </div>
    </div>
}

function TabButton(props: HTMLProps<HTMLDivElement> & { isSelected: boolean }) {
    const {ref, isOnPress} = useHoveredOnPress();
    const {style, isSelected, ...properties} = props;
    const elementStyle: CSSProperties = {
        boxShadow: isOnPress ? '0px 5px 5px 5px rgba(0,0,0,0.1) inset' : '0px 5px 5px 5px rgba(0,0,0,0) inset',
        padding: '5px 5px 5px 10px',
        borderBottom: isSelected ? '3px solid rgba(0,0,0,0.5)' : 'unset',
        display: 'flex',
        gap: 5,
        alignItems: 'center',
        overflow: "hidden",
        whiteSpace: 'nowrap',
        ...style
    }

    return <div ref={ref}  {...properties} style={elementStyle}>
        {props.children}
    </div>
}
