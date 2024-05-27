import {useContext} from "react";
import {ComponentContext} from "./ComponentContext.ts";
import {BORDER, BORDER_NONE} from "./Border.ts";
import {colors} from "../utils/colors.ts";
import {MdAdd} from "react-icons/md";
import {useShowModal} from "../modal/useShowModal.ts";
import {StateDialogPanel} from "./signals/StateDialogPanel.tsx";
import {ComputedDialogPanel} from "./signals/ComputedDialogPanel.tsx";
import {EffectDialogPanel} from "./signals/EffectDialogPanel.tsx";
import {AnySignalType, Component, SignalComputed, SignalEffect, SignalState} from "./Component.ts";
import {createResponsiveList} from "stock-watch/src/responsive-list/createResponsiveList.tsx";
import {useComputed} from "react-hook-signal";
import {isEmpty} from "../utils/isEmpty.ts";

export default function ComponentSignals() {
    const {components, focusedComponent} = useContext(ComponentContext)!;
    const showModal = useShowModal()

    function update(callback: (components: Component) => void) {
        const componentId = focusedComponent.get()?.id;
        const comps = [...components.get()];
        if(isEmpty(componentId)){
            return;
        }
        const compToUpdate = comps.find(i => i.id === componentId);
        if(isEmpty(compToUpdate)){
            return;
        }
        const newFocusedComponent = {...compToUpdate} as Component;
        callback(newFocusedComponent);
        components.set([...components.get().filter(i => i.id !== componentId), newFocusedComponent]);
        focusedComponent.set(newFocusedComponent);
    }

    async function onAddState() {
        const component = focusedComponent.get();
        if (component === undefined) {
            return;
        }
        const state: SignalState = await showModal(closePanel => {
            return <StateDialogPanel closePanel={closePanel}/>
        });
        update(comp => {
            const idx = comp.signals.findIndex(i => i.id === state.id);
            if (idx >= 0) {
                comp.signals = [...comp.signals.splice(idx, 1, state)];
            } else {
                comp.signals = [...comp.signals, state];
            }
        });
    }

    async function onAddComputed() {
        const component = focusedComponent.get();
        if (component === undefined) {
            return;
        }
        const computed: SignalComputed = await showModal(closePanel => {
            return <ComputedDialogPanel closePanel={closePanel}/>
        });
        update(comp => {
            const idx = comp.signals.findIndex(i => i.id === computed.id);
            if (idx >= 0) {
                comp.signals = [...comp.signals.splice(idx, 1, computed)];
            } else {
                comp.signals = [...comp.signals, computed];
            }
        });
    }

    async function onAddEffect() {
        const component = focusedComponent.get();
        if (component === undefined) {
            return;
        }
        const effect: SignalEffect = await showModal(closePanel => {
            return <EffectDialogPanel closePanel={closePanel}/>
        });
        update(comp => {
            const idx = comp.signals.findIndex(i => i.id === effect.id);
            if (idx >= 0) {
                comp.signals = [...comp.signals.splice(idx, 1, effect)];
            } else {
                comp.signals = [...comp.signals, effect];
            }
        });
    }

    const signalList = useComputed(() => {
        let component = focusedComponent.get();
        const comps = components.get();
        if (component === undefined) {
            return [];
        }
        let result: Array<AnySignalType & { component: string }> = (component.signals ?? []).map(i => ({
            ...i,
            component: component?.id
        })) as Array<AnySignalType & { component: string }>
        while (component && component.parent) {
            const parent = comps.find(i => i.id === component?.parent);
            if (parent) {
                const parentSignals = parent.signals.map(i => ({...i, component: parent.id})) as Array<AnySignalType & {
                    component: string
                }>;
                result = [...result, ...parentSignals]
            }
            component = parent;
        }
        return result;
    })

    return <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}} data-id={'KRACK'}>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
            <button style={{
                display: 'flex',
                flexDirection: 'row',
                border: BORDER_NONE,
                borderRight: BORDER,
                backgroundColor: colors.grey10,
                cursor: 'pointer',
                borderTopLeftRadius: 10,
                borderBottomLeftRadius: 10,
                alignItems: 'center',
                padding: '5px 10px'
            }} onClick={onAddState}>
                <MdAdd/>
                <div>State</div>
            </button>
            <button style={{
                display: 'flex',
                flexDirection: 'row',
                border: BORDER_NONE,
                borderRight: BORDER,
                backgroundColor: colors.grey10,
                cursor: 'pointer',
                alignItems: 'center',
                padding: '5px 10px'
            }} onClick={onAddComputed}>
                <MdAdd/>
                <div>Computed</div>
            </button>
            <button style={{
                display: 'flex',
                flexDirection: 'row',
                border: BORDER_NONE,
                backgroundColor: colors.grey10,
                cursor: 'pointer',
                borderTopRightRadius: 10,
                borderBottomRightRadius: 10,
                alignItems: 'center',
                padding: '5px 10px'
            }} onClick={onAddEffect}>
                <MdAdd/>
                <div>Effect</div>
            </button>
        </div>
        <SignalList.List data={signalList} style={{
            border: BORDER_NONE,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5
        }}></SignalList.List>
    </div>
}

const SignalList = createResponsiveList<{
    name?: string,
    type?: string,
    valueType?: string,
    component?: string
}, Record<string, unknown>>().breakPoint({s: 300}).renderer({
    name: ({value}) => value,
    type: ({value}) => value,
    valueType: ({value}) => value,
    component: ({value}) => (value ?? '').substring(-5)
}).template({
    s: ({Slot}) => {
        return <div style={{display: 'flex', flexDirection: 'row', borderBottom: BORDER}}>
            <Slot for={'name'} style={{width: '25%', flexShrink: 0, borderRight: BORDER, padding: '2px 5px'}}/>
            <Slot for={'type'} style={{width: '25%', flexShrink: 0, borderRight: BORDER, padding: '2px 5px'}}/>
            <Slot for={'valueType'} style={{width: '25%', flexShrink: 0, borderRight: BORDER, padding: '2px 5px'}}/>
            <Slot for={'component'} style={{width: '25%', flexShrink: 0, padding: '2px 5px'}}/>
        </div>
    }
})
