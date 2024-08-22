import {useAppContext} from "../../hooks/useAppContext.ts";
import {Button} from "../../button/Button.tsx";
import {MdAdd} from "react-icons/md";
import {notifiable} from "react-hook-signal";
import {Callable} from "../../AppDesigner.tsx";
import {guid} from "../../../utils/guid.ts";
import {Icon} from "../../Icon.ts";
import {useAddDashboardPanel} from "../../dashboard/useAddDashboardPanel.tsx";
import CallableEditorPanel from "./editor/CallableEditorPanel.tsx";

export default function CallablePanel(){

    const {allApplicationCallablesSignal} = useAppContext();
    const addPanel = useAddDashboardPanel();

    function deleteCallable(callable:Callable){
        console.log('callable ',callable)
    }
    function editCallable(callable?:Callable){
        const panelId = callable?.id ?? guid();
        addPanel({
            position: 'mainCenter',
            component: () => {
                return <CallableEditorPanel callableId={callable?.id} panelId={panelId}/>
            },
            title: callable ? `Edit ${callable.name}` : `Add Callable`,
            Icon: Icon.Component,
            id: panelId,
            tag : {
                type : 'CallableEditorPanel'
            },
            visible: () => true,
        })
    }

    return <div style={{display:'flex',flexDirection:'column',padding:10}}>
        <Button
            style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginBottom: 5}}
            onClick={() => editCallable()}
        >
            {'Add Callable'}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MdAdd style={{fontSize: 20}}/>
            </div>
        </Button>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                return allApplicationCallablesSignal.get().map(callable => {
                    return <div style={{display: 'flex', gap: 10, padding: '5px 5px'}} key={callable.id}>

                        <div style={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>{callable.name}</div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} onClick={() => deleteCallable(callable)}>
                            <Icon.Delete style={{fontSize: 18}}/>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} onClick={() => editCallable(callable)}>
                            <Icon.Detail style={{fontSize: 18}}/>
                        </div>
                    </div>
                })
            }}
        </notifiable.div>
    </div>
}