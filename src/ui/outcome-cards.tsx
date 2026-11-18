import { Tooltip } from '@/components/PatternTooltip'
import { MetricCard } from './patterns'
import { Button } from './controls'

export function OutcomeCard({
  title,
  id,
  value,
  change,
  summary,
  details,
}: {
  title: string
  id: string
  value: string
  change: string
  summary: string
  details: string
}) {
  return (
    <MetricCard
      title={title}
      value={value}
      change={change}
      definition={
        <>
          {summary}{' '}
          <Tooltip id={'definition-' + id} content={details}>
            <Button type="button" variant="ghost" aria-label={title + 'の定義'}>
              ⓘ
            </Button>
          </Tooltip>
        </>
      }
    />
  )
}
