import type { FachlicheBeurteilungen, Vorgaenge, AnforderungenUndAngaben, Beteiligte, EntscheidungenUndFreigaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface FachlicheBeurteilungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: FachlicheBeurteilungen;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „AnforderungenUndAngaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  anforderungenUndAngabenList: AnforderungenUndAngaben[];
  /** Klick auf die AnforderungenUndAngaben-Relation → overlay.push auf dessen Detail. */
  onOpenAnforderungenUndAngaben?: (record: AnforderungenUndAngaben) => void;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
  /** 1:N „Entscheidungen und Freigaben" (beurteilung): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenUndFreigabenList: EntscheidungenUndFreigaben[];
  /** Zeilen-Klick → overlay.push auf das EntscheidungenUndFreigaben-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenUndFreigaben: (record: EntscheidungenUndFreigaben) => void;
  /** Kontextuelles „+": öffnet den EntscheidungenUndFreigaben-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenUndFreigaben?: () => void;
}

export function FachlicheBeurteilungenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  anforderungenUndAngabenList,
  onOpenAnforderungenUndAngaben,
  beteiligteList,
  onOpenBeteiligte,
  entscheidungenUndFreigabenList,
  onOpenEntscheidungenUndFreigaben,
  onAddEntscheidungenUndFreigaben,
}: FachlicheBeurteilungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const anforderungTarget = anforderungenUndAngabenList.find(r => r.record_id === extractRecordId(record.fields.anforderung));
  const beurteilerTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.beurteiler));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('fachliche_beurteilungen', 'fachbereich')} value={record.fields.fachbereich} format="pill" />
        <RecordField label={fieldLabel('fachliche_beurteilungen', 'beurteilungstext')} value={record.fields.beurteilungstext} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('fachliche_beurteilungen', 'ergebnis')} value={record.fields.ergebnis} format="text" />
        <RecordField label={fieldLabel('fachliche_beurteilungen', 'unsicherheiten')} value={record.fields.unsicherheiten} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('fachliche_beurteilungen', 'gueltigkeitsstatus')} value={record.fields.gueltigkeitsstatus} format="pill" />
        <RecordField label={fieldLabel('fachliche_beurteilungen', 'beurteilungsdatum')} value={record.fields.beurteilungsdatum} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('fachliche_beurteilungen', 'vorgang')}
          name={vorgangTarget?.fields.vorgangsnummer ?? '—'}
          meta={undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('fachliche_beurteilungen', 'anforderung')}
          name={anforderungTarget?.fields.bezeichnung ?? '—'}
          meta={[anforderungTarget?.fields.quellenverweis].filter(Boolean).join(' · ') || undefined}
          onClick={anforderungTarget && onOpenAnforderungenUndAngaben ? () => onOpenAnforderungenUndAngaben!(anforderungTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('fachliche_beurteilungen', 'beurteiler')}
          name={beurteilerTarget?.fields.vorname ?? '—'}
          meta={[beurteilerTarget?.fields.email, beurteilerTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={beurteilerTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(beurteilerTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('entscheidungen_und_freigaben')}
        items={entscheidungenUndFreigabenList.filter(r => extractRecordId(r.fields.beurteilung) === record.record_id)}
        map={r => ({ name: appLabel('entscheidungen_und_freigaben'), meta: r.fields.entscheidungsdatum })}
        onOpen={onOpenEntscheidungenUndFreigaben}
        onAdd={onAddEntscheidungenUndFreigaben}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.FACHLICHE_BEURTEILUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('fachliche_beurteilungen')} />
    </>
  );
}
