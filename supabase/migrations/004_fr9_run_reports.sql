-- FR-9: store the mystic code on a saved run (for accurate re-simulation on view)
-- and add a community bug-report table for runs whose re-sim diverges from the
-- stored summary (engine drift) or errors.

-- 1. Persist the mystic code used (nullable; not part of the run-identity key).
ALTER TABLE public.saved_runs ADD COLUMN IF NOT EXISTS mystic_code_id INTEGER;

-- 2. Extend submit_run with the mystic code. The added parameter changes the
--    signature, so drop the old 6-arg version first to avoid an overload clash.
DROP FUNCTION IF EXISTS public.submit_run(INTEGER, INTEGER[], SMALLINT[], SMALLINT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public.submit_run(
    p_quest_id               INTEGER,
    p_servant_collection_nos INTEGER[],
    p_np_levels              SMALLINT[],
    p_total_np_cost          SMALLINT,
    p_token_string           TEXT,
    p_wave_results           JSONB,
    p_mystic_code_id         INTEGER DEFAULT NULL
) RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
AS $$
    INSERT INTO public.saved_runs (
        quest_id, servant_collection_nos, np_levels,
        total_np_cost, token_string, wave_results, mystic_code_id
    ) VALUES (
        p_quest_id, p_servant_collection_nos, p_np_levels,
        p_total_np_cost, p_token_string, p_wave_results, p_mystic_code_id
    )
    ON CONFLICT ON CONSTRAINT uq_run_key DO UPDATE
        SET token_string   = EXCLUDED.token_string,
            wave_results   = EXCLUDED.wave_results,
            total_np_cost  = EXCLUDED.total_np_cost,
            mystic_code_id = EXCLUDED.mystic_code_id,
            submitted_at   = now()
        WHERE EXCLUDED.total_np_cost < saved_runs.total_np_cost;
$$;

GRANT EXECUTE ON FUNCTION public.submit_run(
    INTEGER, INTEGER[], SMALLINT[], SMALLINT, TEXT, JSONB, INTEGER
) TO anon;

-- 3. Community bug reports for diverging / erroring re-sims.
CREATE TABLE IF NOT EXISTS public.run_reports (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id         UUID REFERENCES public.saved_runs(id) ON DELETE CASCADE,
    quest_id       INTEGER,
    token_string   TEXT,
    reason         TEXT,        -- 'divergence' | 'error' | free text
    stored_summary JSONB,
    fresh_summary  JSONB,
    diffs          JSONB,
    note           TEXT,
    created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.run_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON public.run_reports
    FOR SELECT TO anon USING (true);

CREATE INDEX IF NOT EXISTS run_reports_run_id_idx ON public.run_reports (run_id);

-- RPC for browser clients (writes via SECURITY DEFINER, never direct INSERT).
CREATE OR REPLACE FUNCTION public.submit_run_report(
    p_run_id         UUID,
    p_quest_id       INTEGER,
    p_token_string   TEXT,
    p_reason         TEXT,
    p_stored_summary JSONB,
    p_fresh_summary  JSONB,
    p_diffs          JSONB,
    p_note           TEXT DEFAULT NULL
) RETURNS UUID
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
AS $$
    INSERT INTO public.run_reports (
        run_id, quest_id, token_string, reason,
        stored_summary, fresh_summary, diffs, note
    ) VALUES (
        p_run_id, p_quest_id, p_token_string, p_reason,
        p_stored_summary, p_fresh_summary, p_diffs, p_note
    )
    RETURNING id;
$$;

GRANT EXECUTE ON FUNCTION public.submit_run_report(
    UUID, INTEGER, TEXT, TEXT, JSONB, JSONB, JSONB, TEXT
) TO anon;
