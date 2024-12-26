import AppDesigner, {Application} from "./app/designer/AppDesigner.tsx";
import {useState} from "react";
import AppViewer from "./app/viewer/AppViewer.tsx";
import {Button} from "./app/button/Button.tsx";

export function App() {
    const [value, setValue] = useState<Application>(() => {
        const val = localStorage.getItem('app-designer');
        if (val && val.length > 0) {
            const app = JSON.parse(val) as Application;
            app?.pages?.forEach(p => {
                if (!p.name) {
                    p.name = 'anonymous'
                }
            })
            return app as Application;
        }
        return {} as Application;
    });
    const [designMode, setDesignMode] = useState(false);

    return <div style={{display: 'flex', width: '100%', height: '100%', flexDirection: 'column'}}>
        {designMode && <AppDesigner value={value} onChange={(val) => {
            localStorage.setItem('app-designer', JSON.stringify(val));
            setValue(val);
        }}/>}
        {!designMode && <AppViewer value={value} onChange={(val) => {
            localStorage.setItem('app-designer', JSON.stringify(val));
            setValue(val);
        }} startingPage={'adm/home/landing-page'}/>}
        <Button style={{position: 'absolute', bottom: 5, right: 5}} onClick={() => {
            setDesignMode(!designMode)
        }}>{designMode ? 'App' : 'Dev'}</Button>
    </div>
}
