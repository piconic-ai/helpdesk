import { Lexer, Parser } from 'marked'

// The preview follows the first prose paragraph. A heading or a list can
// still provide a useful introduction when the article has no paragraph.
export function articleExcerpt(body: string) {
  const blocks = Lexer.lex(body.slice(0, 2000))
  const first =
    blocks.find((block) => block.type === 'paragraph') ??
    blocks.find((block) => block.type === 'heading')
  const parser = new Parser()
  parser.textRenderer.html = () => ''
  parser.textRenderer.br = () => ' '
  const text = (
    first && 'tokens' in first && first.tokens
      ? parser.parseInline(first.tokens, parser.textRenderer)
      : (body.split(/\r?\n/).find((line) => line.trim()) ?? '')
  )
    .replace(/\s+/g, ' ')
    .trim()
  const sentences = new Intl.Segmenter('ja', {
    granularity: 'sentence',
  }).segment(text)
  const intro = Array.from(sentences)
    .slice(0, 2)
    .map((part) => part.segment)
    .join('')
    .trim()
  const chars = Array.from(intro)
  return chars.length <= 160 ? intro : chars.slice(0, 159).join('') + '…'
}
