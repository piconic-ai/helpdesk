import { expect, test } from 'vitest'
import { buildClefRequest, readClefAnswer } from '../chat/judge-client'
import {
  matchTemplates,
  rankTemplates,
  type CannedCandidate,
} from './suggestions'
import { fillTemplate } from './templates'

test('ranks three suitable replies and retains the threshold boundary', () => {
  expect(
    rankTemplates([
      { id: 'a', score: 0.6 },
      { id: 'b', score: 0.9 },
      { id: 'c', score: 0.59 },
      { id: 'd', score: 0.8 },
      { id: 'e', score: 0.95 },
    ]),
  ).toEqual(['e', 'b', 'd'])
  expect(rankTemplates([{ id: 'a', score: 0.6 }])).toEqual(['a'])
})

test('matches labels and subjects with normalised comparisons, with an empty miss', () => {
  const candidates: CannedCandidate[] = [
    { kind: 'canned', title: '領収書', id: 'receipt', summary: 'Answer' },
    { kind: 'canned', title: 'ＡＰＩ', id: 'api', summary: 'Answer' },
    { kind: 'canned', title: '共有リンク', id: 'sharing', summary: 'Answer' },
  ]
  expect(matchTemplates(candidates, 'Re: API について', ['領収書'])).toEqual([
    'receipt',
    'api',
  ])
  expect(matchTemplates(candidates, 'ご確認', ['その他'])).toEqual([])
  expect(
    fillTemplate('ご連絡ありがとうございます、{{name}} 様。{{product}}です。', {
      name: '山田 花',
      productName: 'Slide',
    }),
  ).toBe('ご連絡ありがとうございます、山田 花 様。Slideです。')
})

test('sends redacted, typed noul questions for canned replies and maps scores back locally', () => {
  const candidates: CannedCandidate[] = [
    { kind: 'canned', title: '領収書', id: 'stored-id', summary: '案内文' },
  ]
  const request = buildClefRequest(
    'clef-flash',
    '山田 花 from person@example.net',
    candidates,
    '山田 花',
    'canned',
  )
  expect(request.state.question).toBe('[contact] from [contact]')
  expect(request.state.saved_replies).toEqual([
    { id: '0', title: '領収書', summary: '案内文' },
  ])
  expect(request.questions['canned.0']).toEqual({
    type: 'noul',
    instructions: expect.stringContaining('be used to respond'),
  })
  expect(
    readClefAnswer(
      {
        answers: {
          'canned.0': { type: 'noul', noul: 0.87 },
          needs_human: { type: 'noul', noul: 0 },
        },
      },
      candidates,
      'canned',
    ).scores,
  ).toEqual([{ id: 'stored-id', score: 0.87 }])
})

test('orders statistically equal results consistently and ignores out-of-range scores', () => {
  expect(
    rankTemplates([
      { id: 'z', score: 0.7 },
      { id: 'a', score: 0.7 },
      { id: 'invalid', score: 1.1 },
    ]),
  ).toEqual(['a', 'z'])
})
