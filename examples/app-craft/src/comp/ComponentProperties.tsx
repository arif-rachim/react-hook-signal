import {useContext} from "react";
import {notifiable} from "react-hook-signal";
import {ComponentContext} from "./ComponentContext.ts";
import {Component, InputComponent, LabelComponent} from "./Component.ts";
import {Signal} from "signal-polyfill";
import Visible from "./Visible.tsx";
import {WidthProperty} from "./properties/WidthProperty.tsx";
import {DirectionProperty} from "./properties/DirectionProperty.tsx";
import {LabelProperty} from "./properties/LabelProperty.tsx";
import {NameProperty} from "./properties/NameProperty.tsx";
import {ValueProperty} from "./properties/ValueProperty.tsx";
import {HeightProperty} from "./properties/HeightProperty.tsx";
import {MarginProperty} from "./properties/MarginProperty.tsx";
import {PaddingProperty} from "./properties/PaddingProperty.tsx";
import {ErrorMessageProperty} from "./properties/ErrorMessageProperty.tsx";
import {isContainer} from "../utils/isContainer.ts";
import {isLabelComponent} from "../utils/isLabelComponent.ts";
import {isInputComponent} from "../utils/isInputComponent.ts";


export function ComponentProperties() {
    const {components, focusedComponent} = useContext(ComponentContext)!;

    function updateValue(callback: (thisComponent: Component) => void) {
        const componentId = focusedComponent.get()?.id;
        const comps = [...components.get()];
        const newFocusedComponent = {...comps.find(i => i.id === componentId)} as Component;
        callback(newFocusedComponent);
        focusedComponent.set(newFocusedComponent);
        components.set([...components.get().filter(i => i.id !== componentId), newFocusedComponent]);
    }

    return <div style={{display: 'flex', flexDirection: 'column', padding: 10, gap: 0}}>
        <notifiable.div>{() => focusedComponent.get()?.id.slice(-5)}</notifiable.div>
        <Visible when={() => {
            return isContainer(focusedComponent.get()?.componentType)
        }}>
            <DirectionProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
        </Visible>
        <Visible when={() => {
            return isLabelComponent(focusedComponent.get())
        }}>
            <LabelProperty focusedComponent={focusedComponent as unknown as Signal.State<LabelComponent>}
                           updateValue={updateValue as unknown as (callback:(thisComponent:LabelComponent) => void) => void}/>
        </Visible>
        <Visible when={() => {
            return isInputComponent(focusedComponent.get())
        }}>
            <NameProperty focusedComponent={focusedComponent as unknown as Signal.State<InputComponent>}
                           updateValue={updateValue as unknown as (callback:(thisComponent:InputComponent) => void) => void}/>
        </Visible>
        <Visible when={() => {
            return isInputComponent(focusedComponent.get())
        }}>
            <ValueProperty focusedComponent={focusedComponent as unknown as Signal.State<InputComponent>}
                           updateValue={updateValue  as unknown as (callback:(thisComponent:InputComponent) => void) => void}/>
        </Visible>
        <Visible when={() => {
            return isInputComponent(focusedComponent.get())
        }}>
        <ErrorMessageProperty focusedComponent={focusedComponent as unknown as Signal.State<InputComponent>}
                              updateValue={updateValue  as unknown as (callback:(thisComponent:InputComponent) => void) => void} />
        </Visible>
        <div style={{display: 'flex'}}>
            <WidthProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
            <HeightProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
        </div>
        <MarginProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
        <PaddingProperty focusedComponent={focusedComponent} updateValue={updateValue}/>
    </div>
}

