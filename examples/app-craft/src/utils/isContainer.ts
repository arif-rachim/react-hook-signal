import {Component} from "../comp/Component.ts";


export function isContainer<T extends (Component|undefined)>(comp: T): boolean {

    return comp !== undefined && comp !== null && 'componentType' in comp && ['Vertical','Horizontal'].indexOf(comp.componentType) >= 0;
}