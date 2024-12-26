import {Variable} from "../../app/designer/AppDesigner.tsx";

/**
 * Sorts two variables based on their type and name.
 */
export function sortSignal(a: Variable, b: Variable) {
    const priority = {state: 'a', computed: 'b', effect: 'c'}
    return `${priority[a.type]}-${a.name}`.localeCompare(`${priority[b.type]}-${b.name}`)
}
