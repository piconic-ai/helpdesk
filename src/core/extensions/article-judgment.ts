export type CandidateSummary = { id: string; title: string; summary: string }
export type Judgment = {
  scores: { id: string; score: number }[]
  needsHuman: number
}
export type JudgmentModel = 'clef' | 'clef-flash'
