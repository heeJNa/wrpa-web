import { z } from 'zod'

const optionalText = z.string().trim().optional().nullable()
// 백엔드는 yyyy-MM-dd 문자열로 저장한다
const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식으로 입력해주세요')
  .optional()
  .nullable()
  .or(z.literal(''))

const companySchema = z.object({
  name: z.string().trim().min(1, '회사명을 입력해주세요'),
  code: z.string().trim().min(1, '고유코드를 입력해주세요'),
  branchName: optionalText,
  branchUse: z.boolean(),
  businessRegistrationNumber: optionalText,
  companyRegistrationNumber: optionalText,
  address: optionalText,
  addressDetail: optionalText,
  leaderName: optionalText,
  mainBank: optionalText,
  phone: optionalText,
  fax: optionalText,
  contractDate: optionalDate,
  nextPaymentDate: optionalDate,
})

type CompanyForm = z.infer<typeof companySchema>

interface CompanyListItem {
  id: string
  name: string
  code: string
  leaderName?: string
  phone?: string
  contractDate?: string
  nextPaymentDate?: string
  createdTime?: number
}

interface Company extends Omit<CompanyForm, 'branchUse'> {
  id: string
  branchUse?: boolean | null
  registrationFileName?: string
  createdTime?: number
  updatedTime?: number
}

export { companySchema, type CompanyForm, type CompanyListItem, type Company }
