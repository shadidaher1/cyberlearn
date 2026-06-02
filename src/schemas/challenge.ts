import { z } from 'zod'

export const submitFlagSchema = z.object({
  flag: z.string().min(1, 'Enter a flag').max(256),
})

export type SubmitFlagInput = z.infer<typeof submitFlagSchema>
