/**
 * Delays execution for a specified amount of time.
 * @param {number} timeout - The duration of the delay in milliseconds.
 * @returns {Promise<void>} A Promise that resolves after the specified delay.
 */
export function delay(timeout: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timeout);
    });
}
