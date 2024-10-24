import {CSSProperties, ForwardedRef, forwardRef, PropsWithChildren, ReactNode} from "react";
import {useAppContext} from "../../hooks/useAppContext.ts";
import {AppDesignerContext} from "../../AppDesignerContext.ts";

const LABEL_POPUP_Z_INDEX = 1;
export const Label = forwardRef(function LabelContainer(props: PropsWithChildren<{
        label?: string,
        style?: CSSProperties,
        styleLabel?: CSSProperties,
        popup?: {
            element?: ReactNode,
            position?: 'top' | 'bottom',
            visible?: boolean
        }
    }>, ref: ForwardedRef<HTMLLabelElement>) {
        const {style, label, styleLabel} = props;
        const context = useAppContext<AppDesignerContext>();
        const isDesignMode = context && context.uiDisplayModeSignal && context.uiDisplayModeSignal.get() === 'design'
        return <label ref={ref} style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            ...style
        }}>
            {label && <div style={{padding: '0 5px', fontSize: 'small', lineHeight: 1.2, ...styleLabel}}>{label}</div>}
            {props.children}
            {props.popup?.visible === true && !isDesignMode &&
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                top: props.popup?.position === 'top' ? 0 : "unset",
                bottom: props.popup?.position !== 'top' ? 0 : "unset",
                height: 1,
                width: '100%'
            }}>
                <div style={{
                    zIndex: LABEL_POPUP_Z_INDEX,
                    bottom: props.popup?.position === 'top' ? 0 : "unset",
                    top: props.popup?.position !== 'top' ? 0 : "unset",
                    position: 'absolute',
                    width: '100%'
                }}>{props.popup?.element}</div>
            </div>
            }
        </label>
    }
);