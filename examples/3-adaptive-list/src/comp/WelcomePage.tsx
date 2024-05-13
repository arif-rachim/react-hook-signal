// Check if backdrop-filter is supported
import {Signal} from "signal-polyfill";
import {notifiable, useSignalEffect} from "react-hook-signal";

/**
 * Renders a Welcome Page component with a fade-in effect and optional backdrop filter.
 */
export function WelcomePage(props: { visible: Signal.State<boolean> }) {
    const {visible} = props;
    useSignalEffect(() => {
        const isVisible = visible.get();
        if (!isVisible) {
            setTimeout(() => {
                document.getElementById('welcome')!.style.display = 'none';
            }, 300)
        }
    })

    /**
     * Checks if the backdrop-filter property is supported in the current browser.
     */
    function isBackdropFilterSupported() {
        // Create a test element
        const testElement = document.createElement('div');
        testElement.style.cssText = 'backdrop-filter: blur(1px);';
        // Append the test element to the body
        document.body.appendChild(testElement);
        // Check if the backdrop-filter property is recognized
        const isSupported = !!testElement.style.backdropFilter;
        // Remove the test element from the DOM
        document.body.removeChild(testElement);
        return isSupported;
    }

    return <notifiable.div id={'welcome'} style={() => {
        const isVisible = visible.get();
        return {
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: isBackdropFilterSupported() ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,1)',
            zIndex: 100,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            opacity: isVisible ? 1 : 0,
            gap: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: isBackdropFilterSupported() ? 'blur(50px)' : undefined,
            transition: 'opacity 300ms linear'
        }
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            maxWidth: 300,
            gap: 15
        }}>
            <h1 style={{fontSize: 22}}>Hello,</h1>
            <p>
                The primary motivation behind this project was to showcase the potential of Signal, particularly when
                compared to conventional methods like useState and useEffect. Stocks were chosen as the focal point due
                to
                their complex nature, requiring real-time updates and handling vast amounts of data while maintaining a
                user-friendly interface.
            </p>

            <h2>Reactive Programming:</h2>
            <p>Signal simplifies complex application development by providing a reactive
                programming
                paradigm. This approach streamlines tasks such as implementing infinite scrolling and ensures optimal
                performance, even in dynamic environments like real-time data streaming.
            </p>

            <h2>Efficiency:</h2>
            <p>By selectively updating components, Signal significantly enhances React's rendering
                efficiency.
                This results in a cleaner, more efficient codebase, approximately 40% fewer lines compared to
                traditional
                methods.
            </p>
            <h2>Conclusion:</h2>
            <p>I'm excited to share this journey with you all and invite you to explore the application and dive into
                the code. I hope it inspires you in your own projects!
            </p>
            <p>
                <a href={'https://www.rach.im'} style={{color:'white'}}>About me</a>
            </p>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <button style={{
                    padding: 10,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    fontSize: 18
                }} onClick={() => visible.set(false)}>Okay
                </button>
            </div>
        </div>
    </notifiable.div>
}
