import { count } from "./signal";
import { sayIt } from "./otherSignal";

import { useSignal } from "../../../src";

export default function ComponentB() {
  const sayItSnapshot = useSignal(sayIt);

  const mutate = () => {
    sayIt.set(() => "Hello World!");
  };

  const reset = () => {
    // Can change and observer external state
    count.value = 0;
  };

  console.log("ComponentB rendered!");

  return (
    <div>
      <h2>ComponentA</h2>

      {JSON.stringify(sayItSnapshot)}
      <button onClick={mutate}>Click Me!</button>
      <button onClick={reset}>Don't Click Me!</button>
    </div>
  );
}
