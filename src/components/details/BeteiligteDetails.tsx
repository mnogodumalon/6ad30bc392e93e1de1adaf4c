import type { Beteiligte, Informationsquellen, RegelnUndBefugnisse, Vorgaenge, FachlicheBeurteilungen, Rueckfragen, EntscheidungenUndFreigaben, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface BeteiligteDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Beteiligte;
  /** 1:N „Informationsquellen" (verantwortlicher): VOLLE Liste — der Block filtert auf diesen Record. */
  informationsquellenList: Informationsquellen[];
  /** Zeilen-Klick → overlay.push auf das Informationsquellen-Detail (nie der Edit-Dialog). */
  onOpenInformationsquellen: (record: Informationsquellen) => void;
  /** Kontextuelles „+": öffnet den Informationsquellen-Dialog mit diesem Record vorgesetzt. */
  onAddInformationsquellen?: () => void;
  /** 1:N „Regeln und Befugnisse" (berechtigter): VOLLE Liste — der Block filtert auf diesen Record. */
  regelnUndBefugnisseList: RegelnUndBefugnisse[];
  /** Zeilen-Klick → overlay.push auf das RegelnUndBefugnisse-Detail (nie der Edit-Dialog). */
  onOpenRegelnUndBefugnisse: (record: RegelnUndBefugnisse) => void;
  /** Kontextuelles „+": öffnet den RegelnUndBefugnisse-Dialog mit diesem Record vorgesetzt. */
  onAddRegelnUndBefugnisse?: () => void;
  /** 1:N „Vorgänge" (kunde): VOLLE Liste — der Block filtert auf diesen Record. */
  vorgaengeKundeList: Vorgaenge[];
  /** Zeilen-Klick → overlay.push auf das Vorgaenge-Detail (nie der Edit-Dialog). */
  onOpenVorgaengeKunde: (record: Vorgaenge) => void;
  /** Kontextuelles „+": öffnet den Vorgaenge-Dialog mit diesem Record vorgesetzt. */
  onAddVorgaengeKunde?: () => void;
  /** 1:N „Vorgänge" (bearbeiter): VOLLE Liste — der Block filtert auf diesen Record. */
  vorgaengeBearbeiterList: Vorgaenge[];
  /** Zeilen-Klick → overlay.push auf das Vorgaenge-Detail (nie der Edit-Dialog). */
  onOpenVorgaengeBearbeiter: (record: Vorgaenge) => void;
  /** Kontextuelles „+": öffnet den Vorgaenge-Dialog mit diesem Record vorgesetzt. */
  onAddVorgaengeBearbeiter?: () => void;
  /** 1:N „Fachliche Beurteilungen" (beurteiler): VOLLE Liste — der Block filtert auf diesen Record. */
  fachlicheBeurteilungenList: FachlicheBeurteilungen[];
  /** Zeilen-Klick → overlay.push auf das FachlicheBeurteilungen-Detail (nie der Edit-Dialog). */
  onOpenFachlicheBeurteilungen: (record: FachlicheBeurteilungen) => void;
  /** Kontextuelles „+": öffnet den FachlicheBeurteilungen-Dialog mit diesem Record vorgesetzt. */
  onAddFachlicheBeurteilungen?: () => void;
  /** 1:N „Rückfragen" (adressat): VOLLE Liste — der Block filtert auf diesen Record. */
  rueckfragenList: Rueckfragen[];
  /** Zeilen-Klick → overlay.push auf das Rueckfragen-Detail (nie der Edit-Dialog). */
  onOpenRueckfragen: (record: Rueckfragen) => void;
  /** Kontextuelles „+": öffnet den Rueckfragen-Dialog mit diesem Record vorgesetzt. */
  onAddRueckfragen?: () => void;
  /** 1:N „Entscheidungen und Freigaben" (entscheider): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenUndFreigabenList: EntscheidungenUndFreigaben[];
  /** Zeilen-Klick → overlay.push auf das EntscheidungenUndFreigaben-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenUndFreigaben: (record: EntscheidungenUndFreigaben) => void;
  /** Kontextuelles „+": öffnet den EntscheidungenUndFreigaben-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenUndFreigaben?: () => void;
  /** 1:N „Erfahrungen" (pruefer): VOLLE Liste — der Block filtert auf diesen Record. */
  erfahrungenList: Erfahrungen[];
  /** Zeilen-Klick → overlay.push auf das Erfahrungen-Detail (nie der Edit-Dialog). */
  onOpenErfahrungen: (record: Erfahrungen) => void;
  /** Kontextuelles „+": öffnet den Erfahrungen-Dialog mit diesem Record vorgesetzt. */
  onAddErfahrungen?: () => void;
}

