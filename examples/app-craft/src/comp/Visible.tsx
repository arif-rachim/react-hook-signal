import {useComputed, useSignalEffect} from "react-hook-signal";
import {CSSProperties, PropsWithChildren, useState} from "react";

export default function Visible(props: PropsWithChildren<{
    when: () => boolean,
    eagerLoaded?: boolean,
    style?: CSSProperties
}>) {
    const computed = useComputed(props.when);
    const [visible, setVisible] = useState(true);
    useSignalEffect(() => {
        setVisible(computed.get());
    })

    if (props.eagerLoaded === true) {
        return <div style={{display: visible ? "flex" : "none", flexDirection: 'column', ...props.style}}>
            {props.children}
        </div>
    } else {
        return visible ? props.children : false;
    }
}