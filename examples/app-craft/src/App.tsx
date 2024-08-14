import AppDesigner, {Application} from "./app-designer/AppDesigner.tsx";
import {useState} from "react";

export function App() {
    const [value, setValue] = useState<Application>(() => {
        const val = localStorage.getItem('app-designer');
        if (val && val.length > 0) {
            return JSON.parse(val);
        }
        return [];
    });
    return <AppDesigner value={value} onChange={(val) => {
        localStorage.setItem('app-designer', JSON.stringify(val));
        setValue(val);
    }}/>
}
