// import CryptoJS from 'crypto-js';

export default defineWrappedResponseHandler(async (event) => {
  const { rpaApiUrl } = useRuntimeConfig(event)
  const body = await readBody<any>(event)
  // const ip = getRequestIP(event, {
  //   xForwardedFor: true,
  // })
  // body.password = CryptoJS.AES.decrypt(body.password, 'secret').toString(
  //   CryptoJS.enc.Utf8,
  // ); // 임시 복호화
  const url = new URL('/api/auth/sign-in', rpaApiUrl)

  const data = await $fetch<any>(url.toString(), {
    body: {
      username: body.username,
      password: body.password,
      // providerId: body.providerId,
      // deviceInfo: body.deviceInfo,
    },
    method: 'POST',
  })
  if (data?.accessToken?.token) {
    setCookie(event, 'access_token', data.accessToken.token, {
      httpOnly: true,
      secure: false, // process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 3, // 3시간
      sameSite: 'lax',
      path: '/',
    })
    return true
  } else {
    throw createError('로그인에 실패했습니다.')
  }


})
