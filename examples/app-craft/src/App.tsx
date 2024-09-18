import AppDesigner, {Application} from "./app-designer/AppDesigner.tsx";
import {useState} from "react";

export function App() {
    const [value, setValue] = useState<Application>(() => {
        const val = localStorage.getItem('app-designer');
        if (val && val.length > 0) {
            const app = JSON.parse(val) as Application;
            app?.pages?.forEach(p => {
                if(!p.name){
                    p.name = 'anonymous'
                }
            })
            return app as Application;
        }
        return {} as Application;
    });
    return <AppDesigner value={value} onChange={(val) => {
        localStorage.setItem('app-designer', JSON.stringify(val));
        setValue(val);
    }}/>
}
