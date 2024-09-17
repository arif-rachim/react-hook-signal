import {useSelectedDragContainer} from "../hooks/useSelectedDragContainer.ts";
import {useAppContext} from "../hooks/useAppContext.ts";
import {isEmpty} from "../../utils/isEmpty.ts";
import {useUpdateDragContainer} from "../hooks/useUpdateSelectedDragContainer.ts";
import {CSSProperties, useEffect, useState} from "react";
import {colors} from "stock-watch/src/utils/colors.ts";
import {BORDER} from "../Border.ts";
import {Icon} from "../Icon.ts";
import {useShowModal} from "../../modal/useShowModal.ts";
import {Button} from "../button/Button.tsx";
import {ColumnsConfig} from "../panels/database/table-editor/TableEditor.tsx";
import {Container} from "../AppDesigner.tsx";
import {queryGridColumnsTemporalColumns} from "./QueryGrid.tsx";
import {PageInputSelector} from "../page-selector/PageInputSelector.tsx";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank} from "react-icons/md";
import {IoMdCheckbox} from "react-icons/io";

function getFormula(container: Container | undefined, propertyName: string) {
    if (container && container.properties[propertyName]) {
        return container.properties[propertyName].formula;
    }
    return '';
}

export function ConfigPropertyEditor(props: { propertyName: string }) {
    const containerSignal = useSelectedDragContainer();
    const context = useAppContext<AppDesignerContext>();

    const container = containerSignal.get();
    const {propertyName} = props;
    const hasError = context.allErrorsSignal.get().find(i => i.type === 'property' && i.propertyName === propertyName && i.containerId === container?.id) !== undefined;
    const formula = getFormula(container, propertyName);
    const isFormulaEmpty = isEmpty(formula);
    const update = useUpdateDragContainer();
    const showModal = useShowModal();
    const style: CSSProperties = {
        width: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: 0,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 0,
        backgroundColor: isFormulaEmpty ? colors.grey : colors.green,
        padding: 0
    };

    async function updateTableConfig() {
        const updatedFormula = await showModal(closePanel => {
            return <AppDesignerContext.Provider value={context}>
                <EditColumnConfigFormula closePanel={closePanel} formula={formula}
                                         columns={queryGridColumnsTemporalColumns[container?.id ?? '']}
                />
            </AppDesignerContext.Provider>
        });
        if (updatedFormula && typeof updatedFormula === 'string' && container?.id) {
            update(container.id, container => {
                container.properties = {...container.properties}
                container.properties[propertyName] = {...container.properties[propertyName]}
                container.properties[propertyName].formula = updatedFormula;
            })
        }
    }

    return <div style={{display: 'flex'}}>
        <div style={style} onClick={updateTableConfig}/>
        <div style={{
            display: 'flex',
            padding: '0px 2px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)',
            border: BORDER,
            width: 28,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20
        }}>
            {hasError && <Icon.Error style={{fontSize: 16, color: colors.red}}/>}
            {!hasError && <Icon.Checked style={{fontSize: 16, color: colors.green}}/>}
        </div>
    </div>
}


