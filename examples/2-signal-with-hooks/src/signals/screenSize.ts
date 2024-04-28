import {Signal} from "signal-polyfill";

/**
 * Represents the possible screen sizes.
 */
export type ScreenSize = 'desktop' | 'tablet' | 'mobile';

/**
 * Retrieves the current screen mode based on the window's inner width.
 * @returns {ScreenSize} The current screen mode.
 */
function getScreenMode(): ScreenSize {
    if (window.innerWidth >= 1024) {
        return 'desktop';
    } else if (window.innerWidth >= 786) {
        return 'tablet';
    } else {
        return 'mobile';
    }
}

/**
 * Event listener for window resize events. Updates the screenSize signal with the current screen mode.
 */
window.addEventListener('resize', () => {
    screenSize.set(getScreenMode());
});

/**
 * Signal representing the current screen size.
 * @type {Signal.State} The signal state of the screen size
*/
export const screenSize = new Signal.State<ScreenSize>(getScreenMode());