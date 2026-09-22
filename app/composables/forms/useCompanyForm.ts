import { companySchema, type CompanyForm } from '~/types/company'

export const useCompanyForm = () => {
  const companyForm = ref<CompanyForm>({
    name: '',
    code: '',
    branchName: undefined,
    branchUse: false,
    businessRegistrationNumber: undefined,
    companyRegistrationNumber: undefined,
    address: undefined,
    addressDetail: undefined,
    leaderName: undefined,
    mainBank: undefined,
    phone: undefined,
    fax: undefined,
    contractDate: undefined,
    nextPaymentDate: undefined,
  })
  const { errors, validate } = useFormValidator(companySchema, () => ({
    name: companyForm.value.name,
    code: companyForm.value.code,
    branchName: companyForm.value.branchName,
    branchUse: companyForm.value.branchUse,
    businessRegistrationNumber: companyForm.value.businessRegistrationNumber,
    companyRegistrationNumber: companyForm.value.companyRegistrationNumber,
    address: companyForm.value.address,
    addressDetail: companyForm.value.addressDetail,
    leaderName: companyForm.value.leaderName,
    mainBank: companyForm.value.mainBank,
    phone: companyForm.value.phone,
    fax: companyForm.value.fax,
    contractDate: companyForm.value.contractDate,
    nextPaymentDate: companyForm.value.nextPaymentDate,
  }))

  return {
    companyForm,
    errors,
    validate,
  }
}
