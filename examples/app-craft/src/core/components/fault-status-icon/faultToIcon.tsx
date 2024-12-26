import {CircleB, CircleC, CircleN, CircleX, Dash, Diagonal, RedX} from "./FaultStatusIcon.tsx";

export function faultToIcon(status: string, size: number = 17) {
    status = status.toUpperCase();
    switch (status) {
        case '-' :
            return <Dash size={size}/>;
        case 'X':
            return <RedX size={size}/>;
        case '/':
            return <Diagonal size={size}/>;
        case '(X)':
            return <CircleX size={size}/>;
        case '(B)':
            return <CircleB size={size}/>;
        case '(C)':
            return <CircleC size={size}/>;
        case '(N)':
            return <CircleN size={size}/>;
        default :
            return ''
    }
}