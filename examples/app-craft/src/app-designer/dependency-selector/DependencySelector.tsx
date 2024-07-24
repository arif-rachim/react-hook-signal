import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {BORDER} from "../Border.ts";
import {Icon} from "../Icon.ts";
import {Button} from "../button/Button.tsx";

/**
 * A component for selecting dependencies.
 */
export function DependencySelector(props: {
    closePanel: (param: Array<string> | 'cancel') => void,
    value: Array<string>,
    signalsToFilterOut: Array<string>
}) {
    const {closePanel, signalsToFilterOut} = props;
    const {allVariablesSignal} = useContext(AppDesignerContext);
    const selectedSignal = useSignal<Array<string>>(props.value);
    const elements = useComputed(() => {
        const variables = allVariablesSignal.get();
        const selected = selectedSignal.get();
        return variables.filter(i => {
            if (signalsToFilterOut.includes(i.id)) {
                return false;
            }
            return i.type !== 'effect';
        }).map((i) => {
            const isSelected = selected.indexOf(i.id) >= 0;
            return <div key={i.id} style={{display: 'flex', alignItems: 'center', gap: 5}} onClick={() => {
                const selected = selectedSignal.get();
                const isSelected = selected.indexOf(i.id) >= 0;
                if (isSelected) {
                    selectedSignal.set(selectedSignal.get().filter(id => id !== i.id))
                } else {
                    selectedSignal.set([...selectedSignal.get(), i.id])
                }
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: BORDER,
                    padding: '5px'
                }}>
                    {i.type === 'effect' && <Icon.Effect/>}
                    {i.type === 'computed' && <Icon.Computed/>}
                    {i.type === 'state' && <Icon.State/>}
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20
                }}>{isSelected && <Icon.Checked/>}</div>
                <div>{i.name}</div>
            </div>
        })
    })
    return <div style={{display: 'flex', flexDirection: 'column', padding: 20, gap: 10}}>
        <div style={{fontSize: 16}}>Variables (whether state or computed) that will be referenced by</div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {elements}
        </notifiable.div>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 10}}>
            <Button onClick={() => closePanel(selectedSignal.get())} style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }}>
                {'Save'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon.Save style={{fontSize: 18}}/>
                </div>
            </Button>
            <Button onClick={() => closePanel('cancel')} style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }}>
                {'Cancel'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Icon.Exit style={{fontSize: 18}}/>
                </div>
            </Button>
        </div>
    </div>
}