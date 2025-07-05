/**
 * debounce 함수를 생성하는 유틸리티 함수
 * 특정 시간 동안 동일한 호출이 발생하면 마지막 호출만 수행합니다.
 *
 * @param func - 호출할 함수
 * @param delay - 지연 시간(ms)
 * @returns 지연 시간 후 실행되는 함수
 */
export const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number,
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return function (this: any, ...args: Parameters<T>): void {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
};