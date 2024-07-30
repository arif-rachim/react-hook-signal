import {Button} from "./Button.tsx";
import {useState} from "react";
import {BORDER} from "../Border.ts";

export default function ButtonGroup(props: {
    buttons: Record<string, { onClick: () => void }>,
    defaultButton: string
}) {
    const [selectedButton, setSelectedButton] = useState<string>(props.defaultButton);
    return <>
        {Object.keys(props.buttons).map((key, index, array) => {
            const isFirstElement = index === 0;
            const isLastElement = index === array.length - 1;
            const isSelected = selectedButton === key;
            return <Button key={key}
                           style={{
                               borderRadius: 0,
                               borderLeft: isFirstElement ? BORDER : "unset",
                               borderTopLeftRadius: isFirstElement ? 20 : 0,
                               borderBottomLeftRadius: isFirstElement ? 20 : 0,
                               borderTopRightRadius: isLastElement ? 20 : 0,
                               borderBottomRightRadius: isLastElement ? 20 : 0,
                               backgroundColor: isSelected ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
                               color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.9)'
                           }}
                           onClick={() => {
                               setSelectedButton(key)
                               props.buttons[key].onClick()
                           }}>{key}</Button>
        })}
    </>
}