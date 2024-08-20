import {CSSProperties, ForwardedRef, forwardRef, memo, useEffect, useState} from "react";
import {Page} from "../AppDesigner.tsx";
import {useAppContext} from "../hooks/useAppContext.ts";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {PageViewer} from "../../app-viewer/PageViewer.tsx";

export const DataGroup = memo(forwardRef(DataGroupFC), (prevProps, nextProps) => {
    if (prevProps.component !== nextProps.component) {
        return false;
    }
    if (prevProps.keyId !== nextProps.keyId) {
        return false;
    }
    if (prevProps.data !== nextProps.data) {
        return false;
    }
    return prevProps.direction === nextProps.direction;

});


function DataGroupFC(props: {
    component: string,
    style: CSSProperties,
    data: Array<Record<string, unknown>>,
    direction: 'vertical' | 'horizontal',
    keyId: string
}, ref: unknown) {
    const max_page = 50;
    const {keyId, direction, style: propsStyle, data, component} = props;
    const [page, setPage] = useState<Page | undefined>(undefined);
    const style: CSSProperties = {
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        overflow: 'auto',
        minHeight: 20,
        minWidth: 20,
        ...propsStyle
    }

    const {allPagesSignal, elements, allTablesSignal,allCallablesSignal} = useAppContext();
    const componentIdSignal = useSignal(component);
    useEffect(() => {
        componentIdSignal.set(component)
    }, [component, componentIdSignal]);

    useSignalEffect(() => {
        const allPages = allPagesSignal.get();
        const componentId = componentIdSignal.get();
        const page = allPages.find(p => p.id === componentId);
        setPage(page);
    });
    const dataPerPage = (data ?? []).filter((_,index) => {
        return index < max_page;
    });
    return <div ref={ref as ForwardedRef<HTMLDivElement>} style={style}>
        {page && dataPerPage.map((item, index) => {

            // here we need to render page
            let key: string = index.toString();
            if (item !== undefined && item !== null && typeof item === 'object' && keyId in item) {
                key = (item[keyId] as string).toString();
            }
            return <PageViewer
                elements={elements}
                page={page!}
                key={key}
                allTables={allTablesSignal.get()}
                allCallables={allCallablesSignal.get()}
                {...item}/>
        })}
    </div>
}