import type { AnforderungenUndAngaben, Vorgaenge, Informationsquellen, FachlicheBeurteilungen, Rueckfragen, EntscheidungenUndFreigaben } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';

export interface AnforderungenUndAngabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: AnforderungenUndAngaben;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „Informationsquellen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  informationsquellenList: Informationsquellen[];
  /** Klick auf die Informationsquellen-Relation → overlay.push auf dessen Detail. */
  onOpenInformationsquellen?: (record: Informationsquellen) => void;
  /** 1:N „Fachliche Beurteilungen" (anforderung): VOLLE Liste — der Block filtert auf diesen Record. */
  fachlicheBeurteilungenList: FachlicheBeurteilungen[];
  /** Zeilen-Klick → overlay.push auf das FachlicheBeurteilungen-Detail (nie der Edit-Dialog). */
  onOpenFachlicheBeurteilungen: (record: FachlicheBeurteilungen) => void;
  /** Kontextuelles „+": öffnet den FachlicheBeurteilungen-Dialog mit diesem Record vorgesetzt. */
  onAddFachlicheBeurteilungen?: () => void;
  /** 1:N „Rückfragen" (anforderungen): VOLLE Liste — der Block filtert auf diesen Record. */
  rueckfragenList: Rueckfragen[];
  /** Zeilen-Klick → overlay.push auf das Rueckfragen-Detail (nie der Edit-Dialog). */
  onOpenRueckfragen: (record: Rueckfragen) => void;
  /** Kontextuelles „+": öffnet den Rueckfragen-Dialog mit diesem Record vorgesetzt. */
  onAddRueckfragen?: () => void;
  /** „Vorhandene wählen": Listenfeld-Rückbezug — hängt diesen Record an einen bestehenden Rueckfragen-Datensatz. */
  onPickRueckfragen?: () => void;
  /** 1:N „Entscheidungen und Freigaben" (grundlage_anforderungen): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenUndFreigabenList: EntscheidungenUndFreigaben[];
  /** Zeilen-Klick → overlay.push auf das EntscheidungenUndFreigaben-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenUndFreigaben: (record: EntscheidungenUndFreigaben) => void;
  /** Kontextuelles „+": öffnet den EntscheidungenUndFreigaben-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenUndFreigaben?: () => void;
  /** „Vorhandene wählen": Listenfeld-Rückbezug — hängt diesen Record an einen bestehenden EntscheidungenUndFreigaben-Datensatz. */
  onPickEntscheidungenUndFreigaben?: () => void;
}

export function AnforderungenUndAngabenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  informationsquellenList,
  onOpenInformationsquellen,
  fachlicheBeurteilungenList,
  onOpenFachlicheBeurteilungen,
  onAddFachlicheBeurteilungen,
  rueckfragenList,
  onOpenRueckfragen,
  onAddRueckfragen,
  onPickRueckfragen,
  entscheidungenUndFreigabenList,
  onOpenEntscheidungenUndFreigaben,
  onAddEntscheidungenUndFreigaben,
  onPickEntscheidungenUndFreigaben,
}: AnforderungenUndAngabenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const informationsquelleTarget = informationsquellenList.find(r => r.record_id === extractRecordId(record.fields.informationsquelle));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('anforderungen_und_angaben', 'bezeichnung')} value={record.fields.bezeichnung} format="text" />
        <RecordField label={fieldLabel('anforderungen_und_angaben', 'angabe')} value={record.fields.angabe} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('anforderungen_und_angaben', 'quellenverweis')} value={record.fields.quellenverweis} format="text" />
        <RecordField label={fieldLabel('anforderungen_und_angaben', 'angabestatus')} value={record.fields.angabestatus} format="pill" />
        <RecordField label={fieldLabel('anforderungen_und_angaben', 'luecke_widerspruch')} value={record.fields.luecke_widerspruch} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('anforderungen_und_angaben', 'unsicherheit')} value={record.fields.unsicherheit} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('anforderungen_und_angaben', 'pruefpunkt')} value={record.fields.pruefpunkt} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('anforderungen_und_angaben', 'vorgang')}
          name={vorgangTarget?.fields.vorgangsnummer ?? '—'}
          meta={undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('anforderungen_und_angaben', 'informationsquelle')}
          name={informationsquelleTarget?.fields.bezeichnung ?? '—'}
          meta={undefined}
          onClick={informationsquelleTarget && onOpenInformationsquellen ? () => onOpenInformationsquellen!(informationsquelleTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('fachliche_beurteilungen')}
        items={fachlicheBeurteilungenList.filter(r => extractRecordId(r.fields.anforderung) === record.record_id)}
        map={r => ({ name: r.fields.ergebnis ?? appLabel('fachliche_beurteilungen'), meta: r.fields.beurteilungsdatum })}
        onOpen={onOpenFachlicheBeurteilungen}
        onAdd={onAddFachlicheBeurteilungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('rueckfragen')}
        items={rueckfragenList.filter(r => Array.isArray(r.fields.anforderungen) && r.fields.anforderungen.some((u: unknown) => extractRecordId(u) === record.record_id))}
        map={r => ({ name: r.fields.buendelkennung ?? appLabel('rueckfragen'), meta: r.fields.antwortdatum })}
        onOpen={onOpenRueckfragen}
        onAdd={onAddRueckfragen}
        onPick={onPickRueckfragen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('entscheidungen_und_freigaben')}
        items={entscheidungenUndFreigabenList.filter(r => Array.isArray(r.fields.grundlage_anforderungen) && r.fields.grundlage_anforderungen.some((u: unknown) => extractRecordId(u) === record.record_id))}
        map={r => ({ name: appLabel('entscheidungen_und_freigaben'), meta: r.fields.entscheidungsdatum })}
        onOpen={onOpenEntscheidungenUndFreigaben}
        onAdd={onAddEntscheidungenUndFreigaben}
        onPick={onPickEntscheidungenUndFreigaben}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ANFORDERUNGEN_UND_ANGABEN} recordId={record.record_id} readOnly={!perms.canWrite('anforderungen_und_angaben')} />
    </>
  );
}
