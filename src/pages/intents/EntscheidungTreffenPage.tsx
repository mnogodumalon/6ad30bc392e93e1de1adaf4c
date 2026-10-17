/**
 * Entscheidung treffen — 4-Schritt-Wizard.
 * Steps: 1) Vorgang wählen → 2) Anforderungen und Beurteilung wählen → 3) Regel und Entscheider wählen, Befugnis prüfen
 *        → 4) Entscheidung, Begründung, Folgen und Unsicherheiten erfassen → Prüfen & festhalten.
 * Reads: vorgaenge, anforderungen_und_angaben, fachliche_beurteilungen, regeln_und_befugnisse, beteiligte.
 * Writes: entscheidungen_und_freigaben (create), vorgaenge (update prozessschritt) — via useEntscheidungTreffenFlow.
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldRef, todayIso, formatFieldValue } from '@/lib/journey';
import { useEntscheidungTreffenFlow } from '@/lib/journey/flows/EntscheidungTreffen';
import { tx } from '@/i18n';

export default function EntscheidungTreffenPage() {
  const [step, setStep] = useState(1);
  const flow = useEntscheidungTreffenFlow({
    steps: {
      vorgaenge: 1, vorgang: 1,
      grundlage_anforderungen: 2, beurteilung: 2,
      regel: 3, entscheider: 3, befugnis_geprueft: 3,
      unsicherheiten: 4, vorschlag: 4, entscheidung: 4, begruendung: 4, folgen: 4, freigabestatus: 4,
    },
    items: {
      vorgaenge: r => ({ id: r.id, title: fieldText(r, 'vorgangsnummer'), subtitle: fieldText(r, 'kundenanfrage').slice(0, 90), status: fieldLookup(r, 'prozessschritt') ?? undefined }),
      grundlage_anforderungen: r => ({ id: r.id, title: fieldText(r, 'bezeichnung'), subtitle: fieldText(r, 'angabe').slice(0, 90), status: fieldLookup(r, 'angabestatus') ?? undefined }),
      beurteilung: r => ({ id: r.id, title: fieldText(r, 'beurteilungstext').slice(0, 80), subtitle: fieldText(r, 'ergebnis'), status: fieldLookup(r, 'gueltigkeitsstatus') ?? undefined }),
      regel: r => ({
        id: r.id,
        title: fieldText(r, 'regelbezeichnung'),
        subtitle: [fieldLookup(r, 'regelart')?.label, fieldLookup(r, 'berechtigte_rolle')?.label, r.fields.freigabepflicht === true ? tx('freigabepflichtig') : null].filter(Boolean).join(' · '),
      }),
      entscheider: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: [fieldLookup(r, 'rolle')?.label, fieldText(r, 'befugnisgrenzen').slice(0, 70)].filter(Boolean).join(' · '),
      }),
    },
  });
  const f = flow.forms.entscheidungen_und_freigaben;

  // Check before the write: the decider must be entitled and match the rule's role or person.
  const checkAuthority = (): string | undefined => {
    const entscheiderId = f.get('entscheider');
    const entscheider = typeof entscheiderId === 'string' && entscheiderId ? flow.picks.entscheider.recordOf(entscheiderId) : undefined;
    if (!entscheider) return undefined;
    const message = tx('Der Entscheider ist für diese Regel nicht entscheidungsbefugt.');
    if (entscheider.fields.entscheidungsbefugt !== true) return message;
    const regelId = f.get('regel');
    const regel = typeof regelId === 'string' && regelId ? flow.picks.regel.recordOf(regelId) : undefined;
    if (!regel) return undefined;
    const person = fieldRef(regel, 'berechtigter');
    const rolle = fieldLookup(regel, 'berechtigte_rolle')?.key;
    if (!person && !rolle) return undefined;
    if (person && person === entscheider.id) return undefined;
    if (rolle && rolle === fieldLookup(entscheider, 'rolle')?.key) return undefined;
    return message;
  };

  const pickVorgang = flow.pick('vorgaenge');
  const onPickVorgang = (id: string) => {
    pickVorgang.onSelect(id);
    f.set('vorgang', id, flow.picks.vorgaenge.labelOf(id));
  };

  return (
    <IntentWizardShell
      title={tx('Entscheidung treffen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine Entscheidung mit Grundlage, Regel und geprüfter Befugnis festhalten.'),
        needs: [tx('Vorgang'), tx('Beurteilung und Regel'), tx('Entscheider mit Befugnis')],
      }}
    >
      <WizardStep label={tx('Vorgang')} description={tx('Zu welchem Vorgang gehört die Entscheidung?')}>
        <EntitySelectStep
          {...flow.picks.vorgaenge.select}
          selectedId={pickVorgang.selectedId}
          onSelect={onPickVorgang}
          searchPlaceholder={tx('Vorgangsnummer …')}
        />
      </WizardStep>

      <WizardStep label={tx('Grundlage')} description={tx('Welche Anforderungen und welche Beurteilung liegen zugrunde?')} needs={['vorgang']}>
        <div className="space-y-6">
          <EntitySelectStep {...flow.picks.grundlage_anforderungen.select} {...flow.pickMany('grundlage_anforderungen')} searchPlaceholder={tx('Anforderung suchen …')} />
          <EntitySelectStep {...flow.picks.beurteilung.select} {...flow.pick('beurteilung')} searchPlaceholder={tx('Beurteilung suchen …')} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Regel und Entscheider')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Regel & Befugnis')} description={tx('Welche Regel gilt, wer entscheidet — und ist die Befugnis geprüft?')} needs={['vorgang']}>
        <div className="space-y-6">
          <EntitySelectStep {...flow.picks.regel.select} {...flow.pick('regel')} searchPlaceholder={tx('Regel suchen …')} />
          <EntitySelectStep {...flow.picks.entscheider.select} {...flow.pick('entscheider')} searchPlaceholder={tx('Nachname …')} />
          <Bound form={f} name="befugnis_geprueft" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => {
              const valid = flow.validateStep(3);
              return valid && (checkAuthority() ?? true);
            }}
            nextStepLabel={tx('Entscheidung erfassen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Entscheidung')} description={tx('Entscheidung, Begründung, Folgen und Unsicherheiten festhalten.')} needs={['entscheider']}>
        <div className="space-y-4">
          <Bound form={f} name="vorschlag" rows={3} />
          <Bound form={f} name="entscheidung" rows={3} />
          <Bound form={f} name="begruendung" rows={3} />
          <Bound form={f} name="folgen" rows={3} />
          <Bound form={f} name="unsicherheiten" rows={3} />
          <Bound form={f} name="freigabestatus" />
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => {
              const valid = flow.validateStep(4);
              return valid && (checkAuthority() ?? true);
            }}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'entscheidungsdatum', label: tx('Datum'), value: formatFieldValue('entscheidungen_und_freigaben', 'entscheidungsdatum', todayIso()) }]}
            whatHappensNext={tx('Die Entscheidung wird gespeichert und der Vorgang rückt zum Schritt „Entscheidungen treffen“.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Der Freigabestatus ist am Vorgang festgehalten.')}
          next={[
            { label: tx('Weitere Entscheidung'), onClick: flow.reset },
            { label: tx('Rückfrage stellen'), href: '#/intents/rueckfrage-stellen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
