import {Signal} from "signal-polyfill";
import {Todo} from "../../model/Todo.ts";
import {SortFilter} from "../../App.tsx";
import {useComputed} from "../../../../../src/hooks.ts";
import {ResizeableProvider} from "./ResizeableProvider.tsx";
import {notifiable} from "../../../../../src/components.ts";
import {Visible} from "../Visible.tsx";

export function HeaderRenderer(props: {
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    sortFilter: Signal.State<SortFilter>
}) {
    const {cellsWidth, sortFilter} = props;

    const title = useComputed(() => sortFilter.get().filter?.title ?? '')
    const description = useComputed(() => sortFilter.get().filter?.description ?? '')
    const dueDate = useComputed(() => sortFilter.get().filter?.dueDate ?? '')
    const priority = useComputed(() => sortFilter.get().filter?.priority ?? '')
    const onInputChange = (colId: keyof Todo) => (e: { target: { value: string } }) => {
        const value = sortFilter.get();
        sortFilter.set({...value, filter: {...value.filter, [colId]: e.target.value}})
    }
    return <>

        <ResizeableProvider colId={'no'} cellsWidth={cellsWidth} className={'border-r bg-darken-2 shrink-0'}
                            style={{width: 35}}>
            <div className={'flex col'}>
                <div className={'p-5 font-medium'}>No.</div>
            </div>
        </ResizeableProvider>
        <ResizeableProvider colId={'title'} cellsWidth={cellsWidth} className={'border-r'}
                            style={{width: '70%'}}>
            <div className={'flex col bg-darken-2'}>
                <div className={'p-5 border-b font-medium'}>Title</div>
                <notifiable.input className={'flex col border-none h-30 border-t p-5 text-uppercase'} value={title}
                                  onChange={onInputChange('title')}/>
            </div>
        </ResizeableProvider>
        <Visible onDesktop={true}>
            <ResizeableProvider colId={'description'} cellsWidth={cellsWidth} className={'border-r'}
                                style={{width: '30%'}}>
                <div className={'flex col bg-darken-2'}>
                    <div className={'p-5 border-b font-medium'}>Description</div>
                    <notifiable.input className={'flex col border-none h-30 border-t p-5 text-uppercase'}
                                      value={description}
                                      onChange={onInputChange('description')}/>
                </div>
            </ResizeableProvider>
        </Visible>
        <Visible onDesktop={true} onTablet={true}>
            <ResizeableProvider colId={'dueDate'} cellsWidth={cellsWidth} className={'border-r'}
                                style={{width: 200}}>
                <div className={'flex col bg-darken-2'}>
                    <div className={'p-5 border-b flex col align-center font-medium'}>Due Date</div>
                    <notifiable.input className={'flex col border-none h-30 border-t p-5 text-uppercase'}
                                      value={dueDate}
                                      onChange={onInputChange('dueDate')}/>
                </div>
            </ResizeableProvider>
        </Visible>
        <ResizeableProvider colId={'priority'} cellsWidth={cellsWidth} className={'border-r'}
                            style={{width: 70}}>
            <div className={'flex col bg-darken-2'}>
                <div className={'p-5 border-b font-medium'}>Priority</div>
                <notifiable.input className={'flex col border-none h-30 border-t p-5 text-uppercase'} value={priority}
                                  onChange={onInputChange('priority')}/>
            </div>
        </ResizeableProvider>
        <Visible onDesktop={true}>
        <ResizeableProvider colId={'edit'} cellsWidth={cellsWidth} className={'border-r p-5 bg-darken-2'}
                            style={{width: 50}}></ResizeableProvider>
        </Visible>
        <Visible onDesktop={true}>
        <ResizeableProvider colId={'delete'} cellsWidth={cellsWidth} className={'border-r p-5 bg-darken-2'}
                            style={{width: 50}}></ResizeableProvider>
        </Visible>
        <div className={'flex col shrink-0 bg-darken-2'} style={{width: 15}}></div>
    </>
}