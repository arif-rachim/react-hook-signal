export function easeInOut(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

export function linear(t: number): number {
    return t;
}

export function transformValue<T extends (number | Record<string, number>)>(config: {
    start: T,
    end: T,
    duration: number,
    easing?: (t: number) => number,
}, callback: (value: T) => void, onComplete?: () => void) {
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
        if (isRecord(end) && isRecord(start)) {
            const interpolatedValue = Object.keys(end).reduce((result, key) => {
                result[key] = start[key] + (end[key] - start[key]) * easedProgress;
                return result;
            }, {} as Record<string, number>);
            callback(interpolatedValue as unknown as T);
        }
        if (isNumeric(end) && isNumeric(start)) {
            const interpolatedValue = start + (end - start) * easedProgress;
            callback(interpolatedValue as unknown as T)
        }
        // Continue the animation until duration is reached
        if (elapsed < duration) {
            requestAnimationFrame(animate);
        } else {
            if (onComplete) {
                onComplete();
            }
        }
    }
    requestAnimationFrame(animate);
}

function isRecord(value: unknown): value is Record<string, number> {
    return value !== undefined && value !== null && typeof value === 'object'
}

function isNumeric(value: unknown): value is number {
    return typeof value === 'number';
}
