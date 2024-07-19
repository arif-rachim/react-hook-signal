import {CSSProperties, ReactNode, useContext, useEffect} from "react";
import {AnySignal, effect, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {MdDesignServices, MdHorizontalDistribute, MdPreview, MdVerticalDistribute} from "react-icons/md";

import {guid} from "../utils/guid.ts";
import {useShowModal} from "../modal/useShowModal.ts";
import {IconType} from "react-icons";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import {DraggableContainer} from "./DraggableContainer.tsx";
import {LabelContainer} from "./LabelContainer.tsx";
import {NumericalPercentagePropertyEditor} from "./property-editor/NumericalPercentagePropertyEditor.tsx";
import {Button} from "./Button.tsx";
import {VariablesPanel} from "./variable-editor/VariablesPanel.tsx";
import {ComponentPropertyEditor} from "./property-editor/ComponentPropertyEditor.tsx";
import {ButtonWithIcon} from "./ButtonWithIcon.tsx";
import {sortSignal} from "./sortSignal.ts";
import {useUpdateSelectedDragContainer} from "./useUpdateSelectedDragContainer.ts";
import {ZodFunction, ZodType, ZodTypeAny} from "zod";
import {Icon} from "./Icon.ts";


export type Variable = {
    type: 'state' | 'computed' | 'effect',
    id: string,
    name: string,
    functionCode: string,
    schemaCode:string,
    dependency?: Array<string> // this is only for computed and effect
}

export type VariableInstance = {
    id: string,
    instance: AnySignal<unknown>
}
export type ContainerPropertyType = { formula: string, type: ZodType, dependencies: Array<string> }

export type Container = {
    id: string,
    children: string[],
    parent: string
    type: 'horizontal' | 'vertical' | string,
    width: CSSProperties['width'],
    height: CSSProperties['height'],
    minWidth: CSSProperties['minWidth'],
    minHeight: CSSProperties['minHeight'],

    gap: CSSProperties['gap'],

    paddingTop: CSSProperties['paddingTop'],
    paddingRight: CSSProperties['paddingRight'],
    paddingBottom: CSSProperties['paddingBottom'],
    paddingLeft: CSSProperties['paddingLeft'],

    marginTop: CSSProperties['marginTop'],
    marginRight: CSSProperties['marginRight'],
    marginBottom: CSSProperties['marginBottom'],
    marginLeft: CSSProperties['marginLeft'],
    properties: Record<string, ContainerPropertyType>
}

function RightPanel() {
    const context = useContext(AppDesignerContext)
    const {
        selectedDragContainerIdSignal,
        allContainersSignal,
        elements
    } = context;
    const showModal = useShowModal();
    const update = useUpdateSelectedDragContainer();
    const propertyEditors = useComputed(() => {
        const selectedDragContainerId = selectedDragContainerIdSignal.get();
        const selectedDragContainer = allContainersSignal.get().find(i => i.id === selectedDragContainerId);
        const elementName = selectedDragContainer?.type;
        const result: Array<ReactNode> = [];
        result.push(<div style={{display: 'flex', flexDirection: 'row', gap: 10}} key={'height-width'}>
            <NumericalPercentagePropertyEditor property={'height'} label={'Height'} key={'height-editor'}
                                               style={{width: '50%'}} styleLabel={{width: 30}}/>
            <NumericalPercentagePropertyEditor property={'width'} label={'Width'} key={'width-editor'}
                                               style={{width: '50%'}} styleLabel={{width: 30}}/>
        </div>);
        result.push(<LabelContainer label={'Padding'} style={{marginTop: 10}} styleLabel={{width: 54, flexShrink: 0}}
                                    key={'padding-editor'}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <NumericalPercentagePropertyEditor property={'paddingTop'} label={'pT'} key={'padding-top'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                </div>
                <div style={{display: 'flex'}}>
                    <NumericalPercentagePropertyEditor property={'paddingLeft'} label={'pL'} key={'padding-left'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                    <div style={{flexGrow: 1}}></div>
                    <NumericalPercentagePropertyEditor property={'paddingRight'} label={'pR'} key={'padding-right'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <NumericalPercentagePropertyEditor property={'paddingBottom'} label={'pB'}
                                                       key={'padding-bottom'} style={{width: '33.33%'}}
                                                       styleLabel={{display: 'none'}}/>
                </div>
            </div>
        </LabelContainer>)
        result.push(<LabelContainer label={'Margin'} style={{marginTop: 10}} styleLabel={{width: 54, flexShrink: 0}}
                                    key={'margin-editor'}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <NumericalPercentagePropertyEditor property={'marginTop'} label={'mT'} key={'margin-top'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                </div>
                <div style={{display: 'flex'}}>
                    <NumericalPercentagePropertyEditor property={'marginLeft'} label={'mL'} key={'margin-left'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                    <div style={{flexGrow: 1}}></div>
                    <NumericalPercentagePropertyEditor property={'marginRight'} label={'mR'} key={'margin-right'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <NumericalPercentagePropertyEditor property={'marginBottom'} label={'mB'}
                                                       key={'margin-bottom'} style={{width: '33.33%'}}
                                                       styleLabel={{display: 'none'}}/>
                </div>
            </div>
        </LabelContainer>)

        if (elementName && elementName in elements) {
            const element = elements[elementName];
            const props = element.property;
            let property:Record<string, unknown> = {};
            if(isShapeable(props)) {
                property = props.shape;
            }
            result.push(<div key={'prop-editor'}
                             style={{display: 'flex', flexDirection: 'column', gap: 5, marginTop: 5}}>
                {Object.keys(property).map(propertyName => {
                    const type = property[propertyName] as ZodTypeAny;
                    const isZodFunction = type instanceof ZodFunction;
                    return <LabelContainer key={propertyName} label={propertyName}
                                           style={{flexDirection: 'row', alignItems: 'center'}}
                                           styleLabel={{width: 65, fontSize: 13}}>
                        <Button style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22
                        }} onClick={async () => {
                            const result = await showModal<ContainerPropertyType>(closePanel => {
                                return <AppDesignerContext.Provider value={context}>
                                    <ComponentPropertyEditor closePanel={closePanel} name={propertyName}
                                                             type={type}/>
                                </AppDesignerContext.Provider>
                            });
                            if(result) {
                                update(selectedContainer => {
                                    selectedContainer.properties[propertyName] = result
                                })
                            }
                        }}>
                            {isZodFunction && <Icon.Effect/>}
                            {!isZodFunction && <Icon.Computed/>}
                        </Button>
                    </LabelContainer>
                })}
            </div>);
        }
        return result
    })
    return <notifiable.div
        style={{
            width: 200,
            padding: 5,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderLeft: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
        }}>
        {propertyEditors}
    </notifiable.div>;
}

function LeftPanel() {
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: 200,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRight: '1px solid rgba(0,0,0,0.1)'
    }}>
        <ElementsPanel/>
        <VariablesPanel/>
    </div>
}
function ElementsPanel() {
    const {elements} = useContext(AppDesignerContext);
    return <div
        style={{
            padding: 10,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start'
        }}>
        <DraggableItem icon={MdVerticalDistribute} draggableDataType={'vertical'}/>
        <DraggableItem icon={MdHorizontalDistribute} draggableDataType={'horizontal'}/>
        {
            Object.keys(elements).map((key) => {
                const Icon = elements[key].icon;
                return <DraggableItem icon={Icon} draggableDataType={key} key={key}/>
            })
        }
    </div>
}

function ToggleViewToolbar() {
    const {uiDisplayModeSignal} = useContext(AppDesignerContext);
    return <div style={{display: 'flex', justifyContent: 'center', gap: 10, padding: 10}}>
        <ButtonWithIcon icon={MdPreview} onClick={() => uiDisplayModeSignal.set('view')}/>
        <ButtonWithIcon icon={MdDesignServices} onClick={() => uiDisplayModeSignal.set('design')}/>
    </div>;
}

export default function AppDesigner(props: LayoutBuilderProps) {
    const activeDropZoneIdSignal = useSignal('');
    const selectedDragContainerIdSignal = useSignal('');
    const hoveredDragContainerIdSignal = useSignal('');
    const uiDisplayModeSignal = useSignal<'design' | 'view'>('design');
    const allVariablesSignal = useSignal<Array<Variable>>([]);
    const allVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([])
    const allContainersSignal = useSignal<Array<Container>>([{
        id: guid(),
        type: 'vertical',
        gap: 0,
        children: [],
        parent: '',
        height: '',
        width: '',
        minWidth: '100px',
        minHeight: '100px',

        marginTop: '',
        marginRight: '',
        marginBottom: '',
        marginLeft: '',

        paddingTop: '',
        paddingRight: '',
        paddingBottom: '',
        paddingLeft: '',
        properties: {}

    }]);
    const {value, onChange} = props;
    useEffect(() => {
        if (value && value.containers && value.containers.length > 0) {
            allContainersSignal.set(value.containers);
        }
        if (value && value.variables && value.variables.length > 0) {
            allVariablesSignal.set(value.variables.sort(sortSignal));
        }
    }, [allContainersSignal, allVariablesSignal, value]);

    useSignalEffect(() => {
        onChange({
            containers: allContainersSignal.get(),
            variables: allVariablesSignal.get()
        });
    })

    const renderedElements = useComputed(() => {
        const container = allContainersSignal.get().find(item => item.parent === '');
        if (container) {
            return <DraggableContainer allContainersSignal={allContainersSignal} container={container}/>
        }
        return <></>
    });

    useSignalEffect(() => {
        const variables = allVariablesSignal.get();
        const variablesInstance: Array<VariableInstance> = [];
        const destructorCallbacks:Array<() => void> = [];
        for (const v of variables) {
            if (v.type === 'state') {
                try {
                    const params = ['module', v.functionCode];
                    const init = new Function(...params);
                    const module = {exports: {}};
                    init.call(null, module);
                    const state = new Signal.State(module.exports);
                    variablesInstance.push({id: v.id, instance: state});
                } catch (err) {
                    console.error(err);
                }
            }
            if (v.type === 'computed') {
                try {
                    const dependencies = (v.dependency ?? []).map(d => {
                        const name = allVariablesSignal.get().find(i => i.id === d)?.name;
                        const instance = variablesInstance.find(i => i.id === d)?.instance;
                        if (name === undefined || instance === undefined) {
                            return false;
                        }
                        return {name, instance}
                    }).filter(f => f !== false) as Array<{ name: string, instance: AnySignal<unknown> }>;
                    const params = ['module', ...dependencies.map(d => d.name), v.functionCode];
                    const init = new Function(...params);

                    const computed = new Signal.Computed(() => {
                        for (const dep of dependencies) {
                            dep.instance.get();
                        }
                        const module: { exports: unknown } = {exports: undefined};
                        const instances = [module, ...dependencies.map(d => d.instance)]
                        init.call(null, ...instances);
                        return module.exports;
                    });
                    variablesInstance.push({id: v.id, instance: computed});
                } catch (err) {
                    console.error(err);
                }
            }
            if (v.type === 'effect') {
                try {
                    const dependencies = (v.dependency ?? []).map(d => {
                        const name = allVariablesSignal.get().find(i => i.id === d)?.name;
                        const instance = variablesInstance.find(i => i.id === d)?.instance;
                        if (name === undefined || instance === undefined) {
                            return false;
                        }
                        return {name, instance}
                    }).filter(f => f !== false) as Array<{ name: string, instance: AnySignal<unknown> }>;
                    const params = [...dependencies.map(d => d.name), v.functionCode];
                    const init = new Function(...params);
                    const destructor = effect(() => {
                        dependencies.forEach(d => d.instance.get());
                        const instances = [...dependencies.map(d => d.instance)]
                        init.call(null, ...instances);
                    });
                    destructorCallbacks.push(destructor);
                } catch (err) {
                    console.error(err);
                }
            }
        }
        allVariablesSignalInstance.set(variablesInstance);
        return () => {
            destructorCallbacks.forEach(d => d());
        }
    });

    return <AppDesignerContext.Provider
        value={{
            hoveredDragContainerIdSignal: hoveredDragContainerIdSignal,
            selectedDragContainerIdSignal: selectedDragContainerIdSignal,
            activeDropZoneIdSignal: activeDropZoneIdSignal,
            uiDisplayModeSignal: uiDisplayModeSignal,
            allContainersSignal: allContainersSignal,
            allVariablesSignal: allVariablesSignal,
            allVariablesSignalInstance: allVariablesSignalInstance,
            elements: props.elements
        }}>

        <div style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
            <LeftPanel/>
            <div style={{flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
                <ToggleViewToolbar/>
                <notifiable.div style={{flexGrow: 1}}>
                    {renderedElements}
                </notifiable.div>
            </div>
            <RightPanel/>
        </div>

    </AppDesignerContext.Provider>
}


function DraggableItem(props: { draggableDataType: string, icon: IconType }) {
    const Icon = props.icon;
    const {activeDropZoneIdSignal} = useContext(AppDesignerContext);
    return <ButtonWithIcon onDragStart={(e) => e.dataTransfer.setData('text/plain', props.draggableDataType)}
                           draggable={true} onDragEnd={() => activeDropZoneIdSignal.set('')} icon={Icon}/>

}

function isShapeable(value:unknown):value is {shape:Record<string,unknown>}{
    return value !== null && value !== undefined && typeof value === 'object' && 'shape' in value
}
