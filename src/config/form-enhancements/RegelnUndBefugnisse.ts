// Auto-generated. Per-entity form-enhancements config for "Regeln und Befugnisse".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["regelbezeichnung", {"row": ["regelart", "status"], "cols": "1fr 1fr"}, "geltungsbereich", {"row": ["berechtigte_rolle", "berechtigter"], "cols": "1fr 1fr"}, {"row": ["gueltig_ab", "freigabepflicht"], "cols": "1fr 1fr"}, "regeltext"],
  defaults: {
    'gueltig_ab': { kind: 'today' },
    'status': { kind: 'lookup', key: 'aktiv', label: 'Aktiv' },
    'regelart': { kind: 'lookup', key: 'verbindlich', label: 'Verbindlich' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
