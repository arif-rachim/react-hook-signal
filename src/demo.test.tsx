import { expect, it, describe, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";

import { signal } from "./signal";
import { computed } from "./computed";
import { useSignal } from "./react";

describe("demo", () => {
  it("should trigger re-render", async () => {
    const count = signal(0);

    const Counter = () => {
      const snap = useSignal(count);

      const increment = () => {
        count.value++;
      };

      return (
        <>
          <div>count: {snap}</div>
          <button onClick={increment}>button</button>
        </>
      );
    };

    const { getByText, findByText } = render(<Counter />);
    await findByText("count: 0");

    const button = getByText("button");
    fireEvent.click(button);
    await findByText("count: 1");
  });

  it("render simple compute", async () => {
    const count = signal(0);
    const computeDoubleGetter = vi.fn(() => count.value * 2);
    const computeDouble = computed(computeDoubleGetter);

    const Counter = () => {
      const snap = useSignal(count);

      const increment = () => {
        count.value++;
      };

      return (
        <>
          <div>count: {snap}</div>
          <div>computed: {computeDouble.value}</div>
          <button onClick={increment}>button</button>
        </>
      );
    };

    const { getByText, findByText } = render(<Counter />);
    await findByText("count: 0");
    await findByText("computed: 0");
    expect(computeDoubleGetter).toBeCalledTimes(1);

    const button = getByText("button");
    fireEvent.click(button);
    await findByText("count: 1");
    await findByText("computed: 2");

    expect(computeDoubleGetter).toBeCalledTimes(2);
  });

  it("render style compute", async () => {
    const count = signal(0);

    const backgroundComputedGetter = vi.fn(() =>
      count.value % 2 === 0 ? "white" : "red",
    );
    const backgroundComputed = computed(backgroundComputedGetter);
    const styleComputedGetter = vi.fn(() => ({
      backgroundColor: backgroundComputed.value,
    }));
    const styleComputed = computed(styleComputedGetter);

    const Counter = () => {
      const snap = useSignal(count);

      const increment = () => {
        count.value++;
      };

      return (
        <>
          <div>count: {snap}</div>
          <div data-testid="styleDiv" style={styleComputed.value}>
            computed: {JSON.stringify(styleComputed.value)}
          </div>
          <button onClick={increment}>button</button>
        </>
      );
    };

    const { getByText, getByTestId, findByText } = render(<Counter />);
    await findByText("count: 0");
    await findByText('computed: {"backgroundColor":"white"}');
    expect(backgroundComputedGetter).toBeCalledTimes(1);
    expect(styleComputedGetter).toBeCalledTimes(1);

    const button = getByText("button");
    const styleDiv = getByTestId("styleDiv");
    fireEvent.click(button);

    await waitFor(() =>
      expect(styleDiv.style.backgroundColor).toEqual("white"),
    );
    fireEvent.click(button);
    await waitFor(() => expect(styleDiv.style.background).to.equal("red"));
    fireEvent.click(button);
    await waitFor(() => expect(styleDiv.style.background).to.equal("white"));
    fireEvent.click(button);
    await waitFor(() => expect(styleDiv.style.background).to.equal("red"));

    expect(backgroundComputedGetter).toBeCalledTimes(5);
    expect(styleComputedGetter).toBeCalledTimes(5);
  });
});
