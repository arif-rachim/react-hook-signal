import type {DragEvent as ReactDragEvent, FC as ReactFC, MouseEvent as ReactMouseEvent} from "react";
import {
    ButtonHTMLAttributes,
    createContext,
    CSSProperties,
    HTMLAttributes,
    PropsWithChildren,
    ReactNode,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState
} from "react";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {
    MdAdd,
    MdArrowUpward,
    MdCancel,
    MdCheck,
    MdDataArray,
    MdDataObject,
    MdDesignServices,
    MdDragIndicator,
    MdHorizontalDistribute,
    MdPreview,
    MdVerticalDistribute
} from "react-icons/md";
import {PiTrafficSignal, PiWebhooksLogo} from "react-icons/pi";
import {LuSigmaSquare} from "react-icons/lu";

import {TiSortNumerically} from "react-icons/ti";
import {AiOutlineFieldString} from "react-icons/ai";
import {TbToggleLeftFilled} from "react-icons/tb";
import {IoMenuOutline, IoTrashOutline} from "react-icons/io5";


import {guid} from "../utils/guid.ts";
import {useRefresh} from "../utils/useRefresh.ts";
import {useShowModal} from "../modal/useShowModal.ts";
import {Editor, Monaco} from "@monaco-editor/react";
import {IconType} from "react-icons";
import {BORDER, BORDER_NONE} from "./Border.ts";
import {isEmpty} from "../utils/isEmpty.ts";

const Icon = {
    State: PiTrafficSignal,
    Computed: LuSigmaSquare,
    Effect: PiWebhooksLogo,
    Delete: IoTrashOutline,
    Detail: IoMenuOutline,
    Number: TiSortNumerically,
    String: AiOutlineFieldString,
    Boolean: TbToggleLeftFilled,
    Record: MdDataObject,
    Array: MdDataArray,
    Checked: MdCheck
}

export type Variable = {
    type: 'state' | 'computed' | 'effect',
    id: string,
    name: string,
    functionCode: string,
    value?: unknown, // this is only for state
    dependency?: Array<string> // this is only for computed and effect
}

export type Container = {
    id: string,
    children: string[],
    parent: string
    type: 'horizontal' | 'vertical' | string,
    width: CSSProperties['width'],
    height: CSSProperties['height'],
    minWidth: CSSProperties['minWidth'],
    minHeight: CSSProperties['minHeight'],

    gap: CSSProperties['gap'],

    paddingTop: CSSProperties['paddingTop'],
    paddingRight: CSSProperties['paddingRight'],
    paddingBottom: CSSProperties['paddingBottom'],
    paddingLeft: CSSProperties['paddingLeft'],

    marginTop: CSSProperties['marginTop'],
    marginRight: CSSProperties['marginRight'],
    marginBottom: CSSProperties['marginBottom'],
    marginLeft: CSSProperties['marginLeft'],
    properties: Record<string, { formula: string, type: ValueCallbackType }>
}

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

const FEATHER = 5;
const dropZones: Array<{
    id: string,
    precedingSiblingId: string,
    parentContainerId: string
}> = [];

type ValueCallbackType = 'value' | 'callback';

type LayoutBuilderProps = {
    elements: Record<string, {
        icon: IconType,
        component: ReactFC,
        property: Record<string, ValueCallbackType>
    }>,
    value: { containers: Array<Container>, variables: Array<Variable> },
    onChange: (param: { containers: Array<Container>, variables: Array<Variable> }) => void
}

const AppDesignerContext = createContext<{
    activeDropZoneIdSignal: Signal.State<string>,
    selectedDragContainerIdSignal: Signal.State<string>,
    hoveredDragContainerIdSignal: Signal.State<string>,
    allContainersSignal: Signal.State<Array<Container>>,
    allVariablesSignal: Signal.State<Array<Variable>>,
    uiDisplayModeSignal: Signal.State<'design' | 'view'>
} & Pick<LayoutBuilderProps, 'elements'>>({
    activeDropZoneIdSignal: new Signal.State<string>(''),
    selectedDragContainerIdSignal: new Signal.State<string>(''),
    hoveredDragContainerIdSignal: new Signal.State<string>(''),
    uiDisplayModeSignal: new Signal.State<"design" | "view">('design'),
    allContainersSignal: new Signal.State<Array<Container>>([]),
    allVariablesSignal: new Signal.State<Array<Variable>>([]),
    elements: {},
})

