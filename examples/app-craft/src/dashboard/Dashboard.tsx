import React, {CSSProperties, HTMLProps, PropsWithChildren, ReactNode, useEffect} from "react";
import {IconType} from "react-icons";
import {notifiable, useSignal} from "react-hook-signal";
import {useHoveredOnPress} from "./useHoveredOnPress.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {Signal} from "signal-polyfill";
import {Icon} from "../app-designer/Icon.ts";
import {BORDER} from "../app-designer/Border.ts";
import {isEmpty} from "../utils/isEmpty.ts";

type Panel = {
    title: ReactNode,
    Icon: IconType,
    component: React.FC,
    position: 'left' | 'bottom' | 'right' | 'center' | 'leftBottom' | 'rightBottom'
}

type PanelInstance = Panel & {
    id: string
}

export function Dashboard<T extends Record<string, Panel>>(props: PropsWithChildren<{
    panels: T,
    defaultSelectedPanel: {
        left?: keyof T,
        right?: keyof T,
        bottom?: keyof T,
        leftBottom?: keyof T,
        rightBottom?: keyof T,
    }
}>) {
    const panelsSignal = useSignal<Array<PanelInstance>>([]);
    useEffect(() => {
        const result: Array<PanelInstance> = [];
        Object.keys(props.panels).forEach(p => {
            result.push({...props.panels[p], id: p})
        })
        panelsSignal.set(result);
    }, [props.panels]);

    const selectedPanelSignal = useSignal<{
        left?: keyof T,
        bottom?: keyof T,
        right?: keyof T,
        center?: keyof T,
        leftBottom?: keyof T,
        rightBottom?: keyof T
    }>(props.defaultSelectedPanel);

    return (
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
                            <RenderIcons panels={allPanels.filter(p => p.position === 'bottom')}
                                         value={(selectedPanel.leftBottom ?? '') as string}
                                         onChange={value => {
                                             selectedPanelSignal.set({...selectedPanelSignal.get(), leftBottom: value})
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
                        <RenderPanel panelsSignal={panelsSignal} selectedPanelSignal={castSignal(selectedPanelSignal)}
                                     position={'left'}/>
                        <RenderPanel panelsSignal={panelsSignal} selectedPanelSignal={castSignal(selectedPanelSignal)}
                                     position={'leftBottom'}/>
                    </notifiable.div>
                    <RenderTabPanel panelsSignal={panelsSignal}/>

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
                        <RenderPanel panelsSignal={panelsSignal} selectedPanelSignal={castSignal(selectedPanelSignal)}
                                     position={'right'}/>
                        <RenderPanel panelsSignal={panelsSignal} selectedPanelSignal={castSignal(selectedPanelSignal)}
                                     position={'rightBottom'}/>
                    </notifiable.div>

                </div>
                <RenderPanel panelsSignal={panelsSignal} selectedPanelSignal={castSignal(selectedPanelSignal)}
                             position={'bottom'}/>
            </div>
            <notifiable.div
                style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: BORDER}}>
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
                                             selectedPanelSignal.set({...selectedPanelSignal.get(), rightBottom: value})
                                         }}/>
                        </div>
                    </>
                }}
            </notifiable.div>
        </div>
    );
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

function RenderPanel<T extends {
    left?: string,
    right?: string,
    bottom?: string,
    leftBottom?: string,
    rightBottom?: string,
    center?: string
}>(props: {
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
    return value as unknown as Signal.State<{
        left?: string,
        right?: string,
        bottom?: string,
        leftBottom?: string,
        rightBottom?: string
    }>
}

function RenderTabPanel(props: { panelsSignal: Signal.State<Array<PanelInstance>> }) {
    const {panelsSignal} = props;
    const selectedPanelSignal = useSignal('');
    return <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
        <notifiable.div style={{display: 'flex', flexDirection: 'row', borderBottom: BORDER}}>
            {() => {
                const panels = panelsSignal.get().filter(p => p.position === 'center');
                return panels.map(panel => {
                    return <TabButton onClick={() => {
                        selectedPanelSignal.set(panel.id);
                    }} key={panel.id}>
                        <div>{panel.title}</div>
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Icon.Close/>
                        </div>
                    </TabButton>
                })
            }}
        </notifiable.div>
        <notifiable.div>
            {() => {
                const panels = panelsSignal.get();
                const selectedPanel = selectedPanelSignal.get();
                const Component = panels.find(p => p.id === selectedPanel)?.component ?? EmptyComponent;
                if (Component) {
                    return <Component/>
                }
                return <></>
            }}
        </notifiable.div>
    </div>
}

function TabButton(props: HTMLProps<HTMLDivElement>) {
    const {ref, isHovered, isOnPress} = useHoveredOnPress();
    const style: CSSProperties = {
        background: isHovered ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.1)',
        boxShadow: isOnPress ? '0px 5px 5px 5px rgba(0,0,0,0.1) inset' : '0px 5px 5px 5px rgba(0,0,0,0) inset',
        padding: '6px 5px 7px 10px',
        display: 'flex',
        gap: 5,
        alignItems: 'center',
        ...props.style
    }

    return <div ref={ref}  {...props} style={style}>
        {props.children}
    </div>
}

function EmptyComponent() {
    return <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <Icon.Question/>
        <div>
            Oops we cant find the component to render
        </div>
    </div>
}