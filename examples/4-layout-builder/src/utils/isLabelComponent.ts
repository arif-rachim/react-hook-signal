import {Component, LabelComponent} from "../comp/Component.ts";


export function isLabelComponent(comp?: Component): comp is LabelComponent {
    return comp !== undefined && comp !== null && 'label' in comp && comp.label !== undefined
}