import {ReactElement, useCallback} from "react";
import {guid} from "../../utils/guid.ts";
import {Config, FactoryFunction} from "../../modal/ModalContext.ts";
import {useSignal} from "react-hook-signal";


export type ModalParameter = {
    id: string,
    element: ReactElement,
    config?: Config
};
type ShowModal = <P>(factory:FactoryFunction<P>, config?: Config) => Promise<P>;

export function useModal() {
    const modalPanels = useSignal<Array<ModalParameter>>([]);

    const showModal: ShowModal = useCallback(function showModal<P>(factory: FactoryFunction<P>, config?: Config): Promise<P> {
        config = config || {animation: 'pop', position: 'center',plainPanel:false};
        return new Promise(resolve => {
            const id = guid();
            const element = factory((params?: P) => {
                modalPanels.set(modalPanels.get().filter(p => p.id !== id));
                resolve(params as P);
            });
            const panels = [...modalPanels.get()];
            panels.push({
                id : id,
                element : element,
                config : config
            })
            modalPanels.set(panels);
        })
    }, [modalPanels]);

    return {showModal, modalPanels};
}

