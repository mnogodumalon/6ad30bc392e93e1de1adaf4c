// Auto-generated. Per-entity form-enhancements config for "Fachliche Beurteilungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["vorgang", "anforderung"], "cols": "1fr 1fr"}, {"row": ["beurteiler", "fachbereich"], "cols": "1fr 1fr"}, {"row": ["gueltigkeitsstatus", "beurteilungsdatum"], "cols": "1fr 1fr"}, "ergebnis", "beurteilungstext", "unsicherheiten"],
  defaults: {
    'gueltigkeitsstatus': { kind: 'lookup', key: 'entwurf', label: 'Entwurf' },
    'beurteilungsdatum': { kind: 'today' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
