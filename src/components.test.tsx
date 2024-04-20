import {Notifiable, notifiable} from "./components.ts";
import {expect, test} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {Signal} from "signal-polyfill";
import {useSignal} from "./hooks.ts";
//import {Dispatch, SetStateAction} from "react";

function SimpleNotifiable(){
    return <>
        <notifiable.span style={{background:'blue',color:'white'}} data-testid={'notifiable.span'}>Notifiable Span</notifiable.span>
        <notifiable.div style={{background:'white',color:'blue'}} data-testid={'notifiable.div'}>Notifiable Div</notifiable.div>
    </>
}
test('It should render notifiable correctly', async () => {
    render(<SimpleNotifiable/>)
    const span = screen.getByTestId('notifiable.span');
    const div = screen.getByTestId('notifiable.div');
    await waitFor(() => {
        expect(span.innerHTML).to.equal('Notifiable Span');
        expect(div.innerHTML).to.equal('Notifiable Div');
    })
    expect(span.style.background).to.equal('blue')
    expect(span.style.color).to.equal('white')
})

function SimpleSignalTest(){
    const count = new Signal.State(1);
    const countTwo = new Signal.Computed(() => count.get() + 1);
    const style = new Signal.Computed(() => ({background:'red'}))
    return <>
        <notifiable.span style={style} data-testid={'notifiable.span'}>{count}</notifiable.span>
        <notifiable.div data-testid={'notifiable.div'}>{countTwo}</notifiable.div>
    </>
}

test('It should render signal correctly', async () => {
    render(<SimpleSignalTest/>)
    const span = screen.getByTestId('notifiable.span');
    const div = screen.getByTestId('notifiable.div');
    await waitFor(() => {
        expect(span.innerHTML).to.equal('1');
        expect(div.innerHTML).to.equal('2');
    })
    expect(span.style.background).to.equal('red');
})

function SimpleLambdaTest(){
    const count = new Signal.State(1)
    return <>
        <notifiable.span style={() => ({
            background:'red'
        })} data-testid={'notifiable.span'}>{() => {
            return count.get()
        }}</notifiable.span>
        <notifiable.div data-testid={'notifiable.div'}>{() => {
            return <div>{count.get()+1}</div>
        }}</notifiable.div>
    </>
}

test('It should render lambda correctly', async () => {
    render(<SimpleLambdaTest/>)
    const span = screen.getByTestId('notifiable.span');
    const div = screen.getByTestId('notifiable.div');
    await waitFor(() => {
        expect(span.innerHTML).to.equal('1');
        expect(div.innerHTML).to.equal('<div>2</div>');
    })
    expect(span.style.background).to.equal('red');
})

function MyComponent(props:{count:number}){
    return <div data-testid={'div'}>{props.count}</div>
}

function TestNotifiable(){
    const count = useSignal(0);
    return <>
        <button data-testid={'increment'} onClick={() => count.set(count.get() + 1)}>Increment</button>
        <Notifiable component={MyComponent} count={count} />
    </>
}

test('It should test Notifiable component properly',async () => {
    render(<TestNotifiable />);
    const increment = screen.getByTestId('increment');
    const div = screen.getByTestId('div');
    expect(div.innerHTML).to.equal('0');
    fireEvent.click(increment);
    await waitFor(() => {
        expect(div.innerHTML).to.equal('1')
    })
    fireEvent.click(increment);
    await waitFor(() => {
        expect(div.innerHTML).to.equal('2')
    })
})


// function MyComponentWithCallback(props:{count:number,setCount:Dispatch<SetStateAction<number>>}){
//     return <>
//         <button data-testid={'increment'} onClick={() => props.setCount(old => old+1)}>Increment</button>
//         <div data-testid={'div'}>{props.count}</div>
//     </>
// }

// function TestNotifiableWithCallback(){
//     const count = useSignal(0);
//
//     return <>
//         <button data-testid={'increment'} onClick={() => count.set(count.get() + 1)}>Increment</button>
//         <Notifiable component={MyComponentWithCallback} count={count} setCount={(callback:(oldVal:number) => number) => {
//             count.set(callback(count.get()))
//         }}/>
//     </>
// }