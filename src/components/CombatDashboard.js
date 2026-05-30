import React from 'react';
import { Box, Button, Chip, Typography, Tooltip, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { prepareSimInputs } from '../simulation/RunAdapter';
import {
  buildEngineAt, engineSnapshot, legalNextTokens, validateSequence,
  resolveToken, needsTarget, humanizeToken,
} from '../simulation/CommandState';
import { damageFactors } from '../simulation/damageBreakdown';
import '../CombatDashboard.css';

const fmt = (n) => Math.round(n).toLocaleString();

/** Per-enemy NP damage contribution: labeled multipliers + a marginal bar
 *  (how much the final damage would drop if each factor were removed). */
const NpBreakdown = ({ entry }) => {
  const { factors, base, total } = damageFactors(entry);
  if (!factors.length) return <Box sx={{ fontSize: '0.72rem' }}>{fmt(total)}</Box>;
  const maxDrop = Math.max(...factors.map((f) => Math.abs(f.dropPct)), 0.01);
  return (
    <Box sx={{ fontSize: '0.72rem', minWidth: 220 }}>
      <div style={{ marginBottom: 4 }}>Total <b>{fmt(total)}</b> · base {fmt(base)}</div>
      {factors.map((f, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ width: 104, whiteSpace: 'nowrap' }}>{f.label} ×{f.mult.toFixed(2)}</span>
          <span style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
            <span style={{ display: 'block', height: '100%', width: `${Math.min(100, (Math.abs(f.dropPct) / maxDrop) * 100)}%`,
              background: f.mult >= 1 ? 'var(--color-success)' : 'var(--color-error)' }} />
          </span>
          <span style={{ width: 40, textAlign: 'right' }}>{f.dropPct >= 0 ? '−' : '+'}{Math.abs(f.dropPct * 100).toFixed(0)}%</span>
        </div>
      ))}
    </Box>
  );
};

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

/** Net stat totals (config effects + live buffs) for a frontline servant.
 *  Renders only the stats that differ from their neutral baseline. */
