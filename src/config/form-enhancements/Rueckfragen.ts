// Auto-generated. Per-entity form-enhancements config for "Rückfragen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorgang", "adressat", {"row": ["status", "buendelkennung"], "cols": "1fr 1fr"}, "anforderungen", {"row": ["alter_wert", "neuer_wert"], "cols": "1fr 1fr"}, "antwortdatum", "fragetext", "antwort"],
  defaults: {
    'status': { kind: 'lookup', key: 'vorbereitet', label: 'Vorbereitet' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
