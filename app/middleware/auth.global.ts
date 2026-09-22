export default defineNuxtRouteMiddleware((to) => {
  const tokenState = useState('accessToken')
  if (import.meta.server) {
    // 접근 토큰이 만료돼 사라졌어도 갱신 토큰이 있으면 다음 API 호출에서 재발급되므로 로그인 상태로 본다
    const access = useCookie('access_token')
    const refresh = useCookie('refresh_token')
    tokenState.value = access.value || refresh.value
  }
  // 로그인 페이지는 예외 처리
  if (tokenState.value && to.path.toLowerCase() === '/login') {
    return navigateTo('/')
  }
  if (!tokenState.value) {
    if (to.path === '/login') return
    return navigateTo('/login')
  }
})
