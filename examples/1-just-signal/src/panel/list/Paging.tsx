import {Signal} from "signal-polyfill";
import {AnySignal, notifiable} from "../../../../../src/components.ts";
import {Todo} from "../../model/Todo.ts";
import {useComputed} from "../../../../../src/hooks.ts";

export function Paging(props: {
    currentPage: AnySignal<number>,
    totalRowPerPage: Signal.State<number>,
    data: AnySignal<Todo[]>
    disabled: AnySignal<boolean>,
    onPageChange: (page: number) => void
}) {

    const {currentPage, totalRowPerPage, data, onPageChange} = props;
    const buttons = useComputed(() => {
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
