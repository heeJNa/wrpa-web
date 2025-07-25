export const insuranceCompanyTypes: LabelValue[] = [
    { label: '생명보험', value: 'LIFE' },
    { label: '손해보험', value: 'PROPERTY' },
    { label: '보증보험', value: 'GUARANTEE' },
]

export const jobTypes: LabelValue[] = [
    {
        value: 'NEW',
        label: '신계약'
    },
    {
        value: 'CONTRACT',
        label: '수금'
    },
    {
        value: 'COMMISSION',
        label: '수수료'
    },
    {
        value: 'MONITORING',
        label: '모니터링'
    }
]

export const insureTypes: LabelValue[] = [
    { label: '전체', value: 'ALL' },
    { label: '장기', value: 'LONGTERM' },
    { label: '자동차', value: 'CAR' },
    { label: '일반', value: 'GENERAL' },
]

export const workStatusCodes: LabelValue[] = [
    {
        value: '200',
        label: '성공',
    },
    {
        value: '400',
        label: '잘못된 요청',
    },
    {
        value: '401',
        label: '인증 실패',
    },
    {
        value: '500',
        label: 'RPA 서비스 장애',
    },
    {
        value: '503',
        label: '보험사 서비스 장애',
    },
    {
        value: '504',
        label: '시간 초과',
    },
]

export const workCreateTypes: LabelValue[] = [
    { label: '자동', value: 'Auto' },
    { label: '수동', value: 'Manual' },
    { label: '즉시', value: 'Immediately' },
]