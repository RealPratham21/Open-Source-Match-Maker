'use client'

import Link from 'next/link'
import { Check, ChevronLeft, CircleHelp, ExternalLink, GitBranch } from 'lucide-react'
import { useDiscovery } from '@/components/discovery-state'
import { buttonVariants } from '@/components/ui/button'
import { Score } from '@/components/score'
import { cn } from '@/lib/utils'

export function AnalysisView({ issueId }: { issueId?: number }) {
  const { recommendations } = useDiscovery()
  const rec = recommendations.find((item) => item.id === issueId)

  if (!rec) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-10">
        <Link href="/discover" className="mb-8 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" /> Back to discover
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Issue not in this session</h1>
        <p className="mt-3 text-sm text-muted-foreground">Run discovery again from Discover, then open the analysis from a card.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-10">
      <Link href="/discover" className="mb-8 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to discover
      </Link>
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <GitBranch className="size-4" /> {rec.repository.owner} / {rec.repository.name}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">{rec.issue.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{rec.match}% Match</span>
            <span className="text-sm text-muted-foreground">Updated {rec.issue.updated}</span>
          </div>
        </div>
        <a href={rec.issue.issueUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: 'outline' }))}>
          Open on GitHub <ExternalLink data-icon="inline-end" />
        </a>
      </div>
      <div className="grid gap-8 py-10 md:grid-cols-[1.25fr_.75fr]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-lg font-semibold">Why this matches you</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{rec.analysis.why}</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Environment requirements</h2>
            <ul className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {rec.analysis.requirements.map((x) => (
                <li key={x} className="flex items-center gap-2 text-muted-foreground">
                  <Check className="size-4 text-primary" /> {x}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">What you&apos;ll learn</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {rec.analysis.learn.map((x) => (
                <span key={x} className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
                  {x}
                </span>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold">Potential challenges</h2>
            <p className="mt-3 rounded-lg bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">{rec.analysis.challenges}</p>
          </section>
        </div>
        <aside className="flex flex-col gap-5">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">Match breakdown</h2>
              <CircleHelp className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-5">
              {Object.entries(rec.analysis.scores).map(([label, value]) => (
                <Score key={label} label={label} value={value} />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Issue snapshot</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <p className="flex justify-between">
                <span className="text-muted-foreground">Difficulty</span>
                <span>{rec.analysis.difficulty}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Estimated scope</span>
                <span>{rec.analysis.scope}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-muted-foreground">Expected time</span>
                <span>{rec.analysis.expectedTime}</span>
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-primary p-5 text-primary-foreground">
            <p className="text-sm font-medium">Ready to contribute?</p>
            <p className="mt-1 text-sm leading-6 opacity-80">This issue is open, active, and sized for your next focused session.</p>
            <a
              href={rec.issue.issueUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants(), 'mt-5 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90')}
            >
              Open issue
            </a>
          </div>
        </aside>
      </div>
    </main>
  )
}
