import {Notifiable, notifiable, useComputed, useSignal} from "react-hook-signal";
import {createContext, CSSProperties, HTMLProps, PropsWithChildren, useContext, useEffect} from "react";
import {Signal} from "signal-polyfill";
import {guid} from "./utils/guid.ts";
import {RiLayoutHorizontalLine, RiLayoutVerticalLine} from "react-icons/ri";
import {ComputableProps} from "../../../src/components.ts";
import {MdKeyboardArrowRight, MdOutlineBrokenImage} from "react-icons/md";

const ElementType = {
    Vertical: 'Vertical',
    Horizontal: 'Horizontal',
}
const ComponentIcon = {
    'column': RiLayoutHorizontalLine,
    'row': RiLayoutVerticalLine
}
const BORDER = '1px solid rgba(0,0,0,0.2)';

/**
 * Represents the main application comp.
 */
function App() {

    const components = useSignal<Component[]>([{
        style: {
            direction: 'column',
            height: '100%',
            overflow: 'auto'
        },
        id: 'root',
        parent: '',
        children: []
    }]);
    const focusedComponent = useSignal<Component | undefined>(undefined);
    const rightPanelWidth = useSignal<number | undefined>(undefined);
    const leftPanelWidth = useSignal<number | undefined>(undefined);

    function onMouseRightMove(e) {
        rightPanelWidth.set(window.innerWidth - e.clientX - 5);
    }

    function onMouseLeftMove(e) {
        leftPanelWidth.set(e.clientX)
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseRightMove);
        document.removeEventListener('mousemove', onMouseLeftMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    return <ComponentContext.Provider value={{components, focusedComponent}}>
        <div style={{display: 'flex', flexDirection: 'row', height: '100%', overflow: 'auto'}}>
            <notifiable.div style={() => {
                const widthValue = leftPanelWidth.get();

                return {
                    width: widthValue,
                    borderRight: '1px solid #CCC',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 10,
                    gap: 5
                }
            }}>
                <div
                    style={{
                        padding: 5,
                        border: '1px solid #CCC',
                        borderRadius: 5,
                        layout: 'row',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center'
                    }}
                    draggable={true}
                    onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', ElementType.Vertical);
                    }}
                >
                    <RiLayoutHorizontalLine style={{fontSize: 22}}/>
                    <div>Vertical</div>
                </div>
                <div
                    style={{
                        padding: 5,
                        border: '1px solid #CCC',
                        borderRadius: 5,
                        layout: 'row',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center'
                    }}
                    draggable={true}
                    onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', ElementType.Horizontal);
                    }}
                >
                    <RiLayoutVerticalLine style={{fontSize: 22}}/>
                    <div>Horizontal</div>
                </div>
                <Notifiable component={ComponentRenderer} comp={() => {
                    return components.get().find(i => i.id === 'root')!
                }} renderAsTree={true}/>
            </notifiable.div>
            <div style={{height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', width: 5, cursor: 'ew-resize'}}
                 onMouseDown={() => {
                     document.addEventListener('mousemove', onMouseLeftMove);
                     document.addEventListener('mouseup', onMouseUp);
                 }}></div>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
                <Notifiable component={ComponentRenderer} comp={() => {
                    return components.get().find(i => i.id === 'root')!
                }}/>
            </div>
            <div style={{height: '100%', backgroundColor: 'rgba(0,0,0,0.3)', width: 5, cursor: 'ew-resize'}}
                 onMouseDown={() => {
                     document.addEventListener('mousemove', onMouseRightMove);
                     document.addEventListener('mouseup', onMouseUp);
                 }}></div>
            <notifiable.div style={() => {
                const widthValue = rightPanelWidth.get();
                return {
                    width: widthValue ?? 250,
                    borderLeft: '1px solid #CCC',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }}>
                <ComponentProperties/>
            </notifiable.div>
        </div>
    </ComponentContext.Provider>
}


interface Component {
    style: {
        direction: 'row' | 'column',
        padding?: number,
        paddingLeft?: number,
        paddingTop?: number,
        paddingRight?: number,
        paddingBottom?: number,

        margin?: number,
        marginLeft?: number,
        marginTop?: number,
        marginRight?: number,
        marginBottom?: number,

        gap?: number,
        width?: number | `${number}%`,
        height?: number | `${number}%`,
        minWidth?: number,
        minHeight?: number,

        grow?: number,
        shrink?: number,
        overflow?: CSSProperties['overflow']
    },
    id: string,
    parent: string,
    children: string[]
}


const ComponentContext = createContext<{
    components: Signal.State<Component[]>,
    focusedComponent: Signal.State<Component | undefined>
} | undefined>(undefined);

function paddingIsEmpty(result: CSSProperties) {
    let paddingEmpty = true;
    for (const key of ['padding', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom']) {
        paddingEmpty = paddingEmpty && result[key] === undefined;
    }
    return paddingEmpty;
}

const mouseOverComponentId = new Signal.State('');

function ComponentRenderer(props: { comp: Component, renderAsTree?: boolean }) {

    const {components: componentsSignal, focusedComponent} = useContext(ComponentContext)!;
    const componentSignal = useSignal(props.comp);
    const renderAsTreeSignal = useSignal(props.renderAsTree);
    const displayChildrenSignal = useSignal(true);

    useEffect(() => componentSignal.set(props.comp), [props.comp]);
    useEffect(() => renderAsTreeSignal.set(props.renderAsTree), [props.renderAsTree]);

    const isDraggedOverSignal = useSignal(false);
    const elements = useComputed(() => {
        const children = componentSignal.get().children;
        const layoutTreeValue = componentsSignal.get();
        const renderAsTree = renderAsTreeSignal.get();
        return children.map(child => {
            return <ComponentRenderer comp={layoutTreeValue.find(t => t.id === child)!} key={child}
                                      renderAsTree={renderAsTree}/>
        })
    });

    function onDrop(elementTypeOrElementId: string) {
        if ([ElementType.Vertical, ElementType.Horizontal].indexOf(elementTypeOrElementId) >= 0) {
            const containerId = props.comp.id;
            const childId = guid();
            componentsSignal.set([...componentsSignal.get().map(l => {
                if (l.id === containerId) {
                    l.children.push(childId)
                }
                return l;
            }), {
                id: childId,
                parent: containerId,
                children: [],
                style: {
                    direction: elementTypeOrElementId === ElementType.Vertical ? 'column' : 'row'
                }
            }])
        } else {
            const components = [...componentsSignal.get()];
            const currentComponent = components.find(i => i.id === elementTypeOrElementId)!;
            const currentParentComponent = components.find(i => i.id === currentComponent.parent)!;
            // removing current comp from its current parent
            currentParentComponent.children = currentParentComponent.children.filter(i => i !== elementTypeOrElementId);
            // ok now we have the element comp lets move this guy to new position inside this container
            currentComponent.parent = componentSignal.get().id;
            const newParentComponent = components.find(layout => layout.id === currentComponent.parent);
            newParentComponent.children = [...newParentComponent.children, elementTypeOrElementId];
            componentsSignal.set(components);
        }
    }

    const divProps: ComputableProps<HTMLProps<HTMLDivElement>> = {
        draggable: true,
        onMouseOver: (e) => {
            e.preventDefault();
            e.stopPropagation();
            mouseOverComponentId.set(componentSignal.get().id);
        },
        onDragOver: (e) => {
            e.stopPropagation();
            e.preventDefault();
            isDraggedOverSignal.set(true);
        },
        onDragLeave: (e) => {
            e.stopPropagation();
            e.preventDefault();
            isDraggedOverSignal.set(false);
        },
        onDrop: (e) => {
            e.preventDefault();
            e.stopPropagation();
            const id = e.dataTransfer.getData('text/plain');
            onDrop(id);
            isDraggedOverSignal.set(false);
        },
        onDragStart: (e) => {
            e.stopPropagation();
            e.dataTransfer.setData('text/plain', componentSignal.get().id);
        },
        onClick: (e) => {
            e.stopPropagation()
            focusedComponent.set(componentSignal.get());
        },
        style: () => {
            const renderAsTree = renderAsTreeSignal.get();
            const style = componentSignal.get().style;
            const isDraggedOver = isDraggedOverSignal.get();
            const isMouseOver = mouseOverComponentId.get() === componentSignal.get().id;
            const isSelected = focusedComponent.get()?.id === componentSignal.get().id;

            if (renderAsTree) {
                return {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDraggedOver ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0)',
                    flexGrow: 1,
                    border: isMouseOver ? `1px dashed ${isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}` : `1px dashed ${isSelected ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0)'}`
                }
            }
            const result: CSSProperties = {
                display: 'flex',
                flexDirection: style.direction ?? 'column',
                backgroundColor: isDraggedOver ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)',
                gap: 10,
                padding: 10,
                border: isMouseOver ? `1px dashed ${isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}` : `1px dashed ${isSelected ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0)'}`
            };
            for (const key of Object.keys(style)) {
                result[key] = style[key]
            }

            return result;
        }
    }
    if (renderAsTreeSignal.get()) {
        return <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <notifiable.div style={{display: 'flex', alignItems: 'center', width: 15}} onClick={() => {
                    displayChildrenSignal.set(!displayChildrenSignal.get())
                }}>{() => {
                    const displayChildren = displayChildrenSignal.get();
                    const hasChildren = elements.get().length > 0;
                    if (hasChildren) {
                        return <MdKeyboardArrowRight style={{
                            fontSize: 17,
                            transform: `rotate(${displayChildren ? '90' : '0'}deg)`,
                        }}/>
                    }
                    return <div></div>
                }}</notifiable.div>
                <notifiable.div {...divProps}>
                    <notifiable.div style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: 17,
                        marginLeft: -5,
                        position: 'relative',
                        minHeight: 0
                    }}>{() => {
                        const Icon = ComponentIcon[componentSignal.get().style.direction] ?? MdOutlineBrokenImage;
                        return <Icon style={{fontSize: 25, position: 'absolute'}}/>
                    }}</notifiable.div>
                </notifiable.div>
            </div>

            <notifiable.div style={() => {
                const displayChildren = displayChildrenSignal.get()
                return {display: displayChildren ? 'flex' : 'none', flexDirection: 'column', paddingLeft: 10};
            }}>
                {elements}
            </notifiable.div>
        </div>
    }
    return <notifiable.div {...divProps}>
        {elements}
    </notifiable.div>
}

