import { z } from 'zod'

export const defaultTimeZone = 'Asia/Tokyo'
export const timeZone = z
  .string()
  .max(100)
  .refine((zone) => {
    try {
      new Intl.DateTimeFormat('en', { timeZone: zone })
      return true
    } catch {
      return false
    }
  })
