import { Sparkline, type TrendPoint } from './trends'
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
  series,
  format,
}: {
  title: string
  id: string
  value: string
  change: string
  summary: string
  details: string
  series: TrendPoint[]
  format: (value: number) => string
}) {
  return (
    <MetricCard
      title={title}
      value={value}
      trend={<Sparkline series={series} label={title} format={format} />}
      change={change}
      definition={
        <>
          <span>{summary}</span>
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
