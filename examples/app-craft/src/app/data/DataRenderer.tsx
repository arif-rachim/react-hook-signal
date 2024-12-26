import {CSSProperties, ForwardedRef, forwardRef, memo, useEffect, useState} from "react";
import {Page} from "../designer/AppDesigner.tsx";
import {useAppContext} from "../../core/hooks/useAppContext.ts";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {PageViewer} from "../viewer/PageViewer.tsx";

export const DataRenderer = memo(forwardRef(DataRendererFC));

function DataRendererFC(props: {
    component: string,
    style: CSSProperties
}, ref: unknown) {

    const {style: propsStyle, component, ...properties} = props;
    const componentIdSignal = useSignal(component);
    const {allPagesSignal, elements, applicationSignal, navigate} = useAppContext();
    const [page, setPage] = useState<Page | undefined>(() => {
        const allPages = allPagesSignal.get();
        const componentId = componentIdSignal.get();
        return allPages.find(p => p.id === componentId);
    });

    const style: CSSProperties = {
        display: 'flex',
        minHeight: 20,
        minWidth: 20,
        ...propsStyle
    }
    // Following code commented cause creating bug
    // if (page === undefined) {
        //style.border = '1px dashed rgba(0,0,0,0.1)'
    // }
    useEffect(() => {
        componentIdSignal.set(component)
    }, [component, componentIdSignal]);

    useSignalEffect(() => {
        const allPages = allPagesSignal.get();
        const componentId = componentIdSignal.get();
        const page = allPages.find(p => p.id === componentId);
        setPage(page);
    });
    const appConfig = applicationSignal.get();

    return <div ref={ref as ForwardedRef<HTMLDivElement>} style={style}>
        {page && <PageViewer
            elements={elements}
            page={page!}
            appConfig={appConfig}
            value={properties} navigate={navigate}/>}
    </div>
}