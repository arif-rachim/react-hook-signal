import {Callable, Container, Fetcher, Page, Variable} from "../../app/designer/AppDesigner.tsx";
import {useAppContext} from "./useAppContext.ts";
import {useUpdateApplication} from "./useUpdateApplication.ts";
import {Query} from "../../app/designer/panels/database/getTables.ts";

type ParamVariable = {
    type: 'variable',
    variables: Array<Variable>,
    pageId?: string
}
type ParamContainer = {
    type: 'container',
    containers: Array<Container>,
    pageId?: string
}
type ParamPageName = {
    type: 'page-name',
    name: string,
    pageId?: string
}
type ParamDeletePage = {
    type: 'delete-page',
    pageId?: string
}
type ParamAddPage = {
    type: 'add-page',
    page: Page,
    pageId?: string
}

type ParamFetcher = {
    type: 'fetcher',
    fetchers: Array<Fetcher>,
    pageId?: string
}

type ParamCallable = {
    type: 'callable',
    callables: Array<Callable>,
    pageId?: string
}

type ParamQuery = {
    type: 'query',
    queries: Array<Query>,
    pageId?: string
}

export function useUpdatePageSignal() {
    const {allPagesSignal, activePageIdSignal} = useAppContext();
    const updateApplication = useUpdateApplication();
    return function updatePage(param: ParamVariable | ParamContainer | ParamPageName | ParamDeletePage | ParamAddPage | ParamFetcher | ParamCallable | ParamQuery) {
        const allPages = [...allPagesSignal.get()];
        const pageId = param.pageId ?? activePageIdSignal.get();
        const page = allPages.find(i => i.id === pageId);
        if (param.type === 'add-page') {
            allPages.push(param.page)
            updateApplication(application => {
                application.pages = allPages;
            })
        } else if (page) {
            if (param.type === 'fetcher') {
                allPages.splice(allPages.indexOf(page), 1, {...page, fetchers: param.fetchers});
            }
            if (param.type === 'query') {
                allPages.splice(allPages.indexOf(page), 1, {...page, queries: param.queries});
            }
            if (param.type === 'callable') {
                allPages.splice(allPages.indexOf(page), 1, {...page, callables: param.callables});
            }
            if (param.type === 'variable') {
                allPages.splice(allPages.indexOf(page), 1, {...page, variables: param.variables});
            }
            if (param.type === 'container') {
                allPages.splice(allPages.indexOf(page), 1, {...page, containers: param.containers});
            }
            if (param.type === 'page-name') {
                allPages.splice(allPages.indexOf(page), 1, {...page, name: param.name});
            }
            if (param.type === 'delete-page') {
                allPages.splice(allPages.indexOf(page), 1);
            }
            updateApplication(application => {
                application.pages = allPages;
            })
        }
    }
}
