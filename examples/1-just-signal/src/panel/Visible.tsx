import {PropsWithChildren, useState} from "react";
import {useSignalEffect} from "../../../../src/hooks.ts";
import {screenSize, ScreenSize} from "../signals/screenSize.ts";


type VisibleProps = {
    [K in ScreenSize as `on${Capitalize<K>}`]?: boolean
}

export function Visible(props: PropsWithChildren<VisibleProps>) {
    const screenSizeValue = screenSize.get();
    const key = `on${capUp(screenSizeValue)}` as keyof typeof props;
    const [visible, setVisible] = useState(props[key] === true);

    useSignalEffect(() => {
        const screenSizeValue = screenSize.get();
        const key = `on${capUp(screenSizeValue)}` as keyof typeof props;
        setVisible(props[key] === true)
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