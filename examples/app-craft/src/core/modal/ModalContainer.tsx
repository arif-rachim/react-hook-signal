import {ModalParameter} from "../hooks/modal/useModal.ts";
import {HTMLProps, useEffect, useRef} from "react";

export function ModalContainer(props: { modalPanels: Array<ModalParameter> }) {
    const modalPanels = props.modalPanels;
    return <>
        {modalPanels.map(p => {
            const position = p.config?.position;
            const isPlain = p.config?.plainPanel === true
            const justifyContent = position === 'top' ? 'flex-start' : position === 'bottom' ? 'flex-end' : 'center';
            const borderRadius = position === 'top' ? '0 0 1rem 1rem' : position === 'bottom' ? '1rem 1rem 0 0' : '1rem';
            if (isPlain) {
                return <AutoFocusDiv style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                }} key={p.id}>{p.element}</AutoFocusDiv>
            }
            return <AutoFocusDiv style={{
                position: 'absolute',
                top: 0,
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(0.5px)',
                backgroundColor: 'rgba(0,0,0,0.1)',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: justifyContent,
            }} key={p.id}>
                <div style={{
                    backgroundColor: '#FFF',
                    borderRadius: borderRadius,
                    boxShadow: '0 0px 10px -3px rgba(0,0,0,0.3),0 10px 10px 0px rgba(0,0,0,0.2)',
                    overflow: "hidden",
                    margin: '0 1rem',
                    ...animate(p.config)
                }}>{p.element}</div>
            </AutoFocusDiv>
        })}
    </>
}


const animate = (config?: {
    animation?: 'pop' | 'slide',
    position?: 'top' | 'bottom' | 'center'
}) => {
    const animation = config?.animation ?? 'pop';
    const position = config?.position ?? "center";
    if (animation === "pop") {
        return {scale: 1}
    }
    if (animation === "slide") {
        if (position === 'top') {
            return {y: 0}
        }
        if (position === 'bottom') {
            return {y: 0}
        }
        return {scale: 1}
    }
    return {};
}

function AutoFocusDiv(props:HTMLProps<HTMLDivElement>){
    const divRef = useRef<HTMLDivElement|null>(null);
    useEffect(() => {
        if(divRef.current){
            divRef.current.focus();
        }
    }, []);
    return <div ref={divRef} tabIndex={-1} {...props}/>;
}