import { readFile, readdir } from 'node:fs/promises'
import { expect, it } from 'vitest'
import { parseMail } from './parse'
import { bouncedReply } from './bounce'
import { mailExamples } from './mail.examples'

const dir = new URL('./fixtures/', import.meta.url)
it('every email fixture has an executable example', async () => {
  expect((await readdir(dir)).sort()).toEqual(
    mailExamples.map((x) => x.file + '.eml').sort(),
  )
})
it.each(mailExamples)('F01-AC9 F01-AC10 $file', async (example) => {
  const raw = await readFile(new URL(example.file + '.eml', dir))
  const result = parseMail(
    Uint8Array.from(raw).buffer,
    example.file === 'bounce' ? '' : 'reader@example.org',
  )
  if ('error' in example) {
    await expect(result).rejects.toThrow()
    return
  }
  const mail = await result
  expect(mail.subject).toBe(example.subject)
  expect(mail.category).toBe(example.category)
  if ('text' in example) expect(mail.text).toContain(example.text)
  if ('html' in example) expect(mail.html).toContain(example.html)
  if (example.file === 'bounce')
    expect(bouncedReply(mail)).toEqual({
      recipient: 'reader@example.org',
      ids: ['<outbound@example.org>'],
    })
})
