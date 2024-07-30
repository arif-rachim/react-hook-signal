import {notifiable} from "react-hook-signal";
import {BORDER} from "../Border.ts";
import {PropertiesPanel} from "../panels/properties/PropertiesPanel.tsx";
import {StylePanel} from "../panels/style/StylePanel.tsx";

export function RightPanel() {

    return <notifiable.div
        style={{
            width: 250,
            backgroundColor: 'rgba(0,0,0,0.01)',
            borderLeft: BORDER,
            display: 'flex',
            flexShrink: 0,
            flexDirection: 'column',
            overflow: 'auto'
        }}>
        <StylePanel/>
        <PropertiesPanel/>
    </notifiable.div>;
}
