<img src="https://github.com/arif-rachim/react-hook-signal/raw/main/assets/react-hook-signal-hero.png" width="830" alt="react hook signal, seamless way to integrate React with TC39 Signal Proposal">

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![codecov](https://codecov.io/gh/arif-rachim/react-hook-signal/graph/badge.svg?token=MRWEGD8U2Z)](https://codecov.io/gh/arif-rachim/react-hook-signal)
[![Node.js CI](https://github.com/arif-rachim/react-hook-signal/actions/workflows/node.js.yml/badge.svg)](https://github.com/arif-rachim/react-hook-signal/actions/workflows/node.js.yml)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-hook-signal)](https://bundlephobia.com/package/react-hook-signal@latest)


> React-Hook-Signal is a tiny library, less than 1kb. It helps you integrate Signal with your React components easily.

### Installation
```bash
npm install react-hook-signal signal-polyfill
```

## What are Signals?

The TC39 Proposal for Signals in JavaScript aims to establish a mechanism for components to communicate effectively. This proposal includes a polyfill for prototyping purposes.

### Understanding Signals
- Refer to https://eisenbergeffect.medium.com/a-tc39-proposal-for-signals-f0bedd37a335 for detailed explanation.
- Explore the proposal repository: https://github.com/proposal-signals/proposal-signals

Once adopted, JavaScript will have a native signaling system, referred to as `Signal` throughout this guide.

### How signal can efficiently re-render react component

![Solving rerendering problem in react using signal](https://github.com/arif-rachim/react-hook-signal/raw/main/assets/todo-list.gif)

In React components, re-rendering starts at the component's beginning and extends to the end of the JSX element. Signal usage allows precise re-rendering, boosting performance and simplifying development without the need for memoization or useCallback functions.

## Why choose React-Hook-Signal?
- It's straightforward: Just React and Native Signal, no extra babel plugin needed.
- Enjoy full TypeScript support for an improved Developer Experience.
- Flexibility is key: Opt-in for integration in your React project, seamlessly blending state and signal.
- It's incredibly lightweight, clocking in at less than 1kb

## Steps to Integrate Signals with React
### STEP 1: Rendering Signal Values:

- Utilize `notifiable` components provided by react-hook-signal.
- `notifiable` components accept standard HTML attributes, `Signal`, and `Lambda` for detecting dependency changes.

Example:
```tsx
// Global.tsx
import {Signal} from "signal-polyfill";
import {JSXAttribute} from "react-hook-signal";

export const count = new Signal.State(0)
export const renderCount = new Signal.Computed(() => {
    return <div>Count {count.get()}</div>
})

```
The fastest way to integrate these `Signals` is to use the `notifiable` components.

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

`notifiable` component attributes is not only capable of accepting the `Signal` type but also can receive `Lambda`

> Lambda is a callback that's able to listen for changes in the signals it depends on.

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

- Use the `useSignalEffect` hook to listen for changes in Signal.
- This hook accepts a callback that reads the final signal value and can optionally return a cleanup function.

#### Important Note:

- `useSignalEffect` doesn't automatically re-render the component. Use React.useState to trigger a re-render.

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

- `useSignal` is a hook that creates `Signal.State`, and `useComputed` is a hook that creates `Signal.Computed`.
- These hooks generate signals that are linked to the component's lifecycle.

- To create a `Signal.State`, simply provide a constant value as a parameter when calling `useSignal`.
- To create a `Signal.Computed`,simply provide  a `Lambda` that returns the result of a dynamic computation.

Example :
```tsx
import {notifiable, useSignal, useComputed} from "react-hook-signal";

export function App() {
    
    // creating Signal.State count
    const count = useSignal(0);
    
    // creating Signal.Computed countString
    const countString = useComputed(() => (count.get() * 2).toString());
    
    // creating Signal.Computed style
    const style = useComputed(() => {
        const isEven = count.get() % 2 === 0;
        return {
            background: isEven ? 'white' : 'black',
            color: isEven ? 'black' : 'white'
        }
    })

    // creating Signal.Computed text
    const text = useComputed(() => {
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

### STEP 4: Encapsulate any Component with a Notifiable :

- Use `Notifiable` component to wrap any React Functional or Class Component
- A React component encapsulated within the `Notifiable` component will inherently enable its properties and children to utilize `Lambda` expressions or `Signals` seamlessly

Example :
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
The integration of `Signal` into the React application can be done in various ways tailored to the needs and complexity of the app.