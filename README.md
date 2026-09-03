# Institute ImpactOS

Community-impact management app for the University of Venda Institute for Rural Development (IRD). React + TypeScript + Vite, backed by Supabase (Postgres, Auth, RLS).

## Local setup

```bash
npm install
npm run dev
```

`.env` already points at the live Supabase project. Never commit a different `.env` with production credentials to a public repo — `.env` is gitignored, but double-check before pushing.

## Creating the first admin account

Every new signup becomes a `student` by default — nobody can grant themselves admin (enforced server-side by `prevent_self_role_escalation`). To promote the first admin:

1. Sign up normally through the app with the account you want to be admin.
2. In the Supabase dashboard for this project → **Table Editor → profiles**, find that row and change `role` from `student` to `admin`.
3. That account can now promote further admins directly from the app's Members page.

## What's already wired up

- Real auth (email/password) via Supabase Auth, with `profiles` auto-created on signup
- Row-level security on every table — students can only see their own reservations/attendance; the org roster (`members`) and write access to activities/projects are admin-only
- Reservations and check-ins go through atomic server-side functions (`reserve_activity`, `confirm_attendance`) that enforce capacity limits and check-in time windows — a student can't reserve a full activity or check in outside the event window, even by calling the API directly
- No mock/demo data — the app starts empty and fills in as real activities, members, and projects are created

## Before going live — recommended next steps


- **Enable leaked-password protection**: Supabase dashboard → Authentication → Policies (flagged by the project's security advisor; one toggle)
- **Custom email templates**: Supabase dashboard → Authentication → Email Templates, so signup/reset emails look like the Institute for Rural Development, not generic Supabase
- **Seed reference data**: `history_events` and `impact_snapshots` are currently empty — add your org's past years' data as an admin so the History and Impact Dashboard pages have something to show
- **Privacy policy / terms**: this app stores student names, student numbers, and attendance records — South African POPIA compliance requires a stated privacy policy and lawful basis for processing before real students sign up
- **Domain + hosting**: deploy the built `dist/` output (e.g. Vercel, Netlify, Cloudflare Pages) with the same `.env` values set as environment variables in that platform's dashboard, not committed to the repo
- **True anti-spoofing for GPS check-ins**: the current `confirm_attendance` function validates the time window server-side but trusts client-reported location; if GPS check-in matters for integrity, that needs a Supabase Edge Function validating device signals (noted in the migration's comments)
