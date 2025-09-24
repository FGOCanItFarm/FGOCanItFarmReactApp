import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Paper, Typography, Portal, TextField, Checkbox, InputAdornment, useMediaQuery, Drawer, IconButton, MenuItem } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import ServantAvatar from './ServantAvatar';
import '../ui-vars.css';
import '../team-sticky.css';

const StickyTeamBar = ({ team, servants, selectedMysticCode, selectedQuest, servantEffects = [], updateServantEffects = () => {}, activeServant = null, clearActiveServant = () => {} }) => {
  // Start the sticky team bar popped out by default
  const [expanded, setExpanded] = useState(true);
  // hover/popover removed - use explicit info modal instead
  const [editIndex, setEditIndex] = useState(null);
  const [infoIndex, setInfoIndex] = useState(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [editState, setEditState] = useState({
    np: 1,
    initialCharge: 0,
    variant: '',
    level: 90,
    attack: 0,
    atkUp: 0,
    artsUp: 0,
    quickUp: 0,
    busterUp: 0,
    npUp: 0,
    busterDamageUp: 0,
    quickDamageUp: 0,
    artsDamageUp: 0,
    append_5: false,
    ascension: 1
  });
  // probed variant options (ascensions and costumes) for the current servant in the editor
  const [variantOptions, setVariantOptions] = useState([]);
  const isSmall = useMediaQuery('(max-width:600px)');

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  // Hover handlers removed - information is shown via the Info dialog (click)

  // Pointer watcher removed

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setExpanded(false);
    }
  };

  const openEditForIndex = useCallback((index) => {
    const effects = servantEffects[index] || {};

    // Probe the servant JSON for ascensionAdd -> individuality to surface possible variants (ascension keys and costumes)
    const slot = team && team[index] ? team[index] : null;
    const serv = slot && slot.collectionNo ? servants.find(s => String(s.collectionNo) === String(slot.collectionNo)) : null;
    const options = [];
    try {
      const individuality = serv?.ascensionAdd?.individuality || {};
      const asc = individuality.ascension || {};
      Object.keys(asc).forEach(key => {
        const traits = Array.isArray(asc[key]) ? asc[key].map(t => t.name || t) : [];
        options.push({ id: `asc:${key}`, label: `Ascension ${key}`, traits });
      });
      const cost = individuality.costume || {};
      Object.keys(cost).forEach(key => {
        const traits = Array.isArray(cost[key]) ? cost[key].map(t => t.name || t) : [];
        options.push({ id: `costume:${key}`, label: `Costume ${key}`, traits });
      });
    } catch (err) {
      // ignore probing errors
    }
    setVariantOptions(options);

    // If backend stored only variantId (e.g. "800190"), map it to the option id if possible
    let initialVariant = '';
    if (effects.variant) initialVariant = effects.variant;
    else if (effects.variantId) {
      // try to find matching option id prefix (costume or asc)
      const vid = String(effects.variantId);
      const found = options.find(o => o.id.endsWith(`:${vid}`));
      initialVariant = found ? found.id : vid; // fallback to raw id
    } else {
      initialVariant = options.length ? options[0].id : '';
    }

    setEditState({
      np: effects.np || 1,
      initialCharge: effects.initialCharge || 0,
      variant: initialVariant,
      level: effects.level || 90,
      attack: effects.attack || 0,
      atkUp: effects.atkUp || 0,
      artsUp: effects.artsUp || 0,
      quickUp: effects.quickUp || 0,
      busterUp: effects.busterUp || 0,
      npUp: effects.npUp || 0,
      busterDamageUp: effects.busterDamageUp || 0,
      quickDamageUp: effects.quickDamageUp || 0,
      artsDamageUp: effects.artsDamageUp || 0,
      append_5: (effects.append_5 !== undefined) ? !!effects.append_5 : (!!effects.append5 || false),
      ascension: effects.ascension || 1
    });
    setEditIndex(index);
  }, [servantEffects, servants, team]);

  // If an activeServant index is provided (selected elsewhere), open the editor for that slot
  useEffect(() => {
    if (activeServant !== null && typeof activeServant !== 'undefined') {
      // Ensure within bounds
      if (activeServant >= 0 && activeServant < 6) {
        openEditForIndex(activeServant);
        // Clear the active selection in parent to avoid reopening repeatedly
        try {
          clearActiveServant();
        } catch (e) {
          // ignore
        }
      }
    }
  }, [activeServant, openEditForIndex, clearActiveServant]);

  // Listen for a global open-edit event (dispatched by TwoTeamView) to open editor immediately
  useEffect(() => {
    const handler = (e) => {
      const idx = e?.detail?.index;
      if (typeof idx === 'number' && idx >= 0 && idx < 6) {
        openEditForIndex(idx);
      }
    };
    window.addEventListener('fgocif:open-edit', handler);
    return () => window.removeEventListener('fgocif:open-edit', handler);
  }, [openEditForIndex]);

  // No hover timers anymore; keep a no-op cleanup
  useEffect(() => () => {}, []);

  const closeEdit = () => {
    setEditIndex(null);
    setEditState({
      np: 1,
      initialCharge: 0,
      attack: 0,
      atkUp: 0,
      artsUp: 0,
      quickUp: 0,
      busterUp: 0,
      npUp: 0,
      busterDamageUp: 0,
      quickDamageUp: 0,
      artsDamageUp: 0,
      append_5: false,
      ascension: 1
    });
  };

  const saveEdit = () => {
    try {
      // Guard: ensure we have a valid edit index
      if (editIndex === null || typeof editIndex === 'undefined') {
        // nothing to save; close editor
        // eslint-disable-next-line no-console
        console.warn('saveEdit called but editIndex is null');
        closeEdit();
        return;
      }
      // Validate and sanitize numeric inputs
      const clamp = (v, min, max) => Math.max(min, Math.min(max, Number.isNaN(Number(v)) ? 0 : Number(v)));
      const np = Math.round(clamp(editState.np, 1, 5));
      const initialCharge = clamp(editState.initialCharge, 0, 10000);
      const attack = clamp(editState.attack, 0, 10000);
  const level = clamp(editState.level, 1, 120);
      const atkUp = clamp(editState.atkUp, 0, 100);
      const artsUp = clamp(editState.artsUp, 0, 100);
      const quickUp = clamp(editState.quickUp, 0, 100);
      const busterUp = clamp(editState.busterUp, 0, 100);
      const npUp = clamp(editState.npUp, 0, 100);
      const busterDamageUp = clamp(editState.busterDamageUp, 0, 100);
      const quickDamageUp = clamp(editState.quickDamageUp, 0, 100);
      const artsDamageUp = clamp(editState.artsDamageUp, 0, 100);
  const append5bool = !!editState.append_5;
  const ascension = Math.max(1, Math.min(3, Math.round(Number(editState.ascension) || 1)));
  const variant = typeof editState.variant === 'string' ? editState.variant : '';
  // only send the variantId portion (after the colon) to the API/backend
  const variantId = variant && variant.indexOf(':') !== -1 ? variant.split(':', 2)[1] : variant || '';

      // Persist all fields in a single merged payload to avoid sequential update race conditions
      const payload = {
        np,
        initialCharge,
        level,
        attack,
        atkUp,
        artsUp,
        quickUp,
        busterUp,
        npUp,
        busterDamageUp,
        quickDamageUp,
        artsDamageUp,
        append_5: append5bool,
        append5: append5bool,
        ascension,
        variantId
      };
      // Debug: log values we're about to persist
      // eslint-disable-next-line no-console
      console.debug('saveEdit: index=', editIndex, payload);
      updateServantEffects(editIndex, payload);
    } catch (err) {
      // Shouldn't reach here — validation above avoids parse errors. Still, store raw values defensively.
      updateServantEffects(editIndex, { rawEditState: JSON.stringify(editState) });
    }
    closeEdit();
  };

  const mysticCodeNames = {
    410: 'Winter Casual',
    210: 'Chaldea Uniform - Decisive Battle',
    100: 'A Fragment of 2004',
    40: 'Atlas Institute Uniform',
    20: 'Chaldea Combat Uniform'
  };

  return (
    <>
      <div className="sticky-team-control">
        <Button
          variant="contained"
          color="primary"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`sticky-team-toggle lava ${!expanded ? 'pulse' : ''}`}
          aria-label={expanded ? "Minimize team view" : "Expand team view"}
          aria-expanded={expanded}
        >
          Team {expanded ? '▼' : '▲'}
        </Button>
      </div>

      {expanded && (
        <Portal>
          <Paper 
            className="sticky-team-panel"
            elevation={8}
            role="dialog"
            aria-label="Team overview panel"
            tabIndex={-1}
            onKeyDown={handleKeyDown}
          >
            <Box className="sticky-team-content">
              <div className="sticky-team-grid">
                {team.slice(0, 6).map((servantObj, index) => {
                  const servant = servants?.find(s => s.collectionNo === servantObj.collectionNo);
                  
                    return (
                    <div 
                      key={index}
                      className="sticky-servant-slot"
                      data-index={index}
                      aria-label={servant ? `${servant.name} in position ${index + 1}` : `Empty slot ${index + 1}`}
                    >
                      {servant ? (
                        <div className="sticky-servant-avatar" role="button" tabIndex={0} aria-label={`Edit stats for slot ${index + 1}`}>
                          <ServantAvatar
                            servantFace={servant.extraAssets?.faces?.ascension?.['4']}
                            bgType={servant.noblePhantasms?.[0]?.card}
                            tagType={servant.noblePhantasms?.[0]?.effectFlags?.[0]}
                          />
                          <IconButton size="small" aria-label={`Info slot ${index + 1}`} sx={{ position: 'absolute', top: 6, left: 6, zIndex: 30, bgcolor: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', '&:hover': { transform: 'scale(1.08)' } }} onClick={(e) => { e.stopPropagation(); setInfoIndex(index); setInfoPanelOpen(true); }}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" aria-label={`Edit slot ${index + 1}`} sx={{ position: 'absolute', top: 6, right: 6, zIndex: 30, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', '&:hover': { transform: 'scale(1.08)' } }} onClick={(e) => { e.stopPropagation(); openEditForIndex(index); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </div>
                      ) : (
                        <div className="sticky-servant-empty" role="button" tabIndex={0} aria-label={`Edit stats for empty slot ${index + 1}`}>
                          <Typography variant="caption">{index + 1}</Typography>
                          <IconButton size="small" aria-label={`Info empty slot ${index + 1}`} sx={{ position: 'absolute', top: 6, left: 6, zIndex: 30, bgcolor: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }} onClick={(e) => { e.stopPropagation(); setInfoIndex(index); setInfoPanelOpen(true); }}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" aria-label={`Edit empty slot ${index + 1}`} sx={{ position: 'absolute', top: 6, right: 6, zIndex: 30, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)' }} onClick={(e) => { e.stopPropagation(); openEditForIndex(index); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="sticky-team-info">
                <div className="info-pill mystic-code-pill">
                  <Typography variant="caption">
                    MC: {selectedMysticCode ? mysticCodeNames[selectedMysticCode] || `ID: ${selectedMysticCode}` : 'None'}
                  </Typography>
                </div>
                <div className="info-pill quest-pill">
                  <Typography variant="caption">
                    Quest: {selectedQuest?.name || 'None'}
                  </Typography>
                </div>
              </div>
            </Box>
          </Paper>
        </Portal>
      )}

      {/* Hover popover removed; use Info dialog instead */}

      {/* Responsive editor: Drawer on small screens, fixed Paper on desktop */}

      {/* Info panel opened by InfoIcon on each slot (non-modal) */}
      {infoPanelOpen && (() => {
        const idx = infoIndex;
        const slot = team && typeof idx === 'number' && team[idx] ? team[idx] : null;
        const serv = slot && slot.collectionNo ? servants.find(s => String(s.collectionNo) === String(slot.collectionNo)) : null;
        const effects = (typeof idx === 'number') ? (servantEffects[idx] || {}) : {};

        const PanelContent = (
          <Box sx={{ p: 2, width: '100%' }}>
            {(() => {
              if (typeof idx !== 'number') return <Typography variant="body2">No unit selected</Typography>;
              if (!serv) return <Typography variant="body2">Empty slot</Typography>;
              return (
                <>
                  <Typography variant="h6">{serv.name}</Typography>
                  <Typography variant="body2"><strong>Class:</strong> {serv.className || serv.class || '—'}</Typography>
                  <Typography variant="body2"><strong>Rarity:</strong> {serv.rarity ?? '—'}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">Extras</Typography>
                    <Box component="ul" sx={{ pl: 2, mt: 0 }}>
                      {(() => {
                        const keys = Object.keys(effects).filter(k => k !== 'rawEditState');
                        if (keys.length === 0) return <li><Typography variant="body2">No extras set</Typography></li>;
                        return keys.map(k => (<li key={k}><Typography variant="body2">{k}: {String(effects[k])}</Typography></li>));
                      })()}
                    </Box>
                  </Box>
                </>
              );
            })()}
            <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => setInfoPanelOpen(false)}>Close</Button>
            </Box>
          </Box>
        );

        if (isSmall) {
          return (
            <Drawer anchor="bottom" open={infoPanelOpen} onClose={() => setInfoPanelOpen(false)} PaperProps={{ sx: { p: 0 } }}>
              {PanelContent}
            </Drawer>
          );
        }

        return (
          <Paper className="sticky-editor-paper" elevation={6} sx={{ position: 'fixed', right: 220, bottom: 120, width: 420, zIndex: 1400 }}>
            {PanelContent}
          </Paper>
        );
      })()}
      {editIndex !== null && (() => {

        const EditorContent = (
          <Box sx={{ p: 2, width: '100%' }}>
            {(() => {
              const idx = editIndex;
              const slot = team && team[idx] ? team[idx] : null;
              const serv = slot && slot.collectionNo ? servants.find(s => String(s.collectionNo) === String(slot.collectionNo)) : null;
              const title = `Edit Unit Extras - Slot ${idx !== null ? idx + 1 : ''}${serv ? `: ${serv.name}` : ''}`;
              return <Typography variant="h6" gutterBottom>{title}</Typography>;
            })()}

            <Box display="flex" gap={1} flexWrap="wrap">
              <TextField
                label="NP"
                type="number"
                inputProps={{ min: 1, max: 5 }}
                value={editState.np}
                onChange={(e) => setEditState(s => ({ ...s, np: e.target.value }))}
                size="small"
                sx={{ width: 100 }}
              />

              <TextField
                label="Initial Charge"
                type="number"
                value={editState.initialCharge}
                onChange={(e) => setEditState(s => ({ ...s, initialCharge: e.target.value }))}
                size="small"
                sx={{ width: 160 }}
              />

              <TextField
                label="Attack"
                type="number"
                value={editState.attack}
                onChange={(e) => setEditState(s => ({ ...s, attack: e.target.value }))}
                size="small"
                sx={{ width: 160 }}
              />
              <TextField
                label="Level"
                type="number"
                inputProps={{ min: 1, max: 120 }}
                value={editState.level}
                onChange={(e) => setEditState(s => ({ ...s, level: e.target.value }))}
                size="small"
                sx={{ width: 120 }}
              />
            </Box>

            <Box mt={1} display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1}>
              <TextField
                label="ATK %"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={editState.atkUp}
                onChange={(e) => setEditState(s => ({ ...s, atkUp: e.target.value }))}
                size="small"
              />
              <TextField
                label="Arts %"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={editState.artsUp}
                onChange={(e) => setEditState(s => ({ ...s, artsUp: e.target.value }))}
                size="small"
              />
              <TextField
                label="Quick %"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={editState.quickUp}
                onChange={(e) => setEditState(s => ({ ...s, quickUp: e.target.value }))}
                size="small"
              />
              <TextField
                label="Buster %"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={editState.busterUp}
                onChange={(e) => setEditState(s => ({ ...s, busterUp: e.target.value }))}
                size="small"
              />
              <TextField
                label="NP %"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={editState.npUp}
                onChange={(e) => setEditState(s => ({ ...s, npUp: e.target.value }))}
                size="small"
              />
              <TextField
                label="Buster DMG %"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={editState.busterDamageUp}
                onChange={(e) => setEditState(s => ({ ...s, busterDamageUp: e.target.value }))}
                size="small"
              />
              <TextField
                label="Quick DMG %"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={editState.quickDamageUp}
                onChange={(e) => setEditState(s => ({ ...s, quickDamageUp: e.target.value }))}
                size="small"
              />
              <TextField
                label="Arts DMG %"
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                value={editState.artsDamageUp}
                onChange={(e) => setEditState(s => ({ ...s, artsDamageUp: e.target.value }))}
                size="small"
              />
            </Box>

            <Box mt={1} display="flex" alignItems="center" gap={1}>
              <Checkbox checked={!!editState.append_5} onChange={(e) => setEditState(s => ({ ...s, append_5: e.target.checked }))} />
              <Typography variant="body2">Append5</Typography>
            </Box>

            <Box mt={1} display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">Variant</Typography>
              <TextField
                select
                size="small"
                value={editState.variant}
                onChange={(e) => setEditState(s => ({ ...s, variant: e.target.value }))}
                sx={{ minWidth: 180 }}
              >
                {variantOptions.length === 0 ? (
                  <MenuItem value="">Default</MenuItem>
                ) : (
                  variantOptions.map(opt => (
                    <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
                  ))
                )}
              </TextField>
              {/* compact trait preview for current variant */}
              <Box sx={{ ml: 1, display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                {(() => {
                  const cur = variantOptions.find(v => v.id === editState.variant) || null;
                  if (!cur || !cur.traits || cur.traits.length === 0) return <Typography variant="caption" sx={{ opacity: 0.7 }}>no extra traits</Typography>;
                  return cur.traits.slice(0, 6).map((t, i) => (
                    <Typography key={i} variant="caption" sx={{ background: 'rgba(0,0,0,0.08)', px: 0.5, py: 0.25, borderRadius: 1 }}>{t}</Typography>
                  ));
                })()}
              </Box>
            </Box>

            <Box mt={2} display="flex" gap={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={closeEdit}>Cancel</Button>
              <Button variant="contained" onClick={saveEdit} color="primary">Save</Button>
            </Box>
          </Box>
        );

        if (isSmall) {
          return (
            <Drawer anchor="bottom" open onClose={closeEdit} PaperProps={{ sx: { p: 0 } }}>
              {EditorContent}
            </Drawer>
          );
        }

        return (
          <Paper className="sticky-editor-paper" elevation={6} sx={{ position: 'fixed', right: 220, bottom: 120, width: 420, zIndex: 1400 }}>
            {EditorContent}
          </Paper>
        );
      })()}
    </>
  );
};

export default StickyTeamBar;