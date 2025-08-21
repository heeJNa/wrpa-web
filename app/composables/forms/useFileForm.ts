import { type File, type FileForm, fileSchema } from "~/types/file"
import { v4 as uuidv4 } from 'uuid'

export const useFileForm = () => {
  const fileForm = ref<FileForm>({
    id: uuidv4(),
    insuranceCompanyCode: '',
    dataType: "",
    fileType: '',
    insureType: '',
    contentType: '',
    originPath: '',
    note: '',
    lifetime: 0,
  })
  const { errors, validate } = useFormValidator(fileSchema, () => ({
    id: fileForm.value.id,
    insuranceCompanyCode: fileForm.value.insuranceCompanyCode,
    dataType: fileForm.value.dataType,
    fileType: fileForm.value.fileType,
    insureType: fileForm.value.insureType,
    contentType: fileForm.value.contentType,
    originPath: fileForm.value.originPath,
    note: fileForm.value.note,
    lifetime: fileForm.value.lifetime,
  }))
  return {
    fileForm,
    errors,
    validate,
  }
}
