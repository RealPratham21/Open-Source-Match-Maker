# Database

This folder holds SQL migrations for contribmatch. The Supabase CLI is not required.

## Apply the profiles migration

1. Open the [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
2. Paste and run `migrations/20260829120000_create_profiles.sql`.
3. Paste and run `migrations/20260829140000_github_discovery_cache.sql`.
4. Confirm `public.profiles`, `public.github_repositories`, `public.github_issues`, and `public.github_repository_analysis` exist with RLS enabled.

If you later link this repo with the Supabase CLI, the same file can be applied with `supabase db push`.
