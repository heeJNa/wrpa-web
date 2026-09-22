import type { DashboardResponse } from '~/types/dashboard'

const POLL_MS = 60_000

/**
 * 대시보드 데이터. 실패해도 마지막 성공 응답을 유지하고 lastError 만 남긴다.
 * useClientAPI 는 setup 컨텍스트에서만 호출 가능하므로 여기서 받아둔다.
 */
export function useDashboard() {
  const { request } = useClientAPI()
  const workDate = ref<Date>(new Date())
  const days = ref(30)
  const data = ref<DashboardResponse | null>(null)
  const loading = ref(false)
  const lastError = ref<string | null>(null)
  const autoRefresh = ref(true)
  const now = ref(Date.now())

  const refineWorkDate = computed(() => formatToKoreanTime(workDate.value, 'YYYY-MM-DD'))

  // 동시에 여러 refresh() 가 겹칠 때(마운트·폴링·watch) 늦게 도착한 응답이
  // 최신 상태를 덮어쓰지 않도록 요청마다 증가하는 토큰으로 최신 여부를 확인한다.
  let requestSeq = 0

  const refresh = async () => {
    const seq = ++requestSeq
    loading.value = true
    try {
      const { data: res, statusCode } = await request<DashboardResponse>(
        `/api/monitoring/dashboard?workDate=${refineWorkDate.value}&days=${days.value}`,
      )
      if (seq !== requestSeq) return
      if (statusCode.value === 200 && res.value) {
        data.value = res.value
        lastError.value = null
      } else {
        lastError.value = `${formatToKoreanTime(new Date(), 'HH:mm')} 갱신 실패`
      }
    } catch {
      if (seq !== requestSeq) return
      lastError.value = `${formatToKoreanTime(new Date(), 'HH:mm')} 갱신 실패`
    } finally {
      if (seq === requestSeq) {
        loading.value = false
        now.value = Date.now()
      }
    }
  }

  const generatedAgoSec = computed(() =>
    data.value
      ? Math.max(0, Math.round((now.value - data.value.generatedAt) / 1000))
      : null,
  )

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let tickTimer: ReturnType<typeof setInterval> | null = null
  const startPolling = () => {
    stopPolling()
    pollTimer = setInterval(() => {
      if (autoRefresh.value) refresh()
    }, POLL_MS)
    tickTimer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }
  const stopPolling = () => {
    if (pollTimer) clearInterval(pollTimer)
    if (tickTimer) clearInterval(tickTimer)
    pollTimer = tickTimer = null
  }

  watch([refineWorkDate, days], () => {
    refresh()
  })
  onMounted(() => {
    refresh()
    startPolling()
  })
  onBeforeUnmount(stopPolling)

  return {
    workDate,
    days,
    data,
    loading,
    lastError,
    autoRefresh,
    refresh,
    generatedAgoSec,
  }
}
