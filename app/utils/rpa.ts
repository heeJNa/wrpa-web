export const convertTimeoutMsToMinutesString = (timeout: number): string => {
    const minutes = Math.floor(timeout / 60000);
    const seconds = Math.floor((timeout % 60000) / 1000);
    return `${minutes}분 ${seconds}초`;
}

export const cutYearIfSame = (date?: string): string => {
    if (!date) return '-';
    const currentYear = new Date().getFullYear();
    const dateYear = new Date(date).getFullYear();
    return dateYear === currentYear ? date.slice(5) : date;
}

export const getColorByWorkState = (workState: string): string | undefined => {
    switch (workState) {
        case 'success':
            return 'success';
        case 'working':
            return 'warn';
        case 'fail':
            return 'danger';
        case 'cancel':
            return 'contrast';
        default:
            return 'secondary';
    }
}

type WorkStateHistoryEntry = { createdTime: number; state: string }

// 재시도된 작업은 히스토리에 working → fail → waiting → working → success 처럼 여러 시도가 쌓인다.
// 백엔드 startedTime/workTime 은 첫 working 기준이라, 마지막 시도의 시작과 그 성공/실패 시각을 따로 구한다.
// finishedTime 은 그 시도가 아직 끝나지 않았으면 null
export const lastAttemptTimes = (
    history?: WorkStateHistoryEntry[] | null,
): { startedTime: number; finishedTime: number | null } | null => {
    if (!history?.length) return null
    const sorted = [...history].sort((a, b) => a.createdTime - b.createdTime)
    let i = sorted.findLastIndex((h) => h.state === 'working')
    if (i < 0) return null
    const finished = sorted.slice(i + 1).find((h) => h.state === 'success' || h.state === 'fail')
    // 한 시도 안에 working 이 연달아 기록될 수 있어 그 묶음의 첫 working 을 시작으로 본다
    while (i > 0 && sorted[i - 1]!.state === 'working') i--
    return { startedTime: sorted[i]!.createdTime, finishedTime: finished?.createdTime ?? null }
}

// 백엔드 TimeHelper.formatDuration 과 같은 형식
export const formatDurationMs = (ms: number): string => {
    const hours = Math.floor(ms / 3600000)
    const mins = Math.floor((ms % 3600000) / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    const mss = ms % 1000
    if (hours > 0) return `${hours}h ${mins}m ${secs}s ${mss}ms`
    if (mins > 0) return `${mins}m ${secs}s ${mss}ms`
    if (secs > 0) return `${secs}s ${mss}ms`
    return `${mss}ms`
}
