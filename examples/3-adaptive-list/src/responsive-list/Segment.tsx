import {TemplateContext} from "./TemplateContext.ts";
import React, {useContext, useState} from "react";
import {ListContextData, TemplateContextData} from "./types.ts";
import {ListContext} from "./ListContext.ts";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {TemplateComp} from "./TemplateComp.tsx";

export function Segment<DataItem,BreakPoint,CellRenderer,Template>(props:{startingPage:number}){
    const ResponsiveTemplateContext = TemplateContext as React.Context<TemplateContextData<DataItem>>;

    const {currentScrollSegment,segmentCurrentlyBeingRendered,data,totalTemplatePerSegment,totalOffsetSegment,totalSegment} = useContext(ListContext)  as ListContextData<DataItem,BreakPoint, CellRenderer, Template>;
    const currentPage = useSignal(props.startingPage);
    const [dataItems,setDataItems] = useState<Array<DataItem>>([]);
    useSignalEffect(() => {
        // here we remove one page before to improve rendering !
        const totalSegmentValue = totalSegment.get();
        const totalOffsetSegmentValue = totalOffsetSegment.get();
        const currentScrollSegmentValue = currentScrollSegment.get() - totalOffsetSegmentValue;
        const segmentCurrentlyBeingRenderedValue = segmentCurrentlyBeingRendered.get();
        const currentPageValue = currentPage.get();
        const pagesToRender = Array.from({length:totalSegmentValue}).map((_,index) => currentScrollSegmentValue + index);

        const pagesThatRequiredToBeRendered = pagesToRender.filter(page => segmentCurrentlyBeingRenderedValue.indexOf(page)<0);
        const pagesThatExpiredFromRendering = segmentCurrentlyBeingRenderedValue.filter(page => pagesToRender.indexOf(page)<0);
        const engineNeedsToPickupANewData = pagesThatExpiredFromRendering.indexOf(currentPageValue) >= 0 && pagesThatRequiredToBeRendered.length > 0;

        if(engineNeedsToPickupANewData){
            const pageToRender = pagesThatRequiredToBeRendered[0];
            currentPage.set(pageToRender);
            segmentCurrentlyBeingRendered.set([...segmentCurrentlyBeingRenderedValue.filter(i => i !== currentPageValue),pageToRender]);
        }
    });

    useSignalEffect(() => {
        const currentPageValue = currentPage.get();
        const renderedDataPerPage= totalTemplatePerSegment.get();
        const dataValue = data.get();
        const start = currentPageValue * renderedDataPerPage;
        const end = (currentPageValue + 1) * renderedDataPerPage;
        setDataItems(dataValue.slice(start,end))
    })

    const start = currentPage.get() * totalTemplatePerSegment.get();
    return dataItems.map((item,idx) => {
        const index = start + idx;
        return <ResponsiveTemplateContext.Provider value={{item, index}} key={index}>
            <TemplateComp/>
        </ResponsiveTemplateContext.Provider>
    })
}