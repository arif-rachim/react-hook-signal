import {Component, ErrorInfo, ReactNode} from 'react';
import {Container} from "../../app/designer/AppDesigner.tsx";

interface Props {
    children: ReactNode;
    container?: Container;
    allContainers?: Array<Container>;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    container?: Container;
    allContainers?: Array<Container>;

    constructor(props: Props) {
        super(props);
        this.container = props.container;
        this.allContainers = props.allContainers;
        this.state = {hasError: false, error: null, errorInfo: null};
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return {hasError: true, error: error, errorInfo: {componentStack: error.stack}};
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        // this.setState({hasError: true, errorInfo: errorInfo, error: error});
        console.log(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const text = getPath(this.container, this.allContainers);
            return (
                <div style={{padding: '20px 50px'}}>
                    <h1>Something went wrong.</h1>
                    <h3>{text}</h3>
                    <code style={{whiteSpace: 'pre-wrap',}}>
                        {this.state.error && this.state.error.toString()}
                    </code>
                </div>
            );
        }

        return this.props.children;
    }

}

function getPath(container?: Container, allContainers?: Array<Container>): string {
    const parent = (allContainers ?? []).find(i => i.id === container?.parent);
    if (parent) {
        return getPath(parent, allContainers) + '/' + container?.type
    }
    return container?.type ?? '';
}

export default ErrorBoundary;
