import {CSSProperties, useContext, useEffect} from "react";
import {AnySignal, effect, notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";

import {guid} from "../utils/guid.ts";
import {AppDesignerContext} from "./AppDesignerContext.ts";
import {LayoutBuilderProps} from "./LayoutBuilderProps.ts";
import {DraggableContainer} from "./DraggableContainer.tsx";
import {sortSignal} from "./sortSignal.ts";
import {ZodType} from "zod";
import {LeftPanel} from "./left-panel/LeftPanel.tsx";
import {RightPanel} from "./right-panel/RightPanel.tsx";
import ButtonGroup from "./button/ButtonGroup.tsx";
import {ToolBar} from "./ToolBar.tsx";


export type Variable = {
    type: 'state' | 'computed' | 'effect',
    id: string,
    name: string,
    functionCode: string,
    schemaCode: string,
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


function ToggleViewToolbar() {
    const {uiDisplayModeSignal} = useContext(AppDesignerContext);
    return <div style={{display: 'flex', justifyContent: 'center', padding: 10,background:'rgba(0,0,0,0.2)'}}>
        <ButtonGroup buttons={{
            'Preview' : {
                onClick : () => uiDisplayModeSignal.set('view')
            },
            'Design' : {
                onClick : () => uiDisplayModeSignal.set('design')
            }
        }} defaultButton={'Design'} />
    </div>
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
        const destructorCallbacks: Array<() => void> = [];
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
            <div style={{flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column',backgroundColor:'rgba(0,0,0,0.2)'}}>
                <ToggleViewToolbar/>
                <div style={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding:10
                }}>
                    <notifiable.div style={{flexGrow: 1,borderRadius:10,overflow:'auto'}} >
                        {renderedElements}
                    </notifiable.div>
                </div>
                <ToolBar />
            </div>
            <RightPanel/>
        </div>

    </AppDesignerContext.Provider>
}


