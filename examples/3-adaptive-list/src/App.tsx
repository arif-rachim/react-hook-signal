import './App.css'

/**
 * App class representing an application with todo functionality.
 * @constructor
 */
function App() {

    /**
     * Represents a variable for managing TODO items using a signal.
     */
    // const data = useSignal<Array<Stock>>(randomStockData)
    return <div style={{height:'100vh',overflow:'auto',display:'flex',flexDirection:'column'}}>
    </div>
}

export default App
//
// const AdaptiveList = createResponsiveList<Stock>().breakPoint({s:400,m:600,l:900,xl:1200}).renderer({
//     change : ({value}) => value,
//     changePercent : ({value}) => `${value}%`,
//     high : ({value}) => value,
//     low : ({value}) => value,
//     companyName : ({value}) => value,
//     open : ({value}) => value,
//     latestPrice : ({value}) => value,
//     previousClose : ({value}) => value,
//     symbol : ({value}) => value,
//     volume : ({value}) => value,
// }).template({
//     s: ({Slot}) => {
//         return <div style={{display:'flex',flexDirection:'row',borderBottom:'1px solid #CCC',height:40}}>
//             <div style={{display:'flex',flexDirection:'column',flexGrow:1}}>
//                 <div><Slot for={'symbol'} /></div>
//                 <div><Slot for={'companyName'} /></div>
//             </div>
//             <div>Chart</div>
//             <div style={{display:'flex',flexDirection:'column'}}>
//                 <div><Slot for={'latestPrice'}/></div>
//                 <Slot for={'change'} style={{textAlign:'right'}}/>
//             </div>
//         </div>
//     }
// }).list();