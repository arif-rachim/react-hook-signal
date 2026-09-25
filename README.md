# React-Hook-Signal

<img src="https://github.com/arif-rachim/react-hook-signal/raw/main/assets/react-hook-signal-hero.png" width="830" alt="react hook signal, a way to integrate React with the TC39 Signal Proposal">

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![codecov](https://codecov.io/gh/arif-rachim/react-hook-signal/graph/badge.svg?token=MRWEGD8U2Z)](https://codecov.io/gh/arif-rachim/react-hook-signal)
[![Node.js CI](https://github.com/arif-rachim/react-hook-signal/actions/workflows/node.js.yml/badge.svg)](https://github.com/arif-rachim/react-hook-signal/actions/workflows/node.js.yml)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-hook-signal)](https://bundlephobia.com/package/react-hook-signal@latest)


React-Hook-Signal is a small TypeScript library (under 1 KB minified and gzipped) that connects React 18 components to signals as defined by the TC39 Signals proposal, using the official `signal-polyfill` package. In plain React, a state change re-runs the whole component function and its JSX, which developers usually work around with `useMemo`, `useCallback` and `memo`. With this library, a `Signal.State` or `Signal.Computed` (or a function that reads signals) can be passed directly as a prop or child of a `notifiable` element such as `<notifiable.div>`, and only that element updates when the signal changes. It also provides hooks to create signals tied to a component's lifecycle (`useSignal`, `useComputed`), to react to signal changes (`useSignalEffect`), and a `Notifiable` wrapper that gives any existing component the same behaviour. It is aimed at React developers who want fine-grained updates without a compiler or Babel plugin. It is published on npm as a release candidate (`0.0.1-rc.18`, December 2024), is tested with Vitest and Testing Library, and ships with two example apps.

> Status: release candidate (`0.0.1-rc.x`). The Signals proposal and `signal-polyfill` are still pre-standard, so the API may change.

### Installation
```bash
npm install react-hook-signal signal-polyfill
```

Peer dependencies: `react` and `react-dom` ^18.2.0, `signal-polyfill` ^0.1.0.

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
- Just React and the Signal polyfill: no extra Babel plugin or compiler step.
- Written in TypeScript, with typed props for every `notifiable` element.
- Opt-in: use it in a single component and keep `useState` everywhere else; state and signals can be mixed.
- Small: less than 1 KB minified and gzipped.

## Steps to Integrate Signals with React
### STEP 1: Rendering Signal Values:

- Utilize `notifiable` components provided by react-hook-signal.
- `notifiable` components accept standard HTML attributes, `Signal`, and `Lambda` for detecting dependency changes.

Example:
```tsx
// GlobalSignals.tsx
import {Signal} from "signal-polyfill";

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
import {Notifiable, useSignal} from "react-hook-signal";

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

#### Event handlers on `Notifiable`

Because `Notifiable` treats any function prop as a `Lambda` and calls it, pass real callbacks with a `Handler` suffix (for example `onClickHandler={...}` for a prop named `onClick`); the suffix is removed before the props reach the wrapped component. `notifiable.*` elements do this automatically for every prop that starts with `on`, so `<notifiable.button onClick={...}>` works as usual.

### Summary
The integration of `Signal` into the React application can be done in various ways tailored to the needs and complexity of the app.

## API

| Export | Kind | Description |
| --- | --- | --- |
| `notifiable` | object of components | `notifiable.div`, `notifiable.span`, and so on for every intrinsic element; props and children accept values, signals or lambdas |
| `Notifiable` | component | Wraps any component (`component={MyComponent}`) so its props accept signals or lambdas |
| `useSignal(value, options?)` | hook | Creates a `Signal.State` bound to the component |
| `useComputed(lambda, options?)` | hook | Creates a `Signal.Computed` bound to the component |
| `useSignalEffect(callback)` | hook | Runs `callback` whenever the signals it reads change; may return a cleanup function |
| `effect(callback)` | function | The same outside React; returns a function that stops the effect |
| `AnySignal`, `Computable`, `HtmlNotifiableComponents`, `JSXAttribute` | types | Helper types |

Effects are scheduled through a single `Signal.subtle.Watcher` and run in a microtask after the signals they depend on change.

## Examples

The [`examples/`](examples/README.md) folder is an npm workspace with two Vite apps:

- [`todo-list`](examples/todo-list/README.md): a to-do app built with `notifiable` components.
- [`stock-watch`](examples/stock-watch/README.md): a stock-watch app that updates prices and charts through signals.

## Development

```bash
npm install
npm run build        # tsc + Vite library build to dist/ (ES module, UMD and .d.ts)
npm run test:unit    # Vitest in watch mode
npm run coverage     # Vitest run with v8 coverage (used in CI)
npm run lint
npm run commit       # Commitizen conventional commit prompt
```

CI (`.github/workflows/node.js.yml`) builds and runs coverage on Node.js 18 and 20. A Husky pre-commit hook runs `npm run coverage`.

## License

MIT. See [LICENSE](LICENSE).