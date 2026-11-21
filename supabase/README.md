# Supabase backend

This directory contains the reproducible local and hosted Supabase configuration for contribmatch.

## Migrations

Migrations run in filename order and currently create:

1. `profiles` plus the GitHub-user profile trigger;
2. shared GitHub repository, issue, and setup-analysis caches;
3. per-user issue state, discovery runs, and recommendation history;
4. recommendation-to-run ownership enforcement.

All exposed tables have row-level security enabled. User-owned rows are restricted with `auth.uid()` ownership predicates, while authenticated users share only the GitHub metadata cache.

## Local stack

From the repository root:

```bash
npx supabase start
```

The CLI applies the migrations automatically. Supabase Studio is available at `http://127.0.0.1:54323` with the default port configuration.

For local GitHub OAuth, create a repository-root `.env` file:

```env
SUPABASE_AUTH_GITHUB_CLIENT_ID=
SUPABASE_AUTH_GITHUB_SECRET=
```

The corresponding GitHub OAuth callback is `http://localhost:54321/auth/v1/callback`.

## Hosted project

Supabase CLI v3 targets the local stack by default. Use the explicit remote flag when deploying:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --remote
```

After the push:

- confirm all tables exist in the Table Editor;
- confirm RLS is enabled for every table in `public`;
- keep `public` exposed through the Data API;
- enable GitHub under Authentication providers;
- add the deployed application URL and `/auth/callback` to Auth URL Configuration;
- run the Database and Security advisors.

Do not commit database passwords, access tokens, OAuth secrets, JWT signing keys, Supabase secret keys, or `service_role` keys.
