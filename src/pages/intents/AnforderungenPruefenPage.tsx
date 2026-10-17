/**
 * Anforderungen prüfen — 5-Schritt-Wizard.
 * Steps: 1) Vorgang wählen → 2) Angabe wählen → 3) Status und Lücke bewerten → 4) Prüfpunkt, Unsicherheit und Quelle → 5) Prüfen & speichern.
 * Reads: vorgaenge, anforderungen_und_angaben, informationsquellen. Writes: anforderungen_und_angaben (update), vorgaenge (update, prozessschritt).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useAnforderungenPruefenFlow } from '@/lib/journey/flows/AnforderungenPruefen';
import { tx } from '@/i18n';

export default function AnforderungenPruefenPage() {
  const [step, setStep] = useState(1);
  const flow = useAnforderungenPruefenFlow({
    steps: {
      vorgaenge: 1,
      anforderungen_und_angaben: 2,
      angabestatus: 3,
      luecke_widerspruch: 3,
      pruefpunkt: 4,
      unsicherheit: 4,
      quellenverweis: 4,
      informationsquelle: 4,
    },
    items: {
      vorgaenge: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'vorgangsnummer'),
        subtitle: ctx.ref('kunde'),
        status: fieldLookup(r, 'prozessschritt') ?? undefined,
      } as { id: string; title: string }),
      anforderungen_und_angaben: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'bezeichnung'),
        subtitle: [ctx.ref('vorgang'), fieldText(r, 'angabe')].filter(Boolean).join(' — '),
        status: fieldLookup(r, 'angabestatus') ?? undefined,
      } as { id: string; title: string }),
      informationsquelle: r => ({ id: r.id, title: fieldText(r, 'bezeichnung') }),
    },
  });
  const f = flow.forms.anforderungen_und_angaben;

  return (
    <IntentWizardShell
      title={tx('Anforderungen prüfen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Angaben eines Vorgangs prüfen, Lücken markieren und den Prozessschritt weiterschalten.'),
        needs: [tx('Vorgangsnummer'), tx('Die zu prüfende Angabe')],
      }}
    >
      <WizardStep label={tx('Vorgang')} description={tx('Welchen Vorgang prüfst du?')}>
        <EntitySelectStep
          {...flow.picks.vorgaenge.select}
          {...flow.pick('vorgaenge')}
          searchPlaceholder={tx('Vorgangsnummer suchen …')}
        />
      </WizardStep>
      <WizardStep label={tx('Angabe')} description={tx('Welche Angabe oder Anforderung wird geprüft?')}>
        <EntitySelectStep
          {...flow.picks.anforderungen_und_angaben.select}
          {...flow.pick('anforderungen_und_angaben')}
          searchPlaceholder={tx('Bezeichnung suchen …')}
        />
      </WizardStep>
      <WizardStep label={tx('Bewertung')} description={tx('Wie verlässlich ist die Angabe? Halte Lücken oder Widersprüche fest.')}>
        <div className="space-y-4">
          <Bound form={f} name="angabestatus" />
          <Bound form={f} name="luecke_widerspruch" rows={3} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfpunkt')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfpunkt')} description={tx('Technischen Prüfpunkt, Unsicherheit und Quelle festhalten.')}>
        <div className="space-y-4">
          <Bound form={f} name="pruefpunkt" rows={3} />
          <Bound form={f} name="unsicherheit" rows={3} />
          <Bound form={f} name="quellenverweis" />
          <EntitySelectStep
            {...flow.picks.informationsquelle.select}
            {...flow.pick('informationsquelle')}
            searchPlaceholder={tx('Informationsquelle suchen …')}
          />
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'prozessschritt', label: tx('Prozessschritt'), value: tx('Informationen prüfen') }]}
            whatHappensNext={tx('Die Bewertung wird gespeichert und der Vorgang rückt zum Schritt „Informationen prüfen“.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Beurteilung vorbereiten'), href: '#/intents/beurteilung-vorbereiten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Als Nächstes kannst du die fachliche Beurteilung vorbereiten.')}
        />
      )}
    </IntentWizardShell>
  );
}
