import {Signal} from "signal-polyfill";

export type ScreenSize = 'desktop' | 'tablet' | 'mobile';
function getScreenMode():ScreenSize {
    if (window.innerWidth >= 1024) {
        return 'desktop'
    } else if (window.innerWidth >= 786) {
        return 'tablet'
    } else {
        return 'mobile'
    }
}

window.addEventListener('resize',() => {
    screenSize.set(getScreenMode());
})

export const screenSize = new Signal.State<ScreenSize>(getScreenMode());