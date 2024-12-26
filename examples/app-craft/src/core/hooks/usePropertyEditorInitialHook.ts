import {useSelectedDragContainer} from "./useSelectedDragContainer.ts";
import {useAppContext} from "./useAppContext.ts";
import {isEmpty} from "../utils/isEmpty.ts";

export function usePropertyEditorInitialHook(props: { propertyName: string }) {
    const containerSignal = useSelectedDragContainer();
    const context = useAppContext();
    const container = containerSignal.get();
    const {propertyName} = props;
    const hasError = context.allErrorsSignal.get().find(i => i.type === 'property' && i.propertyName === propertyName && i.containerId === container?.id) !== undefined;
    let isFormulaEmpty = true;

    if (container && container.properties[propertyName]) {
        const formula = container.properties[propertyName].formula;
        isFormulaEmpty = isEmpty(formula);
    }
    return {containerSignal, context, propertyName, hasError, isFormulaEmpty};
}