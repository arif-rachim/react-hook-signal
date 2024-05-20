export function easeInOut(t: number): number {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

export function linear(t: number): number {
    return t;
}

function interpolateRecord(start: Record<string, unknown>,end: Record<string, unknown>, easedProgress: number) {
    return Object.keys(end).reduce((result, key) => {
        result[key] = interpolateStartToEnd(start[key],end[key],easedProgress);
        return result;
    }, {} as Record<string, unknown>);
}

function interpolateNumber<T>(start: T & number, end: T & number, easedProgress: number) {
    return start + (end - start) * easedProgress;
}


function interpolatePercentage(start: string, end: string, easedProgress: number): string {
    const startValue = parseFloat(start);
    const endValue = parseFloat(end);
    const interpolatedValue = startValue + (endValue - startValue) * easedProgress;
    return `${interpolatedValue}%`;
}

function interpolatePx(start: string, end: string, easedProgress: number): string {
    const startValue = parseFloat(start);
    const endValue = parseFloat(end);
    const interpolatedValue = startValue + (endValue - startValue) * easedProgress;
    return `${interpolatedValue}px`;
}

function interpolateRgba(start: string, end: string, easedProgress: number): string {
    const startValues = start.match(/\d+(\.\d+)?/g)!.map(Number);
    const endValues = end.match(/\d+(\.\d+)?/g)!.map(Number);
    const interpolatedValues = startValues.map((startValue, index) => {
        const startLinear = toLinear(startValue / 255);
        const endLinear = toLinear(endValues[index] / 255);
        const interpolatedLinear = startLinear + (endLinear - startLinear) * easedProgress;
        return Math.round(toSrgb(interpolatedLinear) * 255);
    });
    return `rgba(${interpolatedValues.join(', ')})`;
}

function toLinear(value: number): number {
    // Convert sRGB to linear
    return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function toSrgb(value: number): number {
    // Convert linear to sRGB
    return value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function interpolateStartToEnd(start: unknown,end: unknown, easedProgress: number) {
    let interpolatedValue: unknown = end;
    if (isRecord(end) && isRecord(start)) {
        interpolatedValue = interpolateRecord(start, end, easedProgress);
    } else if (isNumeric(end) && isNumeric(start)) {
        interpolatedValue = interpolateNumber(start, end, easedProgress);
    } else if (isPercentage(end) && isPercentage(start)) {
        interpolatedValue = interpolatePercentage(start, end, easedProgress);
    } else if (isPx(end) && isPx(start)) {
        interpolatedValue = interpolatePx(start, end, easedProgress);
    } else if (isRgba(end) && isRgba(start)) {
        interpolatedValue = interpolateRgba(start, end, easedProgress);
    }
    return interpolatedValue;
}

export function transformValue<T extends (number | Record<string, unknown> | string)>(config: {
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
        const easedProgress = easing!(progress);
        callback(interpolateStartToEnd(start,end, easedProgress) as unknown as T)
        // Continue the animation until duration is reached
        if (elapsed < duration) {
            requestAnimationFrame(animate);
        } else if (onComplete) {
            onComplete();
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

function isPercentage(value: unknown): value is string {
    return typeof value === 'string' && value.endsWith('%');
}

function isPx(value: unknown): value is string {
    return typeof value === 'string' && value.endsWith('px');
}

function isRgba(value: unknown): value is string {
    // return typeof value === 'string' && /^rgba\(\d+, \d+, \d+, \d+\)$/.test(value);
    return typeof value === 'string' && value.startsWith('rgba')
}