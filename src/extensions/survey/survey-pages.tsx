import { AnswerChoices } from '../../ui/public-forms'
import { DetailPage, EditPage, Notice } from '../../ui/patterns'

export function surveyForm(reference: string) {
  return {
    title: '解決アンケート',
    html: String(
      <EditPage
        title="問い合わせは解決しましたか？"
        description={'問い合わせ ' + reference}
      >
        <AnswerChoices name="resolved" question="選んだ回答を送信します" />
      </EditPage>,
    ),
  }
}

export function surveyReceipt(reference: string) {
  return {
    title: '回答を記録しました',
    html: String(
      <DetailPage
        title="ご回答ありがとうございます"
        description={'問い合わせ ' + reference}
      >
        <Notice kind="success">回答を記録しました。</Notice>
      </DetailPage>,
    ),
  }
}
