import {useShowModal} from "../../core/hooks/modal/useShowModal.ts";
import {AppDesignerContext} from "../designer/AppDesignerContext.ts";
import {BORDER} from "../../core/style/Border.ts";
import {useAppContext} from "../../core/hooks/useAppContext.ts";
import {PageSelector} from "./PageSelector.tsx";
import {CSSProperties} from "react";
import {PageSchemaMapper} from "./PageSchemaMapper.tsx";

export function PageInputSelector(props: {
    value?: string,
    onChange: (value?: string) => void,
    style?: CSSProperties,
    chipColor?: CSSProperties['backgroundColor'],
    hidePageName?: boolean,
    bindWithMapper?: boolean,
    mapperInputSchema?: string,
    mapperValue?: string,
    mapperValueChange?: (value?: string) => void,
}) {
    // if bind with mapper is set true then we need to introduce function to map the old code to new code
    const showModal = useShowModal();
    const context = useAppContext<AppDesignerContext>();
    const {allPagesSignal} = context;
    const {value, onChange, bindWithMapper, mapperInputSchema, mapperValue, mapperValueChange} = props;
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

        if (result !== "cancel" && bindWithMapper === true && mapperInputSchema) {
            const mapperFunction = await showModal<string | undefined | 'cancel'>(closePanel => {
                return <AppDesignerContext.Provider value={context}>
                    <PageSchemaMapper
                        closePanel={closePanel}
                        value={mapperValue}
                        pageId={result}
                        mapperInputSchema={mapperInputSchema}
                    />
                </AppDesignerContext.Provider>
            });
            if (mapperFunction !== 'cancel' && mapperValueChange) {
                mapperValueChange(mapperFunction);
            }
        }
        if (result !== 'cancel') {
            onChange(result);
        }
    }

    return <div
        style={{
            border: BORDER,
            display: 'flex',
            borderRadius: 5,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '5px 5px',
            gap: 5,
            ...props.style
        }}
        onClick={showPageSelector}>
        {page && props.hidePageName !== true &&
            <div style={{
                backgroundColor: props.chipColor ? props.chipColor : 'rgba(0,0,0,0.1)',
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