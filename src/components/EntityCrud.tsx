/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'beteiligte'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.beteiligte.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.beteiligte.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.beteiligte.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.beteiligte              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   beteiligte: vorname, nachname, rolle, abteilung, zustaendigkeit, email, telefon, entscheidungsbefugt, …  ·  ← informationsquellen (list + contextual +) · ← regeln_und_befugnisse (list + contextual +) · ← vorgaenge (list + contextual +) · ← vorgaenge (list + contextual +) · ← fachliche_beurteilungen (list + contextual +) · ← rueckfragen (list + contextual +) · ← entscheidungen_und_freigaben (list + contextual +) · ← erfahrungen (list + contextual +)
 *   informationsquellen: bezeichnung, art, beschreibung, verantwortlicher, bekannte_schwaechen  ·  → beteiligte · ← anforderungen_und_angaben (list + contextual +)
 *   regeln_und_befugnisse: regelbezeichnung, regeltext, geltungsbereich, regelart, berechtigte_rolle, berechtigter, freigabepflicht, gueltig_ab, …  ·  → beteiligte · ← entscheidungen_und_freigaben (list + contextual +)
 *   vorgaenge: uebergabestatus, vorgangsnummer, kunde, bearbeiter, eingangsdatum, kundenanfrage, prozessschritt, freigabestatus, …  ·  → beteiligte · ← anforderungen_und_angaben (list + contextual +) · ← fachliche_beurteilungen (list + contextual +) · ← rueckfragen (list + contextual +) · ← entscheidungen_und_freigaben (list + contextual +) · ← erfahrungen (list + contextual +)
 *   anforderungen_und_angaben: vorgang, bezeichnung, angabe, informationsquelle, quellenverweis, angabestatus, luecke_widerspruch, unsicherheit, …  ·  → vorgaenge · → informationsquellen · ← fachliche_beurteilungen (list + contextual +) · ← rueckfragen (list + contextual + + choose existing) · ← entscheidungen_und_freigaben (list + contextual + + choose existing)
 *   fachliche_beurteilungen: vorgang, anforderung, beurteiler, fachbereich, beurteilungstext, ergebnis, unsicherheiten, gueltigkeitsstatus, …  ·  → vorgaenge · → anforderungen_und_angaben · → beteiligte · ← entscheidungen_und_freigaben (list + contextual +)
 *   rueckfragen: vorgang, anforderungen, adressat, fragetext, buendelkennung, status, antwort, antwortdatum, …  ·  → vorgaenge · → anforderungen_und_angaben · → beteiligte
 *   entscheidungen_und_freigaben: vorgang, grundlage_anforderungen, beurteilung, regel, entscheider, befugnis_geprueft, unsicherheiten, vorschlag, …  ·  → vorgaenge · → anforderungen_und_angaben · → fachliche_beurteilungen · → regeln_und_befugnisse · → beteiligte
 *   erfahrungen: vorgang, titel, kategorie, beschreibung, ursache, verbesserungsvorschlag, pruefstatus, pruefer, …  ·  → vorgaenge · → beteiligte
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Beteiligte, Informationsquellen, RegelnUndBefugnisse, Vorgaenge, AnforderungenUndAngaben, FachlicheBeurteilungen, Rueckfragen, EntscheidungenUndFreigaben, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl, extractRecordIds } from '@/services/livingAppsService';
import { enrichInformationsquellen, enrichRegelnUndBefugnisse, enrichVorgaenge, enrichAnforderungenUndAngaben, enrichFachlicheBeurteilungen, enrichRueckfragen, enrichEntscheidungenUndFreigaben, enrichErfahrungen } from '@/lib/enrich';
import type { EnrichedInformationsquellen, EnrichedRegelnUndBefugnisse, EnrichedVorgaenge, EnrichedAnforderungenUndAngaben, EnrichedFachlicheBeurteilungen, EnrichedRueckfragen, EnrichedEntscheidungenUndFreigaben, EnrichedErfahrungen } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { BeteiligteDialog, type BeteiligteDialogDefaults } from '@/components/dialogs/BeteiligteDialog';
import { BeteiligteDetails } from '@/components/details/BeteiligteDetails';
import { InformationsquellenDialog, type InformationsquellenDialogDefaults } from '@/components/dialogs/InformationsquellenDialog';
import { InformationsquellenDetails } from '@/components/details/InformationsquellenDetails';
import { RegelnUndBefugnisseDialog, type RegelnUndBefugnisseDialogDefaults } from '@/components/dialogs/RegelnUndBefugnisseDialog';
import { RegelnUndBefugnisseDetails } from '@/components/details/RegelnUndBefugnisseDetails';
import { VorgaengeDialog, type VorgaengeDialogDefaults } from '@/components/dialogs/VorgaengeDialog';
import { VorgaengeDetails } from '@/components/details/VorgaengeDetails';
import { AnforderungenUndAngabenDialog, type AnforderungenUndAngabenDialogDefaults } from '@/components/dialogs/AnforderungenUndAngabenDialog';
import { AnforderungenUndAngabenDetails } from '@/components/details/AnforderungenUndAngabenDetails';
import { FachlicheBeurteilungenDialog, type FachlicheBeurteilungenDialogDefaults } from '@/components/dialogs/FachlicheBeurteilungenDialog';
import { FachlicheBeurteilungenDetails } from '@/components/details/FachlicheBeurteilungenDetails';
import { RueckfragenDialog, type RueckfragenDialogDefaults } from '@/components/dialogs/RueckfragenDialog';
import { RueckfragenDetails } from '@/components/details/RueckfragenDetails';
import { EntscheidungenUndFreigabenDialog, type EntscheidungenUndFreigabenDialogDefaults } from '@/components/dialogs/EntscheidungenUndFreigabenDialog';
import { EntscheidungenUndFreigabenDetails } from '@/components/details/EntscheidungenUndFreigabenDetails';
import { ErfahrungenDialog, type ErfahrungenDialogDefaults } from '@/components/dialogs/ErfahrungenDialog';
import { ErfahrungenDetails } from '@/components/details/ErfahrungenDetails';
import { PickExistingDialog } from '@/components/PickExistingDialog';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'beteiligte'; record: Beteiligte }
  | { type: 'informationsquellen'; record: EnrichedInformationsquellen }
  | { type: 'regelnUndBefugnisse'; record: EnrichedRegelnUndBefugnisse }
  | { type: 'vorgaenge'; record: EnrichedVorgaenge }
  | { type: 'anforderungenUndAngaben'; record: EnrichedAnforderungenUndAngaben }
  | { type: 'fachlicheBeurteilungen'; record: EnrichedFachlicheBeurteilungen }
  | { type: 'rueckfragen'; record: EnrichedRueckfragen }
  | { type: 'entscheidungenUndFreigaben'; record: EnrichedEntscheidungenUndFreigaben }
  | { type: 'erfahrungen'; record: EnrichedErfahrungen };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  beteiligte: EntityCrudApi<Beteiligte, BeteiligteDialogDefaults>;
  informationsquellen: EntityCrudApi<Informationsquellen, InformationsquellenDialogDefaults>;
  regelnUndBefugnisse: EntityCrudApi<RegelnUndBefugnisse, RegelnUndBefugnisseDialogDefaults>;
  vorgaenge: EntityCrudApi<Vorgaenge, VorgaengeDialogDefaults>;
  anforderungenUndAngaben: EntityCrudApi<AnforderungenUndAngaben, AnforderungenUndAngabenDialogDefaults>;
  fachlicheBeurteilungen: EntityCrudApi<FachlicheBeurteilungen, FachlicheBeurteilungenDialogDefaults>;
  rueckfragen: EntityCrudApi<Rueckfragen, RueckfragenDialogDefaults>;
  entscheidungenUndFreigaben: EntityCrudApi<EntscheidungenUndFreigaben, EntscheidungenUndFreigabenDialogDefaults>;
  erfahrungen: EntityCrudApi<Erfahrungen, ErfahrungenDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { beteiligte: Beteiligte[]; informationsquellen: EnrichedInformationsquellen[]; regelnUndBefugnisse: EnrichedRegelnUndBefugnisse[]; vorgaenge: EnrichedVorgaenge[]; anforderungenUndAngaben: EnrichedAnforderungenUndAngaben[]; fachlicheBeurteilungen: EnrichedFachlicheBeurteilungen[]; rueckfragen: EnrichedRueckfragen[]; entscheidungenUndFreigaben: EnrichedEntscheidungenUndFreigaben[]; erfahrungen: EnrichedErfahrungen[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [beteiligteDialog, setBeteiligteDialog] = useState<{ defaults?: BeteiligteDialogDefaults; editing?: Beteiligte } | null>(null);
  const [informationsquellenDialog, setInformationsquellenDialog] = useState<{ defaults?: InformationsquellenDialogDefaults; editing?: Informationsquellen } | null>(null);
  const [regelnUndBefugnisseDialog, setRegelnUndBefugnisseDialog] = useState<{ defaults?: RegelnUndBefugnisseDialogDefaults; editing?: RegelnUndBefugnisse } | null>(null);
  const [vorgaengeDialog, setVorgaengeDialog] = useState<{ defaults?: VorgaengeDialogDefaults; editing?: Vorgaenge } | null>(null);
  const [anforderungenUndAngabenDialog, setAnforderungenUndAngabenDialog] = useState<{ defaults?: AnforderungenUndAngabenDialogDefaults; editing?: AnforderungenUndAngaben } | null>(null);
  const [fachlicheBeurteilungenDialog, setFachlicheBeurteilungenDialog] = useState<{ defaults?: FachlicheBeurteilungenDialogDefaults; editing?: FachlicheBeurteilungen } | null>(null);
  const [rueckfragenDialog, setRueckfragenDialog] = useState<{ defaults?: RueckfragenDialogDefaults; editing?: Rueckfragen } | null>(null);
  const [entscheidungenUndFreigabenDialog, setEntscheidungenUndFreigabenDialog] = useState<{ defaults?: EntscheidungenUndFreigabenDialogDefaults; editing?: EntscheidungenUndFreigaben } | null>(null);
  const [erfahrungenDialog, setErfahrungenDialog] = useState<{ defaults?: ErfahrungenDialogDefaults; editing?: Erfahrungen } | null>(null);
  // „Vorhandene wählen" für den Listenfeld-Rückbezug rueckfragen.anforderungen → anforderungen_und_angaben: hält die Hub-record_id.
  const [pickAnforderungenUndAngabenRueckfragen, setPickAnforderungenUndAngabenRueckfragen] = useState<string | null>(null);
  // „Vorhandene wählen" für den Listenfeld-Rückbezug entscheidungen_und_freigaben.grundlage_anforderungen → anforderungen_und_angaben: hält die Hub-record_id.
  const [pickAnforderungenUndAngabenEntscheidungenUndFreigaben, setPickAnforderungenUndAngabenEntscheidungenUndFreigaben] = useState<string | null>(null);
  const enrichedInformationsquellen = useMemo(() => enrichInformationsquellen(data.informationsquellen, { beteiligteMap: data.beteiligteMap }), [data.informationsquellen, data.beteiligteMap]);
  const enrichedRegelnUndBefugnisse = useMemo(() => enrichRegelnUndBefugnisse(data.regelnUndBefugnisse, { beteiligteMap: data.beteiligteMap }), [data.regelnUndBefugnisse, data.beteiligteMap]);
  const enrichedVorgaenge = useMemo(() => enrichVorgaenge(data.vorgaenge, { beteiligteMap: data.beteiligteMap }), [data.vorgaenge, data.beteiligteMap]);
  const enrichedAnforderungenUndAngaben = useMemo(() => enrichAnforderungenUndAngaben(data.anforderungenUndAngaben, { vorgaengeMap: data.vorgaengeMap, informationsquellenMap: data.informationsquellenMap }), [data.anforderungenUndAngaben, data.vorgaengeMap, data.informationsquellenMap]);
  const enrichedFachlicheBeurteilungen = useMemo(() => enrichFachlicheBeurteilungen(data.fachlicheBeurteilungen, { vorgaengeMap: data.vorgaengeMap, anforderungenUndAngabenMap: data.anforderungenUndAngabenMap, beteiligteMap: data.beteiligteMap }), [data.fachlicheBeurteilungen, data.vorgaengeMap, data.anforderungenUndAngabenMap, data.beteiligteMap]);
  const enrichedRueckfragen = useMemo(() => enrichRueckfragen(data.rueckfragen, { vorgaengeMap: data.vorgaengeMap, anforderungenUndAngabenMap: data.anforderungenUndAngabenMap, beteiligteMap: data.beteiligteMap }), [data.rueckfragen, data.vorgaengeMap, data.anforderungenUndAngabenMap, data.beteiligteMap]);
  const enrichedEntscheidungenUndFreigaben = useMemo(() => enrichEntscheidungenUndFreigaben(data.entscheidungenUndFreigaben, { vorgaengeMap: data.vorgaengeMap, anforderungenUndAngabenMap: data.anforderungenUndAngabenMap, fachlicheBeurteilungenMap: data.fachlicheBeurteilungenMap, regelnUndBefugnisseMap: data.regelnUndBefugnisseMap, beteiligteMap: data.beteiligteMap }), [data.entscheidungenUndFreigaben, data.vorgaengeMap, data.anforderungenUndAngabenMap, data.fachlicheBeurteilungenMap, data.regelnUndBefugnisseMap, data.beteiligteMap]);
  const enrichedErfahrungen = useMemo(() => enrichErfahrungen(data.erfahrungen, { vorgaengeMap: data.vorgaengeMap, beteiligteMap: data.beteiligteMap }), [data.erfahrungen, data.vorgaengeMap, data.beteiligteMap]);

  function detailBeteiligte(record: Beteiligte, push = false) {
    const item: OverlayItem = { type: 'beteiligte', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitBeteiligte(fields: Beteiligte['fields']) {
    const editing = beteiligteDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setBeteiligte(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateBeteiligteEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('beteiligte')} — ${t('crud_updated')}`, async () => {
        data.setBeteiligte(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateBeteiligteEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createBeteiligteEntry(fields);
      undoToast(`${appLabel('beteiligte')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailInformationsquellen(record: Informationsquellen, push = false) {
    const rec = enrichedInformationsquellen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'informationsquellen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitInformationsquellen(fields: Informationsquellen['fields']) {
    const editing = informationsquellenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setInformationsquellen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateInformationsquellenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('informationsquellen')} — ${t('crud_updated')}`, async () => {
        data.setInformationsquellen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateInformationsquellenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createInformationsquellenEntry(fields);
      undoToast(`${appLabel('informationsquellen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRegelnUndBefugnisse(record: RegelnUndBefugnisse, push = false) {
    const rec = enrichedRegelnUndBefugnisse.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'regelnUndBefugnisse', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRegelnUndBefugnisse(fields: RegelnUndBefugnisse['fields']) {
    const editing = regelnUndBefugnisseDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRegelnUndBefugnisse(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRegelnUndBefugnisseEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('regeln_und_befugnisse')} — ${t('crud_updated')}`, async () => {
        data.setRegelnUndBefugnisse(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRegelnUndBefugnisseEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRegelnUndBefugnisseEntry(fields);
      undoToast(`${appLabel('regeln_und_befugnisse')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailVorgaenge(record: Vorgaenge, push = false) {
    const rec = enrichedVorgaenge.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'vorgaenge', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitVorgaenge(fields: Vorgaenge['fields']) {
    const editing = vorgaengeDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setVorgaenge(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateVorgaengeEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('vorgaenge')} — ${t('crud_updated')}`, async () => {
        data.setVorgaenge(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateVorgaengeEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createVorgaengeEntry(fields);
      undoToast(`${appLabel('vorgaenge')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailAnforderungenUndAngaben(record: AnforderungenUndAngaben, push = false) {
    const rec = enrichedAnforderungenUndAngaben.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'anforderungenUndAngaben', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitAnforderungenUndAngaben(fields: AnforderungenUndAngaben['fields']) {
    const editing = anforderungenUndAngabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setAnforderungenUndAngaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateAnforderungenUndAngabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('anforderungen_und_angaben')} — ${t('crud_updated')}`, async () => {
        data.setAnforderungenUndAngaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateAnforderungenUndAngabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createAnforderungenUndAngabenEntry(fields);
      undoToast(`${appLabel('anforderungen_und_angaben')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  // Link an EXISTING Rueckfragen to the AnforderungenUndAngaben hub: append the hub URL to the
  // source's list field. Optimistic setter first, PATCH, undoToast counter-write.
  async function linkAnforderungenUndAngabenRueckfragen(sourceId: string) {
    const hub = pickAnforderungenUndAngabenRueckfragen;
    const src = data.rueckfragen.find(r => r.record_id === sourceId);
    if (!hub || !src) return;
    const ids = extractRecordIds(src.fields.anforderungen);
    if (ids.includes(hub)) return;
    const next = [...ids, hub].map(id => createRecordUrl(APP_IDS.ANFORDERUNGEN_UND_ANGABEN, id));
    data.setRueckfragen(list => list.map(r => (r.record_id === sourceId ? { ...r, fields: { ...r.fields, anforderungen: next } } : r)));
    try {
      await LivingAppsService.updateRueckfragenEntry(sourceId, { anforderungen: next });
    } catch (err) {
      data.fetchAll();
      throw err;
    }
    undoToast(`${appLabel('rueckfragen')} — ${t('pick_linked')}`, async () => {
      data.setRueckfragen(list => list.map(r => (r.record_id === sourceId ? src : r)));
      try { await LivingAppsService.updateRueckfragenEntry(sourceId, { anforderungen: src.fields.anforderungen }); } catch { data.fetchAll(); }
    });
  }

  // Link an EXISTING EntscheidungenUndFreigaben to the AnforderungenUndAngaben hub: append the hub URL to the
  // source's list field. Optimistic setter first, PATCH, undoToast counter-write.
  async function linkAnforderungenUndAngabenEntscheidungenUndFreigaben(sourceId: string) {
    const hub = pickAnforderungenUndAngabenEntscheidungenUndFreigaben;
    const src = data.entscheidungenUndFreigaben.find(r => r.record_id === sourceId);
    if (!hub || !src) return;
    const ids = extractRecordIds(src.fields.grundlage_anforderungen);
    if (ids.includes(hub)) return;
    const next = [...ids, hub].map(id => createRecordUrl(APP_IDS.ANFORDERUNGEN_UND_ANGABEN, id));
    data.setEntscheidungenUndFreigaben(list => list.map(r => (r.record_id === sourceId ? { ...r, fields: { ...r.fields, grundlage_anforderungen: next } } : r)));
    try {
      await LivingAppsService.updateEntscheidungenUndFreigabenEntry(sourceId, { grundlage_anforderungen: next });
    } catch (err) {
      data.fetchAll();
      throw err;
    }
    undoToast(`${appLabel('entscheidungen_und_freigaben')} — ${t('pick_linked')}`, async () => {
      data.setEntscheidungenUndFreigaben(list => list.map(r => (r.record_id === sourceId ? src : r)));
      try { await LivingAppsService.updateEntscheidungenUndFreigabenEntry(sourceId, { grundlage_anforderungen: src.fields.grundlage_anforderungen }); } catch { data.fetchAll(); }
    });
  }

  function detailFachlicheBeurteilungen(record: FachlicheBeurteilungen, push = false) {
    const rec = enrichedFachlicheBeurteilungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'fachlicheBeurteilungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitFachlicheBeurteilungen(fields: FachlicheBeurteilungen['fields']) {
    const editing = fachlicheBeurteilungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setFachlicheBeurteilungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateFachlicheBeurteilungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('fachliche_beurteilungen')} — ${t('crud_updated')}`, async () => {
        data.setFachlicheBeurteilungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateFachlicheBeurteilungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createFachlicheBeurteilungenEntry(fields);
      undoToast(`${appLabel('fachliche_beurteilungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailRueckfragen(record: Rueckfragen, push = false) {
    const rec = enrichedRueckfragen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'rueckfragen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitRueckfragen(fields: Rueckfragen['fields']) {
    const editing = rueckfragenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setRueckfragen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateRueckfragenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('rueckfragen')} — ${t('crud_updated')}`, async () => {
        data.setRueckfragen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateRueckfragenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createRueckfragenEntry(fields);
      undoToast(`${appLabel('rueckfragen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailEntscheidungenUndFreigaben(record: EntscheidungenUndFreigaben, push = false) {
    const rec = enrichedEntscheidungenUndFreigaben.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'entscheidungenUndFreigaben', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitEntscheidungenUndFreigaben(fields: EntscheidungenUndFreigaben['fields']) {
    const editing = entscheidungenUndFreigabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setEntscheidungenUndFreigaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateEntscheidungenUndFreigabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('entscheidungen_und_freigaben')} — ${t('crud_updated')}`, async () => {
        data.setEntscheidungenUndFreigaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateEntscheidungenUndFreigabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createEntscheidungenUndFreigabenEntry(fields);
      undoToast(`${appLabel('entscheidungen_und_freigaben')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailErfahrungen(record: Erfahrungen, push = false) {
    const rec = enrichedErfahrungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'erfahrungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitErfahrungen(fields: Erfahrungen['fields']) {
    const editing = erfahrungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setErfahrungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateErfahrungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('erfahrungen')} — ${t('crud_updated')}`, async () => {
        data.setErfahrungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateErfahrungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createErfahrungenEntry(fields);
      undoToast(`${appLabel('erfahrungen')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <BeteiligteDialog
        open={beteiligteDialog !== null}
        onClose={() => setBeteiligteDialog(null)}
        onSubmit={submitBeteiligte}
        defaultValues={beteiligteDialog?.defaults}
        recordId={beteiligteDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Beteiligte']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Beteiligte']}
      />
      <InformationsquellenDialog
        open={informationsquellenDialog !== null}
        onClose={() => setInformationsquellenDialog(null)}
        onSubmit={submitInformationsquellen}
        defaultValues={informationsquellenDialog?.defaults}
        recordId={informationsquellenDialog?.editing?.record_id}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['Informationsquellen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Informationsquellen']}
      />
      <RegelnUndBefugnisseDialog
        open={regelnUndBefugnisseDialog !== null}
        onClose={() => setRegelnUndBefugnisseDialog(null)}
        onSubmit={submitRegelnUndBefugnisse}
        defaultValues={regelnUndBefugnisseDialog?.defaults}
        recordId={regelnUndBefugnisseDialog?.editing?.record_id}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['RegelnUndBefugnisse']}
        enablePhotoLocation={AI_PHOTO_LOCATION['RegelnUndBefugnisse']}
      />
      <VorgaengeDialog
        open={vorgaengeDialog !== null}
        onClose={() => setVorgaengeDialog(null)}
        onSubmit={submitVorgaenge}
        defaultValues={vorgaengeDialog?.defaults}
        recordId={vorgaengeDialog?.editing?.record_id}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['Vorgaenge']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Vorgaenge']}
      />
      <AnforderungenUndAngabenDialog
        open={anforderungenUndAngabenDialog !== null}
        onClose={() => setAnforderungenUndAngabenDialog(null)}
        onSubmit={submitAnforderungenUndAngaben}
        defaultValues={anforderungenUndAngabenDialog?.defaults}
        recordId={anforderungenUndAngabenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        informationsquellenList={data.informationsquellen}
        enablePhotoScan={AI_PHOTO_SCAN['AnforderungenUndAngaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['AnforderungenUndAngaben']}
      />
      <FachlicheBeurteilungenDialog
        open={fachlicheBeurteilungenDialog !== null}
        onClose={() => setFachlicheBeurteilungenDialog(null)}
        onSubmit={submitFachlicheBeurteilungen}
        defaultValues={fachlicheBeurteilungenDialog?.defaults}
        recordId={fachlicheBeurteilungenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        anforderungenUndAngabenList={data.anforderungenUndAngaben}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['FachlicheBeurteilungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['FachlicheBeurteilungen']}
      />
      <RueckfragenDialog
        open={rueckfragenDialog !== null}
        onClose={() => setRueckfragenDialog(null)}
        onSubmit={submitRueckfragen}
        defaultValues={rueckfragenDialog?.defaults}
        recordId={rueckfragenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        anforderungenUndAngabenList={data.anforderungenUndAngaben}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['Rueckfragen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Rueckfragen']}
      />
      <EntscheidungenUndFreigabenDialog
        open={entscheidungenUndFreigabenDialog !== null}
        onClose={() => setEntscheidungenUndFreigabenDialog(null)}
        onSubmit={submitEntscheidungenUndFreigaben}
        defaultValues={entscheidungenUndFreigabenDialog?.defaults}
        recordId={entscheidungenUndFreigabenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        anforderungenUndAngabenList={data.anforderungenUndAngaben}
        fachlicheBeurteilungenList={data.fachlicheBeurteilungen}
        regelnUndBefugnisseList={data.regelnUndBefugnisse}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['EntscheidungenUndFreigaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['EntscheidungenUndFreigaben']}
      />
      <ErfahrungenDialog
        open={erfahrungenDialog !== null}
        onClose={() => setErfahrungenDialog(null)}
        onSubmit={submitErfahrungen}
        defaultValues={erfahrungenDialog?.defaults}
        recordId={erfahrungenDialog?.editing?.record_id}
        vorgaengeList={data.vorgaenge}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['Erfahrungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Erfahrungen']}
      />
      <PickExistingDialog
        open={pickAnforderungenUndAngabenRueckfragen !== null}
        onClose={() => setPickAnforderungenUndAngabenRueckfragen(null)}
        title={t('pick_title', { title: appLabel('rueckfragen') })}
        items={data.rueckfragen
          .filter(r => !extractRecordIds(r.fields.anforderungen).includes(pickAnforderungenUndAngabenRueckfragen ?? ''))
          .map(r => ({ id: r.record_id, label: String(r.fields.buendelkennung ?? appLabel('rueckfragen')), hint: r.fields.antwortdatum ? String(r.fields.antwortdatum) : undefined }))}
        onPick={linkAnforderungenUndAngabenRueckfragen}
      />
      <PickExistingDialog
        open={pickAnforderungenUndAngabenEntscheidungenUndFreigaben !== null}
        onClose={() => setPickAnforderungenUndAngabenEntscheidungenUndFreigaben(null)}
        title={t('pick_title', { title: appLabel('entscheidungen_und_freigaben') })}
        items={data.entscheidungenUndFreigaben
          .filter(r => !extractRecordIds(r.fields.grundlage_anforderungen).includes(pickAnforderungenUndAngabenEntscheidungenUndFreigaben ?? ''))
          .map(r => ({ id: r.record_id, label: String(appLabel('entscheidungen_und_freigaben')), hint: r.fields.entscheidungsdatum ? String(r.fields.entscheidungsdatum) : undefined }))}
        onPick={linkAnforderungenUndAngabenEntscheidungenUndFreigaben}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'beteiligte') {
            return (
              <>
                <RecordHeader title={top.record.fields.vorname ?? appLabel('beteiligte')} subtitle={undefined} />
                <BeteiligteDetails
                  record={top.record}
                  informationsquellenList={data.informationsquellen}
                  onOpenInformationsquellen={(r) => detailInformationsquellen(r, true)}
                  onAddInformationsquellen={perms.canWrite('informationsquellen') ? () => setInformationsquellenDialog({ defaults: { verantwortlicher: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  regelnUndBefugnisseList={data.regelnUndBefugnisse}
                  onOpenRegelnUndBefugnisse={(r) => detailRegelnUndBefugnisse(r, true)}
                  onAddRegelnUndBefugnisse={perms.canWrite('regeln_und_befugnisse') ? () => setRegelnUndBefugnisseDialog({ defaults: { berechtigter: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  vorgaengeKundeList={data.vorgaenge}
                  onOpenVorgaengeKunde={(r) => detailVorgaenge(r, true)}
                  onAddVorgaengeKunde={perms.canWrite('vorgaenge') ? () => setVorgaengeDialog({ defaults: { kunde: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  vorgaengeBearbeiterList={data.vorgaenge}
                  onOpenVorgaengeBearbeiter={(r) => detailVorgaenge(r, true)}
                  onAddVorgaengeBearbeiter={perms.canWrite('vorgaenge') ? () => setVorgaengeDialog({ defaults: { bearbeiter: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  fachlicheBeurteilungenList={data.fachlicheBeurteilungen}
                  onOpenFachlicheBeurteilungen={(r) => detailFachlicheBeurteilungen(r, true)}
                  onAddFachlicheBeurteilungen={perms.canWrite('fachliche_beurteilungen') ? () => setFachlicheBeurteilungenDialog({ defaults: { beurteiler: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  rueckfragenList={data.rueckfragen}
                  onOpenRueckfragen={(r) => detailRueckfragen(r, true)}
                  onAddRueckfragen={perms.canWrite('rueckfragen') ? () => setRueckfragenDialog({ defaults: { adressat: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  entscheidungenUndFreigabenList={data.entscheidungenUndFreigaben}
                  onOpenEntscheidungenUndFreigaben={(r) => detailEntscheidungenUndFreigaben(r, true)}
                  onAddEntscheidungenUndFreigaben={perms.canWrite('entscheidungen_und_freigaben') ? () => setEntscheidungenUndFreigabenDialog({ defaults: { entscheider: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  erfahrungenList={data.erfahrungen}
                  onOpenErfahrungen={(r) => detailErfahrungen(r, true)}
                  onAddErfahrungen={perms.canWrite('erfahrungen') ? () => setErfahrungenDialog({ defaults: { pruefer: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'informationsquellen') {
            return (
              <>
                <RecordHeader title={top.record.fields.bezeichnung ?? appLabel('informationsquellen')} subtitle={undefined} />
                <InformationsquellenDetails
                  record={top.record}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                  anforderungenUndAngabenList={data.anforderungenUndAngaben}
                  onOpenAnforderungenUndAngaben={(r) => detailAnforderungenUndAngaben(r, true)}
                  onAddAnforderungenUndAngaben={perms.canWrite('anforderungen_und_angaben') ? () => setAnforderungenUndAngabenDialog({ defaults: { informationsquelle: createRecordUrl(APP_IDS.INFORMATIONSQUELLEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'regelnUndBefugnisse') {
            return (
              <>
                <RecordHeader title={top.record.fields.regelbezeichnung ?? appLabel('regeln_und_befugnisse')} subtitle={top.record.fields.gueltig_ab ? formatDate(top.record.fields.gueltig_ab) : undefined} />
                <RegelnUndBefugnisseDetails
                  record={top.record}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                  entscheidungenUndFreigabenList={data.entscheidungenUndFreigaben}
                  onOpenEntscheidungenUndFreigaben={(r) => detailEntscheidungenUndFreigaben(r, true)}
                  onAddEntscheidungenUndFreigaben={perms.canWrite('entscheidungen_und_freigaben') ? () => setEntscheidungenUndFreigabenDialog({ defaults: { regel: createRecordUrl(APP_IDS.REGELN_UND_BEFUGNISSE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'vorgaenge') {
            return (
              <>
                <RecordHeader title={top.record.fields.vorgangsnummer ?? appLabel('vorgaenge')} subtitle={top.record.fields.eingangsdatum ? formatDate(top.record.fields.eingangsdatum) : undefined} />
                <VorgaengeDetails
                  record={top.record}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                  anforderungenUndAngabenList={data.anforderungenUndAngaben}
                  onOpenAnforderungenUndAngaben={(r) => detailAnforderungenUndAngaben(r, true)}
                  onAddAnforderungenUndAngaben={perms.canWrite('anforderungen_und_angaben') ? () => setAnforderungenUndAngabenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  fachlicheBeurteilungenList={data.fachlicheBeurteilungen}
                  onOpenFachlicheBeurteilungen={(r) => detailFachlicheBeurteilungen(r, true)}
                  onAddFachlicheBeurteilungen={perms.canWrite('fachliche_beurteilungen') ? () => setFachlicheBeurteilungenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  rueckfragenList={data.rueckfragen}
                  onOpenRueckfragen={(r) => detailRueckfragen(r, true)}
                  onAddRueckfragen={perms.canWrite('rueckfragen') ? () => setRueckfragenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  entscheidungenUndFreigabenList={data.entscheidungenUndFreigaben}
                  onOpenEntscheidungenUndFreigaben={(r) => detailEntscheidungenUndFreigaben(r, true)}
                  onAddEntscheidungenUndFreigaben={perms.canWrite('entscheidungen_und_freigaben') ? () => setEntscheidungenUndFreigabenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                  erfahrungenList={data.erfahrungen}
                  onOpenErfahrungen={(r) => detailErfahrungen(r, true)}
                  onAddErfahrungen={perms.canWrite('erfahrungen') ? () => setErfahrungenDialog({ defaults: { vorgang: createRecordUrl(APP_IDS.VORGAENGE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'anforderungenUndAngaben') {
            return (
              <>
                <RecordHeader title={top.record.fields.bezeichnung ?? appLabel('anforderungen_und_angaben')} subtitle={undefined} />
                <AnforderungenUndAngabenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  informationsquellenList={data.informationsquellen}
                  onOpenInformationsquellen={(r) => detailInformationsquellen(r, true)}
                  fachlicheBeurteilungenList={data.fachlicheBeurteilungen}
                  onOpenFachlicheBeurteilungen={(r) => detailFachlicheBeurteilungen(r, true)}
                  onAddFachlicheBeurteilungen={perms.canWrite('fachliche_beurteilungen') ? () => setFachlicheBeurteilungenDialog({ defaults: { anforderung: createRecordUrl(APP_IDS.ANFORDERUNGEN_UND_ANGABEN, top.record.record_id) } }) : undefined}
                  rueckfragenList={data.rueckfragen}
                  onOpenRueckfragen={(r) => detailRueckfragen(r, true)}
                  onAddRueckfragen={perms.canWrite('rueckfragen') ? () => setRueckfragenDialog({ defaults: { anforderungen: [createRecordUrl(APP_IDS.ANFORDERUNGEN_UND_ANGABEN, top.record.record_id)] } }) : undefined}
                  onPickRueckfragen={perms.canWrite('rueckfragen') ? () => setPickAnforderungenUndAngabenRueckfragen(top.record.record_id) : undefined}
                  entscheidungenUndFreigabenList={data.entscheidungenUndFreigaben}
                  onOpenEntscheidungenUndFreigaben={(r) => detailEntscheidungenUndFreigaben(r, true)}
                  onAddEntscheidungenUndFreigaben={perms.canWrite('entscheidungen_und_freigaben') ? () => setEntscheidungenUndFreigabenDialog({ defaults: { grundlage_anforderungen: [createRecordUrl(APP_IDS.ANFORDERUNGEN_UND_ANGABEN, top.record.record_id)] } }) : undefined}
                  onPickEntscheidungenUndFreigaben={perms.canWrite('entscheidungen_und_freigaben') ? () => setPickAnforderungenUndAngabenEntscheidungenUndFreigaben(top.record.record_id) : undefined}
                />
              </>
            );
          }
          if (top.type === 'fachlicheBeurteilungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.ergebnis ?? appLabel('fachliche_beurteilungen')} subtitle={top.record.fields.beurteilungsdatum ? formatDate(top.record.fields.beurteilungsdatum) : undefined} />
                <FachlicheBeurteilungenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  anforderungenUndAngabenList={data.anforderungenUndAngaben}
                  onOpenAnforderungenUndAngaben={(r) => detailAnforderungenUndAngaben(r, true)}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                  entscheidungenUndFreigabenList={data.entscheidungenUndFreigaben}
                  onOpenEntscheidungenUndFreigaben={(r) => detailEntscheidungenUndFreigaben(r, true)}
                  onAddEntscheidungenUndFreigaben={perms.canWrite('entscheidungen_und_freigaben') ? () => setEntscheidungenUndFreigabenDialog({ defaults: { beurteilung: createRecordUrl(APP_IDS.FACHLICHE_BEURTEILUNGEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'rueckfragen') {
            return (
              <>
                <RecordHeader title={top.record.fields.buendelkennung ?? appLabel('rueckfragen')} subtitle={top.record.fields.antwortdatum ? formatDate(top.record.fields.antwortdatum) : undefined} />
                <RueckfragenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  anforderungenUndAngabenList={data.anforderungenUndAngaben}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                />
              </>
            );
          }
          if (top.type === 'entscheidungenUndFreigaben') {
            return (
              <>
                <RecordHeader title={appLabel('entscheidungen_und_freigaben')} subtitle={top.record.fields.entscheidungsdatum ? formatDate(top.record.fields.entscheidungsdatum) : undefined} />
                <EntscheidungenUndFreigabenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  anforderungenUndAngabenList={data.anforderungenUndAngaben}
                  fachlicheBeurteilungenList={data.fachlicheBeurteilungen}
                  onOpenFachlicheBeurteilungen={(r) => detailFachlicheBeurteilungen(r, true)}
                  regelnUndBefugnisseList={data.regelnUndBefugnisse}
                  onOpenRegelnUndBefugnisse={(r) => detailRegelnUndBefugnisse(r, true)}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                />
              </>
            );
          }
          if (top.type === 'erfahrungen') {
            return (
              <>
                <RecordHeader title={top.record.fields.titel ?? appLabel('erfahrungen')} subtitle={undefined} />
                <ErfahrungenDetails
                  record={top.record}
                  vorgaengeList={data.vorgaenge}
                  onOpenVorgaenge={(r) => detailVorgaenge(r, true)}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'beteiligte') return perms.canWrite('beteiligte');
          if (top.type === 'informationsquellen') return perms.canWrite('informationsquellen');
          if (top.type === 'regelnUndBefugnisse') return perms.canWrite('regeln_und_befugnisse');
          if (top.type === 'vorgaenge') return perms.canWrite('vorgaenge');
          if (top.type === 'anforderungenUndAngaben') return perms.canWrite('anforderungen_und_angaben');
          if (top.type === 'fachlicheBeurteilungen') return perms.canWrite('fachliche_beurteilungen');
          if (top.type === 'rueckfragen') return perms.canWrite('rueckfragen');
          if (top.type === 'entscheidungenUndFreigaben') return perms.canWrite('entscheidungen_und_freigaben');
          if (top.type === 'erfahrungen') return perms.canWrite('erfahrungen');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'beteiligte') setBeteiligteDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'informationsquellen') setInformationsquellenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'regelnUndBefugnisse') setRegelnUndBefugnisseDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'vorgaenge') setVorgaengeDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'anforderungenUndAngaben') setAnforderungenUndAngabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'fachlicheBeurteilungen') setFachlicheBeurteilungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'rueckfragen') setRueckfragenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'entscheidungenUndFreigaben') setEntscheidungenUndFreigabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'erfahrungen') setErfahrungenDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    beteiligte: {
      openCreate: (defaults?: BeteiligteDialogDefaults) => (perms.canWrite('beteiligte') ? setBeteiligteDialog({ defaults }) : refuse()),
      openEdit: (record: Beteiligte) => (perms.canWrite('beteiligte') ? setBeteiligteDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Beteiligte) => detailBeteiligte(record, false),
      canWrite: perms.canWrite('beteiligte'),
    },
    informationsquellen: {
      openCreate: (defaults?: InformationsquellenDialogDefaults) => (perms.canWrite('informationsquellen') ? setInformationsquellenDialog({ defaults }) : refuse()),
      openEdit: (record: Informationsquellen) => (perms.canWrite('informationsquellen') ? setInformationsquellenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Informationsquellen) => detailInformationsquellen(record, false),
      canWrite: perms.canWrite('informationsquellen'),
    },
    regelnUndBefugnisse: {
      openCreate: (defaults?: RegelnUndBefugnisseDialogDefaults) => (perms.canWrite('regeln_und_befugnisse') ? setRegelnUndBefugnisseDialog({ defaults }) : refuse()),
      openEdit: (record: RegelnUndBefugnisse) => (perms.canWrite('regeln_und_befugnisse') ? setRegelnUndBefugnisseDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: RegelnUndBefugnisse) => detailRegelnUndBefugnisse(record, false),
      canWrite: perms.canWrite('regeln_und_befugnisse'),
    },
    vorgaenge: {
      openCreate: (defaults?: VorgaengeDialogDefaults) => (perms.canWrite('vorgaenge') ? setVorgaengeDialog({ defaults }) : refuse()),
      openEdit: (record: Vorgaenge) => (perms.canWrite('vorgaenge') ? setVorgaengeDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Vorgaenge) => detailVorgaenge(record, false),
      canWrite: perms.canWrite('vorgaenge'),
    },
    anforderungenUndAngaben: {
      openCreate: (defaults?: AnforderungenUndAngabenDialogDefaults) => (perms.canWrite('anforderungen_und_angaben') ? setAnforderungenUndAngabenDialog({ defaults }) : refuse()),
      openEdit: (record: AnforderungenUndAngaben) => (perms.canWrite('anforderungen_und_angaben') ? setAnforderungenUndAngabenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: AnforderungenUndAngaben) => detailAnforderungenUndAngaben(record, false),
      canWrite: perms.canWrite('anforderungen_und_angaben'),
    },
    fachlicheBeurteilungen: {
      openCreate: (defaults?: FachlicheBeurteilungenDialogDefaults) => (perms.canWrite('fachliche_beurteilungen') ? setFachlicheBeurteilungenDialog({ defaults }) : refuse()),
      openEdit: (record: FachlicheBeurteilungen) => (perms.canWrite('fachliche_beurteilungen') ? setFachlicheBeurteilungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: FachlicheBeurteilungen) => detailFachlicheBeurteilungen(record, false),
      canWrite: perms.canWrite('fachliche_beurteilungen'),
    },
    rueckfragen: {
      openCreate: (defaults?: RueckfragenDialogDefaults) => (perms.canWrite('rueckfragen') ? setRueckfragenDialog({ defaults }) : refuse()),
      openEdit: (record: Rueckfragen) => (perms.canWrite('rueckfragen') ? setRueckfragenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Rueckfragen) => detailRueckfragen(record, false),
      canWrite: perms.canWrite('rueckfragen'),
    },
    entscheidungenUndFreigaben: {
      openCreate: (defaults?: EntscheidungenUndFreigabenDialogDefaults) => (perms.canWrite('entscheidungen_und_freigaben') ? setEntscheidungenUndFreigabenDialog({ defaults }) : refuse()),
      openEdit: (record: EntscheidungenUndFreigaben) => (perms.canWrite('entscheidungen_und_freigaben') ? setEntscheidungenUndFreigabenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: EntscheidungenUndFreigaben) => detailEntscheidungenUndFreigaben(record, false),
      canWrite: perms.canWrite('entscheidungen_und_freigaben'),
    },
    erfahrungen: {
      openCreate: (defaults?: ErfahrungenDialogDefaults) => (perms.canWrite('erfahrungen') ? setErfahrungenDialog({ defaults }) : refuse()),
      openEdit: (record: Erfahrungen) => (perms.canWrite('erfahrungen') ? setErfahrungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Erfahrungen) => detailErfahrungen(record, false),
      canWrite: perms.canWrite('erfahrungen'),
    },
    enriched: { beteiligte: data.beteiligte, informationsquellen: enrichedInformationsquellen, regelnUndBefugnisse: enrichedRegelnUndBefugnisse, vorgaenge: enrichedVorgaenge, anforderungenUndAngaben: enrichedAnforderungenUndAngaben, fachlicheBeurteilungen: enrichedFachlicheBeurteilungen, rueckfragen: enrichedRueckfragen, entscheidungenUndFreigaben: enrichedEntscheidungenUndFreigaben, erfahrungen: enrichedErfahrungen },
  };
}
