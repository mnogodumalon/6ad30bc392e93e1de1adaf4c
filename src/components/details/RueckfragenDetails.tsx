import type { Rueckfragen, Vorgaenge, AnforderungenUndAngaben, Beteiligte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface RueckfragenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Rueckfragen;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „AnforderungenUndAngaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  anforderungenUndAngabenList: AnforderungenUndAngaben[];
  /** Reserviert — AnforderungenUndAngaben ist hier nur über ein Mehrfach-Feld verknüpft (Text-Join, keine Einzel-Relation); Übergabe erlaubt, aber ohne Wirkung. */
  onOpenAnforderungenUndAngaben?: (record: AnforderungenUndAngaben) => void;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
}

export function RueckfragenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  anforderungenUndAngabenList,
  beteiligteList,
  onOpenBeteiligte,
}: RueckfragenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const adressatTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.adressat));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('rueckfragen', 'anforderungen')} value={Array.isArray(record.fields.anforderungen) ? record.fields.anforderungen.map((u: unknown) => anforderungenUndAngabenList.find(t => t.record_id === extractRecordId(u))?.fields.bezeichnung ?? '—').join(', ') : null} format="text" />
        <RecordField label={fieldLabel('rueckfragen', 'fragetext')} value={record.fields.fragetext} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('rueckfragen', 'buendelkennung')} value={record.fields.buendelkennung} format="text" />
        <RecordField label={fieldLabel('rueckfragen', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('rueckfragen', 'antwort')} value={record.fields.antwort} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('rueckfragen', 'antwortdatum')} value={record.fields.antwortdatum} format="date" />
        <RecordField label={fieldLabel('rueckfragen', 'alter_wert')} value={record.fields.alter_wert} format="text" />
        <RecordField label={fieldLabel('rueckfragen', 'neuer_wert')} value={record.fields.neuer_wert} format="text" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('rueckfragen', 'vorgang')}
          name={vorgangTarget?.fields.vorgangsnummer ?? '—'}
          meta={undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('rueckfragen', 'adressat')}
          name={adressatTarget?.fields.vorname ?? '—'}
          meta={[adressatTarget?.fields.email, adressatTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={adressatTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(adressatTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.RUECKFRAGEN} recordId={record.record_id} readOnly={!perms.canWrite('rueckfragen')} />
    </>
  );
}
