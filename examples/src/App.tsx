import "./App.css";
import { signal, useSignal, computed } from "../../src";
import Container from "./components/Container";

const count = signal(0);
const plusOne = computed(() => count.value + 1);
const plusOneWritable = computed({
  get: () => count.value + 1,
  set: (val) => {
    count.value = val - 1;
  },
});

function App() {
  const snapshot = useSignal(count);

  const renderSignalWithComputed = () => {
    console.log("renderSignalWithComputed rendered!");

    const handleClick = () => {
      count.value++;
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
    console.log("renderSignalWithWritableComputed rendered!");
    const increase = () => {
      count.value++;
    };

    const decrease = () => {
      plusOneWritable.value--;
    };

    return (
      <div style={{ margin: "20px 0" }}>
        <h2>Signal With Writable Computed</h2>
        <p>Signal: {count.value} </p>
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
      <Container />
    </>
  );
}

export default App;
