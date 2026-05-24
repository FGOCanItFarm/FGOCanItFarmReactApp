// Community farming tier list (source: AppMedia). Used to rank the Team
// Selection grid so the strongest / most-used servants float to the top.
//
// Matching is intentionally STRICT: a servant is only given a tier when its
// normalised name equals a list entry (or a curated alias). Anything that does
// not match cleanly falls to the "Other" bucket instead of being mis-ranked.
// Once live servant names are available we can extend ALIASES to cover the
// nickname-only entries (Castoria, Koyanskaya, etc.).

export const TIER_ORDER = ['SS', 'S', 'A+', 'A', 'B+', 'Other'];

// Only the farming-relevant upper tiers are encoded by name; lower tiers and
// unmatched servants land in "Other" (sorted by community pick count / id).
const TIERS = {
  SS: ['Oberon', 'U-Olga Marie'],
  S: ['Sakata Kintoki'],
  'A+': [
    'Road Logres', 'Ishtar', 'Nemonoa', 'Light Koyanskaya', 'Morgan',
    'Swimsuit Ibuki Douji', 'Lowhi', 'Lilith', 'Super Bunyan', 'Fantasmoon',
    'Mashu', 'Banyan',
  ],
  A: [
    'Jack de Molay', 'Gilgamesh', 'Napoleon', 'Ptolemy', 'Lancer Artoria',
    'Elisabeth', 'Iskandar', 'Ozymandias', 'Nemo', 'Taikobo', 'Zhuge Liang',
    'Castoria', 'Hanasaki Oji', 'Prelati', 'Tezcatlipoca', 'Arjuna Alter',
    'Swimsuit Castoria', 'Swimsuit Skadi', 'Ashiya Doman', 'Kazuradrop',
    'Swimsuit BB', 'Ciel', 'Dark Koyanskaya', 'Solomon', 'Arash',
  ],
  'B+': [
    'Arthur', 'Sigurd', 'Beni-Enma', 'Orion', 'Tesla', 'Moriarty', 'Durga',
    'Tutankhamun', 'Scathach', 'Karna', 'Brunhilde', 'Swimsuit Tamamo',
    'Enkidu', 'Ereshkigal', 'Drake', 'Queen Maeve', 'Merlin', 'Jack',
    'Vlad III', 'Hijikata Toshizo', 'Swimsuit Musashi', 'Uesugi Kenshin',
    'Jeanne Alter', 'Meltlilith', 'Bazett', 'Arcueid', 'Abigail', 'Voyager',
    'Van Gogh', 'Kukulkan', 'Dante', 'Space Ereshkigal', 'Rama', 'Nitocris',
    'Penthesilea', 'Kriemhild',
  ],
};

// nickname (normalised) -> canonical (normalised). Confident entries only.
const ALIASES = {
  lightkoyanskaya: 'koyanskayaoflight',
  darkkoyanskaya: 'koyanskayaofdarkness',
  castoria: 'artoriacaster',
  swimsuitcastoria: 'summerartoriacaster',
  zhugeliang: 'zhugeliangelmelloiii',
  mashu: 'mashkyrielight',
  nemo: 'captainnemo',
  scathach: 'scathach',
};

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/icon$/, '')
    .replace(/\d*stars?$/, '');

// normalised name -> tier label
const LOOKUP = (() => {
  const map = new Map();
  for (const tier of Object.keys(TIERS)) {
    for (const name of TIERS[tier]) {
      const n = normalize(name);
      if (!map.has(n)) map.set(n, tier);
      const aliased = ALIASES[n];
      if (aliased && !map.has(aliased)) map.set(aliased, tier);
    }
  }
  return map;
})();

// Returns the tier label for a live servant name, or null if unmatched.
export function tierOf(servantName) {
  const n = normalize(servantName);
  if (LOOKUP.has(n)) return LOOKUP.get(n);
  if (ALIASES[n] && LOOKUP.has(ALIASES[n])) return LOOKUP.get(ALIASES[n]);
  return null;
}

const RANK_INDEX = TIER_ORDER.reduce((acc, t, i) => { acc[t] = i; return acc; }, {});

// Numeric rank for sorting; unmatched => "Other" index (last real tier).
export function tierRank(servantName) {
  const t = tierOf(servantName);
  return t ? RANK_INDEX[t] : RANK_INDEX.Other;
}
