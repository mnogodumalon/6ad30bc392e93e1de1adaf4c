/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'beteiligte' | 'informationsquellen' | 'regeln_und_befugnisse' | 'vorgaenge' | 'anforderungen_und_angaben' | 'fachliche_beurteilungen' | 'rueckfragen' | 'entscheidungen_und_freigaben' | 'erfahrungen';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "beteiligte": "vorname" | "nachname" | "abteilung" | "zustaendigkeit" | "email" | "telefon" | "befugnisgrenzen";
  "informationsquellen": "bezeichnung" | "beschreibung" | "bekannte_schwaechen";
  "regeln_und_befugnisse": "regelbezeichnung" | "regeltext" | "geltungsbereich";
  "vorgaenge": "vorgangsnummer" | "kundenanfrage" | "tatsaechlicher_ablauf" | "verzoegerungen_nacharbeit" | "entwurf_zusammenfassung" | "entwurf_geklaert" | "entwurf_offen";
  "anforderungen_und_angaben": "bezeichnung" | "angabe" | "quellenverweis" | "luecke_widerspruch" | "unsicherheit" | "pruefpunkt";
  "fachliche_beurteilungen": "beurteilungstext" | "ergebnis" | "unsicherheiten";
  "rueckfragen": "fragetext" | "buendelkennung" | "antwort" | "alter_wert" | "neuer_wert";
  "entscheidungen_und_freigaben": "unsicherheiten" | "vorschlag" | "entscheidung" | "begruendung" | "folgen";
  "erfahrungen": "titel" | "beschreibung" | "ursache" | "verbesserungsvorschlag";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "beteiligte": never;
  "informationsquellen": "verantwortlicher";
  "regeln_und_befugnisse": "berechtigter";
  "vorgaenge": "kunde" | "bearbeiter";
  "anforderungen_und_angaben": "vorgang" | "informationsquelle";
  "fachliche_beurteilungen": "vorgang" | "anforderung" | "beurteiler";
  "rueckfragen": "vorgang" | "anforderungen" | "adressat";
  "entscheidungen_und_freigaben": "vorgang" | "grundlage_anforderungen" | "beurteilung" | "regel" | "entscheider";
  "erfahrungen": "vorgang" | "pruefer";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "beteiligte": {
    "key": "beteiligte",
    "appId": "6ad30b8e0042e397617f53a8",
    "label": "Beteiligte",
    "pascal": "Beteiligte",
    "single": "BeteiligteEntry"
  },
  "informationsquellen": {
    "key": "informationsquellen",
    "appId": "6ad30b9338e75bfe185688eb",
    "label": "Informationsquellen",
    "pascal": "Informationsquellen",
    "single": "InformationsquellenEntry"
  },
  "regeln_und_befugnisse": {
    "key": "regeln_und_befugnisse",
    "appId": "6ad30b940a982f4bfcc4e103",
    "label": "Regeln und Befugnisse",
    "pascal": "RegelnUndBefugnisse",
    "single": "RegelnUndBefugnisseEntry"
  },
  "vorgaenge": {
    "key": "vorgaenge",
    "appId": "6ad30b94865676544f7d28ef",
    "label": "Vorgänge",
    "pascal": "Vorgaenge",
    "single": "VorgaengeEntry"
  },
  "anforderungen_und_angaben": {
    "key": "anforderungen_und_angaben",
    "appId": "6ad30b958d763c2961a03cf4",
    "label": "Anforderungen und Angaben",
    "pascal": "AnforderungenUndAngaben",
    "single": "AnforderungenUndAngabenEntry"
  },
  "fachliche_beurteilungen": {
    "key": "fachliche_beurteilungen",
    "appId": "6ad30b963ba9b811867e67e7",
    "label": "Fachliche Beurteilungen",
    "pascal": "FachlicheBeurteilungen",
    "single": "FachlicheBeurteilungenEntry"
  },
  "rueckfragen": {
    "key": "rueckfragen",
    "appId": "6ad30b97569dcebe35a88423",
    "label": "Rückfragen",
    "pascal": "Rueckfragen",
    "single": "RueckfragenEntry"
  },
  "entscheidungen_und_freigaben": {
    "key": "entscheidungen_und_freigaben",
    "appId": "6ad30b9868280a18c8e01833",
    "label": "Entscheidungen und Freigaben",
    "pascal": "EntscheidungenUndFreigaben",
    "single": "EntscheidungenUndFreigabenEntry"
  },
  "erfahrungen": {
    "key": "erfahrungen",
    "appId": "6ad30b984a902988e7a53bb8",
    "label": "Erfahrungen",
    "pascal": "Erfahrungen",
    "single": "ErfahrungenEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "beteiligte": {
    "vorname": {
      "key": "vorname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "nachname": {
      "key": "nachname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "rolle": {
      "key": "rolle",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Rolle",
      "writable": true,
      "options": [
        "vertrieb",
        "konstruktion",
        "arbeitsvorbereitung",
        "qualitaetssicherung",
        "kunde",
        "sonstige"
      ]
    },
    "abteilung": {
      "key": "abteilung",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Abteilung oder Stelle",
      "writable": true,
      "maxLength": 4000
    },
    "zustaendigkeit": {
      "key": "zustaendigkeit",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Zuständigkeitsbereich",
      "writable": true
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "entscheidungsbefugt": {
      "key": "entscheidungsbefugt",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Entscheidungsbefugt",
      "writable": true
    },
    "befugnisgrenzen": {
      "key": "befugnisgrenzen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Befugnisgrenzen",
      "writable": true
    }
  },
  "informationsquellen": {
    "bezeichnung": {
      "key": "bezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Bezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Art",
      "writable": true,
      "options": [
        "system",
        "dokument",
        "informelles_hilfsmittel",
        "bewaehrte_routine"
      ]
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "verantwortlicher": {
      "key": "verantwortlicher",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Verantwortlicher",
      "writable": true,
      "targetAppId": "6ad30b8e0042e397617f53a8",
      "targetEntity": "beteiligte"
    },
    "bekannte_schwaechen": {
      "key": "bekannte_schwaechen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bekannte Schwächen",
      "writable": true
    }
  },
  "regeln_und_befugnisse": {
    "regelbezeichnung": {
      "key": "regelbezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Regelbezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "regeltext": {
      "key": "regeltext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Regeltext",
      "writable": true
    },
    "geltungsbereich": {
      "key": "geltungsbereich",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Geltungsbereich",
      "writable": true,
      "maxLength": 4000
    },
    "regelart": {
      "key": "regelart",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Regelart",
      "writable": true,
      "options": [
        "verbindlich",
        "empfehlung"
      ]
    },
    "berechtigte_rolle": {
      "key": "berechtigte_rolle",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Entscheidungsberechtigte Rolle",
      "writable": true,
      "options": [
        "vertrieb",
        "konstruktion",
        "arbeitsvorbereitung",
        "qualitaetssicherung",
        "geschaeftsleitung"
      ]
    },
    "berechtigter": {
      "key": "berechtigter",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Entscheidungsberechtigte Person",
      "writable": true,
      "targetAppId": "6ad30b8e0042e397617f53a8",
      "targetEntity": "beteiligte"
    },
    "freigabepflicht": {
      "key": "freigabepflicht",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Freigabepflichtig",
      "writable": true
    },
    "gueltig_ab": {
      "key": "gueltig_ab",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Gültig ab",
      "writable": true
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Status",
      "writable": true,
      "options": [
        "aktiv",
        "inaktiv"
      ]
    }
  },
  "vorgaenge": {
    "uebergabestatus": {
      "key": "uebergabestatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Übergabestatus",
      "writable": true,
      "options": [
        "nicht_bereit",
        "bereit_mit_vorbehalt",
        "uebergabebereit"
      ]
    },
    "vorgangsnummer": {
      "key": "vorgangsnummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorgangsnummer",
      "writable": true,
      "maxLength": 4000
    },
    "kunde": {
      "key": "kunde",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Kunde",
      "writable": true,
      "targetAppId": "6ad30b8e0042e397617f53a8",
      "targetEntity": "beteiligte"
    },
    "bearbeiter": {
      "key": "bearbeiter",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Bearbeiter",
      "writable": true,
      "targetAppId": "6ad30b8e0042e397617f53a8",
      "targetEntity": "beteiligte"
    },
    "eingangsdatum": {
      "key": "eingangsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": true,
      "label": "Eingangsdatum",
      "writable": true
    },
    "kundenanfrage": {
      "key": "kundenanfrage",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Kundenanfrage",
      "writable": true
    },
    "prozessschritt": {
      "key": "prozessschritt",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Prozessschritt",
      "writable": true,
      "options": [
        "anfrage_verstehen",
        "informationen_pruefen",
        "beurteilungen_vorbereiten",
        "beteiligte_einbeziehen",
        "kommunikation_organisieren",
        "entscheidungen_treffen",
        "auftragsentwurf",
        "abgeschlossen"
      ]
    },
    "freigabestatus": {
      "key": "freigabestatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Freigabestatus",
      "writable": true,
      "options": [
        "offen",
        "in_pruefung",
        "freigegeben",
        "abgelehnt"
      ]
    },
    "tatsaechlicher_ablauf": {
      "key": "tatsaechlicher_ablauf",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Tatsächlicher Ablauf",
      "writable": true
    },
    "verzoegerungen_nacharbeit": {
      "key": "verzoegerungen_nacharbeit",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Verzögerungen und Nacharbeit",
      "writable": true
    },
    "entwurf_zusammenfassung": {
      "key": "entwurf_zusammenfassung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Auftragsentwurf: Zusammenfassung",
      "writable": true
    },
    "entwurf_geklaert": {
      "key": "entwurf_geklaert",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bereits geklärte Punkte",
      "writable": true
    },
    "entwurf_offen": {
      "key": "entwurf_offen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Noch offene Punkte",
      "writable": true
    }
  },
  "anforderungen_und_angaben": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad30b94865676544f7d28ef",
      "targetEntity": "vorgaenge"
    },
    "bezeichnung": {
      "key": "bezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Bezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "angabe": {
      "key": "angabe",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Wert oder Angabe",
      "writable": true
    },
    "informationsquelle": {
      "key": "informationsquelle",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Informationsquelle",
      "writable": true,
      "targetAppId": "6ad30b9338e75bfe185688eb",
      "targetEntity": "informationsquellen"
    },
    "quellenverweis": {
      "key": "quellenverweis",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Quellenverweis",
      "writable": true,
      "maxLength": 4000
    },
    "angabestatus": {
      "key": "angabestatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Angabestatus",
      "writable": true,
      "options": [
        "bestaetigt",
        "ungeprueft",
        "fehlend",
        "widerspruechlich"
      ]
    },
    "luecke_widerspruch": {
      "key": "luecke_widerspruch",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Lücke oder Widerspruch",
      "writable": true
    },
    "unsicherheit": {
      "key": "unsicherheit",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bestehende Unsicherheit",
      "writable": true
    },
    "pruefpunkt": {
      "key": "pruefpunkt",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Technischer Prüfpunkt",
      "writable": true
    }
  },
  "fachliche_beurteilungen": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad30b94865676544f7d28ef",
      "targetEntity": "vorgaenge"
    },
    "anforderung": {
      "key": "anforderung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Anforderung",
      "writable": true,
      "targetAppId": "6ad30b958d763c2961a03cf4",
      "targetEntity": "anforderungen_und_angaben"
    },
    "beurteiler": {
      "key": "beurteiler",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Beurteiler",
      "writable": true,
      "targetAppId": "6ad30b8e0042e397617f53a8",
      "targetEntity": "beteiligte"
    },
    "fachbereich": {
      "key": "fachbereich",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Fachbereich",
      "writable": true,
      "options": [
        "vertrieb",
        "konstruktion",
        "arbeitsvorbereitung",
        "qualitaetssicherung"
      ]
    },
    "beurteilungstext": {
      "key": "beurteilungstext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Beurteilung",
      "writable": true
    },
    "ergebnis": {
      "key": "ergebnis",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Ergebnis",
      "writable": true,
      "maxLength": 4000
    },
    "unsicherheiten": {
      "key": "unsicherheiten",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Unsicherheiten",
      "writable": true
    },
    "gueltigkeitsstatus": {
      "key": "gueltigkeitsstatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Gültigkeitsstatus",
      "writable": true,
      "options": [
        "entwurf",
        "ki_vorschlag",
        "fachlich_bestaetigt",
        "verworfen"
      ]
    },
    "beurteilungsdatum": {
      "key": "beurteilungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Datum",
      "writable": true
    }
  },
  "rueckfragen": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad30b94865676544f7d28ef",
      "targetEntity": "vorgaenge"
    },
    "anforderungen": {
      "key": "anforderungen",
      "fulltype": "multipleapplookup/select",
      "kind": "multirecord",
      "required": false,
      "label": "Betroffene Anforderungen",
      "writable": true,
      "targetAppId": "6ad30b958d763c2961a03cf4",
      "targetEntity": "anforderungen_und_angaben"
    },
    "adressat": {
      "key": "adressat",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Adressat",
      "writable": true,
      "targetAppId": "6ad30b8e0042e397617f53a8",
      "targetEntity": "beteiligte"
    },
    "fragetext": {
      "key": "fragetext",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Fragetext",
      "writable": true
    },
    "buendelkennung": {
      "key": "buendelkennung",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Bündelkennung",
      "writable": true,
      "maxLength": 4000
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Status",
      "writable": true,
      "options": [
        "vorbereitet",
        "gesendet",
        "beantwortet",
        "erledigt"
      ]
    },
    "antwort": {
      "key": "antwort",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Antwort",
      "writable": true
    },
    "antwortdatum": {
      "key": "antwortdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Antwortdatum",
      "writable": true
    },
    "alter_wert": {
      "key": "alter_wert",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Alter Wert der Angabe",
      "writable": true,
      "maxLength": 4000
    },
    "neuer_wert": {
      "key": "neuer_wert",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Neuer Wert der Angabe",
      "writable": true,
      "maxLength": 4000
    }
  },
  "entscheidungen_und_freigaben": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad30b94865676544f7d28ef",
      "targetEntity": "vorgaenge"
    },
    "grundlage_anforderungen": {
      "key": "grundlage_anforderungen",
      "fulltype": "multipleapplookup/select",
      "kind": "multirecord",
      "required": false,
      "label": "Zugrunde liegende Anforderungen",
      "writable": true,
      "targetAppId": "6ad30b958d763c2961a03cf4",
      "targetEntity": "anforderungen_und_angaben"
    },
    "beurteilung": {
      "key": "beurteilung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Fachliche Beurteilung",
      "writable": true,
      "targetAppId": "6ad30b963ba9b811867e67e7",
      "targetEntity": "fachliche_beurteilungen"
    },
    "regel": {
      "key": "regel",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Anwendbare Regel",
      "writable": true,
      "targetAppId": "6ad30b940a982f4bfcc4e103",
      "targetEntity": "regeln_und_befugnisse"
    },
    "entscheider": {
      "key": "entscheider",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Entscheider",
      "writable": true,
      "targetAppId": "6ad30b8e0042e397617f53a8",
      "targetEntity": "beteiligte"
    },
    "befugnis_geprueft": {
      "key": "befugnis_geprueft",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Entscheidungsbefugnis geprüft",
      "writable": true
    },
    "unsicherheiten": {
      "key": "unsicherheiten",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Verbleibende Unsicherheiten",
      "writable": true
    },
    "vorschlag": {
      "key": "vorschlag",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Vorschlag (auch KI-Vorschlag)",
      "writable": true
    },
    "entscheidung": {
      "key": "entscheidung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Tatsächliche Entscheidung",
      "writable": true
    },
    "begruendung": {
      "key": "begruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begründung",
      "writable": true
    },
    "folgen": {
      "key": "folgen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Folgen",
      "writable": true
    },
    "freigabestatus": {
      "key": "freigabestatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Freigabestatus",
      "writable": true,
      "options": [
        "offen",
        "freigegeben",
        "abgelehnt",
        "zurueckgestellt"
      ]
    },
    "entscheidungsdatum": {
      "key": "entscheidungsdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Datum",
      "writable": true
    }
  },
  "erfahrungen": {
    "vorgang": {
      "key": "vorgang",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorgang",
      "writable": true,
      "targetAppId": "6ad30b94865676544f7d28ef",
      "targetEntity": "vorgaenge"
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "kategorie": {
      "key": "kategorie",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Kategorie",
      "writable": true,
      "options": [
        "bewaehrte_routine",
        "fehler",
        "nacharbeit",
        "verzoegerung",
        "informationsluecke",
        "widerspruch",
        "abstimmungsschleife"
      ]
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Beschreibung",
      "writable": true
    },
    "ursache": {
      "key": "ursache",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Ursache",
      "writable": true
    },
    "verbesserungsvorschlag": {
      "key": "verbesserungsvorschlag",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Verbesserungsvorschlag",
      "writable": true
    },
    "pruefstatus": {
      "key": "pruefstatus",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Prüfstatus",
      "writable": true,
      "options": [
        "ungeprueft",
        "in_pruefung",
        "geprueft",
        "verworfen"
      ]
    },
    "pruefer": {
      "key": "pruefer",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Prüfer",
      "writable": true,
      "targetAppId": "6ad30b8e0042e397617f53a8",
      "targetEntity": "beteiligte"
    },
    "wiederverwendbar": {
      "key": "wiederverwendbar",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Für spätere Aufträge wiederverwendbar",
      "writable": true
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Art der Erfahrung",
      "writable": true,
      "options": [
        "beobachtete_tatsache",
        "ungeprueft_annahme",
        "bestaetigte_erkenntnis",
        "verbindliche_regel",
        "situative_entscheidung"
      ]
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "beteiligte": [
    {
      "kind": "choice",
      "field": "rolle",
      "count": 6
    }
  ],
  "informationsquellen": [
    {
      "kind": "choice",
      "field": "art",
      "count": 4
    },
    {
      "kind": "record",
      "field": "verantwortlicher",
      "targetEntity": "beteiligte"
    }
  ],
  "regeln_und_befugnisse": [
    {
      "kind": "choice",
      "field": "regelart",
      "count": 2
    },
    {
      "kind": "choice",
      "field": "berechtigte_rolle",
      "count": 5
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 2
    },
    {
      "kind": "record",
      "field": "berechtigter",
      "targetEntity": "beteiligte"
    }
  ],
  "vorgaenge": [
    {
      "kind": "choice",
      "field": "uebergabestatus",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "freigabestatus",
      "count": 4
    },
    {
      "kind": "record",
      "field": "kunde",
      "targetEntity": "beteiligte"
    },
    {
      "kind": "record",
      "field": "bearbeiter",
      "targetEntity": "beteiligte"
    }
  ],
  "anforderungen_und_angaben": [
    {
      "kind": "choice",
      "field": "angabestatus",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "informationsquelle",
      "targetEntity": "informationsquellen"
    }
  ],
  "fachliche_beurteilungen": [
    {
      "kind": "choice",
      "field": "fachbereich",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "gueltigkeitsstatus",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "anforderung",
      "targetEntity": "anforderungen_und_angaben"
    },
    {
      "kind": "record",
      "field": "beurteiler",
      "targetEntity": "beteiligte"
    }
  ],
  "rueckfragen": [
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "anforderungen",
      "targetEntity": "anforderungen_und_angaben"
    },
    {
      "kind": "record",
      "field": "adressat",
      "targetEntity": "beteiligte"
    }
  ],
  "entscheidungen_und_freigaben": [
    {
      "kind": "choice",
      "field": "freigabestatus",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "grundlage_anforderungen",
      "targetEntity": "anforderungen_und_angaben"
    },
    {
      "kind": "record",
      "field": "beurteilung",
      "targetEntity": "fachliche_beurteilungen"
    },
    {
      "kind": "record",
      "field": "regel",
      "targetEntity": "regeln_und_befugnisse"
    },
    {
      "kind": "record",
      "field": "entscheider",
      "targetEntity": "beteiligte"
    }
  ],
  "erfahrungen": [
    {
      "kind": "choice",
      "field": "pruefstatus",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "art",
      "count": 5
    },
    {
      "kind": "record",
      "field": "vorgang",
      "targetEntity": "vorgaenge"
    },
    {
      "kind": "record",
      "field": "pruefer",
      "targetEntity": "beteiligte"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "beteiligte": [
    "vorname",
    "nachname"
  ],
  "informationsquellen": [
    "bezeichnung"
  ],
  "regeln_und_befugnisse": [
    "regelbezeichnung"
  ],
  "vorgaenge": [
    "vorgangsnummer"
  ],
  "anforderungen_und_angaben": [
    "bezeichnung"
  ],
  "fachliche_beurteilungen": [
    "beurteilungstext"
  ],
  "rueckfragen": [
    "buendelkennung"
  ],
  "entscheidungen_und_freigaben": [
    "unsicherheiten"
  ],
  "erfahrungen": [
    "titel"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