function RightPanel() {
    const {
        selectedDragContainerIdSignal,
        allContainersSignal,
        hoveredDragContainerIdSignal,
        uiDisplayModeSignal,
        activeDropZoneIdSignal,
        allVariablesSignal,
        elements
    } = useContext(AppDesignerContext);
    const showModal = useShowModal();
    const propertyEditors = useComputed(() => {
        const selectedDragContainerId = selectedDragContainerIdSignal.get();
        const selectedDragContainer = allContainersSignal.get().find(i => i.id === selectedDragContainerId);
        const elementName = selectedDragContainer?.type;
        const result: Array<ReactNode> = [];
        result.push(<div style={{display: 'flex', flexDirection: 'row', gap: 10}} key={'height-width'}>
            <NumericalPercentagePropertyEditor property={'height'} label={'Height'} key={'height-editor'}
                                               style={{width: '50%'}} styleLabel={{width: 30}}/>
            <NumericalPercentagePropertyEditor property={'width'} label={'Width'} key={'width-editor'}
                                               style={{width: '50%'}} styleLabel={{width: 30}}/>
        </div>);
        result.push(<LabelContainer label={'Padding'} style={{marginTop: 10}} styleLabel={{width: 54, flexShrink: 0}}
                                    key={'padding-editor'}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <NumericalPercentagePropertyEditor property={'paddingTop'} label={'pT'} key={'padding-top'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                </div>
                <div style={{display: 'flex'}}>
                    <NumericalPercentagePropertyEditor property={'paddingLeft'} label={'pL'} key={'padding-left'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                    <div style={{flexGrow: 1}}></div>
                    <NumericalPercentagePropertyEditor property={'paddingRight'} label={'pR'} key={'padding-right'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <NumericalPercentagePropertyEditor property={'paddingBottom'} label={'pB'}
                                                       key={'padding-bottom'} style={{width: '33.33%'}}
                                                       styleLabel={{display: 'none'}}/>
                </div>
            </div>
        </LabelContainer>)
        result.push(<LabelContainer label={'Margin'} style={{marginTop: 10}} styleLabel={{width: 54, flexShrink: 0}}
                                    key={'margin-editor'}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <NumericalPercentagePropertyEditor property={'marginTop'} label={'mT'} key={'margin-top'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                </div>
                <div style={{display: 'flex'}}>
                    <NumericalPercentagePropertyEditor property={'marginLeft'} label={'mL'} key={'margin-left'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                    <div style={{flexGrow: 1}}></div>
                    <NumericalPercentagePropertyEditor property={'marginRight'} label={'mR'} key={'margin-right'}
                                                       style={{width: '33.33%'}} styleLabel={{display: 'none'}}/>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <NumericalPercentagePropertyEditor property={'marginBottom'} label={'mB'}
                                                       key={'margin-bottom'} style={{width: '33.33%'}}
                                                       styleLabel={{display: 'none'}}/>
                </div>
            </div>
        </LabelContainer>)

        if (elementName && elementName in elements) {
            const element = elements[elementName];
            const property = element.property;
            result.push(<div key={'prop-editor'}
                             style={{display: 'flex', flexDirection: 'column', gap: 5, marginTop: 5}}>
                {Object.keys(property).map(propertyName => {
                    const type = property[propertyName];
                    return <LabelContainer key={propertyName} label={propertyName}
                                           style={{flexDirection: 'row', alignItems: 'center'}}
                                           styleLabel={{width: 65, fontSize: 13}}>
                        <Button style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22
                        }} onClick={async () => {
                            const result = await showModal(closePanel => {
                                return <AppDesignerContext.Provider
                                    value={{
                                        hoveredDragContainerIdSignal: hoveredDragContainerIdSignal,
                                        selectedDragContainerIdSignal: selectedDragContainerIdSignal,
                                        activeDropZoneIdSignal: activeDropZoneIdSignal,
                                        uiDisplayModeSignal: uiDisplayModeSignal,
                                        allContainersSignal: allContainersSignal,
                                        allVariablesSignal: allVariablesSignal,
                                        elements: elements
                                    }}><ComponentPropertyEditor closePanel={closePanel} name={propertyName}
                                                                type={property[propertyName]}/>
                                </AppDesignerContext.Provider>
                            });
                            console.log('WE HAVE RESULT ', result);
                        }}>
                            {type === 'callback' && <Icon.Effect/>}
                            {type === 'value' && <Icon.Computed/>}
                        </Button>
                    </LabelContainer>
                })}
            </div>);
        }
        return result
    })
    return <notifiable.div
        style={{
            width: 200,
            padding: 5,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderLeft: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column'
        }}>
        {propertyEditors}
    </notifiable.div>;
}

function LeftPanel() {
    const {elements} = useContext(AppDesignerContext);
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: 200,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRight: '1px solid rgba(0,0,0,0.1)'
    }}>
        <div
            style={{
                padding: 20,
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start'
            }}>
            <DraggableItem icon={MdVerticalDistribute} draggableDataType={'vertical'}/>
            <DraggableItem icon={MdHorizontalDistribute} draggableDataType={'horizontal'}/>
            {
                Object.keys(elements).map((key) => {
                    const Icon = elements[key].icon;
                    return <DraggableItem icon={Icon} draggableDataType={key} key={key}/>
                })
            }
        </div>
        <VariablesPanel/>
    </div>
}

function VariableEditorPanel(props: { variable?: Variable, closePanel: (result?: Variable) => void }) {
    const {variable, closePanel} = props;
    const [type, setType] = useState<'state' | 'computed' | 'effect'>(variable?.type ?? 'state');
    const showModal = useShowModal();
    const context = useContext(AppDesignerContext);
    const {allVariablesSignal} = context;

    function createNewVariable(): Variable {
        return {
            value: undefined,
            name: '',
            type: 'state',
            id: guid(),
            dependency: [],
            functionCode: ''
        }
    }

    const variableSignal = useSignal(variable ?? createNewVariable());
    useSignalEffect(() => {
        const type = variableSignal.get().type;
        setType(type);
    })

    async function showDependencySelector() {
        const result = await showModal<Array<string> | 'cancel'>(closePanel => {
            return <AppDesignerContext.Provider value={context}>
                <DependencySelector
                    closePanel={closePanel}
                    value={variableSignal.get().dependency ?? []}
                    signalsToFilterOut={[variableSignal.get().id]}
                />
            </AppDesignerContext.Provider>
        });
        if (result !== 'cancel') {
            const newVariable = {...variableSignal.get()};
            newVariable.dependency = result;
            variableSignal.set(newVariable)
        }

    }
    function validateForm():[boolean,Partial<Record<keyof Variable, Array<string>>>]{
        const errors:Partial<Record<keyof Variable, Array<string>>> = {};
        const variable =  variableSignal.get();
        if(isEmpty(variable.name)){
            errors.name = ['Name must have value'];
        }
        if(isEmpty(variable.functionCode)){
            errors.functionCode = ['Code cannot be empty'];
        }
        if(monacoRef.current){
            const markers = monacoRef.current?.editor.getModelMarkers({});
            if(markers && markers.length){
                errors.functionCode = markers.map(m => m.message);
            }
        }
        const valid = Object.keys(errors).length === 0;
        return [valid,errors];
    }
    const monacoRef = useRef<Monaco|undefined>();
    return <div style={{
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        width: 800,
        height: 600,
        gap: 10,
        overflow: 'auto'
    }}>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <Button style={{
                backgroundColor: type === 'state' ? '#000' : '#CCC',
                color: type === 'state' ? 'white' : 'black',
                padding: 3,
                borderTopRightRadius:0,
                borderBottomRightRadius:0,
            }} onClick={() => {
                variableSignal.set({...variableSignal.get(), type: 'state'})
            }}>State
            </Button>
            <Button style={{
                borderLeft: 'none',
                borderRight: 'none',
                backgroundColor: type === 'computed' ? '#000' : '#CCC',
                color: type === 'computed' ? 'white' : 'black',
                padding: 3,
                borderRadius:0,
            }}
                    onClick={() => {
                        variableSignal.set({...variableSignal.get(), type: 'computed'})
                    }}
            >Computed
            </Button>
            <Button style={{
                backgroundColor: type === 'effect' ? '#000' : '#CCC',
                color: type === 'effect' ? 'white' : 'black',
                padding: 3,
                borderTopLeftRadius:0,
                borderBottomLeftRadius:0,
            }} onClick={() => {
                variableSignal.set({...variableSignal.get(), type: 'effect'})
            }}>Effect
            </Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto', gap: 5}}>
            <LabelContainer label={'Name'} style={{flexDirection: 'row', gap: 10}} styleLabel={{width: 80}}>
                <notifiable.input name={'signalName'} autoComplete={'unset'}
                                  style={{border: BORDER, flexGrow: 1, padding: '3px 5px'}} value={() => {
                    return variableSignal.get().name
                }}
                                  onKeyDown={(e) => {
                                      if (e.key === " ") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                      }
                                  }}
                                  onChange={(event) => {
                                      const dom = event.target;
                                      const cursorPosition = dom.selectionStart;
                                      const val = dom.value;
                                      const newVariable = {...variableSignal.get()};
                                      newVariable.name = val;
                                      variableSignal.set(newVariable);
                                      setTimeout(() => {
                                          dom.setSelectionRange(cursorPosition, cursorPosition);
                                      }, 0);
                                  }}/>
            </LabelContainer>
            {type !== 'state' &&
                <LabelContainer label={'Dependency'} style={{flexDirection: 'row', gap: 10}} styleLabel={{width: 80}}>
                    <notifiable.div
                        style={{border: BORDER, display: 'flex', gap: 5, padding: 5, flexGrow: 1, minHeight: 22}}
                        onClick={showDependencySelector}>{() => {
                        const dependencies = variableSignal.get().dependency ?? []
                        const allVariables = allVariablesSignal.get();
                        return dependencies.map(dep => {
                            const variable = allVariables.find(i => i.id === dep);
                            return <div key={dep} style={{border: BORDER, borderRadius: 3, padding: '3px 5px'}}>
                                {variable?.name}
                            </div>
                        })
                    }}</notifiable.div>
                </LabelContainer>
            }
            <LabelContainer label={'Code'} style={{flexGrow: 1}} styleContent={{flexDirection: 'column'}}>

                <notifiable.div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'auto',
                    backgroundColor: 'blue'
                }}>
                    {() => {
                        const variable = variableSignal.get();
                        const dependencies = variable.dependency ?? []
                        const allVariables = allVariablesSignal.get();
                        const formula = variable.functionCode;
                        return <Editor
                            language="javascript"
                            onMount={(_,monaco:Monaco) => monacoRef.current = monaco}
                            key={dependencies.join('-')}
                            beforeMount={onBeforeMountHandler({dependencies,allVariables})}
                            value={formula}
                            options={{selectOnLineNumbers: true}}
                            onChange={(value?: string) => {
                                const newVariable = {...variableSignal.get()};
                                newVariable.functionCode = value ?? '';
                                variableSignal.set(newVariable);
                            }}
                        />
                    }}
                </notifiable.div>
            </LabelContainer>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: 10}}>
            <Button onClick={async () => {
                const [isValid,errors] = validateForm();
                if(isValid) {
                    closePanel(variableSignal.get());
                }else {
                    await showModal<string>(cp => {
                        const message = (Object.keys(errors) as Array<keyof Variable>).map(k => {
                            return errors[k]?.map(val => {
                                return <div key={val}>{(val ?? '') as string}</div>
                            })
                        }).flat();
                        return <ConfirmationDialog message={message} closePanel={cp} buttons={['Ok']}/>
                    })
                }
            }} style={{border: BORDER}}>Save
            </Button>
            <Button onClick={() => {
                closePanel();
            }} style={{border: BORDER}}>Cancel
            </Button>
        </div>
    </div>
}

