import {ContainerPropertyType} from "../../app/designer/AppDesigner.tsx";
import {useUpdateApplication} from "./useUpdateApplication.ts";

// queries GA pake
// fetch GA pake
// state GA pake
// computed GA pake
// property value GA pake

// effect pake
// callable pake
// property callback pake
export function useRefactorPageName() {

    const updateApplication = useUpdateApplication();
    return function refactorPageName(props: { currentName: string, newName: string }) {
        updateApplication(application => {
            const app = structuredClone(application);
            let codesToCheck: Array<{ functionCode: string, id: string, name: string }> = []
            const {currentName, newName} = props;

            codesToCheck = codesToCheck.concat(app.variables);
            codesToCheck = codesToCheck.concat(app.callables);

            app.pages.forEach(p => {
                codesToCheck = codesToCheck.concat(p.variables);
                codesToCheck = codesToCheck.concat(p.callables);
            });

            const propsToCheck: Array<Record<string, ContainerPropertyType>> = []
            app.pages.forEach(p => {
                p.containers.forEach(p => {
                    propsToCheck.push(p.properties)
                })
            })
            const regex = new RegExp(`navigate\\(\\s*['"]${currentName.replace(/\//g, '\\/')}['"]\\s*(,\\s*\\{[^}]*\\})?\\s*\\)`, 'g');

            codesToCheck.forEach(v => {
                const matches = v.functionCode.matchAll(regex);
                for (const match of matches) {
                    const originalText = match[0];
                    const newText = originalText.replace(currentName, newName);
                    v.functionCode = v.functionCode.replace(originalText, newText);
                }
            })

            propsToCheck.forEach(v => {
                Object.keys(v).forEach(key => {
                    const matches = (v[key].formula ?? '').matchAll(regex);
                    for (const match of matches) {
                        const originalText = match[0];
                        const newText = originalText.replace(currentName, newName);
                        v[key].formula = v[key].formula.replace(originalText, newText);
                    }
                })
            })

            application.pages = app.pages;
            application.callables = app.callables;
            application.variables = app.variables;

        })
    }
}
