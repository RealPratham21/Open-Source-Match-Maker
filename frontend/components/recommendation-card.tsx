import { Bookmark, Check, ExternalLink, GitBranch, Star } from 'lucide-react'
import type { Recommendation } from '@/lib/mock-data'
import { Button, buttonVariants } from '@/components/ui/button'
import { Score } from '@/components/score'
import { cn } from '@/lib/utils'

export function RecommendationCard({
  rec,
  onAnalysis,
  saved,
  onSave,
}: {
  rec: Recommendation
  onAnalysis: () => void
  saved: boolean
  onSave: () => void
}) {
  return (
    <article className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,.03)] transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <GitBranch className="size-3.5" /> {rec.repository.owner} / {rec.repository.name}
          </div>
          <h3 className="font-semibold leading-snug text-foreground">{rec.issue.title}</h3>
        </div>
        <button
          onClick={onSave}
          className={`rounded-md p-2 ${saved ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
          aria-label={saved ? 'Remove from saved' : 'Save issue'}
        >
          <Bookmark className="size-4" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {rec.issue.labels.map((label) => (
          <span key={label} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground">
            {label}
          </span>
        ))}
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{rec.repository.language}</span>
      </div>
      <div className="grid gap-2.5">
        <Score value={rec.analysis.scores['Skill Match']} label="Skill match" />
        <Score value={rec.analysis.scores['Machine Compatibility']} label="Machine fit" />
        <Score value={rec.analysis.scores['Repository Health']} label="Repo health" />
      </div>
      <div className="rounded-lg bg-muted/60 p-3.5">
        <p className="mb-2 text-xs font-medium text-foreground">Why it fits</p>
        <ul className="flex flex-col gap-1.5 text-xs leading-relaxed text-muted-foreground">
          {rec.why.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span>Updated {rec.issue.updated}</span>
        <span className="flex items-center gap-1">
          <Star className="size-3.5" /> {rec.repository.stars}
        </span>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={onAnalysis}>
          View Analysis
        </Button>
        <a
          href={rec.issue.issueUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open on GitHub"
          className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
        >
          <ExternalLink className="size-4" />
        </a>
      </div>
    </article>
  )
}
