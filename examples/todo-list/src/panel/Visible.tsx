import {PropsWithChildren, type ReactNode, useState} from "react";
import {useSignalEffect} from "react-hook-signal"
import {screenSize, ScreenSize} from "../signals/screenSize.ts";

/**
 * Props for the Visible component based on different screen sizes.
 */
type VisibleProps = {
    [K in ScreenSize as `on${Capitalize<K>}`]?: boolean;
}

/**
 * A component that renders its children based on the visibility condition for the current screen size.
 * @param {PropsWithChildren<VisibleProps>} props - Props for the Visible component.
 * @returns {React.ReactNode} - Rendered component.
 */
export function Visible(props: PropsWithChildren<VisibleProps>): ReactNode {
    const screenSizeValue = screenSize.get();
    const key = `on${capUp(screenSizeValue)}` as keyof typeof props;
    const [visible, setVisible] = useState(props[key] === true);

    useSignalEffect(() => {
        const screenSizeValue = screenSize.get();
        const key = `on${capUp(screenSizeValue)}` as keyof typeof props;
        setVisible(props[key] === true);
    });

    if (visible) {
        return props.children;
    }
    return <></>;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} letter - The input string.
 * @returns {string} - The string with the first letter capitalized.
 */
function capUp(letter: string): string {
    const [firstLetter, ...rest] = letter;
    return firstLetter.toUpperCase() + rest.join('');
}