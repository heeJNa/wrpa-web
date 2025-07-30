import { JobTypesEnum } from "./enum"
import { z } from 'zod'

interface JobTypes {
    code: string;
    name: string;
    cronSchedule?: string;
    lifetime?: number;
    state: string;
}

const jobSchema = z.object({
    id: z.uuidv4(),
    botId: z.string().min(1, '계정을 선택해주세요'),
    jobType: z.enum(Object.keys(JobTypesEnum) as [string, ...string[]], '유효하지 않은 작업 유형입니다'),
    cronSchedule: z.string().regex(/^([\*/0-9,-]+\s){4,5}[\*/0-9,-]+$/, '유효하지 않은 cron 표현식입니다').optional().nullable(),
    lifetime: z.number('Timeout을 입력해주세요').int().min(0, '유효하지 않은 lifetime 값입니다'),
    closingMonth: z.string().regex(/^(?:\d{4}-(0[1-9]|1[0-2])|)$/, '유효하지 않은 형식입니다').optional().nullable(),
    locked: z.boolean().optional(),
    callbackId: z.string().optional().nullable(),
    workerId: z.string().optional(),
    contractCrawlDataModelId: z.string().min(1, '파일을 선택해주세요'),
    startDate: z.string().min(1, '시작일을 입력해주세요').regex(/^(0?[1-9]|[12][0-9]|3[01])$/, '1~31 사이의 날짜만 입력할 수 있습니다'),
    endDate: z.string().min(1, '종료일을 입력해주세요').regex(/^(0?[1-9]|[12][0-9]|3[01])$/, '1~31 사이의 날짜만 입력할 수 있습니다'),
    workTime: z.string().min(1, '작업 시간을 입력해주세요').regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'workTime은 반드시 hh:mm 형식이어야 합니다'),
    priority: z.number('우선순위를 입력해주세요').int().min(0, '우선순위는 0 이상이어야 합니다'),
    closingMonthNum: z.number('업적월을 입력해주세요').int(),
    note: z.string().max(200, '노트는 최대 200자까지 입력할 수 있습니다').optional().nullable(),
})
type JobForm = z.infer<typeof jobSchema>

interface Job extends JobForm {
    accountName?: string;
    botName?: string;
    callbackName?: string;
    companyId?: string;
    companyName?: string;
    dataType?: string;
    dataTypePretty?: string;
    schedule?: string;
    paymentDayOfMonth?: string;
    insuranceCompanyCode?: string;
}

export { jobSchema, type Job, type JobForm, type JobTypes }