import { z } from 'zod'
import { type Account } from '~~/types/account'

const schema = z.object({
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
export const useAccountForm = () => {
  const account = ref<Account>({
    id: crypto.randomUUID(),
    name: '',
    userId: '',
    userPhoneNumber: undefined,
    telecomAgency: undefined,
    note: undefined,
    companyId: '',
    lock: false,
    feePassword: undefined,
    groupId: undefined,
    insuranceCompanyCode: '',
    paymentDayOfMonth: undefined,
    userCode: undefined,
    userPw: '',
  })
  // const id = ref<string>(crypto.randomUUID())
  // const name = ref<string>('')
  // const userId = ref<string>('')
  // const userPhoneNumber = ref<string>()
  // const telecomAgency = ref<string>()
  // const note = ref<string>()
  // const companyId = ref<string>('')
  // const lock = ref(false)
  // const feePassword = ref<string>()
  // const groupId = ref<string>()
  // const insuranceCompanyCode = ref<string>('')
  // const paymentDayOfMonth = ref<number>()
  // const userCode = ref<string>()
  // const userPw = ref<string>('')
  const { errors, validate } = useFormValidator(schema, () => ({
    companyId: account.value.companyId,
    feePassword: account.value.feePassword,
    groupId: account.value.groupId,
    id: account.value.id,
    insuranceCompanyCode: account.value.insuranceCompanyCode,
    lock: account.value.lock,
    name: account.value.name,
    note: account.value.note,
    paymentDayOfMonth: account.value.paymentDayOfMonth,
    telecomAgency: account.value.telecomAgency,
    userCode: account.value.userCode,
    userId: account.value.userId,
    userPhoneNumber: account.value.userPhoneNumber,
    userPw: account.value.userPw,
  }))

  return {
    account,
    errors,
    validate,
  }
}
