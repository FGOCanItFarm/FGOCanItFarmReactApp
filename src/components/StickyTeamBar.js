import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, TextField, Checkbox, InputAdornment, Select, MenuItem } from '@mui/material';
import ServantAvatar from './ServantAvatar';
import { supabase } from '../supabaseClient';
import '../ui-vars.css';
import '../team-sticky.css';

// Fallback used only if the live mystic_codes fetch fails (offline / misconfig).
const MYSTIC_CODE_NAMES = {
  410: 'Winter Casual',
  210: 'Chaldea Uniform - Decisive Battle',
  100: 'A Fragment of 2004',
  40: 'Atlas Institute Uniform',
  20: 'Chaldea Combat Uniform',
};

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');

// Structural/derived traits that just add noise to an identity card (class,
// gender, attribute, alignment, rarity, plumbing). Everything else is a
// "meaningful" trait worth showing (divine, dragon, fae, riding, king, …).
const STRUCTURAL_TRAIT = (name) =>
  !name ||
  /^(class|attribute|alignment|gender)/.test(name) ||
  /StarServant$/.test(name) ||
  ['servant', 'unknown', 'canBeInBattle', 'hasCostume', 'standardClassServant',
   'skyOrEarthServant', 'skyOrEarthExceptPseudoAndDemiServant', 'humanoid',
   'hominidaeServant', 'weakToEnumaElish', 'genderUnknown'].includes(name);

const traitNames = (arr) => (arr || []).map(t => (typeof t === 'string' ? t : t?.name)).filter(Boolean);
const meaningful = (names) => names.filter(n => !STRUCTURAL_TRAIT(n));

const formLabel = (form, i) => form.label || (form.isBase ? 'Base form' : `Form ${i + 1}`);

/**
 * Identity summary for the team panel, driven by the derived `data.forms[]`
 * (distinct per-ascension trait/attribute sets from the sync pipeline). Shows
 * attribute, alignment, and the *selected* form's meaningful traits. The form
 * the player selects is fed to the engine (Servant.js formKey) so trait-
 * conditional damage matches what's shown.
 */
function describeIdentity(data, selectedFormKey) {
  if (!data) return null;
  const base = traitNames(data.traits);
  const forms = Array.isArray(data.forms) ? data.forms : [];
  // The engine defaults to the FINAL ascension when no form is picked.
  const defaultForm = forms.find(f => f.final) || (forms.length ? forms[forms.length - 1] : null);
  const active = (selectedFormKey != null && forms.find(f => Number(f.key) === Number(selectedFormKey))) || defaultForm;

  const attribute = cap(active?.attribute || data.attribute || '');
  const alignment = base.filter(n => /^alignment/.test(n)).map(n => cap(n.replace(/^alignment/, ''))).join(' · ');
  const shownTraits = meaningful(active ? (active.traits || []) : base);

  // Only offer a form CHOICE when it actually changes the kit — i.e. the forms
  // fire different NPs. Servants whose traits merely shift at the final
  // ascension (same NP) don't get a confusing picker; they just field final.
  const distinctNps = new Set(forms.map(f => f.npId).filter(v => v != null));
  const togglable = forms.length > 1 && distinctNps.size > 1;

  return { attribute, alignment, traits: shownTraits, forms, multiForm: togglable, defaultForm, active };
}

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
  setSelectedMysticCode = () => {},
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

  // Mystic codes for the picker — loaded from the DB so any saved-run MC (incl.
  // ones outside the hand-picked farming set) resolves to a real option when a
  // run is loaded into the builder. Falls back to the static names on failure.
  const [mcList, setMcList] = useState(
    Object.entries(MYSTIC_CODE_NAMES).map(([id, name]) => ({ id: Number(id), name })),
  );
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('mystic_codes').select('id, name').order('id');
      if (error || cancelled || !data?.length) return;
      setMcList(data.map(r => ({ id: r.id, name: r.name })));
    })();
    return () => { cancelled = true; };
  }, []);
  // Guarantee the current selection is always a present option (e.g. an MC the
  // fetch didn't include), so the dropdown never renders blank for a loaded run.
  const mcOptions = (selectedMysticCode != null && !mcList.some(m => m.id === selectedMysticCode))
    ? [...mcList, { id: selectedMysticCode, name: `Mystic Code ${selectedMysticCode}` }]
    : mcList;

  // Selected servant's trait/attribute data (fetched on demand, cached by
  // collectionNo) for the "Identity" panel — lets users see what each form is.
  const [traitCache, setTraitCache] = useState({});
  const cno = servant?.collectionNo != null ? String(servant.collectionNo) : null;
  useEffect(() => {
    if (!cno || traitCache[cno]) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('servants').select('data').eq('collection_no', Number(cno)).maybeSingle();
      if (error || cancelled) return;
      setTraitCache(prev => ({ ...prev, [cno]: data?.data || {} }));
    })();
    return () => { cancelled = true; };
  }, [cno, traitCache]);
  const identity = describeIdentity(cno ? traitCache[cno] : null, effects.formKey ?? null);

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
  const append5 = effects.append_5 ?? effects.append5 ?? true;

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

          {/* Form picker — only for servants with real ascension/form variation.
              Selecting a form feeds Servant.js (formKey) so the simulation uses
              that form's traits/attribute. Defaults to the base form. */}
          {editable && identity?.multiForm && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>
              <Typography variant="body2">Form</Typography>
              {identity.forms.map((f, i) => {
                const selectedKey = effects.formKey ?? identity.defaultForm?.key;
                return (
                  <Button key={f.key} size="small"
                    variant={Number(selectedKey) === Number(f.key) ? 'contained' : 'outlined'}
                    onClick={() => set('formKey', f.key)} sx={{ textTransform: 'none' }}>
                    {formLabel(f, i)}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Identity — fills the gap above the Mystic Code picker so users can
              eyeball attribute / alignment / traits of the active form without
              leaving the builder. */}
          {editable && identity && (
            <div className="team-panel-identity">
              <Typography variant="caption" className="ident-label">Identity</Typography>
              <div className="ident-rows">
                {identity.attribute && (
                  <div className="ident-row"><span>Attribute</span><b>{identity.attribute}</b></div>
                )}
                {identity.alignment && (
                  <div className="ident-row"><span>Alignment</span><b>{identity.alignment}</b></div>
                )}
              </div>
              {identity.traits.length > 0 && (
                <div className="ident-traits">
                  {identity.traits.map(t => <span key={t} className="ident-trait">{t}</span>)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="team-panel-info">
        <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-dim)', mb: 0.25 }}>
          Mystic Code
        </Typography>
        <Select
          value={selectedMysticCode ?? ''}
          onChange={(e) => setSelectedMysticCode(e.target.value === '' ? null : e.target.value)}
          displayEmpty
          fullWidth
          size="small"
          sx={{ mb: 1, fontSize: '0.78rem' }}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {mcOptions.map((mc) => (
            <MenuItem key={mc.id} value={mc.id} sx={{ fontSize: '0.78rem' }}>{mc.name}</MenuItem>
          ))}
        </Select>
        <Typography variant="caption" sx={{ display: 'block', color: 'var(--color-text-dim)' }} noWrap>
          Quest: {selectedQuest?.name || 'None'}
        </Typography>
      </div>
    </aside>
  );
};

export default StickyTeamBar;
