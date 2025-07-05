import { FetchError } from 'ofetch'
import type { EventHandler, EventHandlerRequest } from 'h3'

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(
    handler: EventHandler<T, D>
): EventHandler<T, D> =>
    defineEventHandler<T>(async event => {
        try {
            const timestamp = new Date().toLocaleString('ko-KR', {
                timeZone: 'Asia/Seoul',
            })
            const query = getQuery(event)
            // ${session.user ? `User: ${session.user?.name}(${session.user?.userid}),` : ''}
            console.log(
                `[${timestamp}] IP: ${event.context.ip}, URL: ${getRequestURL(event).pathname}${Object.keys(query).length ? `, Query: ${JSON.stringify(query)}` : ''}`,
            )
            // do something before the route handler
            const response = await handler(event)
            // do something after the route handler
            return { response }
        } catch (error) {
            // Error handling
            if (error instanceof FetchError) {
                throw createError({
                    statusCode: error.response?.status || 500,
                    message: error.message.replace(/https?:\/\/[^/]+/, '') || '서버 오류가 발생했습니다.',
                    data: {
                        url: error.response?.url,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                    }
                })
            } else {
                return sendError(
                    event,
                    createError({
                        statusCode: 500,
                        message: '서버 오류가 발생했습니다.',
                        data: {
                            message: error instanceof Error ? error.message : '알 수 없는 오류',
                        }
                    }),
                )
            }
        }
    })

