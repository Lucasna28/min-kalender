import { useEffect } from "react";

export function usePullToRefresh(onRefresh: () => Promise<void>) {
    useEffect(() => {
        let touchStart: number | null = null;
        let touchEnd: number | null = null;

        const handleTouchStart = (e: TouchEvent) => {
            touchStart = e.targetTouches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            touchEnd = e.targetTouches[0].clientY;
        };

        const handleTouchEnd = async () => {
            if (!touchStart || !touchEnd) return;

            const distance = touchEnd - touchStart;
            const isTop = window.scrollY === 0;

            if (distance > 100 && isTop) {
                await onRefresh();
            }

            touchStart = null;
            touchEnd = null;
        };

        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [onRefresh]);
}
