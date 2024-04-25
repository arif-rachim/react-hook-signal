import {PropsWithChildren, useState} from "react";
import {useSignalEffect} from "../../../../src/hooks.ts";
import {screenSize, ScreenSize} from "../signals/screenSize.ts";


type VisibleProps = {
    [K in ScreenSize as `on${Capitalize<K>}`]?: boolean
}

export function Visible(props: PropsWithChildren<VisibleProps>) {
    const [visible, setVisible] = useState(props[`on${capUp(screenSize.get())}`] === true);

    useSignalEffect(() => {
        const screenSizeValue = screenSize.get();
        setVisible(props[`on${capUp(screenSizeValue)}`] === true)
    })
    if (visible) {
        return props.children;
    }
    return <></>
}

function capUp(letter: string) {
    const [firstLetter, ...rest] = letter;
    return firstLetter.toUpperCase() + (rest as string[]).join('');
}