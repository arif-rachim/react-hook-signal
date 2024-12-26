import {useEffect, useRef, useState} from "react";
import {useSignalEffect} from "react-hook-signal";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {AppViewerContext} from "../../../app/viewer/context/AppViewerContext.ts";

const transitionDuration = 100;
export default function LoadingScreen() {
    const [isStable, setIsStable] = useState(false);
    const [showLoading, setShowLoading] = useState(true);
    const stabilityDelay = transitionDuration;
    const stabilityTimer = useRef<number>(0);
    const {activePageIdSignal} = useAppContext<AppViewerContext>();

    useSignalEffect(() => {
        activePageIdSignal.get();
        setShowLoading(true);
        setIsStable(false);
        const tm = setTimeout(() => {
            setIsStable(true);
        }, transitionDuration / 2);
        stabilityTimer.current = tm as unknown as number;
    })
    useEffect(() => {
        const observer = new PerformanceObserver(() => {
            setShowLoading(true);
            setIsStable(false);
            clearTimeout(stabilityTimer.current);
            const tm = setTimeout(() => {
                setIsStable(true);
            }, stabilityDelay);
            stabilityTimer.current = tm as unknown as number;
        });
        observer.observe({type: 'layout-shift'});
        return () => {
            observer.disconnect();
            clearTimeout(stabilityTimer.current);
        }
    }, [stabilityDelay]);
    useEffect(() => {
        if (isStable) {
            setTimeout(() => {
                setShowLoading(false);
            }, transitionDuration + 50);
        }
    }, [isStable]);
    return <>{showLoading && <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: isStable ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.1)',
        backdropFilter: isStable ? 'blur(0px)' : 'blur(60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        transition: `all ${transitionDuration}ms ease-in-out`
    }}></div>}</>


}