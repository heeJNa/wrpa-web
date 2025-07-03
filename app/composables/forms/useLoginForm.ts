import { z } from 'zod'

const schema = z.object({
  id: z.string().min(1, '아이디를 입력해주세요'),
  password: z
    .string()
    .min(8, '8자 이상')
    // .regex(/[A-Z]/, '대문자 포함')
    .regex(/[0-9]/, '숫자 포함')
    .regex(/[^A-Za-z0-9]/, '특수문자 포함'),
})

export const useLoginForm = () => {
  const id = ref('')
  const password = ref('')
  const errors = ref<{ [k: string]: string[] }>({})

  const validate = () => {
    const result = schema.safeParse({ id: id.value, password: password.value })
    if (!result.success) {
      errors.value = result.error.formErrors.fieldErrors
      return false
    }
    errors.value = {}
    return true
  }

  return {
    id,
    password,
    errors,
    validate,
  }
}
