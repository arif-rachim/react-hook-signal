import {BORDER} from "../../core/style/Border.ts";
import {Icon} from "../../core/components/icon/Icon.ts";
import {Button} from "../button/Button.tsx";
import {useAppContext} from "../../core/hooks/useAppContext.ts";
import {zodSchemaToJson} from "../../core/utils/zodSchemaToJson.ts";
import {Editor} from "@monaco-editor/react";
import {initiateSchemaTS} from "../designer/editor/initiateSchemaTS.ts";
import {useMemo, useState} from "react";

/**
 * A component for create function to map input schema to output schema
 */
export function PageSchemaMapper(props: {
    closePanel: (param: string | undefined | 'cancel') => void,
    value?: string,
    pageId?: string,
    mapperInputSchema?: string
}) {

    const {closePanel, pageId, mapperInputSchema} = props;
    const {
        allPagesSignal,
        allApplicationQueriesSignal,
        allApplicationVariablesSignal,
        allApplicationFetchersSignal,
        allApplicationCallablesSignal,
        allPageQueriesSignal,
        allPageVariablesSignal,
        allPageFetchersSignal,
        allPageCallablesSignal
    } = useAppContext();
    const [value, setValue] = useState(props.value)
    const mapperOutputSchema = useMemo(() => {
        const page = allPagesSignal.get().find(i => i.id === pageId)
        let type = '';
        if (page) {
            type = page.variables.filter(v => v.type === 'state').map(v => {
                return `${v.name}?:${zodSchemaToJson(v.schemaCode)}`
            }).join(',')
        }
        return `{${type}}`;
    }, [allPagesSignal, pageId]);
    const returnType = `(param:{cellValue?:string|number|null,rowIndex:number,rowData:${mapperInputSchema},columnName:string,gridData:Array<${mapperInputSchema}>}) => ${mapperOutputSchema}`;


    const allApplicationQueries = allApplicationQueriesSignal.get();
    const allApplicationVariables = allApplicationVariablesSignal.get();
    const allApplicationFetchers = allApplicationFetchersSignal.get();
    const allApplicationCallables = allApplicationCallablesSignal.get();

    const allPageQueries = allPageQueriesSignal.get();
    const allPageVariables = allPageVariablesSignal.get();
    const allPageFetchers = allPageFetchersSignal.get();
    const allPageCallables = allPageCallablesSignal.get();

    return <div style={{display: 'flex', flexDirection: 'column', gap: 10, width: 600, height: 800}}>
        <div style={{
            borderBottom: BORDER,
            padding: 20,
            backgroundColor: 'rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 5
        }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22}}><Icon.Page/>
            </div>
            <div style={{fontSize: 16}}>Mapper function :</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto', padding: '0px 20px'}}>
            <Editor
                language="javascript"
                key={mapperOutputSchema}
                beforeMount={(monaco) => {
                    const dtsContent = initiateSchemaTS({
                        returnType,
                        allPages: [],
                        allTables: [],

                        allApplicationQueries,
                        allApplicationVariables,
                        allApplicationFetchers,
                        allApplicationCallables,

                        allPageQueries,
                        allPageVariables,
                        allPageFetchers,
                        allPageCallables,
                    })
                    monaco.languages.typescript.javascriptDefaults.addExtraLib(dtsContent, "ts:filename/validation-source.d.ts");
                }}
                value={value}
                onChange={setValue}
            />
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 10,
            borderTop: BORDER,
            padding: 20,
            backgroundColor: 'rgba(0,0,0,0.05)'
        }}>
            <Button onClick={() => {
                closePanel(value);
            }} style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }} icon={'IoIosSave'}>
                {'Save'}
            </Button>
            <Button onClick={() => closePanel('cancel')} style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }} icon={'IoIosExit'}>
                {'Cancel'}
            </Button>
        </div>
    </div>
}