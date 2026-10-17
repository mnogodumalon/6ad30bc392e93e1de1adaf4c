import type { AnforderungenUndAngaben, EntscheidungenUndFreigaben, Erfahrungen, FachlicheBeurteilungen, Informationsquellen, RegelnUndBefugnisse, Rueckfragen, Vorgaenge } from './app';

export type EnrichedInformationsquellen = Informationsquellen & {
  verantwortlicherName: string;
};

export type EnrichedRegelnUndBefugnisse = RegelnUndBefugnisse & {
  berechtigterName: string;
};

export type EnrichedVorgaenge = Vorgaenge & {
  kundeName: string;
  bearbeiterName: string;
};

export type EnrichedAnforderungenUndAngaben = AnforderungenUndAngaben & {
  vorgangName: string;
  informationsquelleName: string;
};

export type EnrichedFachlicheBeurteilungen = FachlicheBeurteilungen & {
  vorgangName: string;
  anforderungName: string;
  beurteilerName: string;
};

export type EnrichedRueckfragen = Rueckfragen & {
  vorgangName: string;
  anforderungenName: string;
  adressatName: string;
};

export type EnrichedEntscheidungenUndFreigaben = EntscheidungenUndFreigaben & {
  vorgangName: string;
  grundlage_anforderungenName: string;
  beurteilungName: string;
  regelName: string;
  entscheiderName: string;
};

export type EnrichedErfahrungen = Erfahrungen & {
  vorgangName: string;
  prueferName: string;
};
