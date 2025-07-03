export default defineNuxtRouteMiddleware((to) => {
  const tokenState = useState('accessToken')
  if (import.meta.server) {
    const token = useCookie('access_token')
    tokenState.value = token.value
  }
  // 로그인 페이지는 예외 처리
  if (tokenState.value && to.path.toLowerCase() === '/login') {
    return abortNavigation()
  }
  if (!tokenState.value) {
    if (to.path === '/login') return
    return navigateTo('/login')
  }
})
