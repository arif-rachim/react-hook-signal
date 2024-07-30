import {ErrorsPanel} from "../panels/errors/ErrorsPanel.tsx";


export function BottomPanel() {
    return <div style={{display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,1'}}>
        <ErrorsPanel/>
    </div>
}