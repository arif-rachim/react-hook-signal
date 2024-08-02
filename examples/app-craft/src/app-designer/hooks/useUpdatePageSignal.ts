import {Container, Page, Variable} from "../AppDesigner.tsx";
import {useAppContext} from "./useAppContext.ts";

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

export function useUpdatePageSignal() {
    const {allPagesSignal, activePageIdSignal} = useAppContext();
    return function updatePage(param: ParamVariable | ParamContainer | ParamPageName | ParamDeletePage | ParamAddPage) {
        const allPages = [...allPagesSignal.get()];
        const pageId = param.pageId ?? activePageIdSignal.get();
        const page = allPages.find(i => i.id === pageId);
        if (page) {
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
            if (param.type === 'add-page') {
                allPages.push(param.page)
            }
            allPagesSignal.set(allPages);
        }
    }
}