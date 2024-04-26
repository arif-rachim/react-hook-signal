import {Signal} from "signal-polyfill";
import {Todo} from "../../model/Todo.ts";
import {SortFilter} from "../../App.tsx";
import {GridHeaderColumnSizeNotifier} from "./GridHeaderColumnSizeNotifier.tsx";
import {notifiable} from "../../../../../src/components.ts";
import {Visible} from "../Visible.tsx";

/**
 * Represents the header component of a grid.
 *
 * @param {object} props - The props that are passed to the GridHeader component.
 * @param {Signal.State<Partial<{ [K in keyof Todo]: number }>>} props.cellsWidth - The state that holds the width of each grid cell.
 * @param {Signal.State<SortFilter>} props.sortFilter - The state that holds the sort and filter options.
 *
 * @constructor
 *
 * @return {JSX.Element} - The JSX element representing the grid header.
 */
export function GridHeader(props: {
    cellsWidth: Signal.State<Partial<{ [K in keyof Todo]: number }>>,
    sortFilter: Signal.State<SortFilter>
}): JSX.Element {
    const {cellsWidth, sortFilter} = props;

    /**
     * The `title` variable is a computed value that uses the `sortFilter.get().filter?.title` property if it exists, otherwise it uses an empty string.
     *
     * @returns {string} The computed title value.
     */
    const title = new Signal.Computed(() => sortFilter.get().filter?.title ?? '')

    /**
     * Returns the description value from the filtered result of the sort filter,
     * or an empty string if the description is not available.
     *
     * @returns {string} The description value from the filtered result.
     */
    const description = new Signal.Computed(() => sortFilter.get().filter?.description ?? '')

    /**
     * Represents the due date of a task or an item.
     *
     * @typedef {string} DueDate
     */
    const dueDate = new Signal.Computed(() => sortFilter.get().filter?.dueDate ?? '')

    /**
     * Calculates the priority value based on the sort filter.
     *
     * @function useComputed
     * @param {Function} callback - A callback function to calculate the priority value.
     * @returns {string} - The calculated priority value.
     */
    const priority = new Signal.Computed(() => sortFilter.get().filter?.priority ?? '')

    /**
     * Updates the filter value for a specific column ID based on an input change event.
     *
     * @param {keyof Todo} colId - The ID of the column to update the filter value for.
     * @param {Object} e - The input change event object.
     * @param {Object} e.target - The target property of the event object.
     * @param {string} e.target.value - The value of the target input element.
     */
    const onInputChange = (colId: keyof Todo) => (e: { target: { value: string } }) => {
        const value = sortFilter.get();
        sortFilter.set({...value, filter: {...value.filter, [colId]: e.target.value}})
    }
    return <>

        <GridHeaderColumnSizeNotifier colId={'no'} cellsWidth={cellsWidth} className={'border-r bg-darken-2 shrink-0'}
                                      style={{width: 35}}>
            <div className={'flex col'}>
                <div className={'p-5 font-medium'}>No.</div>
            </div>
        </GridHeaderColumnSizeNotifier>
        <GridHeaderColumnSizeNotifier colId={'title'} cellsWidth={cellsWidth} className={'border-r'}
                                      style={{width: '100%'}}>
            <div className={'flex col bg-darken-2'}>
                <div className={'p-5 border-b font-medium'}>Title</div>
                <notifiable.input className={'flex col border-none h-30 border-t p-5 text-uppercase'} value={title}
                                  onChange={onInputChange('title')}/>
            </div>
        </GridHeaderColumnSizeNotifier>
        <Visible onDesktop={true}>
            <GridHeaderColumnSizeNotifier colId={'description'} cellsWidth={cellsWidth} className={'border-r'}
                                          style={{width: '30%'}}>
                <div className={'flex col bg-darken-2'}>
                    <div className={'p-5 border-b font-medium'}>Description</div>
                    <notifiable.input className={'flex col border-none h-30 border-t p-5 text-uppercase'}
                                      value={description}
                                      onChange={onInputChange('description')}/>
                </div>
            </GridHeaderColumnSizeNotifier>
        </Visible>
        <Visible onDesktop={true} onTablet={true}>
            <GridHeaderColumnSizeNotifier colId={'dueDate'} cellsWidth={cellsWidth} className={'border-r'}
                                          style={{width: 200}}>
                <div className={'flex col bg-darken-2'}>
                    <div className={'p-5 border-b flex col align-center font-medium'}>Due Date</div>
                    <notifiable.input className={'flex col border-none h-30 border-t p-5 text-uppercase'}
                                      value={dueDate}
                                      onChange={onInputChange('dueDate')}/>
                </div>
            </GridHeaderColumnSizeNotifier>
        </Visible>
        <GridHeaderColumnSizeNotifier colId={'priority'} cellsWidth={cellsWidth} className={'border-r'}
                                      style={{width: 70}}>
            <div className={'flex col bg-darken-2'}>
                <div className={'p-5 border-b font-medium'}>Priority</div>
                <notifiable.input className={'flex col border-none h-30 border-t p-5 text-uppercase'} value={priority}
                                  onChange={onInputChange('priority')}/>
            </div>
        </GridHeaderColumnSizeNotifier>
        <Visible onDesktop={true}>
        <GridHeaderColumnSizeNotifier colId={'edit'} cellsWidth={cellsWidth} className={'border-r p-5 bg-darken-2'}
                                      style={{width: 50}}></GridHeaderColumnSizeNotifier>
        </Visible>
        <Visible onDesktop={true}>
        <GridHeaderColumnSizeNotifier colId={'delete'} cellsWidth={cellsWidth} className={'border-r p-5 bg-darken-2'}
                                      style={{width: 50}}></GridHeaderColumnSizeNotifier>
        </Visible>
        <div className={'flex col shrink-0 bg-darken-2'} style={{width: 15}}></div>
    </>
}