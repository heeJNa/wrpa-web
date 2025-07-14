// composables/useFormValidator.ts
import { z, ZodObject } from 'zod'

export function useFormValidator<T extends ZodObject<any>>(schema: T, state: () => z.infer<T>) {
    const errors = ref<Partial<Record<keyof z.infer<T>, string[]>>>({})
    // const errors = ref<any>({}) // Using `any` to allow for flexible error structure
    const validate = () => {
        const result = schema.safeParse(state())
        if (!result.success) {
            errors.value = z.flattenError(result.error).fieldErrors as typeof errors.value
            console.error('Validation errors:', errors.value)
            // errors.value = result.error.issues.reduce((acc, issue) => {
            //     const path = issue.path.join('.')
            //     if (!acc[path]) {
            //         acc[path] = []
            //     }
            //     acc[path].push(issue.message)
            //     return acc
            // }, {} as Record<string, string[]>)
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