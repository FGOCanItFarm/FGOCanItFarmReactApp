import React from 'react';
import { Box, Button, Chip, Typography, Tooltip, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { prepareSimInputs } from '../simulation/RunAdapter';
import {
  buildEngineAt, engineSnapshot, legalNextTokens, validateSequence,
  resolveToken, needsTarget, humanizeToken,
} from '../simulation/CommandState';
import '../CombatDashboard.css';

const fmt = (n) => Math.round(n).toLocaleString();

/** Compact buff pill list (name · value% · turns). */
const Buffs = ({ buffs }) => {
  if (!buffs || buffs.length === 0) return null;
  return (
    <div className="buffs">
      {buffs.map((b, i) => (
        <span key={i} className="buff-pill" title={`${b.name} · value ${b.value} · ${b.turns < 0 ? 'permanent' : b.turns + 't'}`}>
          {b.name}{b.turns >= 0 ? ` ${b.turns}t` : ''}
        </span>
      ))}
    </div>
  );
};

/**
 * FR-7 in-combat dashboard + step-through scrubber. Enemies left, frontline
 * allies right, palette + command chips middle. A cursor lets you view the live
 * battle state (NP gauges, cooldowns, enemy HP, and active buffs) after ANY
 * prefix of the command string — all snapshots are memoised by CommandState.
 */
const CombatDashboard = ({ team, selectedQuest, selectedMysticCode, servantEffects, commands, setCommands }) => {
  const [simInputs, setSimInputs] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [pending, setPending] = React.useState(null);
  // Step cursor: null = end of sequence; otherwise view state after `cursor` tokens.
  const [cursor, setCursor] = React.useState(null);

  const teamKey = team.map((s) => s.collectionNo || '').join(',');
  const effectsKey = JSON.stringify(servantEffects);
  const questId = selectedQuest?.id ?? null;
  const mcId = selectedMysticCode?.id ?? null;

  React.useEffect(() => {
    if (!selectedQuest?._fullData || team.every((s) => !s.collectionNo)) { setSimInputs(null); return; }
    let cancelled = false;
    setLoading(true); setError('');
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

  // Clamp the cursor whenever the command list shrinks/changes.
  const atEnd = cursor === null || cursor >= commands.length;
  const step = atEnd ? commands.length : cursor;

  // Build the engine at the CURSOR prefix (memoised) for the displayed snapshot
  // + legal palette; validate the FULL sequence for chip states.
  const { engine, snapshot, options, validation } = React.useMemo(() => {
    if (!simInputs) return { engine: null, snapshot: null, options: [], validation: null };
    const eng = buildEngineAt(simInputs, commands.slice(0, step)).engine;
    return {
      engine: eng,
      snapshot: engineSnapshot(eng),
      options: legalNextTokens(eng),
      validation: validateSequence(simInputs, commands),
    };
  }, [simInputs, commands, step]);

  // Picking a token branches from the cursor: keep 0..step, append, drop the rest.
  const commit = (token) => { setCommands([...commands.slice(0, step), token]); setCursor(null); setPending(null); };
  const onOption = (opt) => {
    if (!opt.available) return;
    if (needsTarget(opt)) setPending({ option: opt });
    else commit(resolveToken(opt));
  };
  const onPickAlly = (slot) => { if (pending?.option?.targetClass === 'ally') commit(resolveToken(pending.option, { allySlot: slot + 1 })); };
  const onPickEnemy = (index1) => { if (pending?.option?.targetClass === 'enemyOne') commit(resolveToken(pending.option, { enemyIndex: index1 })); };
  // FR-10: click an enemy (outside a pending action) to set the sticky `@N`
  // focus. Branches from the cursor and collapses an immediately-preceding focus.
  const onFocusEnemy = (index1) => {
    const prefix = commands.slice(0, step);
    if (/^@\d+$/.test(prefix[prefix.length - 1] || '')) prefix.pop();
    setCommands([...prefix, `@${index1}`]); setCursor(null); setPending(null);
  };
  const onEnemyClick = (e) => {
    if (pending?.option?.targetClass === 'enemyOne') { if (e.hp > 0) onPickEnemy(e.index); }
    else onFocusEnemy(e.index);
  };

  const deleteAt = (i) => { setCommands(commands.filter((_, j) => j !== i)); setCursor(null); setPending(null); };
  const trimToHere = () => { setCommands(commands.slice(0, step)); setCursor(null); };

  // Project an NP's per-enemy damage WITHOUT committing it: rebuild the engine at
  // (cursor prefix + the NP token) in a throwaway instance (memoised) and diff
  // each enemy's HP against the live snapshot. Lets you compare AoE vs single-
  // target before firing.
  const previewNp = (npToken) => {
    if (!engine) return [];
    const after = buildEngineAt(simInputs, [...commands.slice(0, step), npToken]).engine;
    return engine.enemies.map((e, i) => {
      const hpAfter = after?.enemies[i]?.hp ?? e.hp;
      return { idx: i + 1, name: e.name, dmg: Math.max(0, e.hp - hpAfter), killed: hpAfter <= 0 };
    }).filter((p) => p.dmg > 0);
  };
  const npTooltip = (opt) => {
    const rows = previewNp(resolveToken(opt, {}));
    if (rows.length === 0) return humanizeToken(resolveToken(opt, {}), engine);
    return (
      <Box sx={{ fontSize: '0.72rem' }}>
        <div>{humanizeToken(resolveToken(opt, {}), engine)} — projected:</div>
        {rows.map((p) => (
          <div key={p.idx} style={{ whiteSpace: 'nowrap' }}>
            {p.idx}. {p.name}: {fmt(p.dmg)} {p.killed ? '✓ kill' : ''}
          </div>
        ))}
      </Box>
    );
  };

  if (!selectedQuest?._fullData) return <Box className="dash dash--empty">Select a quest to open the combat dashboard.</Box>;
  if (loading && !snapshot) return <Box className="dash dash--empty"><CircularProgress size={20} /> Building battle state…</Box>;
  if (error) return <Box className="dash dash--empty dash--error">{error}</Box>;
  if (!snapshot) return <Box className="dash dash--empty">Add a servant to your team to begin.</Box>;

  const pickingAlly = pending?.option?.targetClass === 'ally';
  const pickingEnemy = pending?.option?.targetClass === 'enemyOne';
  const stepLabel = step === 0 ? 'Start (before any command)' : humanizeToken(commands[step - 1], engine);

  return (
    <Box className="dash">
      <Box className="dash__header">
        <Typography variant="subtitle2">
          Wave {snapshot.wave} / {snapshot.totalWaves}
          {snapshot.cleared && <span className="dash__cleared"> · wave clear</span>}
        </Typography>
        {/* Step scrubber */}
        <Box className="dash__stepper">
          <Button size="small" disabled={step <= 0} onClick={() => setCursor(Math.max(0, step - 1))}>◀</Button>
          <span className="dash__steplabel">Step {step}/{commands.length}: {stepLabel}</span>
          <Button size="small" disabled={step >= commands.length} onClick={() => setCursor(step + 1)}>▶</Button>
          {!atEnd && <Button size="small" onClick={() => setCursor(null)}>To end</Button>}
          {!atEnd && <Button size="small" color="secondary" onClick={trimToHere}>Trim to here</Button>}
        </Box>
        {pending && (
          <Chip size="small" color="primary" onDelete={() => setPending(null)}
            label={`Pick ${pickingEnemy ? 'an enemy' : 'an ally'} for ${humanizeToken(resolveToken(pending.option, {}), engine)}`} />
        )}
      </Box>

      <Box className="dash__grid">
        {/* Enemies (left) */}
        <Box className={`dash__enemies ${pickingEnemy ? 'dash--picking' : ''}`}>
          <Typography variant="overline" className="dash__col-title">
            Enemies{snapshot.focusEnemyIdx != null && snapshot.enemies[snapshot.focusEnemyIdx]
              ? ` · focus ◎ ${snapshot.enemies[snapshot.focusEnemyIdx].name}` : ''}
          </Typography>
          {snapshot.enemies.map((e) => (
            <Box key={e.index}
              className={`enemy ${e.hp <= 0 ? 'enemy--dead' : ''} ${pickingEnemy ? 'enemy--target' : ''} ${e.focused ? 'enemy--focused' : ''}`}
              title={pickingEnemy ? 'Target this enemy' : 'Click to focus (sticky target)'}
              onClick={() => onEnemyClick(e)}>
              <div className="enemy__row">
                <span className="enemy__name">{e.focused ? '◎ ' : ''}{e.index}. {e.name}</span>
                <span className="enemy__class">{e.className || ''}</span>
              </div>
              <div className="enemy__hpbar">
                <div className="enemy__hpfill" style={{ width: `${Math.max(0, Math.min(100, (e.hp / e.maxHp) * 100))}%` }} />
              </div>
              <div className="enemy__hptext">{fmt(Math.max(0, e.hp))} / {fmt(e.maxHp)}</div>
              <Buffs buffs={e.buffs} />
            </Box>
          ))}
        </Box>

        {/* Palette + chips (middle) */}
        <Box className="dash__center">
          <Typography variant="overline" className="dash__col-title">
            Actions {atEnd ? '' : `(branch from step ${step})`}
          </Typography>
          <Box className="dash__palette">
            {options.map((opt) => (
              <Tooltip key={opt.token}
                title={!opt.available ? (opt.reason || 'unavailable') : (opt.kind === 'np' ? npTooltip(opt) : humanizeToken(resolveToken(opt, {}), engine))}
                arrow>
                <span>
                  <Button size="small"
                    variant={pending?.option?.token === opt.token ? 'contained' : 'outlined'}
                    disabled={!opt.available}
                    className={`palette-btn palette-btn--${opt.kind} palette-btn--${opt.targetClass}`}
                    onClick={() => onOption(opt)}>
                    {opt.label}{!opt.available && opt.reason ? ` (${opt.reason})` : ''}
                  </Button>
                </span>
              </Tooltip>
            ))}
          </Box>

          <Typography variant="overline" className="dash__col-title">Command sequence — click a step to inspect</Typography>
          <Box className="dash__chips">
            <Chip size="small" className={`cmd-chip cmd-step ${step === 0 ? 'cmd-step--active' : ''}`}
              label="Start" onClick={() => setCursor(0)} />
            {commands.map((tok, i) => {
              const st = validation?.tokenStates[i];
              const cls = st?.failed ? 'chip--failed' : (st && !st.valid ? 'chip--invalidated' : '');
              const active = step === i + 1;
              return (
                <Chip key={`${tok}-${i}`} size="small"
                  className={`cmd-chip cmd-step ${cls} ${active ? 'cmd-step--active' : ''}`}
                  label={humanizeToken(tok, engine)}
                  onClick={() => setCursor(i + 1)}
                  onDelete={() => deleteAt(i)}
                  deleteIcon={<CloseIcon />} />
              );
            })}
          </Box>
          {validation && !validation.ok && (
            <Typography variant="caption" className="dash__warn">
              Token {validation.failedIndex + 1} can’t execute here — fix or remove it (and the greyed ones after).
            </Typography>
          )}
          {commands.length > 0 && (
            <Button size="small" color="secondary" onClick={() => { setCommands([]); setCursor(null); setPending(null); }}>Clear all</Button>
          )}
        </Box>

        {/* Allies (right) */}
        <Box className={`dash__allies ${pickingAlly ? 'dash--picking' : ''}`}>
          <Typography variant="overline" className="dash__col-title">Frontline</Typography>
          {snapshot.front.map((s, slot) => (
            <Box key={slot}
              className={`ally ${!s ? 'ally--empty' : ''} ${pickingAlly && s ? 'ally--target' : ''}`}
              onClick={() => pickingAlly && s && onPickAlly(slot)}>
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
                  <Buffs buffs={s.buffs} />
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
