import { useToast } from 'primevue/usetoast'
import type { DashboardResponse } from '~/types/dashboard'

/** 추이 구간은 30일 고정 — 운영자가 매번 고를 값이 아니다 */
const TREND_DAYS = 30

/**
 * 대시보드 데이터. 기준일 하나로 화면 전체가 움직이고, 갱신은 사용자가 누를 때만 한다.
 * 실패해도 마지막 성공 응답을 유지하고 lastError 만 남긴다.
 * 전역 오류 토스트가 뜨지 않도록 useClientAPI() 대신 $fetch 를 직접 쓰되,
 * 401/403(세션 만료)은 useClientAPI 가 쓰는 것과 동일한 errorHandler 로 넘겨 로그인으로 보낸다.
 */
export function useDashboard() {
  const nuxtApp = useNuxtApp()
  const toast = useToast()
  const workDate = ref<Date>(new Date())
  const data = ref<DashboardResponse | null>(null)
  const loading = ref(true)
  const lastError = ref<string | null>(null)

  const refineWorkDate = computed(() => formatToKoreanTime(workDate.value, 'YYYY-MM-DD'))

  // 기준일을 연속으로 바꾸면 요청이 겹친다. 늦게 도착한 응답이 최신 상태를 덮어쓰지
  // 않도록 요청마다 증가하는 토큰으로 최신 여부를 확인한다.
  let requestSeq = 0

  const refresh = async () => {
    const seq = ++requestSeq
    loading.value = true
    try {
      const res = await $fetch<DashboardResponse>(
        `/api/monitoring/dashboard?workDate=${refineWorkDate.value}&days=${TREND_DAYS}`,
      )
      if (seq !== requestSeq) return
      data.value = res
      lastError.value = null
    } catch (err) {
      if (seq !== requestSeq) return
      const status =
        (err as { statusCode?: number; response?: { status?: number } })?.statusCode ??
        (err as { response?: { status?: number } })?.response?.status
      if (status === 401 || status === 403) {
        // 갱신 토큰이 만료·폐기됨 — useClientAPI 의 전역 onFetchError 와 동일하게
        // 세션을 정리하고 로그인으로 보낸다.
        await errorHandler(nuxtApp, toast, status)
        return
      }
      lastError.value = `갱신 실패 (${formatToKoreanTime(new Date(), 'HH:mm')})`
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  /** 집계 시각 HH:mm — 화면의 숫자가 언제 것인지 알려 준다 */
  const generatedAt = computed(() =>
    data.value ? formatToKoreanTime(new Date(data.value.generatedAt), 'HH:mm') : null,
  )

  watch(refineWorkDate, () => {
    refresh()
  })
  onMounted(refresh)

  return {
    workDate,
    data,
    loading,
    lastError,
    refresh,
    generatedAt,
  }
}
