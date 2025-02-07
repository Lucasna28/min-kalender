import { RefObject, useEffect } from "react";

export function useClickOutside(
    ref: RefObject<HTMLElement>,
    handler: () => void,
    enabled = true,
) {
    useEffect(() => {
        if (!enabled) return;

        const handleClick = (event: MouseEvent | TouchEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("touchstart", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("touchstart", handleClick);
        };
    }, [ref, handler, enabled]);
}
