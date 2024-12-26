import {CSSProperties, ForwardedRef, forwardRef, memo, useEffect, useState} from "react";
import {Page} from "../designer/AppDesigner.tsx";
import {useAppContext} from "../../core/hooks/useAppContext.ts";
import {useSignal, useSignalEffect} from "react-hook-signal";
import {PageViewer} from "../viewer/PageViewer.tsx";
import {isEmpty} from "../../core/utils/isEmpty.ts";

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
    const componentIdSignal = useSignal(component);
    const {allPagesSignal, elements, applicationSignal, navigate} = useAppContext();

    const [page, setPage] = useState<Page | undefined>(() => {
        const allPages = allPagesSignal.get();
        const componentId = componentIdSignal.get();
        return allPages.find(p => p.id === componentId);
    });

    const style: CSSProperties = {
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        overflow: 'auto',
        minHeight: 20,
        minWidth: 20,
        ...propsStyle
    }

    useEffect(() => {
        componentIdSignal.set(component)
    }, [component, componentIdSignal]);

    useSignalEffect(() => {
        const allPages = allPagesSignal.get();
        const componentId = componentIdSignal.get();
        const page = allPages.find(p => p.id === componentId);
        setPage(page);
    });
    const dataPerPage = (data ?? []).filter((_, index) => {
        return index < max_page;
    });
    return <div ref={ref as ForwardedRef<HTMLDivElement>} style={style}>
        {page && dataPerPage.map((item, index) => {
            let key: string = index.toString();
            if (!isEmpty(keyId) && !isEmpty(item) && typeof item === 'object' && keyId in item && !isEmpty(item[keyId])) {
                key = (item[keyId] as string).toString();
            }
            return <PageViewer
                elements={elements}
                page={page!}
                key={key}
                appConfig={applicationSignal.get()}
                value={item}
                navigate={navigate}
            />
        })}
    </div>
}