import { JobTypesEnum, InsureTypesEnum } from "./enum"
import { z } from 'zod'

// interface JobTypes {
//     code: string;
//     name: string;
//     cronSchedule?: string;
//     lifetime?: number;
//     state: string;
// }

const fileSchema = z.object({
    id: z.uuidv4(),
    insuranceCompanyCode: z.string().min(1, '보험사 코드를 입력해주세요'),
    dataType: z.enum(Object.keys(JobTypesEnum) as [string, ...string[]], '데이터 유형을 입력해주세요'),
    fileType: z.string().min(1, '파일 유형을 입력해주세요'),
    insureType: z.enum(Object.keys(InsureTypesEnum) as [string, ...string[]], '보종을 입력해주세요'),
    contentType: z.string().min(1, '콘텐츠 유형을 입력해주세요'),
    originPath: z.string().min(1, '전산경로를 입력해주세요'),
    note: z.string().max(200, '노트는 최대 200자까지 입력할 수 있습니다').optional().nullable(),
    lifetime: z.number().int().optional().nullable(),
    cronSchedule: z.string().optional().nullable(),
    originPathDetail: z.string().optional().nullable(),
    fileCode: z.string().optional().nullable(),
})
type FileForm = z.infer<typeof fileSchema>

interface File extends FileForm {
    // accountName?: string;
    // botName?: string;
    // callbackName?: string;
    // companyId?: string;
    // companyName?: string;
    // dataType?: string;
    // dataTypePretty?: string;
    // schedule?: string;
    // paymentDayOfMonth?: string;
    // insuranceCompanyCode?: string;
}


export { fileSchema, type FileForm, type File };