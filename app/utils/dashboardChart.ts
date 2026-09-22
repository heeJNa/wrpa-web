import type {
  CompanyStat,
  FailureReasonStat,
  HourlyPoint,
  InsurerStat,
  StateCounts,
  TrendPoint,
  WorkerStat,
} from '~/types/dashboard'

// 상태 의미색은 화면 어디서나 같게 유지한다. 종일 띄워 두는 화면이라 채도를 낮춰
// 눈이 편하게 하되, '실패'만은 또렷하게 남겨 시선이 거기로 가게 한다.
export const CHART_COLORS = {
  success: '#6aa88a',
  fail: '#d9534f',
  waiting: '#b8b5ae',
  working: '#7b96c4',
  cancel: '#d6a75c',
  etc: '#dcd9d3',
  // 선 그래프는 '실패' 막대(빨강)와 겹쳐 그려지므로 다른 색이어야 범례에서 구분된다.
  // 시간대별 '미완료 잔량'과 30일 '실패율'이 같은 색을 쓴다 — 둘 다 막대 위의 추세선이다.
  backlog: '#8878b8',
}

/** 막대가 하나뿐일 때 화면 절반을 덮지 않도록 제한한다 */
export const MAX_BAR_THICKNESS = 26

/** 눈금선은 데이터를 읽는 보조선일 뿐이므로 거의 보이지 않을 만큼 옅게 */
export function chartGridColor(dark: boolean): string {
  return dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
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

/**
 * 최근 N일: 성공·실패 누적막대 + 실패율 선(우측 축). 백필 전인 날은 null 로 비운다.
 * 처리량 하나만 그리면 월초·월중 차이만 보이고 정작 나빠졌는지는 안 보이므로
 * 같은 막대를 성공/실패로 쪼개고 비율을 선으로 겹친다.
 * order 가 작을수록 위에 그려진다 — 실패율 선이 막대에 가리지 않게 한다.
 */
export function trendChartData(trend: (TrendPoint | null)[]) {
  return {
    labels: trend.map((p) => (p ? shortDate(p.workDate) : '')),
    datasets: [
      {
        type: 'line',
        label: '실패율(%)',
        yAxisID: 'y1',
        order: 0,
        borderColor: CHART_COLORS.backlog,
        backgroundColor: CHART_COLORS.backlog,
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.3,
        spanGaps: false,
        data: trend.map((p) => (p ? roundPercent(p.counts.failRate) : null)),
      },
      {
        type: 'bar',
        label: '성공',
        yAxisID: 'y',
        order: 1,
        stack: 'trend',
        maxBarThickness: MAX_BAR_THICKNESS,
        borderRadius: 3,
        backgroundColor: CHART_COLORS.success,
        data: trend.map((p) => (p ? p.counts.success : null)),
      },
      {
        type: 'bar',
        label: '실패',
        yAxisID: 'y',
        order: 1,
        stack: 'trend',
        maxBarThickness: MAX_BAR_THICKNESS,
        borderRadius: 3,
        backgroundColor: CHART_COLORS.fail,
        data: trend.map((p) => (p ? p.counts.fail : null)),
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
        maxBarThickness: MAX_BAR_THICKNESS,
        borderRadius: 3,
        data: byCompany.map((c) => c.counts.success),
      },
      {
        label: '실패',
        backgroundColor: CHART_COLORS.fail,
        maxBarThickness: MAX_BAR_THICKNESS,
        borderRadius: 3,
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
        maxBarThickness: MAX_BAR_THICKNESS,
        borderRadius: 3,
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
        maxBarThickness: MAX_BAR_THICKNESS,
        borderRadius: 3,
        data: reasons.map((r) => r.count),
      },
    ],
  }
}

/**
 * 작업자별 성공/실패 가로 누적막대 상위 N. 실패 많은 순 → 총건 많은 순으로 정렬.
 * 끝난 작업이 하나도 없는 항목은 뺀다 — 특히 [미할당](작업자 ID 가 없어 실행된 적 없는
 * 대기·취소 건)은 항상 0 이라 막대 없는 빈 줄로 상위 N 자리만 차지한다.
 * 반대로 작업자 문서가 지워져 [미할당]로 묶였지만 실제 실적이 있는 경우는 그대로 보인다.
 */
export function workerChartData(byWorker: WorkerStat[], topN = 10) {
  const ranked = [...byWorker]
    .filter((w) => w.counts.success + w.counts.fail > 0)
    .sort((a, b) => b.counts.fail - a.counts.fail || b.counts.total - a.counts.total)
    .slice(0, topN)
  return {
    labels: ranked.map((w) => `${w.workerName} (실패 ${w.counts.fail})`),
    datasets: [
      {
        label: '성공',
        backgroundColor: CHART_COLORS.success,
        maxBarThickness: MAX_BAR_THICKNESS,
        borderRadius: 3,
        data: ranked.map((w) => w.counts.success),
      },
      {
        label: '실패',
        backgroundColor: CHART_COLORS.fail,
        maxBarThickness: MAX_BAR_THICKNESS,
        borderRadius: 3,
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
      order: 1,
      stack: 'hourly',
      yAxisID: 'y',
      backgroundColor: CHART_COLORS.success,
      maxBarThickness: MAX_BAR_THICKNESS,
      borderRadius: 3,
      data: hourly.map((h) => h.success),
    },
    {
      type: 'bar',
      label: '실패',
      order: 1,
      stack: 'hourly',
      yAxisID: 'y',
      backgroundColor: CHART_COLORS.fail,
      maxBarThickness: MAX_BAR_THICKNESS,
      borderRadius: 3,
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
      order: 0,
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

