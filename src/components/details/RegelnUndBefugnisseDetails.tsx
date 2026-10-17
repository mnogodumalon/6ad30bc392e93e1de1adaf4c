import type { RegelnUndBefugnisse, Beteiligte, EntscheidungenUndFreigaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface RegelnUndBefugnisseDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: RegelnUndBefugnisse;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
  /** 1:N „Entscheidungen und Freigaben" (regel): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenUndFreigabenList: EntscheidungenUndFreigaben[];
  /** Zeilen-Klick → overlay.push auf das EntscheidungenUndFreigaben-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenUndFreigaben: (record: EntscheidungenUndFreigaben) => void;
  /** Kontextuelles „+": öffnet den EntscheidungenUndFreigaben-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenUndFreigaben?: () => void;
}

export function RegelnUndBefugnisseDetails({
  record,
  beteiligteList,
  onOpenBeteiligte,
  entscheidungenUndFreigabenList,
  onOpenEntscheidungenUndFreigaben,
  onAddEntscheidungenUndFreigaben,
}: RegelnUndBefugnisseDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const berechtigterTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.berechtigter));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('regeln_und_befugnisse', 'regelbezeichnung')} value={record.fields.regelbezeichnung} format="text" />
        <RecordField label={fieldLabel('regeln_und_befugnisse', 'regeltext')} value={record.fields.regeltext} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('regeln_und_befugnisse', 'geltungsbereich')} value={record.fields.geltungsbereich} format="text" />
        <RecordField label={fieldLabel('regeln_und_befugnisse', 'regelart')} value={record.fields.regelart} format="pill" />
        <RecordField label={fieldLabel('regeln_und_befugnisse', 'berechtigte_rolle')} value={record.fields.berechtigte_rolle} format="pill" />
        <RecordField label={fieldLabel('regeln_und_befugnisse', 'freigabepflicht')} value={record.fields.freigabepflicht} format="bool" />
        <RecordField label={fieldLabel('regeln_und_befugnisse', 'gueltig_ab')} value={record.fields.gueltig_ab} format="date" />
        <RecordField label={fieldLabel('regeln_und_befugnisse', 'status')} value={record.fields.status} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('regeln_und_befugnisse', 'berechtigter')}
          name={berechtigterTarget?.fields.vorname ?? '—'}
          meta={[berechtigterTarget?.fields.email, berechtigterTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={berechtigterTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(berechtigterTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('entscheidungen_und_freigaben')}
        items={entscheidungenUndFreigabenList.filter(r => extractRecordId(r.fields.regel) === record.record_id)}
        map={r => ({ name: appLabel('entscheidungen_und_freigaben'), meta: r.fields.entscheidungsdatum })}
        onOpen={onOpenEntscheidungenUndFreigaben}
        onAdd={onAddEntscheidungenUndFreigaben}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.REGELN_UND_BEFUGNISSE} recordId={record.record_id} readOnly={!perms.canWrite('regeln_und_befugnisse')} />
    </>
  );
}
