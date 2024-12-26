import {Icon} from "../../../../core/components/icon/Icon.ts";


export function EmptyComponent() {
    return <div style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        gap: 10
    }}>
        <Icon.Question style={{fontSize: 18}}/>
        <div>
            Oops we cant find the component to render!
        </div>
    </div>
}
