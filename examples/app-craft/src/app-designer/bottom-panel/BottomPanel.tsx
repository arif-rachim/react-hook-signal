import {Icon} from "../Icon.ts";
import {notifiable} from "react-hook-signal";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {BORDER} from "../Border.ts";

export function BottomPanel() {
    const {allErrorsSignal, allContainersSignal, allVariablesSignal} = useContext(AppDesignerContext);
    return <div style={{display:'flex',flexDirection:'column',padding:'10px 20px', borderTop: BORDER}}>
        <notifiable.div style={{display: 'table'}}>
            {() => {
                const errors = allErrorsSignal.get();
                const containers = allContainersSignal.get();
                const variables = allVariablesSignal.get();
                return <>
                    {errors.map(e => {
                        let type: string | undefined = undefined;
                        let name: string | undefined = undefined;
                        if (e.type === 'property') {
                            const container = containers.find(c => c.id === e.referenceId)
                            type = container?.type;
                            name = e.propertyName;
                        }
                        if (e.type === 'variable') {
                            const v = variables.find(c => c.id === e.referenceId)
                            type = v?.type;
                            name = v?.name;
                        }
                        return <div key={`${e.referenceId}-${e.propertyName}`}
                                    style={{display: 'table-row'}}>
                            <div style={{display: 'table-cell'}}>{type}</div>
                            <div style={{display: 'table-cell'}}>{name}</div>
                            <div style={{display: 'table-cell'}}>{e.message}</div>
                            <div style={{display: 'table-cell'}}><Icon.Delete/></div>
                        </div>
                    })}
                </>
            }}
        </notifiable.div>
    </div>
}