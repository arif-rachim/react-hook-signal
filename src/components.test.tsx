import {Notifiable, notifiable} from "./components.ts";
import {expect, test} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {Signal} from "signal-polyfill";
import {useComputed, useSignal} from "./hooks.ts";
import {useEffect, useRef} from "react";

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
        <notifiable.button>Okay</notifiable.button>
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


function MyComponentWithCallback(props:{hello:string,count:number,addCount:() => void,doSomething?:(params?:string) => void}){
    return <>
        <button data-testid={'increment-inside'} onClick={() => props.addCount()}>Increment</button>
        <div data-testid={'div'}>{props.count}</div>
    </>
}



function TestNotifiableWithCallback(){
    const count = useSignal(0);

    return <>
        <button data-testid={'increment'} onClick={() => count.set(count.get() + 1)}>Increment</button>
        <Notifiable component={MyComponentWithCallback} count={() => {
            return count.get();
        }} addCountHandler={() => {
            count.set(count.get() + 1)
        }} doSomethingHandler={(params?:string) => {
            console.log('HELLO WORLD',params)
        }} hello={'world'} />
    </>
}

test('It should test Notifiable component properly',async () => {
    render(<TestNotifiableWithCallback />);
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

function NotifyButtonClickEvent(){
    const count = useSignal(0);
    const countDouble = useComputed(() => count.get() * 2);
    const isMatch = useComputed(() => {
        return countDouble.get() === count.get() * 2
    })

    return <>
        <notifiable.button ></notifiable.button>
        <notifiable.button onClick={() => count.set(count.get() + 1)} data-testid={'increment'}> Increment</notifiable.button>
        <notifiable.div data-testid={'div'}>{() => {
            return `is match ${isMatch.get()} result : ${countDouble.get()}`
        }}</notifiable.div>
    </>
}

test('It should Accurately test onclick button',async () => {
    render(<NotifyButtonClickEvent />);
    const increment = screen.getByTestId('increment');
    const div = screen.getByTestId('div');
    expect(div.innerHTML).to.equal('is match true result : 0');
    fireEvent.click(increment);
    await waitFor(() => {
        expect(div.innerHTML).to.equal('is match true result : 2');
    })
    fireEvent.click(increment);
    await waitFor(() => {
        expect(div.innerHTML).to.equal('is match true result : 4');
    })
})

function TextRef(){
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        ref.current!.innerHTML = 'Hello';
    }, []);
    return <notifiable.div data-testid={'div'} ref={ref}></notifiable.div>
}

test('It should Accurately populate ref',async () => {
    render(<TextRef />);
    const div = screen.getByTestId('div');
    await waitFor(() => {
        expect(div.innerHTML).to.equal('Hello');
    })
})