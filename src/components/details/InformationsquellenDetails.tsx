import type { Informationsquellen, Beteiligte, AnforderungenUndAngaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface InformationsquellenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Informationsquellen;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
  /** 1:N „Anforderungen und Angaben" (informationsquelle): VOLLE Liste — der Block filtert auf diesen Record. */
  anforderungenUndAngabenList: AnforderungenUndAngaben[];
  /** Zeilen-Klick → overlay.push auf das AnforderungenUndAngaben-Detail (nie der Edit-Dialog). */
  onOpenAnforderungenUndAngaben: (record: AnforderungenUndAngaben) => void;
  /** Kontextuelles „+": öffnet den AnforderungenUndAngaben-Dialog mit diesem Record vorgesetzt. */
  onAddAnforderungenUndAngaben?: () => void;
}

export function InformationsquellenDetails({
  record,
  beteiligteList,
  onOpenBeteiligte,
  anforderungenUndAngabenList,
  onOpenAnforderungenUndAngaben,
  onAddAnforderungenUndAngaben,
}: InformationsquellenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const verantwortlicherTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.verantwortlicher));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('informationsquellen', 'bezeichnung')} value={record.fields.bezeichnung} format="text" />
        <RecordField label={fieldLabel('informationsquellen', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('informationsquellen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('informationsquellen', 'bekannte_schwaechen')} value={record.fields.bekannte_schwaechen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('informationsquellen', 'verantwortlicher')}
          name={verantwortlicherTarget?.fields.vorname ?? '—'}
          meta={[verantwortlicherTarget?.fields.email, verantwortlicherTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={verantwortlicherTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(verantwortlicherTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('anforderungen_und_angaben')}
        items={anforderungenUndAngabenList.filter(r => extractRecordId(r.fields.informationsquelle) === record.record_id)}
        map={r => ({ name: r.fields.bezeichnung ?? appLabel('anforderungen_und_angaben'), meta: undefined })}
        onOpen={onOpenAnforderungenUndAngaben}
        onAdd={onAddAnforderungenUndAngaben}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.INFORMATIONSQUELLEN} recordId={record.record_id} readOnly={!perms.canWrite('informationsquellen')} />
    </>
  );
}
