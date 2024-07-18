import {HTMLAttributes} from "react";
import {IconType} from "react-icons";

/**
 * Renders a button with an icon.
 */
export function ButtonWithIcon(props: HTMLAttributes<HTMLDivElement> & { icon: IconType }) {
    const {icon: Icon, ...properties} = props;
    return <div
        style={{
            border: '1px solid rgba(0,0,0,0.3)',
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