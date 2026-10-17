import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Beteiligte, Informationsquellen, RegelnUndBefugnisse, Vorgaenge, AnforderungenUndAngaben, FachlicheBeurteilungen, Rueckfragen, EntscheidungenUndFreigaben, Erfahrungen } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { t } from '@/i18n';

/** Dashboard data + the OPTIMISTIC-WRITE API.
 *
 *  The per-entity setters (`set<Entity>`) are exported for exactly one job:
 *  optimistic updates on drag writes (onEventDrop / onEventResize /
 *  onCardMove). Call the setter FIRST — the bar/card lands instantly — then
 *  fire the PATCH in the background and call `fetchAll()` ONLY in the catch.
 *  Never await the PATCH before updating state (the UI freezes for the full
 *  round-trip on every drag) and never refetch after a successful write.
 *  There is no other mechanism (no `__optimistic`, no `mutate`).
 */
/** Entities this hook can load — the same keys the journey layer uses. */
export type DashboardEntity = 'beteiligte' | 'informationsquellen' | 'regeln_und_befugnisse' | 'vorgaenge' | 'anforderungen_und_angaben' | 'fachliche_beurteilungen' | 'rueckfragen' | 'entscheidungen_und_freigaben' | 'erfahrungen';

export interface DashboardDataOptions {
  /** Entities this page does NOT need (picked through useRecordSearch instead).
   *  Every flow page mounts this hook on its own route, so without `omit` a
   *  page that searches 3.000 guests server-side would still pull all 3.000
   *  through the side door. */
  omit?: DashboardEntity[];
}

