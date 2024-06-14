import {AnySignalType, SignalComputed, SignalEffect} from "../Component.ts";
import {Signal} from "signal-polyfill";
import {notifiable, useComputed} from "react-hook-signal";
import {buildFunctionCode} from "./SignalDetailDialogPanel.tsx";

export default function RefactorDetailDialogPanel(props:{
    closePanel:(param?:{success:boolean}) => void,
    signalsSignal:Signal.State<AnySignalType[]>,
    signalId:string,
    newSignalName:string
}) {
    const {closePanel,newSignalName,signalId,signalsSignal} = props;
    const codes = useComputed(() => {
        const signals = signalsSignal.get();
        const signalToChange = signals.find(s => s.id === signalId);
        if(signalToChange === undefined){
            return;
        }
        // const originalName = signalToChange.name;
        // find impacted signal
        const referencingSignals = signals.filter(s => {
            if(isEffectOrComputed(s)){
                return s.signalDependencies.includes(signalId)
            }
            return false;
        });
        const buildCodes:string[] = [];
        referencingSignals.forEach(s => {
            buildCodes.push(buildFunctionCode(s,signals,[]));
        });
        return buildCodes.join("\n\n");
    })
    return <notifiable.div>
        {() => codes.get()}
    </notifiable.div>
}

function isEffectOrComputed(signal:AnySignalType):signal is SignalEffect|SignalComputed{
    return signal.type === 'Effect' || signal.type === 'Computed';
}
