import {useEffect, useRef} from "react";
import {notifiable, useSignal, useSignalEffect} from "react-hook-signal";
import {transformValue} from "../utils/transformValue.ts";

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
        transformValue({start: oldWidth, end: propsWidth, duration: 300}, (value) => widthSignal.set(Math.round(value)))
    }, [propsWidth, widthSignal]);
    useEffect(() => {
        const oldHeight = heightSignal.get();
        transformValue({start: oldHeight, end: propsHeight, duration: 300}, (value) => heightSignal.set(Math.round(value)))
    }, [heightSignal, propsHeight]);

    useSignalEffect(() => {
        const data = dataSignal.get();
        const width = widthSignal.get();
        const height = heightSignal.get();
        const backgroundColor = backgroundColorSignal.get();
        const lineColor = lineColorSignal.get();
        const gradientColor = gradientColorSignal.get();
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
