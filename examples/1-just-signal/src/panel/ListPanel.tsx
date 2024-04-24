import {useComputed, useSignal} from "../../../../src/hooks.ts";
import {type AnySignal, notifiable} from "../../../../src/components.ts";
import {Todo} from "../model/Todo.ts";
import {Signal} from "signal-polyfill";
import {SortFilter} from "../App.tsx";
import {isEmpty} from "../utils/isEmpty.ts";
import {ResizeableProvider} from "./list/ResizeableProvider.tsx";
import {RowRenderer} from "./list/RowRenderer.tsx";
import {Paging} from "./list/Paging.tsx";


export default function ListPanel(props: {
    todos: Signal.State<Todo[]>,
    selectedTodo: Signal.State<Todo | undefined>,
    disabled: AnySignal<boolean>,
    onEdit: (todo: Todo) => void,
    sortFilter: Signal.State<SortFilter>
}) {

    const {todos, disabled, selectedTodo: currentSelectedRow, sortFilter} = props;

    const currentPageNumber = useSignal(1);
    const maxRowPerPage = useSignal(50);
    const cellsWidth = useSignal<Partial<{ [K in keyof Todo]: number }>>({});
    const scrollPosition = useSignal(0);

    const filteredTodo = useComputed(() => {
        const filter = sortFilter.get().filter ?? {}
        return todos.get().filter((todo) => {
            for (const key_ of Object.keys(filter)) {
                const key = key_ as keyof Todo;
                if (!isEmpty(filter[key])) {
                    const isMatch = todo?.[key].toString().toUpperCase().indexOf(filter?.[key]?.toUpperCase() ?? '') >= 0;
                    if (!isMatch) {
                        return false;
                    }
                }
            }
            return true;
        })
    })

    const currentPageData = useComputed(() => {
        const currentPageNumberValue = currentPageNumber.get();
        const maxRowPerPageValue = maxRowPerPage.get();
        return filteredTodo.get().slice(((currentPageNumberValue - 1) * maxRowPerPageValue), (currentPageNumberValue * maxRowPerPageValue));
    });

    const todoRenderer = useComputed(() => {
        return currentPageData.get().map((todo, index) => {
            return <RowRenderer key={todo.id} todo={todo} currentSelectedRow={currentSelectedRow}
                                cellsWidth={cellsWidth} index={index} disabled={disabled} onDelete={(todo: Todo) => {
                todos.set(todos.get().filter(t => t.id !== todo.id))
            }} onEdit={props.onEdit}/>
        })
    });
    const onScroll = (e:{target:unknown}) => scrollPosition.set((e.target as HTMLDivElement).scrollTop);
    const headerClassName = useComputed(() => `flex row h-60 border-b ${scrollPosition.get() > 1 ? 'shadow' : ''}`)

    return <div className={'flex col grow overflow-auto border rounded-5'}>
        <notifiable.div className={headerClassName} style={{transition: 'box-shadow 100ms ease-in-out'}}>
            <HeaderRenderer cellsWidth={cellsWidth} sortFilter={sortFilter}/>
        </notifiable.div>
        <notifiable.div className={'flex col h-full overflow-auto border-b'} onScroll={onScroll}>
            {todoRenderer}
        </notifiable.div>
        <div className={'m-5'}>
            <Paging currentPage={currentPageNumber} data={filteredTodo} totalRowPerPage={maxRowPerPage} disabled={disabled}/>
        </div>
    </div>
}


function HeaderRenderer(props: {
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    sortFilter: Signal.State<SortFilter>
}) {
    const {cellsWidth, sortFilter} = props;

    const title = useComputed(() => sortFilter.get().filter?.title ?? '')
    const description = useComputed(() => sortFilter.get().filter?.description ?? '')
    const dueDate = useComputed(() => sortFilter.get().filter?.dueDate ?? '')
    const priority = useComputed(() => sortFilter.get().filter?.priority ?? '')
    const onInputChange = (colId: keyof Todo) => (e:{target:{value:string}}) => {
        const value = sortFilter.get();
        sortFilter.set({...value, filter: {...value.filter, [colId]: e.target.value}})
    }
    return <>
        <ResizeableProvider colId={'title'} cellsWidth={cellsWidth} className={'border-r'}
                            style={{width: '70%'}}>
            <div className={'flex col '}>
                <div className={'p-5 border-b'}>Title</div>
                <notifiable.input className={'flex col border-none h-30 border-t p-5'} value={title}
                                  onChange={onInputChange('title')}/>
            </div>
        </ResizeableProvider>
        <ResizeableProvider colId={'description'} cellsWidth={cellsWidth} className={'border-r'}
                            style={{width: '30%'}}>
            <div className={'flex col '}>
                <div className={'p-5 border-b'}>Description</div>
                <notifiable.input className={'flex col border-none h-30 border-t p-5'} value={description}
                                  onChange={onInputChange('description')}/>
            </div>
        </ResizeableProvider>
        <ResizeableProvider colId={'dueDate'} cellsWidth={cellsWidth} className={'border-r'}
                            style={{width: 200}}>
            <div className={'flex col '}>
                <div className={'p-5 border-b flex col align-center'}>Due Date</div>
                <notifiable.input className={'flex col border-none h-30 border-t p-5'} value={dueDate}
                                  onChange={onInputChange('dueDate')}/>
            </div>
        </ResizeableProvider>
        <ResizeableProvider colId={'priority'} cellsWidth={cellsWidth} className={'border-r'}
                            style={{width: 100}}>
            <div className={'flex col '}>
                <div className={'p-5 border-b'}>Priority</div>
                <notifiable.input className={'flex col border-none h-30 border-t p-5'} value={priority}
                                  onChange={onInputChange('priority')}/>
            </div>
        </ResizeableProvider>
        <ResizeableProvider colId={'edit'} cellsWidth={cellsWidth} className={'border-r p-5'}
                            style={{width: 90}}></ResizeableProvider>
        <ResizeableProvider colId={'delete'} cellsWidth={cellsWidth} className={'border-r p-5'}
                            style={{width: 90}}></ResizeableProvider>
        <div className={'flex col shrink-0 '} style={{width: 15}}></div>
    </>
}
