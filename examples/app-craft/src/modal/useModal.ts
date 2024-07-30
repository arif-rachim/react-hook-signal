import {ReactElement, useCallback} from "react";
import {guid} from "../utils/guid.ts";
import {Config} from "./ModalContext.ts";
import {useSignal} from "react-hook-signal";


export type ModalParameter = {
    id: string,
    element: ReactElement,
    config: Config
};
type ShowModal = <P>(factory: (closePanel: (params?: P) => void) => ReactElement, config?: Config) => Promise<P>;

export function useModal() {
    const modalPanels = useSignal<Array<ModalParameter>>([]);

    const showModal: ShowModal = useCallback(function showModal<P>(factory: (closePanel: (params?: P) => void) => ReactElement, config?: Config): Promise<P> {
        config = config || {animation: 'pop', position: 'center'};
        return new Promise(resolve => {
            const id = guid();
            const element = factory((params?: P) => {
                modalPanels.set(modalPanels.get().filter(p => p.id !== id));
                if (params) {
                    resolve(params);
                }
            });
            modalPanels.set([...modalPanels.get(), {id, element, config}]);
        })
    }, [modalPanels]);

    return {showModal, modalPanels};
}

