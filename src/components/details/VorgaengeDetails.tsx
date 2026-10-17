import type { Vorgaenge, Beteiligte, AnforderungenUndAngaben, FachlicheBeurteilungen, Rueckfragen, EntscheidungenUndFreigaben, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface VorgaengeDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Vorgaenge;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
  /** 1:N „Anforderungen und Angaben" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  anforderungenUndAngabenList: AnforderungenUndAngaben[];
  /** Zeilen-Klick → overlay.push auf das AnforderungenUndAngaben-Detail (nie der Edit-Dialog). */
  onOpenAnforderungenUndAngaben: (record: AnforderungenUndAngaben) => void;
  /** Kontextuelles „+": öffnet den AnforderungenUndAngaben-Dialog mit diesem Record vorgesetzt. */
  onAddAnforderungenUndAngaben?: () => void;
  /** 1:N „Fachliche Beurteilungen" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  fachlicheBeurteilungenList: FachlicheBeurteilungen[];
  /** Zeilen-Klick → overlay.push auf das FachlicheBeurteilungen-Detail (nie der Edit-Dialog). */
  onOpenFachlicheBeurteilungen: (record: FachlicheBeurteilungen) => void;
  /** Kontextuelles „+": öffnet den FachlicheBeurteilungen-Dialog mit diesem Record vorgesetzt. */
  onAddFachlicheBeurteilungen?: () => void;
  /** 1:N „Rückfragen" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  rueckfragenList: Rueckfragen[];
  /** Zeilen-Klick → overlay.push auf das Rueckfragen-Detail (nie der Edit-Dialog). */
  onOpenRueckfragen: (record: Rueckfragen) => void;
  /** Kontextuelles „+": öffnet den Rueckfragen-Dialog mit diesem Record vorgesetzt. */
  onAddRueckfragen?: () => void;
  /** 1:N „Entscheidungen und Freigaben" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenUndFreigabenList: EntscheidungenUndFreigaben[];
  /** Zeilen-Klick → overlay.push auf das EntscheidungenUndFreigaben-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenUndFreigaben: (record: EntscheidungenUndFreigaben) => void;
  /** Kontextuelles „+": öffnet den EntscheidungenUndFreigaben-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenUndFreigaben?: () => void;
  /** 1:N „Erfahrungen" (vorgang): VOLLE Liste — der Block filtert auf diesen Record. */
  erfahrungenList: Erfahrungen[];
  /** Zeilen-Klick → overlay.push auf das Erfahrungen-Detail (nie der Edit-Dialog). */
  onOpenErfahrungen: (record: Erfahrungen) => void;
  /** Kontextuelles „+": öffnet den Erfahrungen-Dialog mit diesem Record vorgesetzt. */
  onAddErfahrungen?: () => void;
}

export function VorgaengeDetails({
  record,
  beteiligteList,
  onOpenBeteiligte,
  anforderungenUndAngabenList,
  onOpenAnforderungenUndAngaben,
  onAddAnforderungenUndAngaben,
  fachlicheBeurteilungenList,
  onOpenFachlicheBeurteilungen,
  onAddFachlicheBeurteilungen,
  rueckfragenList,
  onOpenRueckfragen,
  onAddRueckfragen,
  entscheidungenUndFreigabenList,
  onOpenEntscheidungenUndFreigaben,
  onAddEntscheidungenUndFreigaben,
  erfahrungenList,
  onOpenErfahrungen,
  onAddErfahrungen,
}: VorgaengeDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const kundeTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.kunde));
  const bearbeiterTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.bearbeiter));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('vorgaenge', 'uebergabestatus')} value={record.fields.uebergabestatus} format="pill" />
        <RecordField label={fieldLabel('vorgaenge', 'vorgangsnummer')} value={record.fields.vorgangsnummer} format="text" />
        <RecordField label={fieldLabel('vorgaenge', 'eingangsdatum')} value={record.fields.eingangsdatum} format="date" />
        <RecordField label={fieldLabel('vorgaenge', 'kundenanfrage')} value={record.fields.kundenanfrage} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'prozessschritt')} value={record.fields.prozessschritt} format="pill" />
        <RecordField label={fieldLabel('vorgaenge', 'freigabestatus')} value={record.fields.freigabestatus} format="pill" />
        <RecordField label={fieldLabel('vorgaenge', 'tatsaechlicher_ablauf')} value={record.fields.tatsaechlicher_ablauf} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'verzoegerungen_nacharbeit')} value={record.fields.verzoegerungen_nacharbeit} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'entwurf_zusammenfassung')} value={record.fields.entwurf_zusammenfassung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'entwurf_geklaert')} value={record.fields.entwurf_geklaert} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorgaenge', 'entwurf_offen')} value={record.fields.entwurf_offen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('vorgaenge', 'kunde')}
          name={kundeTarget?.fields.vorname ?? '—'}
          meta={[kundeTarget?.fields.email, kundeTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={kundeTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(kundeTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('vorgaenge', 'bearbeiter')}
          name={bearbeiterTarget?.fields.vorname ?? '—'}
          meta={[bearbeiterTarget?.fields.email, bearbeiterTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={bearbeiterTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(bearbeiterTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('anforderungen_und_angaben')}
        items={anforderungenUndAngabenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.bezeichnung ?? appLabel('anforderungen_und_angaben'), meta: undefined })}
        onOpen={onOpenAnforderungenUndAngaben}
        onAdd={onAddAnforderungenUndAngaben}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('fachliche_beurteilungen')}
        items={fachlicheBeurteilungenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.ergebnis ?? appLabel('fachliche_beurteilungen'), meta: r.fields.beurteilungsdatum })}
        onOpen={onOpenFachlicheBeurteilungen}
        onAdd={onAddFachlicheBeurteilungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('rueckfragen')}
        items={rueckfragenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.buendelkennung ?? appLabel('rueckfragen'), meta: r.fields.antwortdatum })}
        onOpen={onOpenRueckfragen}
        onAdd={onAddRueckfragen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('entscheidungen_und_freigaben')}
        items={entscheidungenUndFreigabenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: appLabel('entscheidungen_und_freigaben'), meta: r.fields.entscheidungsdatum })}
        onOpen={onOpenEntscheidungenUndFreigaben}
        onAdd={onAddEntscheidungenUndFreigaben}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erfahrungen')}
        items={erfahrungenList.filter(r => extractRecordId(r.fields.vorgang) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erfahrungen'), meta: undefined })}
        onOpen={onOpenErfahrungen}
        onAdd={onAddErfahrungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.VORGAENGE} recordId={record.record_id} readOnly={!perms.canWrite('vorgaenge')} />
    </>
  );
}
