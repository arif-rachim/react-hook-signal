import {CSSProperties, PropsWithChildren, useContext} from "react";
import {notifiable} from "react-hook-signal";
import {ComponentContext} from "./ComponentContext.ts";
import {Component, InputComponent, LabelComponent} from "./Component.ts";
import {BORDER} from "./Border.ts";
import {Signal} from "signal-polyfill";
import {isContainer, isInputComponent, isLabelComponent} from "./ComponentLibrary.tsx";
import Visible from "./Visible.tsx";


function WidthProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Width'} width={'50%'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
            return focusedComponent.get()?.style.width ?? ''
        }} onChange={(e) => {
            let newValue: string | number = e.target.value;
            if (typeof newValue === 'string' && !newValue.endsWith('%')) {
                const number = parseInt(e.target.value);
                if (!isNaN(number)) {
                    newValue = number;
                }
            }
            updateValue((thisComponent) => {
                thisComponent.style.width = newValue as (number | `${number}%` | undefined);
                console.log("UPDATING WIDTH ",thisComponent.style.width);
            });
        }}/>
    </HorizontalLabel>;
}

function LabelProperty(props: {
    focusedComponent: Signal.State<LabelComponent>,
    updateValue: (callback: (thisComponent: LabelComponent) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Label'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
            return focusedComponent.get()?.label ?? ''
        }} onChange={(e) => {
            const newValue: string = e.target.value;
            updateValue((thisComponent) => {
                thisComponent.label = newValue;
            });
        }}/>
    </HorizontalLabel>;
}

function ValueProperty(props: {
    focusedComponent: Signal.State<InputComponent>,
    updateValue: (callback: (thisComponent: InputComponent) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Value'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER}} value={():string => {
            return focusedComponent.get()?.value?.toString() ?? ''
        }} onChange={(e) => {
            const newValue: string = e.target.value;
            updateValue((thisComponent) => {
                thisComponent.value = newValue;
            });
        }}/>
    </HorizontalLabel>;
}

function NameProperty(props: {
    focusedComponent: Signal.State<InputComponent>,
    updateValue: (callback: (thisComponent: InputComponent) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Name'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
            return focusedComponent.get()?.name ?? ''
        }} onChange={(e) => {
            const newValue: string = e.target.value;
            updateValue((thisComponent) => {
                thisComponent.name = newValue;
            });
        }}/>
    </HorizontalLabel>;
}

function HeightProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Height'} width={'50%'}>
        <notifiable.input style={{width: '100%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
            return focusedComponent.get()?.style.height ?? ''
        }} onChange={(e) => {
            let newValue: string | number = e.target.value;
            if (typeof newValue === 'string' && !newValue.endsWith('%')) {
                const number = parseInt(e.target.value);
                if (!isNaN(number)) {
                    newValue = number;
                }
            }
            updateValue((thisComponent) => {
                thisComponent.style.height = newValue as (number | `${number}%` | undefined);
            });
        }}/>
    </HorizontalLabel>;
}

function MarginProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
        <div style={{fontStyle: 'italic', position: 'absolute', top: 5}}>Margin</div>
        <div style={{display: 'flex', justifyContent: 'center', padding: 5}}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.marginTop ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.marginTop = newValue;
                                          });
                                      }}
                    />
                </div>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.marginLeft ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.marginLeft = newValue;
                                          });
                                      }}
                    />
                    <div style={{
                        flexGrow: 1,
                        backgroundColor: '#CCC',
                        margin: 5,
                        height: 50,
                        width: 50,
                        borderRadius: 5
                    }}></div>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.marginRight ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.marginRight = newValue;
                                          });
                                      }}
                    />
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <notifiable.input
                        style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
                        return focusedComponent.get()?.style.marginBottom ?? 0
                    }}
                        onChange={(e) => {
                            let newValue = parseInt(e.target.value);
                            if (isNaN(newValue)) {
                                newValue = 0
                            }
                            updateValue((thisComponent) => {
                                thisComponent.style.marginBottom = newValue;
                            });
                        }}/>
                </div>
            </div>
        </div>
    </div>;
}

function PaddingProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
        <div style={{fontStyle: 'italic', position: 'absolute', top: 0, left: 5}}>Padding</div>
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: 5,
            backgroundColor: '#CCC',
            borderRadius: 5
        }}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <notifiable.input
                        style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
                        return focusedComponent.get()?.style.paddingTop ?? 0
                    }}
                        onChange={(e) => {
                            let newValue = parseInt(e.target.value);
                            if (isNaN(newValue)) {
                                newValue = 0
                            }
                            updateValue((thisComponent) => {
                                thisComponent.style.paddingTop = newValue;
                            });
                        }}/>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.paddingLeft ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.paddingLeft = newValue;
                                          });
                                      }}/>
                    <div style={{flexGrow: 1, margin: 5, height: 50, width: 50, borderRadius: 5}}></div>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.paddingRight ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.paddingRight = newValue;
                                          });
                                      }}/>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <notifiable.input
                        style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
                        return focusedComponent.get()?.style.paddingBottom ?? 0
                    }}
                        onChange={(e) => {
                            let newValue = parseInt(e.target.value);
                            if (isNaN(newValue)) {
                                newValue = 0
                            }
                            updateValue((thisComponent) => {
                                thisComponent.style.paddingBottom = newValue;
                            });
                        }}/>
                </div>
            </div>
        </div>
    </div>;
}

function DirectionProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <HorizontalLabel label={'Direction'}>
        <notifiable.select style={{padding: 5, borderRadius: 3, border: BORDER, width: '100%'}}
                           value={() => {
                               return focusedComponent.get()?.componentType ?? 'Vertical'
                           }}
                           onChange={(e) => {
                               const newValue = e.target.value;
                               updateValue((thisComponent) => {
                                   thisComponent.componentType = newValue as ('Horizontal' | 'Vertical');
                               });
                           }}
        >
            <option value={'Horizontal'}>Horizontal</option>
            <option value={'Vertical'}>Vertical</option>
        </notifiable.select>
    </HorizontalLabel>;
}

export function ComponentProperties() {
    const {components, focusedComponent} = useContext(ComponentContext)!;

    function updateValue(callback: (thisComponent: Component) => void) {
        const componentId = focusedComponent.get()?.id;
        const comps = [...components.get()];
        const newFocusedComponent = {...comps.find(i => i.id === componentId)} as Component;
        callback(newFocusedComponent);
        focusedComponent.set(newFocusedComponent);
        components.set([...components.get().filter(i => i.id !== componentId), newFocusedComponent]);
    }

    return <div style={{display: 'flex', flexDirection: 'column', padding: 10, gap: 10}}>
        <notifiable.div>{() => focusedComponent.get()?.id.slice(-5)}</notifiable.div>
        <Visible when={() => {
            return isContainer(focusedComponent.get()?.componentType)
        }}>
            <DirectionProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
        </Visible>
        <Visible when={() => {
            return isLabelComponent(focusedComponent.get())
        }}>
            <LabelProperty focusedComponent={focusedComponent as unknown as Signal.State<LabelComponent>}
                           updateValue={updateValue as unknown as (callback:(thisComponent:LabelComponent) => void) => void}/>
        </Visible>
        <Visible when={() => {
            return isInputComponent(focusedComponent.get())
        }}>
            <NameProperty focusedComponent={focusedComponent as unknown as Signal.State<InputComponent>}
                           updateValue={updateValue as unknown as (callback:(thisComponent:InputComponent) => void) => void}/>
        </Visible>
        <Visible when={() => {
            return isInputComponent(focusedComponent.get())
        }}>
            <ValueProperty focusedComponent={focusedComponent as unknown as Signal.State<InputComponent>}
                           updateValue={updateValue  as unknown as (callback:(thisComponent:InputComponent) => void) => void}/>
        </Visible>
        <div style={{display: 'flex'}}>
            <WidthProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
            <HeightProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
        </div>
        <MarginProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
        <PaddingProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
    </div>
}

function HorizontalLabel(props: PropsWithChildren<{ label: string, width?: CSSProperties['width'] }>) {
    return <div style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', width: props.width}}>
        <div style={{fontStyle: 'italic', width: 50, textAlign: 'right', flexShrink: 0}}>{props.label}</div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            {props.children}
        </div>
    </div>
}
