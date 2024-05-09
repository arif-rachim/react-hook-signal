import {notifiable, useComputed} from "react-hook-signal";
import {IoArrowBack, IoArrowForward} from "react-icons/io5";
import {useListContext} from "./useListContext.ts";

export function Paging() {

    const contextSignal = useListContext();

    const totalPages = useComputed(() => {
        const context = contextSignal.get();
        const dataLength = context?.data.get().length ?? 0;
        const templatePerSegmentValue = context?.totalTemplatePerSegment.get() ?? 1;
        return Math.ceil(dataLength / templatePerSegmentValue);
    })

    const paginationArray = useComputed(() => {
        const context = contextSignal.get();
        const currentScrollSegmentValue = context?.currentScrollSegment.get() ?? 0
        return generatePaginationArray((currentScrollSegmentValue ?? 0) + 1, totalPages.get() ?? 1)
    });

    const elements = useComputed(() => {
        const context = contextSignal.get();
        const cpValue = context?.currentScrollSegment.get() ?? 0
        const templateHeight = context?.templateHeight.get() ?? 0;
        const templatePerSegment = context?.totalTemplatePerSegment.get() ?? 0
        return (paginationArray.get() ?? []).map(page => {
            const isSelected = cpValue === (page - 1);
            return <div style={{
                fontSize: '0.8rem',
                paddingBottom: 2,
                borderRadius: '5rem',
                border: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: isSelected ? '#666' : '#FAFAFA',
                color: isSelected ? '#FFF' : '#333',
                width: '1.85rem',
                height: '1.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 3,
                userSelect: 'none',
                cursor: 'pointer',
                fontWeight: 500
            }} onClick={() => {
                const offset = (page - 1) * templateHeight * templatePerSegment;
                if (context?.containerLevelOne()) {
                    context.containerLevelOne().scrollTop = offset;
                }
            }} key={page}>{page}</div>
        })
    })
    return <div style={{display: 'flex', gap: 5, justifyContent: 'center'}}>
        <div style={{userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
             onClick={() => {
                 if (contextSignal.get()?.containerLevelOne()) {
                     contextSignal.get()!.containerLevelOne().scrollTop = 0;
                 }
             }}>
            <IoArrowBack style={{color: '#666', fontSize: '1.6rem', cursor: 'pointer'}}/>
        </div>
        <notifiable.div style={{display: 'flex', gap: 5, justifyContent: 'center'}}>{elements}</notifiable.div>
        <div style={{userSelect: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
             onClick={() => {
                 const templateHeight = contextSignal.get()?.templateHeight.get() ?? 0;
                 const templatePerSegment = contextSignal.get()?.totalTemplatePerSegment.get() ?? 0
                 const offset = (totalPages.get() - 1) * templateHeight * templatePerSegment;

                 if (contextSignal.get()?.containerLevelOne()) {
                     contextSignal.get()!.containerLevelOne().scrollTop = offset;
                 }
             }}>
            <IoArrowForward style={{color: '#666', fontSize: '1.6rem', cursor: 'pointer'}}/>
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