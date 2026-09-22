import type { DashboardResponse } from '~/types/dashboard'

const POLL_MS = 60_000

/**
 * 대시보드 데이터. 실패해도 마지막 성공 응답을 유지하고 lastError 만 남긴다.
 * 폴링 갱신에서 전역 오류 토스트가 뜨지 않도록 useClientAPI() 대신 $fetch 를 직접 쓴다.
 */
export function useDashboard() {
  const workDate = ref<Date>(new Date())
  const days = ref(30)
  const data = ref<DashboardResponse | null>(null)
  const loading = ref(true)
  const lastError = ref<string | null>(null)
  const autoRefresh = ref(true)
  const now = ref(Date.now())

  const refineWorkDate = computed(() => formatToKoreanTime(workDate.value, 'YYYY-MM-DD'))

  // 동시에 여러 refresh() 가 겹칠 때(마운트·폴링·watch) 늦게 도착한 응답이
  // 최신 상태를 덮어쓰지 않도록 요청마다 증가하는 토큰으로 최신 여부를 확인한다.
  let requestSeq = 0

  // 폴링 갱신은 조용해야 한다: useClientAPI()의 request는 전역 onFetchError 토스트를
  // 띄우므로, 여기서는 그 토스트를 우회하기 위해 Nuxt 기본 $fetch 를 직접 쓴다.
  const refresh = async () => {
    const seq = ++requestSeq
    loading.value = true
    try {
      const res = await $fetch<DashboardResponse>(
        `/api/monitoring/dashboard?workDate=${refineWorkDate.value}&days=${days.value}`,
      )
      if (seq !== requestSeq) return
      data.value = res
      lastError.value = null
    } catch {
      if (seq !== requestSeq) return
      lastError.value = `갱신 실패 (${formatToKoreanTime(new Date(), 'HH:mm')})`
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
