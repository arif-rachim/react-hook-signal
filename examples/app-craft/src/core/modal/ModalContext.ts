import {createContext, ReactElement} from "react";

export type Config = { animation?: 'pop' | 'slide', position?: 'top' | 'bottom' | 'center', plainPanel?: boolean };
export type FactoryFunction<T> = (closePanel: (param?: T) => void) => ReactElement;
export const ModalContext = createContext<(<T>(factoryFunction: FactoryFunction<T>, config?: Config) => Promise<T>) | undefined>(undefined);