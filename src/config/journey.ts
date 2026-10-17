/**
 * Occupancy semantics — DECIDED BY THE BUILD AGENT, never by a heuristic.
 *
 * The Phase-2 orchestrator writes its decision to `.intents-staging/occupancy.json`
 * (stay pair, booked resource, statuses that do not occupy); the integration
 * step validates it against the app metadata and renders it into the block
 * below. Scaffold updates keep the block. Do not edit outside the markers.
 *
 * Both doors read this and nothing else: `occupancyFor` (internal flows AND
 * public pages) and the owner service (the public grant's occupancy read).
 * No rule for an entity = no availability calendar, no occupancy claim —
 * a plain date field pair is shown instead.
 *
 * Facts from the metadata — candidates, NOT decisions:
 *   - beteiligte: lookups rolle[vertrieb|konstruktion|arbeitsvorbereitung|qualitaetssicherung|kunde|sonstige]
 *   - informationsquellen: applookups verantwortlicher→beteiligte · lookups art[system|dokument|informelles_hilfsmittel|bewaehrte_routine]
 *   - regeln_und_befugnisse: applookups berechtigter→beteiligte · lookups regelart[verbindlich|empfehlung], berechtigte_rolle[vertrieb|konstruktion|arbeitsvorbereitung|qualitaetssicherung|geschaeftsleitung], status[aktiv|inaktiv]
 *   - vorgaenge: applookups kunde→beteiligte, bearbeiter→beteiligte · lookups uebergabestatus[nicht_bereit|bereit_mit_vorbehalt|uebergabebereit], prozessschritt[anfrage_verstehen|informationen_pruefen|beurteilungen_vorbereiten|beteiligte_einbeziehen|kommunikation_organisieren|entscheidungen_treffen|auftragsentwurf|abgeschlossen], freigabestatus[offen|in_pruefung|freigegeben|abgelehnt]
 *   - anforderungen_und_angaben: applookups vorgang→vorgaenge, informationsquelle→informationsquellen · lookups angabestatus[bestaetigt|ungeprueft|fehlend|widerspruechlich]
 *   - fachliche_beurteilungen: applookups vorgang→vorgaenge, anforderung→anforderungen_und_angaben, beurteiler→beteiligte · lookups fachbereich[vertrieb|konstruktion|arbeitsvorbereitung|qualitaetssicherung], gueltigkeitsstatus[entwurf|ki_vorschlag|fachlich_bestaetigt|verworfen]
 *   - rueckfragen: applookups vorgang→vorgaenge, anforderungen→anforderungen_und_angaben, adressat→beteiligte · lookups status[vorbereitet|gesendet|beantwortet|erledigt]
 *   - entscheidungen_und_freigaben: applookups vorgang→vorgaenge, grundlage_anforderungen→anforderungen_und_angaben, beurteilung→fachliche_beurteilungen, regel→regeln_und_befugnisse, entscheider→beteiligte · lookups freigabestatus[offen|freigegeben|abgelehnt|zurueckgestellt]
 *   - erfahrungen: applookups vorgang→vorgaenge, pruefer→beteiligte · lookups kategorie[bewaehrte_routine|fehler|nacharbeit|verzoegerung|informationsluecke|widerspruch|abstimmungsschleife], pruefstatus[ungeprueft|in_pruefung|geprueft|verworfen], art[beobachtete_tatsache|ungeprueft_annahme|bestaetigte_erkenntnis|verbindliche_regel|situative_entscheidung]
 */
import type { EntityKey } from '@/lib/journey/rules';

export interface OccupancyRule {
  /** Arrival / departure fields (the departure day is exclusive). */
  from: string;
  to: string;
  /** applookup field naming the booked RESOURCE (room, vehicle, court).
   *  Omit when the entity itself is the one resource (a single holiday flat). */
  resource?: string;
  /** lookup field + the keys that mean "does NOT occupy" (cancelled, no-show). */
  statusField?: string;
  freeKeys?: string[];
}

export const OCCUPANCY: Partial<Record<EntityKey, OccupancyRule>> = {
  // <custom:occupancy>
  // </custom:occupancy>
};

/**
 * A record of the KEY entity is TAKEN while a record of `entity` points at it
 * through `field` — a slot with a booking, a seat with a ticket. Generated
 * from the plan's blocking `unique` check on that reference (05.10.2026:
 * the salon's public page offered booked slots again). Pickers on both
 * doors leave taken records out (useRecordSearch); a public page reads only
 * `field` of `entity` — never who booked. Generator-owned: no markers.
 */
export interface TakenRule {
  entity: EntityKey;
  field: string;
}

export const TAKEN_BY: Partial<Record<EntityKey, TakenRule>> = {
};
