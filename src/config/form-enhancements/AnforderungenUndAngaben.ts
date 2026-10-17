// Auto-generated. Per-entity form-enhancements config for "Anforderungen und Angaben".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["bezeichnung", "vorgang", "angabestatus", {"row": ["informationsquelle", "quellenverweis"], "cols": "1fr 1fr"}, "angabe", "luecke_widerspruch", "unsicherheit", "pruefpunkt"],
  defaults: {
    'angabestatus': { kind: 'lookup', key: 'ungeprueft', label: 'Ungeprüft' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
