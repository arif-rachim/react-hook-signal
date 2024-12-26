import {Button} from "./Button.tsx";
import {BORDER} from "../../core/style/Border.ts";

export default function ButtonGroup(props: {
    buttons: Record<string, { onClick: () => void, title: string }>,
    value: string
}) {
    const {value} = props;
    return <>
        {Object.keys(props.buttons).map((key, index, array) => {
            const isFirstElement = index === 0;
            const isLastElement = index === array.length - 1;
            const isSelected = value === key;
            return <Button key={key}
                           style={{
                               borderRadius: 0,
                               borderLeft: isFirstElement ? BORDER : "unset",
                               borderTopLeftRadius: isFirstElement ? 20 : 0,
                               borderBottomLeftRadius: isFirstElement ? 20 : 0,
                               borderTopRightRadius: isLastElement ? 20 : 0,
                               borderBottomRightRadius: isLastElement ? 20 : 0,
                               backgroundColor: isSelected ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
                               color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.9)',
                               padding: '0px 10px 2px 10px'
                           }}
                           onClick={() => {
                               props.buttons[key].onClick()
                           }}>{props.buttons[key].title}</Button>
        })}
    </>
}