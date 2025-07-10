import type { NitroFetchRequest } from 'nitropack/types'
import type { UseFetchOptions } from 'nuxt/app'


export const useAPI = <T>(
  url: NitroFetchRequest,
  options?: UseFetchOptions<T>,
) => {

  return useFetch<T>(url, {
    headers: {
      ...useRequestHeaders()
    },
    watch: false,
    ...(options as any),
    $fetch: useNuxtApp().$api,
  })
}
