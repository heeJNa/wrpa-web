export const useAuthStore = defineStore(
  'auth',
  () => {
    const toast = useToast()
    const token = ref<string | null>(null)

    const isAuthenticated = computed(() => !!token.value)
    const login = (_token: string): boolean => {
      if (!_token) {
        toast.add({
          severity: 'error',
          summary: 'Login failed',
          detail: 'Invalid token provided.',
          life: 5000,
        })
        return false
      }
      console.log('Login successful with token:', _token)
      token.value = _token
      return true
    }
    const logout = () => {
      token.value = ''
    }
    return {
      token,
      isAuthenticated,
      login,
      logout,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.cookies({
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 3, // 3 hours
      }),
      pick: ['token'],
    },
  },
)
