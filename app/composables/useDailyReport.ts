/**
 * 종합상황보고 텔레그램 발송. 대시보드와 작업현황 두 화면이 같은 기능을 쓰므로
 * 확인 문구·토스트·요청을 한곳에 둔다. 화면마다 기준이 되는 작업일만 다르다.
 *
 * useClientAPI/useConfirm/useToast 는 setup 컨텍스트에서만 호출할 수 있으므로
 * 이 컴포저블도 setup 안에서 부른다.
 */
export function useDailyReport() {
  const { request } = useClientAPI()
  const confirm = useConfirm()
  const toast = useToast()
  const sending = ref(false)

  /** @param workDate 'YYYY-MM-DD' — 이 작업일 기준으로 보고를 만든다 */
  const send = (workDate: string) => {
    confirm.require({
      header: '텔레그램 보고 발송',
      message: `${workDate} 작업일 기준 종합상황보고를 텔레그램으로 보낼까요?`,
      icon: 'pi pi-send',
      rejectProps: { label: '취소', severity: 'secondary', outlined: true },
      acceptProps: { label: '발송' },
      accept: () => {
        sending.value = true
        request<{ sent: number; workDate: string }>(
          `/api/monitoring/daily-report?workDate=${workDate}`,
          { method: 'POST' },
        ).then(({ data, statusCode }) => {
          if (statusCode.value === 200) {
            toast.add({
              severity: 'success',
              summary: '성공',
              detail: `텔레그램 보고 발송 완료 (${data.value?.sent ?? 0}건)`,
              life: 3000,
            })
          } else {
            toast.add({
              severity: 'error',
              summary: '오류',
              detail: `텔레그램 보고 발송 실패: ${(data.value as { message?: string })?.message || '알 수 없는 오류'}`,
              life: 3000,
            })
          }
          sending.value = false
        })
      },
    })
  }

  return { sending, send }
}
