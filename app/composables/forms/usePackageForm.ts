
import { packageSchema, type Packages } from '~/types/package'


export const usePackageForm = () => {
  const packages = ref<Packages>({
    name: '',
    version: '',
    file: new File([], ''),
    publishing: false,
  })
  const { errors, validate } = useFormValidator(packageSchema, () => ({
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
