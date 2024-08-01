import React, {
    createContext,
    CSSProperties,
    HTMLProps,
    PropsWithChildren,
    ReactNode,
    useContext,
    useEffect,
    useState
} from "react";
import {IconType} from "react-icons";
import {notifiable, useSignal, useSignalEffect} from "react-hook-signal";
import {useHoveredOnPress} from "./useHoveredOnPress.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {Signal} from "signal-polyfill";
import {Icon} from "../app-designer/Icon.ts";
import {BORDER} from "../app-designer/Border.ts";
import {isEmpty} from "../utils/isEmpty.ts";
import {AppDesignerContext} from "../app-designer/AppDesignerContext.ts";
import {useRemoveDashboardPanel} from "./useRemoveDashboardPanel.ts";

type PanelPosition = 'left' | 'bottom' | 'right' | 'mainCenter' | 'leftBottom' | 'rightBottom' | 'sideCenter'
export type Panel = {
    title: ReactNode,
    Icon: IconType,
    component: React.FC,
    position: PanelPosition
}
type SelectedPanelType = {
    [k in PanelPosition]?: string
}
type PanelInstance = Panel & {
    id: string,
    pageId: string | 'global'
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
    defaultSelectedPanel: { [k in PanelPosition]?: keyof T }
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
                                             }}/>
                                <div style={{borderTop: BORDER, height: 1}}/>
                                <RenderIcons panels={allPanels.filter(p => p.position === 'leftBottom')}
                                             value={(selectedPanel.leftBottom ?? '') as string}
                                             onChange={value => {
                                                 selectedPanelSignal.set({
                                                     ...selectedPanelSignal.get(),
                                                     leftBottom: value
                                                 })
                                             }}/>
                            </div>
                            <RenderIcons panels={allPanels.filter(p => p.position === 'bottom')}
                                         value={(selectedPanel.bottom ?? '') as string}
                                         onChange={value => {
                                             selectedPanelSignal.set({...selectedPanelSignal.get(), bottom: value})
                                         }}/>
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
                                width: 200,
                                overflow: 'auto',
                                borderRight: BORDER
                            }
                        }}>
                            <RenderPanel panelsSignal={panelsSignal}
                                         selectedPanelSignal={castSignal(selectedPanelSignal)}
                                         position={'left'}/>
                            <RenderPanel panelsSignal={panelsSignal}
                                         selectedPanelSignal={castSignal(selectedPanelSignal)}
                                         position={'leftBottom'}/>
                        </notifiable.div>
                        <div style={{display: 'flex', flexDirection: 'row', flexGrow: 1}}>
                            <RenderTabPanel panelsSignal={panelsSignal} selectedPanelSignal={selectedPanelSignal}
                                            position={'mainCenter'}/>
                            <RenderTabPanel panelsSignal={panelsSignal} selectedPanelSignal={selectedPanelSignal}
                                            position={'sideCenter'}/>
                        </div>
                        <notifiable.div style={() => {
                            const selectedPanel = selectedPanelSignal.get();
                            const noPanel = isEmpty(selectedPanel.right) && isEmpty(selectedPanel.rightBottom);
                            return {
                                display: noPanel ? 'none' : 'flex',
                                flexDirection: 'column',
                                width: 200,
                                overflow: 'auto',
                                borderLeft: BORDER
                            }
                        }}>
                            <RenderPanel panelsSignal={panelsSignal}
                                         selectedPanelSignal={castSignal(selectedPanelSignal)}
                                         position={'right'}/>
                            <RenderPanel panelsSignal={panelsSignal}
                                         selectedPanelSignal={castSignal(selectedPanelSignal)}
                                         position={'rightBottom'}/>
                        </notifiable.div>

                    </div>
                    <RenderPanel panelsSignal={panelsSignal} selectedPanelSignal={castSignal(selectedPanelSignal)}
                                 position={'bottom'}/>
                </div>
                <notifiable.div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderLeft: BORDER
                    }}>
                    {() => {
                        const allPanels = panelsSignal.get();
                        const selectedPanel = selectedPanelSignal.get();
                        return <>
                            <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
                                <RenderIcons panels={allPanels.filter(p => p.position === 'right')}
                                             value={(selectedPanel.right ?? '') as string}
                                             onChange={value => {
                                                 selectedPanelSignal.set({...selectedPanelSignal.get(), right: value})
                                             }}/>
                                <div style={{borderTop: BORDER, height: 1}}/>
                                <RenderIcons panels={allPanels.filter(p => p.position === 'rightBottom')}
                                             value={(selectedPanel.rightBottom ?? '') as string}
                                             onChange={value => {
                                                 selectedPanelSignal.set({
                                                     ...selectedPanelSignal.get(),
                                                     rightBottom: value
                                                 })
                                             }}/>
                            </div>
                        </>
                    }}
                </notifiable.div>
            </div>
        </DashboardContext.Provider>
    )
}

