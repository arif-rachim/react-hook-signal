import {Button} from "../../button/Button.tsx";
import {MutableRefObject, useContext} from "react";
import {AppDesignerContext} from "../../AppDesignerContext.ts";
import {triggerDownloadZip} from "../../../utils/triggerDownloadZip.ts";
import {useLoadExtractJsonFromZip} from "../../../utils/useLoadExtractJsonFromZip.ts";
import {createNewBlankPage} from "../../createNewBlankPage.ts";

export default function PackagePanel() {
    const context = useContext(AppDesignerContext);
    const {ref} = useLoadExtractJsonFromZip();
    return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 20}}>
        <Button onClick={async () => {
            await triggerDownloadZip('app-builder', context.allPagesSignal.get());
        }}>Export App</Button>

        <Button onClick={() => {
            const dom = (ref as MutableRefObject<HTMLInputElement>);
            if (dom.current) {
                dom.current.click();
            }
        }}>Import App</Button>
        <input ref={ref} type={'file'} style={{display: 'none'}}/>
        <Button onClick={() => {
            context.allPagesSignal.set([createNewBlankPage()]);
            context.activePageIdSignal.set('');
            context.activeDropZoneIdSignal.set('');
            context.selectedDragContainerIdSignal.set('');
            context.hoveredDragContainerIdSignal.set('');
            context.variableInitialValueSignal.set({});
            context.allVariablesSignalInstance.set([]);
            context.uiDisplayModeSignal.set('design');
            context.allErrorsSignal.set([]);
        }}>Delete App</Button>
    </div>
}