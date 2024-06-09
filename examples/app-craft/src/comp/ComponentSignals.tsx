import {useContext} from "react";
import {ComponentContext} from "./ComponentContext.ts";
import {BORDER, BORDER_NONE} from "./Border.ts";
import {colors} from "../utils/colors.ts";
import {useShowModal} from "../modal/useShowModal.ts";
import {AnySignalType, SignalComputed, SignalEffect, SignalState} from "./Component.ts";
import {createResponsiveList} from "stock-watch/src/responsive-list/createResponsiveList.tsx";
import {PiTrafficSignal, PiWebhooksLogo} from "react-icons/pi";
import {LuFunctionSquare} from "react-icons/lu";
import {TiSortNumerically} from "react-icons/ti";
import {AiOutlineFieldString} from "react-icons/ai";
import {TbToggleLeftFilled} from "react-icons/tb";
import {MdDataArray, MdDataObject, MdEdit} from "react-icons/md";
import {createNewValue, SignalDetailDialogPanel} from "./signals/SignalDetailDialogPanel.tsx";

const Icon = {
    State: PiTrafficSignal,
    Computed: LuFunctionSquare,
    Effect: PiWebhooksLogo,
    number: TiSortNumerically,
    string: AiOutlineFieldString,
    boolean: TbToggleLeftFilled,
    Record: MdDataObject,
    Array: MdDataArray
}
export default function ComponentSignals() {
    const {signals} = useContext(ComponentContext)!;
    const showModal = useShowModal()

    async function onAddSignal(type: 'State' | 'Computed' | 'Effect') {
        const state = await showModal<AnySignalType>(closePanel => {
            if (type === "State") {
                return <SignalDetailDialogPanel closePanel={closePanel} signals={signals.get()} value={createNewValue(type) as SignalState} requiredField={['name','formula']} additionalParams={[]}/>
            } else if (type === "Computed") {
                return <SignalDetailDialogPanel closePanel={closePanel} signals={signals.get()} value={createNewValue(type) as SignalComputed} requiredField={['name','signalDependencies','formula']} additionalParams={[]} />
            } else if (type === "Effect") {
                return <SignalDetailDialogPanel closePanel={closePanel} signals={signals.get()} value={createNewValue(type) as SignalEffect} requiredField={['name','signalDependencies','formula']} additionalParams={[]}/>
            } else {
                return <></>
            }
        });
        const signalValues = signals.get();
        signals.set([...signalValues, state]);
    }

    async function onEditSignal(signal:AnySignalType){
        const state = await showModal<AnySignalType>(closePanel => {
            if(signal.type === 'State'){
                return <SignalDetailDialogPanel closePanel={closePanel} value={signal} signals={signals.get()} requiredField={['name','formula']} additionalParams={[]} />
            }
            if(signal.type === 'Computed'){
                return <SignalDetailDialogPanel closePanel={closePanel} value={signal} signals={signals.get()} requiredField={['name','signalDependencies','formula']} additionalParams={[]} />
            }
            if(signal.type === 'Effect'){
                return <SignalDetailDialogPanel closePanel={closePanel} value={signal} signals={signals.get()} requiredField={['name','signalDependencies','formula']} additionalParams={[]} />
            }
            return <></>
        });
        const signalValues = signals.get();
        const idx = signalValues.findIndex(i => i.id === state.id);
        if (idx >= 0) {
            signalValues.splice(idx, 1, state);
            signals.set([...signalValues])
        }
    }


    return <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <button style={{
                display: 'flex',
                flexDirection: 'column',
                width: '33.33%',
                border: BORDER_NONE,
                backgroundColor: colors.white,
                borderRight: BORDER,
                cursor: 'pointer',
                alignItems: 'center',
                padding: '5px 10px',
                gap: 5
            }} onClick={() => onAddSignal('State')}>
                <Icon.State style={{fontSize: 22}}/>
                <div>State</div>
            </button>
            <button style={{
                display: 'flex',
                flexDirection: 'column',
                width: '33.33%',
                border: BORDER_NONE,
                backgroundColor: colors.white,
                borderRight: BORDER,
                cursor: 'pointer',
                alignItems: 'center',
                padding: '5px 10px',
                gap: 5
            }} onClick={() => onAddSignal('Computed')}>
                <Icon.Computed style={{fontSize: 22}}/>
                <div>Computed</div>
            </button>
            <button style={{
                display: 'flex',
                flexDirection: 'column',
                width: '33.33%',
                border: BORDER_NONE,
                backgroundColor: colors.white,
                cursor: 'pointer',
                alignItems: 'center',
                padding: '5px 10px',
                gap: 5
            }} onClick={() => onAddSignal('Effect')}>
                <Icon.Effect style={{fontSize: 22}}/>
                <div>Effect</div>
            </button>
        </div>
        <SignalList.List data={signals} style={{
            border: BORDER_NONE,
            borderTop: BORDER,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
        }} onEditSignal={onEditSignal}></SignalList.List>
    </div>
}

const SignalList = createResponsiveList<{
    name?: string,
    type?: keyof typeof Icon,
    valueType?: keyof typeof Icon,
    component?: string,
    edit?: string
}, {onEditSignal:(param:AnySignalType) => void}>().breakPoint({s: 300}).renderer({
    name: ({value}) => value,
    type: ({value}) => {
        const Ico = Icon[value!];
        return <Ico style={{fontSize: 22, marginBottom: -5, marginTop: -2}}/>
    },
    valueType: ({value}) => {
        if (value === undefined) {
            return <div style={{height: 22}}></div>
        }
        const Ico = Icon[value!];
        return <Ico style={{fontSize: 22, marginBottom: -5, marginTop: -2}}/>
    },
    component: ({value}) => (value ?? '').slice(-5),
    edit: ({item,onEditSignal}) => {
        return <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2
        }} onClick={() => {
            onEditSignal(item as AnySignalType);
        }}><MdEdit style={{fontSize: 16}}/></div>
    }
}).template({
    s: ({Slot}) => {
        return <div style={{display: 'flex', flexDirection: 'row', borderBottom: BORDER, alignItems: 'center'}}>
            <Slot for={'type'} style={{width: 25, flexShrink: 0, padding: '2px 0px'}}/>
            <Slot for={'valueType'} style={{width: 25, flexShrink: 0, padding: '2px 0px'}}/>

            <Slot for={'name'} style={{flexGrow: 1, flexShrink: 0, padding: '2px 5px'}}/>
            <Slot for={'component'} style={{width: 50, flexShrink: 0, padding: '2px 5px'}}/>
            <Slot for={'edit'}
                  style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: 25, flexShrink: 0}}
            />
        </div>
    }
})
