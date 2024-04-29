import {useComputed, useSignalEffect,useSignal} from "react-hook-signal"
import {type AnySignal, notifiable} from "react-hook-signal"
import {Todo} from "../model/Todo.ts";
import {Signal} from "signal-polyfill";
import {SortFilter} from "../App.tsx";
import {isEmpty} from "../utils/isEmpty.ts";
import {GridRow} from "./list/GridRow.tsx";
import {GridPagination} from "./list/GridPagination.tsx";
import {GridHeader} from "./list/GridHeader.tsx";
import {CSSProperties, useRef} from "react";

/**
 * The TaskListPanel component.
 */
export default function TaskListPanel(props: {
    todos: Signal.State<Todo[]>,
    selectedTodo: Signal.State<Todo | undefined>,
    disabled: AnySignal<boolean>,
    onEdit: (todo: Todo) => void,
    onDelete : (todo:Todo) => void,
    sortFilter: Signal.State<SortFilter>
}) {

    const {todos, disabled, selectedTodo: currentSelectedRow, sortFilter} = props;

    /**
     * The maximum number of rows to display per page.
     */
    const maxRowPerPage = useSignal(20);

    /**
     * The current width of each column in the grid.
     */
    const cellsWidth = useSignal<Partial<{ [K in keyof Todo]: number }>>({});

    /**
     * The current scroll position of the grid.
     */
    const scrollPosition = useSignal(0);

    /**
     * The current filter status.
     */
    const status = useComputed(() => sortFilter.get().filter?.status);

    /**
     * The filtered list of Todo items.
     */
    const filteredTodo = useComputed(() => {
        const filter = sortFilter.get().filter ?? {}
        return todos.get().filter((todo) => {
            for (const key_ of Object.keys(filter)) {
                const key = key_ as keyof Todo;
                if (!isEmpty(filter[key])) {
                    const stringValue = todo?.[key]?.toString()?.toUpperCase() ?? '';
                    const isMatch = stringValue.indexOf(filter?.[key]?.toUpperCase() ?? '') >= 0
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

    /**
     * The rendered rows of the grid.
     */
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
            return <GridRow key={todo.id} todo={todo} currentSelectedRow={currentSelectedRow}
                            cellsWidth={cellsWidth} index={recordPosition} disabled={disabled} onDelete={props.onDelete} onEdit={props.onEdit} style={style}/>
        })
    });

    /**
     * A function to handle the scroll event of the grid.
     */
    const onScroll = (e:{target:unknown}) => scrollPosition.set((e.target as HTMLDivElement).scrollTop);

    /**
     * The computed class name for the header of the grid.
     */
    const headerClassName = useComputed(() => `flex row h-60 border-b ${scrollPosition.get() > 1 ? 'shadow' : ''}`)

    /**
     * The computed height of the container for the grid.
     */
    const containerHeight = useComputed(() => filteredTodo.get().length * 30);

    /**
     * The current page number of the grid.
     */
    const currentPageNumber = useComputed(() => {
        const position = scrollPosition.get();
        const rowPerPageValue = maxRowPerPage.get();
        return Math.floor(Math.floor(position / 30) / rowPerPageValue) + 1;
    })

    /**
     * The computed style for the container of the grid.
     */
    const containerStyle = useComputed<CSSProperties>(() => {
        return {
            position:'relative',
            height : containerHeight.get(),
            flexShrink:0
        }
    })
    const scrollerContainerRef = useRef<HTMLDivElement|null>(null);

    /**
     * A function to handle page changes in the grid.
     */
    function onPageChange(page:number){
        if(scrollerContainerRef.current){
            scrollerContainerRef.current!.scrollTop = ((page - 1) * 30 * maxRowPerPage.get())
        }
    }

    /**
     * The computed class name for the "All" filter button.
     */
    const classNameAll = useComputed(() => {
        const isSelected = isEmpty(status.get())
        return `flex col p-5 border-none border-l border-r border-b border-t rounded-tl-5 rounded-bl-5 ${isSelected ? 'bg-selected':''}`
    });

    /**
     * The computed class name for the "Pending" filter button.
     */
    const classNamePending = useComputed(() => {
        const isSelected = status.get() === 'Pending'
        return `flex col p-5 border-none border-r border-b border-t ${isSelected ? 'bg-selected':''}`
    });

    /**
     * The computed class name for the "Completed" filter button.
     */
    const classNameCompleted = useComputed(() => {
        const isSelected = status.get() === 'Completed'
        return `flex col p-5 border-none border-r border-b border-t rounded-tr-5 rounded-br-5 ${isSelected ? 'bg-selected':''}`
    });

    const classNameOnGoing = useComputed(() => {
        const isSelected = status.get() === 'On Going'
        return `flex col p-5 border-none border-r border-b border-t ${isSelected ? 'bg-selected':''}`
    });

    /**
     * A function to update the filter status.
     */
    function updateFilterStatus(value?:Todo['status']){
        return () => {
            sortFilter.set({...sortFilter.get(),filter:{...sortFilter.get().filter,status:value} })
        }
    }

    return <div className={'flex col grow overflow-auto gap-10'}>
        <div className={'flex row justify-center'}>
            <notifiable.button className={classNameAll} onClick={updateFilterStatus()}>All</notifiable.button>
            <notifiable.button className={classNamePending} onClick={updateFilterStatus('Pending')}>Pending</notifiable.button>
            <notifiable.button className={classNameOnGoing} onClick={updateFilterStatus('On Going')}>On Going</notifiable.button>
            <notifiable.button className={classNameCompleted} onClick={updateFilterStatus('Completed')}>Completed</notifiable.button>
        </div>
        <div className={'flex col grow overflow-auto border rounded-5'}>
        <notifiable.div className={headerClassName} style={{transition: 'box-shadow 100ms ease-in-out'}}>
            <GridHeader cellsWidth={cellsWidth} sortFilter={sortFilter}/>
        </notifiable.div>
        <div ref={scrollerContainerRef} className={'flex col h-full overflow-auto border-b'} onScroll={onScroll}>
            <notifiable.div style={containerStyle}>{todoRenderer}</notifiable.div>
        </div>
        <div className={'m-5'}>
            <GridPagination currentPage={currentPageNumber} data={filteredTodo} totalRowPerPage={maxRowPerPage} disabled={disabled} onPageChange={onPageChange}/>
        </div>
    </div></div>
}


