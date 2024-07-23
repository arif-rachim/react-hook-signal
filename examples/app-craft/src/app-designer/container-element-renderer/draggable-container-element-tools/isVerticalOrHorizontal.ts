import {Container} from "../../AppDesigner.tsx";

/**
 * Determines if the given container is vertical, horizontal, or not applicable.
 */
export function isVerticalOrHorizontal(container?: Container) {
    return container !== undefined && container !== null && ['vertical','horizontal'].includes(container.type)
}