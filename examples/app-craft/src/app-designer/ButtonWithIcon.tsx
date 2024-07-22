import {HTMLAttributes} from "react";
import {IconType} from "react-icons";
import {BORDER} from "./Border.ts";

/**
 * Renders a button with an icon.
 */
export function ButtonWithIcon(props: HTMLAttributes<HTMLDivElement> & { icon: IconType }) {
    const {icon: Icon, ...properties} = props;
    return <div
        style={{
            border: BORDER,
            padding: 5,
            borderRadius: 5,
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }} {...properties}>
        <Icon/>
    </div>
}