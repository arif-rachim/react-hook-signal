import {notifiable, useSignal} from "../main.ts";
import {Notifiable} from "../components.ts";

export function SimpleTest() {
    const count = useSignal(0)

    const children = useSignal(() => {
        return false
    })
    return (
        <div>
            <h2>React library to work with SignalState & SignalComputed</h2>
            <button data-testid={'button'} onClick={
                () => {
                    count.set(count.get() + 1);
                }
            }>Increment
            </button>
            <notifiable.div ></notifiable.div>
            <notifiable.button>{children}</notifiable.button>
            <notifiable.div data-testid={'signal-div'} style={() => {
                return {
                    background : count.get() % 2 === 0 ? 'red' : 'white'
                }
            }} >{() => <div>{count.get()}</div>}</notifiable.div>

            <Notifiable component={MyComponent} name={'arif'} onChange={() => {
                debugger;
            }}></Notifiable>
        </div>
    )
}

// type SignalLambdaNormal = 'signal' | 'lambda' | 'normal'
// function isOfType<T extends SignalLambdaNormal>(attributeName: string, value: unknown, type: T): value is InferIsOfType<T> {
//     switch (type) {
//         case "signal":
//             return value !== undefined && value !== null && typeof value === 'object' && 'get' in value
//         case "lambda":
//             return !attributeName.startsWith('on') && value !== undefined && value !== null && typeof value === 'function'
//         case "normal":
//             return true
//         default :
//             return false
//     }
// }
//
// type InferIsOfType<T extends SignalLambdaNormal> = T extends 'signal' ? AnySignal<unknown> : T extends 'lambda' ? Lambda<unknown> : unknown
// type InferSignalLambdaValue<T,Key> = Key extends `on${string}` ? T : T extends Lambda<infer A> ? A : T extends AnySignal<infer B> ? B : T;
// function filterPropsByType<P>(props: P, type: SignalLambdaNormal) {
//     return Object.entries(props!).reduce(function mapPropsByType(acc, [key, value]) {
//         if (type === 'lambda' && isOfType(key, value, 'lambda')) {
//             return {...acc,[key]:value.call(undefined)}
//         }
//         if (type === 'signal' && isOfType(key, value, 'signal')) {
//             return {...acc,[key]:value.get()}
//         }
//         if (type === 'normal' && isOfType(key, value, 'normal')) {
//             return {...acc,[key]:value}
//         }
//         return acc;
//     }, {} as Partial<{ [Key in keyof P]: InferSignalLambdaValue<P[Key],Key> }>)
// }
//
// function withNotifiableProps<T extends object>(Component: ComponentType<T>){
//     return function NotifiableComponent(props: NotifiableProps<T>) {
//         const normalProps = filterPropsByType<typeof props>(props, 'normal');
//
//         const [signalProps, setSignalProps] = useState(function initialSignalProps() {
//             return filterPropsByType(props, 'signal')
//         });
//
//         useSignalEffect(function updateSignalProps() {
//             return setSignalProps(filterPropsByType(props, 'signal'))
//         })
//
//         const lambdaPropsSignal = useSignal(function updateLambdaProps() {
//             return filterPropsByType(props, 'lambda');
//         })
//
//         const [lambdaProps, setLambdaProps] = useState(function initialLambdaProps() {
//             return lambdaPropsSignal.get()
//         });
//
//         useSignalEffect(function whenLambdaPropsChanged() {
//             return setLambdaProps(lambdaPropsSignal.get())
//         })
//
//         const mergedProps = ({...normalProps, ...signalProps, ...lambdaProps}) as PropsWithChildren<T>
//
//         const children = (mergedProps && 'children' in mergedProps ? mergedProps.children : undefined);
//
//         return createElement(Component, mergedProps, children);
//     };
// }
//
// const MyCompNotifiable = withNotifiableProps(MyComponent);

function MyComponent(props:{name:string,onChange:() => void}){
    return <div>Hello World {props.name}</div>
}





