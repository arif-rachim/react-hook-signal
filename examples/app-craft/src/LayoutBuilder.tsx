import {Notifiable, notifiable, useSignal} from "react-hook-signal";
import {Component} from "./comp/Component.ts";
import {ComponentRenderer} from "./comp/ComponentRenderer.tsx";
import {ComponentProperties} from "./comp/ComponentProperties.tsx";
import {ComponentContext} from "./comp/ComponentContext.ts";
import {ComponentLibrary} from "./comp/ComponentLibrary.tsx";
import {BORDER} from "./comp/Border.ts";
import {useEffect, useId} from "react";
import {View} from "./HomeScreen.tsx";
import {MdArrowBack} from "react-icons/md";
import {colors} from "./utils/colors.ts";
import ComponentSignals from "./comp/ComponentSignals.tsx";
import {Tab} from "./tab/Tab.tsx";

/**
 * Represents the main application comp.
 */
function LayoutBuilder(props: { value: View, onChange?: (param?: View) => void }) {
    const {components, ...view} = props.value;
    const componentID = useId();
    const componentsSignal = useSignal<Component[]>(components);
    useEffect(() => {
        componentsSignal.set([...components]);
    }, [components, componentsSignal]);
    const viewSignal = useSignal<Omit<View, 'components'>>(view);
    useEffect(() => {
        viewSignal.set({...view});
    }, [view, viewSignal]);
    const focusedComponentSignal = useSignal<Component | undefined>(undefined);
    const rightPanelWidthSignal = useSignal<number | undefined>(undefined);
    const leftPanelWidthSignal = useSignal<number | undefined>(150);

    const errors = useSignal<Record<string, string>>({})

    function onMouseRightMove(e: MouseEvent) {
        const container = document.getElementById(componentID);
        if (container === null) return;
        const domRect = container.getBoundingClientRect();
        rightPanelWidthSignal.set((domRect.left + domRect.width) - e.clientX - 5);
    }

    function onMouseLeftMove(e: MouseEvent) {
        const container = document.getElementById(componentID);
        if (container === null) return;
        const domRect = container.getBoundingClientRect();
        leftPanelWidthSignal.set(e.clientX - domRect.left)
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseRightMove);
        document.removeEventListener('mousemove', onMouseLeftMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function validateView() {
        const view = viewSignal.get();
        const newErrors = {...errors.get()};
        if (isEmpty(view.name)) {
            newErrors.name = 'Name is required';
        } else {
            delete newErrors.name;
        }
        if (isEmpty(view.description)) {
            newErrors.description = 'Description is required';
        } else {
            delete newErrors.description;
        }
        errors.set(newErrors);
    }

    function onSaveClicked() {
        validateView();
        if (Object.keys(errors.get()).length > 0) {
            return;
        }
        if (props.onChange) {
            const view = viewSignal.get();
            const components = componentsSignal.get();
            props.onChange({...view, components});
        }
    }

    return <ComponentContext.Provider value={{components: componentsSignal, focusedComponent: focusedComponentSignal}}>
        <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'auto'}}>
            <div style={{
                background: 'white',
                display: 'flex',
                alignItems: 'flex-end',
                flexDirection: 'row',
                borderBottom: BORDER,
                gap: 10,
                padding: 10
            }}>
                <div style={{padding: 5, cursor: 'pointer'}} onClick={() => {
                    if (props.onChange) {
                        props.onChange();
                    }
                }}>
                    <MdArrowBack style={{fontSize: 32}}/>
                </div>
                <label style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
                        <div style={{paddingLeft: 5, flexGrow: 1}}>Name :</div>
                        <notifiable.div style={{
                            fontSize: 12,
                            lineHeight: 1.1,
                            paddingRight: 5,
                            color: colors.red
                        }}>{() => errors.get().name}</notifiable.div>
                    </div>
                    <notifiable.input style={() => {
                        const hasErrors = !isEmpty(errors.get().name);
                        return {
                            border: hasErrors ? `1px solid ${colors.red}` : BORDER,
                            padding: '5px 5px',
                            borderRadius: 5,
                            lineHeight: 1
                        }
                    }}
                                      placeholder={'Component Name'} maxLength={20}
                                      value={() => {
                                          return viewSignal.get().name;
                                      }}
                                      onChange={(e) => {
                                          const err = {...errors.get()};
                                          delete err.name;
                                          errors.set(err);
                                          const value = e.target.value;
                                          viewSignal.set({...viewSignal.get(), name: value});
                                      }}
                    />

                </label>
                <label style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
                        <div style={{paddingLeft: 5, flexGrow: 1}}>Description :</div>
                        <notifiable.div style={{
                            fontSize: 12,
                            lineHeight: 1.1,
                            paddingRight: 5,
                            color: colors.red
                        }}>{() => errors.get().description}</notifiable.div>
                    </div>
                    <notifiable.input style={() => {
                        const hasErrors = !isEmpty(errors.get().description);
                        return {
                            border: hasErrors ? `1px solid ${colors.red}` : BORDER,
                            padding: '5px 5px',
                            borderRadius: 5,
                            lineHeight: 1
                        }
                    }} placeholder={'Description'} maxLength={255}
                                      value={() => viewSignal.get().description}
                                      onChange={(e) => {
                                          const err = {...errors.get()};
                                          delete err.description;
                                          errors.set(err);
                                          const value = e.target.value;
                                          viewSignal.set({...viewSignal.get(), description: value});
                                      }}
                    />
                </label>
                <button
                    style={{border: BORDER, background: 'rgba(0,0,0,0.1)', padding: '5px 5px', borderRadius: 5}}
                    onClick={onSaveClicked}
                >Save
                </button>
            </div>

            <div id={componentID} style={{display: 'flex', flexDirection: 'row', height: '100%', overflow: 'auto'}}>
                <notifiable.div style={() => {
                    const widthValue = leftPanelWidthSignal.get();
                    return {
                        width: widthValue,
                        borderRight: '1px solid #CCC',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 5
                    }
                }}>
                    <div style={{display: 'flex', flexDirection: 'column', marginTop: 5}}>
                        <ComponentLibrary/>
                    </div>
                    <div style={{borderBottom: BORDER}}></div>
                    <div style={{display: 'flex', flexDirection: 'column', marginRight: 5, marginTop: 5}}>
                        <Notifiable component={ComponentRenderer} comp={() => {
                            const componentsRootId = viewSignal.get().id;
                            return componentsSignal.get().find(i => i.id === componentsRootId)!
                        }} renderAsTree={true}/>
                    </div>
                </notifiable.div>
                <div style={{height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', width: 5, cursor: 'ew-resize'}}
                     onMouseDown={() => {
                         document.addEventListener('mousemove', onMouseLeftMove);
                         document.addEventListener('mouseup', onMouseUp);
                     }}></div>
                <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                    <Notifiable component={ComponentRenderer} comp={() => {
                        const componentsRootId = viewSignal.get().id;
                        return componentsSignal.get().find(i => i.id === componentsRootId)!;
                    }}/>
                </div>

                <div style={{height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', width: 5, cursor: 'ew-resize'}}
                     onMouseDown={() => {
                         document.addEventListener('mousemove', onMouseRightMove);
                         document.addEventListener('mouseup', onMouseUp);
                     }}></div>
                <notifiable.div style={() => {
                    const widthValue = rightPanelWidthSignal.get();
                    return {
                        width: widthValue ?? 250,
                        borderLeft: '1px solid #CCC',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}>
                    <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                        <Tab style={{flexGrow: 1}} items={{
                            properties: {
                                title: 'Properties',
                                component: ComponentProperties
                            },
                            signals: {
                                title: 'Signals',
                                component: ComponentSignals
                            }
                        }}/>
                    </div>
                </notifiable.div>
            </div>
        </div>
    </ComponentContext.Provider>
}


function isEmpty(value: unknown) {
    return value === undefined || value === null || value.toString().trim() === ''
}

export default LayoutBuilder;
