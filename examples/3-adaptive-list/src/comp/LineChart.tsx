import {useEffect, useRef} from "react";

export function LineChart(props: {
    data: Array<number>,
    width: number,
    height: number,
    backgroundColor: string,
    lineColor: string,
    gradientColors: Array<string>
}) {
    const {data, width, height, backgroundColor, lineColor, gradientColors} = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        // Clear the canvas
        //ctx.clearRect(0, 0, width, height);

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
            gradientColors.forEach((colorStop: string, index: number) => {
                gradient.addColorStop(index / (gradientColors.length - 1), colorStop);
            });
            ctx.fillStyle = gradient;
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.fill();
        }
    }, [data, width, height]);

    return <canvas ref={canvasRef} width={width} height={height}/>;
}
