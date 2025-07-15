
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

/**
 * Checks whether the given string is a valid UUID v4 format.
 *
 * UUID v4 format: xxxxxxxx-xxxx-4xxx-[8|9|a|b]xxx-xxxxxxxxxxxx
 *
 * @param uuid - The UUID string to validate
 * @returns `true` if valid UUID v4, otherwise `false`
 */
export const isValidUUIDv4 = (uuid: string): boolean => {
    const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89abAB][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidV4Regex.test(uuid)
}

/**
 * Handles API errors by displaying appropriate messages and managing session state.
 *
 * @param nuxtApp - The Nuxt application context
 * @param statusCode - The HTTP status code of the error
 * @param message - Optional custom error message
 */
export const errorHandler = async (nuxtApp: any, toast: any, statusCode: number, message?: string) => {
    if (statusCode === 401 || statusCode === 403) {
        await $fetch('/api/auth/revoke').then(async () => {
            await nuxtApp.runWithContext(() => {
                const tokenState = useState('accessToken')
                tokenState.value = null;
                toast.add({
                    severity: 'error',
                    summary: '세션이 만료되었습니다. 다시 로그인해주세요.',
                    life: 5000,
                })
                navigateTo('/login')
            })
        })
    } else if (
        statusCode === 404
        || statusCode === 400
        || statusCode === 429
    ) {
        toast.add({ severity: 'warn', summary: message, life: 5000 })
    } else if (statusCode === 500) {
        toast.add({ severity: 'error', summary: message, life: 5000 })
    } else {
        toast.add({
            severity: 'error',
            summary: '알 수 없는 오류가 발생했습니다.',
            life: 5000,
        })
    }
}