function EditColumnConfigFormula(props: {
    closePanel: (formula?: string) => void,
    formula?: string,
    columns?: string[],
}) {
    const {columns, formula, closePanel} = props;
    const [config, setConfig] = useState<ColumnsConfig>({});
    const [allHiddenStatus, setAllHiddenStatus] = useState<ThreeState>('no');
    useEffect(() => {
        if (formula) {
            setTimeout(() => {
                try {
                    const module = {exports: {}};
                    const fun = new Function('module', formula);
                    fun.call(null, module)
                    setConfig(module.exports);
                } catch (err) {
                    console.error(err);
                }
            }, 100)

        }
    }, [formula]);
    useEffect(() => {
        if (allHiddenStatus === 'yes') {
            setConfig(oldConfig => {
                if (columns) {
                    const clone = {...oldConfig};
                    for (const col of columns) {
                        clone[col] = {...clone[col]};
                        clone[col].hidden = true;
                    }
                    return clone;
                }

                return oldConfig;
            })
        }
        if (allHiddenStatus === 'no') {
            setConfig(oldConfig => {
                if (columns) {
                    const clone = {...oldConfig};
                    for (const col of columns) {
                        clone[col] = {...clone[col]};
                        clone[col].hidden = false;
                    }
                    return clone;
                }
                return oldConfig;
            })
        }
    }, [allHiddenStatus, columns]);
    return <div
        style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '0px 10px',
            gap: 10,
            overflow: 'auto',
            maxHeight: '100%'
        }}>

        <div style={{display: 'table', overflowY: 'auto', height: '100%'}}>
            <div style={{display: 'table-row', position: 'sticky', top: 0, backgroundColor: 'white'}}>
                <div style={{display: 'table-cell', padding: '0px 5px'}}>
                </div>
                <div style={{display: 'table-cell', padding: '10px 5px'}}>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingRight: 1}}>
                        <div style={{paddingBottom: 2}}>Is Hidden</div>
                        <InputThreeStateCheckbox value={allHiddenStatus} onChange={setAllHiddenStatus}
                                                 style={{fontSize: 17, color: 'rgba(0,0,0,0.6)'}}/>
                    </div>
                </div>
                <div style={{display: 'table-cell', padding: '0px 5px'}}>
                    Width
                </div>
                <div style={{display: 'table-cell', padding: '0px 5px', width: 300}}>
                    Renderer
                </div>
                <div style={{display: 'table-cell', padding: '0px 5px'}}>
                    Title
                </div>
            </div>
            {(columns ?? []).map((col, index, source) => {
                const isLastIndex = source.length - 1 === index;
                const conf = config[col] ?? {
                    hidden: false,
                    width: undefined,
                    title: undefined,
                    rendererPageId: undefined
                };
                return <div key={col} style={{display: 'table-row'}}>
                    <div style={{display: 'table-cell', padding: '0px 5px'}}>
                        {col}
                    </div>
                    <div style={{
                        display: 'table-cell',
                        padding: '0px 5px',
                        textAlign: 'right',
                        verticalAlign: 'center'
                    }}>
                        <input type={"checkbox"} checked={conf.hidden}
                               onChange={(e) => {
                                   const value = e.target.checked;
                                   setConfig(old => {
                                       const clone = {...old};
                                       clone[col] = {...clone[col]}
                                       clone[col].hidden = value
                                       return clone;
                                   })
                               }}/>
                    </div>
                    <div style={{display: 'table-cell'}}>
                        <input style={{
                            border: BORDER,
                            borderRight: 'unset',
                            borderBottom: isLastIndex ? BORDER : 'unset',
                            borderRadius: 0,
                            padding: '0px 5px',
                            width: 70
                        }}
                               value={(conf.width ?? '').toString()}
                               onChange={(e) => {
                                   const value = e.target.value;
                                   const isPercentageOrPixel = value.endsWith('%') || value.endsWith('px') || value.endsWith('p');
                                   const intValue = parseInt(value);

                                   setConfig(old => {
                                       const clone = {...old};
                                       clone[col] = {...clone[col]}
                                       if (isPercentageOrPixel || isNaN(intValue)) {
                                           clone[col].width = value
                                       } else {
                                           clone[col].width = intValue
                                       }

                                       return clone;
                                   })
                               }}
                        />
                    </div>
                    <div style={{display: 'table-cell', verticalAlign: 'middle'}}>
                        <PageInputSelector style={{
                            borderRadius: 0,
                            height: 23,
                            padding: '0px 5px',
                            borderRight: 'unset',
                            borderBottom: isLastIndex ? BORDER : 'unset',
                        }}
                                           chipColor={'rgba(0,0,0,0)'}
                                           onChange={(value) => {
                                               setConfig(old => {
                                                   const clone = {...old};
                                                   clone[col] = {...clone[col]}
                                                   clone[col].rendererPageId = value
                                                   return clone;
                                               })
                                           }}
                                           value={conf.rendererPageId}
                                           bindWithMapper={true}
                                           mapperInputSchema={composeMapperInputSchema(columns)}
                                           mapperValue={conf.rendererPageDataMapperFormula}
                                           mapperValueChange={(value) => {
                                               setConfig(old => {
                                                   const clone = {...old};
                                                   clone[col] = {...clone[col]}
                                                   clone[col].rendererPageDataMapperFormula = value
                                                   return clone;
                                               })
                                           }}
                        />
                    </div>

                    <div style={{display: 'table-cell'}}>
                        <input style={{
                            border: BORDER,
                            borderRadius: 0,
                            padding: '0px 5px',
                            borderBottom: isLastIndex ? BORDER : 'unset'
                        }}
                               value={conf?.title}
                               onChange={(e) => {
                                   const value = e.target.value;
                                   setConfig(old => {
                                       const clone = {...old};
                                       clone[col] = {...clone[col]}
                                       clone[col].title = value;
                                       return clone;
                                   })
                               }}
                        />
                    </div>
                </div>
            })}

        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 5,
            position: 'sticky',
            bottom: 0,
            background: 'white',
            padding: 10
        }}>
            <Button onClick={() => {
                // here we need to save this convert to formula
                const formula = `module.exports = ${JSON.stringify(config, null, 2)};`;
                closePanel(formula);
            }}>Save</Button>
            <Button onClick={() => props.closePanel()}>Cancel</Button>
        </div>
    </div>
}

type ThreeState = 'yes' | 'no' | 'partial';

function InputThreeStateCheckbox(props: {
    value: ThreeState,
    onChange: (param: ThreeState) => void,
    style: CSSProperties
}) {
    const {value, onChange, style} = props;
    const [val, setVal] = useState<ThreeState>(value);

    function onClick() {
        if (val === 'yes') {
            setVal('no');
            onChange('no');
        }
        if (val === 'no') {
            setVal('yes');
            onChange('yes');
        }
        if (val === 'partial') {
            setVal('no');
            onChange('no');
        }
    }

    useEffect(() => {
        setVal(value);
    }, [value]);
    let Component = IoMdCheckbox;
    if (val === 'yes') {
        Component = IoMdCheckbox
    }
    if (val === 'no') {
        Component = MdOutlineCheckBoxOutlineBlank
    }
    if (val === 'partial') {
        Component = MdOutlineCheckBox;
    }
    return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', ...style}} onClick={onClick}>
        <Component/>
    </div>
}

function composeMapperInputSchema(columns?: string[]) {
    columns = columns ?? [];
    return `{${columns.map(c => `${c} ?: number | string | Uint8Array | null `).join(',')}}`
}