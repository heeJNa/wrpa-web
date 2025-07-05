// server/api/auth/session.get.ts
export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'access_token')
    if (!token) {
        return { isLogin: false }
    }

    try {
        // const user = await verifyToken(token) // JWT 검증 또는 외부 API 호출
        // event.context.user = user
        return {
            isLogin: true
            //   , user
        }
    } catch {
        return { isLogin: false }
    }
})