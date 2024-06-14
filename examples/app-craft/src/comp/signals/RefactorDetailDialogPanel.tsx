import {AnySignalType, SignalComputed, SignalEffect} from "../Component.ts";
import {Signal} from "signal-polyfill";
import {notifiable, useComputed} from "react-hook-signal";
import {buildFunctionCode} from "./SignalDetailDialogPanel.tsx";
import {DiffEditor} from '@monaco-editor/react';
import {BORDER} from "../Border.ts";
import {colors} from "../../utils/colors.ts";
import * as monaco from 'monaco-editor';

export default function RefactorDetailDialogPanel(props: {
    closePanel: (param?: { success: boolean }) => void,
    signalsSignal: Signal.State<AnySignalType[]>,
    signalId: string,
    newSignalName: string
}) {
    const {closePanel, newSignalName, signalId, signalsSignal} = props;
    const codes = useComputed(() => {
        const signals = signalsSignal.get();
        const signalToChange = signals.find(s => s.id === signalId);
        if (signalToChange === undefined) {
            return;
        }
        // const originalName = signalToChange.name;
        // find impacted signal
        const referencingSignals = signals.filter(s => {
            if (isEffectOrComputed(s)) {
                return s.signalDependencies.includes(signalId)
            }
            return false;
        });
        const buildCodes: string[] = [];
        referencingSignals.forEach(s => {
            buildCodes.push(buildFunctionCode(s, signals, []));
        });
        return buildCodes.join("\n\n");
    })
    return <div style={{height: '90vh', width: '90vw', display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
        <label style={{fontSize:16,padding:10,fontStyle:'italic'}}>As you refactor the signal name, we automatically generate the updated code. You can then review and adjust the code within the function body to ensure the changes are accurate.</label>
        <div style={{display: 'flex',borderBottom:BORDER}}>
            <div style={{width: '50%',padding:'0 50px',fontWeight:500}}>Original</div>
            <div style={{width: '50%',padding:'0 15px',fontWeight:500}}>Modified</div>
        </div>
        <notifiable.div style={{flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
            {() => {
                const original = codes.get();
                const signals = signalsSignal.get();
                const signalToChange = signals.find(s => s.id === signalId);
                if (signalToChange === undefined) {
                    return;
                }
                return <DiffEditor original={original} modified={refactorSymbol(original??'',signalToChange.name,newSignalName)} language={'javascript'}/>
            }}
        </notifiable.div>
        <div style={{display:'flex',flexDirection:'row',padding:10,gap:10,justifyContent:'flex-end'}}>
            <button style={{
                border: BORDER,
                color: colors.white,
                backgroundColor: colors.green,
                borderRadius: 5,
                padding: '5px 10px'
            }}>Apply</button>
            <button style={{
                border: BORDER,
                color: colors.white,
                backgroundColor: colors.grey,
                borderRadius: 5,
                padding: '5px 10px'
            }}>Reset</button>
            <button style={{
                border: BORDER,
                color: colors.white,
                backgroundColor: colors.grey,
                borderRadius: 5,
                padding: '5px 10px'
            }} onClick={() => closePanel()}>Cancel</button>
        </div>
    </div>
}

function isEffectOrComputed(signal: AnySignalType): signal is SignalEffect | SignalComputed {
    return signal.type === 'Effect' || signal.type === 'Computed';
}

export function refactorSymbol(
    code: string,
    oldSymbol: string,
    newSymbol: string
): string {
    const model = monaco.editor.createModel(code, 'javascript');
    const matches = model.findMatches(oldSymbol, false, false, true, null, true);

    matches.forEach(match => {
        const range = match.range;
        model.applyEdits([
            {
                range: range,
                text: newSymbol,
            },
        ]);
    });

    const newCode = model.getValue();
    model.dispose(); // Dispose of the temporary model
    return newCode;
}