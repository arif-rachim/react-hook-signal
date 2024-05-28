import {useContext} from "react";
import {PopupContext} from "./PopupContext.ts";

export function useShowPopup() {
    return useContext(PopupContext)!;
}