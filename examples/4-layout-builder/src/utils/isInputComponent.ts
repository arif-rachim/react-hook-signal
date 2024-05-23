import {Component, InputComponent} from "../comp/Component.ts";

export function isInputComponent(comp?: Component): comp is InputComponent {
    return comp !== undefined && comp !== null && 'value' in comp && comp.value !== undefined
}