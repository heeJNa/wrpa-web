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