import { openIntake } from '../src/core/intakes/intake-usecase'
import {
  articlePerformance,
  missingQuestion,
  missingArticleQuestions,
} from '../src/operator/suggestion-insights-usecase'
import { afterAll, beforeAll, expect, it } from 'vitest'
import { testPlatform } from './platform'
import {
  presentSuggestion,
  reactToSuggestion,
  previousSuggestion,
  suggestionResolution,
} from '../src/core/suggestions/suggestion-store'
import { deleteContent } from '../src/core/retention/retention-store'
import type {
  SuggestionPresentation,
  SuggestionReaction,
} from '../src/core/suggestions/suggestion'

let platform: Awaited<ReturnType<typeof testPlatform>>
beforeAll(async () => {
  platform = await testPlatform()
  const db = platform.DB
  await db.batch([
    db.prepare(
      "INSERT INTO products VALUES('books','Books'),('cards','Cards')",
    ),
    db.prepare(
      "INSERT INTO mailboxes VALUES('books@example.org','books'),('cards@example.org','cards')",
    ),
    db.prepare(
      "INSERT INTO conversations(number,product,mailbox,contact,subject,status,created_at) VALUES(1,'books','books@example.org','one@example.org','A','open',1),(2,'cards','cards@example.org','two@example.org','B','open',1),(3,'books','books@example.org','three@example.org','C','open',1)",
    ),
  ])
})
afterAll(() => platform.dispose())
const article = { id: 'publish', score: 0.9 }
function show(fields: Partial<SuggestionPresentation>, at: number) {
  return presentSuggestion(
    platform.DB,
    {
      product: 'books',
      surface: 'chat',
      question: 'How can I publish?',
      articles: [article],
      highestScore: article.score,
      ...fields,
    },
    at,
  )
}
function react(id: string, fields: Partial<SuggestionReaction>, at: number) {
  return reactToSuggestion(
    platform.DB,
    {
      product: 'books',
      presentation: id,
      article: 'publish',
      action: 'opened',
      ...fields,
    },
    at,
  )
}

function handoff(
  ids: string[],
  at: number,
  product = 'books',
  origin = 'chat',
  email = 'one@example.org',
  submissionId = crypto.randomUUID(),
) {
  return openIntake(
    platform,
    {
      product,
      origin,
      email,
      subject: 'Question',
      body: 'How?',
      suggestionIds: ids,
      submissionId,
    },
    { kind: 'extension', id: origin },
    at,
  )
}

it('counts only suggestions shown to waiting customers and their final outcome at the end of each reporting period', async () => {
  const resolved = await show({}, 100)
  const handedOff = await show({ surface: 'form' }, 101)
  const notShown = await show({ articles: [], highestScore: 0.45 }, 102)
  await show({ surface: 'composer', number: 1 }, 103)
  await show({ surface: 'ack', number: 1 }, 104)
  await show({ product: 'cards' }, 105)
  expect(await react(resolved, {}, 110)).toBe(true)
  expect(await react(resolved, {}, 111)).toBe(true)
  expect(await react(resolved, { action: 'resolved' }, 112)).toBe(true)
  expect(await react(handedOff, { action: 'unresolved' }, 113)).toBe(true)
  await handoff([handedOff], 114, 'books', 'form')
  expect(
    await react(resolved, { action: 'opened', product: 'cards' }, 115),
  ).toBe(false)
  expect(
    await react(resolved, { action: 'opened', surface: 'form' }, 115),
  ).toBe(false)
  expect(
    await react(resolved, { action: 'opened', article: 'other' }, 115),
  ).toBe(false)
  expect(await react(notShown, {}, 115)).toBe(false)
  expect(await react(resolved, { action: 'attached' }, 116)).toBe(false)
  expect(
    await suggestionResolution(platform.DB, 'books', 100, 110),
  ).toMatchObject({ shownSuggestions: 2, solvedSuggestions: 0 })
  expect(await suggestionResolution(platform.DB, 'books', 100, 120)).toEqual({
    shownSuggestions: 2,
    solvedSuggestions: 1,
    selfResolutionRate: 0.5,
  })
  expect(
    await suggestionResolution(platform.DB, 'cards', 100, 120),
  ).toMatchObject({ shownSuggestions: 1, solvedSuggestions: 0 })
  expect(await suggestionResolution(platform.DB, '', 0, 2)).toMatchObject({
    selfResolutionRate: null,
  })
  expect(await articlePerformance(platform.DB)).toContainEqual({
    product: 'books',
    article: 'publish',
    shown: 4,
    opened: 1,
    solved: 1,
  })
  await handoff([resolved], 121)
  expect(
    await suggestionResolution(platform.DB, 'books', 100, 130),
  ).toMatchObject({ solvedSuggestions: 0 })
  expect(
    await suggestionResolution(platform.DB, 'books', 100, 120),
  ).toMatchObject({ solvedSuggestions: 1 })
})

