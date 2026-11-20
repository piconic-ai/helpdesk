import { describe, expect, it } from 'vitest'
import { matchingIssue } from './match-issue'

const choices = [
  { number: 95, title: 'ダウンロード' },
  { number: 12, title: '領収書' },
  { number: 7, title: '領収書' },
]

describe('matchingIssue', () => {
  it('prefers a subject match and breaks ties by issue number', () => {
    expect(
      matchingIssue(choices, '領収書', 'ダウンロード', new Set())?.number,
    ).toBe(7)
  })

  it('skips linked issues and can use the body alone', () => {
    expect(
      matchingIssue(choices, '領収書', 'ダウンロード', new Set([7, 12]))
        ?.number,
    ).toBe(95)
  })

  it('ignores common words and does not suggest unrelated issues', () => {
    expect(
      matchingIssue(
        [{ number: 1, title: 'How to export' }],
        'HOW TO',
        '領収書',
        new Set(),
      ),
    ).toBeUndefined()
  })
})
