import {Container} from "./AppDesigner.tsx";

/**
 * Represents a property type of a container element.
 */
export type PropertyType = keyof Pick<Container, 'height' | 'width' | 'paddingTop' | 'paddingLeft' | 'paddingRight' | 'paddingBottom' | 'marginRight' | 'marginTop' | 'marginBottom' | 'marginLeft'>;

export type ContainerPropertyType = keyof Pick<Container, 'gap'>
