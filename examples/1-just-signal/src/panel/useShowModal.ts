import {useContext} from "react";
import {ModalContext, ShowDialogType} from "./ModalProvider.tsx";

export function useShowModal(): ShowDialogType {
    return useContext(ModalContext)! as ShowDialogType;
}
