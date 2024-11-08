import {Variable} from "../../AppDesigner.tsx";
import {effect} from "react-hook-signal";
import {FormulaDependencyParameter} from "../AppVariableInitialization.tsx";
import {dbSchemaInitialization} from "./dbSchemaInitialization.ts";
import {ModalBox} from "./useModalBox.tsx";


const db = dbSchemaInitialization()

export function initiateEffect(props: {
    navigate: (path: string, param?: unknown) => Promise<void>,
    variables: Array<Variable>,
    app: FormulaDependencyParameter,
    page: FormulaDependencyParameter,
    modalBox: ModalBox
}) {
    const {
        navigate,
        variables,
        app,
        page,
        modalBox
    } = props;

    const destructorCallbacks: Array<() => void> = [];
    for (const v of variables) {
        if (v.type !== 'effect') {
            continue;
        }
        const params = ['navigate', 'db', 'app', 'page', 'modalBox', `${v.functionCode}`];
        try {
            const func = new Function(...params) as (...args: unknown[]) => void
            const destructor = effect(() => {
                const instances = [navigate, db, app, page, modalBox]
                try {
                    func.call(null, ...instances);
                } catch (err) {
                    console.error(err);
                    console.log(v.functionCode);
                }
            });
            destructorCallbacks.push(destructor);
        } catch (err) {
            console.error(err);
            console.log(v.functionCode);
        }
    }
    return () => {
        destructorCallbacks.forEach(d => d());
    }
}