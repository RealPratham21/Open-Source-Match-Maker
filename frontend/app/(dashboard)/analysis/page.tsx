import { AnalysisView } from '@/components/analysis-view'

export default async function AnalysisPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams
  const id = params.id ? Number(params.id) : undefined
  return <AnalysisView issueId={Number.isFinite(id) ? id : undefined} />
}