const onBeforeMountHandler = (props:{allVariables:Array<Variable>,dependencies:Array<string>}) => (monaco: Monaco) => {
    const {allVariables,dependencies} = props;
    const composedLibrary = allVariables.filter(i => dependencies.includes(i.id)).map(i => {
        let type = 'Signal.State<any>';
        if (i.type === 'computed') {
            type = 'Signal.Computed<any>'
        }
        return `declare const ${i.name}:${type}`
    }).join('\n');
    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
    });

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2015,
        allowNonTsExtensions: true,
    });
    // extra libraries
    monaco.languages.typescript.javascriptDefaults.addExtraLib(signalSource, "ts:filename/signal.d.ts");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(composedLibrary, "ts:filename/local-source.d.ts");
}

function DependencySelector(props: { closePanel: (param: Array<string> | 'cancel') => void, value: Array<string>,signalsToFilterOut:Array<string> }) {
    const {closePanel,signalsToFilterOut} = props;
    const {allVariablesSignal} = useContext(AppDesignerContext);
    const selectedSignal = useSignal<Array<string>>(props.value);
    const elements = useComputed(() => {
        const variables = allVariablesSignal.get();
        const selected = selectedSignal.get();
        return variables.filter(i => {
            if(signalsToFilterOut.includes(i.id)){
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
    return <div style={{display: 'flex', flexDirection: 'column', padding: 10, gap: 10}}>
        <div style={{fontSize: 18}}>State or Computed to Refer</div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
            {elements}
        </notifiable.div>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 10}}>
            <Button style={{border: BORDER}} onClick={() => closePanel(selectedSignal.get())}>Save</Button>
            <Button style={{border: BORDER}} onClick={() => closePanel('cancel')}>Cancel</Button>
        </div>
    </div>
}

function VariablesPanel() {
    const context = useContext(AppDesignerContext);
    const {allVariablesSignal} = context;
    const showModal = useShowModal();

    async function editVariable(variable?: Variable) {
        const result = await showModal<Variable>(closePanel => {
            return <AppDesignerContext.Provider value={context}>
                <VariableEditorPanel variable={variable} closePanel={closePanel}/>
            </AppDesignerContext.Provider>
        })
        if (result) {
            const variables = [...allVariablesSignal.get()];
            const indexOfVariable = variables.findIndex(i => i.id === result.id);
            if (indexOfVariable >= 0) {
                variables.splice(indexOfVariable, 1, result);
            } else {
                variables.push(result);
            }
            allVariablesSignal.set(variables);
        }
    }

    async function deleteVariable(variable?: Variable) {
        const deleteVariableConfirm = await showModal<string>(closePanel => {
            return <ConfirmationDialog message={'Are you sure you want to delete this variable ?'} closePanel={closePanel}/>
        })
        if (deleteVariableConfirm === 'Yes') {
            const variables = allVariablesSignal.get().filter(i => i.id !== variable?.id);
            allVariablesSignal.set(variables);
        }
    }

    const variableList = useComputed(() => {
        return allVariablesSignal.get().sort(sortSignal).map((variable) => {
            return <LabelContainer label={variable.name} key={variable.id} style={{
                flexDirection: 'row',
                backgroundColor: 'rgba(0,0,0,0.02)',
                borderBottom: BORDER,
                alignItems: 'center'
            }} styleOnHovered={{backgroundColor: 'rgba(0,0,0,0.1)'}} styleContent={{justifyContent: 'flex-end'}}
                                   styleLabel={{overflow: 'hidden', textOverflow: 'ellipsis'}}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: BORDER,
                    padding: '5px'
                }}>
                    {variable.type === 'effect' && <Icon.Effect/>}
                    {variable.type === 'computed' && <Icon.Computed/>}
                    {variable.type === 'state' && <Icon.State/>}
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRight: BORDER,
                    padding: '5px'
                }} onClick={() => deleteVariable(variable)}>
                    <Icon.Delete/>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '5px'
                }} onClick={() => editVariable(variable)}>
                    <Icon.Detail/>
                </div>
            </LabelContainer>
        })
    })
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        backgroundColor: 'rgba(255,255,255,0.9)',
        height: '100%'
    }}>
        <div style={{display: 'flex'}}>
            <input type={'search'} style={{flexGrow: 1, border: BORDER, minWidth: 0, width: 100, flexShrink: 1}}/>
            <div style={{display: 'flex', border: BORDER, borderLeft: 'none', alignItems: 'center', cursor: 'pointer'}}
                 onClick={() => editVariable()}>
                <div style={{marginLeft: 5}}>Add</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <MdAdd style={{fontSize: 22}}/>
                </div>
            </div>
        </div>
        <notifiable.div style={{display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
            {variableList}
        </notifiable.div>
    </div>
}

function sortSignal(a: Variable, b: Variable) {
    const priority = {state: 'a', computed: 'b', effect: 'c'}
    return `${priority[a.type]}-${a.name}`.localeCompare(`${priority[b.type]}-${b.name}`)
}

function ToggleViewToolbar() {
    const {uiDisplayModeSignal} = useContext(AppDesignerContext);
    return <div style={{display: 'flex', justifyContent: 'center', gap: 10, padding: 10}}>
        <ButtonWithIcon icon={MdPreview} onClick={() => uiDisplayModeSignal.set('view')}/>
        <ButtonWithIcon icon={MdDesignServices} onClick={() => uiDisplayModeSignal.set('design')}/>
    </div>;
}

export default function AppDesigner(props: LayoutBuilderProps) {
    const activeDropZoneIdSignal = useSignal('');
    const selectedDragContainerIdSignal = useSignal('');
    const hoveredDragContainerIdSignal = useSignal('');
    const uiDisplayModeSignal = useSignal<'design' | 'view'>('design');
    const allVariablesSignal = useSignal<Array<Variable>>([]);
    const allContainersSignal = useSignal<Array<Container>>([{
        id: guid(),
        type: 'vertical',
        gap: 0,
        children: [],
        parent: '',
        height: '',
        width: '',
        minWidth: '100px',
        minHeight: '100px',

        marginTop: '',
        marginRight: '',
        marginBottom: '',
        marginLeft: '',

        paddingTop: '',
        paddingRight: '',
        paddingBottom: '',
        paddingLeft: '',
        properties: {}

    }]);
    const {value, onChange} = props;
    useEffect(() => {
        if (value && value.containers && value.containers.length > 0) {
            allContainersSignal.set(value.containers);
        }
        if (value && value.variables && value.variables.length > 0) {
            allVariablesSignal.set(value.variables);
        }
    }, [allContainersSignal, allVariablesSignal, value]);

    useSignalEffect(() => {
        onChange({
            containers: allContainersSignal.get(),
            variables: allVariablesSignal.get()
        });
    })

    const renderedElements = useComputed(() => {
        const container = allContainersSignal.get().find(item => item.parent === '');
        if (container) {
            return <DraggableContainer allContainersSignal={allContainersSignal} container={container}/>
        }
        return <></>
    });


    return <AppDesignerContext.Provider
        value={{
            hoveredDragContainerIdSignal: hoveredDragContainerIdSignal,
            selectedDragContainerIdSignal: selectedDragContainerIdSignal,
            activeDropZoneIdSignal: activeDropZoneIdSignal,
            uiDisplayModeSignal: uiDisplayModeSignal,
            allContainersSignal: allContainersSignal,
            allVariablesSignal: allVariablesSignal,
            elements: props.elements
        }}>

        <div style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
            <LeftPanel/>
            <div style={{flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
                <ToggleViewToolbar/>
                <notifiable.div style={{flexGrow: 1}}>
                    {renderedElements}
                </notifiable.div>
            </div>
            <RightPanel/>
        </div>

    </AppDesignerContext.Provider>
}


function DraggableItem(props: { draggableDataType: string, icon: IconType }) {
    const Icon = props.icon;
    const {activeDropZoneIdSignal} = useContext(AppDesignerContext);
    return <ButtonWithIcon onDragStart={(e) => e.dataTransfer.setData('text/plain', props.draggableDataType)}
                           draggable={true} onDragEnd={() => activeDropZoneIdSignal.set('')} icon={Icon}/>

}

function swapContainerLocation(allContainersSignal: Signal.State<Array<Container>>, containerToBeSwapped: string, activeDropZoneIdSignal: Signal.State<string>) {
    const activeDropZoneId = activeDropZoneIdSignal.get();
    const dropZoneElement = document.getElementById(activeDropZoneId);
    if (dropZoneElement === null) {
        return;
    }
    const {precedingSiblingId, parentContainerId} = dropZones.find(s => s.id === activeDropZoneId)!;
    const allContainers = [...allContainersSignal.get()];
    const targetContainerIndex = allContainers.findIndex(i => i.id === containerToBeSwapped)!;
    const targetContainer = allContainers[targetContainerIndex];
    const currentParentContainerIndex = allContainers.findIndex(i => i.id === targetContainer.parent)!;
    const currentParentContainer = allContainers[currentParentContainerIndex];
    const newParentContainerIndex = allContainers.findIndex(i => i.id === parentContainerId)!;
    const newParentContainer = allContainers[newParentContainerIndex];

    // here we remove the parent children position
    currentParentContainer.children = currentParentContainer.children.filter(s => s !== targetContainer.id);
    // now we have new parent
    targetContainer.parent = parentContainerId;
    const placeAfterIndex = newParentContainer.children.indexOf(precedingSiblingId);

    if (placeAfterIndex >= 0) {
        newParentContainer.children.splice(placeAfterIndex + 1, 0, containerToBeSwapped);
        newParentContainer.children = [...newParentContainer.children];
    } else {
        newParentContainer.children.unshift(containerToBeSwapped);
    }

    allContainers.splice(targetContainerIndex, 1, {...targetContainer});
    allContainers.splice(currentParentContainerIndex, 1, {...currentParentContainer});
    allContainers.splice(newParentContainerIndex, 1, {...newParentContainer});

    allContainersSignal.set(allContainers);
    activeDropZoneIdSignal.set('');
}

function getContainerIdAndIndexToPlaced(allContainersSignal: Signal.State<Array<Container>>, dropZoneId: Signal.State<string>) {
    const dropZoneElementId = dropZoneId.get();
    const dropZoneElement = document.getElementById(dropZoneElementId);
    if (dropZoneElement === null) {
        return {parentContainerId: '', insertionIndex: 0};
    }
    const {parentContainerId, precedingSiblingId} = dropZones.find(s => s.id === dropZoneElementId)!;
    const container = allContainersSignal.get().find(i => i.id === parentContainerId);
    const insertionIndex = container?.children.indexOf(precedingSiblingId ?? '') ?? 0;
    return {parentContainerId, insertionIndex};
}

function useSelectedDragContainer() {
    const {selectedDragContainerIdSignal, allContainersSignal} = useContext(AppDesignerContext);
    return useComputed(() => {
        const selectedDragContainerId = selectedDragContainerIdSignal.get();
        return allContainersSignal.get().find(i => i.id === selectedDragContainerId);
    })
}

function useUpdateSelectedDragContainer() {
    const {selectedDragContainerIdSignal, allContainersSignal} = useContext(AppDesignerContext);

    return function update(callback: (selectedContainer: Container) => void) {
        const allContainers = [...allContainersSignal.get()];
        const currentSignalIndex = allContainers.findIndex(i => i.id === selectedDragContainerIdSignal.get());
        const container = {...allContainers[currentSignalIndex]};
        callback(container);
        allContainers.splice(currentSignalIndex, 1, container);
        allContainersSignal.set(allContainers);
    }
}

function addNewContainer(allContainersSignal: Signal.State<Array<Container>>, config: {
    type: 'vertical' | 'horizontal' | string
}, dropZoneId: Signal.State<string>) {
    const {parentContainerId, insertionIndex} = getContainerIdAndIndexToPlaced(allContainersSignal, dropZoneId);
    const newContainer: Container = {
        id: guid(),
        type: config.type,
        gap: 0,
        children: [],
        parent: parentContainerId,
        width: '',
        height: '',
        minWidth: '24px',
        minHeight: '24px',

        paddingTop: '',
        paddingRight: '',
        paddingBottom: '',
        paddingLeft: '',

        marginTop: '',
        marginRight: '',
        marginBottom: '',
        marginLeft: '',
        properties: {}
    }

    const newAllContainers = [...allContainersSignal.get().map(n => {
        if (n.id === parentContainerId) {
            if (insertionIndex >= 0) {
                const newChildren = [...n.children]
                newChildren.splice(insertionIndex + 1, 0, newContainer.id);
                return {...n, children: newChildren}
            } else {
                return {...n, children: [newContainer.id, ...n.children]}
            }
        }
        return n;
    }), newContainer];
    allContainersSignal.set(newAllContainers);
}

function DraggableContainer(props: {
    allContainersSignal: Signal.State<Array<Container>>,
    container: Container
}) {
    const {container: contanerProp, allContainersSignal} = props;
    const containerSignal = useSignal(contanerProp);
    useEffect(() => {
        containerSignal.set(contanerProp);
    }, [containerSignal, contanerProp]);
    const {
        elements: elementsLib,
        activeDropZoneIdSignal,
        hoveredDragContainerIdSignal,
        selectedDragContainerIdSignal,
        uiDisplayModeSignal
    } = useContext(AppDesignerContext);
    const {refresh} = useRefresh('DraggableContainer');
    useSignalEffect(() => {
        uiDisplayModeSignal.get();
        refresh();
    })
    const mousePosition = useSignal<{
        clientX?: number,
        clientY?: number
    }>({clientX: 0, clientY: 0})

    function onDragStart(event: ReactDragEvent) {
        event.stopPropagation();
        event.dataTransfer.setData('text/plain', containerSignal.get().id);
    }

    function onDragOver(event: ReactDragEvent) {
        event.preventDefault();
        event.stopPropagation();

        mousePosition.set(event);
    }

    function onMouseOver(event: ReactMouseEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();
        hoveredDragContainerIdSignal.set(containerSignal.get().id);
    }

    useSignalEffect(() => {
        const {clientX: mouseX, clientY: mouseY} = mousePosition.get();
        const container: Container | undefined = containerSignal.get();
        if (mouseX === undefined || mouseY === undefined || mouseX <= 0 || mouseY <= 0) {
            return;
        }
        let nearestDropZoneId = '';
        // const elementsSize:Record<string, DOMRect> = {};
        for (const dropZone of dropZones) {
            const dropZoneElement = document.getElementById(dropZone.id);
            const rect = dropZoneElement?.getBoundingClientRect();
            if (rect === undefined) {
                continue;
            }

            if (mouseX >= (rect.left - FEATHER) && mouseX <= (rect.right + FEATHER) && mouseY >= (rect.top - FEATHER) && mouseY <= (rect.bottom + FEATHER)) {
                nearestDropZoneId = dropZone.id;
            }
        }
        if (nearestDropZoneId === '') {
            const nearestDropZone = {distance: Number.MAX_VALUE, dropZoneId: ''}
            for (const dropZone of dropZones) {
                if (dropZone.parentContainerId === container?.id) {
                    // nice !
                    const rect = document.getElementById(dropZone.id)?.getBoundingClientRect();
                    if (rect === undefined) {
                        continue;
                    }
                    const distanceX = Math.abs(mouseX - (rect.left + (rect.width / 2)));
                    const distanceY = Math.abs(mouseY - (rect.top + (rect.height / 2)));
                    const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
                    if (distance < nearestDropZone.distance) {
                        nearestDropZone.distance = distance;
                        nearestDropZone.dropZoneId = dropZone.id;
                    }
                }
            }
            nearestDropZoneId = nearestDropZone.dropZoneId;
        }
        activeDropZoneIdSignal.set(nearestDropZoneId);
    })

    function onDrop(event: ReactDragEvent) {
        event.stopPropagation();
        event.preventDefault();
        const id = event.dataTransfer.getData('text');
        const keys = Object.keys(elementsLib);
        if (id === VERTICAL || id === HORIZONTAL || keys.indexOf(id) >= 0) {
            addNewContainer(allContainersSignal, {type: id}, activeDropZoneIdSignal);
        } else if (id) {
            swapContainerLocation(allContainersSignal, id, activeDropZoneIdSignal);
        }
    }

    function onDragEnd() {
        activeDropZoneIdSignal.set('')
    }

    function onSelected(event: ReactMouseEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();
        selectedDragContainerIdSignal.set(containerSignal.get().id);
    }

    function onFocusUp() {
        if (containerSignal.get().parent) {
            selectedDragContainerIdSignal.set(containerSignal.get().parent);
        }
    }

    function onDelete() {
        let allContainers = allContainersSignal.get();
        allContainers = allContainers.filter(s => s.id !== containerSignal.get().id);
        const parent = allContainers.find(s => s.id === containerSignal.get().parent);
        if (parent) {
            const newParent = {...parent};
            newParent.children = newParent.children.filter(s => s !== containerSignal.get().id);
            allContainers.splice(allContainers.indexOf(parent), 1, newParent);
        }
        allContainersSignal.set(allContainers);
    }

    const elements = useComputed(() => {
        const mode = uiDisplayModeSignal.get();
        const container: Container | undefined = containerSignal.get();
        const children = container?.children ?? [];

        const isContainer = container?.type === 'vertical' || container?.type === 'horizontal'
        const result: Array<ReactNode> = [];
        if (mode === 'design') {
            result.push(<ToolBar key={`toolbar-${container?.id}`} container={container} onFocusUp={onFocusUp}
                                 onDelete={onDelete}/>)
        }
        if (isContainer) {
            if (mode === 'design') {
                result.push(<DropZone precedingSiblingId={''} key={`drop-zone-root-${container?.id}`}
                                      parentContainerId={container?.id ?? ''}/>)
            }
            for (let i = 0; i < children?.length; i++) {
                const childId = children[i];
                const childContainer = allContainersSignal.get().find(i => i.id === childId)!;
                result.push(<DraggableContainer allContainersSignal={allContainersSignal} container={childContainer}
                                                key={childId}/>)
                if (mode === 'design') {
                    result.push(<DropZone precedingSiblingId={childId} key={`drop-zone-${i}-${container?.id}`}
                                          parentContainerId={container?.id ?? ''}/>);
                }
            }
        } else if (elementsLib[container?.type]) {
            const {component: Component} = elementsLib[container?.type];
            result.push(<Component key={container?.id}/>)
        }
        return result;
    });


    const computedStyle = useComputed((): CSSProperties => {
        const mode = uiDisplayModeSignal.get();
        const container: Container = containerSignal.get();
        const isRoot = container?.parent === '';
        const styleFromSignal = {
            border: mode === 'design' ? '1px dashed rgba(0,0,0,0.1)' : '1px solid rgba(0,0,0,0)',
            background: 'white',
            minWidth: container?.minWidth,
            minHeight: container?.minHeight,

            paddingTop: mode === 'design' && container?.paddingTop === '' ? 5 : container?.paddingTop,
            paddingRight: mode === 'design' && container?.paddingRight === '' ? 5 : container?.paddingRight,
            paddingBottom: mode === 'design' && container?.paddingBottom === '' ? 5 : container?.paddingBottom,
            paddingLeft: mode === 'design' && container?.paddingLeft === '' ? 5 : container?.paddingLeft,

            marginTop: container?.marginTop,
            marginRight: container?.marginRight,
            marginBottom: container?.marginBottom,
            marginLeft: container?.marginLeft,

            display: 'flex',
            flexDirection: container?.type === 'horizontal' ? 'row' : 'column',
            width: isRoot ? '100%' : container?.width,
            height: isRoot ? '100%' : container?.height,
            position: 'relative',

            gap: container?.gap,
        };
        const isFocused = selectedDragContainerIdSignal.get() === container?.id;
        const isHovered = hoveredDragContainerIdSignal.get() === container?.id;
        if (isRoot) {
            return styleFromSignal as CSSProperties
        }
        if (isFocused && mode === 'design') {
            styleFromSignal.border = '1px solid black';
        }

        if (isHovered && mode === 'design') {
            styleFromSignal.background = 'yellow';
        }
        return styleFromSignal as CSSProperties;
    });

    return <notifiable.div draggable={true} style={computedStyle}
                           onDragStart={onDragStart}
                           onDragOver={onDragOver}
                           onDrop={onDrop}
                           onDragEnd={onDragEnd}
                           onMouseOver={onMouseOver}
                           onClick={onSelected} data-container-id={containerSignal.get().id}>
        {elements}
    </notifiable.div>

}

function DropZone(props: {
    precedingSiblingId: string,
    parentContainerId: string
}) {
    const id = useId();
    const {activeDropZoneIdSignal} = useContext(AppDesignerContext)
    useEffect(() => {
        const item = {
            id: id,
            ...props
        }
        dropZones.push(item);
        return () => {
            dropZones.splice(dropZones.indexOf(item), 1);
        }
    }, [id, props]);
    const computedStyle = useComputed(() => {
        const isFocused = id === activeDropZoneIdSignal.get();
        const style: CSSProperties = {
            top: -5,
            left: -5,
            minWidth: 10,
            minHeight: 10,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 10,
            flexGrow: 1,
            position: 'absolute',
            height: `calc(100% + 10px)`,
            width: `calc(100% + 10px)`,
            transition: 'background-color 300ms ease-in-out',
            zIndex: -1
        };
        if (isFocused) {
            style.backgroundColor = `rgba(84, 193, 240, 0.5)`;
            style.zIndex = 1;
        }
        return style;
    })
    const containerStyle: CSSProperties = {
        minWidth: 0,
        minHeight: 0,
        backgroundColor: 'rgba(84,193,240,0.5)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
    };
    return <div style={containerStyle}>
        <notifiable.div id={id} style={computedStyle}></notifiable.div>
    </div>
}

function ToolBar(props: { container: Container, onDelete: () => void, onFocusUp: () => void }) {
    const {container, onDelete, onFocusUp} = props;
    const {selectedDragContainerIdSignal} = useContext(AppDesignerContext);

    function preventClick(event: ReactMouseEvent<HTMLElement>) {
        event.preventDefault();
        event.stopPropagation();
    }

    const computedStyle = useComputed(() => {
        const style = {
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#666',
            position: 'absolute',
            top: -15,
            right: -1,
            color: 'white',
        };
        const isFocused = selectedDragContainerIdSignal.get() === container.id;
        if (isFocused) {
            style.display = 'flex';
        }
        return style as CSSProperties;
    })
    return <notifiable.div style={computedStyle} onClick={preventClick}>
        <MdArrowUpward onClick={onFocusUp}/>
        <MdDragIndicator/>
        <MdCancel onClick={onDelete}/>
    </notifiable.div>
}


function ButtonWithIcon(props: HTMLAttributes<HTMLDivElement> & { icon: IconType }) {
    const {icon: Icon, ...properties} = props;
    return <div
        style={{
            border: '1px solid rgba(0,0,0,0.3)',
            padding: 5,
            borderRadius: 5,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }} {...properties}>
        <Icon/>
    </div>
}

type PropertyType = keyof Pick<Container, 'height' | 'width' | 'paddingTop' | 'paddingLeft' | 'paddingRight' | 'paddingBottom' | 'marginRight' | 'marginTop' | 'marginBottom' | 'marginLeft'>;

function NumericalPercentagePropertyEditor(props: {
    property: PropertyType,
    label: string,
    style?: CSSProperties,
    styleLabel?: CSSProperties
}) {
    const selectedDragContainer = useSelectedDragContainer();
    const updateSelectedDragContainer = useUpdateSelectedDragContainer();
    const typeOfValue = useSignal('n/a');
    const {property, label} = props;
    useSignalEffect(() => {
        const dragContainer = selectedDragContainer.get();
        if (dragContainer === undefined) {
            return;
        }
        const val: string = (dragContainer[property] ?? '') as unknown as string;
        if (val.endsWith('%')) {
            typeOfValue.set('%');
        } else if (val.endsWith('px')) {
            typeOfValue.set('px');
        } else {
            typeOfValue.set('n.a');
        }
    })

    function extractValue() {
        const selectedDragContainerItem = selectedDragContainer.get();
        if (selectedDragContainerItem === undefined) {
            return '';
        }
        const val: string = (selectedDragContainerItem[property] ?? '') as unknown as string;
        if (val.endsWith('%')) {
            return parseInt(val.replace('%', ''))
        }
        if (val.endsWith('px')) {
            return parseInt(val.replace('px', ''))
        }
        return selectedDragContainerItem[property] ?? ''
    }

    return <div style={{display: 'flex', flexDirection: 'row', ...props.style}}>
        <LabelContainer label={label} styleLabel={{width: 100, ...props.styleLabel}}>
            <notifiable.input style={{width: '100%', border: BORDER, borderRight: BORDER_NONE}} value={extractValue}
                              onChange={(e) => {
                                  const val = e.target.value;

                                  updateSelectedDragContainer((selectedContainer) => {
                                      const typeVal = typeOfValue.get();
                                      const isNanValue = isNaN(parseInt(val));

                                      if (typeVal === 'n.a') {
                                          selectedContainer[property] = val;
                                      } else if (typeVal === 'px' && !isNanValue) {
                                          selectedContainer[property] = `${val}${typeOfValue.get()}`;
                                      } else if (typeVal === '%' && !isNanValue) {
                                          selectedContainer[property] = `${val}${typeOfValue.get()}`;
                                      } else {
                                          console.log("Setting value ", val);
                                          selectedContainer[property] = val;
                                      }
                                  })

                              }}/>
            <notifiable.select style={{border: BORDER}} value={typeOfValue} onChange={(e) => {
                const typeValue = e.target.value;
                const value = extractValue();
                updateSelectedDragContainer((selectedContainer) => {
                    if (typeValue !== 'n.a') {
                        selectedContainer[property] = `${value}${typeValue}`
                    } else {
                        selectedContainer[property] = `${value}`
                    }

                })
            }}>
                <option value={'n.a'}></option>
                <option value={'px'}>px</option>
                <option value={'%'}>%</option>
            </notifiable.select>
        </LabelContainer>
    </div>
}

function LabelContainer(props: PropsWithChildren<{
    label: string,
    style?: CSSProperties,
    styleLabel?: CSSProperties,
    styleContent?: CSSProperties,
    styleOnHovered?: CSSProperties
}>) {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    let style = {...props.style};
    if (isHovered) {
        style = {...style, ...props.styleOnHovered}
    }
    return <label style={{display: 'flex', flexDirection: 'column', gap: 0, ...style}}
                  onMouseMove={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <div style={props.styleLabel}>{props.label}</div>
        <div style={{display: 'flex', flexDirection: 'row', flexGrow: 1, ...props.styleContent}}>
            {props.children}
        </div>
    </label>
}


function ComponentPropertyEditor(props: { closePanel: () => void, name: string, type: 'value' | 'callback' }) {
    const selectedDragContainer = useSelectedDragContainer();
    const update = useUpdateSelectedDragContainer();
    const {allVariablesSignal} = useContext(AppDesignerContext);
    return <div style={{backgroundColor: '#FAFAFA', width: 600, height: 800, display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', padding: 10, gap: 10}}>
            <notifiable.div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'auto',
                backgroundColor: 'red'
            }}>
                {() => {
                    const container = selectedDragContainer.get();
                    const allVariables = allVariablesSignal.get();
                    let formula = '';
                    if (container !== undefined) {
                        formula = container.properties[props.name]?.formula ?? ''
                    }
                    return <Editor
                        language="javascript"
                        beforeMount={onBeforeMountHandler({dependencies:[],allVariables})}
                        value={formula}
                        options={{selectOnLineNumbers: true}}
                        onChange={(value?: string) => {
                            update((item: Container) => {
                                const name = props.name;
                                const cloneProps = {...item.properties} as Record<string, {
                                    formula: string,
                                    type: ValueCallbackType
                                }>;
                                cloneProps[name] = {formula: value ?? '', type: props.type}
                                item.properties = cloneProps;
                            })
                        }}
                    />
                }}
            </notifiable.div>
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                <Button onClick={props.closePanel}>Close</Button>
            </div>
        </div>
    </div>
}

const signalSource = `
declare const module:{exports:any};
declare namespace Signal {
    export class State<T> {
        #private;
        readonly [NODE]: SignalNode<T>;
        constructor(initialValue: T, options?: Signal.Options<T>);
        get(): T;
        set(newValue: T): void;
    }
    export class Computed<T> {
        #private;
        readonly [NODE]: ComputedNode<T>;
        constructor(computation: () => T, options?: Signal.Options<T>);
        get(): T;
    }
    type AnySignal<T = any> = State<T> | Computed<T>;
    type AnySink = Computed<any> | subtle.Watcher;
    export namespace subtle {
        function untrack<T>(cb: () => T): T;
        function introspectSources(sink: AnySink): AnySignal[];
        function introspectSinks(signal: AnySignal): AnySink[];
        function hasSinks(signal: AnySignal): boolean;
        function hasSources(signal: AnySink): boolean;
        class Watcher {
            #private;
            readonly [NODE]: ReactiveNode;
            constructor(notify: (this: Watcher) => void);
            watch(...signals: AnySignal[]): void;
            unwatch(...signals: AnySignal[]): void;
            getPending(): Computed<any>[];
        }
        function currentComputed(): Computed<any> | undefined;
        const watched: unique symbol;
        const unwatched: unique symbol;
    }
    export interface Options<T> {
        equals?: (this: AnySignal<T>, t: T, t2: T) => boolean;
        [Signal.subtle.watched]?: (this: AnySignal<T>) => void;
        [Signal.subtle.unwatched]?: (this: AnySignal<T>) => void;
    }
    export {};
}`

function ConfirmationDialog(props: {
    message:ReactNode,
    closePanel: (result?: string) => void,
    buttons?:Array<string>,
}) {
    const buttons = props.buttons ?? ['Yes','No']
    return <div style={{display: 'flex',flexDirection:'column',gap:10,padding:10}}>
        <div>{props.message}</div>
        <div style={{display: 'flex', flexDirection: 'row',justifyContent:'flex-end',gap:5}}>
            {buttons.map((key) => {
                return <Button key={key} onClick={() => props.closePanel(key)}>{key}</Button>
            })}
        </div>
    </div>
}

function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    const {style, ...properties} = props;

    const buttonStyle: CSSProperties = useMemo(() => {
        const defaultStyle: CSSProperties = {
            border: BORDER,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'rgba(255,255,255,0.9)',
            borderRadius:3
        };
        return {...defaultStyle, ...style}
    }, [style])
    return <button style={buttonStyle} {...properties}>{props.children}</button>
}