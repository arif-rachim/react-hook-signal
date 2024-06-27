import {createContext, CSSProperties, HTMLAttributes, useContext, useEffect, useId} from "react";
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
import {IconType} from "react-icons";

import {guid} from "../utils/guid.ts";
import {useRefresh} from "../utils/useRefresh.ts";

type Container = {
    id: string,
    children: string[],
    parent: string
    type: 'horizontal' | 'vertical' | string,
    width: CSSProperties['width'],
    height: CSSProperties['height'],
    gap: CSSProperties['gap'],
    margin: CSSProperties['margin'],
    padding: CSSProperties['padding']
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
    elements: Record<string, { component: React.FC, icon: IconType }>
}

const ContainerContext = createContext<{
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
    const allContainersSignal = useSignal<Array<Container>>([{id: guid(), type: 'vertical', gap: 0, children: [], parent: '', height: 'auto', width: 'auto', margin: 'unset', padding: 'unset'}]);
    const renderedElements = useComputed(() => {
        const container = allContainersSignal.get().find(item => item.parent === '');
        if (container) {
            return <DraggableContainer allContainersSignal={allContainersSignal} container={container}/>
        }
        return <></>
    });
    return <ContainerContext.Provider
        value={{hoveredDragContainerIdSignal: hoveredDragContainerIdSignal, selectedDragContainerIdSignal: selectedDragContainerIdSignal, activeDropZoneIdSignal: activeDropZoneIdSignal, uiDisplayModeSignal: uiDisplayModeSignal, allContainersSignal: allContainersSignal, ...props}}>

        <div style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
            <div
                style={{width: 200, padding: 20, backgroundColor: 'rgba(0,0,0,0.1)', borderRight: '1px solid rgba(0,0,0,0.1)', display: 'flex', gap: 10, alignItems: 'flex-start'}}>
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
        </div>

    </ContainerContext.Provider>
}


function DraggableItem(props: { draggableDataType: string, icon: IconType }) {
    const Icon = props.icon;
    const {activeDropZoneIdSignal} = useContext(ContainerContext);
    return <ButtonWithIcon onDragStart={(e) => e.dataTransfer.setData('text/plain', props.draggableDataType)}
                           draggable={true} onDragEnd={() => activeDropZoneIdSignal.set('')} icon={Icon}/>

}

