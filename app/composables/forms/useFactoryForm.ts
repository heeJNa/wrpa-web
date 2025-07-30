
import { factorySchema, type FactoryForm } from '~/types/factory'
import { v4 as uuidv4 } from 'uuid'
import { JobTypesStateEnum } from '~/types/enum'


export const useFactoryForm = () => {
  const factoryForm = ref<FactoryForm>({
    id: uuidv4(),
    name: '',
    insuranceCompanyCode: '',
    state: "AVAILABLE",
    jobStates: [],
    memo: '',
  })
  const { errors, validate } = useFormValidator(factorySchema, () => ({
    id: factoryForm.value.id,
    name: factoryForm.value.name,
    insuranceCompanyCode: factoryForm.value.insuranceCompanyCode,
    state: factoryForm.value.state,
    jobStates: factoryForm.value.jobStates,
    memo: factoryForm.value.memo,
  }))

  return {
    factoryForm,
    errors,
    validate,
  }
}
