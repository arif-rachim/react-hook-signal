import {useContext} from "react";
import {ModalContext} from "./ModalContext.ts";


export function useShowModal() {
    return useContext(ModalContext)!;
}