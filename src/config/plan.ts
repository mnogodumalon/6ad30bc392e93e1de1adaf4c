// The orchestrator's plan, as far as the running app needs it
// (docs/orchestrator/SPEC.md). Generated — do not edit; regenerated on every
// build and update from the stored plan. Without a plan every map is empty.
//
//   SYSTEM_ASSIGNED entity → fields a tool fills when a record is CREATED — the
//                   value does not exist before; dialogs hide these on create and
//                   the form-polish sets no default on them. A scheduled or
//                   update-triggered tool owns its field but is NOT in here.
//   PLAN_SENTENCES  slug → the plan in the owner's words (flows' field page)
//
// The runtime write guard (FLOW_WRITES/OWNERSHIP, planGuard.ts) left on
// 23.09.2026: a flow page composes against its generated hook, whose submit
// plan IS the Schreibliste — there is no way to spell a write outside it.

export const SYSTEM_ASSIGNED: Record<string, string[]> = {};

export const PLAN_SENTENCES: Record<string, string[]> = {
  "vorgang-anlegen": [
    "Legt an: anforderungen_und_angaben, vorgaenge",
    "Automatisch: eingangsdatum (heutiges Datum, automatisch), prozessschritt (fester Wert „anfrage_verstehen“), freigabestatus (fester Wert „offen“), uebergabestatus (fester Wert „nicht_bereit“)"
  ],
  "anforderungen-pruefen": [
    "Ändert: anforderungen_und_angaben, vorgaenge",
    "Automatisch: prozessschritt (fester Wert „informationen_pruefen“)"
  ],
  "beurteilung-vorbereiten": [
    "Legt an: fachliche_beurteilungen",
    "Ändert: vorgaenge",
    "Automatisch: gueltigkeitsstatus (fester Wert „entwurf“), beurteilungsdatum (heutiges Datum, automatisch), prozessschritt (fester Wert „beurteilungen_vorbereiten“)"
  ],
  "rueckfrage-stellen": [
    "Legt an: rueckfragen",
    "Ändert: vorgaenge",
    "Automatisch: status (fester Wert „vorbereitet“), prozessschritt (fester Wert „kommunikation_organisieren“)"
  ],
  "antwort-erfassen": [
    "Ändert: anforderungen_und_angaben, rueckfragen",
    "Automatisch: antwortdatum (heutiges Datum, automatisch), status (fester Wert „beantwortet“)"
  ],
  "entscheidung-treffen": [
    "Legt an: entscheidungen_und_freigaben",
    "Ändert: vorgaenge",
    "Automatisch: entscheidungsdatum (heutiges Datum, automatisch), prozessschritt (fester Wert „entscheidungen_treffen“)"
  ]
};

export const PLAN_SUMMARY = "Die Anwendung organisiert das technische Anfrage- und Angebotsmanagement. Jeder Vorgang führt von der Kundenanfrage über Informationsprüfung, fachliche Beurteilungen, Rückfragen und Entscheidungen bis zum Auftragsentwurf. Angaben bleiben auf ihre Quelle zurückführbar, Regeln und Entscheidungsbefugnisse sind kontrollierbar, und Erfahrungen aus dem Auftrag werden festgehalten, geprüft und wiederverwendbar gemacht.";

/** slug → the lists a flow writes (the plan's Schreibliste). The nav leaves a
 *  flow out for a user who may not write one of them (lib/permissions.ts). */
export const FLOW_ENTITIES: Record<string, string[]> = {
  "vorgang-anlegen": [
    "anforderungen_und_angaben",
    "vorgaenge"
  ],
  "anforderungen-pruefen": [
    "anforderungen_und_angaben",
    "vorgaenge"
  ],
  "beurteilung-vorbereiten": [
    "fachliche_beurteilungen",
    "vorgaenge"
  ],
  "rueckfrage-stellen": [
    "rueckfragen",
    "vorgaenge"
  ],
  "antwort-erfassen": [
    "anforderungen_und_angaben",
    "rueckfragen"
  ],
  "entscheidung-treffen": [
    "entscheidungen_und_freigaben",
    "vorgaenge"
  ]
};
