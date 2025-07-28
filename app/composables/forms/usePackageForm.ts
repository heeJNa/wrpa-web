import { file, z } from 'zod'
import { type Packages } from '~~/types/package'

const schema = z.object({
  name: z.string().min(1, '패키지명을 입력해주세요'),
  version: z.string().min(1, '버전을 입력해주세요'),
  file: z.instanceof(File).refine(file => (file?.size ?? 0) > 0, '파일을 선택해주세요'),
  publishing: z.boolean().optional().default(false),
})
export const usePackageForm = () => {
  const packages = ref<Packages>({
    name: '',
    version: '',
    file: new File([], ''),
    publishing: false,
  })
  const { errors, validate } = useFormValidator(schema, () => ({
    name: packages.value.name,
    version: packages.value.version,
    file: packages.value.file,
    publishing: packages.value.publishing,
  }))

  return {
    packages,
    errors,
    validate,
  }
}