function RenderIcons(props: { panels: Array<PanelInstance>, value: string, onChange: (key?: string) => void }) {
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
    panelsSignal: Signal.State<Array<PanelInstance>>
}) {
    const {selectedPanelSignal, position, panelsSignal} = props;
    return <notifiable.div style={{
        display: 'flex',
        flexDirection: 'column'
    }}>
        {() => {
            const panels = panelsSignal.get();
            const selectedLeftPanelId = selectedPanelSignal.get()[position] as string;
            if (selectedLeftPanelId) {
                const panel = panels.find(p => p.id === selectedLeftPanelId);
                const Component = panel?.component ?? EmptyComponent;
                return <div style={{display: 'flex', flexDirection: 'column'}}>
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
                    <Component/>
                </div>
            }
            return <></>
        }}
    </notifiable.div>
}

function castSignal(value: unknown) {
    return value as unknown as Signal.State<SelectedPanelType>
}


function RenderTabPanel(props: {
    panelsSignal: Signal.State<Array<PanelInstance>>,
    selectedPanelSignal: Signal.State<SelectedPanelType>,
    position: PanelPosition
}) {
    const {panelsSignal, selectedPanelSignal, position} = props;
    const {activePageIdSignal} = useContext(AppDesignerContext);
    const [panelsComputed, setPanelsComputed] = useState<Array<PanelInstance>>([]);
    const [selectedPanel, setSelectedPanel] = useState<SelectedPanelType>({});
    useSignalEffect(() => {
        const pageId = activePageIdSignal.get();
        let panels = panelsSignal.get().filter(p => p.position === position);
        if (position === 'sideCenter') {
            panels = panels.filter(p => p.pageId === pageId)
        }
        setPanelsComputed(panels)
    });
    useSignalEffect(() => {
        setSelectedPanel(selectedPanelSignal.get())
    })
    const removePanel = useRemoveDashboardPanel();
    const isEmpty = panelsComputed.length === 0;
    const Component = panelsComputed.find(p => p.id === selectedPanel[position])?.component ?? EmptyComponent;
    return <div style={{
        display: isEmpty ? 'none' : 'flex',
        flexDirection: 'column',
        flexBasis: '50%',
        flexGrow: 1,
        overflow: 'auto',
        borderLeft: position === 'sideCenter' ? BORDER : 'unset',
    }}>
        <div style={{display: isEmpty ? 'none' : 'flex', flexDirection: 'row', borderBottom: BORDER}}>
            {panelsComputed.map(panel => {

                const isSelected = (selectedPanel && panel.id === selectedPanel[position]) ?? false;
                return <TabButton onClick={() => {
                    selectedPanelSignal.set({...selectedPanelSignal.get(), [position]: panel.id});
                }} key={panel.id} isSelected={isSelected}>
                    <div>{panel.title}</div>
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
            <Component/>
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
        ...style
    }

    return <div ref={ref}  {...properties} style={elementStyle}>
        {props.children}
    </div>
}

function EmptyComponent() {
    return <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        gap: 10
    }}>
        <Icon.Question style={{fontSize: 18}}/>
        <div>
            Oops we cant find the component to render
        </div>
    </div>
}