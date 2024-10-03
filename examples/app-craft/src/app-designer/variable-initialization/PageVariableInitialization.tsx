import {useRecordErrorMessage} from "../hooks/useRecordErrorMessage.ts";
import {AnySignal, useComputed, useSignalEffect} from "react-hook-signal";
import {Variable, VariableInstance} from "../AppDesigner.tsx";
import {ZodType} from "zod";
import {useAppContext} from "../hooks/useAppContext.ts";
import {callableInitialization} from "./initiator/callableSchemaInitialization.ts";
import {fetcherInitialization} from "./initiator/fetcherSchemaInitialization.ts";
import {queryInitialization} from "./initiator/queryInitialization.ts";
import {createContext, PropsWithChildren, useContext} from "react";
import {AppVariableInitializationContext, FormulaDependencyParameter,} from "./AppVariableInitialization.tsx";
import {Signal} from "signal-polyfill";
import {createValidator} from "./initiator/createValidator.ts";
import {validateVariables} from "./initiator/validateVariables.ts";
import {initiateComputed} from "./initiator/initiateComputed.ts";
import {initiateState} from "./initiator/initiateState.ts";
import {initiateEffect} from "./initiator/initiateEffect.ts";

export function PageVariableInitialization(props: PropsWithChildren) {

    const errorMessage = useRecordErrorMessage();
    const {
        allApplicationVariablesSignal,
        allApplicationVariablesSignalInstance,
        allPageVariablesSignal,
        allPageVariablesSignalInstance,
        allPageQueriesSignal,
        allPageCallablesSignal,
        allPageFetchersSignal,
        variableInitialValueSignal,
        navigate
    } = useAppContext();

    const validatorsComputed = useComputed<Array<{ variableId: string, validator: ZodType }>>(() => {
        return createValidator(allPageVariablesSignal.get(), errorMessage);
    });

    useSignalEffect(() => {
        const variableInstances = allPageVariablesSignalInstance.get();
        const variableValidators = validatorsComputed.get();
        validateVariables(variableInstances, variableValidators, errorMessage);
    });

    const appScopesSignal = useContext(AppVariableInitializationContext);
    const pageScopesSignal = useComputed(() => {
        const app = appScopesSignal.get();
        const allPageVariablesInstance = allPageVariablesSignalInstance.get();
        const pageVar = variablesInstanceToDictionary(allPageVariablesInstance, allPageVariablesSignal.get());
        const pageQueries = queryInitialization(allPageQueriesSignal.get());
        const page: FormulaDependencyParameter = {
            var: pageVar,
            query: pageQueries
        }
        page.fetch = fetcherInitialization({
            allFetchers: allPageFetchersSignal.get(),
            app,
            page
        });
        page.call = callableInitialization({
            allCallables: allPageCallablesSignal.get(),
            app,
            page,
            navigate
        })
        return page;
    });


    useSignalEffect(() => {
        const applicationVariables = allApplicationVariablesSignal.get() ?? [];
        const applicationVariablesInstance = allApplicationVariablesSignalInstance.get();
        const variableInitialValue = variableInitialValueSignal.get() ?? {};
        const variables = allPageVariablesSignal.get() ?? [];
        const stateInstances: Array<VariableInstance> = variables.filter(v => v.type === 'state').map(initiateState(variableInitialValue));
        const computedInstance = variables.filter(v => v.type === 'computed').map(initiateComputed({
            var: variablesInstanceToDictionary(applicationVariablesInstance, applicationVariables),
        }, {
            var: variablesInstanceToDictionary(stateInstances, variables),
        }))
        allPageVariablesSignalInstance.set([...stateInstances, ...computedInstance]);
    });

    useSignalEffect(() => {
        const app = appScopesSignal.get();
        const page = pageScopesSignal.get();

        const variables = allPageVariablesSignal.get();
        return initiateEffect({
            app,
            page,
            navigate,
            variables
        })
    })
    return <PageVariableInitializationContext.Provider value={pageScopesSignal}>
        {props.children}
    </PageVariableInitializationContext.Provider>
}

export const PageVariableInitializationContext = createContext<AnySignal<FormulaDependencyParameter>>(new Signal.State({}));

function variablesInstanceToDictionary(variableInstances: Array<VariableInstance>, variables: Array<Variable>): Record<string, AnySignal<unknown>> {
    return variableInstances.reduce((res, variableInstance) => {
        const v = variables.find(v => variableInstance.id === v.id);
        if (v) {
            res[v.name] = variableInstance.instance
        }
        return res;
    }, {} as Record<string, AnySignal<unknown>>);
}