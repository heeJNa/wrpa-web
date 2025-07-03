export default defineEventHandler(async (event) => {
  const { rpaApiUrl } = useRuntimeConfig(event)
  event.context.ip = getRequestIP(event, {
    xForwardedFor: true,
  })
  // const timestamp = new Date().toLocaleString('ko-KR', {
  //   timeZone: 'Asia/Seoul',
  // })
  // const query = getQuery(event)
  // console.log(
  //   `[${timestamp}] ${session.user ? `User: ${session.user?.name}(${session.user?.userid}),` : ''} IP: ${event.context.ip}, URL: ${getRequestURL(event).pathname}${Object.keys(query).length ? `, Query: ${JSON.stringify(query)}` : ''}`,
  // )
  const token = getCookie(event, 'access_token')
  const target = new URL(event.node.req.url as string, rpaApiUrl)
  return await proxyRequest(event, target.toString(), {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      'X-Forwarded-For': event.context.ip,
    },
  })
})
