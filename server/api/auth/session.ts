import { ACCESS_COOKIE, REFRESH_COOKIE } from '../../utils/session'

// 갱신 토큰만 남아 있어도(접근 토큰 만료) 다음 API 호출에서 조용히 재발급되므로 로그인 상태로 본다
export default defineEventHandler(async (event) => {
  const loggedIn = Boolean(getCookie(event, ACCESS_COOKIE) || getCookie(event, REFRESH_COOKIE))
  return { isLogin: loggedIn }
})
