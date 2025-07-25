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
  type InsuranceCompanyType = "ALL" | "LIFE" | "PROPERTY" | "GUARANTEE";
  interface InsuranceCompanyCode {
    code: string,
    name: string,
    sortName: string,
    type: InsuranceCompanyType,
    typePretty: string,
    value: string
  }
  interface LabelValue {
    label?: string,
    value?: string
  }
  interface EnumPretty {
    name?: string,
    pretty?: string
  }

  interface MinioFile {
    bucketName: string,
    contentType: string,
    objectName: string,
  }
  interface DefaultResponse {
    id: string,
    createdTime: string,
    createdTimePretty: string,
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



