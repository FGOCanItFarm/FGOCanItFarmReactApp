import React, { useEffect } from 'react';
import { Box, Button, Typography, TextField, Checkbox, InputAdornment } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import '../ui-vars.css';
import '../team-sticky.css';

const MYSTIC_CODE_NAMES = {
  410: 'Winter Casual',
  210: 'Chaldea Uniform - Decisive Battle',
  100: 'A Fragment of 2004',
  40: 'Atlas Institute Uniform',
  20: 'Chaldea Combat Uniform',
};

const FLAT_FIELDS = [
  { key: 'initialCharge', label: 'Initial Charge', desc: 'Starting NP gauge (%)', max: 10000 },
  { key: 'attack',        label: 'Attack',         desc: 'Flat attack bonus',     max: 10000 },
];

const PCT_FIELDS = [
  { key: 'atkUp',          label: 'ATK',        desc: 'Attack up buff' },
  { key: 'npUp',           label: 'NP Gen',     desc: 'NP generation up' },
  { key: 'artsUp',         label: 'Arts',       desc: 'Arts card up' },
  { key: 'busterUp',       label: 'Buster',     desc: 'Buster card up' },
  { key: 'quickUp',        label: 'Quick',      desc: 'Quick card up' },
  { key: 'artsDamageUp',   label: 'Arts DMG',   desc: 'Arts damage up' },
  { key: 'busterDamageUp', label: 'Buster DMG', desc: 'Buster damage up' },
  { key: 'quickDamageUp',  label: 'Quick DMG',  desc: 'Quick damage up' },
];

// Always-visible team panel docked to the right. Clicking a slot selects it for
// both stat editing (here) and skill commands (Command Input page). Editing
// writes through immediately. With no units it stays mounted and explains each
// field instead of crashing; the first added unit is auto-selected by App.
const StickyTeamBar = ({
  team = [],
  servants = [],
  selectedMysticCode,
  selectedQuest,
  servantEffects = [],
  updateServantEffects = () => {},
  selectedSlot = 0,
  setSelectedSlot = () => {},
}) => {
  const slotServant = (idx) => {
    const s = team[idx];
    return s && s.collectionNo ? servants.find(x => String(x.collectionNo) === String(s.collectionNo)) : null;
  };

  const safeSlot = (selectedSlot >= 0 && selectedSlot < 6) ? selectedSlot : 0;
  const servant = slotServant(safeSlot);
  const effects = servantEffects[safeSlot] || {};
  const editable = !!servant;

  // Keep the selection on a filled slot when possible.
  useEffect(() => {
    const firstFilled = team.findIndex(s => s?.collectionNo);
    if (firstFilled === -1) return;
    const cur = team[safeSlot];
    if (!cur || !cur.collectionNo) setSelectedSlot(firstFilled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  const set = (field, value) => { if (editable) updateServantEffects(safeSlot, { [field]: value }); };
  const num = (v) => (Number.isNaN(Number(v)) ? 0 : Number(v));

  const npLevel = effects.np ?? effects.npLevel ?? 1;
  const append5 = effects.append_5 !== undefined ? !!effects.append_5 : !!effects.append5;
  const mode = effects.mode || effects.formMode || 1;

  return (
    <aside className="team-panel" aria-label="Team panel">
      <Typography variant="subtitle2" className="team-panel-title">Team</Typography>

      <div className="team-panel-body">
        {/* Vertical slot column */}
        <div className="team-panel-slots">
          {team.slice(0, 6).map((slot, index) => {
            const serv = slotServant(index);
            const selected = safeSlot === index;
            return (
              <div
                key={index}
                className={`team-panel-slot ${selected ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={serv ? `${serv.name} (slot ${index + 1})` : `Empty slot ${index + 1}`}
                onClick={() => setSelectedSlot(index)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedSlot(index); } }}
              >
                <span className="team-panel-slot-num">{index + 1}</span>
                {serv
                  ? <ServantAvatar servantFace={serv.face_url} bgType={serv.np_card} />
                  : <div className="team-panel-slot-empty" />}
              </div>
            );
          })}
        </div>

        {/* Editor / explanation for the selected slot */}
        <div className="team-panel-editor">
          {editable ? (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{servant.name}</Typography>
              <Typography variant="caption" sx={{ color: 'var(--color-text-dim)', display: 'block', mb: 1 }}>
                {(() => {
                  // Mash (collectionNo 1) is a 5★ Paladin once ascended; the base
                  // Atlas data still lists her as a 4★ Shielder.
                  const isMash = String(servant.collectionNo) === '1';
                  const raw = servant.className || servant.class_name || '';
                  const cls = isMash ? 'Paladin' : (raw ? raw[0].toUpperCase() + raw.slice(1) : '');
                  const rarity = isMash ? 5 : servant.rarity;
                  return `${cls}${rarity != null ? `  ·  ${rarity}★` : ''}`;
                })()}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" sx={{ color: 'var(--color-text-dim)', mb: 1 }}>
              No unit in this slot. Add a servant from Team Selection to edit its NP level and buffs — the values below show what each field controls.
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              label="NP Lv" type="number" size="small" disabled={!editable}
              inputProps={{ min: 1, max: 5 }}
              value={editable ? npLevel : ''}
              placeholder="1–5"
              onChange={(e) => set('np', Math.max(1, Math.min(5, num(e.target.value) || 1)))}
              sx={{ width: 86 }}
            />
            {FLAT_FIELDS.map(f => (
              <TextField
                key={f.key}
                label={f.label} type="number" size="small" disabled={!editable}
                value={editable ? (effects[f.key] ?? 0) : ''}
                placeholder={f.desc}
                helperText={!editable ? f.desc : undefined}
                onChange={(e) => set(f.key, Math.max(0, Math.min(f.max, num(e.target.value))))}
                sx={{ flex: 1 }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            {PCT_FIELDS.map(f => (
              <TextField
                key={f.key}
                label={f.label} type="number" size="small" disabled={!editable}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={editable ? (effects[f.key] ?? 0) : ''}
                placeholder={f.desc}
                helperText={!editable ? f.desc : undefined}
                onChange={(e) => set(f.key, Math.max(0, Math.min(100, num(e.target.value))))}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <Checkbox size="small" disabled={!editable} checked={editable && append5}
              onChange={(e) => updateServantEffects(safeSlot, { append_5: e.target.checked, append5: e.target.checked })} />
            <Typography variant="body2" sx={{ color: editable ? undefined : 'var(--color-text-dim)' }}>
              Append 5 (extra starting NP gauge)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: editable ? undefined : 'var(--color-text-dim)' }}>Form</Typography>
            {[1, 2, 3].map(m => (
              <Button key={m} size="small" disabled={!editable}
                variant={editable && mode === m ? 'contained' : 'outlined'}
                onClick={() => set('mode', m)} sx={{ minWidth: 34 }}>
                {m}
              </Button>
            ))}
          </Box>
        </div>
      </div>

      <div className="team-panel-info">
        <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-dim)' }}>
          MC: {selectedMysticCode ? (MYSTIC_CODE_NAMES[selectedMysticCode] || `ID ${selectedMysticCode}`) : 'None'}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-dim)' }} noWrap>
          Quest: {selectedQuest?.name || 'None'}
        </Typography>
      </div>
    </aside>
  );
};

export default StickyTeamBar;
