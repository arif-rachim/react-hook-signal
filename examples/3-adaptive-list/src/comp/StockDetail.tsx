import {notifiable, useComputed, useSignalEffect} from "react-hook-signal";
import {Stock} from "../model/Stock.ts";
import {Signal} from "signal-polyfill";
import {useId} from "react";

export function StockDetail(props: {
    config: Signal.State<{ item?: Stock, showDetail?: boolean, itemRect?: DOMRect }>
}) {
    const elementId = useId();
    const config = props.config;
    const animationStyle = useComputed(() => {
        const itemRect = props.config.get().itemRect;
        if(itemRect === undefined){
            return {__html:''}
        }
        return {__html:`
@keyframes list-to-detail {
    from {
        top: ${itemRect?.top}px;
        left: ${itemRect?.left}px;
        height : ${itemRect?.height}px;
        width : ${itemRect?.width}px;
    }
    to {
        top: 0px;
        left: 0px;
        height : 100%;
        width : 100%;
    }
}
.animate-in {
    animation-name: list-to-detail;
    animation-duration:300ms;
    animation-timing-function: linear;
    animation-direction:normal;
    animation-iteration-count:1;
    animation-fill-mode:forwards;
}
.animate-out {
    animation-name: list-to-detail;
    animation-duration:300ms;
    animation-timing-function: linear;
    animation-direction:reverse;
    animation-iteration-count:1;
    animation-fill-mode:forwards;
}`}
    })
    useSignalEffect(() => {
        const showDetail = config.get().showDetail;
        const hasStyle = animationStyle.get().__html !== '';
        if(!hasStyle){
            return;
        }
        const element = document.getElementById(elementId)!;
        if(showDetail === undefined){
            return;
        }
        if (showDetail) {
            element.classList.remove('animate-out');
            void element.offsetWidth;
            element.classList.add('animate-in');
            element.style.zIndex = '20';
        }
        if (!showDetail) {
            element.classList.remove('animate-in');
            void element.offsetWidth;
            element.addEventListener('animationend', (props) => {
                if(props.animationName === 'list-to-detail'){
                    element.style.zIndex = '-1';
                }
            },{once:true})
            element.classList.add('animate-out');
        }
    })

    return <div id={elementId} style={{position: 'absolute', backgroundColor: 'red'}}>
        <notifiable.style dangerouslySetInnerHTML={animationStyle}/>
        <div>MSC</div>
        <button onClick={() => {
            config.set({...config.get(), showDetail: false});
        }}>Close
        </button>
    </div>
}