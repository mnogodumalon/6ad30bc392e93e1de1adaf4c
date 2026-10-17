// Auto-generated. Per-entity form-enhancements config for "Entscheidungen und Freigaben".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorgang", {"row": ["entscheider", "freigabestatus"], "cols": "1fr 1fr"}, "grundlage_anforderungen", {"row": ["beurteilung", "regel"], "cols": "1fr 1fr"}, {"row": ["befugnis_geprueft", "entscheidungsdatum"], "cols": "1fr 1fr"}, "vorschlag", "entscheidung", "begruendung", "unsicherheiten", "folgen"],
  defaults: {
    'freigabestatus': { kind: 'lookup', key: 'offen', label: 'Offen' },
    'entscheidungsdatum': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
