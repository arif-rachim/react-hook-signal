import {CircleB, CircleC, CircleN, CircleX, Dash, Diagonal, RedX} from "./FaultStatusIcon.tsx";

export function faultToIconByStatusId(statusId: number, size: number = 17) {
    switch (statusId) {
        case 30:
            return <Diagonal size={size}/>;
        case 31:
            return <RedX size={size}/>;
        case 38:
            return <Dash size={size}/>;
        case 39:
            return <CircleX size={size}/>;
        case 41:
            return <CircleB size={size}/>;
        case 42:
            return <CircleC size={size}/>;
        case 43:
            return <CircleN size={size}/>;
        default:
            return ''
    }
}