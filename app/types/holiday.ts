import { z } from 'zod'

export const holidaySchema = z.object({
  holiday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD 형식으로 입력해주세요'),
  title: z.string().max(100).optional().nullable(),
  memo: z.string().max(200).optional().nullable(),
})
export type HolidayForm = z.infer<typeof holidaySchema>

export interface Holiday extends HolidayForm {
  id?: string
  createdTime?: string
}
