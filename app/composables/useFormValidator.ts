// composables/useFormValidator.ts
import { z, ZodObject } from 'zod'

export function useFormValidator<T extends ZodObject<any>>(schema: T, state: () => z.infer<T>) {
    const errors = ref<Partial<Record<keyof z.infer<T>, string[]>>>({})

    const validate = () => {
        const result = schema.safeParse(state())
        if (!result.success) {
            errors.value = result.error.formErrors.fieldErrors as typeof errors.value
            return false
        }
        errors.value = {}
        return true
    }

    return {
        errors,
        validate,
    }
}