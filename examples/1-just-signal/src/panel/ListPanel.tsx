import {useComputed, useSignal, useSignalEffect} from "../../../../src/hooks.ts";
import {type AnySignal, notifiable} from "../../../../src/components.ts";
import {Todo} from "../model/Todo.ts";
import {Signal} from "signal-polyfill";
import {SortFilter} from "../App.tsx";
import {isEmpty} from "../utils/isEmpty.ts";
import {RowRenderer} from "./list/RowRenderer.tsx";
import {Paging} from "./list/Paging.tsx";
import {HeaderRenderer} from "./list/HeaderRenderer.tsx";
import {CSSProperties, useRef} from "react";


export default function ListPanel(props: {
    todos: Signal.State<Todo[]>,
    selectedTodo: Signal.State<Todo | undefined>,
    disabled: AnySignal<boolean>,
    onEdit: (todo: Todo) => void,
    onDelete : (todo:Todo) => void,
    sortFilter: Signal.State<SortFilter>
}) {

    const {todos, disabled, selectedTodo: currentSelectedRow, sortFilter} = props;

    const maxRowPerPage = useSignal(20);
    const cellsWidth = useSignal<Partial<{ [K in keyof Todo]: number }>>({});
    const scrollPosition = useSignal(0);

    const filteredTodo = useComputed(() => {
        const filter = sortFilter.get().filter ?? {}
        return todos.get().filter((todo) => {
            for (const key_ of Object.keys(filter)) {
                const key = key_ as keyof Todo;
                if (!isEmpty(filter[key])) {
                    const isMatch = todo?.[key]?.toString()?.toUpperCase()?.indexOf(filter?.[key]?.toUpperCase() ?? '') >= 0;
                    if (!isMatch) {
                        return false;
                    }
                }
            }
            return true;
        })
    })

    useSignalEffect(() => {
        const totalRecordsValue = filteredTodo.get().length;
        const maxRowPerPageValue = maxRowPerPage.get();
        const currentPageValue = currentPageNumber.get();
        if(currentPageValue > Math.ceil(totalRecordsValue / maxRowPerPageValue) ){
            onPageChange(1);
        }
    })


    const todoRenderer = useComputed(() => {

        const maxRowPerPageValue = maxRowPerPage.get();
        const currentPageNumberValue = currentPageNumber.get();
        const startIndex = currentPageNumberValue;
        const endIndex = currentPageNumberValue + 1;
        const currentPageData = filteredTodo.get().slice(((startIndex - 1) * maxRowPerPageValue), (endIndex * maxRowPerPageValue));
        return currentPageData.map((todo, index) => {
            const recordPosition = (index + ((startIndex  - 1) * maxRowPerPageValue));
            const style:CSSProperties = {
                top : recordPosition * 30,
                position:'absolute'
            }
            return <RowRenderer key={todo.id} todo={todo} currentSelectedRow={currentSelectedRow}
                                cellsWidth={cellsWidth} index={recordPosition} disabled={disabled} onDelete={props.onDelete} onEdit={props.onEdit} style={style}/>
        })
    });
    const onScroll = (e:{target:unknown}) => scrollPosition.set((e.target as HTMLDivElement).scrollTop);
    const headerClassName = useComputed(() => `flex row h-60 border-b ${scrollPosition.get() > 1 ? 'shadow' : ''}`)
    const containerHeight = useComputed(() => filteredTodo.get().length * 30);

    const currentPageNumber = useComputed(() => {
        const position = scrollPosition.get();
        const rowPerPageValue = maxRowPerPage.get();
        return Math.floor(Math.floor(position / 30) / rowPerPageValue) + 1;
    })

    const containerStyle = useComputed<CSSProperties>(() => {
        return {
            position:'relative',
            height : containerHeight.get(),
            flexShrink:0
        }
    })
    const scrollerContainerRef = useRef<HTMLDivElement|null>(null);
    function onPageChange(page:number){
        if(scrollerContainerRef.current){
            scrollerContainerRef.current!.scrollTop = ((page - 1) * 30 * maxRowPerPage.get())
        }
    }

    return <div className={'flex col grow overflow-auto border rounded-5'}>
        <notifiable.div className={headerClassName} style={{transition: 'box-shadow 100ms ease-in-out'}}>
            <HeaderRenderer cellsWidth={cellsWidth} sortFilter={sortFilter}/>
        </notifiable.div>
        <div ref={scrollerContainerRef} className={'flex col h-full overflow-auto border-b'} onScroll={onScroll}>
            <notifiable.div style={containerStyle}>{todoRenderer}</notifiable.div>
        </div>
        <div className={'m-5'}>
            <Paging currentPage={currentPageNumber} data={filteredTodo} totalRowPerPage={maxRowPerPage} disabled={disabled} onPageChange={onPageChange}/>
        </div>
    </div>
}


