import { fireEvent, render, screen,act} from "@testing-library/react";
import {SimpleTest} from "./SimpleTest.tsx";
import {expect, test} from "vitest";
function waitFor(timeout:number){
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        },timeout)
    })
}
test('It should render correctly', async () => {
    act(() => {
        render(<SimpleTest/>)
    })
    const button = screen.getByTestId('button');
    const signalDiv = screen.getByTestId('signal-div');
    act(() => {
        fireEvent.click(button);
    })
    await waitFor(100);
    expect(signalDiv.innerHTML).to.equal('<div>1</div>')
    fireEvent.click(button);
    await waitFor(100);
    expect(signalDiv.innerHTML).to.equal('<div>2</div>')

})