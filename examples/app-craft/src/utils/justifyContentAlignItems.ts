import {Container} from "../app-designer/AppDesigner.tsx";
import {CSSProperties} from "react";

export function justifyContent(container?: Container): CSSProperties["justifyContent"] {
    if (container && container.type === 'vertical') {
        if (container.verticalAlign === 'top') {
            return 'flex-start';
        }
        if (container.verticalAlign === 'center') {
            return 'center';
        }
        if (container.verticalAlign === 'bottom') {
            return 'flex-end';
        }
        if (container.verticalAlign === '') {
            return '';
        }
    }
    if (container && container.type === 'horizontal') {
        if (container.horizontalAlign === 'left') {
            return 'flex-start';
        }
        if (container.horizontalAlign === 'center') {
            return 'center';
        }
        if (container.horizontalAlign === 'right') {
            return 'flex-end';
        }
        if (container.horizontalAlign === '') {
            return '';
        }
    }
    return ''
}

export function alignItems(container?: Container): CSSProperties["alignItems"] {
    if (container && container.type === 'vertical') {
        if (container.horizontalAlign === 'left') {
            return 'flex-start';
        }
        if (container.horizontalAlign === 'center') {
            return 'center';
        }
        if (container.horizontalAlign === 'right') {
            return 'flex-end';
        }
        if (container.horizontalAlign === '') {
            return '';
        }
    }
    if (container && container.type === 'horizontal') {
        if (container.verticalAlign === 'top') {
            return 'flex-start';
        }
        if (container.verticalAlign === 'center') {
            return 'center';
        }
        if (container.verticalAlign === 'bottom') {
            return 'flex-end';
        }
        if (container.verticalAlign === '') {
            return '';
        }
    }
    return ''
}