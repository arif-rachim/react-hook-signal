export type ErrorType =
    VariableSchemaError
    | VariableValueError
    | VariableValidationError
    | PropertySchemaError
    | PropertyValueError
    | PropertyValidationError
    | CallbackInvocationError
    | FetcherInvocationError

type VariableSchemaError = {
    type: 'variable',
    category: 'schema';
    variableId: string,
    message: string
}

type VariableValueError = {
    type: 'variable',
    category: 'value',
    variableId: string,
    message: string,
}

type VariableValidationError = {
    type: 'variable',
    category: 'validation',
    variableId: string,
    message: string
}

type PropertySchemaError = {
    type: 'property',
    category: 'schema',
    containerId: string,
    propertyName: string,
    message: string
}

type PropertyValueError = {
    type: 'property',
    category: 'value',
    containerId: string,
    propertyName: string,
    message: string
}

type PropertyValidationError = {
    type: 'property',
    category: 'validation',
    containerId: string,
    propertyName: string,
    message: string
}

type CallbackInvocationError = {
    type: 'property',
    category: 'invocation',
    containerId: string,
    propertyName: string,
    message: string
}

type FetcherInvocationError = {
    type: 'fetcher',
    category: 'invocation';
    fetcherId: string,
    message: string
}