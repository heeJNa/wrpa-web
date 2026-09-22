import { JobTypesEnum } from './enum'
import { z } from 'zod'
import type { ActiveBasis } from '~/types/active-window'

interface JobTypes {
  code: string
  name: string
  cronSchedule?: string
  lifetime?: number
  state: string
}

const jobSchema = z
  .object({
    id: z.uuidv4(),
    botId: z.string().min(1, '계정을 선택해주세요'),
    jobType: z.enum(
      Object.keys(JobTypesEnum) as [string, ...string[]],
      '유효하지 않은 작업 유형입니다',
    ),
    cronSchedule: z
      .string()
      .regex(/^([\*/0-9,-]+\s){4,5}[\*/0-9,-]+$/, '유효하지 않은 cron 표현식입니다')
      .optional()
      .nullable(),
    lifetime: z
      .number('Timeout을 입력해주세요')
      .int()
      .min(0, '유효하지 않은 lifetime 값입니다'),
    closingMonth: z
      .string()
      .regex(/^(?:\d{4}-(0[1-9]|1[0-2])|)$/, '유효하지 않은 형식입니다')
      .optional()
      .nullable(),
    locked: z.boolean().optional(),
    callbackId: z.string().optional().nullable(),
    workerId: z.string().optional(),
    contractCrawlDataModelId: z.string().min(1, '파일을 선택해주세요'),
    activeBasis: z.enum(['CALENDAR_DAY', 'BUSINESS_DAY']),
    activeFrom: z
      .number()
      .int()
      .min(1, '1 이상')
      .max(31, '31 이하')
      .optional()
      .nullable(),
    activeTo: z.number().int().min(1, '1 이상').max(31, '31 이하').optional().nullable(),
    workTime: z
      .string()
      .min(1, '작업 시간을 입력해주세요')
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'workTime은 반드시 hh:mm 형식이어야 합니다'),
    priority: z
      .number('우선순위를 입력해주세요')
      .int()
      .min(0, '우선순위는 0 이상이어야 합니다')
      .max(999, '우선순위는 999 이하여야 합니다 (영업일 순서 밴드 단위)'),
    closingMonthNum: z.number('업적월을 입력해주세요').int(),
    priorityManual: z.boolean().optional(),
    excludeHoliday: z.boolean().optional(),
    note: z
      .string()
      .max(200, '노트는 최대 200자까지 입력할 수 있습니다')
      .optional()
      .nullable(),
  })
  .refine(
    (v) => v.activeFrom == null || v.activeTo == null || v.activeTo >= v.activeFrom,
    {
      message: '종료가 시작보다 앞입니다',
      path: ['activeTo'],
    },
  )
type JobForm = z.infer<typeof jobSchema>

interface Job extends JobForm {
  accountName?: string
  botName?: string
  callbackName?: string
  companyId?: string
  companyName?: string
  dataType?: string
  dataTypePretty?: string
  schedule?: string
  paymentDayOfMonth?: string
  insuranceCompanyCode?: string
  activeWindowPretty?: string
  legacyWindowConflict?: boolean
  legacyBizDayPretty?: string | null
}

const manualJobSchema = z.object({
  priority: z
    .number('우선순위를 입력해주세요')
    .int()
    .min(0, '우선순위는 0 이상이어야 합니다')
    .max(999, '우선순위는 999 이하여야 합니다 (영업일 순서 밴드 단위)'),
  closingMonthNum: z.number('업적월을 입력해주세요').int(),
})
type ManualJobForm = z.infer<typeof manualJobSchema>

interface JobBatchUpdatePayload {
  ids: string[]
  activeBasis?: ActiveBasis | null
  activeFrom?: number | null
  activeTo?: number | null
  workTime?: string
  priority?: number
  closingMonthNum?: number
  timeout?: number
  locked?: boolean
  excludeHoliday?: boolean | null
}

interface JobBatchCopyPayload {
  ids: string[]
  targetBotId: string
}
export {
  jobSchema,
  type Job,
  type JobForm,
  type JobTypes,
  manualJobSchema,
  type ManualJobForm,
  type JobBatchUpdatePayload,
  type JobBatchCopyPayload,
}
