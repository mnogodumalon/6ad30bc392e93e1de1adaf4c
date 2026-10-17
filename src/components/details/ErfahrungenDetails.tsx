import type { Erfahrungen, Vorgaenge, Beteiligte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface ErfahrungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Erfahrungen;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
}

export function ErfahrungenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  beteiligteList,
  onOpenBeteiligte,
}: ErfahrungenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const prueferTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.pruefer));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('erfahrungen', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('erfahrungen', 'kategorie')} value={record.fields.kategorie} format="pill" />
        <RecordField label={fieldLabel('erfahrungen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erfahrungen', 'ursache')} value={record.fields.ursache} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erfahrungen', 'verbesserungsvorschlag')} value={record.fields.verbesserungsvorschlag} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erfahrungen', 'pruefstatus')} value={record.fields.pruefstatus} format="pill" />
        <RecordField label={fieldLabel('erfahrungen', 'wiederverwendbar')} value={record.fields.wiederverwendbar} format="bool" />
        <RecordField label={fieldLabel('erfahrungen', 'art')} value={record.fields.art} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('erfahrungen', 'vorgang')}
          name={vorgangTarget?.fields.vorgangsnummer ?? '—'}
          meta={undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('erfahrungen', 'pruefer')}
          name={prueferTarget?.fields.vorname ?? '—'}
          meta={[prueferTarget?.fields.email, prueferTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={prueferTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(prueferTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ERFAHRUNGEN} recordId={record.record_id} readOnly={!perms.canWrite('erfahrungen')} />
    </>
  );
}
