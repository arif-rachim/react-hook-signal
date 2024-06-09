import {Component, InputComponent} from "../comp/Component.ts";

export function isInputComponent(comp?: Component): comp is InputComponent {
    return comp !== undefined && comp !== null && comp.componentType === 'Input'
}