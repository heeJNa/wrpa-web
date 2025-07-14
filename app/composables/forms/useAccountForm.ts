import { z } from 'zod'

const schema = z.object({
  feePassword: z.string().optional(),
  groupId: z.string().optional(),
  id: z.uuidv4(),
  insuranceCompanyCode: z.string().min(1, '보험사를 선택해주세요'),
  lock: z.boolean(),
  name: z.string().min(1, '계정명을 입력해주세요'),
  note: z.string().optional(),
  paymentDayOfMonth: z.number().int().min(1, '지급일은 1일부터 31일까지 입력해주세요').max(31, '지급일은 1일부터 31일까지 입력해주세요').optional(),
  telecomAgency: z.string().optional(),
  userCode: z.string().optional(),
  userId: z.string().min(1, '아이디를 입력해주세요'),
  userPhoneNumber: z.string().optional(),
  userPw: z.string().min(1, '비밀번호를 입력해주세요'),
  companyId: z.string().min(1, '회사를 선택해주세요'),
})
export const useAccountForm = () => {
  const companyId = ref<string>('')
  const feePassword = ref<string>()
  const groupId = ref<string>()
  const id = ref<string>(crypto.randomUUID())
  const insuranceCompanyCode = ref<string>('')
  const lock = ref(false)
  const name = ref<string>('')
  const note = ref<string>()
  const paymentDayOfMonth = ref<number>()
  const telecomAgency = ref<string>()
  const userCode = ref<string>()
  const userId = ref<string>('')
  const userPhoneNumber = ref<string>()
  const userPw = ref<string>('')
  const { errors, validate } = useFormValidator(schema, () => ({
    companyId: companyId.value,
    feePassword: feePassword.value,
    groupId: groupId.value,
    id: id.value,
    insuranceCompanyCode: insuranceCompanyCode.value,
    lock: lock.value,
    name: name.value,
    note: note.value,
    paymentDayOfMonth: paymentDayOfMonth.value,
    telecomAgency: telecomAgency.value,
    userCode: userCode.value,
    userId: userId.value,
    userPhoneNumber: userPhoneNumber.value,
    userPw: userPw.value,
  }))

  return {
    feePassword,
    groupId,
    id,
    insuranceCompanyCode,
    lock,
    name,
    note,
    paymentDayOfMonth,
    telecomAgency,
    userCode,
    userId,
    userPhoneNumber,
    userPw,
    companyId,
    errors,
    validate,
  }
}
