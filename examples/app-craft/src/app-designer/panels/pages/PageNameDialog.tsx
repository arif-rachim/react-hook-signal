import {Page} from "../../AppDesigner.tsx";
import {notifiable, useSignal} from "react-hook-signal";
import {isEmpty} from "../../../utils/isEmpty.ts";
import {BORDER} from "../../Border.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {Button} from "../../button/Button.tsx";
import {Icon} from "../../Icon.ts";

export function PageNameDialog(props: { closePanel: (param?: string) => void, allPages: Array<Page>, page: Page }) {
    const valueSignal = useSignal(props.page.name);
    const errorSignal = useSignal('');

    function nameIsValid() {
        const name = valueSignal.get();
        if (isEmpty(name)) {
            return 'Name is required';
        }
        const existingPage = props.allPages.find(i => i.name === name && i.id !== props.page.id);
        if (existingPage) {
            return 'Name is already taken'
        }
        return '';
    }

    return <div style={{display: 'flex', flexDirection: "column", gap: 10, width: 300}}>
        <div style={{fontSize: 22, padding: '10px 20px', borderBottom: BORDER}}>Add Page</div>
        <div style={{display: 'flex', flexDirection: 'column', padding: '0px 20px'}}>
            <label style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{marginLeft: 10}}>Page Name :</div>
                <notifiable.input style={{border: BORDER, borderRadius: 5, padding: '5px 10px'}}
                                  value={valueSignal}
                                  onKeyDown={(e) => {
                                      if (e.key === " ") {
                                          e.preventDefault();
                                          e.stopPropagation();
                                      }
                                  }}
                                  onChange={(event) => {
                                      const dom = event.target;
                                      const cursorPosition = dom.selectionStart;
                                      const val = dom.value;
                                      valueSignal.set(val);
                                      setTimeout(() => {
                                          dom.setSelectionRange(cursorPosition, cursorPosition);
                                      }, 0);
                                  }}

                />
                <notifiable.div style={{color: colors.red}}>
                    {() => {
                        return errorSignal.get()
                    }}
                </notifiable.div>
            </label>
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            borderTop: BORDER,
            padding: '10px 20px',
            gap: 10
        }}>
            <Button onClick={() => {
                const errorMessage = nameIsValid();
                errorSignal.set(errorMessage);
                if (isEmpty(errorMessage)) {
                    props.closePanel(valueSignal.get());
                }
            }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <div>{'Save'}</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18}}>
                    <Icon.Save/></div>
            </Button>
            <Button onClick={() => {
                props.closePanel();
            }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}}>
                <div>{'Close'}</div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18}}>
                    <Icon.Exit/></div>
            </Button>
        </div>
    </div>
}