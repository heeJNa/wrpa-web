export { }

declare global {
  interface PagingInfo {
    isFirst: boolean,
    isLast: boolean,
    currentIndex: number,
    size: number,
    sort: {
      sorted: boolean,
      unsorted: boolean,
      empty: boolean
    },
    totalElements: number,
    totalPages: number
  }
  interface ListResponse<T> {
    values: T[],
    pagingInfo: PagingInfo
  }
  type InsuranceCompanyType = "LIFE" | "PROPERTY" | "GUARANTEE";
  interface InsuranceCompanyCode {
    code: string,
    name: string,
    sortName: string,
    type: InsuranceCompanyType,
    typePretty: string,
    value: string
  }
}
declare module '#app' {
  interface NuxtApp {
    $api: $Fetch<unknown, NitroFetchRequest>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: $Fetch<unknown, NitroFetchRequest>
  }
}



