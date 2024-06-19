import {IconType} from "react-icons";
import {RiCoinFill, RiInputField, RiLayoutHorizontalLine, RiLayoutVerticalLine} from "react-icons/ri";
import {CSSProperties} from "react";
import {colors} from "../utils/colors.ts";

interface BaseConfigType {
    icon: IconType,
    dragAndDropStyle: {
        borderWhenHovered: CSSProperties['border'],
        borderWhenFocused: CSSProperties['border'],
        backgroundWhenDragOver: CSSProperties['background']
        backgroundWhenHovered: CSSProperties['background']
    },
    style: CSSProperties
}

interface ComponentConfigType extends BaseConfigType {
    label: 'Vertical' | 'Horizontal' | 'Button',
}

interface InputConfigType extends BaseConfigType {
    label: 'Input'
    errorStyle: {
        borderWhenError: CSSProperties['border']
    }
}

type ConfigType = ComponentConfigType | InputConfigType

function createConfig<T extends Record<string, ConfigType>>(params: T): T {
    return params
}

export const ComponentConfig = createConfig({
    Vertical: {
        label: 'Vertical',
        icon: RiLayoutHorizontalLine,
        dragAndDropStyle: {
            backgroundWhenDragOver: 'rgba(0,0,0,0.3)',
            borderWhenHovered: `1px dashed rgba(0,0,0,0.2)`,
            borderWhenFocused: `1px solid ${colors.blue}`,
            backgroundWhenHovered : `rgba(255,192,0,0.1)`
        },
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: 'rgba(0,0,0,0.05)',
            border: `1px solid rgba(0,0,0,0)`,
            minWidth: 20,
            minHeight: 20,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 10,
            paddingBottom: 10,
            borderRadius: 0
        },
    },
    Horizontal: {
        label: 'Horizontal',
        icon: RiLayoutVerticalLine,
        dragAndDropStyle: {
            backgroundWhenDragOver: 'rgba(0,0,0,0.3)',
            borderWhenHovered: `1px dashed rgba(0,0,0,0.2)`,
            borderWhenFocused: `1px solid ${colors.blue}`,
            backgroundWhenHovered : `rgba(255,192,0,0.1)`
        },
        style: {
            display: 'flex',
            flexDirection: 'row',
            gap: 10,
            backgroundWhenDragOver: 'rgba(0,0,0,0.3)',
            background: 'rgba(0,0,0,0.05)',
            borderWhenHovered: `1px dashed rgba(0,0,0,0.2)`,
            borderWhenFocused: `1px dashed rgba(0,0,0,0.5)`,
            border: `1px solid rgba(0,0,0,0)`,
            minWidth: 20,
            minHeight: 20,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 10,
            paddingBottom: 10,
            borderRadius: 0
        },
    },
    Input: {
        label: 'Input',
        icon: RiInputField,
        dragAndDropStyle: {
            backgroundWhenDragOver: 'rgba(0,0,0,0.3)',
            borderWhenHovered: `1px dashed rgba(0,0,0,0.2)`,
            borderWhenFocused: `1px solid ${colors.blue}`,
            backgroundWhenHovered : `rgba(255,192,0,0.1)`
        },
        errorStyle: {
            borderWhenError: `1px solid ${colors.red}`,
        },
        style: {
            background: 'rgba(255,255,255,1)',
            border: `1px solid rgba(0,0,0,0.2)`,
            minWidth: 20,
            minHeight: 20,
            margin: 0,
            padding: 5,
            borderRadius: 10
        },
    },
    Button: {
        label: 'Button',
        icon: RiCoinFill,
        dragAndDropStyle: {
            backgroundWhenDragOver: 'rgba(0,0,0,0.3)',
            borderWhenHovered: `1px dashed rgba(0,0,0,0.2)`,
            borderWhenFocused: `1px solid ${colors.blue}`,
            backgroundWhenHovered : `rgba(255,192,0,0.1)`
        },
        style: {
            background: 'rgba(0,0,0,0.05)',
            border: `1px solid rgba(0,0,0,0.1)`,
            minWidth: 20,
            minHeight: 20,
            margin: 0,
            padding: 5,
            borderRadius: 10
        },
    }
})

export function ComponentLibrary() {
    return <div style={{display: 'flex', flexDirection: 'column'}}>
        {(Object.keys(ComponentConfig) as Array<keyof typeof ComponentConfig>).map(key => {
            return <ComponentItem icon={ComponentConfig[key].icon} label={ComponentConfig[key].label} componentId={key}
                                  key={key}/>
        })}
    </div>
}

function ComponentItem(props: { icon: IconType, label: string, componentId: string }) {
    const {icon: Icon, componentId, label} = props;
    return <div
        style={{
            padding: 5,
            flexDirection: 'row',
            display: 'flex',
            cursor: 'pointer',
            gap: 10,
            alignItems: 'center'
        }}
        draggable={true}
        onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', componentId);
        }}
    >
        <Icon style={{fontSize: 22}}/>
        <div>{label}</div>
    </div>
}