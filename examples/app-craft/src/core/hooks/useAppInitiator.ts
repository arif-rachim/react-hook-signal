import {LayoutBuilderProps} from "../../app/designer/LayoutBuilderProps.ts";
import {useComputed, useSignal, useSignalEffect} from "react-hook-signal";
import {createNewBlankApplication} from "../../app/designer/createNewBlankApplication.ts";
import {Query, Table} from "../../app/designer/panels/database/getTables.ts";
import {Signal} from "signal-polyfill";
import {ErrorType} from "../ErrorType.ts";
import {useEffect, useMemo} from "react";
import {Application, Callable, Container, Fetcher, Page, Variable, VariableInstance} from "../../app/designer/AppDesigner.tsx";

export function useAppInitiator(props: LayoutBuilderProps & {
    startingPage?: string,
    displayMode?: 'design' | 'view'
}) {
    const applicationSignal = useSignal(createNewBlankApplication());

    const allApplicationCallablesSignal = useComputed(() => applicationSignal.get().callables ?? []);
    const allPagesSignal = useComputed<Array<Page>>(() => applicationSignal.get().pages ?? []);

    const allTablesSignal = useComputed<Array<Table>>(() => applicationSignal.get().tables ?? []);
    const allApplicationQueriesSignal = useComputed(() => applicationSignal.get().queries ?? []);
    useSignalEffect(() => {
        const allPages = allPagesSignal.get();
        if (props.startingPage) {
            const startingPageId = allPages.find(p => {
                return p.name === props.startingPage;
            })?.id ?? '';
            activePageIdSignal.set(startingPageId);
        }
    })
    const activePageIdSignal = useSignal<string>('');
    const activeDropZoneIdSignal = useSignal('');
    const selectedDragContainerIdSignal = useSignal('');
    const hoveredDragContainerIdSignal = useSignal('');

    const uiDisplayModeSignal = useSignal<'design' | 'view'>(props.displayMode ?? 'view');
    const variableInitialValueSignal = useSignal<Record<string, unknown>>({});
    const allApplicationVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);

    const allPageVariablesSignalInstance: Signal.State<VariableInstance[]> = useSignal<Array<VariableInstance>>([]);
    const allErrorsSignal = useSignal<Array<ErrorType>>([]);

    const activePageSignal = useComputed(() => {
        const activePageId = activePageIdSignal.get();
        const allPages = allPagesSignal.get();
        return allPages.find(i => i.id === activePageId)
    })
    const allApplicationVariablesSignal = useComputed<Array<Variable>>(() => applicationSignal.get().variables ?? []);
    const allPageVariablesSignal = useComputed<Array<Variable>>(() => activePageSignal.get()?.variables ?? []);
    const allContainersSignal = useComputed<Array<Container>>(() => activePageSignal.get()?.containers ?? []);
    const allApplicationFetchersSignal = useComputed<Array<Fetcher>>(() => applicationSignal.get()?.fetchers ?? []);
    const allPageFetchersSignal = useComputed<Array<Fetcher>>(() => activePageSignal.get()?.fetchers ?? []);
    const allPageCallablesSignal = useComputed<Array<Callable>>(() => activePageSignal.get()?.callables ?? []);
    const allPageQueriesSignal = useComputed<Array<Query>>(() => activePageSignal.get()?.queries ?? []);

    const allVariablesSignalInstance = useComputed(() => [...allPageVariablesSignalInstance.get(), ...allApplicationVariablesSignalInstance.get()])
    const allVariablesSignal = useComputed(() => [...allPageVariablesSignal.get(), ...allApplicationVariablesSignal.get()])
    const allFetchersSignal = useComputed(() => [...allPageFetchersSignal.get(), ...allApplicationFetchersSignal.get()])
    const allQueriesSignal = useComputed(() => [...allPageQueriesSignal.get(), ...allApplicationQueriesSignal.get()])
    const allCallablesSignal = useComputed(() => [...allPageCallablesSignal.get(), ...allApplicationCallablesSignal.get()])
    const {value, onChange} = props;
    useEffect(() => {
        validateAndFixAppMeta(value);
        applicationSignal.set(value);
        if (value && value.pages && value.pages.length > 0) {
            const currentActivePageId = activePageIdSignal.get();
            const hasSelection = value.pages.findIndex(i => i.id === currentActivePageId) >= 0;
            if (!hasSelection) {
                allErrorsSignal.set([]);
                variableInitialValueSignal.set({});
                activePageIdSignal.set(value.pages[0].id);
            }
        }
    }, [activePageIdSignal, allErrorsSignal, applicationSignal, value, variableInitialValueSignal]);

    useSignalEffect(() => {
        onChange(applicationSignal.get());
    })

    const navigate = useMemo(() => {
        return async function navigate(path: string, param?: unknown) {
            const page = allPagesSignal.get().find(p => p.name === path);
            if (page === undefined) {
                return;
            }
            if (uiDisplayModeSignal && uiDisplayModeSignal.get() === 'design') {
                alert('Please switch to view mode to navigate');
                return;
            }
            allErrorsSignal.set([]);
            variableInitialValueSignal.set(param as Record<string, unknown> ?? {});
            activePageIdSignal.set(page.id);
        }
    }, [activePageIdSignal, allErrorsSignal, allPagesSignal, uiDisplayModeSignal, variableInitialValueSignal]);


    return {
        applicationSignal,
        allApplicationCallablesSignal,
        allPagesSignal,
        allTablesSignal,
        activePageIdSignal,
        activeDropZoneIdSignal,
        selectedDragContainerIdSignal,
        hoveredDragContainerIdSignal,
        uiDisplayModeSignal,
        variableInitialValueSignal,
        allApplicationVariablesSignalInstance,
        allPageVariablesSignalInstance,
        allErrorsSignal,
        allApplicationVariablesSignal,
        allPageVariablesSignal,
        allContainersSignal,
        allPageFetchersSignal,
        allApplicationFetchersSignal,
        allPageCallablesSignal,
        allApplicationQueriesSignal,
        allPageQueriesSignal,

        allVariablesSignalInstance,
        allVariablesSignal,
        allFetchersSignal,
        allQueriesSignal,
        allCallablesSignal,

        navigate
    };
}

function validateAndFixAppMeta(value:Application):Application{

    for (const p of value.pages) {
        for (const parent of p.containers) {
            if(!parent.children){
                p.containers.splice(p.containers.indexOf(parent), 1);
                continue;
            }
            for (const child of parent.children) {
                const isOrphan = p.containers.findIndex(c => c.id === child) <= 0;
                if(isOrphan){
                    p.containers.push({
                        type : 'title',
                        children : [],
                        parent : parent.id,
                        id : child,
                        properties : {
                            title : {
                                formula : 'module.exports = "Missing Component Registry"'
                            }
                        }
                    })
                }
            }
        }
    }

    return value;
}