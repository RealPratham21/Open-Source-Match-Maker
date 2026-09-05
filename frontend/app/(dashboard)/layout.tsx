import type { ReactNode } from 'react'
import { AppHeader } from '@/components/app-header'
import { DiscoveryProvider } from '@/components/discovery-state'
import { SavedStateProvider } from '@/components/saved-state'
import { displayIdentity, requireUser } from '@/lib/auth'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await requireUser()
  const identity = displayIdentity(profile, user)
  return (
    <div className="min-h-screen bg-background">
      <AppHeader displayName={identity.displayName} avatarUrl={identity.avatarUrl} />
      <DiscoveryProvider>
        <SavedStateProvider>{children}</SavedStateProvider>
      </DiscoveryProvider>
    </div>
  )
}