it('reuses an acknowledgment or composer presentation without exposing it under another product, conversation or surface', async () => {
  const scope = {
    product: 'books',
    surface: 'composer' as const,
    number: 1,
    key: 'latest-message',
  }
  const [one, two] = await Promise.all([show(scope, 210), show(scope, 211)])
  expect(one).toBe(two)
  expect(await previousSuggestion(platform.DB, scope)).toEqual({
    presentation: one,
    articles: [article],
    highestScore: 0.9,
  })
  expect(
    await previousSuggestion(platform.DB, { ...scope, product: 'cards' }),
  ).toBeNull()
  expect(
    await previousSuggestion(platform.DB, { ...scope, number: 3 }),
  ).toBeNull()
  expect(
    await previousSuggestion(platform.DB, { ...scope, surface: 'ack' }),
  ).toBeNull()
  expect(await react(one, { action: 'attached', number: 1 }, 212)).toBe(true)
  expect(await react(one, { action: 'attached', number: 3 }, 212)).toBe(false)
  expect(await react(one, { action: 'resolved' }, 213)).toBe(false)
  expect(await react(one, { action: 'unresolved' }, 213)).toBe(false)
  expect(await react(one, { action: 'opened' }, 214)).toBe(true)
  expect(await react(one, { action: 'unresolved' }, 215)).toBe(true)
  expect(await react(one, { action: 'resolved' }, 216)).toBe(true)
  expect(await suggestionResolution(platform.DB, 'books', 210, 220)).toEqual({
    shownSuggestions: 0,
    solvedSuggestions: 0,
    selfResolutionRate: null,
  })
  await expect(show({ ...scope, number: 2 }, 213)).rejects.toThrow()
})

it('erases linked anonymous turns, known contact questions and reactions during deletion, and expires anonymous questions by age', async () => {
  const target = {
    articles: [],
    highestScore: null,
    question: 'A private request',
  }
  const one = await show({ ...target }, 300)
  const two = await show({ ...target }, 301)
  const form = await show(
    { ...target, surface: 'form', contact: 'three@example.org' },
    302,
  )
  const unrelated = await show(
    { ...target, product: 'cards', contact: 'two@example.org' },
    303,
  )
  const anonymous = await show({ ...target }, 304)
  await handoff([one], 310, 'cards')
  const owner = await handoff(
    [one, two],
    311,
    'books',
    'chat',
    'three@example.org',
  )
  await handoff([one], 312)
  for (const id of [one, two]) {
    const recorded = await platform.DB.prepare(
      'SELECT number,contact FROM suggestion_presentations WHERE id=?',
    )
      .bind(id)
      .first()
    expect(recorded).toEqual({
      number: owner.number,
      contact: 'three@example.org',
    })
  }
  const visible = await missingArticleQuestions(platform.DB, 'books', 1)
  expect(visible.rows.some((r) => r.id === one)).toBe(true)
  expect(visible.rows.some((r) => r.id === unrelated)).toBe(false)
  await deleteContent(platform.DB, { contact: 'three@example.org' })
  for (const id of [one, two, form]) {
    expect(await missingQuestion(platform.DB, id)).toBeNull()
    expect(
      await platform.DB.prepare(
        'SELECT count(*) AS n FROM suggestion_reactions WHERE presentation=?',
      )
        .bind(id)
        .first('n'),
    ).toBe(0)
  }
  expect(await missingQuestion(platform.DB, unrelated)).not.toBeNull()
  expect(await missingQuestion(platform.DB, anonymous)).not.toBeNull()
  await deleteContent(platform.DB, { before: 305 })
  expect(await missingQuestion(platform.DB, anonymous)).toBeNull()
})

it('rolls back the inquiry when its reaction cannot persist, then accepts a replay exactly once', async () => {
  const id = await show({}, 400)
  const submission = crypto.randomUUID()
  const conversations = () =>
    platform.DB.prepare('SELECT count(*) AS n FROM conversations').first('n')
  const before = await conversations()
  await platform.DB.prepare(
    "CREATE TRIGGER fail_suggestion_reaction BEFORE INSERT ON suggestion_reactions BEGIN SELECT RAISE(ABORT,'force rollback'); END",
  ).run()
  try {
    await expect(
      handoff([id], 401, 'books', 'chat', 'one@example.org', submission),
    ).rejects.toThrow()
    expect(await conversations()).toBe(before)
    expect(
      await platform.DB.prepare(
        'SELECT number FROM suggestion_presentations WHERE id=?',
      )
        .bind(id)
        .first('number'),
    ).toBeNull()
  } finally {
    await platform.DB.prepare('DROP TRIGGER fail_suggestion_reaction').run()
  }
  const [first, retry] = await Promise.all(
    [402, 403].map((at) =>
      handoff([id], at, 'books', 'chat', 'one@example.org', submission),
    ),
  )
  expect(retry).toEqual(first)
  expect(await conversations()).toBe(Number(before) + 1)
  expect(
    await platform.DB.prepare(
      'SELECT count(*) AS n FROM suggestion_reactions WHERE presentation=?',
    )
      .bind(id)
      .first('n'),
  ).toBe(1)
})
