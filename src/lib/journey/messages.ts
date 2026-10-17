/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - beteiligte: vorname (Vorname), nachname (Nachname), rolle (Rolle)
 *   - informationsquellen: bezeichnung (Bezeichnung), art (Art)
 *   - regeln_und_befugnisse: regelbezeichnung (Regelbezeichnung), regeltext (Regeltext)
 *   - vorgaenge: vorgangsnummer (Vorgangsnummer), bearbeiter (Bearbeiter), eingangsdatum (Eingangsdatum), prozessschritt (Prozessschritt)
 *   - anforderungen_und_angaben: vorgang (Vorgang), bezeichnung (Bezeichnung), angabestatus (Angabestatus)
 *   - fachliche_beurteilungen: vorgang (Vorgang), beurteiler (Beurteiler), beurteilungstext (Beurteilung), gueltigkeitsstatus (Gültigkeitsstatus)
 *   - rueckfragen: vorgang (Vorgang), adressat (Adressat), fragetext (Fragetext), status (Status)
 *   - entscheidungen_und_freigaben: vorgang (Vorgang), entscheider (Entscheider), freigabestatus (Freigabestatus)
 *   - erfahrungen: vorgang (Vorgang), titel (Titel), beschreibung (Beschreibung), art (Art der Erfahrung)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "beteiligte": "vorname" | "nachname" | "rolle" | "abteilung" | "zustaendigkeit" | "email" | "telefon" | "entscheidungsbefugt" | "befugnisgrenzen";
  "informationsquellen": "bezeichnung" | "art" | "beschreibung" | "verantwortlicher" | "bekannte_schwaechen";
  "regeln_und_befugnisse": "regelbezeichnung" | "regeltext" | "geltungsbereich" | "regelart" | "berechtigte_rolle" | "berechtigter" | "freigabepflicht" | "gueltig_ab" | "status";
  "vorgaenge": "uebergabestatus" | "vorgangsnummer" | "kunde" | "bearbeiter" | "eingangsdatum" | "kundenanfrage" | "prozessschritt" | "freigabestatus" | "tatsaechlicher_ablauf" | "verzoegerungen_nacharbeit" | "entwurf_zusammenfassung" | "entwurf_geklaert" | "entwurf_offen";
  "anforderungen_und_angaben": "vorgang" | "bezeichnung" | "angabe" | "informationsquelle" | "quellenverweis" | "angabestatus" | "luecke_widerspruch" | "unsicherheit" | "pruefpunkt";
  "fachliche_beurteilungen": "vorgang" | "anforderung" | "beurteiler" | "fachbereich" | "beurteilungstext" | "ergebnis" | "unsicherheiten" | "gueltigkeitsstatus" | "beurteilungsdatum";
  "rueckfragen": "vorgang" | "anforderungen" | "adressat" | "fragetext" | "buendelkennung" | "status" | "antwort" | "antwortdatum" | "alter_wert" | "neuer_wert";
  "entscheidungen_und_freigaben": "vorgang" | "grundlage_anforderungen" | "beurteilung" | "regel" | "entscheider" | "befugnis_geprueft" | "unsicherheiten" | "vorschlag" | "entscheidung" | "begruendung" | "folgen" | "freigabestatus" | "entscheidungsdatum";
  "erfahrungen": "vorgang" | "titel" | "kategorie" | "beschreibung" | "ursache" | "verbesserungsvorschlag" | "pruefstatus" | "pruefer" | "wiederverwendbar" | "art";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  beteiligte: { vorname: "Bitte den Vornamen eingeben.", nachname: "Bitte den Nachnamen eingeben.", rolle: "Bitte eine Rolle auswählen." },
  informationsquellen: { bezeichnung: "Bitte die Bezeichnung der Quelle eingeben.", art: "Bitte die Art der Quelle auswählen." },
  regeln_und_befugnisse: { regelbezeichnung: "Bitte die Regelbezeichnung eingeben.", regeltext: "Bitte den Regeltext eingeben." },
  vorgaenge: { vorgangsnummer: "Bitte die Vorgangsnummer eingeben.", bearbeiter: "Bitte einen Bearbeiter auswählen.", eingangsdatum: "Bitte das Eingangsdatum wählen.", prozessschritt: "Bitte den Prozessschritt auswählen." },
  anforderungen_und_angaben: { vorgang: "Bitte einen Vorgang auswählen.", bezeichnung: "Bitte die Bezeichnung der Angabe eingeben.", angabestatus: "Bitte den Status der Angabe wählen." },
  fachliche_beurteilungen: { vorgang: "Bitte einen Vorgang auswählen.", beurteiler: "Bitte einen Beurteiler auswählen.", beurteilungstext: "Bitte die Beurteilung eingeben.", gueltigkeitsstatus: "Bitte den Gültigkeitsstatus wählen." },
  rueckfragen: { vorgang: "Bitte einen Vorgang auswählen.", adressat: "Bitte einen Adressaten auswählen.", fragetext: "Bitte den Fragetext eingeben.", status: "Bitte den Status der Rückfrage wählen." },
  entscheidungen_und_freigaben: { vorgang: "Bitte einen Vorgang auswählen.", entscheider: "Bitte einen Entscheider auswählen.", freigabestatus: "Bitte den Freigabestatus wählen." },
  erfahrungen: { vorgang: "Bitte einen Vorgang auswählen.", titel: "Bitte einen Titel eingeben.", beschreibung: "Bitte die Erfahrung beschreiben.", art: "Bitte die Art der Erfahrung wählen." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
