export default defineEventHandler(async (event) => {
    setCookie(event, 'access_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0), // Set expiration to the past to delete the cookie
    })
    setResponseStatus(event, 200)
    return 'ok'
});