import type { NitroFetchRequest } from 'nitropack/types'
import type { AsyncDataOptions, UseFetchOptions } from 'nuxt/app'
import type { FetchOptions } from 'ofetch';

interface CustomFetchOptions extends Omit<FetchOptions, 'method'> {
  method?: "GET" | "HEAD" | "PATCH" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | undefined
}

export const useAPI = <T>(
  url: NitroFetchRequest,
  options?: UseFetchOptions<T>,
) => {

  return useFetch<T>(url, {
    headers: {
      ...useRequestHeaders()
    },
    ...(options as any),
    $fetch: useNuxtApp().$api,
  })
  // return useAsyncData<T>(key, () => useRequestFetch()(url, {
  //   ...options,
  // }), {
  //   ...asyncOptions,
  // })
}
