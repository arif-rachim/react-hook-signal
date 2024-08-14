import {MdAdd} from "react-icons/md";
import {Button} from "../../button/Button.tsx";
import {useEffect, useRef} from "react";
import sqlite from "./sqlite/sqlite.ts";
import {getTables, Table} from "./service/getTables.ts";
import {notifiable, useSignal} from "react-hook-signal";
import {Icon} from "../../Icon.ts";
import {useAddDashboardPanel} from "../../dashboard/useAddDashboardPanel.tsx";
import TableEditor from "./table-editor/TableEditor.tsx";

export function DatabasePanel(){
    const fileInputRef = useRef<HTMLInputElement|null>(null);
    const tablesSignal = useSignal<Table[]>([]);
    const addPanel = useAddDashboardPanel();
    function addSqlLite(){
        if(fileInputRef.current){
            (fileInputRef.current as HTMLInputElement).click();
        }
    }

    useEffect(() => {
        (async () => {
            const result = await getTables();
            tablesSignal.set(result);
        })();
    }, []);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files === null || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];

        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await sqlite({type:'saveToFile',binaryArray:new Uint8Array(arrayBuffer)})
            if(result.success){
                const result = await getTables();
                tablesSignal.set(result);
            }
        }
    }

    function openDetail(table:Table){
        addPanel({
            visible : (params) => true,
            title : `${table.tblName}`,
            Icon : Icon.Database,
            id : `${table.tblName}`,
            tag : {
                type : 'TableEditor',
            },
            component : () => <TableEditor table={table} />,
            position : 'mainCenter',
        })
    }

    return <div style={{display:'flex',flexDirection:'column',padding:10}}>
        <Button
            style={{display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center', marginBottom: 5}}
            onClick={() => addSqlLite()}
        >
            {'Load SqlLite'}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MdAdd style={{fontSize: 20}}/>
            </div>
        </Button>
        <input type={'file'}
               ref={fileInputRef}
               accept={".sqlite,.db"}
               style={{padding: 10, display: 'none'}}
               onChange={handleFileChange}
        />
        <notifiable.div style={{display:'flex',flexDirection:'column'}}>
            {() => {
                const tables = tablesSignal.get();
                return tables.map(table => {
                    return <div style={{display: 'flex', gap: 10, padding: '5px 5px'}} key={table.tblName}>
                        <div style={{flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis'}}>{table.tblName}</div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }} onClick={() => openDetail(table)}>
                            <Icon.Detail style={{fontSize: 18}}/>
                        </div>
                    </div>

                })
            }}
        </notifiable.div>
    </div>
}