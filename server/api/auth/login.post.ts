import { setSessionCookies, type AuthResult } from '../../utils/session'

export default defineWrappedResponseHandler(async (event) => {
  const { rpaApiUrl } = useRuntimeConfig(event)
  const body = await readBody<any>(event)
  const url = new URL('/api/auth/sign-in', rpaApiUrl)

  const data = await $fetch<AuthResult>(url.toString(), {
    body: {
      username: body.username,
      password: body.password,
    },
    method: 'POST',
    headers: {
      'X-Forwarded-For': getRequestIP(event, { xForwardedFor: true }) ?? '',
      'User-Agent': event.node.req.headers['user-agent'] ?? '',
    },
  })
  if (data?.accessToken?.token) {
    // 접근 30분 + 갱신 7일. 만료 시점은 서버가 준 expiresIn 을 따른다
    setSessionCookies(event, data)
    return true
  } else {
    throw createError('로그인에 실패했습니다.')
  }
})
