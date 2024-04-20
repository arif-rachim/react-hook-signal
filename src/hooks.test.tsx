import {useSignal, useSignalEffect} from "./main.ts";
import {notifiable} from "./main.ts";
import {expect, test} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {useRef, useState} from "react";

function SimpleSignal(){
    const count = useSignal(0);
    return <>
        <button data-testid={'increment'} onClick={() => count.set(count.get() + 1)}>Increment</button>
        <notifiable.div data-testid={'countRender'}>{count}</notifiable.div>
    </>
}

test('items should perform update count correctly',async () => {
    render(<SimpleSignal/>);
    const button = screen.getByTestId('increment');
    const countRender = screen.getByTestId('countRender');
    fireEvent.click(button);
    await waitFor(() => {
        expect(countRender.innerHTML).to.equal('1');
    })
    fireEvent.click(button);
    await waitFor(() => {
        expect(countRender.innerHTML).to.equal('2');
    })
    fireEvent.click(button);
    await waitFor(() => {
        expect(countRender.innerHTML).to.equal('2');
    })
})

function ComputedStyleSignal(){
    const count = useSignal(0);
    const backgroundColor = useSignal(() => (count.get() % 2 === 0)?'white':'red');
    const style = useSignal(() => ({background:backgroundColor.get()}))
    return <>
        <button data-testid={'increment'} onClick={() => count.set(count.get() + 1)}>Increment</button>
        <notifiable.div style={style} data-testid={'renderDiv'}/>
    </>
}


test('items should perform computed on style correctly',async () => {
    render(<ComputedStyleSignal/>);
    const button = screen.getByTestId('increment');
    const renderDiv = screen.getByTestId('renderDiv');
    fireEvent.click(button);
    await waitFor(() => {
        expect(renderDiv.style.background).to.equal('white');
    })
    fireEvent.click(button);
    await waitFor(() => {
        expect(renderDiv.style.background).to.equal('red');
    })
    fireEvent.click(button);
    await waitFor(() => {
        expect(renderDiv.style.background).to.equal('white');
    })
    fireEvent.click(button);
    await waitFor(() => {
        expect(renderDiv.style.background).to.equal('red');
    })

})

function ComputedStyleEffect(){
    const count = useSignal(0);
    const backgroundColor = useSignal(() => (count.get() % 2 === 0)?'white':'red');
    return <>
        <button data-testid={'increment'} onClick={() => count.set(count.get() + 1)}>Increment</button>
        <notifiable.div style={() => {
            return {background:backgroundColor.get()}
        }} data-testid={'renderDiv'}/>
    </>
}

test('items should perform effect on style correctly',async () => {
    render(<ComputedStyleEffect/>);
    const button = screen.getByTestId('increment');
    const renderDiv = screen.getByTestId('renderDiv');
    fireEvent.click(button);
    await waitFor(() => {
        expect(renderDiv.style.background).to.equal('white');
    })
    fireEvent.click(button);
    await waitFor(() => {
        expect(renderDiv.style.background).to.equal('red');
    })
    fireEvent.click(button);
    await waitFor(() => {
        expect(renderDiv.style.background).to.equal('white');
    })
    fireEvent.click(button);
    await waitFor(() => {
        expect(renderDiv.style.background).to.equal('red');
    })
})

function EffectTest(){
    const count = useSignal(0)
    const [countState,setCountState] = useState(count.get());
    useSignalEffect(() => {
        setCountState(count.get())
    })
    return <>
        <button data-testid={'increment'} onClick={() => {
            count.set(count.get() + 1)
        }}>Increment</button>
        <div data-testid={'div'}>{countState}</div>
    </>
}

test('It should perform increment using state and effect',async () => {
    render(<EffectTest/>);
    const increment = screen.getByTestId('increment');
    const div = screen.getByTestId('div');
    fireEvent.click(increment);
    await waitFor(() => {
        expect(div.innerHTML).to.equal('0');
    })
    fireEvent.click(increment);
    await waitFor(() => {
        expect(div.innerHTML).to.equal('1');
    })
});

function EffectTestWithDestroy(){
    const count = useSignal(0)
    const [countState,setCountState] = useState(count.get());
    const destroyCounter = useRef(0);
    useSignalEffect(() => {
        setCountState(count.get())
        return () => {
            destroyCounter.current++;
        }
    })
    return <>
        <button data-testid={'increment'} onClick={() => {
            count.set(count.get() + 1)
        }}>Increment</button>
        <div data-testid={'div'}>{countState}</div>
        <div data-testid={'destroyCounter'}>{destroyCounter.current}</div>
    </>
}


test('It should perform effect destroy',async () => {
    render(<EffectTestWithDestroy/>);
    const increment = screen.getByTestId('increment');
    const destroyCounter = screen.getByTestId('destroyCounter');
    fireEvent.click(increment);
    await waitFor(() => {
        expect(destroyCounter.innerHTML).to.equal('0');
    })
    fireEvent.click(increment);
    await waitFor(() => {
        expect(destroyCounter.innerHTML).to.equal('1');
    })
});
