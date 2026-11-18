import { AnswerChoices } from '../../ui/public-forms'
import { DetailPage, EditPage, Notice } from '../../ui/patterns'

export function surveyForm() {
  return {
    title: '解決アンケート',
    html: String(
      <EditPage title="問い合わせは解決しましたか？">
        <AnswerChoices name="resolved" question="回答を選んでください" />
      </EditPage>,
    ),
  }
}

export function surveyReceipt() {
  return {
    title: '回答を記録しました',
    html: String(
      <DetailPage title="ご回答ありがとうございます">
        <Notice kind="success">回答を記録しました。</Notice>
      </DetailPage>,
    ),
  }
}
