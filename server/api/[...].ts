import {
  ACCESS_COOKIE, REFRESH_COOKIE, accessTokenNeedsRefresh, clearSessionCookies, refreshSession, setSessionCookies,
} from '../utils/session'

export default defineWrappedResponseHandler(async (event) => {
  const { rpaApiUrl } = useRuntimeConfig(event)
  event.context.ip = getRequestIP(event, {
    xForwardedFor: true,
  })

  let token = getCookie(event, ACCESS_COOKIE)
  const refreshToken = getCookie(event, REFRESH_COOKIE)

  // proxyRequest 는 응답을 그대로 흘려보내므로 401 뒤에 재시도할 수 없다.
  // 대신 접근 토큰이 없거나 곧 만료되면 프록시 전에 미리 갱신한다.
  if (refreshToken && accessTokenNeedsRefresh(token)) {
    const rotated = await refreshSession(rpaApiUrl, refreshToken, {
      'X-Forwarded-For': event.context.ip ?? '',
      'User-Agent': event.node.req.headers['user-agent'] ?? '',
    })
    if (rotated) {
      setSessionCookies(event, rotated)
      token = rotated.accessToken.token
    } else {
      // 갱신 토큰이 만료·폐기됨 → 세션 종료. 클라이언트 errorHandler 가 401 을 받아 로그인으로 보낸다.
      // (throw 하면 defineWrappedResponseHandler 가 500 으로 바꾸므로 상태 코드를 직접 세팅한다)
      clearSessionCookies(event)
      setResponseStatus(event, 401)
      return { message: '세션이 만료되었습니다. 다시 로그인해주세요.' }
    }
  }

  const target = new URL(event.node.req.url as string, rpaApiUrl)
  return await proxyRequest(event, target.toString(), {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'X-Forwarded-For': event.context.ip,
    },
  })
})
