import {useContext} from "react";
import {DashboardContext} from "../../app/Dashboard.tsx";
import {useAppContext} from "../hooks/useAppContext.ts";
import {removeCenterPanel} from "../../app/centerPanelStacks.ts";

export function useRemoveDashboardPanel() {
    const {panelsSignal, selectedPanelSignal} = useContext(DashboardContext);
    const {activePageIdSignal, allPagesSignal} = useAppContext();
    return function removePanel(panelId: string) {
        const panels = panelsSignal.get();
        const panelToRemove = panels.find(p => p.id === panelId)!;
        const position = panelToRemove.position;
        const filteredPanels = panels.filter(p => p.position === position);
        const panelIndex = filteredPanels.findIndex(p => p.id === panelId);
        let nextPanelId = '';
        if (panelIndex < filteredPanels.length - 1) {
            const nextPanel = filteredPanels[panelIndex + 1];
            nextPanelId = nextPanel.id;
        } else if (panelIndex > 0) {
            const nextPanel = filteredPanels[panelIndex - 1];
            nextPanelId = nextPanel.id;
        }

        panelsSignal.set(panels.filter(i => i.id !== panelId));
        if(position === 'mainCenter'){
            nextPanelId = removeCenterPanel(panelId);
            if(allPagesSignal.get().findIndex(p => p.id === nextPanelId) > -1){
            activePageIdSignal.set(nextPanelId);
            }
        }
        if (nextPanelId) {
            selectedPanelSignal.set({...selectedPanelSignal.get(), [position]: nextPanelId});
        }
    }
}
