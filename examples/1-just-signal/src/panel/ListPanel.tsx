import {useComputed, useSignal} from "../../../../src/hooks.ts";
import {ddMMMyyyy} from "../utils/dateFormat.ts";
import {type AnySignal, notifiable} from "../../../../src/components.ts";
import {Todo} from "../model/Todo.ts";
import {PropsWithChildren, useEffect, useRef} from "react";
import {Signal} from "signal-polyfill";
import {useShowModal} from "./useShowModal.ts";


export default function ListPanel(props: {
    todos: Signal.State<Todo[]>,
    selectedTodo: Signal.State<Todo | undefined>,
    disabled: AnySignal<boolean>
}) {
    const {todos, disabled} = props;

    const currentPageNumber = useSignal(1);
    const maxRowPerPage = useSignal(50);
    const currentSelectedRow = props.selectedTodo;

    const cellsWidth = useSignal<Partial<{ [K in keyof Todo]: number }>>({});

    const currentPageData = useComputed(() => {
        const currentPageNumberValue = currentPageNumber.get();
        const maxRowPerPageValue = maxRowPerPage.get();
        return todos.get().slice(((currentPageNumberValue - 1) * maxRowPerPageValue), (currentPageNumberValue * maxRowPerPageValue));
    });

    const todoRenderer = useComputed(() => {
        return currentPageData.get().map((todo, index) => {
            return <RowRenderer key={todo.id} todo={todo} currentSelectedRow={currentSelectedRow}
                                cellsWidth={cellsWidth} index={index} disabled={disabled}/>
        })
    });

    const headerRenderer = useComputed(() => {
        const cellsWidthValue = cellsWidth.get();
        return <div className={'table-row h-30 border-b'}>
            <div className={'table-cell p-5'} style={{width: cellsWidthValue.title}}>Title</div>
            <div className={'table-cell p-5'} style={{width: cellsWidthValue.description}}>Description</div>
            <div className={'table-cell p-5'} style={{width: cellsWidthValue.dueDate}}>Due Date</div>
            <div className={'table-cell p-5'} style={{width: cellsWidthValue.priority}}>Priority</div>
            <div className={'table-cell'} style={{width: 15}}></div>
        </div>
    })

    return <div className={'flex col grow overflow-auto border'}>
        <notifiable.div className={'table border-b'}>
            {headerRenderer}
        </notifiable.div>
        <div className={'flex col h-full overflow-auto border-b'}>
            <notifiable.div className={'table'}>
                {todoRenderer}
            </notifiable.div>
        </div>
        <div className={'m-5'}>
            <Paging currentPage={currentPageNumber} data={todos} totalRowPerPage={maxRowPerPage} disabled={disabled}/>
        </div>
    </div>
}

function ResizeableListener(props: PropsWithChildren<{
    className: string,
    isFirstRow: boolean,
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    colId: keyof Todo
}>) {
    const {isFirstRow} = props;
    const propsRef = useRef(props);
    propsRef.current = props;
    const elementRef = useRef(null);
    useEffect(() => {
        const {colId, cellsWidth} = propsRef.current;
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                cellsWidth.set({...cellsWidth.get(), [colId]: entry.borderBoxSize[0].inlineSize})
            }
        });

        if (isFirstRow) {
            resizeObserver.observe(elementRef.current!);
        }
        return () => {
            resizeObserver.disconnect();
        }
    }, [isFirstRow])
    return <div ref={elementRef} className={props.className}>
        {props.children}
    </div>
}


function Paging(props: {
    currentPage: Signal.State<number>,
    totalRowPerPage: Signal.State<number>,
    data: AnySignal<Todo[]>
    disabled: AnySignal<boolean>
}) {

    const {currentPage, totalRowPerPage, data, disabled} = props;
    const showModal = useShowModal();
    const buttons = useComputed(() => {
        const currentPageValue = currentPage.get();
        const totalRowPerPageValue = totalRowPerPage.get();
        const dataValue = data.get();
        const totalRecords = dataValue.length;
        const totalPages = Math.ceil(totalRecords / totalRowPerPageValue);
        return generatePaginationArray(currentPageValue, totalPages).map((page, index) => {
            const isCurrentPage = page === currentPageValue;
            return <div key={index} className={`button-circle ${isCurrentPage ? 'bg-selected' : 'bg-darken-1'}`}
                        onClick={async () => {
                            if (disabled.get()) {
                                await showModal<void>(disableNotification)
                                return;
                            }
                            currentPage.set(page);
                        }}>{page}</div>
        })
    })


    return <div className={'flex justify-center'}>
        <notifiable.div className={'flex row gap-5'}>{buttons}</notifiable.div>
    </div>
}

function disableNotification(closePanel: () => void) {

    return <div className={'bg-gray w-1-3 p-20 shadow rounded-bl-10 rounded-br-10 flex col gap-20'}>
        <div>
            You are in edit mode, please save your work before navigate to different page.
        </div>
        <div className={'flex justify-end'}>
            <button className={'p-5 w-100 rounded-5 border bg-darken-1'} onClick={() => closePanel()}>OK</button>
        </div>

    </div>

}

function generatePaginationArray(currentPage: number, totalPages: number) {
    const paginationArray = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    if (startPage !== 1) {
        paginationArray.push(1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationArray.push(i);
    }

    if (endPage !== totalPages) {
        paginationArray.push(totalPages);
    }
    return paginationArray;
}

function RowRenderer(props: {
    todo: Todo,
    currentSelectedRow: Signal.State<Todo | undefined>,
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    index: number,
    disabled: AnySignal<boolean>
}) {
    const {todo, cellsWidth, index, currentSelectedRow, disabled} = props;
    const showModal = useShowModal();
    const isSelected = useComputed(() => {
        return currentSelectedRow.get()?.id === todo.id
    })
    const className = useComputed(() => {
        const classNames = ['table-row', 'h-30']
        if (isSelected.get()) {
            classNames.push('bg-selected');
        } else if ((index % 2) === 0) {
            classNames.push('bg-darken-1');
        }
        return classNames.join(' ')
    })

    return <notifiable.div className={className} onClick={async () => {
        if (disabled.get()) {
            await showModal<void>(disableNotification)
            return;
        }
        currentSelectedRow.set(todo);
    }}>
        <ResizeableListener className={'table-cell p-5'} cellsWidth={cellsWidth} colId={'title'}
                            isFirstRow={index === 0}>{todo.title}</ResizeableListener>
        <ResizeableListener className={'table-cell p-5'} cellsWidth={cellsWidth} colId={'description'}
                            isFirstRow={index === 0}>{todo.description}</ResizeableListener>
        <ResizeableListener className={'table-cell p-5'} cellsWidth={cellsWidth} colId={'dueDate'}
                            isFirstRow={index === 0}>{ddMMMyyyy(todo.dueDate)}</ResizeableListener>
        <ResizeableListener className={'table-cell p-5'} cellsWidth={cellsWidth} colId={'priority'}
                            isFirstRow={index === 0}>{todo.priority}</ResizeableListener>
    </notifiable.div>;
}
