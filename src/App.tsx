import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {useSignalComputed, useSignalState,signal} from "../lib/react-hook-signal.tsx";
import {motion} from "framer-motion";

function App() {
    //const [count, setCount] = useState(0)
    const count = useSignalState(0);
    // const countString = useSignalComputed(() => count.get().toString());
    const plusTen = useSignalComputed(() => {
        return (count.get() + 10).toString()
    })
    return (
        <>
            <motion.div></motion.div>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo"/>
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo"/>
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                {/*<signal.div title={countString} >{plusTen}</signal.div>*/}

                <button onClick={() => count.set(count.get() + 1)}>
                    count is <signal.print>{plusTen}</signal.print>
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App
