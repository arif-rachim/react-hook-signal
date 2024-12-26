import {
    ButtonHTMLAttributes,
    CSSProperties,
    DetailedHTMLProps,
    forwardRef,
    LegacyRef,
    RefObject,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import {BORDER, BORDER_NONE} from "../../core/style/Border.ts";
import {useHoveredOnPress} from "../../core/hooks/useHoveredOnPress.ts";
import {FormContext} from "../form/Form.tsx";
import {IconType} from "../../core/components/icon/IconElement.tsx";
import * as Io from "react-icons/io";
import {useSignalEffect} from "react-hook-signal";

/**
 * A custom Button component.
 */
export const Button = forwardRef(function Button(props: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    icon?: IconType
}, ref) {
    const {style, type: typeProps, onClick, icon,disabled, ...properties} = props;
    const Icon = icon && icon in Io ? Io[icon] : undefined;
    const type = typeProps ?? 'button';
    const {ref: localRef, isHovered, isOnPress} = useHoveredOnPress(ref as RefObject<HTMLElement>);
    const [isBusy,setIsBusy] = useState<boolean>(false);
    const [isDisabled,setIsDisabled] = useState<boolean>(disabled === true);
    const formContext = useContext(FormContext);
    const buttonDisabled = isDisabled || isBusy;

    useEffect(() => {
        setIsDisabled(disabled === true);
    }, [disabled]);

    useSignalEffect(() => {
        const isBusy = formContext !== undefined && formContext.isBusy.get();
        const isDisabled = formContext !== undefined && formContext.isDisabled.get();
        setIsBusy(isBusy);
        setIsDisabled(isDisabled);
    })
    const buttonStyle: CSSProperties = useMemo(() => {
        const defaultStyle: CSSProperties = {
            opacity : buttonDisabled ? 0.8 : 1,
            border: type === 'submit' ? BORDER_NONE : BORDER,
            backgroundColor: type === 'submit' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
            color: type === 'submit' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
            borderRadius: 20,
            boxShadow: buttonDisabled ? 'unset' : isOnPress ? '0px 5px 5px -3px rgba(0,0,0,0.5) inset' : isHovered ? '0px 5px 8px -3px rgba(255,255,255,0.2) inset' : 'unset',
            transition: 'box-shadow 100ms ease-in-out',
            ...style,
            paddingLeft: isNumber(style?.paddingLeft) && style?.paddingLeft > 10 ? style?.paddingLeft : 10,
            paddingRight: isNumber(style?.paddingRight) && style?.paddingRight > 10 ? style?.paddingRight : 10,
            paddingTop: style?.paddingTop,
            paddingBottom: isNumber(style?.paddingBottom) && style?.paddingBottom > 3 ? style?.paddingBottom : 3,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5
        };
        return defaultStyle;
    }, [buttonDisabled, type, isOnPress, isHovered, style]);

    return <button ref={localRef as LegacyRef<HTMLButtonElement>} style={buttonStyle} type={type} onClick={(event) => {
        if (type === 'reset' && formContext) {
            event.preventDefault();
            event.stopPropagation();
            formContext.reset();
            return;
        }
        if (onClick) {
            onClick(event)
        }
    }} disabled={buttonDisabled} {...properties}>
        {Icon && <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center',paddingTop:1}}><Icon/></div>}
        {props.children && <div style={{display: 'flex', flexDirection: 'column'}}>
            {props.children}
        </div>}

    </button>
});

function isNumber(val:unknown):val is number {
    return val !== null && val !== undefined && typeof val === 'number';
}