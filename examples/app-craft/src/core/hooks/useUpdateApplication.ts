import {Application} from "../../app/designer/AppDesigner.tsx";
import {useAppContext} from "./useAppContext.ts";

export function useUpdateApplication() {
    const {applicationSignal} = useAppContext();
    return function updateApplication(callback: (original: Application) => void) {
        const application = {...applicationSignal.get()};
        callback(application);
        applicationSignal.set(application);
    }
}
