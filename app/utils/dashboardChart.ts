import type { CompanyStat, InsurerStat, StateCounts, TrendPoint } from '~/types/dashboard'

// PrimeVue 테마 토큰과 어울리는 고정 팔레트. 상태 의미색은 화면 어디서나 같게 유지한다
export const CHART_COLORS = {
  success: '#22c55e',
  fail: '#ef4444',
  waiting: '#a3a3a3',
  working: '#3b82f6',
  cancel: '#f59e0b',
  etc: '#d4d4d4',
  line: '#dc2626',
}

export function percent(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

/** 'yyyy-MM-dd' → 'MM-dd' */
function shortDate(d: string): string {
  return d.slice(5)
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
        data: trend.map((p) => (p ? Math.round(p.counts.failRate * 1000) / 10 : null)),
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
    .filter((i) => i.counts.success + i.counts.fail > 0)
    .sort(
      (a, b) => b.counts.failRate - a.counts.failRate || b.counts.fail - a.counts.fail,
    )
    .slice(0, topN)
  return {
    labels: ranked.map((i) => i.insurerName),
    datasets: [
      {
        label: '실패율(%)',
        backgroundColor: CHART_COLORS.fail,
        data: ranked.map((i) => Math.round(i.counts.failRate * 1000) / 10),
      },
    ],
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
