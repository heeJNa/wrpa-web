// plugins/init-auth.server.ts
export default defineNuxtPlugin(async (nuxtApp) => {
    const { isLogin } = storeToRefs(useAuthStore())

    try {
        const { isLogin: _isLogin } = await $fetch('/api/auth/session', {
            headers: useRequestHeaders(['cookie']),
        })
        isLogin.value = _isLogin
        // auth.value.user = _user
    } catch {
        isLogin.value = false
        // auth.value.user = null
    }
})