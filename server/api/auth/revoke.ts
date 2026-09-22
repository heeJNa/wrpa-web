import { clearSessionCookies } from '../../utils/session'

// 클라이언트가 401/403 을 받았을 때 호출 — 세션 쿠키 두 장을 모두 지운다
export default defineEventHandler(async (event) => {
  clearSessionCookies(event)
  setResponseStatus(event, 200)
  return 'ok'
})