const StatTotals = ({ stats }) => {
  if (!stats) return null;
  const pct = (v) => `${v > 0 ? '+' : ''}${Math.round(v * 100)}%`;
  const items = [
    ['ATK', stats.atkUp], ['Buster', stats.busterUp], ['Arts', stats.artsUp], ['Quick', stats.quickUp],
    ['B.DMG', stats.busterDmgUp], ['A.DMG', stats.artsDmgUp], ['Q.DMG', stats.quickDmgUp],
    ['NP DMG', stats.npDmgUp], ['NP Gen', stats.npGen],
  ].filter(([, v]) => Math.abs(v || 0) >= 0.005);
  if (stats.oc > 1) items.push(['OC', stats.oc]);
  if (!items.length) return null;
  return (
    <div className="ally__stats">
      {items.map(([label, v]) => (
        <span key={label} className="stat-pill" title={`${label} net total`}>
          {label} {label === 'OC' ? `×${v}` : pct(v)}
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

  // Project a ready NP's damage to ONE enemy WITHOUT committing it: rebuild the
  // engine at (cursor prefix + that NP aimed at the enemy) in a throwaway memoised
  // instance, diff the enemy's HP, and read its multiplier breakdown from the FR-8
  // trace. AoE NPs ignore the per-enemy aim (resolveToken returns the bare token).
  const previewNpAt = (npOpt, enemyIdx1) => {
    if (!engine) return null;
    const e = engine.enemies[enemyIdx1 - 1];
    if (!e) return null;
    const token = resolveToken(npOpt, { enemyIndex: enemyIdx1 });
    const after = buildEngineAt(simInputs, [...commands.slice(0, step), token]).engine;
    const hpAfter = after?.enemies[enemyIdx1 - 1]?.hp ?? e.hp;
    const entry = (after?.trace || []).filter((t) => t.type === 'np' && t.target?.index === enemyIdx1 - 1).pop() || null;
    return { dmg: Math.max(0, e.hp - hpAfter), killed: hpAfter <= 0, entry };
  };

  if (!selectedQuest?._fullData) return <Box className="dash dash--empty">Select a quest to open the combat dashboard.</Box>;
  if (loading && !snapshot) return <Box className="dash dash--empty"><CircularProgress size={20} /> Building battle state…</Box>;
  if (error) return <Box className="dash dash--empty dash--error">{error}</Box>;
  if (!snapshot) return <Box className="dash dash--empty">Add a servant to your team to begin.</Box>;

  const pickingAlly = pending?.option?.targetClass === 'ally';
  const pickingEnemy = pending?.option?.targetClass === 'enemyOne';
  const stepLabel = step === 0 ? 'Start (before any command)' : humanizeToken(commands[step - 1], engine);
  // Currently-fireable frontline NPs — previewed in every enemy box.
  const readyNps = options.filter((o) => o.kind === 'np' && o.available);

  // FR-3 palette, grouped for legibility: one section per occupied front slot
  // (that servant's skills, then its NP), then Mystic Code, Swaps, End Turn.
  const actionGroups = [];
  [0, 1, 2].forEach((slot) => {
    const s = snapshot.front[slot];
    const opts = options.filter(
      (o) => (o.kind === 'skill' || o.kind === 'np') && o.servantSlot === slot,
    );
    if (!opts.length) return;
    // Skills first, NP last.
    opts.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'np' ? 1 : -1));
    actionGroups.push({ key: `s${slot}`, label: `S${slot + 1} · ${s?.name || 'Servant'}`, options: opts });
  });
  const mcOpts = options.filter((o) => o.kind === 'mc');
  if (mcOpts.length) actionGroups.push({ key: 'mc', label: 'Mystic Code', options: mcOpts });
  const swapOpts = options.filter((o) => o.kind === 'swap');
  if (swapOpts.length) actionGroups.push({ key: 'swap', label: 'Swaps', options: swapOpts });
  const endOpts = options.filter((o) => o.kind === 'endTurn');
  if (endOpts.length) actionGroups.push({ key: 'end', label: 'End Turn', options: endOpts });

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
              {/* Projected NP damage to THIS enemy, per ready NP. Hover a row for
                  the multiplier breakdown. Clicks here don't focus the enemy. */}
              {e.hp > 0 && readyNps.length > 0 && (
                <div className="enemy__nps" onClick={(ev) => ev.stopPropagation()}>
                  {readyNps.map((opt) => {
                    const p = previewNpAt(opt, e.index);
                    if (!p) return null;
                    const who = snapshot.front[opt.servantSlot]?.name || `S${opt.servantSlot + 1}`;
                    return (
                      <Tooltip key={opt.token} arrow placement="right" title={<NpBreakdown entry={p.entry} />}>
                        <div className={`enemy__np-row ${p.killed ? 'enemy__np-row--kill' : ''}`}>
                          <span className="enemy__np-who">S{opt.servantSlot + 1} {who}</span>
                          <span className="enemy__np-dmg">{p.dmg > 0 ? fmt(p.dmg) : '—'}{p.killed ? ' ✓' : ''}</span>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              )}
            </Box>
          ))}
        </Box>

        {/* Palette + chips (middle) */}
        <Box className="dash__center">
          <Typography variant="overline" className="dash__col-title">
            Actions {atEnd ? '' : `(branch from step ${step})`}
          </Typography>
          <Box className="dash__palette">
            {actionGroups.map((g) => (
              <Box key={g.key} className="dash__pgroup">
                <span className="dash__pgroup-label">{g.label}</span>
                <Box className="dash__pgroup-btns">
                  {g.options.map((opt) => (
                    <Tooltip key={opt.token}
                      title={opt.available ? humanizeToken(resolveToken(opt, {}), engine) : (opt.reason || 'unavailable')}
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
              </Box>
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
                  <StatTotals stats={s.stats} />
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
