import {Page} from "../../AppDesigner.tsx";
import {notifiable, useSignal} from "react-hook-signal";
import {isEmpty} from "../../../utils/isEmpty.ts";
import {BORDER} from "../../Border.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {Button} from "../../button/Button.tsx";

export function PageNameDialog(props: {
    closePanel: (param?: string) => void,
    allPages: Array<Page>,
    page: Page,
    isForClone?: boolean
}) {
    const valueSignal = useSignal(props.page.name);
    const errorSignal = useSignal('');

    function nameIsValid() {
        const name = valueSignal.get();
        if (isEmpty(name)) {
            return 'The page name cannot be empty;it must have a value.';
        }
        const existingPage = props.allPages.find(i => i.name === name && i.id !== props.page.id);
        if (existingPage) {
            return `The page name "${name}" is already in use. Please choose a different name.`
        }
        return '';
    }

    const isNewPage = isEmpty(props.page.name);

    return <div style={{display: 'flex', flexDirection: "column", gap: 10, width: 300}}>
        <div style={{
            fontSize: 22,
            padding: '10px 20px',
            borderBottom: BORDER
        }}>{props.isForClone ? 'Save As' : isNewPage ? 'Add New Page' : 'Rename Page'}</div>
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
            }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}} icon={'IoIosSave'}>
                {'Save'}
            </Button>
            <Button onClick={() => {
                props.closePanel();
            }} style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}} icon={'IoIosExit'}>
                {'Close'}
            </Button>
        </div>
    </div>
}