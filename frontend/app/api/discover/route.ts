import { NextResponse } from 'next/server'
import { discoverCandidateIssues } from '@/lib/github/discovery'
import { DiscoveryError, type DiscoveryProfile } from '@/lib/github/types'
import { candidateToRecommendation } from '@/lib/github/present'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'

export const maxDuration = 60

const EMPTY_PROFILE: DiscoveryProfile = {
  languages: [],
  technologies: [],
  interests: [],
  learning_goals: [],
  contribution_types: [],
  preferred_difficulty: null,
  available_time: null,
  operating_system: null,
  ram_gb: null,
  gpu: null,
  docker_available: null,
  onboarding_completed: false,
}

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in to discover issues.' }, { status: 401 })
  }

  let profile: DiscoveryProfile = EMPTY_PROFILE
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (data) profile = toDiscoveryProfile(data as Profile)
  } catch {
    // Discovery still runs if the profiles table is missing.
  }

  try {
    const candidates = await discoverCandidateIssues(profile, supabase)
    return NextResponse.json({
      candidates,
      recommendations: candidates.map(candidateToRecommendation),
    })
  } catch (error) {
    if (error instanceof DiscoveryError) {
      const status = error.code === 'rate_limit' || error.code === 'github' || error.code === 'missing_token' ? 503 : 400
      return NextResponse.json({ error: error.message, code: error.code }, { status })
    }
    console.info('[discovery] unexpected failure')
    return NextResponse.json({ error: 'Discovery failed. Please try again.' }, { status: 500 })
  }
}

function toDiscoveryProfile(profile: Profile): DiscoveryProfile {
  return {
    languages: profile.languages ?? [],
    technologies: profile.technologies ?? [],
    interests: profile.interests ?? [],
    learning_goals: profile.learning_goals ?? [],
    contribution_types: profile.contribution_types ?? [],
    preferred_difficulty: profile.preferred_difficulty,
    available_time: profile.available_time,
    operating_system: profile.operating_system,
    ram_gb: profile.ram_gb,
    gpu: profile.gpu,
    docker_available: profile.docker_available,
    onboarding_completed: profile.onboarding_completed,
  }
}
