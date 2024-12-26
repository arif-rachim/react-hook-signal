import {useRecordErrorMessage} from "../../../core/hooks/useRecordErrorMessage.ts";
import {AnySignal, useComputed, useSignalEffect} from "react-hook-signal";
import {Variable, VariableInstance} from "../AppDesigner.tsx";
import {ZodType} from "zod";
import {useAppContext} from "../../../core/hooks/useAppContext.ts";
import {callableInitialization} from "./callableSchemaInitialization.ts";
import {fetcherInitialization} from "./fetcherSchemaInitialization.ts";
import {queryInitialization} from "./queryInitialization.ts";
import {createContext, PropsWithChildren, useContext, useRef} from "react";
import {AppVariableInitializationContext, FormulaDependencyParameter,} from "./AppVariableInitialization.tsx";
import {Signal} from "signal-polyfill";
import {createValidator} from "./createValidator.ts";
import {validateVariables} from "./validateVariables.ts";
import {initiateComputed} from "./initiateComputed.ts";
import {initiateState} from "./initiateState.ts";
import {initiateEffect} from "./initiateEffect.ts";
import {useModalBox} from "./useModalBox.tsx";
import {useSaveSqlLite} from "../../../core/hooks/useSaveSqlLite.ts";
import {useDeleteSqlLite} from "../../../core/hooks/useDeleteSqlLite.ts";
import {whichChange} from "../../../core/hooks/useWhichChange.ts";

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

    const alertBox = useModalBox();
    const saveSqlLite = useSaveSqlLite();
    const deleteSqlLite = useDeleteSqlLite();
    const tools = {saveSqlLite,deleteSqlLite};

    const validatorsComputed = useComputed<Array<{ variableId: string, validator: ZodType }>>(() => {
        return createValidator(allPageVariablesSignal.get(), errorMessage);
    });

    useSignalEffect(() => {
        const variableInstances = allPageVariablesSignalInstance.get();
        const variableValidators = validatorsComputed.get();
        validateVariables(variableInstances, variableValidators, errorMessage);
    });

    const appScopesSignal = useContext(AppVariableInitializationContext);
    //const ref = useRef();
    const pageScopesSignal = useComputed(() => {

        const app = appScopesSignal.get();
        const allPageVariablesInstance = allPageVariablesSignalInstance.get();
        const allPageVariables = allPageVariablesSignal.get();
        const allPageQueries = allPageQueriesSignal.get();
        const allFetchers = allPageFetchersSignal.get();
        const allCallables = allPageCallablesSignal.get();
        // this is kept here for future references why this page scopes is getting rebuild
        //whichChange({label:'pagesRecreated',props:{allPageVariablesInstance,allPageVariables,allPageQueries,allFetchers,allCallables},ref})
        const pageVar = variablesInstanceToDictionary(allPageVariablesInstance, allPageVariables);
        const pageQueries = queryInitialization(allPageQueries);

        const page: FormulaDependencyParameter = {
            var: pageVar,
            query: pageQueries
        }

        page.fetch = fetcherInitialization({
            allFetchers,
            app,
            page
        });
        page.call = callableInitialization({
            allCallables,
            app,
            page,
            navigate,
            alertBox,
            tools
        })
        return page;
    });
    const ref2 = useRef();
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
        }));
        whichChange({ref:ref2,label:'allPageVariablesSignalInstance.set',props:{applicationVariables,applicationVariablesInstance,variableInitialValue,variables}})
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
            variables,
            alertBox,
            tools
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