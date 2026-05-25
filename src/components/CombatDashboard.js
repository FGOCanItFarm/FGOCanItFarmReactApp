import React from 'react';
import { Box, Button, Chip, Typography, Tooltip, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { prepareSimInputs } from '../simulation/RunAdapter';
import {
  buildEngineAt, engineSnapshot, legalNextTokens, validateSequence,
  resolveToken, needsTarget, humanizeToken,
} from '../simulation/CommandState';
import '../CombatDashboard.css';

/**
 * FR-7 in-combat dashboard. Enemies on the left (clickable to target an
 * enemyOne action), frontline allies on the right (NP gauge + cooldown pips +
 * NP button), command palette + chips in the middle. Drives everything from the
 * read-only CommandState introspection over a live simInputs (FR-1/3/6).
 */
const CombatDashboard = ({ team, selectedQuest, selectedMysticCode, servantEffects, commands, setCommands }) => {
  const [simInputs, setSimInputs] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  // A pending option awaiting a target pick: { option }.
  const [pending, setPending] = React.useState(null);

  const teamKey = team.map((s) => s.collectionNo || '').join(',');
  const effectsKey = JSON.stringify(servantEffects);
  const questId = selectedQuest?.id ?? null;
  const mcId = selectedMysticCode?.id ?? null;

  // Build live simInputs whenever the team / quest / MC / effects change.
  React.useEffect(() => {
    if (!selectedQuest?._fullData || team.every((s) => !s.collectionNo)) {
      setSimInputs(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const inputs = await prepareSimInputs({ team, selectedQuest, selectedMysticCode, servantEffects });
        if (!cancelled) setSimInputs(inputs);
      } catch (e) {
        if (!cancelled) { setSimInputs(null); setError(e.message || 'Failed to build battle state.'); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamKey, questId, mcId, effectsKey, selectedQuest?._fullData]);

  // Replay the command prefix forward to the live engine (memoised by prefix).
  const { engine, snapshot, options, validation } = React.useMemo(() => {
    if (!simInputs) return { engine: null, snapshot: null, options: [], validation: null };
    const eng = buildEngineAt(simInputs, commands).engine;
    return {
      engine: eng,
      snapshot: engineSnapshot(eng),
      options: legalNextTokens(eng),
      validation: validateSequence(simInputs, commands),
    };
  }, [simInputs, commands]);

  const commit = (token) => { setCommands([...commands, token]); setPending(null); };

  const onOption = (opt) => {
    if (!opt.available) return;
    if (needsTarget(opt)) setPending({ option: opt });
    else commit(resolveToken(opt));
  };

  const onPickAlly = (slot) => {
    if (pending?.option?.targetClass === 'ally') commit(resolveToken(pending.option, { allySlot: slot + 1 }));
  };
  const onPickEnemy = (index1) => {
    if (pending?.option?.targetClass === 'enemyOne') commit(resolveToken(pending.option, { enemyIndex: index1 }));
  };

  const deleteAt = (i) => { setCommands(commands.filter((_, j) => j !== i)); setPending(null); };

  if (!selectedQuest?._fullData) {
    return <Box className="dash dash--empty">Select a quest to open the combat dashboard.</Box>;
  }
  if (loading && !snapshot) {
    return <Box className="dash dash--empty"><CircularProgress size={20} /> Building battle state…</Box>;
  }
  if (error) return <Box className="dash dash--empty dash--error">{error}</Box>;
  if (!snapshot) return <Box className="dash dash--empty">Add a servant to your team to begin.</Box>;

  const pickingAlly = pending?.option?.targetClass === 'ally';
  const pickingEnemy = pending?.option?.targetClass === 'enemyOne';

  return (
    <Box className="dash">
      <Box className="dash__header">
        <Typography variant="subtitle2">
          Wave {snapshot.wave} / {snapshot.totalWaves}
          {snapshot.cleared && <span className="dash__cleared"> · wave clear</span>}
        </Typography>
        {pending && (
          <Chip
            size="small" color="primary" onDelete={() => setPending(null)}
            label={`Pick ${pickingEnemy ? 'an enemy' : 'an ally'} for ${humanizeToken(resolveToken(pending.option, {}), engine)}`}
          />
        )}
      </Box>

      <Box className="dash__grid">
        {/* Enemies (left) */}
        <Box className={`dash__enemies ${pickingEnemy ? 'dash--picking' : ''}`}>
          <Typography variant="overline" className="dash__col-title">Enemies</Typography>
          {snapshot.enemies.map((e) => (
            <Box
              key={e.index}
              className={`enemy ${e.hp <= 0 ? 'enemy--dead' : ''} ${pickingEnemy ? 'enemy--target' : ''}`}
              onClick={() => pickingEnemy && e.hp > 0 && onPickEnemy(e.index)}
            >
              <div className="enemy__row">
                <span className="enemy__name">{e.index}. {e.name}</span>
                <span className="enemy__class">{e.className || ''}</span>
              </div>
              <div className="enemy__hpbar">
                <div className="enemy__hpfill" style={{ width: `${Math.max(0, Math.min(100, (e.hp / e.maxHp) * 100))}%` }} />
              </div>
              <div className="enemy__hptext">{Math.max(0, Math.round(e.hp)).toLocaleString()} / {e.maxHp.toLocaleString()}</div>
            </Box>
          ))}
        </Box>

        {/* Palette + chips (middle) */}
        <Box className="dash__center">
          <Typography variant="overline" className="dash__col-title">Actions</Typography>
          <Box className="dash__palette">
            {options.map((opt) => (
              <Tooltip key={opt.token} title={opt.available ? (humanizeToken(resolveToken(opt, {}), engine)) : (opt.reason || 'unavailable')} arrow>
                <span>
                  <Button
                    size="small"
                    variant={pending?.option?.token === opt.token ? 'contained' : 'outlined'}
                    disabled={!opt.available}
                    className={`palette-btn palette-btn--${opt.kind} palette-btn--${opt.targetClass}`}
                    onClick={() => onOption(opt)}
                  >
                    {opt.label}{!opt.available && opt.reason ? ` (${opt.reason})` : ''}
                  </Button>
                </span>
              </Tooltip>
            ))}
          </Box>

          <Typography variant="overline" className="dash__col-title">Command sequence</Typography>
          <Box className="dash__chips">
            {commands.length === 0 && <span className="dash__hint">No commands yet — pick an action above.</span>}
            {commands.map((tok, i) => {
              const st = validation?.tokenStates[i];
              const cls = st?.failed ? 'chip--failed' : (st && !st.valid ? 'chip--invalidated' : '');
              return (
                <Chip
                  key={`${tok}-${i}`}
                  size="small"
                  className={`cmd-chip ${cls}`}
                  label={humanizeToken(tok, engine)}
                  onDelete={() => deleteAt(i)}
                  deleteIcon={<CloseIcon />}
                />
              );
            })}
          </Box>
          {validation && !validation.ok && (
            <Typography variant="caption" className="dash__warn">
              Token {validation.failedIndex + 1} can’t execute here — fix or remove it (and the greyed ones after).
            </Typography>
          )}
          {commands.length > 0 && (
            <Button size="small" color="secondary" onClick={() => { setCommands([]); setPending(null); }}>Clear all</Button>
          )}
        </Box>

        {/* Allies (right) */}
        <Box className={`dash__allies ${pickingAlly ? 'dash--picking' : ''}`}>
          <Typography variant="overline" className="dash__col-title">Frontline</Typography>
          {snapshot.front.map((s, slot) => (
            <Box
              key={slot}
              className={`ally ${!s ? 'ally--empty' : ''} ${pickingAlly && s ? 'ally--target' : ''}`}
              onClick={() => pickingAlly && s && onPickAlly(slot)}
            >
              {s ? (
                <>
                  <div className="ally__top">
                    {s.faceUrl && <img className="ally__face" src={s.faceUrl} alt={s.name} loading="lazy" />}
                    <span className="ally__name">{s.name}</span>
                  </div>
                  <div className="ally__np">
                    <div className="ally__npfill" style={{ width: `${Math.min(100, s.npGauge)}%` }} />
                    <span className="ally__nptext">{Math.floor(s.npGauge)}%</span>
                  </div>
                  <div className="ally__cds">
                    {s.cooldowns.map((cd, k) => (
                      <span key={k} className={`cd-pip ${cd === 0 ? 'cd-pip--ready' : ''}`}>{cd === 0 ? '✓' : cd}</span>
                    ))}
                  </div>
                </>
              ) : <span className="ally__slot-empty">Empty</span>}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CombatDashboard;
