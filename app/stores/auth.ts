export const useAuthStore = defineStore(
  'auth',
  () => {
    const isLogin = ref(false)
    const user = ref<null | { id: number; name: string }>(null)
    return {
      isLogin,
      user,
    }
  }
)
