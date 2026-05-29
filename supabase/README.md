# Supabase migrations

SQL migrations for the FGO-can-it-farm database, applied **in numeric order**.

| File | Adds |
|---|---|
| `migrations/001_initial_schema.sql` | `servants`, `quests`, `mystic_codes`, `metadata` + anon read RLS |
| `migrations/002_saved_runs.sql` | `saved_runs` table + 6-arg `submit_run` RPC |
| `migrations/003_face_url_opened_at.sql` | `servants.face_url`, `quests.opened_at` |
| `migrations/004_fr9_run_reports.sql` | **FR-9:** `saved_runs.mystic_code_id`, 7-arg `submit_run`, `run_reports` table, `submit_run_report` RPC |

## How to apply

This project has no `supabase/config.toml` and is not CLI-linked, so migrations
are run **by hand in the Supabase SQL editor**: open each file in order and run
it against the project. (If you later `supabase link` the project,
`supabase db push` will apply them instead.)

> **Ordering matters for 004.** `004` does `DROP FUNCTION` on the 6-arg
> `submit_run` from `002` and recreates it with a 7th `p_mystic_code_id`
> parameter. Apply `002` before `004`.

## FR-9 deployment is required

The app's run-submission and community-bug-report features depend on `004`:

- `src/App.js` `handleSubmitRun` calls the **7-arg** `submit_run` (with
  `p_mystic_code_id`). If only `002` is deployed, every run submission fails with
  a "function does not exist" error.
- `src/components/SearchPage.js` "Report discrepancy" calls `submit_run_report`
  and writes to `run_reports`.

### Verify it's live

Run these read-only checks in the SQL editor:

```sql
-- 7-arg submit_run present? (expect a row with pronargs = 7)
SELECT proname, pronargs FROM pg_proc WHERE proname = 'submit_run';

-- report RPC present?
SELECT proname FROM pg_proc WHERE proname = 'submit_run_report';

-- table + column present?
SELECT to_regclass('public.run_reports');
SELECT column_name FROM information_schema.columns
  WHERE table_name = 'saved_runs' AND column_name = 'mystic_code_id';
```

If any object is missing, run `migrations/004_fr9_run_reports.sql`.
