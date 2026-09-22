export type ActiveBasis = 'CALENDAR_DAY' | 'BUSINESS_DAY'

export const ACTIVE_BASIS_OPTIONS: { label: string; value: ActiveBasis }[] = [
  { label: '달력 일자', value: 'CALENDAR_DAY' },
  { label: '영업일', value: 'BUSINESS_DAY' },
]

export function activeBasisLabel(basis: ActiveBasis | null | undefined): string {
  return ACTIVE_BASIS_OPTIONS.find((o) => o.value === basis)?.label ?? '달력 일자'
}

/** 서버 activeWindowPretty와 같은 규칙. 예) 일자 1~31 / 영업일 ~5 / 일자 매일 */
export function activeWindowPretty(
  basis: ActiveBasis | null | undefined,
  from: number | null | undefined,
  to: number | null | undefined,
): string {
  const b = basis === 'BUSINESS_DAY' ? '영업일' : '일자'
  if (from == null && to == null) return `${b} 매일`
  return `${b} ${from ?? ''}~${to ?? ''}`
}

/**
 * 범위를 특정 달의 실제 날짜로 환산. BUSINESS_DAY는 그달 영업일 목록(monthDates, N=index+1) 필요.
 * yearMonth: 'YYYY-MM'. 환산 불가(영업일 목록 비어있음, from이 영업일 수 초과)면 null
 */
export function resolveWindowDates(
  basis: ActiveBasis,
  from: number | null | undefined,
  to: number | null | undefined,
  monthDates: string[],
  yearMonth: string,
): { first: string; last: string } | null {
  const [y, m] = yearMonth.split('-').map(Number)
  if (!y || !m) return null
  const daysInMonth = new Date(y, m, 0).getDate()
  const pad = (n: number) => String(n).padStart(2, '0')
  if (basis === 'CALENDAR_DAY') {
    const f = Math.max(1, from ?? 1)
    const t = Math.min(daysInMonth, to ?? daysInMonth)
    if (f > t) return null
    return { first: `${yearMonth}-${pad(f)}`, last: `${yearMonth}-${pad(t)}` }
  }
  if (monthDates.length === 0) return null
  const f = Math.max(1, from ?? 1)
  const t = Math.min(monthDates.length, to ?? monthDates.length)
  if (f > monthDates.length || f > t) return null
  return { first: monthDates[f - 1]!, last: monthDates[t - 1]! }
}
