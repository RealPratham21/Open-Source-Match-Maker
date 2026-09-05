import type { Recommendation } from '@/lib/mock-data'
import type { CandidateIssue } from './types'

export function candidateToRecommendation(candidate: CandidateIssue): Recommendation {
  const scores = {
    'Skill Match': candidate.preliminary.profileRelevance,
    'Machine Compatibility': candidate.preliminary.machineCompatibility,
    'Repository Health': candidate.preliminary.repoHealth,
  }
  const requirements = [
    ...candidate.environment.languages.map((item) => `${item} project`),
    ...candidate.environment.infrastructure,
    candidate.environment.docker ? 'Docker used in repo' : 'Docker not detected',
    candidate.environment.gpuLikelyRequired ? 'GPU likely required' : 'No GPU required',
  ]

  return {
    id: candidate.issue.id,
    repository: {
      name: candidate.repository.name,
      owner: candidate.repository.owner,
      language: candidate.repository.primaryLanguage ?? 'Unknown',
      stars: formatStars(candidate.repository.stars),
      activity: relativeTime(candidate.repository.lastPushedAt),
      description: candidate.repository.description ?? '',
    },
    issue: {
      id: candidate.issue.id,
      title: candidate.issue.title,
      labels: candidate.issue.labels.slice(0, 4),
      updated: relativeTime(candidate.issue.updatedAt),
      availability: claimLabel(candidate.preliminary.claimStatus),
      issueUrl: candidate.issue.url,
    },
    match: Math.round(
      candidate.preliminary.profileRelevance * 0.4 +
        candidate.preliminary.repoHealth * 0.3 +
        candidate.preliminary.machineCompatibility * 0.2 +
        (candidate.preliminary.claimStatus === 'available' ? 10 : candidate.preliminary.claimStatus === 'possibly_claimed' ? 4 : 7),
    ),
    why: whyBullets(candidate),
    stack: [...candidate.environment.languages, ...candidate.environment.technologies].slice(0, 6),
    analysis: {
      why: 'Detailed match analysis will be generated during ranking. The scores below come from GitHub activity, your profile, and repository setup files.',
      scores,
      difficulty: 'Intermediate',
      scope: 'Not estimated yet',
      expectedTime: 'Not estimated yet',
      requirements,
      skills: candidate.environment.languages,
      learn: ['Detailed learning notes will be generated during ranking.'],
      challenges: 'Detailed challenge analysis will be generated during ranking.',
      health: [`Last push: ${relativeTime(candidate.repository.lastPushedAt)}`, `Stars: ${formatStars(candidate.repository.stars)}`],
      availability: [claimLabel(candidate.preliminary.claimStatus)],
    },
  }
}

function whyBullets(candidate: CandidateIssue) {
  const bullets: string[] = []
  if (candidate.repository.primaryLanguage) bullets.push(`Repository language: ${candidate.repository.primaryLanguage}`)
  if (candidate.preliminary.claimStatus === 'available') bullets.push('No assignee detected')
  if (candidate.preliminary.claimStatus === 'possibly_claimed') bullets.push('Someone may already be working on this')
  if (!candidate.environment.gpuLikelyRequired) bullets.push('No GPU requirement detected in setup files')
  bullets.push('Detailed match analysis will be generated during ranking.')
  return bullets.slice(0, 3)
}

function claimLabel(status: CandidateIssue['preliminary']['claimStatus']) {
  if (status === 'assigned') return 'Assigned'
  if (status === 'possibly_claimed') return 'Possibly claimed'
  if (status === 'available') return 'No active assignee'
  return 'Availability unknown'
}

function formatStars(stars: number) {
  if (stars >= 1000) return `${(stars / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(stars)
}

function relativeTime(iso: string) {
  const delta = Date.now() - new Date(iso).getTime()
  const hours = Math.round(delta / 36e5)
  if (hours < 24) return `${Math.max(1, hours)} hours ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  const months = Math.round(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}
