import {Button} from "../../../button/Button.tsx";
import {MutableRefObject} from "react";
import {triggerDownloadZip} from "../../../../core/utils/triggerDownloadZip.ts";
import {useLoadExtractJsonFromZip} from "../../../../core/utils/useLoadExtractJsonFromZip.ts";
import {useAppContext} from "../../../../core/hooks/useAppContext.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {createNewBlankApplication} from "../../createNewBlankApplication.ts";

export default function PackagePanel() {
    const context = useAppContext<AppDesignerContext>();
    const {ref} = useLoadExtractJsonFromZip();
    return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 20}}>
        <Button onClick={async () => {
            await triggerDownloadZip('app-builder', context.applicationSignal.get());
        }}>Export App</Button>

        <Button onClick={() => {
            const dom = (ref as MutableRefObject<HTMLInputElement>);
            if (dom.current) {
                dom.current.click();
            }
        }}>Import App</Button>
        <input ref={ref} type={'file'} style={{display: 'none'}}/>
        <Button onClick={() => {
            context.applicationSignal.set(createNewBlankApplication());
            context.activePageIdSignal.set('');
            context.activeDropZoneIdSignal.set('');
            context.selectedDragContainerIdSignal.set('');
            context.hoveredDragContainerIdSignal.set('');
            context.variableInitialValueSignal.set({});
            context.allPageVariablesSignalInstance.set([]);
            context.uiDisplayModeSignal.set('design');
            context.allErrorsSignal.set([]);
        }}>Delete App</Button>
    </div>
}