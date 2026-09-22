import { FetchError } from 'ofetch'
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const { rpaApiUrl } = useRuntimeConfig(event)
  const token = getCookie(event, ACCESS_COOKIE)
  const refreshToken = getCookie(event, REFRESH_COOKIE)
  const url = new URL('/api/auth/sign-out', rpaApiUrl)
  const ip = getRequestIP(event, { xForwardedFor: true })
  const timestamp = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  })
  const userAgent = event.node.req.headers['user-agent']
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    if (!token && !refreshToken) throw new Error('No token')
    console.log('[로그아웃 요청]', {
      timestamp,
      url: url.toString().replace(rpaApiUrl, ''),
      userAgent,
      ip,
    })
    // 갱신 토큰을 함께 보내 서버 세션을 폐기한다 — 쿠키만 지우면 토큰 자체는 살아 있다
    await $fetch(url.toString(), {
      method: 'POST',
      headers,
      body: { refreshToken: refreshToken ?? null },
    })

    setResponseStatus(event, 200)
    return { message: '로그아웃이 완료되었습니다.' }
  } catch (error) {
    if (error instanceof FetchError) {
      console.error('[로그아웃 실패]', {
        timestamp,
        statusCode: error.response?.status || 500,
        reason: (error as any).message || '서버 오류가 발생했습니다.',
        userAgent,
        ip,
      })
    } else {
      console.error('[로그아웃 실패]', {
        timestamp,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        userAgent,
        ip,
      })
    }
    event.context.user = null // 사용자 인증 정보 제거 (사용자 인증 미들웨어 참고)
    setResponseStatus(event, 200)
    return { message: '로그아웃이 완료되었습니다.' }
  } finally {
    // 쿠키는 무조건 제거
    clearSessionCookies(event)
  }
})
