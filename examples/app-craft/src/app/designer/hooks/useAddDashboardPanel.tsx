import {useContext} from "react";
import {DashboardContext, Panel, PanelInstance} from "../../Dashboard.tsx";
import {guid} from "../../../core/utils/guid.ts";
import {useAppContext} from "../../../core/hooks/useAppContext.ts";
import {addCenterPanel} from "../../centerPanelStacks.ts";

export function useAddDashboardPanel() {
    const {panelsSignal, selectedPanelSignal} = useContext(DashboardContext);
    const {activePageIdSignal} = useAppContext();
    return function addPanel(panel: Panel & {
        id?: string,
        tag: PanelInstance['tag']
    }) {
        panel.id = panel.id ?? guid();
        const panels = panelsSignal.get();
        const isEmpty = panels.find(p => p.id === panel.id) === undefined;
        if (isEmpty) {
            panelsSignal.set([...panels, {...panel, id: panel.id, pageId: activePageIdSignal.get()}]);
        }
        selectedPanelSignal.set({...selectedPanelSignal.get(), [panel.position]: panel.id});
        if(panel.position === 'mainCenter'){
            addCenterPanel(panel.id);
        }
    }
}