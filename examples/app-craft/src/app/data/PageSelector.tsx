import {notifiable, useComputed, useSignal} from "react-hook-signal";
import {BORDER} from "../../core/style/Border.ts";
import {Icon} from "../../core/components/icon/Icon.ts";
import {Button} from "../button/Button.tsx";
import {useAppContext} from "../../core/hooks/useAppContext.ts";

/**
 * A component for selecting dependencies.
 */
export function PageSelector(props: {
    closePanel: (param: string | undefined | 'cancel') => void,
    value?: string,
    pageToFilterOut: string
}) {

    const {closePanel, pageToFilterOut, value} = props;
    const {allPagesSignal} = useAppContext();
    const selectedPage = useSignal<string | undefined>(value);
    const elements = useComputed(() => {
        const pages = allPagesSignal.get();
        const selected = selectedPage.get();
        return pages.filter(i => i.id !== pageToFilterOut).map((i) => {
            const isSelected = i.id === selected;
            return <div key={i.id} style={{display: 'flex', alignItems: 'center', gap: 5}}
                        onClick={() => {
                            const selected = selectedPage.get();
                            const isSelected = selected === i.id;
                            if (isSelected) {
                                selectedPage.set(undefined)
                            } else {
                                selectedPage.set(i.id);
                            }
                        }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18
                }}>
                    {isSelected && <Icon.CheckboxChecked/>}
                    {!isSelected && <Icon.CheckboxBlank/>}
                </div>
                <div style={{textOverflow: 'ellipsis', overflow: 'hidden'}}>{i.name}</div>
            </div>
        })
    })
    return <div style={{display: 'flex', flexDirection: 'column', gap: 10, width: 600, height: 300}}>
        <div style={{
            borderBottom: BORDER,
            padding: 20,
            backgroundColor: 'rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 5
        }}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22}}><Icon.Page/>
            </div>
            <div style={{fontSize: 16}}>Page that will be referenced by :</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'auto', padding: '0px 20px'}}>

            <notifiable.div style={{display: 'flex', flexDirection: 'column'}}>
                {elements}
            </notifiable.div>
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 10,
            borderTop: BORDER,
            padding: 20,
            backgroundColor: 'rgba(0,0,0,0.05)'
        }}>
            <Button onClick={() => {
                const nextPage = selectedPage.get();
                closePanel(nextPage);
            }} style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }} icon={'IoIosSave'}>
                {'Save'}
            </Button>
            <Button onClick={() => closePanel('cancel')} style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center'
            }} icon={'IoIosExit'}>
                {'Cancel'}
            </Button>
        </div>
    </div>
}