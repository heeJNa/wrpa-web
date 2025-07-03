import type { UseFetchOptions, UseFetchReturn } from '@vueuse/core'
import { createFetch } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'

let customFetch: ReturnType<typeof createFetch> | null = null

// Function used for client requests, it's practically the $fetch replacement for nuxt
export const useClientAPI = () => {
  const toast = useToast()

  if (!customFetch) {
    customFetch = createFetch({
      options: {
        async onFetchError(ctx) {
          if (ctx.response?.status === 401 || ctx.response?.status === 403) {
            await navigateTo('/login')
          }
          if (ctx.response?.status === 404) {
            toast.add({
              severity: 'warn',
              summary: ctx.data?.message || ctx.error?.message || 'Resource not found',
              life: 5000,
            })
          } else {
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail:
                ctx.data?.message || ctx.error?.message || 'An unexpected error occurred',
              life: 5000,
            })
          }
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
