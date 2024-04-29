import {Signal} from "signal-polyfill";
import {AnySignal, notifiable} from "react-hook-signal"
import {Todo} from "../../model/Todo.ts";

/**
 * Represents a pagination component for a grid view.
 *
 * @param {Object} props - The props object containing the necessary parameters.
 * @param {AnySignal<number>} props.currentPage - The current page number.
 * @param {Signal.State<number>} props.totalRowPerPage - The number of rows per page.
 * @param {AnySignal<Todo[]>} props.data - The data to be paginated.
 * @param {AnySignal<boolean>} props.disabled - Whether the pagination is disabled.
 * @param {function} props.onPageChange - The callback function for page change events.
 *
 * @returns {JSX.Element} - The JSX element representing the pagination component.
 */
export function GridPagination(props: {
    currentPage: AnySignal<number>,
    totalRowPerPage: Signal.State<number>,
    data: AnySignal<Todo[]>
    disabled: AnySignal<boolean>,
    onPageChange: (page: number) => void
}): JSX.Element {

    const {currentPage, totalRowPerPage, data, onPageChange} = props;

    /**
     * Function to generate pagination buttons based on current page, total rows per page, and data
     *
     * @returns {Array} Array of JSX elements representing pagination buttons
     */
    const buttons = new Signal.Computed(() => {
        const currentPageValue = currentPage.get();
        const totalRowPerPageValue = totalRowPerPage.get();
        const dataValue = data.get();
        const totalRecords = dataValue.length;
        const totalPages = Math.ceil(totalRecords / totalRowPerPageValue);
        return generatePaginationArray(currentPageValue, totalPages).map((page, index) => {
            const isCurrentPage = page === currentPageValue;
            return <div key={index} className={`button-circle ${isCurrentPage ? 'bg-selected' : 'bg-darken-1'}`}
                        onClick={async () => onPageChange(page)}>{page}</div>
        })
    })

    return <div className={'flex justify-center'}>
        <notifiable.div className={'flex row gap-5'}>{buttons}</notifiable.div>
    </div>
}

/**
 * Generates a pagination array based on the current page and total number of pages.
 *
 * @param {number} currentPage - The current page number.
 * @param {number} totalPages - The total number of pages.
 * @return {number[]} - The pagination array.
 */
function generatePaginationArray(currentPage: number, totalPages: number): number[] {
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
