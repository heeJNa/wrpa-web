export default defineEventHandler(async (event) => {
  try {
    const { rpaApiUrl } = useRuntimeConfig(event)
    // let rpaAccessToken: string | undefined;
    const url = new URL('/api/auth/logout', rpaApiUrl)
    const token = getCookie(event, 'access_token')
    const headers: [string, string][] = [['Content-Type', 'application/json']]
    if (token) {
      headers.push(['Authorization', `Bearer ${token}`])
    } else {
      setResponseStatus(event, 401, '로그인 되지 않았습니다.')
      return {
        message: '로그인 되지 않았습니다.',
      }
    }
    await $fetch<any>(url.toString(), {
      method: 'DELETE',
      headers,
    })
    // 'Content-Type: application/json',
    // `Authorization: ${token ? `Bearer ${token}` : undefined}`,
    setCookie(event, 'access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Set expiration to the past to delete the cookie
    })
    setResponseStatus(event, 200)
    return {
      message: '로그아웃이 완료되었습니다.',
    }
  } catch (error) {
    if (error instanceof Error) {
      return sendError(event, error)
    }
  }
})
