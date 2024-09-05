import {CSSProperties} from "react";

export function justifyContent(container?: {
    type: 'vertical' | 'horizontal',
    verticalAlign: 'top' | 'center' | 'bottom' | '',
    horizontalAlign: 'left' | 'center' | 'right' | ''
}): CSSProperties["justifyContent"] {
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

export function alignItems(container?: {
    type: 'vertical' | 'horizontal',
    verticalAlign: 'top' | 'center' | 'bottom' | '',
    horizontalAlign: 'left' | 'center' | 'right' | ''
}): CSSProperties["alignItems"] {
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


export function verticalAlign(container?: {
    type: 'vertical' | 'horizontal',
    justifyContent: CSSProperties['justifyContent'],
    alignItems: CSSProperties['alignItems']
}): 'top' | 'center' | 'bottom' | '' {
    if (container && container.type === 'vertical') {
        if (container.justifyContent === 'flex-start') {
            return 'top';
        }
        if (container.justifyContent === 'center') {
            return 'center';
        }
        if (container.justifyContent === 'flex-end') {
            return 'bottom';
        }
        if (container.justifyContent === '') {
            return '';
        }
    }
    if (container && container.type === 'horizontal') {
        if (container.alignItems === 'flex-start') {
            return 'top';
        }
        if (container.alignItems === 'center') {
            return 'center';
        }
        if (container.alignItems === 'flex-end') {
            return 'bottom';
        }
        if (container.alignItems === '') {
            return '';
        }
    }
    return ''
}


export function horizontalAlign(container?: {
    type: 'vertical' | 'horizontal',
    justifyContent: CSSProperties['justifyContent'],
    alignItems: CSSProperties['alignItems']
}): 'left' | 'center' | 'right' | '' {
    if (container && container.type === 'vertical') {
        if (container.alignItems === 'flex-start') {
            return 'left';
        }
        if (container.alignItems === 'center') {
            return 'center';
        }
        if (container.alignItems === 'flex-end') {
            return 'right';
        }
        if (container.alignItems === '') {
            return '';
        }
    }
    if (container && container.type === 'horizontal') {
        if (container.justifyContent === 'flex-start') {
            return 'left';
        }
        if (container.justifyContent === 'center') {
            return 'center';
        }
        if (container.justifyContent === 'flex-end') {
            return 'right';
        }
        if (container.justifyContent === '') {
            return '';
        }
    }
    return ''
}