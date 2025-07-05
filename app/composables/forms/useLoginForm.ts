import { z } from 'zod'

const PASSWORD_WRONG_MESSAGE = '비밀번호는 8자 이상, 숫자, 특수문자를 포함해야 합니다.'
const schema = z.object({
  id: z.string().min(1, '아이디를 입력해주세요'),
  password: z
    .string()
    .min(8, PASSWORD_WRONG_MESSAGE)
    // .regex(/[A-Z]/, '대문자 포함')
    .regex(/[0-9]/, PASSWORD_WRONG_MESSAGE)
    .regex(/[^A-Za-z0-9]/, PASSWORD_WRONG_MESSAGE),
})

export const useLoginForm = () => {
  const id = ref('')
  const password = ref('')
  const { errors, validate } = useFormValidator(schema, () => ({
    id: id.value,
    password: password.value,
  }))

  return {
    id,
    password,
    errors,
    validate,
  }
}
