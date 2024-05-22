import {ChangeEvent, CSSProperties, DragEvent, MouseEvent, useContext, useEffect} from "react";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {guid, isGuid} from "../utils/guid.ts";
import {ComputableProps} from "../../../../src/components.ts";
import {MdKeyboardArrowRight, MdOutlineBrokenImage} from "react-icons/md";
import {Signal} from "signal-polyfill";
import {Component, InputComponent, LabelComponent} from "./Component.ts";
import {ComponentContext} from "./ComponentContext.ts";
import {ComponentConfig, isContainer, isInputComponent, isLabelComponent} from "./ComponentLibrary.tsx";

const mouseOverComponentId = new Signal.State('');

function isComponentOneParentOfComponentTwo(props: {
    componentOne: Component,
    componentTwo: Component,
    components: Component[]
}) {
    const {componentOne, componentTwo, components} = props;
    if (componentTwo.parent) {
        if (componentTwo.parent === componentOne.id) {
            return true;
        }
        const componentTwoParent = components.find(i => i.id === componentTwo.parent)!;
        return isComponentOneParentOfComponentTwo({componentOne, componentTwo: componentTwoParent, components});
    }
    return false
}

export function ComponentRenderer(props: { comp: Component, renderAsTree?: boolean }) {

    const {components: componentsSignal, focusedComponent} = useContext(ComponentContext)!;
    const componentSignal = useSignal(props.comp);
    const renderAsTreeSignal = useSignal(props.renderAsTree);
    const displayChildrenSignal = useSignal(true);

    useEffect(() => componentSignal.set(props.comp), [componentSignal, props.comp]);
    useEffect(() => renderAsTreeSignal.set(props.renderAsTree), [props.renderAsTree, renderAsTreeSignal]);

    const isDraggedOverSignal = useSignal(false);
    const elements = useComputed(() => {
        const component = componentSignal.get();
        const layoutTreeValue = componentsSignal.get();
        const renderAsTree = renderAsTreeSignal.get();
        return component.children.map(child => {
            return <ComponentRenderer comp={layoutTreeValue.find(t => t.id === child)!} key={child}
                                      renderAsTree={renderAsTree}/>
        })
    });

    function updateValue(callback: (thisComponent: InputComponent) => void) {
        const componentId = componentSignal.get()?.id;
        const comps = [...componentsSignal.get()];
        const newFocusedComponent = {...comps.find(i => i.id === componentId)} as Component;
        if (isInputComponent(newFocusedComponent)) {
            callback(newFocusedComponent);
        }
        componentSignal.set(newFocusedComponent);
        componentsSignal.set([...componentsSignal.get().filter(i => i.id !== componentId), newFocusedComponent]);
    }

    function onDrop(componentTypeOrElementId: string) {
        if (isGuid(componentTypeOrElementId)) {
            const components = [...componentsSignal.get()];
            const self = componentSignal.get();
            // you cant drop to your children this will be madness you will loose the chain
            // we need to check does current component is actually parent of this if yes then reject it

            const droppedInComponent = components.find(i => i.id === componentTypeOrElementId)!;
            const thisComponent = components.find(layout => layout.id === self.id) ?? {id: '', children: []};
            if (isComponentOneParentOfComponentTwo({
                componentOne: droppedInComponent,
                componentTwo: thisComponent as Component,
                components
            })) {
                return;
            }

            const originalDroppedInParentComponent = components.find(i => i.id === droppedInComponent.parent);
            if (!originalDroppedInParentComponent) {
                return;
            }

            originalDroppedInParentComponent.children = originalDroppedInParentComponent.children.filter(i => i !== componentTypeOrElementId);
            droppedInComponent.parent = thisComponent.id;
            thisComponent.children = [...thisComponent.children, componentTypeOrElementId];

            componentsSignal.set(components);
        } else {
            const containerId = props.comp.id;
            const childId = guid();
            let newComponent: Component = {
                id: childId,
                parent: containerId,
                children: [],
                componentType: componentTypeOrElementId,
                style: {}
            }
            if (componentTypeOrElementId === 'Input') {
                newComponent = {
                    ...newComponent,
                    label: 'Label',
                    value: '',
                    isRequired: false,
                    errorMessage: '',
                    name: 'Name'
                } as InputComponent
            }
            if (componentTypeOrElementId === 'Button') {
                newComponent = {
                    ...newComponent,
                    label: 'Button'
                } as LabelComponent
            }

            componentsSignal.set([...componentsSignal.get().map(l => {
                if (l.id === containerId) {
                    l.children.push(childId)
                }
                return l;
            }), newComponent])
        }
    }

    const dragAndDropProps: ComputableProps<{
        draggable: boolean,
        onMouseOver: (e: unknown) => void,
        onDragOver: (e: unknown) => void,
        onDragLeave: (e: unknown) => void,
        onDrop: (e: unknown) => void,
        onDragStart: (e: unknown) => void,
        onClick: (e: unknown) => void,
    }> = {
        draggable: true,
        onMouseOver: (e) => {
            if (!isMouseEvent(e)) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            const {id} = componentSignal.get();
            mouseOverComponentId.set(id);
        },
        onDragOver: (e) => {
            if (!isMouseEvent(e)) {
                return;
            }
            e.stopPropagation();
            const {componentType} = componentSignal.get();

            if (isContainer(componentType)) {
                e.preventDefault();
            }
            isDraggedOverSignal.set(true);
        },
        onDragLeave: (e) => {
            if (!isMouseEvent(e)) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            isDraggedOverSignal.set(false);
        },
        onDrop: (e) => {
            if (!isDragEvent(e)) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            const {componentType} = componentSignal.get();
            if (componentType === 'Input') {
                return;
            }
            const id = e.dataTransfer.getData('text/plain');
            onDrop(id);
            isDraggedOverSignal.set(false);

        },
        onDragStart: (e) => {
            if (!isDragEvent(e)) {
                return;
            }
            e.stopPropagation();
            e.dataTransfer.setData('text/plain', componentSignal.get().id);
        },
        onClick: (e) => {
            if (!isMouseEvent(e)) {
                return;
            }
            e.stopPropagation()
            focusedComponent.set(componentSignal.get());
        }
    }

    const inputProps = {
        value: (): string => {
            const component = componentSignal.get();
            if (!isInputComponent(component)) {
                return '';
            }
            return component.value ? component.value.toString() : '';
        },
        onChange: (e: ChangeEvent) => {
            updateValue((component) => {
                component.value = (e.currentTarget as HTMLInputElement).value
            })
        },
        name: (): string => {
            const component = componentSignal.get();
            if (!isInputComponent(component)) {
                return '';
            }
            return component.name;
        },
    }
    const styleProps: ComputableProps<{ style: CSSProperties }> = {

        style: () => {
            const renderAsTree = renderAsTreeSignal.get();
            const component = componentSignal.get();
            const {style, componentType} = component;
            const isDraggedOver = isDraggedOverSignal.get();
            const isMouseOver = mouseOverComponentId.get() === componentSignal.get().id;
            const isSelected = focusedComponent.get()?.id === componentSignal.get().id;

            if (renderAsTree) {
                return {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: isDraggedOver ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0)',
                    flexGrow: 1,
                    border: isMouseOver ? `1px dashed ${isSelected ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'}` : `1px dashed ${isSelected ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0)'}`
                }
            }
            const initialStyle = ComponentConfig[componentType].style;
            let result = {...initialStyle};
            result.background = isDraggedOver ? initialStyle.backgroundWhenDragOver : initialStyle.background;
            result.border = isMouseOver ? initialStyle.borderWhenHovered : isSelected ? initialStyle.borderWhenFocused : initialStyle.border;
            result = {...result, ...style};
            // we alter this because width and height to be maintained by container
            if (!isInputComponent(component)) {
                return result;
            }
            delete result.width;
            delete result.height;
            delete result.margin;
            delete result.marginLeft;
            delete result.marginTop;
            delete result.marginRight;
            delete result.marginBottom;
            return result;
        }
    } as const;
    if (renderAsTreeSignal.get()) {
        return <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <notifiable.div style={{display: 'flex', alignItems: 'center', width: 15}} onClick={() => {
                    displayChildrenSignal.set(!displayChildrenSignal.get())
                }}>{() => {

                    const displayChildren = displayChildrenSignal.get();
                    const elementsArray = elements.get();
                    const {componentType} = componentSignal.get();
                    const hasChildren = Array.isArray(elementsArray) && elementsArray.length > 0 && isContainer(componentType);
                    if (hasChildren) {
                        return <MdKeyboardArrowRight style={{
                            fontSize: 17,
                            transform: `rotate(${displayChildren ? '90' : '0'}deg)`,
                        }}/>
                    }
                    return <div></div>
                }}</notifiable.div>
                <notifiable.div {...styleProps} {...dragAndDropProps}>
                    <notifiable.div style={{
                        display: 'flex',
                        alignItems: 'center',
                        height: 17,
                        marginLeft: 0,
                        position: 'relative',
                        minHeight: 0
                    }}>{() => {
                        const Icon = ComponentConfig[componentSignal.get().componentType].icon ?? MdOutlineBrokenImage;
                        return <Icon style={{fontSize: 25, marginLeft: -3}}/>
                    }}</notifiable.div>
                    <notifiable.div>{() => {
                        const component = componentSignal.get();
                        if (!isInputComponent(component)) {
                            return ''
                        }
                        return component.name;
                    }}</notifiable.div>
                </notifiable.div>
            </div>

            <notifiable.div style={() => {
                const displayChildren = displayChildrenSignal.get();
                const {componentType} = componentSignal.get();
                return {
                    display: isContainer(componentType) && displayChildren ? 'flex' : 'none',
                    flexDirection: 'column',
                    paddingLeft: 10
                };
            }}>
                {elements}
            </notifiable.div>
        </div>
    }
    const component = componentSignal.get();
    const {componentType} = component;
    if (isContainer(componentType)) {
        return <notifiable.div {...styleProps} {...dragAndDropProps}>
            {elements}
        </notifiable.div>
    }
    if (componentType === 'Input' && isInputComponent(component)) {

        return <notifiable.label style={(): CSSProperties => {
            const component = componentSignal.get();
            const result: CSSProperties = {
                display: 'flex',
                flexDirection: 'column'
            };
            if (!isInputComponent(component)) {
                return result;
            }
            result.width = component.style.width;
            result.height = component.style.height;
            result.margin = component.style.margin;
            result.marginLeft = component.style.marginLeft;
            result.marginTop = component.style.marginTop;
            result.marginRight = component.style.marginRight;
            result.marginBottom = component.style.marginBottom;
            return result;
        }} {...dragAndDropProps}>
            <notifiable.div>{() => {
                const component = componentSignal.get();
                if (!isLabelComponent(component)) {
                    return '';
                }
                return component.label
            }}</notifiable.div>
            <notifiable.input {...inputProps} {...styleProps} autoComplete={'off'}/>
            <notifiable.div>{() => {
                const component = componentSignal.get();
                if (!isInputComponent(component)) {
                    return '';
                }
                return component.errorMessage
            }}</notifiable.div>
        </notifiable.label>
    }
    if (componentType === 'Button' && isLabelComponent(component)) {
        return <notifiable.button {...styleProps} {...dragAndDropProps}>
            {() => {
                const component = componentSignal.get();
                if (!isLabelComponent(component)) {
                    return ''
                }
                return component.label
            }}
        </notifiable.button>
    }
    throw new Error('Unable to get element type')
}

function isMouseEvent(e: unknown): e is MouseEvent {
    return e !== undefined && e !== null && typeof e === 'object' && 'target' in e;
}

function isDragEvent(e: unknown): e is DragEvent {
    return e !== undefined && e !== null && typeof e === 'object' && 'dataTransfer' in e;
}