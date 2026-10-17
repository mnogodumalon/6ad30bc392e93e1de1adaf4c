import type { EnrichedAnforderungenUndAngaben, EnrichedEntscheidungenUndFreigaben, EnrichedErfahrungen, EnrichedFachlicheBeurteilungen, EnrichedInformationsquellen, EnrichedRegelnUndBefugnisse, EnrichedRueckfragen, EnrichedVorgaenge } from '@/types/enriched';
import type { AnforderungenUndAngaben, Beteiligte, EntscheidungenUndFreigaben, Erfahrungen, FachlicheBeurteilungen, Informationsquellen, RegelnUndBefugnisse, Rueckfragen, Vorgaenge } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface InformationsquellenMaps {
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichInformationsquellen(
  informationsquellen: Informationsquellen[],
  maps: InformationsquellenMaps
): EnrichedInformationsquellen[] {
  return informationsquellen.map(r => ({
    ...r,
    verantwortlicherName: resolveDisplay(r.fields.verantwortlicher, maps.beteiligteMap, 'vorname', 'nachname'),
  }));
}

interface RegelnUndBefugnisseMaps {
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichRegelnUndBefugnisse(
  regelnUndBefugnisse: RegelnUndBefugnisse[],
  maps: RegelnUndBefugnisseMaps
): EnrichedRegelnUndBefugnisse[] {
  return regelnUndBefugnisse.map(r => ({
    ...r,
    berechtigterName: resolveDisplay(r.fields.berechtigter, maps.beteiligteMap, 'vorname', 'nachname'),
  }));
}

interface VorgaengeMaps {
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichVorgaenge(
  vorgaenge: Vorgaenge[],
  maps: VorgaengeMaps
): EnrichedVorgaenge[] {
  return vorgaenge.map(r => ({
    ...r,
    kundeName: resolveDisplay(r.fields.kunde, maps.beteiligteMap, 'vorname', 'nachname'),
    bearbeiterName: resolveDisplay(r.fields.bearbeiter, maps.beteiligteMap, 'vorname', 'nachname'),
  }));
}

interface AnforderungenUndAngabenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  informationsquellenMap: Map<string, Informationsquellen>;
}

export function enrichAnforderungenUndAngaben(
  anforderungenUndAngaben: AnforderungenUndAngaben[],
  maps: AnforderungenUndAngabenMaps
): EnrichedAnforderungenUndAngaben[] {
  return anforderungenUndAngaben.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'vorgangsnummer'),
    informationsquelleName: resolveDisplay(r.fields.informationsquelle, maps.informationsquellenMap, 'bezeichnung'),
  }));
}

interface FachlicheBeurteilungenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  anforderungenUndAngabenMap: Map<string, AnforderungenUndAngaben>;
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichFachlicheBeurteilungen(
  fachlicheBeurteilungen: FachlicheBeurteilungen[],
  maps: FachlicheBeurteilungenMaps
): EnrichedFachlicheBeurteilungen[] {
  return fachlicheBeurteilungen.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'vorgangsnummer'),
    anforderungName: resolveDisplay(r.fields.anforderung, maps.anforderungenUndAngabenMap, 'bezeichnung'),
    beurteilerName: resolveDisplay(r.fields.beurteiler, maps.beteiligteMap, 'vorname', 'nachname'),
  }));
}

interface RueckfragenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  anforderungenUndAngabenMap: Map<string, AnforderungenUndAngaben>;
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichRueckfragen(
  rueckfragen: Rueckfragen[],
  maps: RueckfragenMaps
): EnrichedRueckfragen[] {
  return rueckfragen.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'vorgangsnummer'),
    anforderungenName: resolveDisplay(r.fields.anforderungen, maps.anforderungenUndAngabenMap, 'bezeichnung'),
    adressatName: resolveDisplay(r.fields.adressat, maps.beteiligteMap, 'vorname', 'nachname'),
  }));
}

interface EntscheidungenUndFreigabenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  anforderungenUndAngabenMap: Map<string, AnforderungenUndAngaben>;
  fachlicheBeurteilungenMap: Map<string, FachlicheBeurteilungen>;
  regelnUndBefugnisseMap: Map<string, RegelnUndBefugnisse>;
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichEntscheidungenUndFreigaben(
  entscheidungenUndFreigaben: EntscheidungenUndFreigaben[],
  maps: EntscheidungenUndFreigabenMaps
): EnrichedEntscheidungenUndFreigaben[] {
  return entscheidungenUndFreigaben.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'vorgangsnummer'),
    grundlage_anforderungenName: resolveDisplay(r.fields.grundlage_anforderungen, maps.anforderungenUndAngabenMap, 'bezeichnung'),
    beurteilungName: resolveDisplay(r.fields.beurteilung, maps.fachlicheBeurteilungenMap, 'beurteilungstext'),
    regelName: resolveDisplay(r.fields.regel, maps.regelnUndBefugnisseMap, 'regelbezeichnung'),
    entscheiderName: resolveDisplay(r.fields.entscheider, maps.beteiligteMap, 'vorname', 'nachname'),
  }));
}

interface ErfahrungenMaps {
  vorgaengeMap: Map<string, Vorgaenge>;
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichErfahrungen(
  erfahrungen: Erfahrungen[],
  maps: ErfahrungenMaps
): EnrichedErfahrungen[] {
  return erfahrungen.map(r => ({
    ...r,
    vorgangName: resolveDisplay(r.fields.vorgang, maps.vorgaengeMap, 'vorgangsnummer'),
    prueferName: resolveDisplay(r.fields.pruefer, maps.beteiligteMap, 'vorname', 'nachname'),
  }));
}
