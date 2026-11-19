import { z } from 'zod'

export const mailLanguage = z.enum(['ja', 'en'])
export type MailLanguage = z.infer<typeof mailLanguage>
