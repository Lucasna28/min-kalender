"use client";

import { useEffect, useState } from "react";

export function usePullToRefresh(onRefresh: () => Promise<void>) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        let startY = 0;
        let isPulling = false;
        const THRESHOLD = 150;

        const handleTouchStart = (e: TouchEvent) => {
            // Kun tillad pull-to-refresh når vi er på toppen
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        };

        const handleTouchMove = async (e: TouchEvent) => {
            if (!isPulling) return;

            const y = e.touches[0].clientY;
            const delta = y - startY;

            if (delta > THRESHOLD && !isRefreshing) {
                setIsRefreshing(true);
                try {
                    await onRefresh();
                } finally {
                    setIsRefreshing(false);
                }
                isPulling = false;
            }
        };

        const handleTouchEnd = () => {
            isPulling = false;
        };

        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchmove", handleTouchMove);
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [onRefresh, isRefreshing]);

    return isRefreshing;
}
