import {useComputed, useSignalEffect} from "react-hook-signal";
import {PropsWithChildren, useState} from "react";

export default function Visible(props: PropsWithChildren<{ when: () => boolean }>) {
    const isVisibleComputed = useComputed(props.when);
    const [visible, setVisible] = useState(props.when());
    useSignalEffect(() => {
        setVisible(isVisibleComputed.get());
    })
    if (visible) {
        return props.children
    }
    return <></>
}