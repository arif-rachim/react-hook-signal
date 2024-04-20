# React Hook Signal
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![codecov](https://codecov.io/gh/arif-rachim/react-hook-signal/graph/badge.svg?token=MRWEGD8U2Z)](https://codecov.io/gh/arif-rachim/react-hook-signal)
[![Node.js CI](https://github.com/arif-rachim/react-hook-signal/actions/workflows/node.js.yml/badge.svg)](https://github.com/arif-rachim/react-hook-signal/actions/workflows/node.js.yml)

This guide explores how to integrate Signals, a proposed standard for JavaScript communication, into React components using the react-hook-signal library.

### Installation
```bash
npm install react-hook-signal signal-polyfill
```

## What are Signals?

The TC39 Proposal for Signals in JavaScript aims to establish a mechanism for components to communicate effectively. This proposal includes a polyfill for prototyping purposes.

### Understanding Signals
- Refer to https://eisenbergeffect.medium.com/a-tc39-proposal-for-signals-f0bedd37a335 for detailed explanation.
- Explore the proposal repository: https://github.com/proposal-signals/proposal-signals

Once adopted, JavaScript will have a native signaling system, referred to as Native Signal throughout this guide.

## Steps to Integrate Signals with React
### STEP 1: Rendering Native Signal Values:

- Utilize `notify` components provided by react-hook-signal.
- `notify` components accept standard HTML attributes, Signal, and Lambda for detecting dependency changes.

Example:
Let say we have Global.tsx, holding global signals
```tsx
// Global.tsx
import {Signal} from "signal-polyfill";
import {JSXAttribute} from "react-hook-signal";

export const count = new Signal.State(0)
export const renderCount = new Signal.Computed(() => {
    return <div>Count {count.get()}</div>
})

```
Next, you want to integrate the signal in your React component, so the fastest way to integrate it is to use the `notifiable` elements.

```tsx
import {count,renderCount} from "./GlobalSignals.tsx";
// here we are importing react-hook-signal:notifiable
import {notifiable} from "react-hook-signal";


export function App() {
    return <>
    
        {/* When user click button it will update the state */}
        <button onClick={() => count.set(count.get() + 1)}>Click here</button>
    
        {/* Following line will get auto update when user click button*/}
        <notifiable.div>{renderCount}</notifiable.div>
    </>
}
```

`notifiable` element attributes is not only capable of accepting the `Signal` type but also can receive `Lambda`,Lambda is a callback that's able to listen for changes in the signals it depends on. Below is an example demonstrating how the code above can be modified using a `Lambda`.

```tsx
import {count} from "./GlobalSignals.tsx";
import {notifiable} from "react-hook-signal";


export function App() {
    return <>
    
        {/* When user click button it will update the state */}
        <button onClick={() => count.set(count.get() + 1)}>Click here</button>
    
        {/* Following line will get auto update when user click button*/}
        <notifiable.div>{() => {
            return <div>Count {count.get()}</div>
        }}</notifiable.div>
    </>
}
```

### STEP 2: Observing Signal Changes

- Use the useSignalEffect hook to listen for changes in Native Signal.
- This hook accepts a callback that reads the final signal value and can optionally return a cleanup function.

#### Important Note:

- useSignalEffect doesn't automatically re-render the component. Use React.useState:setState to trigger a re-render.

Example: 

```tsx
import {count} from "./GlobalSignals.tsx";
import {useSignalEffect} from "react-hook-signal";
import {useState} from "react";

export function App() {
    const [countState,setCountState] = useState(count.get())
    
    useSignalEffect(() => {
        // Here, within the useSignalEffect hook, I can listen for updates on any Signal.State or Signal.Computed
        setCountState(count.get())
    })
    return <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
        {/* When user click button it will update the state */}
        <button onClick={() => count.set(count.get() + 1)}>Click here</button>

        {/* Following line will be updated because of countState updated*/}
        <div>{countState}</div>
    </div>
}

```

### STEP 3: Creating Signals in React Components:

`useSignal` is a hook used to generate `Native Signals` that are tied to the lifespan of a component. It returns two types of `Signals` : `Signal.State` and `Signal.Computed`. `Signal.State` is a native signal whose value can be modified after it is initially created. On the other hand, `Signal.Computed` represents a computed signal whose value cannot be modified directly, as it is the result of a computation.

- To create a `Signal.State`, simply provide a constant value as a parameter when calling `useSignal`. 
- To create a `Signal.Computed`,simply provide  a `Lambda` that returns the result of a dynamic computation.

Let's look at the following example.
```tsx
import {notifiable, useSignal} from "react-hook-signal";

export function App() {
    
    // creating Signal.State count
    const count = useSignal(0);
    
    // creating Signal.Computed countString
    const countString = useSignal(() => (count.get() * 2).toString());
    
    // creating Signal.Computed style
    const style = useSignal(() => {
        const isEven = count.get() % 2 === 0;
        return {
            background: isEven ? 'white' : 'black',
            color: isEven ? 'black' : 'white'
        }
    })

    // creating Signal.Computed text
    const text = useSignal(() => {
        const isWhite = style.get().background === 'white'
        return <div>{isWhite ? 'Background is White' : 'Background is Black'}</div>
    })

    return <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {/* When user click button it will update the state */}
        <button onClick={() => count.set(count.get() + 1)}>Click here</button>

        {/* Following line will never get auto update*/}
        <div>{countString.get()}</div>

        {/* Following line will get auto update when user click button*/}
        <notifiable.div>{countString}</notifiable.div>

        {/* Following line will get auto update when user click button*/}
        <notifiable.div style={style}>{text}</notifiable.div>
    </div>
}

```
The `react-hook-signal` library manages state in this React component. It defines signals (count, style, etc.) for dynamic updates. Clicking the button increments the count, and signal components automatically update content based on signal changes.

### STEP 4: Encapsulate any Component with a Notifiable :

- Wrap component with `Notifiable`
- Component properties & children now capable to receive `Signal` or `Lambda`

We can wrap any component, enabling it to receive signals or lambdas within its properties, by utilizing the Notifiable component from the React hook. 
Refer to the following example :

```tsx
import {Notifiable} from "react-hook-signal";

export function App() {
    const count = useSignal(0);
    
    return <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
        {/* When user click button it will update the state */}
        <button onClick={() => count.set(count.get() + 1)}>Click here</button>

        {/* Following line will be updated because of count updated*/}
        <Notifiable component={MyComponent} title={() => {
            return count.get() + ' Times'
        }}></Notifiable>
                    
    </div>
}

function MyComponent(props:{title:string}){
    return <div>Here is the title {props.title}</div>
}
```

### Summary
The integration of `Native Signal` into the React application can be done in various ways tailored to the needs and complexity of the app.


