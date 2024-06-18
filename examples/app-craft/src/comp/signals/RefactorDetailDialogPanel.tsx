import {AnySignalType, SignalComputed, SignalEffect} from "../Component.ts";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {DiffEditor} from '@monaco-editor/react';
import {BORDER} from "../Border.ts";
import {colors} from "../../utils/colors.ts";
import {refactorSymbol} from "./refactorSymbol.ts";
import {getFunctionSymbol} from "./getFunctionSymbol.ts";
import {generateSignalFunction} from "./generateSignalFunction.ts";
import {useContext} from "react";
import {ComponentContext} from "../ComponentContext.ts";
import {convertToSetterName} from "../../utils/convertToSetterName.ts";

export default function RefactorDetailDialogPanel(props: {
    closePanel: (param?: { success: boolean }) => void,
    signalId: string,
    newSignalName: string
}) {
    const componentContext = useContext(ComponentContext)!;
    const { signals } = componentContext;
    const {closePanel, newSignalName, signalId} = props;
    const codes = useComputed(() => {
        const signalz = signals.get();
        const signalToChange = signalz.find(s => s.id === signalId);
        if (signalToChange === undefined) {
            return;
        }
        const referencingSignals = signalz.filter(s => {
            if (isEffectOrComputed(s)) {
                const hasReference = s.signalDependencies.includes(signalId);
                const hasMutatorReference = isEffect(s) ? s.mutableSignals.includes(signalId) : false;
                return hasReference || hasMutatorReference;
            }
            return false;
        });

        const buildCodes: string[] = [];
        referencingSignals.forEach(s => {
            buildCodes.push(generateSignalFunction(s, signalz, []));
        });

        return buildCodes.join("\n\n");
    });
    const refactoredCodes = useSignal('');
    useSignalEffect(() => {
        let original = codes.get();
        const signalToChange = signals.get().find(s => s.id === signalId);
        if (signalToChange === undefined) {
            return;
        }
        if(original){
            if(isState(signalToChange)){
                original = refactorSymbol(original??'', convertToSetterName(signalToChange.name),convertToSetterName(newSignalName));
            }
            refactoredCodes.set(refactorSymbol(original??'',signalToChange.name,newSignalName))
        }
    })
    function applyChanges(){
        const modified = refactoredCodes.get();

        const referencingSignals = signals.get().filter(s => {
            if (isEffectOrComputed(s)) {
                const hasReference = s.signalDependencies.includes(signalId);
                const hasMutatorReference = isEffect(s) ? s.mutableSignals.includes(signalId) : false;
                return hasReference || hasMutatorReference;
            }
            return false;
        });

        const referencingSignalsToBeUpdated:AnySignalType[] = [];
        for (let i = 0; i < referencingSignals.length; i++) {
            const signal = referencingSignals[i];
            const functionName = getFunctionSymbol(signal);
            const startOfTheSignal = modified.lastIndexOf(functionName);
            const startBracketOfTheSignal = modified.indexOf('{',startOfTheSignal);
            let closingBracketOfTheSignal = 0;
            const isTheLastSignalToBeUpdated = (referencingSignals.length - 1) === i;
            if(isTheLastSignalToBeUpdated){
                closingBracketOfTheSignal = modified.lastIndexOf('}');
            }else{
                const nextFunctionName = getFunctionSymbol(referencingSignals[i+1]);
                const startTheNextSignal = modified.lastIndexOf(nextFunctionName);
                closingBracketOfTheSignal = modified.lastIndexOf('}',startTheNextSignal);
            }
            const signalContent = modified.substring(startBracketOfTheSignal+1,closingBracketOfTheSignal);
            referencingSignalsToBeUpdated.push({...signal,formula:'\t'+signalContent.trim()});
        }
        signals.set(signals.get().map(s => {
            const updatedSignal = referencingSignalsToBeUpdated.find(g => g.id === s.id);
            return updatedSignal !== undefined ? updatedSignal : s;
        }));
        closePanel({success:true});
    }
    return <div style={{height: '90vh', width: '90vw', display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
        <label style={{fontSize:16,padding:10,fontStyle:'italic'}}>As you refactor the signal name, we automatically generate the updated code. You can then review and adjust the code within the function body to ensure the changes are accurate.</label>
        <div style={{display: 'flex',borderBottom:BORDER}}>
            <div style={{width: '50%',padding:'0 50px',fontWeight:500}}>Original</div>
            <div style={{width: '50%',padding:'0 15px',fontWeight:500}}>Modified</div>
        </div>
        <notifiable.div style={{flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
            {() => {
                const original = codes.get();
                const modified = refactoredCodes.get();
                return <DiffEditor original={original} modified={modified} language={'javascript'}/>
            }}
        </notifiable.div>
        <div style={{display:'flex',flexDirection:'row',padding:10,gap:10,justifyContent:'flex-end'}}>
            <button style={{
                border: BORDER,
                color: colors.white,
                backgroundColor: colors.green,
                borderRadius: 5,
                padding: '5px 10px'
            }} onClick={applyChanges}>Apply</button>
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

function isEffect(signal: AnySignalType): signal is SignalEffect {
    return signal.type === 'Effect';
}

function isState(signal: AnySignalType): signal is SignalEffect {
    return signal.type === 'State';
}
