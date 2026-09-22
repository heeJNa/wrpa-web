import type {
  CompanyStat,
  FailureReasonStat,
  HourlyPoint,
  InsurerStat,
  StateCounts,
  TrendPoint,
  WorkerStat,
} from '~/types/dashboard'

// PrimeVue 테마 토큰과 어울리는 고정 팔레트. 상태 의미색은 화면 어디서나 같게 유지한다
export const CHART_COLORS = {
  success: '#22c55e',
  fail: '#ef4444',
  waiting: '#a3a3a3',
  working: '#3b82f6',
  cancel: '#f59e0b',
  etc: '#d4d4d4',
  line: '#dc2626',
  // 잔량 선은 '실패' 막대(빨강)와 같은 차트에 겹치므로 다른 색이어야 범례에서 구분된다
  backlog: '#7c3aed',
}

export function percent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

/** 다크 모드 대응 차트 텍스트(범례/눈금/축 제목) 색상 */
export function chartTextColor(dark: boolean): string {
  return dark ? '#a1a1aa' : '#3f3f46'
}

/** 'yyyy-MM-dd' → 'MM-dd' */
function shortDate(d: string): string {
  return d.slice(5)
}

/** 실패율을 소수점 한 자리로 반올림 (0.123 → 12.3) */
function roundPercent(rate: number): number {
  return Math.round(rate * 1000) / 10
}

/** 최근 N일: 막대(처리량) + 선(실패율 %, 우측 축). 백필 실패한 날은 null 로 비운다 */
export function trendChartData(trend: (TrendPoint | null)[]) {
  return {
    labels: trend.map((p) => (p ? shortDate(p.workDate) : '')),
    datasets: [
      {
        type: 'bar',
        label: '처리량',
        yAxisID: 'y',
        backgroundColor: CHART_COLORS.working,
        data: trend.map((p) => (p ? p.counts.total : null)),
      },
      {
        type: 'line',
        label: '실패율(%)',
        yAxisID: 'y1',
        borderColor: CHART_COLORS.line,
        backgroundColor: CHART_COLORS.line,
        tension: 0.3,
        spanGaps: false,
        data: trend.map((p) => (p ? roundPercent(p.counts.failRate) : null)),
      },
    ],
  }
}

/** 회사별 성공/실패 누적막대 */
export function companyChartData(byCompany: CompanyStat[]) {
  return {
    labels: byCompany.map((c) => c.companyName),
    datasets: [
      {
        label: '성공',
        backgroundColor: CHART_COLORS.success,
        data: byCompany.map((c) => c.counts.success),
      },
      {
        label: '실패',
        backgroundColor: CHART_COLORS.fail,
        data: byCompany.map((c) => c.counts.fail),
      },
    ],
  }
}

/** 보험사별 실패율 상위 N(가로막대). 성공+실패가 0 인 보험사는 제외 */
export function insurerFailRateData(byInsurer: InsurerStat[], topN = 10) {
  const ranked = byInsurer
    // 실패가 0인 보험사는 뺀다 — '실패율 상위'에 0% 줄이 끼면 자리만 차지한다
    .filter((i) => i.counts.fail > 0)
    .sort(
      (a, b) => b.counts.failRate - a.counts.failRate || b.counts.fail - a.counts.fail,
    )
    .slice(0, topN)
  return {
    labels: ranked.map(
      (i) => `${i.insurerName} (${i.counts.fail}/${i.counts.success + i.counts.fail})`,
    ),
    datasets: [
      {
        label: '실패율(%)',
        backgroundColor: CHART_COLORS.fail,
        data: ranked.map((i) => roundPercent(i.counts.failRate)),
      },
    ],
  }
}

/** 실패 사유별 가로막대(실패 건수). 이미 건수 내림차순 정렬된 입력을 그대로 쓴다 */
export function failureReasonData(reasons: FailureReasonStat[]) {
  return {
    labels: reasons.map((r) => `${r.label} (${r.count})`),
    datasets: [
      {
        label: '실패 건수',
        backgroundColor: CHART_COLORS.fail,
        data: reasons.map((r) => r.count),
      },
    ],
  }
}

/** 작업자별 성공/실패 가로 누적막대 상위 N. 실패 많은 순 → 총건 많은 순으로 정렬 */
export function workerChartData(byWorker: WorkerStat[], topN = 10) {
  const ranked = [...byWorker]
    .sort((a, b) => b.counts.fail - a.counts.fail || b.counts.total - a.counts.total)
    .slice(0, topN)
  return {
    labels: ranked.map((w) => `${w.workerName} (실패 ${w.counts.fail})`),
    datasets: [
      {
        label: '성공',
        backgroundColor: CHART_COLORS.success,
        data: ranked.map((w) => w.counts.success),
      },
      {
        label: '실패',
        backgroundColor: CHART_COLORS.fail,
        data: ranked.map((w) => w.counts.fail),
      },
    ],
  }
}

/**
 * 시간대별 성공/실패(누적막대) + 미완료 잔량(선, 우측 축).
 * dayTotal 이 null 이면 총건수를 모르므로 잔량 선은 아예 그리지 않는다.
 */
export function hourlyProgressData(hourly: HourlyPoint[], dayTotal: number | null) {
  const datasets: Record<string, unknown>[] = [
    {
      type: 'bar',
      label: '성공',
      stack: 'hourly',
      yAxisID: 'y',
      backgroundColor: CHART_COLORS.success,
      data: hourly.map((h) => h.success),
    },
    {
      type: 'bar',
      label: '실패',
      stack: 'hourly',
      yAxisID: 'y',
      backgroundColor: CHART_COLORS.fail,
      data: hourly.map((h) => h.fail),
    },
  ]

  if (dayTotal !== null) {
    let cumulative = 0
    const backlog = hourly.map((h) => {
      cumulative += h.success + h.fail
      return Math.max(dayTotal - cumulative, 0)
    })
    datasets.push({
      type: 'line',
      label: '미완료 잔량',
      yAxisID: 'y1',
      borderColor: CHART_COLORS.backlog,
      backgroundColor: CHART_COLORS.backlog,
      tension: 0.3,
      data: backlog,
    })
  }

  return {
    labels: hourly.map((h) => `${h.hour}시`),
    datasets,
  }
}

/** 오늘 상태 분포 도넛. 0 인 버킷은 뺀다 */
export function stateDonutData(totals: StateCounts) {
  const buckets: [string, number, string][] = [
    ['성공', totals.success, CHART_COLORS.success],
    ['실패', totals.fail, CHART_COLORS.fail],
    ['대기', totals.waiting, CHART_COLORS.waiting],
    ['작업중', totals.working, CHART_COLORS.working],
    ['취소', totals.cancel, CHART_COLORS.cancel],
    ['기타', totals.etc, CHART_COLORS.etc],
  ]
  const shown = buckets.filter(([, n]) => n > 0)
  return {
    labels: shown.map(([l]) => l),
    datasets: [
      { data: shown.map(([, n]) => n), backgroundColor: shown.map(([, , c]) => c) },
    ],
  }
}
