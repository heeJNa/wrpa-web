import type { UseFetchOptions } from 'nuxt/app'
import type { NitroFetchRequest } from 'nitropack/types'

export function useLazyAPI<T>(
  url: NitroFetchRequest | string,
  options?: UseFetchOptions<T>,
) {
  return useLazyFetch(url, {
    headers: {
      ...useRequestHeaders()
    },
    watch: false,
    ...options,
    $fetch: useNuxtApp().$api,
  })
}
