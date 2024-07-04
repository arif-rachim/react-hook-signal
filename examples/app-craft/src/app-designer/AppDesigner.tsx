import React, {
    createContext,
    CSSProperties,
    HTMLAttributes,
    PropsWithChildren,
    useContext,
    useEffect,
    useId
} from "react";
import {notifiable, useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {
    MdArrowUpward,
    MdCancel,
    MdDesignServices,
    MdDragIndicator,
    MdHorizontalDistribute,
    MdPreview,
    MdVerticalDistribute
} from "react-icons/md";

import {guid} from "../utils/guid.ts";
import {useRefresh} from "../utils/useRefresh.ts";
import {BORDER, BORDER_NONE} from "../comp/Border.ts";

type IconType = any;
type Container = {
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
    marginLeft: CSSProperties['marginLeft']
}

const VERTICAL = 'vertical';
const HORIZONTAL = 'horizontal';

const FEATHER = 5;
const dropZones: Array<{
    id: string,
    precedingSiblingId: string,
    parentContainerId: string
}> = [];

type LayoutBuilderProps = {
    elements: Record<string, {
        icon: IconType,
        component : React.FC,
        property : Record<string,'effect'|'computed'>
    }>
}

export const AppDesignerContext = createContext<{
    activeDropZoneIdSignal: Signal.State<string>,
    selectedDragContainerIdSignal: Signal.State<string>,
    hoveredDragContainerIdSignal: Signal.State<string>,
    allContainersSignal: Signal.State<Array<Container>>,
    uiDisplayModeSignal: Signal.State<'design' | 'view'>
} & LayoutBuilderProps>({
    activeDropZoneIdSignal: new Signal.State<string>(''),
    selectedDragContainerIdSignal: new Signal.State<string>(''),
    hoveredDragContainerIdSignal: new Signal.State<string>(''),
    uiDisplayModeSignal: new Signal.State<"design" | "view">('design'),
    allContainersSignal: new Signal.State<Array<Container>>([]),
    elements: {}
})

export default function AppDesigner(props: LayoutBuilderProps) {
    const activeDropZoneIdSignal = useSignal('');
    const selectedDragContainerIdSignal = useSignal('');
    const hoveredDragContainerIdSignal = useSignal('');
    const uiDisplayModeSignal = useSignal<'design' | 'view'>('design');
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
        paddingLeft: ''

    }]);
    const renderedElements = useComputed(() => {
        const container = allContainersSignal.get().find(item => item.parent === '');
        if (container) {
            return <DraggableContainer allContainersSignal={allContainersSignal} container={container}/>
        }
        return <></>
    });
    const propertyEditors = useComputed(() => {
        const selectedDragContainerId = selectedDragContainerIdSignal.get();
        const selectedDragContainer = allContainersSignal.get().find(i => i.id === selectedDragContainerId);
        const key = selectedDragContainer?.type;
        const result: Array<JSX.Element> = [];
        result.push(<div style={{display:'flex',flexDirection:'row',gap:10}} key={'height-width'}>
            <NumericalPercentagePropertyEditor property={'height'} label={'Height'} key={'height-editor'} style={{width:'50%'}} styleLabel={{width:30}}/>
            <NumericalPercentagePropertyEditor property={'width'} label={'Width'} key={'width-editor'} style={{width:'50%'}} styleLabel={{width:30}}/>
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
        if (key in props.elements) {
            const property = props.elements[key].property;
            result.push(<div key={'prop-editor'} style={{display:'flex',flexDirection:'column'}}>
                {Object.keys(property).map(key => {
                    return <LabelContainer key={key} label={key} style={{flexDirection:'row',alignItems:'center'}} styleLabel={{width:80}}>
                        <button>Geledek</button>
                    </LabelContainer>
                })}
            </div>);
        }
        return result
    })

    return <AppDesignerContext.Provider
        value={{
            hoveredDragContainerIdSignal: hoveredDragContainerIdSignal,
            selectedDragContainerIdSignal: selectedDragContainerIdSignal,
            activeDropZoneIdSignal: activeDropZoneIdSignal,
            uiDisplayModeSignal: uiDisplayModeSignal,
            allContainersSignal: allContainersSignal, ...props
        }}>

        <div style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
            <div
                style={{
                    width: 200,
                    padding: 20,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRight: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start'
                }}>
                <DraggableItem icon={MdVerticalDistribute} draggableDataType={'vertical'}/>
                <DraggableItem icon={MdHorizontalDistribute} draggableDataType={'horizontal'}/>
                {
                    Object.keys(props.elements).map((key) => {
                        const Icon = props.elements[key].icon;
                        return <DraggableItem icon={Icon} draggableDataType={key} key={key}/>
                    })
                }
            </div>
            <div style={{flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'center', gap: 10, padding: 10}}>
                    <ButtonWithIcon icon={MdPreview} onClick={() => uiDisplayModeSignal.set('view')}/>
                    <ButtonWithIcon icon={MdDesignServices} onClick={() => uiDisplayModeSignal.set('design')}/>
                </div>
                <notifiable.div style={{flexGrow: 1}}>
                    {renderedElements}
                </notifiable.div>
            </div>
            <notifiable.div
                style={{
                    width: 200,
                    padding: 5,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderLeft: '1px solid rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                {propertyEditors}
            </notifiable.div>
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
        marginLeft: ''
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
    }, [contanerProp]);
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

    function onDragStart(event: React.DragEvent) {
        event.stopPropagation();
        event.dataTransfer.setData('text/plain', containerSignal.get().id);
    }

    function onDragOver(event: React.DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        mousePosition.set(event);
    }

    function onMouseOver(event: React.MouseEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();
        hoveredDragContainerIdSignal.set(containerSignal.get().id);
    }

    useSignalEffect(() => {
        const {clientX: mouseX, clientY: mouseY} = mousePosition.get();
        const container: Container | undefined = containerSignal.get();
        if (mouseX <= 0 || mouseY <= 0) {
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

    function onDrop(event: React.DragEvent) {
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

    function onSelected(event: React.MouseEvent<HTMLDivElement>) {
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
        const result: Array<JSX.Element> = [];
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

    function preventClick(event: React.MouseEvent<HTMLElement>) {
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
            top: -17,
            right: -1,
            color: 'white',
            zIndex: -1
        };
        const isFocused = selectedDragContainerIdSignal.get() === container.id;
        if (isFocused) {
            style.display = 'flex';
            style.zIndex = 100;
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
        if (selectedDragContainer.get() === undefined) {
            return '';
        }
        const val: string = (selectedDragContainer.get()[property] ?? '') as unknown as string;
        if (val.endsWith('%')) {
            return parseInt(val.replace('%', ''))
        }
        if (val.endsWith('px')) {
            return parseInt(val.replace('px', ''))
        }
        return selectedDragContainer.get()[property] ?? ''
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
    styleLabel?: CSSProperties
}>) {
    return <label style={{display: 'flex', flexDirection: 'column',gap: 0, ...props.style}}>
        <div style={props.styleLabel}>{props.label}</div>
        <div style={{display:'flex',flexDirection:'row'}}>
            {props.children}
        </div>
    </label>
}