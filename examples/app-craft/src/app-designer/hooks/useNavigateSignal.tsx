import {useComputed} from "react-hook-signal";
import {useShowModal} from "../../modal/useShowModal.ts";
import {Button} from "../button/Button.tsx";
import {Icon} from "../Icon.ts";
import {useAppContext} from "./useAppContext.ts";
import {AppDesignerContext} from "../AppDesignerContext.ts";

export function useNavigateSignal() {
    const {
        allPagesSignal,
        activePageIdSignal,
        allErrorsSignal,
        uiDisplayModeSignal,
        variableInitialValueSignal
    } = useAppContext<AppDesignerContext>()
    const showModal = useShowModal();
    return useComputed(() => {
        const allPages = allPagesSignal.get();
        return allPages.reduce((navigate, page) => {
            navigate[page.name] = async (param: unknown) => {
                if (uiDisplayModeSignal.get() === 'design') {
                    const go = await showModal(closePanel => {
                        return <div
                            style={{display: 'flex', flexDirection: 'column', padding: 20, maxWidth: 300, gap: 10}}>
                            <div>{`You are in design mode, do you want to continue navigate to ${page.name} ?`}</div>
                            <div style={{display: 'flex', flexDirection: 'row', gap: 10, justifyContent: 'flex-end'}}>
                                <Button onClick={() => closePanel(true)}
                                        style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5}}>
                                    <div>Yes</div>
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <Icon.Exit/></div>
                                </Button>
                                <Button onClick={() => closePanel(false)}
                                        style={{display: 'flex', flexDirection: 'row', alignItems: "center", gap: 5}}>
                                    <div>No</div>
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <Icon.ArrowDown/></div>
                                </Button>
                            </div>
                        </div>
                    });
                    if (!go) {
                        return;
                    }
                }
                allErrorsSignal.set([]);
                variableInitialValueSignal.set(param as Record<string, unknown> ?? {});
                activePageIdSignal.set(page.id);
            }
            return navigate;
        }, {} as Record<string, (param: unknown) => void>);
    });
}