import {useContext} from "react";
import {DashboardContext, Panel} from "./Dashboard.tsx";
import {guid} from "../utils/guid.ts";

export function useAddDashboardPanel() {
    const {panelsSignal,selectedPanelSignal} = useContext(DashboardContext);
    return function addPanel(panel: Panel & {id?:string}) {
        panel.id = panel.id ?? guid();
        const panels = panelsSignal.get();
        const isEmpty = panels.find(p => p.id === panel.id) === undefined;
        if(isEmpty){
            panelsSignal.set([...panels, {...panel,id:panel.id}]);
        }
        selectedPanelSignal.set({...selectedPanelSignal.get(),[panel.position]:panel.id});
    }
}