import {MdAdd, MdRemove} from "react-icons/md";
import {Button} from "../../button/Button.tsx";
import {ChangeEvent, useRef} from "react";
import sqlite from "./sqlite/sqlite.ts";
import {getTables, Table} from "./service/getTables.ts";
import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {Icon} from "../../Icon.ts";
import {useAddDashboardPanel} from "../../dashboard/useAddDashboardPanel.tsx";
import TableEditor from "./table-editor/TableEditor.tsx";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {useUpdateApplication} from "../../hooks/useUpdateApplication.ts";

export function DatabasePanel() {
    const focusedItemSignal = useSignal<string>('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const {applicationSignal} = useAppContext();
    const tablesSignal = useComputed<Table[]>(() => {
        return applicationSignal.get().tables;
    });
    const addPanel = useAddDashboardPanel();

    function addSqlLite() {
        if (fileInputRef.current) {
            (fileInputRef.current as HTMLInputElement).click();
        }
    }

    async function deleteSqlLite(){
        // we need to delete sqlite here
        const result = await sqlite({type: 'deleteFromFile'});
        if (!result.errors) {
            const result = await getTables();
            console.log('WE GOT THE TABLES HERE BABY, THIS SHOULD BE EMPTY ',result);
            updateApplication(old => {

                old.tables = result;
            });

        }
    }

    const updateApplication = useUpdateApplication();

    async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files === null || e.target.files.length === 0) {
            return;
        }
        const file = e.target.files[0];

        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const result = await sqlite({type: 'saveToFile', binaryArray: new Uint8Array(arrayBuffer)})
            if (!result.errors) {
                const result = await getTables();
                updateApplication(old => {
                    old.tables = result;
                })
            }
        }
    }

    function openDetail(table: Table) {
        addPanel({
            title: `${table.tblName}`,
            Icon: Icon.Database,
            id: `${table.tblName}`,
            tag: {
                type: 'TableEditor',
            },
            component: () => <TableEditor table={table}/>,
            position: 'mainCenter',
        })
    }

    return <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex',padding : 10}}>
            <Button
                style={{
                    flexGrow :1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    justifyContent: 'center',
                    padding: '0px 10px 2px 10px',
                    background: 'rgba(0,0,0,0.0)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderTopRightRadius:0,
                    borderBottomRightRadius : 0,
                    borderRight : 'unset',
                    color: '#333',
                }}
                onClick={() => addSqlLite()}
            >
                {'Load SqlLite'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdAdd style={{fontSize: 20}}/>
                </div>
            </Button>
            <Button
                style={{
                    flexGrow :1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    justifyContent: 'center',
                    padding: '0px 10px 2px 10px',
                    background: 'rgba(0,0,0,0.0)',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderTopLeftRadius:0,
                    borderBottomLeftRadius : 0,
                    color: '#333',
                }}
                onClick={() => deleteSqlLite()}
            >
                {'Delete SqlLite'}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdRemove style={{fontSize: 20}}/>
                </div>
            </Button>
        </div>
        <input type={'file'}
               ref={fileInputRef}
               accept={".sqlite,.db"}
               style={{padding: 10, display: 'none'}}
               onChange={handleFileChange}
        />
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {() => {
                const tables = tablesSignal.get() ?? [];
                const focusedItem = focusedItemSignal.get();
                return tables.map(table => {
                    const isFocused = focusedItem === table.tblName;
                    return <div style={{
                        display: 'flex',
                        gap: 5,
                        padding: '0px 10px 2px 10px',
                        background: isFocused ? 'rgba(0,0,0,0.1)' : 'unset'
                    }} key={table.tblName} onClick={() => {
                        focusedItemSignal.set(table.tblName);
                        openDetail(table)
                    }}>
                        <div style={{
                            flexGrow: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: 'small'
                        }}>{table.tblName}</div>
                    </div>
                })
            }}
        </notifiable.div>
    </div>
}
