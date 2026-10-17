/**
 * Rückfrage stellen — 4-Schritt-Wizard.
 * Steps: 1) Vorgang wählen → 2) Betroffene offene Anforderungen wählen → 3) Adressat nach Zuständigkeit wählen
 *        → 4) Fragetext und Bündelkennung erfassen → Prüfen & anlegen.
 * Reads: vorgaenge, anforderungen_und_angaben, beteiligte. Writes: rueckfragen (create), vorgaenge (update prozessschritt).
 * Composes: IntentWizardShell, EntitySelectStep, Field, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useRueckfrageStellenFlow } from '@/lib/journey/flows/RueckfrageStellen';
import { tx } from '@/i18n';
import { useState } from 'react';

export default function RueckfrageStellenPage() {
  const [step, setStep] = useState(1);
  const flow = useRueckfrageStellenFlow({
    // the picked Vorgang is both the record that moves on and the Vorgang of the Rückfrage — one step asks it
    steps: { vorgaenge: 1, vorgang: 1, anforderungen: 2, adressat: 3, fragetext: 4, buendelkennung: 4 },
    items: {
      vorgaenge: (r, ctx) => ({ id: r.id, title: fieldText(r, 'vorgangsnummer'), subtitle: ctx.ref('kunde') }),
      anforderungen: (r, ctx) => ({
        id: r.id,
        title: fieldText(r, 'bezeichnung'),
        subtitle: fieldText(r, 'luecke_widerspruch') || ctx.ref('vorgang'),
        status: fieldLookup(r, 'angabestatus') ?? undefined,
      }),
      adressat: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: fieldLookup(r, 'rolle')?.label ?? fieldText(r, 'zustaendigkeit'),
      }),
    },
  });

  const vorgangPick = flow.pick('vorgaenge');
  const missingVorgang = !flow.targets.vorgaenge.selectedId;

  return (
    <IntentWizardShell
      title={tx('Rückfrage stellen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Offene Punkte bündeln und an die zuständige Person richten.'),
        needs: [tx('Vorgang'), tx('Offene Anforderungen'), tx('Ansprechperson')],
      }}
    >
      <WizardStep label={tx('Vorgang')} description={tx('Zu welchem Vorgang hast du eine Rückfrage?')}>
        <EntitySelectStep
          {...flow.picks.vorgaenge.select}
          selectedId={vorgangPick.selectedId}
          searchPlaceholder={tx('Vorgangsnummer suchen …')}
          onSelect={id => {
            vorgangPick.onSelect(id);
            flow.forms.rueckfragen.set('vorgang', id, flow.picks.vorgaenge.labelOf(id));
          }}
        />
      </WizardStep>
      <WizardStep label={tx('Anforderungen')} description={tx('Welche offenen Angaben betrifft die Rückfrage?')}>
        {missingVorgang ? (
          <StepNav onBack={() => setStep(1)} nextDisabled>{tx('Dieser Schritt braucht die Auswahl aus Schritt 1.')}</StepNav>
        ) : (
          <div className="space-y-4">
            <Field form={flow.forms.rueckfragen} name="anforderungen">
              <EntitySelectStep {...flow.picks.anforderungen.select} {...flow.pickMany('anforderungen')} searchPlaceholder={tx('Bezeichnung suchen …')} />
            </Field>
            <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Adressat')} />
          </div>
        )}
      </WizardStep>
      <WizardStep label={tx('Adressat')} description={tx('Wer ist nach Zuständigkeit der richtige Ansprechpartner?')}>
        <EntitySelectStep
          {...flow.picks.adressat.select}
          {...flow.pick('adressat')}
          avatar="initials"
          searchPlaceholder={tx('Nachname oder Zuständigkeit …')}
        />
      </WizardStep>
      <WizardStep label={tx('Fragetext')} description={tx('Formuliere die Frage und gib optional eine Bündelkennung an.')}>
        <div className="space-y-4">
          <Bound form={flow.forms.rueckfragen} name="fragetext" rows={5} />
          <Bound form={flow.forms.rueckfragen} name="buendelkennung" />
          <StepNav onBack={() => setStep(3)} onNext={() => flow.validateStep(4)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Rückfrage wird vorbereitet und der Vorgang rückt zur Kommunikation weiter.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          whatHappensNext={tx('Die Rückfrage hat den Status „Vorbereitet“. Sobald eine Antwort vorliegt, erfasst du sie im Ablauf „Antwort erfassen“.')}
          next={[
            { label: tx('Antwort erfassen'), href: '#/intents/antwort-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
