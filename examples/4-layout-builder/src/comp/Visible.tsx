import {useComputed, useSignalEffect} from "react-hook-signal";
import {PropsWithChildren, useState} from "react";

export default function Visible(props: PropsWithChildren<{ when: () => boolean }>) {
    const computed = useComputed(props.when);
    const [visible, setVisible] = useState(true);
    useSignalEffect(() => {
        setVisible(computed.get());
    })
    if (visible) {
        return props.children;
    }
    return false;
}