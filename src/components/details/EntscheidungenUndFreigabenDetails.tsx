import type { EntscheidungenUndFreigaben, Vorgaenge, AnforderungenUndAngaben, FachlicheBeurteilungen, RegelnUndBefugnisse, Beteiligte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';

export interface EntscheidungenUndFreigabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: EntscheidungenUndFreigaben;
  /** N:1-Ziel „Vorgaenge": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorgaengeList: Vorgaenge[];
  /** Klick auf die Vorgaenge-Relation → overlay.push auf dessen Detail. */
  onOpenVorgaenge?: (record: Vorgaenge) => void;
  /** N:1-Ziel „AnforderungenUndAngaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  anforderungenUndAngabenList: AnforderungenUndAngaben[];
  /** Reserviert — AnforderungenUndAngaben ist hier nur über ein Mehrfach-Feld verknüpft (Text-Join, keine Einzel-Relation); Übergabe erlaubt, aber ohne Wirkung. */
  onOpenAnforderungenUndAngaben?: (record: AnforderungenUndAngaben) => void;
  /** N:1-Ziel „FachlicheBeurteilungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  fachlicheBeurteilungenList: FachlicheBeurteilungen[];
  /** Klick auf die FachlicheBeurteilungen-Relation → overlay.push auf dessen Detail. */
  onOpenFachlicheBeurteilungen?: (record: FachlicheBeurteilungen) => void;
  /** N:1-Ziel „RegelnUndBefugnisse": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  regelnUndBefugnisseList: RegelnUndBefugnisse[];
  /** Klick auf die RegelnUndBefugnisse-Relation → overlay.push auf dessen Detail. */
  onOpenRegelnUndBefugnisse?: (record: RegelnUndBefugnisse) => void;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
}

export function EntscheidungenUndFreigabenDetails({
  record,
  vorgaengeList,
  onOpenVorgaenge,
  anforderungenUndAngabenList,
  fachlicheBeurteilungenList,
  onOpenFachlicheBeurteilungen,
  regelnUndBefugnisseList,
  onOpenRegelnUndBefugnisse,
  beteiligteList,
  onOpenBeteiligte,
}: EntscheidungenUndFreigabenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorgangTarget = vorgaengeList.find(r => r.record_id === extractRecordId(record.fields.vorgang));
  const beurteilungTarget = fachlicheBeurteilungenList.find(r => r.record_id === extractRecordId(record.fields.beurteilung));
  const regelTarget = regelnUndBefugnisseList.find(r => r.record_id === extractRecordId(record.fields.regel));
  const entscheiderTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.entscheider));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'grundlage_anforderungen')} value={Array.isArray(record.fields.grundlage_anforderungen) ? record.fields.grundlage_anforderungen.map((u: unknown) => anforderungenUndAngabenList.find(t => t.record_id === extractRecordId(u))?.fields.bezeichnung ?? '—').join(', ') : null} format="text" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'befugnis_geprueft')} value={record.fields.befugnis_geprueft} format="bool" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'unsicherheiten')} value={record.fields.unsicherheiten} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'vorschlag')} value={record.fields.vorschlag} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'entscheidung')} value={record.fields.entscheidung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'begruendung')} value={record.fields.begruendung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'folgen')} value={record.fields.folgen} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'freigabestatus')} value={record.fields.freigabestatus} format="pill" />
        <RecordField label={fieldLabel('entscheidungen_und_freigaben', 'entscheidungsdatum')} value={record.fields.entscheidungsdatum} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('entscheidungen_und_freigaben', 'vorgang')}
          name={vorgangTarget?.fields.vorgangsnummer ?? '—'}
          meta={undefined}
          onClick={vorgangTarget && onOpenVorgaenge ? () => onOpenVorgaenge!(vorgangTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('entscheidungen_und_freigaben', 'beurteilung')}
          name={beurteilungTarget?.fields.beurteilungstext ?? '—'}
          meta={[beurteilungTarget?.fields.ergebnis].filter(Boolean).join(' · ') || undefined}
          onClick={beurteilungTarget && onOpenFachlicheBeurteilungen ? () => onOpenFachlicheBeurteilungen!(beurteilungTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('entscheidungen_und_freigaben', 'regel')}
          name={regelTarget?.fields.regelbezeichnung ?? '—'}
          meta={[regelTarget?.fields.geltungsbereich].filter(Boolean).join(' · ') || undefined}
          onClick={regelTarget && onOpenRegelnUndBefugnisse ? () => onOpenRegelnUndBefugnisse!(regelTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('entscheidungen_und_freigaben', 'entscheider')}
          name={entscheiderTarget?.fields.vorname ?? '—'}
          meta={[entscheiderTarget?.fields.email, entscheiderTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={entscheiderTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(entscheiderTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ENTSCHEIDUNGEN_UND_FREIGABEN} recordId={record.record_id} readOnly={!perms.canWrite('entscheidungen_und_freigaben')} />
    </>
  );
}