function ComponentProperties() {
    const {components, focusedComponent} = useContext(ComponentContext)!;

    function updateValue(callback: (thisComponent: Component) => void) {
        const componentId = focusedComponent.get()?.id;
        const comps = [...components.get()];
        const newFocusedComponent = {...comps.find(i => i.id === componentId)};
        callback(newFocusedComponent);
        focusedComponent.set(newFocusedComponent);
        components.set([...components.get().filter(i => i.id !== componentId), newFocusedComponent]);
    }

    return <div style={{display: 'flex', flexDirection: 'column', padding: 10, gap: 10}}>
        <notifiable.div>{() => focusedComponent.get()?.id.slice(-5)}</notifiable.div>
        <HorizontalLabel label={'Direction'}>
            <notifiable.select style={{padding: 5, borderRadius: 3, border: BORDER, width: '100%'}}
                               value={() => {
                                   return focusedComponent.get()?.style.direction ?? 'column'
                               }}
                               onChange={(e) => {
                                   let newValue = e.target.value;
                                   updateValue((thisComponent) => {
                                       thisComponent.style.direction = newValue;
                                   });
                               }}
            >
                <option value={'row'}>Horizontal</option>
                <option value={'column'}>Vertical</option>
            </notifiable.select>
        </HorizontalLabel>
        <div style={{display: 'flex'}}>
            <HorizontalLabel label={'Width'} width={'50%'}>
                <notifiable.input style={{width:'100%',padding: 5, borderRadius: 3, border: BORDER}} value={() => {
                    return focusedComponent.get()?.style.width ?? ''
                }} onChange={(e) => {
                    let newValue = e.target.value;
                    if (!newValue.endsWith('%')) {
                        const number = parseInt(e.target.value);
                        if (!isNaN(number)) {
                            newValue = number;
                        }
                    }
                    updateValue((thisComponent) => {
                        thisComponent.style.width = newValue;
                    });
                }}/>
            </HorizontalLabel>

            <HorizontalLabel label={'Height'} width={'50%'}>
                <notifiable.input style={{width:'100%',padding: 5, borderRadius: 3, border: BORDER}} value={() => {
                    return focusedComponent.get()?.style.height ?? ''
                }} onChange={(e) => {
                    let newValue = e.target.value;
                    if (!newValue.endsWith('%')) {
                        const number = parseInt(e.target.value);
                        if (!isNaN(number)) {
                            newValue = number;
                        }
                    }
                    updateValue((thisComponent) => {
                        thisComponent.style.height = newValue;
                    });
                }}/>
            </HorizontalLabel>
        </div>


        <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
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
        </div>

        <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
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
        </div>

    </div>
}

function HorizontalLabel(props: PropsWithChildren<{ label: string, width?: CSSProperties['width'] }>) {
    return <div style={{display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center', width: props.width}}>
        <div style={{fontStyle: 'italic', width: 50, textAlign: 'right',flexShrink:0}}>{props.label}</div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            {props.children}
        </div>
    </div>
}

export default App;
