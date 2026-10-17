/**
 * Antwort erfassen — 4-Schritt-Wizard + Prüfen.
 * Steps: 1) Offene Rückfrage wählen → 2) Antwort erfassen → 3) Alten und neuen Wert festhalten
 *        → 4) Angabe aktualisieren (optional) → Prüfen & speichern.
 * Reads: rueckfragen, anforderungen_und_angaben. Writes (update): rueckfragen (antwort, antwortdatum, alter_wert,
 *        neuer_wert, status = beantwortet), optional anforderungen_und_angaben (angabe, angabestatus).
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
import { useAntwortErfassenFlow } from '@/lib/journey/flows/AntwortErfassen';
import { tx } from '@/i18n';

export default function AntwortErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useAntwortErfassenFlow({
    steps: {
      rueckfragen: 1,
      antwort: 2,
      alter_wert: 3,
      neuer_wert: 3,
      anforderungen_und_angaben: 4,
      angabe: 4,
      angabestatus: 4,
    },
    items: {
      rueckfragen: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'fragetext') || tx('Rückfrage ohne Text'),
        subtitle: ctx.ref('adressat'),
        status: fieldLookup(r, 'status') ?? undefined,
      }),
      anforderungen_und_angaben: r => ({
        id: r.id,
        title: fieldText(r, 'bezeichnung'),
        subtitle: fieldLookup(r, 'angabestatus')?.label,
      }),
    },
  });

  const rueckfrage = flow.targets.rueckfragen?.record;
  const anforderung = flow.targets.anforderungen_und_angaben?.record;

  return (
    <IntentWizardShell
      title={tx('Antwort erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Eine eingehende Antwort der passenden Rückfrage zuordnen.'),
        needs: [tx('Die Rückfrage, auf die geantwortet wurde'), tx('Den Antworttext'), tx('Alter und neuer Wert, falls sich eine Angabe geändert hat')],
      }}
    >
      <WizardStep label={tx('Rückfrage')} description={tx('Zu welcher Rückfrage ist die Antwort eingegangen?')}>
        <EntitySelectStep
          {...flow.picks.rueckfragen.select}
          {...flow.pick('rueckfragen')}
          searchPlaceholder={tx('Fragetext suchen …')}
        />
      </WizardStep>

      <WizardStep label={tx('Antwort')} description={tx('Halte fest, was geantwortet wurde.')} needs={['rueckfragen']}>
        <div className="space-y-4">
          {rueckfrage && (
            <div className="rounded-2xl border bg-secondary/40 p-4 text-sm overflow-hidden">
              <p className="text-xs text-muted-foreground">{tx('Gestellte Frage')}</p>
              <p className="whitespace-pre-wrap break-words">{fieldText(rueckfrage, 'fragetext')}</p>
            </div>
          )}
          <Bound form={flow.forms.rueckfragen} name="antwort" rows={5} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Alter und neuer Wert')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Alter und neuer Wert')}
        description={tx('Hat sich eine Angabe geändert? Dann halte beide Werte fest.')}
        needs={['rueckfragen']}
      >
        <div className="space-y-4">
          <Bound form={flow.forms.rueckfragen} name="alter_wert" />
          <Bound form={flow.forms.rueckfragen} name="neuer_wert" />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Angabe aktualisieren')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Angabe aktualisieren')}
        description={tx('Optional: Wähle die Angabe, die sich durch die Antwort geändert hat.')}
      >
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.anforderungen_und_angaben.select}
            {...flow.pick('anforderungen_und_angaben')}
            searchPlaceholder={tx('Bezeichnung suchen …')}
          />
          {anforderung && (
            <div className="space-y-4">
              <Bound form={flow.forms.anforderungen_und_angaben} name="angabe" rows={3} />
              <Bound form={flow.forms.anforderungen_und_angaben} name="angabestatus" />
            </div>
          )}
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => (anforderung ? flow.validateStep(4) : true)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[{ key: 'status', label: tx('Status'), value: tx('Beantwortet') }]}
            whatHappensNext={tx('Die Rückfrage gilt als beantwortet und trägt das heutige Antwortdatum.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Entscheidung treffen'), href: '#/intents/entscheidung-treffen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Mit der Antwort kannst du jetzt die Entscheidung vorbereiten.')}
        />
      )}
    </IntentWizardShell>
  );
}
