import {useShowModal} from "../../modal/useShowModal.ts";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {DependencySelector} from "./DependencySelector.tsx";
import {BORDER} from "../Border.ts";
import {useAppContext} from "../hooks/useAppContext.ts";
import {Signal} from "signal-polyfill";

const empty = new Signal.Computed(() => []);
export function DependencyInputSelector(props: {
    value: Array<string>,
    onChange: (value: Array<string>) => void,
    valueToIgnore: Array<string>,
    scope: 'page' | 'application'
}) {

    const showModal = useShowModal();
    const context = useAppContext<AppDesignerContext>();
    const {value, onChange, valueToIgnore, scope} = props;
    const {allVariablesSignal:allPageVariablesSignal, allFetchersSignal:allPageFetchersSignal,allApplicationVariablesSignal} = context;
    const allVariablesSignal = scope === 'page' ? allPageVariablesSignal : allApplicationVariablesSignal;
    const allFetchersSignal = scope === 'page' ? allPageFetchersSignal : empty;

    async function showDependencySelector() {
        const result = await showModal<Array<string> | 'cancel'>(closePanel => {
            return <AppDesignerContext.Provider value={context}>
                <DependencySelector
                    closePanel={closePanel}
                    value={value}
                    signalsToFilterOut={valueToIgnore}
                    scope={scope}
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
            backgroundColor: 'white',
            flexGrow: 1,
            minHeight: 34,
            minWidth: 80,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '5px 5px',
            gap: 5,
        }}
        onClick={showDependencySelector}>{value.map(dep => {
        const variable = allVariablesSignal.get().find(i => i.id === dep);
        const fetcher = allFetchersSignal.get().find(i => i.id === dep);
        const name = variable?.name ?? fetcher?.name;
        return <div key={dep} style={{
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 5,
            borderBottom: 'unset',
            flexGrow: 1,
            padding: '0px 5px'
        }}>
            {name}
        </div>
    })}</div>
}