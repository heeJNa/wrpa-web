export interface OrderRow {
  bizDayFrom: number
  bizDayTo: number | null
  order: string[] // UploadCategory name
}

export interface BusinessDayOrderPolicy {
  id?: string
  companyId: string
  insuranceCompanyCode: string | null // null = 회사 기본
  rows: OrderRow[]
}

export interface UploadCategoryOption {
  label: string
  value: string
}

export const UPLOAD_CATEGORIES: UploadCategoryOption[] = [
  { label: '전월 신계약', value: 'PREV_NEW' },
  { label: '전월 계속분', value: 'PREV_CONT' },
  { label: '당월 신계약', value: 'CUR_NEW' },
  { label: '당월 계속분', value: 'CUR_CONT' },
]

export function categoryLabel(value: string): string {
  return UPLOAD_CATEGORIES.find((c) => c.value === value)?.label ?? value
}
