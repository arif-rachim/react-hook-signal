import {useEffect, useRef} from "react";
import {notifiable, useSignal, useSignalEffect} from "react-hook-signal";

export function LineChart(props: {
    data: Array<number>,
    width: number,
    height: number,
    backgroundColor: string,
    lineColor: string,
    gradientColors: Array<string>
}) {

    const {
        data: propsData,
        width: propsWidth,
        height: propsHeight,
        backgroundColor: propsBackgroundColor,
        lineColor: propsLineColor,
        gradientColors: propsGradientColors,
    } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const dataSignal = useSignal(propsData);
    const widthSignal = useSignal(propsWidth);
    const heightSignal = useSignal(propsHeight);
    const backgroundColorSignal = useSignal(propsBackgroundColor);
    const lineColorSignal = useSignal(propsLineColor);
    const gradientColorSignal = useSignal(propsGradientColors);

    useEffect(() => dataSignal.set(propsData), [dataSignal, propsData]);
    useEffect(() => backgroundColorSignal.set(propsBackgroundColor), [backgroundColorSignal, propsBackgroundColor]);
    useEffect(() => lineColorSignal.set(propsLineColor), [lineColorSignal, propsLineColor]);
    useEffect(() => gradientColorSignal.set(propsGradientColors), [gradientColorSignal, propsGradientColors]);

    useEffect(() => {
        const oldWidth = widthSignal.get();
        transformValue({start: oldWidth, end: propsWidth, duration: 300}, (value) => {
            widthSignal.set(Math.round(value));
        })
    }, [propsWidth, widthSignal]);
    useEffect(() => {
        const oldHeight = heightSignal.get();
        transformValue({start: oldHeight, end: propsHeight, duration: 300}, (value) => {
            heightSignal.set(Math.round(value));
        })
    }, [heightSignal, propsHeight]);

    useSignalEffect(() => {
        const data = dataSignal.get();
        const width = widthSignal.get();
        const height = heightSignal.get();
        const backgroundColor = backgroundColorSignal.get();
        const lineColor = lineColorSignal.get();
        const gradientColor = gradientColorSignal.get();
        console.log('width', width, 'height', height);
        const canvas = canvasRef.current;
        if (canvas === null) {
            return;
        }
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);

        // Draw axes
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.stroke();

        // Draw data points and lines
        if (data.length > 1) {
            const xIncrement = width / (data.length - 1);
            const yIncrement = height / (Math.max(...data) - Math.min(...data));
            ctx.strokeStyle = lineColor;
            ctx.beginPath();
            ctx.moveTo(0, height - (data[0] - Math.min(...data)) * yIncrement);
            data.forEach((value: number, index: number) => {
                const x = index * xIncrement;
                const y = height - (value - Math.min(...data)) * yIncrement;
                ctx.lineTo(x, y);
                //ctx.arc(x, y, 2, 0, Math.PI * 2);
            });
            ctx.stroke();

            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradientColor.forEach((colorStop: string, index: number) => {
                gradient.addColorStop(index / (gradientColor.length - 1), colorStop);
            });
            ctx.fillStyle = gradient;
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.fill();
        }
    });

    return <notifiable.canvas ref={canvasRef} width={widthSignal} height={heightSignal}/>;
}

// function easeInOut(t: number) {
//     return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
// }

function linear(t: number): number {
    return t;
}

function transformValue(config: {
    start: number,
    end: number,
    duration: number,
    easing?: (t: number) => number
}, callback: (value: number) => void) {
    const {end, start, duration} = config;
    let {easing} = config;
    // default easing easeInOut
    easing = easing ?? linear;
    let startTime: DOMHighResTimeStamp | null = null;

    // Define the animation function
    function animate(timestamp: DOMHighResTimeStamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1); // Ensure progress is between 0 and 1

        // Apply linear interpolation
        const easedProgress = easing!(progress)
        const interpolatedValue = start + (end - start) * easedProgress;

        // Do something with the interpolated value (e.g., update UI)
        callback(interpolatedValue);

        // Continue the animation until duration is reached
        if (elapsed < duration) {
            requestAnimationFrame(animate);
        }
    }

    // Start the animation
    requestAnimationFrame(animate);
}
