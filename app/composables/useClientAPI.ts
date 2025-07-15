import type { UseFetchOptions, UseFetchReturn } from '@vueuse/core'
import { createFetch } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'

let customFetch: ReturnType<typeof createFetch> | null = null

// Function used for client requests, it's practically the $fetch replacement for nuxt
export const useClientAPI = () => {
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  if (!customFetch) {
    customFetch = createFetch({
      options: {
        async onFetchError(ctx) {
          await errorHandler(nuxtApp, toast, ctx.response?.status || 500, ctx.error?.message)
          // if (ctx.response?.status === 401 || ctx.response?.status === 403) {
          //   await $fetch('/api/auth/revoke').then(async () => {
          //     const tokenState = useState('accessToken')
          //     tokenState.value = null;
          //     toast.add({
          //       severity: 'error',
          //       summary: '세션이 만료되었습니다. 다시 로그인해주세요.',
          //       life: 5000,
          //     })
          //     await navigateTo('/login')
          //   })
          // }
          // if (ctx.response?.status === 404) {
          //   toast.add({
          //     severity: 'warn',
          //     summary: ctx.data?.message || ctx.error?.message || '요청한 리소스를 찾을 수 없습니다.',
          //     life: 5000,
          //   })
          // } else {
          //   toast.add({
          //     severity: 'error',
          //     summary: 'Error',
          //     detail:
          //       ctx.data?.data?.message || ctx.error?.message || '알 수 없는 오류가 발생했습니다.',
          //     life: 5000,
          //   })
          // }
          return ctx
        },
      },
      fetchOptions: {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    })
  }

  const request = <T>(
    url: MaybeRefOrGetter<string>,
    fetchOptions: RequestInit = {},
    options: UseFetchOptions = {},
  ): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>> => {
    return customFetch!<T>(url, fetchOptions, options).json()
  }

  return {
    request,
  }
}
