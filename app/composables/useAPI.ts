import type { NitroFetchRequest } from 'nitropack/types'
import type { UseFetchOptions } from 'nuxt/app'

export function useAPI<T>(
  url: string | NitroFetchRequest | Ref<string | Request> | (() => string) | Request,
  options?: UseFetchOptions<T>,
) {
  return useFetch<T>(url, {
    ...(options as any),
    $fetch: useNuxtApp().$api,
  })
}
