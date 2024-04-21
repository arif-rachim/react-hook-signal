import { count } from "./signal";
import { sayIt } from "./otherSignal";

import { useSignal } from "../../../src";

export default function ComponentA() {
  const countSnapshot = useSignal(count);
  const sayItSnapshot = useSignal(sayIt); // Can subscribe external state

  const mutate = () => {
    count.value++;
  };

  console.log("ComponentA rendered!");
  return (
    <div>
      <h2>ComponentA</h2>

      {JSON.stringify(countSnapshot)}
      {JSON.stringify(sayItSnapshot)}
      <button onClick={mutate}>Click Me!</button>
    </div>
  );
}