export function BeteiligteDetails({
  record,
  informationsquellenList,
  onOpenInformationsquellen,
  onAddInformationsquellen,
  regelnUndBefugnisseList,
  onOpenRegelnUndBefugnisse,
  onAddRegelnUndBefugnisse,
  vorgaengeKundeList,
  onOpenVorgaengeKunde,
  onAddVorgaengeKunde,
  vorgaengeBearbeiterList,
  onOpenVorgaengeBearbeiter,
  onAddVorgaengeBearbeiter,
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
}: BeteiligteDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('beteiligte', 'vorname')} value={record.fields.vorname} format="text" />
        <RecordField label={fieldLabel('beteiligte', 'nachname')} value={record.fields.nachname} format="text" />
        <RecordField label={fieldLabel('beteiligte', 'rolle')} value={record.fields.rolle} format="pill" />
        <RecordField label={fieldLabel('beteiligte', 'abteilung')} value={record.fields.abteilung} format="text" />
        <RecordField label={fieldLabel('beteiligte', 'zustaendigkeit')} value={record.fields.zustaendigkeit} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('beteiligte', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('beteiligte', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('beteiligte', 'entscheidungsbefugt')} value={record.fields.entscheidungsbefugt} format="bool" />
        <RecordField label={fieldLabel('beteiligte', 'befugnisgrenzen')} value={record.fields.befugnisgrenzen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('informationsquellen')}
        items={informationsquellenList.filter(r => extractRecordId(r.fields.verantwortlicher) === record.record_id)}
        map={r => ({ name: r.fields.bezeichnung ?? appLabel('informationsquellen'), meta: undefined })}
        onOpen={onOpenInformationsquellen}
        onAdd={onAddInformationsquellen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('regeln_und_befugnisse')}
        items={regelnUndBefugnisseList.filter(r => extractRecordId(r.fields.berechtigter) === record.record_id)}
        map={r => ({ name: r.fields.regelbezeichnung ?? appLabel('regeln_und_befugnisse'), meta: r.fields.gueltig_ab })}
        onOpen={onOpenRegelnUndBefugnisse}
        onAdd={onAddRegelnUndBefugnisse}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={`${appLabel('vorgaenge')} · ${fieldLabel('vorgaenge', 'kunde')}`}
        items={vorgaengeKundeList.filter(r => extractRecordId(r.fields.kunde) === record.record_id)}
        map={r => ({ name: r.fields.vorgangsnummer ?? appLabel('vorgaenge'), meta: r.fields.eingangsdatum })}
        onOpen={onOpenVorgaengeKunde}
        onAdd={onAddVorgaengeKunde}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={`${appLabel('vorgaenge')} · ${fieldLabel('vorgaenge', 'bearbeiter')}`}
        items={vorgaengeBearbeiterList.filter(r => extractRecordId(r.fields.bearbeiter) === record.record_id)}
        map={r => ({ name: r.fields.vorgangsnummer ?? appLabel('vorgaenge'), meta: r.fields.eingangsdatum })}
        onOpen={onOpenVorgaengeBearbeiter}
        onAdd={onAddVorgaengeBearbeiter}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('fachliche_beurteilungen')}
        items={fachlicheBeurteilungenList.filter(r => extractRecordId(r.fields.beurteiler) === record.record_id)}
        map={r => ({ name: r.fields.ergebnis ?? appLabel('fachliche_beurteilungen'), meta: r.fields.beurteilungsdatum })}
        onOpen={onOpenFachlicheBeurteilungen}
        onAdd={onAddFachlicheBeurteilungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('rueckfragen')}
        items={rueckfragenList.filter(r => extractRecordId(r.fields.adressat) === record.record_id)}
        map={r => ({ name: r.fields.buendelkennung ?? appLabel('rueckfragen'), meta: r.fields.antwortdatum })}
        onOpen={onOpenRueckfragen}
        onAdd={onAddRueckfragen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('entscheidungen_und_freigaben')}
        items={entscheidungenUndFreigabenList.filter(r => extractRecordId(r.fields.entscheider) === record.record_id)}
        map={r => ({ name: appLabel('entscheidungen_und_freigaben'), meta: r.fields.entscheidungsdatum })}
        onOpen={onOpenEntscheidungenUndFreigaben}
        onAdd={onAddEntscheidungenUndFreigaben}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erfahrungen')}
        items={erfahrungenList.filter(r => extractRecordId(r.fields.pruefer) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('erfahrungen'), meta: undefined })}
        onOpen={onOpenErfahrungen}
        onAdd={onAddErfahrungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.BETEILIGTE} recordId={record.record_id} readOnly={!perms.canWrite('beteiligte')} />
    </>
  );
}
