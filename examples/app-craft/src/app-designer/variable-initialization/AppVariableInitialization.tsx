import {useRecordErrorMessage} from "../hooks/useRecordErrorMessage.ts";
import {AnySignal, useComputed, useSignalEffect} from "react-hook-signal";
import {Signal} from "signal-polyfill";
import {VariableInstance} from "../AppDesigner.tsx";
import {ZodType} from "zod";
import {useAppContext} from "../hooks/useAppContext.ts";
import {callableInitialization} from "./initiator/callableSchemaInitialization.ts";
import {fetcherInitialization} from "./initiator/fetcherSchemaInitialization.ts";
import {queryInitialization} from "./initiator/queryInitialization.ts";
import {createContext, PropsWithChildren} from "react";
import {QueryTypeResult} from "../query-grid/QueryGrid.tsx";
import {SqlValue} from "sql.js";
import {createValidator} from "./initiator/createValidator.ts";
import {validateVariables} from "./initiator/validateVariables.ts";
import {initiateComputed} from "./initiator/initiateComputed.ts";
import {initiateEffect} from "./initiator/initiateEffect.ts";
import {initiateState} from "./initiator/initiateState.ts";
import {variablesInstanceToDictionary} from "./initiator/variablesInstanceToDictionary.ts";
import {QueryParamsObject} from "../panels/database/table-editor/queryDb.ts";
import {useModalBox} from "./initiator/useModalBox.tsx";
import {useSaveSqlLite} from "../hooks/useSaveSqlLite.ts";
import {useDeleteSqlLite} from "../hooks/useDeleteSqlLite.ts";


export type QueryType = (props: {
    params?: Record<string, SqlValue>,
    page?: number,
    filter?: QueryParamsObject,
    sort?: Array<{ column: string, direction: 'asc' | 'desc' }>,
    rowPerPage?: number
}) => Promise<QueryTypeResult>

export type FetchType = (inputs?: Record<string, unknown>) => Promise<Record<string, unknown> & { error?: string }>
export type FormulaDependencyParameter = {
    var?: Record<string, AnySignal<unknown>>,
    call?: Record<string, (...args: unknown[]) => unknown>,
    fetch?: Record<string, FetchType>,
    query?: Record<string, QueryType>,
}

export function AppVariableInitialization(props: PropsWithChildren) {

    const errorMessage = useRecordErrorMessage();
    const {
        allApplicationCallablesSignal,
        allApplicationVariablesSignal,
        allApplicationVariablesSignalInstance,
        allApplicationFetchersSignal,
        allApplicationQueriesSignal,
        navigate
    } = useAppContext();

    const alertBox = useModalBox();
    const saveSqlLite = useSaveSqlLite();
    const deleteSqlLite = useDeleteSqlLite();
    const tools = {saveSqlLite,deleteSqlLite};

    const validatorsApplicationComputed = useComputed<Array<{ variableId: string, validator: ZodType }>>(() => {
        return createValidator(allApplicationVariablesSignal.get(), errorMessage);
    });

    useSignalEffect(() => {
        const variableInstances = allApplicationVariablesSignalInstance.get();
        const variableValidators = validatorsApplicationComputed.get();
        validateVariables(variableInstances, variableValidators, errorMessage);
    });


    const appScopesSignal = useComputed(() => {

        const allApplicationVariablesInstance = allApplicationVariablesSignalInstance.get();
        const appVar = variablesInstanceToDictionary(allApplicationVariablesInstance, allApplicationVariablesSignal.get());
        const appQueries = queryInitialization(allApplicationQueriesSignal.get());

        const app: FormulaDependencyParameter = {
            var: appVar,
            query: appQueries,
        }
        app.fetch = fetcherInitialization({
            allFetchers: allApplicationFetchersSignal.get(),
            app,
            page: {}
        })
        app.call = callableInitialization({
            allCallables: allApplicationCallablesSignal.get(),
            app,
            page: {},
            navigate,
            alertBox,
            tools
        })
        return app;
    });

    useSignalEffect(() => {
        const variables = allApplicationVariablesSignal.get() ?? [];
        const stateInstances: Array<VariableInstance> = variables.filter(v => v.type === 'state').map(initiateState({}));
        const computedInstance = variables.filter(v => v.type === 'computed').map(initiateComputed({
            var: variablesInstanceToDictionary(stateInstances, variables)
        }, {}))
        allApplicationVariablesSignalInstance.set([...stateInstances, ...computedInstance]);
    });

    useSignalEffect(() => {
        const app = appScopesSignal.get();
        const variables = allApplicationVariablesSignal.get();
        return initiateEffect({
            app,
            page: {},
            navigate,
            variables,
            alertBox,
            tools
        })
    })

    return <AppVariableInitializationContext.Provider value={appScopesSignal}>
        {props.children}
    </AppVariableInitializationContext.Provider>
}

export const AppVariableInitializationContext = createContext<AnySignal<FormulaDependencyParameter>>(new Signal.State({}));
