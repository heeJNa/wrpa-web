import { accountSchema, type Account } from '~/types/account'
import { v4 as uuidv4 } from 'uuid'


export const useAccountForm = () => {
  const account = ref<Account>({
    id: uuidv4(),
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
  const { errors, validate } = useFormValidator(accountSchema, () => ({
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
