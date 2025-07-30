import { z } from 'zod'

const accountSchema = z.object({
    feePassword: z.string().optional().nullable(),
    groupId: z.string().optional().nullable(),
    id: z.uuidv4(),
    insuranceCompanyCode: z.string().min(1, '보험사를 선택해주세요'),
    lock: z.boolean(),
    name: z.string().min(1, '계정명을 입력해주세요'),
    note: z.string().optional().nullable(),
    paymentDayOfMonth: z.number().int().min(1, '지급일은 1일부터 31일까지 입력해주세요').max(31, '지급일은 1일부터 31일까지 입력해주세요').optional().nullable(),
    telecomAgency: z.string().optional().nullable(),
    userCode: z.string().optional().nullable(),
    userId: z.string().min(1, '아이디를 입력해주세요'),
    userPhoneNumber: z.string().optional().nullable(),
    userPw: z.string().min(1, '비밀번호를 입력해주세요'),
    companyId: z.string().min(1, '회사를 선택해주세요'),
})

type Account = z.infer<typeof accountSchema>
interface AccountListItem {
    "id": string,
    "name": string,
    "userId": string,
    "userPhoneNumber"?: string,
    "telecomAgency"?: string,
    "note"?: string,
    "companyId": string,
    "companyName": string,
    "lock": boolean,
    "value": string,
    "insuranceCompanyCode": string,
    "insuranceCompanyName": string
}


// export interface Account extends Omit<AccountListItem, 'companyName' | 'insuranceCompanyName' | 'value'> {
//     feePassword?: string,
//     groupId?: string,
//     paymentDayOfMonth?: number,
//     userCode?: string,
//     userPw: string,
// }
export { accountSchema, type Account, type AccountListItem }