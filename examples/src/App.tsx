import "./App.css";
import { signal } from "../../src/signal";
import { useSignal } from "../../src/react";
import { computed } from "../../src/computed";

const counter = signal(0);
const plusOne = computed(() => counter.value + 1);
const plusOneWritable = computed({
  get: () => counter.value + 1,
  set: (val) => {
    counter.value = val - 1;
  },
});

function App() {
  const snapshot = useSignal(counter);

  const renderSignalWithComputed = () => {
    const handleClick = () => {
      counter.value++;
    };

    return (
      <div style={{ margin: "20px 0" }}>
        <h2>Signal With Computed</h2>
        <p>Counter: {snapshot} </p>
        <p>Computed: {plusOne.value} </p>
        <button onClick={handleClick}>Click Me</button>
      </div>
    );
  };

  const renderSignalWithWritableComputed = () => {
    const increase = () => {
      counter.value++;
    };

    const decrease = () => {
      plusOneWritable.value--;
    };

    return (
      <div style={{ margin: "20px 0" }}>
        <h2>Signal With Writable Computed</h2>
        <p>Signal: {counter.value} </p>
        <p>Computed: {plusOneWritable.value} </p>
        <p>(The computed value will descreased)</p>

        <div className="actions">
          <button onClick={increase}>Increase</button>
          <button onClick={decrease}>Decrease</button>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderSignalWithComputed()}
      {renderSignalWithWritableComputed()}
    </>
  );
}

export default App;
