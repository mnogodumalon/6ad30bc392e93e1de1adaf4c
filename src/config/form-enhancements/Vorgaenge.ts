// Auto-generated. Per-entity form-enhancements config for "Vorgänge".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorgangsnummer", "bearbeiter", "eingangsdatum", "prozessschritt", "kunde", {"row": ["freigabestatus", "uebergabestatus"], "cols": "1fr 1fr"}, "kundenanfrage", "tatsaechlicher_ablauf", "verzoegerungen_nacharbeit", "entwurf_zusammenfassung", "entwurf_geklaert", "entwurf_offen"],
  defaults: {
    'eingangsdatum': { kind: 'today' },
    'prozessschritt': { kind: 'lookup', key: 'anfrage_verstehen', label: 'Anfrage verstehen' },
    'freigabestatus': { kind: 'lookup', key: 'offen', label: 'Offen' },
    'uebergabestatus': { kind: 'lookup', key: 'nicht_bereit', label: 'Nicht bereit' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
