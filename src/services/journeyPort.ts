/**
 * The INTERNAL door of the journey port — authenticated, via LivingAppsService.
 * GENERATED: one lister and one creator per entity. Do not edit.
 *
 *   import { servicePort } from '@/services/journeyPort';
 *
 * Intent pages hand this to `useJourneySubmit` and to shared step blocks. It
 * exposes only list · create · ref — the public subset — so a step written
 * against it also runs on a public page. Undo, edit and delete stay on the
 * page itself (LivingAppsService), never inside a shared step.
 */
import { LivingAppsService, createRecordUrl, type RecordQuery } from '@/services/livingAppsService';
import { toWirePayload, type InternalJourneyPort, type JourneyRecord } from '@/lib/journey/port';
import { buildSearchFilter, byIdFilter, combineFilters } from '@/lib/journey/search';
import type { EntityKey } from '@/lib/journey/rules';

type RawRecord = { record_id: string; fields: Record<string, unknown>; createdat?: string | null };
type RawMutation = { record_id: string; fields?: Record<string, unknown>; created_at?: string | null };

const listers: Record<EntityKey, () => Promise<RawRecord[]>> = {
  'beteiligte': () => LivingAppsService.getBeteiligte() as Promise<RawRecord[]>,
  'informationsquellen': () => LivingAppsService.getInformationsquellen() as Promise<RawRecord[]>,
  'regeln_und_befugnisse': () => LivingAppsService.getRegelnUndBefugnisse() as Promise<RawRecord[]>,
  'vorgaenge': () => LivingAppsService.getVorgaenge() as Promise<RawRecord[]>,
  'anforderungen_und_angaben': () => LivingAppsService.getAnforderungenUndAngaben() as Promise<RawRecord[]>,
  'fachliche_beurteilungen': () => LivingAppsService.getFachlicheBeurteilungen() as Promise<RawRecord[]>,
  'rueckfragen': () => LivingAppsService.getRueckfragen() as Promise<RawRecord[]>,
  'entscheidungen_und_freigaben': () => LivingAppsService.getEntscheidungenUndFreigaben() as Promise<RawRecord[]>,
  'erfahrungen': () => LivingAppsService.getErfahrungen() as Promise<RawRecord[]>,
};

/** The query/count half — the REST parameters the plain listers never send. */
const queriers: Record<EntityKey, (q: RecordQuery) => Promise<RawRecord[]>> = {
  'beteiligte': q => LivingAppsService.queryBeteiligte(q) as Promise<RawRecord[]>,
  'informationsquellen': q => LivingAppsService.queryInformationsquellen(q) as Promise<RawRecord[]>,
  'regeln_und_befugnisse': q => LivingAppsService.queryRegelnUndBefugnisse(q) as Promise<RawRecord[]>,
  'vorgaenge': q => LivingAppsService.queryVorgaenge(q) as Promise<RawRecord[]>,
  'anforderungen_und_angaben': q => LivingAppsService.queryAnforderungenUndAngaben(q) as Promise<RawRecord[]>,
  'fachliche_beurteilungen': q => LivingAppsService.queryFachlicheBeurteilungen(q) as Promise<RawRecord[]>,
  'rueckfragen': q => LivingAppsService.queryRueckfragen(q) as Promise<RawRecord[]>,
  'entscheidungen_und_freigaben': q => LivingAppsService.queryEntscheidungenUndFreigaben(q) as Promise<RawRecord[]>,
  'erfahrungen': q => LivingAppsService.queryErfahrungen(q) as Promise<RawRecord[]>,
};

const counters: Record<EntityKey, (filter?: string, signal?: AbortSignal) => Promise<number>> = {
  'beteiligte': (filter, signal) => LivingAppsService.countBeteiligte(filter, signal),
  'informationsquellen': (filter, signal) => LivingAppsService.countInformationsquellen(filter, signal),
  'regeln_und_befugnisse': (filter, signal) => LivingAppsService.countRegelnUndBefugnisse(filter, signal),
  'vorgaenge': (filter, signal) => LivingAppsService.countVorgaenge(filter, signal),
  'anforderungen_und_angaben': (filter, signal) => LivingAppsService.countAnforderungenUndAngaben(filter, signal),
  'fachliche_beurteilungen': (filter, signal) => LivingAppsService.countFachlicheBeurteilungen(filter, signal),
  'rueckfragen': (filter, signal) => LivingAppsService.countRueckfragen(filter, signal),
  'entscheidungen_und_freigaben': (filter, signal) => LivingAppsService.countEntscheidungenUndFreigaben(filter, signal),
  'erfahrungen': (filter, signal) => LivingAppsService.countErfahrungen(filter, signal),
};

