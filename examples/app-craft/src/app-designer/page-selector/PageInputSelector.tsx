import {useShowModal} from "../../modal/useShowModal.ts";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {BORDER} from "../Border.ts";
import {useAppContext} from "../hooks/useAppContext.ts";
import {PageSelector} from "./PageSelector.tsx";
import {CSSProperties} from "react";

export function PageInputSelector(props: {
    value?: string,
    onChange: (value?: string) => void,
    style?:CSSProperties
}) {
    const showModal = useShowModal();
    const context = useAppContext<AppDesignerContext>();
    const {allPagesSignal} = context;
    const {value, onChange} = props;
    const page = allPagesSignal.get().find(p => p.id === value);

    async function showPageSelector() {
        const result = await showModal<string | undefined | 'cancel'>(closePanel => {
            return <AppDesignerContext.Provider value={context}>
                <PageSelector
                    closePanel={closePanel}
                    value={value}
                    pageToFilterOut={context.activePageIdSignal.get()}
                />
            </AppDesignerContext.Provider>
        });
        if (result !== 'cancel') {
            onChange(result);
        }
    }

    return <div
        style={{
            border: BORDER,
            display: 'flex',
            borderRadius: 5,
            minHeight: 25,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '5px 5px',
            gap: 5,
            ...props.style
        }}
        onClick={showPageSelector}>
        {page &&
            <div style={{
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 5,
                borderBottom: 'unset',
                flexGrow: 1,
                padding: '0px 5px'
            }}>
                {page?.name}
            </div>
        }
    </div>
}