import { expect, it } from 'vitest'
import { articleExcerpt } from './excerpt'

it('quotes the first two sentences of prose, with link text and no Markdown or HTML', () => {
  expect(
    articleExcerpt(
      '# 設定\n\n**購入履歴**で[領収書](/help)を選びます。<em>宛名</em>を直せます。保存してください。',
    ),
  ).toBe('購入履歴で領収書を選びます。宛名を直せます。')
})

it('handles articles with only a heading, empty text, or a long unbroken sentence', () => {
  expect(articleExcerpt('# Setup')).toBe('Setup')
  expect(articleExcerpt('  ')).toBe('')
  expect(articleExcerpt('🍵'.repeat(200))).toBe('🍵'.repeat(159) + '…')
})
