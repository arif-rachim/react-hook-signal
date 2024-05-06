import './App.css'
import {Stock, stocksDataSource} from "./model/Stock.ts";
import {createResponsiveList} from "./responsive-list/createResponsiveList.tsx";
import {useSignal} from "react-hook-signal";
import {IoEllipsisHorizontal, IoSearch} from "react-icons/io5";
import {AnimatePresence, motion} from "framer-motion"
import {IoIosCloseCircle} from "react-icons/io";
import {useState} from "react";
/**
 * App class representing an application with todo functionality.
 * @constructor
 */
function App() {

    /**
     * Represents a variable for managing TODO items using a signal.
     */
    const data = useSignal<Array<Stock>>(stocksDataSource);
    const [isSearchFocused,setIsSearchFocused] = useState<boolean>(false);
    return <div style={{
        height: '100vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#222',
        color: 'rgba(255,255,255,0.9)'
    }}>
        <div style={{padding: 20, display: 'flex', flexDirection: 'row',}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
                <div style={{fontSize: 32, fontWeight: 'bold'}}>Stocks</div>
                <div style={{fontSize: 28, fontWeight: 'bold', color: 'rgba(255,255,255,0.5)'}}>6 May</div>
            </div>
            <div style={{flexGrow: 1}}></div>
            <motion.div style={{
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 5,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}><IoEllipsisHorizontal style={{fontSize: 22, color: 'deepskyblue'}}/></motion.div>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', padding: '0px 20px', gap: 10, alignItems: 'center'}}>
            <AnimatePresence >
            <motion.div layout={true} style={{display: 'flex', flexDirection: 'column', flexGrow: 1,position:'relative'}}>
                <motion.input layout={true} style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color:'white',
                    border: 'none',
                    padding: '5px 10px 5px 30px',
                    fontSize: 18,
                    borderRadius: 10
                }} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}/>
                <IoSearch style={{position:'absolute',top:5,left:5,fontSize:22,color:'rgba(255,255,255,0.5)'}}/>
                <IoIosCloseCircle style={{position:'absolute',top:5,right:5,fontSize:20}}/>
            </motion.div>
            {isSearchFocused &&
            <motion.div initial={{x:100}} animate={{x:0}} transition={{bounce:false}} style={{color: 'deepskyblue', fontSize: 18}}>Done</motion.div>
            }
            </AnimatePresence>
        </div>
        <AdaptiveList.List data={data}></AdaptiveList.List>
    </div>
}

export default App

const AdaptiveList = createResponsiveList<Stock>().breakPoint({s: 400, m: 600, l: 900, xl: 1200}).renderer({
    tickerSymbol: ({value}) => value,
    earningsDate: ({value}) => value,
    name: ({value}) => value,
    priceTarget: ({value}) => value,
    marketCap: ({value}) => value,
    open: ({value}) => value

}).template({
    s: ({Slot}) => {
        return <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            padding: '20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1,}}>
                <Slot for={'tickerSymbol'} style={{flexGrow: 1, fontSize: 22, fontWeight: 700}}/>
                <Slot for={'name'} style={{color: 'rgba(255,255,255,0.5)'}}/>
            </div>
            <div style={{flexGrow: 1}}></div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5}}>
                <Slot for={'open'} style={{fontSize: 18, fontWeight: 500}}/>
                <div style={{
                    backgroundColor: 'darkred',
                    padding: '2px 5px',
                    fontWeight: 600,
                    borderRadius: 5,
                    minWidth: 70,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <Slot for={'marketCap'} style={{fontSize: 12}}/>
                </div>

            </div>
        </div>
    }
}).list();