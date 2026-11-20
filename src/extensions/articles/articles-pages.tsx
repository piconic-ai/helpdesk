import { articleExcerpt } from './excerpt'
import { raw } from 'hono/html'
import { PageLinks } from '../../ui/listing'
import { paginateRows } from '../../ui/pagination'
import { marked } from 'marked'
import sanitize from 'sanitize-html'
import { publicPath, searchArticles, type Article } from './article'
import { ActionLink, Button } from '../../ui/controls'
import { DetailPage, ListPage, Notice, EmptyState } from '../../ui/patterns'
import {
  AnswerChoices,
  PublicForm,
  PublicLinks,
  PublicSearch,
} from '../../ui/public-forms'
export function articleIndex(
  product: string,
  articles: Article[],
  q: string,
  page?: string,
) {
  const results = paginateRows(searchArticles(articles, q), page)
  const title = 'ヘルプ記事'
  return {
    title,
    html: String(
      <ListPage
        title={title}
        description={results.total + '件'}
        footer={
          <PageLinks path={publicPath(product)} query={{ q }} {...results} />
        }
        filters={<PublicSearch label="記事を検索" query={q} />}
      >
        {results.total ? (
          <PublicLinks
            items={results.rows.map((a) => ({
              label: a.title,
              description: articleExcerpt(a.body),
              path: publicPath(product, a.id),
            }))}
          />
        ) : (
          <EmptyState icon="search">該当する記事はありません。</EmptyState>
        )}
      </ListPage>,
    ),
  }
}
export function articleMarkup(body: string) {
  return sanitize(marked.parse(body, { async: false }), {
    allowedTags: [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'strong',
      'em',
      'a',
      'hr',
      'br',
      'table',
      'tr',
      'thead',
      'tbody',
      'th',
      'td',
    ],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: { h1: 'h2' },
  })
}
export function articleDetail(a: Article, token: string, suggestion?: string) {
  return {
    title: a.title,
    html: String(
      <DetailPage
        title={a.title}
        back={{ label: 'ヘルプ記事一覧', href: publicPath(a.product) }}
      >
        <article>{raw(articleMarkup(a.body))}</article>
        <AnswerChoices
          question={
            suggestion
              ? 'この記事で解決しましたか？'
              : 'この記事は役に立ちましたか？'
          }
          action={publicPath(a.product, a.id)}
          name="helpful"
        >
          <input type="hidden" name="visit" value={token} />
          {suggestion && (
            <input type="hidden" name="suggestion" value={suggestion} />
          )}
        </AnswerChoices>
      </DetailPage>,
    ),
  }
}

export function retryArticleVote(
  a: Article,
  token: string,
  helpful: 'yes' | 'no',
  suggestion?: string,
) {
  const choice = helpful === 'yes' ? 'はい' : 'いいえ'
  return {
    title: a.title,
    status: 409 as const,
    html: String(
      <DetailPage title={a.title}>
        <Notice kind="error">
          記事の評価の受付期限が過ぎました。選択した回答をもう一度お送りください。
        </Notice>
        <PublicForm action={publicPath(a.product, a.id)}>
          <input type="hidden" name="visit" value={token} />
          {suggestion && (
            <input type="hidden" name="suggestion" value={suggestion} />
          )}
          <Button name="helpful" value={helpful}>
            「{choice}」で送り直す
          </Button>
          <ActionLink variant="ghost" href={publicPath(a.product, a.id)}>
            記事に戻る
          </ActionLink>
        </PublicForm>
      </DetailPage>,
    ),
  }
}

export function articleVoteReceipt(article: Article, helpful: boolean) {
  const title = 'ご回答ありがとうございます'
  return {
    title,
    html: String(
      <DetailPage title={title}>
        <Notice kind="success">記事への評価を受け付けました。</Notice>
        <a href={publicPath(article.product, article.id)}>{article.title}</a>
        {!helpful && (
          <p>記事で解決できなかった内容を、担当者にご相談いただけます。</p>
        )}
      </DetailPage>,
    ),
  }
}
