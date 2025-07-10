export default defineWrappedResponseHandler(async (event) => {
    const { rpaAuthApiUrl } = useRuntimeConfig(event)
    event.context.ip = getRequestIP(event, {
        xForwardedFor: true,
    })
    const token = getCookie(event, 'access_token')
    const target = new URL(event.node.req.url as string, rpaAuthApiUrl)
    return await proxyRequest(event, target.toString(), {
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            'X-Forwarded-For': event.context.ip,
        },
    })
})
