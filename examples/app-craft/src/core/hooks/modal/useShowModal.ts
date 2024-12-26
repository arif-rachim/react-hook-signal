import {useContext} from "react";
import {ModalContext} from "../../modal/ModalContext.ts";


export function useShowModal() {
    return useContext(ModalContext)!;
}