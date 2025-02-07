import { useEffect, useRef } from "react";

interface SwipeConfig {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number;
}

export function useSwipe(
    { onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeConfig,
) {
    const touchStart = useRef<number>(0);
    const touchEnd = useRef<number>(0);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStart.current = e.targetTouches[0].clientX;
        };

        const handleTouchMove = (e: TouchEvent) => {
            touchEnd.current = e.targetTouches[0].clientX;
        };

        const handleTouchEnd = () => {
            const distance = touchStart.current - touchEnd.current;
            const isSwipe = Math.abs(distance) > threshold;

            if (isSwipe) {
                if (distance > 0) {
                    onSwipeLeft?.();
                } else {
                    onSwipeRight?.();
                }
            }
        };

        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [onSwipeLeft, onSwipeRight, threshold]);
}
