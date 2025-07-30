import { JobTypesEnum, JobTypesStateEnum } from "./enum";
import { z } from 'zod'

const factorySchema = z.object({
    id: z.uuidv4(),
    name: z.string().min(1, '팩토리명을 입력해주세요'),
    insuranceCompanyCode: z.string().min(1, '보험사를 선택해주세요'),
    state: z.enum(Object.keys(JobTypesStateEnum) as [string, ...string[]]),
    jobStates: z.array(z.object({
        cronSchedule: z.string().optional().nullable(),
        jobType: z.enum(Object.keys(JobTypesEnum) as [string, ...string[]]),
        lifetime: z.number().int().optional(),
        state: z.enum(Object.keys(JobTypesStateEnum) as [string, ...string[]]),
    })),
    memo: z.string().max(200, '메모는 최대 200자까지 입력할 수 있습니다'),
})

type FactoryForm = z.infer<typeof factorySchema>

interface JobState {
    cronSchedule?: string,
    jobType: keyof typeof JobTypesEnum,
    jobTypePretty: string,
    lifetime?: number,
    state: keyof typeof JobTypesStateEnum,
    statePretty: string,
}

interface Factory extends FactoryForm {
    jobStates: JobState[],
    factoryName: string,
    insuranceCompanyName: string,
    workParametersRequired: any[]
}

export { factorySchema, type FactoryForm, type Factory };