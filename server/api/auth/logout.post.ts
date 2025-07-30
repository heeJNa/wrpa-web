import { FetchError } from 'ofetch'

export default defineEventHandler(async (event) => {
  const { rpaAuthApiUrl } = useRuntimeConfig(event)
  const token = getCookie(event, 'access_token')
  const url = new URL('/api/auth/logout', rpaAuthApiUrl)
  const ip = getRequestIP(event, { xForwardedFor: true })
  const headers: [string, string][] = [['Content-Type', 'application/json']]
  const timestamp = new Date().toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  })
  const userAgent = event.node.req.headers['user-agent']
  if (token) {
    headers.push(['Authorization', `Bearer ${token}`])
  }
  try {
    if (!token) throw new Error('No token')
    console.log('[로그아웃 요청]', {
      timestamp,
      url: url.toString().replace(rpaAuthApiUrl, ''),
      userAgent,
      ip,
    })
    await $fetch(url.toString(), {
      method: 'DELETE',
      headers,
    })

    // 정상 로그아웃 성공
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
    setCookie(event, 'access_token', '', {
      httpOnly: true,
      secure: false, //process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
    })
  }
})