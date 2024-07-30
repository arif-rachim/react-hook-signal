import {BORDER} from "../Border.ts";
import {ElementsPanel} from "../panels/elements/ElementsPanel.tsx";
import {PagesPanel} from "../panels/pages/PagesPanel.tsx";
import {VariablesPanel} from "../panels/variables/VariablesPanel.tsx";

export function LeftPanel() {
    return <div style={{
        display: 'flex',
        backgroundColor: 'rgba(0,0,0,0.01)',
        flexDirection: 'column',
        width: 250,
        flexShrink: 0,
        borderRight: BORDER,
        overflow: 'auto'
    }}>
        <PagesPanel/>
        <ElementsPanel/>
        <VariablesPanel/>
    </div>
}

