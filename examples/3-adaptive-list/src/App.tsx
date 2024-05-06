import './App.css'
import {Stock, stocksDataSource} from "./model/Stock.ts";
import {createResponsiveList} from "./responsive-list/createResponsiveList.tsx";
import {useSignal} from "react-hook-signal";
import {IoEllipsisHorizontal, IoSearch} from "react-icons/io5";
import {IoIosCloseCircle} from "react-icons/io";
import {useState} from "react";
import {Area, AreaChart, ResponsiveContainer} from "recharts";

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
            <div style={{
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 5,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}><IoEllipsisHorizontal style={{fontSize: 22, color: 'deepskyblue'}}/></div>
        </div>
        <div style={{display: 'flex', flexDirection: 'row', padding: '0px 20px', gap: 10, alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1,position:'relative'}}>
                <input style={{
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    color:'white',
                    border: 'none',
                    padding: '5px 10px 5px 30px',
                    fontSize: 18,
                    height:36,
                    borderRadius: 20
                }} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)}/>
                <IoSearch style={{position:'absolute',top:7,left:5,fontSize:22,color:'rgba(255,255,255,0.5)'}}/>
                <IoIosCloseCircle style={{position:'absolute',top:7,right:5,fontSize:20}}/>
            </div>
            {isSearchFocused &&
            <div style={{color: 'deepskyblue', fontSize: 18}}>Done</div>
            }
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
            gap:10,
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
            <div style={{flexGrow: 1,display:'flex',position:'relative'}}>
                <div style={{position:'absolute',right:0,top:0}}>
                <GradientAreaChart  />
                </div>
            </div>
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

const GradientAreaChart = () => {
    // Sample data for the chart
    const data = [
        { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
        { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
        { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
        { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
        { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
        { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
        { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
        { name: 'Aug', uv: 4000, pv: 2400, amt: 2400 },
        { name: 'Sep', uv: 3000, pv: 1398, amt: 2210 },
        { name: 'Oct', uv: 2000, pv: 9800, amt: 2290 },
        { name: 'Nov', uv: 2780, pv: 3908, amt: 2000 },
        { name: 'Dec', uv: 1890, pv: 4800, amt: 2181 },
    ];


    return (
        <ResponsiveContainer width={200} height={43} >
            <AreaChart data={data} margin={{top: 0, right: 0, left: 0, bottom: 0}} >
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="uv" stroke="#8884d8" fill="url(#colorUv)" isAnimationActive={false}/>
            </AreaChart>
        </ResponsiveContainer>
    );
};