import {Component, ErrorInfo, ReactNode} from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error: error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        this.setState({ errorInfo: errorInfo,error:error });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{padding:'20px 50px'}}>
                    <h1>Something went wrong.</h1>
                    <code style={{ whiteSpace: 'pre-wrap', }}>
                        {this.state.error && this.state.error.toString()}
                    </code>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
