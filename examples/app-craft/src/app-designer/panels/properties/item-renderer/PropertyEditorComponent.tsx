import {Button} from "../../../button/Button.tsx";
import {colors} from "stock-watch/src/utils/colors.ts";
import {Icon} from "../../../Icon.ts";
import {BORDER} from "../../../Border.ts";

export function PropertyEditorComponent(props:{isFormulaEmpty: boolean, onClick: () => void, hasError: boolean}) {
    const {isFormulaEmpty,onClick,hasError} = props;
    return <div style={{display: 'flex'}}>
        <Button style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            backgroundColor: isFormulaEmpty ? 'rgba(255,255,255,0.9)' : colors.green,
            color: isFormulaEmpty ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
            padding: '0px 5px'
        }} onClick={onClick}><Icon.Formula style={{fontSize: 16}}/></Button>
        <div style={{
            display: 'flex',
            padding: '0px 5px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.05)',
            border: BORDER,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20
        }}>
            {hasError && <Icon.Error style={{fontSize: 16, color: colors.red}}/>}
            {!hasError && <Icon.Checked style={{fontSize: 16, color: colors.green}}/>}
        </div>
    </div>;
}