const creators: Record<EntityKey, (fields: Record<string, unknown>) => Promise<RawMutation>> = {
  'beteiligte': fields => LivingAppsService.createBeteiligteEntry(fields as never),
  'informationsquellen': fields => LivingAppsService.createInformationsquellenEntry(fields as never),
  'regeln_und_befugnisse': fields => LivingAppsService.createRegelnUndBefugnisseEntry(fields as never),
  'vorgaenge': fields => LivingAppsService.createVorgaengeEntry(fields as never),
  'anforderungen_und_angaben': fields => LivingAppsService.createAnforderungenUndAngabenEntry(fields as never),
  'fachliche_beurteilungen': fields => LivingAppsService.createFachlicheBeurteilungenEntry(fields as never),
  'rueckfragen': fields => LivingAppsService.createRueckfragenEntry(fields as never),
  'entscheidungen_und_freigaben': fields => LivingAppsService.createEntscheidungenUndFreigabenEntry(fields as never),
  'erfahrungen': fields => LivingAppsService.createErfahrungenEntry(fields as never),
};

const updaters: Record<EntityKey, (id: string, fields: Record<string, unknown>) => Promise<RawMutation>> = {
  'beteiligte': (id, fields) => LivingAppsService.updateBeteiligteEntry(id, fields as never),
  'informationsquellen': (id, fields) => LivingAppsService.updateInformationsquellenEntry(id, fields as never),
  'regeln_und_befugnisse': (id, fields) => LivingAppsService.updateRegelnUndBefugnisseEntry(id, fields as never),
  'vorgaenge': (id, fields) => LivingAppsService.updateVorgaengeEntry(id, fields as never),
  'anforderungen_und_angaben': (id, fields) => LivingAppsService.updateAnforderungenUndAngabenEntry(id, fields as never),
  'fachliche_beurteilungen': (id, fields) => LivingAppsService.updateFachlicheBeurteilungenEntry(id, fields as never),
  'rueckfragen': (id, fields) => LivingAppsService.updateRueckfragenEntry(id, fields as never),
  'entscheidungen_und_freigaben': (id, fields) => LivingAppsService.updateEntscheidungenUndFreigabenEntry(id, fields as never),
  'erfahrungen': (id, fields) => LivingAppsService.updateErfahrungenEntry(id, fields as never),
};

function toJourneyRecord(r: RawRecord): JourneyRecord {
  return { id: r.record_id, fields: r.fields ?? {}, createdAt: r.createdat ?? null };
}

export const servicePort: InternalJourneyPort = {
  door: 'internal',
  async list(entity, opts) {
    // Only a bare list(entity) (or an empty options object) takes the historic
    // load-everything path. ANY explicit option — `limit` included — goes to the
    // server: useRecordSearch's first page of a big entity must not pull the
    // whole table (live 2026-09-02: all 263 employees travelled for a limit-50
    // first page because `limit` alone did not count as a query).
    const usesQuery = !!opts && (opts.search !== undefined || opts.offset !== undefined
      || opts.orderby !== undefined || opts.fields !== undefined || opts.signal !== undefined
      || opts.limit !== undefined || opts.filter !== undefined);
    if (!usesQuery) {
      const rows = await listers[entity]();
      const limited = opts?.limit ? rows.slice(0, opts.limit) : rows;
      return limited.map(toJourneyRecord);
    }
    const filter = combineFilters(opts.filter, opts.search ? buildSearchFilter(opts.search.query, opts.search.fields) : undefined);
    const rows = await queriers[entity]({
      filter, orderby: opts.orderby, limit: opts.limit, offset: opts.offset, fields: opts.fields, signal: opts.signal,
    });
    return rows.map(toJourneyRecord);
  },
  async count(entity, opts) {
    const filter = combineFilters(opts?.filter, opts?.search ? buildSearchFilter(opts.search.query, opts.search.fields) : undefined);
    return counters[entity](filter, opts?.signal);
  },
  async get(entity, id) {
    // One query on the server, not the whole table: `r.id` is the vSQL name
    // of the record id (a live page wrote `r.record_id` and got a 400).
    const rows = await queriers[entity]({ filter: byIdFilter(id), limit: 1 });
    return rows[0] ? toJourneyRecord(rows[0]) : null;
  },
  async create(entity, values) {
    const r = await creators[entity](toWirePayload(entity, values, servicePort));
    return { id: r.record_id, fields: r.fields ?? {}, createdAt: r.created_at ?? null };
  },
  // The same payload rules as create — plain ids in, references shaped here.
  async update(entity, id, values) {
    const r = await updaters[entity](id, toWirePayload(entity, values, servicePort));
    return { id: r.record_id || id, fields: r.fields ?? {}, createdAt: r.created_at ?? null };
  },
  ref: (appId, recordId) => createRecordUrl(appId, recordId),
};
