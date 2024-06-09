import {
    createContext,
    CSSProperties,
    DragEvent,
    HTMLAttributes,
    MouseEvent,
    useContext,
    useEffect
} from "react";
import {AnySignal, notifiable, useComputed, useSignal} from "react-hook-signal";
import {guid, isGuid} from "../utils/guid.ts";
import {ComputableProps} from "../../../../src/components.ts";
import {MdKeyboardArrowRight, MdOutlineBrokenImage} from "react-icons/md";
import {Signal} from "signal-polyfill";
import {AnySignalType, Component, InputComponent, LabelComponent, SignalStateContextData} from "./Component.ts";
import {ComponentContext} from "./ComponentContext.ts";
import {ComponentConfig} from "./ComponentLibrary.tsx";
import {isInputComponent} from "../utils/isInputComponent.ts";
import {isContainer} from "../utils/isContainer.ts";
import {isLabelComponent} from "../utils/isLabelComponent.ts";
import {colors} from "../utils/colors.ts";
import {isEmpty} from "../utils/isEmpty.ts";
import {convertToVarName} from "../utils/convertToVarName.ts";
import {convertToSetterName} from "../utils/convertToSetterName.ts";
import {isStateSignal} from "../utils/isStateSignal.ts";

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

function populateEvents(componentSignal: AnySignal<Component|undefined>, signalsState: AnySignal<SignalStateContextData>,result:HTMLAttributes<HTMLElement>) {
    const {onClick,onChange} = result;
    result.onClick = (event) => {
        if(onClick){
            onClick(event);
        }
        const propsValues:Array<unknown> = [];
        const propsName:string[] = [];
        const component = componentSignal.get();
        if(isEmpty(component)|| isEmpty(component?.events) || isEmpty(component?.events.onClick) || isEmpty(component?.events.onClick?.formula)){
            return;
        }
        for (const key of component!.events.onClick!.signalDependencies) {
            const signalState = signalsState.get().find(s => s.type.id === key);
            if (signalState === undefined) {
                continue;
            }
            propsName.push(convertToVarName(signalState.type.name));
            propsValues.push(signalState.signal.get());
        }
        for (const key of component!.events.onClick!.mutableSignals) {
            const signalState = signalsState.get().find(s => s.type.id === key);
            if (signalState === undefined) {
                continue;
            }
            propsName.push(convertToSetterName(signalState.type.name));
            propsValues.push((value:unknown) => {
                if(isStateSignal(signalState.signal)){
                    signalState.signal.set(value)
                }
            });
        }
        try {
            const fun = new Function(...propsName, component!.events.onClick?.formula ?? '');
            fun(...propsValues);
        } catch (err) {
            console.error(err);
        }

    }

    result.onChange = (event) => {
        if(onChange){
            onChange(event);
        }
        const propsValues:Array<unknown> = [];
        const propsName:string[] = [];
        const component = componentSignal.get();
        if(isInputComponent(component)){
            for (const key of component.events.onChange!.signalDependencies) {
                const signalState = signalsState.get().find(s => s.type.id === key);
                if (signalState === undefined) {
                    continue;
                }
                propsName.push(convertToVarName(signalState.type.name));
                propsValues.push(signalState.signal.get());
            }
            for (const key of component.events.onChange!.mutableSignals) {
                const signalState = signalsState.get().find(s => s.type.id === key);
                if (signalState === undefined) {
                    continue;
                }
                propsName.push(convertToSetterName(signalState.type.name));
                propsValues.push((value:unknown) => {
                    if(isStateSignal(signalState.signal)){
                        signalState.signal.set(value)
                    }
                });
            }

            if('value' in event.target){
                propsName.push('value');
                propsValues.push(event.target.value);
            }

            try {
                const fun = new Function(...propsName, component.events.onChange?.formula ?? '');
                fun(...propsValues);
            } catch (err) {
                console.error(err);
            }
        }
    }

    return result;
}