export function useDashboardData(options: DashboardDataOptions = {}) {
  // A string key, not the array: an inline `omit={['gaeste']}` is a new array
  // on every render and would restart the fetch forever.
  const omitKey = (options.omit ?? []).slice().sort().join('|');
  const [beteiligte, setBeteiligte] = useState<Beteiligte[]>([]);
  const [informationsquellen, setInformationsquellen] = useState<Informationsquellen[]>([]);
  const [regelnUndBefugnisse, setRegelnUndBefugnisse] = useState<RegelnUndBefugnisse[]>([]);
  const [vorgaenge, setVorgaenge] = useState<Vorgaenge[]>([]);
  const [anforderungenUndAngaben, setAnforderungenUndAngaben] = useState<AnforderungenUndAngaben[]>([]);
  const [fachlicheBeurteilungen, setFachlicheBeurteilungen] = useState<FachlicheBeurteilungen[]>([]);
  const [rueckfragen, setRueckfragen] = useState<Rueckfragen[]>([]);
  const [entscheidungenUndFreigaben, setEntscheidungenUndFreigaben] = useState<EntscheidungenUndFreigaben[]>([]);
  const [erfahrungen, setErfahrungen] = useState<Erfahrungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  /** Lists the signed-in user may not read (403 on the platform). They load as
   *  empty and the rest of the page loads normally — one forbidden list used to
   *  empty the whole dashboard (05.10.2026). Hide a block whose list is here. */
  const [forbidden, setForbidden] = useState<DashboardEntity[]>([]);

  // Every list on its own: a 403 is „not yours“, any other failure is an error.
  const settle = useCallback((settled: PromiseSettledResult<unknown>[]) => {
    const denied: DashboardEntity[] = [];
    let failure: unknown = null;
    // null = this list failed for another reason: its current data stays
    const pick = <T,>(i: number, key: DashboardEntity): T[] | null => {
      const s = settled[i];
      if (s.status === 'fulfilled') return s.value as T[];
      if ((s.reason as { status?: number } | null)?.status === 403) { denied.push(key); return []; }
      failure = failure ?? s.reason;
      return null;
    };
    { const rows = pick<Beteiligte>(0, 'beteiligte'); if (rows) setBeteiligte(rows); }
    { const rows = pick<Informationsquellen>(1, 'informationsquellen'); if (rows) setInformationsquellen(rows); }
    { const rows = pick<RegelnUndBefugnisse>(2, 'regeln_und_befugnisse'); if (rows) setRegelnUndBefugnisse(rows); }
    { const rows = pick<Vorgaenge>(3, 'vorgaenge'); if (rows) setVorgaenge(rows); }
    { const rows = pick<AnforderungenUndAngaben>(4, 'anforderungen_und_angaben'); if (rows) setAnforderungenUndAngaben(rows); }
    { const rows = pick<FachlicheBeurteilungen>(5, 'fachliche_beurteilungen'); if (rows) setFachlicheBeurteilungen(rows); }
    { const rows = pick<Rueckfragen>(6, 'rueckfragen'); if (rows) setRueckfragen(rows); }
    { const rows = pick<EntscheidungenUndFreigaben>(7, 'entscheidungen_und_freigaben'); if (rows) setEntscheidungenUndFreigaben(rows); }
    { const rows = pick<Erfahrungen>(8, 'erfahrungen'); if (rows) setErfahrungen(rows); }
    setForbidden(prev => (prev.join('|') === denied.join('|') ? prev : denied));
    return failure;
  }, []);

  const fetchAll = useCallback(async () => {
    setError(null);
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    try {
      const failure = settle(await Promise.allSettled([
        omit.has('beteiligte') ? Promise.resolve([] as Beteiligte[]) : LivingAppsService.getBeteiligte(),
        omit.has('informationsquellen') ? Promise.resolve([] as Informationsquellen[]) : LivingAppsService.getInformationsquellen(),
        omit.has('regeln_und_befugnisse') ? Promise.resolve([] as RegelnUndBefugnisse[]) : LivingAppsService.getRegelnUndBefugnisse(),
        omit.has('vorgaenge') ? Promise.resolve([] as Vorgaenge[]) : LivingAppsService.getVorgaenge(),
        omit.has('anforderungen_und_angaben') ? Promise.resolve([] as AnforderungenUndAngaben[]) : LivingAppsService.getAnforderungenUndAngaben(),
        omit.has('fachliche_beurteilungen') ? Promise.resolve([] as FachlicheBeurteilungen[]) : LivingAppsService.getFachlicheBeurteilungen(),
        omit.has('rueckfragen') ? Promise.resolve([] as Rueckfragen[]) : LivingAppsService.getRueckfragen(),
        omit.has('entscheidungen_und_freigaben') ? Promise.resolve([] as EntscheidungenUndFreigaben[]) : LivingAppsService.getEntscheidungenUndFreigaben(),
        omit.has('erfahrungen') ? Promise.resolve([] as Erfahrungen[]) : LivingAppsService.getErfahrungen(),
      ]));
      if (failure) throw failure;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t('data_load_failed')));
    } finally {
      setLoading(false);
    }
  }, [omitKey, settle]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    const omit = new Set(omitKey ? omitKey.split('|') : []);
    async function silentRefresh() {
      try {
        // a failed list keeps its stale data out of the way: settle() only
        // replaces what loaded or was refused
        settle(await Promise.allSettled([
          omit.has('beteiligte') ? Promise.resolve([] as Beteiligte[]) : LivingAppsService.getBeteiligte(),
          omit.has('informationsquellen') ? Promise.resolve([] as Informationsquellen[]) : LivingAppsService.getInformationsquellen(),
          omit.has('regeln_und_befugnisse') ? Promise.resolve([] as RegelnUndBefugnisse[]) : LivingAppsService.getRegelnUndBefugnisse(),
          omit.has('vorgaenge') ? Promise.resolve([] as Vorgaenge[]) : LivingAppsService.getVorgaenge(),
          omit.has('anforderungen_und_angaben') ? Promise.resolve([] as AnforderungenUndAngaben[]) : LivingAppsService.getAnforderungenUndAngaben(),
          omit.has('fachliche_beurteilungen') ? Promise.resolve([] as FachlicheBeurteilungen[]) : LivingAppsService.getFachlicheBeurteilungen(),
          omit.has('rueckfragen') ? Promise.resolve([] as Rueckfragen[]) : LivingAppsService.getRueckfragen(),
          omit.has('entscheidungen_und_freigaben') ? Promise.resolve([] as EntscheidungenUndFreigaben[]) : LivingAppsService.getEntscheidungenUndFreigaben(),
          omit.has('erfahrungen') ? Promise.resolve([] as Erfahrungen[]) : LivingAppsService.getErfahrungen(),
        ]));
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    // assistant:data-changed comes from the assistant (<la-klar-assistant>)
    // after every mutation. The element additionally fires the legacy
    // dashboard-refresh event for OLD deployed bundles — do NOT subscribe to
    // both here, or every mutation fetches twice.
    window.addEventListener('assistant:data-changed', handleRefresh);
    return () => window.removeEventListener('assistant:data-changed', handleRefresh);
  }, [omitKey, settle]);

  const beteiligteMap = useMemo(() => {
    const m = new Map<string, Beteiligte>();
    beteiligte.forEach(r => m.set(r.record_id, r));
    return m;
  }, [beteiligte]);

  const informationsquellenMap = useMemo(() => {
    const m = new Map<string, Informationsquellen>();
    informationsquellen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [informationsquellen]);

  const regelnUndBefugnisseMap = useMemo(() => {
    const m = new Map<string, RegelnUndBefugnisse>();
    regelnUndBefugnisse.forEach(r => m.set(r.record_id, r));
    return m;
  }, [regelnUndBefugnisse]);

  const vorgaengeMap = useMemo(() => {
    const m = new Map<string, Vorgaenge>();
    vorgaenge.forEach(r => m.set(r.record_id, r));
    return m;
  }, [vorgaenge]);

  const anforderungenUndAngabenMap = useMemo(() => {
    const m = new Map<string, AnforderungenUndAngaben>();
    anforderungenUndAngaben.forEach(r => m.set(r.record_id, r));
    return m;
  }, [anforderungenUndAngaben]);

  const fachlicheBeurteilungenMap = useMemo(() => {
    const m = new Map<string, FachlicheBeurteilungen>();
    fachlicheBeurteilungen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [fachlicheBeurteilungen]);

  return { beteiligte, setBeteiligte, informationsquellen, setInformationsquellen, regelnUndBefugnisse, setRegelnUndBefugnisse, vorgaenge, setVorgaenge, anforderungenUndAngaben, setAnforderungenUndAngaben, fachlicheBeurteilungen, setFachlicheBeurteilungen, rueckfragen, setRueckfragen, entscheidungenUndFreigaben, setEntscheidungenUndFreigaben, erfahrungen, setErfahrungen, loading, error, fetchAll, forbidden, beteiligteMap, informationsquellenMap, regelnUndBefugnisseMap, vorgaengeMap, anforderungenUndAngabenMap, fachlicheBeurteilungenMap };
}

/** The hook's return — the `data` prop of DashboardOverview in the Ready-Wrapper form. */
export type DashboardData = ReturnType<typeof useDashboardData>;