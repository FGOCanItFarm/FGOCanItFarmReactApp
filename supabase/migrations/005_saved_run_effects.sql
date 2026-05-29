-- FR-11: persist per-servant effect inputs (attack / initialCharge / card &
-- NP buffs) on a saved run so resimulateSavedRun can reproduce it. Without
-- these the re-sim rebuilds servants at 0 charge and the turn-1 NPs can't fire,
-- surfacing as "invalid token sequence or skill error" on the Verify button.

-- 1. Store the effects array (parallel to servant_collection_nos / np_levels).
ALTER TABLE public.saved_runs ADD COLUMN IF NOT EXISTS servant_effects JSONB NOT NULL DEFAULT '[]';

-- 2. Extend submit_run with the effects. Drop the 7-arg overload first.
DROP FUNCTION IF EXISTS public.submit_run(INTEGER, INTEGER[], SMALLINT[], SMALLINT, TEXT, JSONB, INTEGER);

CREATE OR REPLACE FUNCTION public.submit_run(
    p_quest_id               INTEGER,
    p_servant_collection_nos INTEGER[],
    p_np_levels              SMALLINT[],
    p_total_np_cost          SMALLINT,
    p_token_string           TEXT,
    p_wave_results           JSONB,
    p_mystic_code_id         INTEGER DEFAULT NULL,
    p_servant_effects        JSONB   DEFAULT '[]'
) RETURNS void
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
AS $$
    INSERT INTO public.saved_runs (
        quest_id, servant_collection_nos, np_levels,
        total_np_cost, token_string, wave_results, mystic_code_id, servant_effects
    ) VALUES (
        p_quest_id, p_servant_collection_nos, p_np_levels,
        p_total_np_cost, p_token_string, p_wave_results, p_mystic_code_id, p_servant_effects
    )
    ON CONFLICT ON CONSTRAINT uq_run_key DO UPDATE
        SET token_string    = EXCLUDED.token_string,
            wave_results    = EXCLUDED.wave_results,
            total_np_cost   = EXCLUDED.total_np_cost,
            mystic_code_id  = EXCLUDED.mystic_code_id,
            servant_effects = EXCLUDED.servant_effects,
            submitted_at    = now()
        WHERE EXCLUDED.total_np_cost < saved_runs.total_np_cost;
$$;

GRANT EXECUTE ON FUNCTION public.submit_run(
    INTEGER, INTEGER[], SMALLINT[], SMALLINT, TEXT, JSONB, INTEGER, JSONB
) TO anon;
