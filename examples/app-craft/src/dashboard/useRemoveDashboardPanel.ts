import {useContext} from "react";
import {DashboardContext} from "./Dashboard.tsx";

export function useRemoveDashboardPanel() {
    const {panelsSignal, selectedPanelSignal} = useContext(DashboardContext);
    return function removePanel(panelId: string) {
        debugger;
        const panels = panelsSignal.get();
        const panelToRemove = panels.find(p => p.id === panelId)!;
        const position = panelToRemove.position;
        const filteredPanels = panels.filter(p => p.position === position);
        const panelIndex = filteredPanels.findIndex(p => p.id === panelId);
        if (panelIndex < filteredPanels.length - 1) {
            const nextPanel = filteredPanels[panelIndex + 1];
            selectedPanelSignal.set({...selectedPanelSignal.get(), [position]: nextPanel.id});
        } else if (panelIndex > 0) {
            const nextPanel = filteredPanels[panelIndex - 1];
            selectedPanelSignal.set({...selectedPanelSignal.get(), [position]: nextPanel.id});
        }
        panelsSignal.set(panels.filter(i => i.id !== panelId));
    }
}
