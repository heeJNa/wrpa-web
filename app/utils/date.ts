/**
 * 오늘 날짜를 원하는 format으로 반환하고,
 * date, month, year로 나누어 객체로 반환하는 함수입니다.
 * 
 * @param format 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD.MM.YYYY' 등 원하는 포맷 문자열
 * @returns { formatted: string, date: number, month: number, year: number }
 */
export const getToday = (format: string = 'YYYY-MM-DD') => {
    const today = new Date();
    const year = today.getFullYear();
    // JS month is 0-based, so +1
    const month = today.getMonth() + 1;
    const date = today.getDate();

    const pad = (n: number) => n.toString().padStart(2, '0');

    const formatted = (() => {
        switch (format) {
            case 'YYYY-MM-DD':
                return `${year}-${pad(month)}-${pad(date)}`;
            case 'MM/DD/YYYY':
                return `${pad(month)}/${pad(date)}/${year}`;
            case 'DD.MM.YYYY':
                return `${pad(date)}.${pad(month)}.${year}`;
            default:
                return `${year}${pad(month)}${pad(date)}`;
        }
    })();

    return { formatted, date, month, year };
};

/**
 * Formats a Date object into Korean Standard Time (KST, UTC+9) using a custom format string.
 *
 * ### Supported format tokens:
 * - `YYYY`: 4-digit year
 * - `MM`: 2-digit month (01–12)
 * - `DD`: 2-digit day of month (01–31)
 * - `HH`: 2-digit hour in 24-hour format (00–23)
 * - `hh`: 2-digit hour in 12-hour format (01–12)
 * - `mm`: 2-digit minutes (00–59)
 * - `ss`: 2-digit seconds (00–59)
 * - `SSS`: 3-digit milliseconds (000–999)
 * - `A`: AM or PM (uppercase)
 * - `ddd`: Day of the week in Korean (월, 화, 수, ...)
 *
 * @param date - The `Date` object to format.
 * @param format - A string using supported tokens.
 * @returns A string representing the date formatted in KST.
 *
 * @example
 * formatToKoreanTime(new Date(), "YYYY-MM-DD HH:mm:ss.SSS A (ddd)");
 * // → "2025-07-10 19:14:02.023 PM (목)"
 */
export const formatToKoreanTime = (date: Date, format: string = 'YYYY-MM-DD'): string => {
    const koreaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));

    const pad = (n: number, len: number = 2) => n.toString().padStart(len, '0');

    const hour24 = koreaDate.getHours();
    const hour12 = hour24 % 12 || 12;
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

    const tokens: Record<string, string> = {
        YYYY: koreaDate.getFullYear().toString(),
        MM: pad(koreaDate.getMonth() + 1),
        DD: pad(koreaDate.getDate()),
        HH: pad(hour24),
        hh: pad(hour12),
        mm: pad(koreaDate.getMinutes()),
        ss: pad(koreaDate.getSeconds()),
        SSS: pad(koreaDate.getMilliseconds(), 3),
        A: hour24 < 12 ? 'AM' : 'PM',
        ddd: dayNames[koreaDate.getDay()] ?? '',
    };

    return Object.entries(tokens).reduce(
        (acc, [key, value]) => acc.replace(new RegExp(key, 'g'), value),
        format
    );
}