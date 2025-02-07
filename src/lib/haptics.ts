export function vibrate(pattern: number | number[] = 10) {
    if ("vibrate" in navigator) {
        navigator.vibrate(pattern);
    }
}