function computeErrorMessage(componentSignal: Signal.State<Component | undefined>, props: {
    comp: Component;
    renderAsTree?: boolean;
    signals: AnySignal<AnySignalType[]>;
    signalContext: AnySignal<SignalStateContextData>
}) {
    const component = componentSignal.get();
    const signalsState = props.signalContext.get()
    if (!isInputComponent(component)) {
        return '';
    }
    const propsName: Array<string> = [];
    const propsValues: Array<unknown> = [];
    for (const key of (component?.errorMessage?.signalDependencies ?? [])) {
        const signalState = signalsState.find(s => s.type.id === key);
        if (signalState === undefined) {
            continue;
        }
        propsName.push(convertToVarName(signalState.type.name));
        propsValues.push(signalState.signal.get());
    }
    try {
        const fun = new Function(...propsName, component?.errorMessage?.formula ?? '');
        return fun(...propsValues);
    } catch (err) {
        console.error(err);
    }
    return '';
}

export function ComponentRenderer(props: {
    comp: Component,
    renderAsTree?: boolean,
    signals: AnySignal<AnySignalType[]>,
    signalContext: AnySignal<SignalStateContextData>
}) {

    const {components: componentsSignal, focusedComponent} = useContext(ComponentContext)!;
    const componentSignal = useSignal<Component | undefined>(props.comp);
    const renderAsTreeSignal = useSignal(props.renderAsTree);
    const displayChildrenSignal = useSignal(true);

    useEffect(() => componentSignal.set(props.comp), [componentSignal, props.comp]);
    useEffect(() => renderAsTreeSignal.set(props.renderAsTree), [props.renderAsTree, renderAsTreeSignal]);

    const isDraggedOverSignal = useSignal(false);
    const elements = useComputed(() => {
        const component = componentSignal.get();
        const layoutTreeValue = componentsSignal.get();
        const renderAsTree = renderAsTreeSignal.get();
        if (component === null || component === undefined) {
            return [];
        }
        return component.children.map(child => {
            return <ComponentRenderer comp={layoutTreeValue.find(t => t.id === child)!} key={child}
                                      renderAsTree={renderAsTree} signals={props.signals}
                                      signalContext={props.signalContext}/>
        })
    });

    function onDrop(componentTypeOrElementId: string) {
        if (isGuid(componentTypeOrElementId)) {
            const components = [...componentsSignal.get()];
            const self = componentSignal.get();
            if (self === undefined) {
                return;
            }
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
        } else if (isComponentType(componentTypeOrElementId)) {
            const containerId = props.comp.id;
            const childId = guid();
            let newComponent: Component = {
                id: childId,
                parent: containerId,
                children: [],
                componentType: componentTypeOrElementId,
                style: {...ComponentConfig[componentTypeOrElementId].style},
                events: {}
            }
            if (componentTypeOrElementId === 'Input') {
                newComponent = {
                    ...newComponent,
                    label: 'Label',
                    isRequired: false,
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

    const dragAndDropProps: HTMLAttributes<HTMLElement> = {
        draggable: true,
        onMouseOver: (e) => {
            if (!isMouseEvent(e)) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            const component = componentSignal.get();
            if (component === undefined) {
                return;
            }
            const {id} = component;
            mouseOverComponentId.set(id);
        },
        onDragOver: (e) => {
            if (!isMouseEvent(e)) {
                return;
            }
            e.stopPropagation();
            const component = componentSignal.get();
            if (component === undefined) {
                return;
            }
            if (isContainer(component)) {
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

            const component = componentSignal.get();
            if (component === undefined) {
                return;
            }
            if (component.componentType === 'Input') {
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
            const component = componentSignal.get();
            if (component === undefined) {
                return;
            }
            e.dataTransfer.setData('text/plain', component.id);
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
            const signalsState = props.signalContext.get();
            if (!isInputComponent(component)) {
                return '';
            }
            const propsName:Array<string> = [];
            const propsValues:Array<unknown> = [];
            for (const key of (component?.value?.signalDependencies ?? [])) {
                const signalState = signalsState.find(s => s.type.id === key);
                if (signalState === undefined) {
                    continue;
                }
                propsName.push(convertToVarName(signalState.type.name));
                propsValues.push(signalState.signal.get());
            }
            try {
                const fun = new Function(...propsName, component?.value?.formula ?? '');
                return fun(...propsValues);
            } catch (err) {
                console.error(err);
            }
            return '';
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
            if (component === undefined) {
                return {};
            }
            const {style, componentType} = component;
            const isDraggedOver = isDraggedOverSignal.get();
            const isMouseOver = mouseOverComponentId.get() === component.id;
            const isSelected = focusedComponent.get()?.id === component.id;

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
            const {
                backgroundWhenDragOver,
                borderWhenFocused,
                borderWhenHovered
            } = ComponentConfig[componentType].dragAndDropStyle;
            const initialStyle = {...ComponentConfig[componentType].style};
            const result: CSSProperties = style === undefined ? initialStyle : {...style};
            result.background = isDraggedOver ? backgroundWhenDragOver : initialStyle.background;
            result.border = isMouseOver ? borderWhenHovered : isSelected ? borderWhenFocused : initialStyle.border;
            // we alter this because width and height to be maintained by container
            if (!isInputComponent(component)) {
                return result;
            }
            const {borderWhenError} = ComponentConfig.Input.errorStyle;
            if (!isEmpty(computeErrorMessage(componentSignal, props))) {
                result.border = borderWhenError;
            }

            /**
             * We remove this for input because we do not want the input to be modified from the element.
             */
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
    const component = componentSignal.get();
    const {componentType} = component ?? {componentType: undefined};
    if (componentType === undefined) {
        return <div></div>
    }
    if (renderAsTreeSignal.get()) {
        return <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                <notifiable.div style={{display: 'flex', alignItems: 'center', width: 15}} onClick={() => {
                    displayChildrenSignal.set(!displayChildrenSignal.get())
                }}>{() => {

                    const displayChildren = displayChildrenSignal.get();
                    const elementsArray = elements.get();
                    const component = componentSignal.get();
                    if (component === undefined) {
                        return <div></div>
                    }
                    const hasChildren = Array.isArray(elementsArray) && elementsArray.length > 0 && isContainer(component);
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
                        const component = componentSignal.get();
                        if (component === undefined) {
                            return <div></div>
                        }
                        const Icon = ComponentConfig[component.componentType].icon ?? MdOutlineBrokenImage;
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
                const component = componentSignal.get();
                if (component === undefined) {
                    return {}
                }
                return {
                    display: isContainer(component) && displayChildren ? 'flex' : 'none',
                    flexDirection: 'column',
                    paddingLeft: 10
                };
            }}>
                {elements}
            </notifiable.div>
        </div>
    }
    // const signalsState = props.signalContext.get();
    if (isContainer(component)) {
        populateEvents(componentSignal, props.signalContext,dragAndDropProps);
        return <SignalStateContext.Provider value={props.signalContext}>
            <notifiable.div {...styleProps} {...dragAndDropProps}>
                {elements}
            </notifiable.div>
        </SignalStateContext.Provider>
    }
    if (componentType === 'Input' && isInputComponent(component)) {
        const events:HTMLAttributes<HTMLElement> = {};
        populateEvents(componentSignal, props.signalContext,events);
        return <notifiable.label style={(): CSSProperties => {
            const component = componentSignal.get();
            if (component === undefined) {
                return {};
            }
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
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
                <notifiable.div style={{flexGrow: 1}}>{() => {
                    const component = componentSignal.get();
                    if (!isLabelComponent(component)) {
                        return '';
                    }
                    return component.label
                }}</notifiable.div>
                <notifiable.div style={{fontSize: 12, color: colors.red}}>{() => {
                    return computeErrorMessage(componentSignal, props);
                }}</notifiable.div>
            </div>
            <notifiable.input {...inputProps} {...styleProps} {...events} autoComplete={'off'}/>
        </notifiable.label>
    }
    if (componentType === 'Button' && isLabelComponent(component)) {
        populateEvents(componentSignal, props.signalContext,dragAndDropProps);
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
    throw new Error('Unable to get element valueType ' + component?.componentType)
}

function isMouseEvent(e: unknown): e is MouseEvent {
    return e !== undefined && e !== null && typeof e === 'object' && 'target' in e;
}

function isDragEvent(e: unknown): e is DragEvent {
    return e !== undefined && e !== null && typeof e === 'object' && 'dataTransfer' in e;
}

function isComponentType(value: unknown): value is  keyof typeof ComponentConfig {
    return typeof value === 'string' && Object.keys(ComponentConfig).indexOf(value) >= 0
}

const SignalStateContext = createContext<AnySignal<SignalStateContextData>|undefined>(undefined)