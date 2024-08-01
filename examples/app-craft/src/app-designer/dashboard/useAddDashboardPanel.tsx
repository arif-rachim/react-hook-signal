import {useContext} from "react";
import {DashboardContext, Panel} from "./Dashboard.tsx";
import {guid} from "../../utils/guid.ts";
import {AppDesignerContext} from "../AppDesignerContext.ts";

export function useAddDashboardPanel() {
    const {panelsSignal, selectedPanelSignal} = useContext(DashboardContext);
    const {activePageIdSignal} = useContext(AppDesignerContext);
    return function addPanel(panel: Panel & { id?: string }) {
        panel.id = panel.id ?? guid();
        const panels = panelsSignal.get();
        const isEmpty = panels.find(p => p.id === panel.id) === undefined;
        if (isEmpty) {
            panelsSignal.set([...panels, {...panel, id: panel.id, pageId: activePageIdSignal.get()}]);
        }
        selectedPanelSignal.set({...selectedPanelSignal.get(), [panel.position]: panel.id});
    }
}