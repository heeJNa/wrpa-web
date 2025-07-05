// import CryptoJS from 'crypto-js';

export default defineWrappedResponseHandler(async (event) => {
  const { rpaAuthApiUrl } = useRuntimeConfig(event)
  const body = await readBody<any>(event)
  // const ip = getRequestIP(event, {
  //   xForwardedFor: true,
  // })
  // body.password = CryptoJS.AES.decrypt(body.password, 'secret').toString(
  //   CryptoJS.enc.Utf8,
  // ); // 임시 복호화
  const url = new URL('/api/auth/login', rpaAuthApiUrl)
  const data = await $fetch<any>(url.toString(), {
    body: {
      providerKey: body.providerKey,
      authInfo: body.authInfo,
      providerId: body.providerId,
      deviceInfo: body.deviceInfo,
    },
    method: 'POST',
  })
  if (data?.accessToken?.token) {
    setCookie(event, 'access_token', data.accessToken.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 3, // 3시간
      sameSite: 'lax',
      path: '/',
    })
    return true
  } else {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: '로그인에 실패했습니다.',
      }),
    )
  }
})
