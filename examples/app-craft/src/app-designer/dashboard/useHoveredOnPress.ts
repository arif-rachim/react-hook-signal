import {RefObject, useEffect, useRef, useState} from "react";

export function useHoveredOnPress(refProp?: RefObject<HTMLElement>) {
    const _ref = useRef<HTMLElement>(null);
    const ref = refProp ?? _ref;
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isOnPress, setIsOnPress] = useState<boolean>(false)
    useEffect(() => {
        const element = ref.current;

        function onMouseEnter() {
            setIsHovered(true)
        }

        function onMouseLeave() {
            setIsHovered(false)
        }

        function onMouseDown() {
            setIsOnPress(true)
        }

        function onMouseUp() {
            setIsOnPress(false)
        }

        if (element) {
            element.addEventListener('mouseenter', onMouseEnter);
            element.addEventListener('mouseleave', onMouseLeave);
            element.addEventListener('mousedown', onMouseDown);
            element.addEventListener('mouseup', onMouseUp);
        }
        const handleMouseMove = (event: MouseEvent) => {
            const element = ref.current
            if (element) {
                const rect = element.getBoundingClientRect();
                const isInside =
                    event.clientX >= rect.left &&
                    event.clientX <= rect.right &&
                    event.clientY >= rect.top &&
                    event.clientY <= rect.bottom;

                if (!isInside) {
                    setIsHovered(false);
                    setIsOnPress(false);
                }
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            if (element) {
                element.removeEventListener('mouseenter', onMouseEnter);
                element.removeEventListener('mouseleave', onMouseLeave);
                element.removeEventListener('mousedown', onMouseDown);
                element.removeEventListener('mouseup', onMouseUp);
            }
            window.removeEventListener('mousemove', handleMouseMove);
        };
    })
    //eslint-disable-next-line
    return {ref: ref as RefObject<any>, isHovered, isOnPress}
}