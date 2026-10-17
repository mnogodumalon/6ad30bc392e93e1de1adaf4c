import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconFileText } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import type { Vorgaenge, Rueckfragen, Erfahrungen } from '@/types/app';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import { lookupKey } from '@/lib/formatters';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { tx, appLabel } from '@/i18n';
import { Button } from '@/components/ui/button';
import { DashboardGrid } from '@/components/DashboardGrid';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { KanbanWidget, type KanbanCard, type KanbanColumn, type KanbanTone } from '@/components/widgets/KanbanWidget';

type Filter = 'rueckfragen' | 'entscheidungen' | 'erfahrungen' | 'luecken';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { vorgaenge, rueckfragen, erfahrungen, anforderungenUndAngaben, entscheidungenUndFreigaben, setVorgaenge, setRueckfragen, setErfahrungen, fetchAll } = data;
  const clock = useClock();
  const [filter, setFilter] = useState<Filter | null>(null);

  // ---- shared write helpers (optimistic, undo) ----
  const advanceVorgang = (r: Vorgaenge, newKey: string) => {
    const prev = r.fields.prozessschritt;
    const next = lookupOption('vorgaenge', 'prozessschritt', newKey);
    setVorgaenge(list => list.map(v => v.record_id === r.record_id ? { ...v, fields: { ...v.fields, prozessschritt: next } } : v));
    LivingAppsService.updateVorgaengeEntry(r.record_id, { prozessschritt: newKey }).catch(() => fetchAll());
    undoToast(tx`${r.fields.vorgangsnummer ?? ''} — ${next.label}`, () => {
      setVorgaenge(list => list.map(v => v.record_id === r.record_id ? { ...v, fields: { ...v.fields, prozessschritt: prev } } : v));
      LivingAppsService.updateVorgaengeEntry(r.record_id, { prozessschritt: prev?.key }).catch(() => fetchAll());
    });
  };

  const advanceRueckfrage = (r: Rueckfragen, newKey: string) => {
    const prev = r.fields.status;
    const next = lookupOption('rueckfragen', 'status', newKey);
    setRueckfragen(list => list.map(v => v.record_id === r.record_id ? { ...v, fields: { ...v.fields, status: next } } : v));
    LivingAppsService.updateRueckfragenEntry(r.record_id, { status: newKey }).catch(() => fetchAll());
    undoToast(tx`Rückfrage — ${next.label}`, () => {
      setRueckfragen(list => list.map(v => v.record_id === r.record_id ? { ...v, fields: { ...v.fields, status: prev } } : v));
      LivingAppsService.updateRueckfragenEntry(r.record_id, { status: prev?.key }).catch(() => fetchAll());
    });
  };

  const advanceErfahrung = (r: Erfahrungen, newKey: string) => {
    const prev = r.fields.pruefstatus;
    const next = lookupOption('erfahrungen', 'pruefstatus', newKey);
    setErfahrungen(list => list.map(v => v.record_id === r.record_id ? { ...v, fields: { ...v.fields, pruefstatus: next } } : v));
    LivingAppsService.updateErfahrungenEntry(r.record_id, { pruefstatus: newKey }).catch(() => fetchAll());
    undoToast(tx`Erfahrung — ${next.label}`, () => {
      setErfahrungen(list => list.map(v => v.record_id === r.record_id ? { ...v, fields: { ...v.fields, pruefstatus: prev } } : v));
      LivingAppsService.updateErfahrungenEntry(r.record_id, { pruefstatus: prev?.key }).catch(() => fetchAll());
    });
  };

  const stepKeys = (LOOKUP_OPTIONS['vorgaenge']?.['prozessschritt'] ?? []).map(o => o.key);
  const nextStep = (r: Vorgaenge): string | undefined => {
    const i = stepKeys.indexOf(lookupKey(r.fields.prozessschritt) ?? '');
    return i >= 0 ? stepKeys[i + 1] : stepKeys[0];
  };
  const nextRueckfrage = (r: Rueckfragen): { key: string; label: string } | undefined => {
    const k = lookupKey(r.fields.status);
    if (k === 'vorbereitet') return { key: 'gesendet', label: tx('Als gesendet markieren') };
    if (k === 'gesendet') return { key: 'beantwortet', label: tx('Als beantwortet markieren') };
    if (k === 'beantwortet') return { key: 'erledigt', label: tx('Erledigt') };
    return undefined;
  };
  const nextErfahrung = (r: Erfahrungen): { key: string; label: string } | undefined => {
    const k = lookupKey(r.fields.pruefstatus);
    if (k === 'ungeprueft') return { key: 'in_pruefung', label: tx('Prüfung starten') };
    if (k === 'in_pruefung') return { key: 'geprueft', label: tx('Als geprüft markieren') };
    return undefined;
  };

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type === 'vorgaenge') {
        const n = nextStep(top.record);
        return n ? { label: tx`Weiter: ${lookupOption('vorgaenge', 'prozessschritt', n).label}`, onClick: () => advanceVorgang(top.record, n) } : undefined;
      }
      if (top.type === 'rueckfragen') {
        const n = nextRueckfrage(top.record);
        return n ? { label: n.label, onClick: () => advanceRueckfrage(top.record, n.key) } : undefined;
      }
      if (top.type === 'erfahrungen') {
        const n = nextErfahrung(top.record);
        return n ? { label: n.label, onClick: () => advanceErfahrung(top.record, n.key) } : undefined;
      }
      return undefined;
    },
  });
  const enrichedVorgaenge = crud.enriched.vorgaenge;
  const enrichedRueckfragen = crud.enriched.rueckfragen;
  const enrichedErfahrungen = crud.enriched.erfahrungen;
  const enrichedEntscheidungen = crud.enriched.entscheidungenUndFreigaben;
  const enrichedAngaben = crud.enriched.anforderungenUndAngaben;

  // ---- derived sets ----
  const offeneRueckfragen = enrichedRueckfragen.filter(r => ['vorbereitet', 'gesendet'].includes(lookupKey(r.fields.status) ?? ''));
  const offeneEntscheidungen = enrichedEntscheidungen.filter(e => (lookupKey(e.fields.freigabestatus) ?? 'offen') === 'offen');
  const ungeprueft = enrichedErfahrungen.filter(e => (lookupKey(e.fields.pruefstatus) ?? 'ungeprueft') === 'ungeprueft');
  const luecken = enrichedAngaben.filter(a => ['fehlend', 'widerspruechlich'].includes(lookupKey(a.fields.angabestatus) ?? ''));
  const widersprueche = luecken.filter(a => lookupKey(a.fields.angabestatus) === 'widerspruechlich');

  const vorgangIds = (items: { fields: { vorgang?: string } }[]) =>
    new Set(items.map(i => extractRecordId(i.fields.vorgang)).filter((x): x is string => !!x));

  const filterIds = useMemo(() => {
    if (!filter) return null;
    if (filter === 'rueckfragen') return vorgangIds(offeneRueckfragen);
    if (filter === 'entscheidungen') return vorgangIds(offeneEntscheidungen);
    if (filter === 'erfahrungen') return vorgangIds(ungeprueft);
    return vorgangIds(luecken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, rueckfragen, entscheidungenUndFreigaben, erfahrungen, anforderungenUndAngaben]);

  const columns: KanbanColumn[] = (LOOKUP_OPTIONS['vorgaenge']?.['prozessschritt'] ?? []).map(o => ({ key: o.key, label: o.label }));

  const toneFor = (key: string | undefined): KanbanTone => {
    if (key === 'freigegeben') return 'success';
    if (key === 'abgelehnt') return 'destructive';
    if (key === 'in_pruefung') return 'primary';
    return 'default';
  };

  const cards: KanbanCard[] = enrichedVorgaenge
    .filter(v => !filterIds || filterIds.has(v.record_id))
    .map(v => ({
      id: `vorgang:${v.record_id}`,
      column: lookupKey(v.fields.prozessschritt) ?? columns[0]?.key ?? '',
      title: `${v.fields.vorgangsnummer ?? tx('Ohne Nummer')}${v.kundeName ? ' · ' + v.kundeName : ''}`,
      subtitle: [v.bearbeiterName, v.fields.freigabestatus?.label].filter(Boolean).join(' · '),
      tone: toneFor(lookupKey(v.fields.freigabestatus)),
    }));

  const moveCard = (cardId: string, newColumn: string) => {
    const rid = cardId.split(':')[1];
    const rec = vorgaenge.find(v => v.record_id === rid);
    if (!rec) return;
    if (newColumn === 'abgeschlossen' && lookupKey(rec.fields.freigabestatus) !== 'freigegeben') {
      return tx('Ein Vorgang kann erst abgeschlossen werden, wenn er freigegeben ist.');
    }
    if (newColumn === 'auftragsentwurf' && offeneEntscheidungen.some(e => extractRecordId(e.fields.vorgang) === rid)) {
      return tx('Für den Auftragsentwurf müssen alle Entscheidungen des Vorgangs getroffen sein.');
    }
    advanceVorgang(rec, newColumn);
  };

  // ---- header ----
  const kontext = (() => {
    if (vorgaenge.length === 0) return tx('Lege deinen ersten Vorgang an, um den Ablauf zu starten.');
    if (offeneRueckfragen.length > 0) {
      const n = namen(offeneRueckfragen.map(r => r.adressatName).filter(Boolean));
      return tx`Offene Rückfragen warten auf ${n}.`;
    }
    if (offeneEntscheidungen.length > 0) {
      const n = namen(offeneEntscheidungen.map(e => e.vorgangName).filter(Boolean));
      return tx`Entscheidungen offen bei ${n}.`;
    }
    const n = namen(enrichedVorgaenge.map(v => v.fields.vorgangsnummer ?? '').filter(Boolean));
    return tx`Keine offenen Rückfragen — im Fluss: ${n}.`;
  })();

  const vorgangRecord = (id: string | undefined) => vorgaenge.find(v => v.record_id === id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{kontext}</p>
        </div>
        {crud.vorgaenge.canWrite && (
          <Button onClick={() => crud.vorgaenge.openCreate({ prozessschritt: 'anfrage_verstehen', freigabestatus: 'offen', uebergabestatus: 'nicht_bereit', eingangsdatum: format(clock, 'yyyy-MM-dd') })}>
            <IconPlus size={16} className="shrink-0" />
            <span className="ml-1">{tx('Neuer Vorgang')}</span>
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="wide"
        hero={
          vorgaenge.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center">
              <IconFileText size={48} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{tx('Noch kein Vorgang — starte mit der ersten Kundenanfrage.')}</p>
              {crud.vorgaenge.canWrite && (
                <Button onClick={() => crud.vorgaenge.openCreate({ prozessschritt: 'anfrage_verstehen', freigabestatus: 'offen' })}>
                  {tx('Ersten Vorgang anlegen')}
                </Button>
              )}
            </div>
          ) : luecken.length > 0 ? (
            <HeroBanner
              icon={<IconAlertTriangle size={18} />}
              action={{ label: filter === 'luecken' ? tx('Alle Vorgänge zeigen') : tx('Betroffene Vorgänge zeigen'), onClick: () => setFilter(f => f === 'luecken' ? null : 'luecken') }}
            >
              {widersprueche.length > 0
                ? <><b>{namen(widersprueche.map(a => a.fields.bezeichnung ?? '').filter(Boolean))}</b> {tx('widersprüchlich')} — {tx`${luecken.length} Angaben fehlen oder widersprechen sich.`}</>
                : <><b>{namen(luecken.map(a => a.fields.bezeichnung ?? '').filter(Boolean))}</b> {tx('fehlt')} — {tx`${luecken.length} Angaben sind noch nicht geklärt.`}</>}
            </HeroBanner>
          ) : undefined
        }
        kpis={
          vorgaenge.length === 0 ? undefined : (
            <StatStrip>
              <StatStripItem
                title={tx('Offene Rückfragen')}
                value={offeneRueckfragen.length}
                tone={offeneRueckfragen.length > 0 ? 'warning' : 'default'}
                onClick={() => setFilter(f => f === 'rueckfragen' ? null : 'rueckfragen')}
                active={filter === 'rueckfragen'}
              />
              <StatStripItem
                title={tx('Entscheidungen offen')}
                value={offeneEntscheidungen.length}
                onClick={() => setFilter(f => f === 'entscheidungen' ? null : 'entscheidungen')}
                active={filter === 'entscheidungen'}
              />
              <StatStripItem
                title={tx('Erfahrungen ungeprüft')}
                value={ungeprueft.length}
                onClick={() => setFilter(f => f === 'erfahrungen' ? null : 'erfahrungen')}
                active={filter === 'erfahrungen'}
              />
            </StatStrip>
          )
        }
        primary={
          <KanbanWidget
            cards={cards}
            columns={columns}
            defaultCollapsed={['abgeschlossen']}
            onCardClick={card => {
              const rec = vorgangRecord(card.id.split(':')[1]);
              if (rec) crud.vorgaenge.openDetail(rec);
            }}
            onCardMove={moveCard}
            onAddCard={column => { if (crud.vorgaenge.canWrite) crud.vorgaenge.openCreate({ prozessschritt: column, freigabestatus: 'offen' }); }}
          />
        }
        aside={
          <>
            <WorkList
              title={tx('Offene Rückfragen')}
              items={offeneRueckfragen.map(r => ({
                id: r.record_id,
                title: r.adressatName || tx('Ohne Adressat'),
                secondLine: <><span className="font-medium text-amber-600">{r.fields.status?.label}</span><span className="text-muted-foreground"> · {r.vorgangName}</span></>,
                action: nextRueckfrage(r) ? { label: nextRueckfrage(r)!.label, onClick: () => advanceRueckfrage(r, nextRueckfrage(r)!.key) } : undefined,
              }))}
              onItemClick={id => { const r = rueckfragen.find(x => x.record_id === id); if (r) crud.rueckfragen.openDetail(r); }}
              empty={{ text: tx('Keine offenen Rückfragen — alles beantwortet.') }}
            />
            <WorkList
              title={`${appLabel('entscheidungen_und_freigaben')} · ${tx('offen')}`}
              items={offeneEntscheidungen.map(e => ({
                id: e.record_id,
                title: e.vorgangName || tx('Ohne Vorgang'),
                secondLine: <span className="text-muted-foreground">{e.entscheiderName || tx('Entscheider offen')}{e.fields.befugnis_geprueft ? '' : ' · ' + tx('Befugnis ungeprüft')}</span>,
              }))}
              onItemClick={id => { const e = entscheidungenUndFreigaben.find(x => x.record_id === id); if (e) crud.entscheidungenUndFreigaben.openDetail(e); }}
              empty={{ text: tx('Keine offenen Entscheidungen.') }}
            />
            <WorkList
              title={tx('Erfahrungen zur Prüfung')}
              items={ungeprueft.map(e => ({
                id: e.record_id,
                title: e.fields.titel ?? tx('Ohne Titel'),
                secondLine: <span className="text-muted-foreground">{e.fields.kategorie?.label} · {e.vorgangName}</span>,
                action: { label: tx('Prüfung starten'), onClick: () => advanceErfahrung(e, 'in_pruefung') },
              }))}
              onItemClick={id => { const e = erfahrungen.find(x => x.record_id === id); if (e) crud.erfahrungen.openDetail(e); }}
              empty={{ text: tx('Alle Erfahrungen sind geprüft.') }}
            />
          </>
        }
      />
      {crud.surfaces}
    </div>
  );
}