function swapContainerLocation(containerStateSignal: Signal.State<Array<Container>>, containerToBeSwapped: string, dropZoneId: Signal.State<string>) {
    const childId = dropZoneId.get();
    const dropZoneElement = document.getElementById(childId);
    if (dropZoneElement === null) {
        return;
    }
    const {precedingSiblingId, parentContainerId} = dropZones.find(s => s.id === childId)!;
    const allContainers = containerStateSignal.get();
    const targetContainer = allContainers.find(i => i.id === containerToBeSwapped)!;
    const currentParentContainer = allContainers.find(i => i.id === targetContainer.parent)!;
    const newParentContainer = allContainers.find(i => i.id === parentContainerId)!;
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
    containerStateSignal.set(JSON.parse(JSON.stringify(allContainers)));
    dropZoneId.set('');
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

function addNewContainer(allContainersSignal: Signal.State<Array<Container>>, config: { type: 'vertical' | 'horizontal' | string }, dropZoneId: Signal.State<string>) {
    const {parentContainerId, insertionIndex} = getContainerIdAndIndexToPlaced(allContainersSignal, dropZoneId);
    const newContainer: Container = {
        id: guid(),
        type: config.type,
        gap: 0,
        children: [],
        parent: parentContainerId,
        width: 'auto',
        height: 'auto',
        padding: 'unset',
        margin: 'unset'
    }

    const newAllContainers = [...allContainersSignal.get().map(n => {
        if (n.id === parentContainerId) {
            if (insertionIndex >= 0) {
                n.children.splice(insertionIndex + 1, 0, newContainer.id);
                n.children = [...n.children];
            } else {
                n.children = [newContainer.id, ...n.children];
            }
            return {...n}
        }
        return n;
    }), newContainer];
    allContainersSignal.set(JSON.parse(JSON.stringify(newAllContainers)));
}

function DraggableContainer(props: {
    allContainersSignal: Signal.State<Array<Container>>,
    container: Container
}) {
    const {container, allContainersSignal} = props;
    const {elements: elementsLib, activeDropZoneIdSignal, hoveredDragContainerIdSignal, selectedDragContainerIdSignal, uiDisplayModeSignal} = useContext(ContainerContext);
    const {refresh} = useRefresh('DraggableContainer');
    useSignalEffect(() => {
        uiDisplayModeSignal.get();
        refresh();
    })
    const mousePosition = useSignal<{
        clientX: number,
        clientY: number
    }>({clientX: 0, clientY: 0})

    function onDragStart(event: React.DragEvent) {
        event.stopPropagation();
        event.dataTransfer.setData('text/plain', container.id);
    }

    function onDragOver(event: React.DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        mousePosition.set(event);
    }

    function onMouseOver(event: React.MouseEvent<HTMLDivElement>) {
        event.preventDefault();
        event.stopPropagation();
        hoveredDragContainerIdSignal.set(container.id);
    }

    useSignalEffect(() => {
        const {clientX: mouseX, clientY: mouseY} = mousePosition.get();
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
                if (dropZone.parentContainerId === container.id) {
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
        selectedDragContainerIdSignal.set(container.id);
    }

    function onFocusUp() {
        if (container.parent) {
            selectedDragContainerIdSignal.set(container.parent);
        }
    }

    function onDelete() {
        let allContainers = allContainersSignal.get();
        const parent = allContainers.find(s => s.id === container.parent);
        if (parent) {
            parent.children = parent.children.filter(s => s !== container.id);
        }
        allContainers = allContainers.filter(s => s.id !== container.id);
        allContainersSignal.set(JSON.parse(JSON.stringify(allContainers)));
    }

    const elements = (() => {
        const mode = uiDisplayModeSignal.get();
        const children = container.children ?? [];

        const isContainer = container.type === 'vertical' || container.type === 'horizontal'
        const result: Array<JSX.Element> = [];
        if (mode === 'design') {
            result.push(<ToolBar key={`toolbar-${container.id}`} container={container} onFocusUp={onFocusUp}
                                 onDelete={onDelete}/>)
        }
        if (isContainer) {
            if (mode === 'design') {
                result.push(<DropZone precedingSiblingId={''} key={`drop-zone-root-${container.id}`}
                                      parentContainerId={container.id}/>)
            }
            for (let i = 0; i < children?.length; i++) {
                const childId = children[i];
                const childContainer = allContainersSignal.get().find(i => i.id === childId)!;
                result.push(<DraggableContainer allContainersSignal={allContainersSignal} container={childContainer} key={childId}/>)
                if (mode === 'design') {
                    result.push(<DropZone precedingSiblingId={childId} key={`drop-zone-${i}-${container.id}`}
                                          parentContainerId={container.id}/>);
                }
            }
        } else {
            const {component: Component} = elementsLib[container.type];
            result.push(<Component/>)
        }
        return result;
    })();


    const computedStyle = useComputed((): CSSProperties => {
        const mode = uiDisplayModeSignal.get();
        const isRoot = container.parent === '';
        const styleFromSignal = {
            border: mode === 'design' ? '1px dashed rgba(0,0,0,0.1)' : '1px solid rgba(0,0,0,0)',
            background: 'white',
            minWidth: 10,
            minHeight: 10,
            padding: mode === 'design' ? 5 : container.padding,
            display: 'flex',
            flexDirection: container.type === 'horizontal' ? 'row' : 'column',
            width: isRoot ? '100%' : container.width,
            height: isRoot ? '100%' : container.height,
            position: 'relative',
            gap: container.gap,
            margin: container.margin
        };
        const isFocused = selectedDragContainerIdSignal.get() === container.id;
        const isHovered = hoveredDragContainerIdSignal.get() === container.id;
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
                           onClick={onSelected} data-container-id={container.id}>
        {elements}
    </notifiable.div>

}

function DropZone(props: {
    precedingSiblingId: string,
    parentContainerId: string
}) {
    const id = useId();
    const {activeDropZoneIdSignal} = useContext(ContainerContext)
    useEffect(() => {
        const item = {
            id: id,
            ...props
        }
        dropZones.push(item);
        return () => {
            dropZones.splice(dropZones.indexOf(item), 1);
        }
    }, []);
    const computedStyle = useComputed(() => {
        const isFocused = id === activeDropZoneIdSignal.get();
        const style: CSSProperties = {top: -5, left: -5, minWidth: 10, minHeight: 10, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 10, flexGrow: 1, position: 'absolute', height: `calc(100% + 10px)`, width: `calc(100% + 10px)`, transition: 'background-color 300ms ease-in-out', zIndex: -1};
        if (isFocused) {
            style.backgroundColor = `rgba(84, 193, 240, 0.5)`;
            style.zIndex = 1;
        }
        return style;
    })
    const containerStyle: CSSProperties = {minWidth: 0, minHeight: 0, backgroundColor: 'rgba(84,193,240,0.5)', position: 'relative', display: 'flex', flexDirection: 'column'};
    return <div style={containerStyle}>
        <notifiable.div id={id} style={computedStyle}></notifiable.div>
    </div>
}

function ToolBar(props: { container: Container, onDelete: () => void, onFocusUp: () => void }) {
    const {container, onDelete, onFocusUp} = props;
    const {selectedDragContainerIdSignal} = useContext(ContainerContext);

    function preventClick(event: React.MouseEvent<HTMLElement>) {
        event.preventDefault();
        event.stopPropagation();
    }

    const computedStyle = useComputed(() => {
        const style = {display: 'none', alignItems: 'center', justifyContent: 'center', background: '#666', position: 'absolute', top: -17, right: -1, color: 'white', zIndex: -1};
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
        style={{border: '1px solid rgba(0,0,0,0.3)', padding: 5, borderRadius: 5, backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}} {...properties}>
        <Icon/>
    </div>
}
