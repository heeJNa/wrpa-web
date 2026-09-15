export interface OrderRow {
  bizDayFrom: number
  bizDayTo: number | null // null = 이후 전체
  order: string[] // UploadCategory name, 앞이 먼저(높은 우선순위)
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

export function categoryLabel(value: string | null | undefined): string {
  if (!value) return '-'
  return UPLOAD_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

/** 신규 스코프 시드. 서버 검증과 같은 규칙(겹침 없음, 오름차순) */
export function defaultOrderRows(): OrderRow[] {
  return [
    {
      bizDayFrom: 1,
      bizDayTo: 2,
      order: ['PREV_NEW', 'CUR_NEW', 'PREV_CONT', 'CUR_CONT'],
    },
    {
      bizDayFrom: 3,
      bizDayTo: 3,
      order: ['CUR_NEW', 'PREV_NEW', 'PREV_CONT', 'CUR_CONT'],
    },
    {
      bizDayFrom: 4,
      bizDayTo: 5,
      order: ['CUR_NEW', 'PREV_NEW', 'CUR_CONT', 'PREV_CONT'],
    },
    { bizDayFrom: 6, bizDayTo: null, order: ['CUR_NEW', 'CUR_CONT'] },
  ]
}

/**
 * 클라이언트 측 검증. 서버(OrderRowValidator)와 같은 규칙:
 * 시작 ≥ 1, 종료 ≥ 시작, 구간 겹침 금지. 오류 문구 배열 반환(비어 있으면 통과)
 */
export function validateOrderRows(rows: OrderRow[]): string[] {
  const errors: string[] = []
  if (rows.length === 0) errors.push('영업일 구간이 하나 이상 필요합니다.')
  rows.forEach((row, i) => {
    const label = `${i + 1}번째 구간`
    if (!Number.isInteger(row.bizDayFrom) || row.bizDayFrom < 1)
      errors.push(`${label}: 시작 영업일은 1 이상이어야 합니다.`)
    if (row.bizDayTo !== null && row.bizDayTo < row.bizDayFrom)
      errors.push(`${label}: 종료 영업일이 시작보다 앞입니다.`)
  })
  const sorted = [...rows].sort(
    (a, b) =>
      a.bizDayFrom - b.bizDayFrom || (a.bizDayTo ?? Infinity) - (b.bizDayTo ?? Infinity),
  )
  for (let i = 0; i + 1 < sorted.length; i++) {
    const a = sorted[i]!
    const b = sorted[i + 1]!
    if (b.bizDayFrom <= (a.bizDayTo ?? Infinity))
      errors.push(
        `구간 ${a.bizDayFrom}~${a.bizDayTo ?? '이후'}와 ${b.bizDayFrom}~${b.bizDayTo ?? '이후'}가 겹칩니다.`,
      )
  }
  return errors
}

/** 오류에 관련된 행 인덱스(강조 표시용). validateOrderRows와 같은 규칙 */
export function invalidRowIndexes(rows: OrderRow[]): Set<number> {
  const bad = new Set<number>()
  rows.forEach((row, i) => {
    if (!Number.isInteger(row.bizDayFrom) || row.bizDayFrom < 1) bad.add(i)
    if (row.bizDayTo !== null && row.bizDayTo < row.bizDayFrom) bad.add(i)
  })
  const idx = rows.map((_, i) => i).sort(
    (a, b) =>
      rows[a]!.bizDayFrom - rows[b]!.bizDayFrom ||
      (rows[a]!.bizDayTo ?? Infinity) - (rows[b]!.bizDayTo ?? Infinity),
  )
  for (let k = 0; k + 1 < idx.length; k++) {
    const a = rows[idx[k]!]!
    const b = rows[idx[k + 1]!]!
    if (b.bizDayFrom <= (a.bizDayTo ?? Infinity)) {
      bad.add(idx[k]!)
      bad.add(idx[k + 1]!)
    }
  }
  return bad
}
