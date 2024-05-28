import {useContext} from "react";
import {ComponentContext} from "./ComponentContext.ts";
import {BORDER, BORDER_NONE} from "./Border.ts";
import {colors} from "../utils/colors.ts";
import {useShowModal} from "../modal/useShowModal.ts";
import {StateDialogPanel} from "./signals/StateDialogPanel.tsx";
import {ComputedDialogPanel} from "./signals/ComputedDialogPanel.tsx";
import {EffectDialogPanel} from "./signals/EffectDialogPanel.tsx";
import {AnySignalType} from "./Component.ts";
import {createResponsiveList} from "stock-watch/src/responsive-list/createResponsiveList.tsx";
import {PiTrafficSignal, PiWebhooksLogo} from "react-icons/pi";
import {LuFunctionSquare} from "react-icons/lu";
import {TiSortNumerically} from "react-icons/ti";
import {AiOutlineFieldString} from "react-icons/ai";
import {TbToggleLeftFilled} from "react-icons/tb";
import {MdDataArray, MdDataObject} from "react-icons/md";

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
                return <StateDialogPanel closePanel={closePanel}/>
            } else if (type === "Computed") {
                return <ComputedDialogPanel closePanel={closePanel} signals={signals.get()}/>
            } else if (type === "Effect") {
                return <EffectDialogPanel closePanel={closePanel} signals={signals.get()}/>
            } else {
                return <></>
            }
        });
        const signalValues = signals.get();
        const idx = signalValues.findIndex(i => i.id === state.id);
        if (idx >= 0) {
            signalValues.splice(idx, 1, state);
            signals.set([...signalValues])
        } else {
            signals.set([...signalValues, state]);
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
        }}></SignalList.List>
    </div>
}

const SignalList = createResponsiveList<{
    name?: string,
    type?: keyof typeof Icon,
    valueType?: keyof typeof Icon,
    component?: string
}, Record<string, unknown>>().breakPoint({s: 300}).renderer({
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
    component: ({value}) => (value ?? '').slice(-5)
}).template({
    s: ({Slot}) => {
        return <div style={{display: 'flex', flexDirection: 'row', borderBottom: BORDER, alignItems: 'center'}}>
            <Slot for={'type'} style={{width: 25, flexShrink: 0, padding: '2px 0px'}}/>
            <Slot for={'valueType'} style={{width: 25, flexShrink: 0, padding: '2px 0px'}}/>

            <Slot for={'name'} style={{flexGrow: 1, flexShrink: 0, padding: '2px 5px'}}/>
            <Slot for={'component'} style={{width: 50, flexShrink: 0, padding: '2px 5px'}}/>
        </div>
    }
})
