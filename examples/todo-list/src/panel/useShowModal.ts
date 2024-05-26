import {useContext} from "react";
import {ModalContext, ShowDialogType} from "./ModalProvider.tsx";

/**
 * A custom hook to access the function for showing modal dialogs.
 * @returns {ShowDialogType} The function to show modal dialogs.
 */
export function useShowModal(): ShowDialogType {

    /**
     * The context containing the function to show modal dialogs.
     * @type {ShowDialogType}
     */
    return useContext(ModalContext)! as ShowDialogType;
}
