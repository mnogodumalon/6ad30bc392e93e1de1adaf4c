/**
 * Beurteilung vorbereiten — 4-Schritt-Wizard.
 * Steps: 1) Vorgang und Anforderung wählen → 2) Beurteiler und Fachbereich → 3) Beurteilung und Unsicherheiten
 *        → 4) Gültigkeitsstatus (Entwurf) setzen & prüfen.
 * Reads: vorgaenge, anforderungen_und_angaben, beteiligte.
 * Writes: fachliche_beurteilungen (create), vorgaenge (update prozessschritt) — via useBeurteilungVorbereitenFlow.
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
import { useBeurteilungVorbereitenFlow } from '@/lib/journey/flows/BeurteilungVorbereiten';
import { tx } from '@/i18n';

export default function BeurteilungVorbereitenPage() {
  const [step, setStep] = useState(1);
  const flow = useBeurteilungVorbereitenFlow({
    steps: {
      vorgaenge: 1, vorgang: 1, anforderung: 1,
      beurteiler: 2, fachbereich: 2,
      beurteilungstext: 3, ergebnis: 3, unsicherheiten: 3,
    },
    items: {
      vorgaenge: r => ({ id: r.id, title: fieldText(r, 'vorgangsnummer'), subtitle: fieldLookup(r, 'prozessschritt')?.label }),
      vorgang: r => ({ id: r.id, title: fieldText(r, 'vorgangsnummer'), subtitle: fieldLookup(r, 'prozessschritt')?.label }),
      anforderung: r => ({ id: r.id, title: fieldText(r, 'bezeichnung'), subtitle: fieldLookup(r, 'angabestatus')?.label }),
      beurteiler: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: fieldLookup(r, 'rolle')?.label,
      }),
    },
  });

  const beurteilung = flow.forms.fachliche_beurteilungen;
  const vorgangPick = flow.pick('vorgaenge');

  return (
    <IntentWizardShell
      title={tx('Beurteilung vorbereiten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Fachliche Beurteilung zu einer Anforderung anlegen — als Entwurf.'),
        needs: [tx('Vorgang'), tx('Anforderung'), tx('Beurteiler'), tx('Beurteilungstext')],
      }}
    >
      <WizardStep label={tx('Vorgang & Anforderung')} description={tx('Wähle den Vorgang und die Anforderung, die beurteilt werden soll.')}>
        <div className="space-y-6">
          <EntitySelectStep
            {...flow.picks.vorgaenge.select}
            {...vorgangPick}
            onSelect={id => {
              vorgangPick.onSelect(id);
              beurteilung.set('vorgang', id, flow.picks.vorgaenge.labelOf(id) ?? '');
            }}
            searchPlaceholder={tx('Vorgangsnummer suchen …')}
          />
          <EntitySelectStep
            {...flow.picks.anforderung.select}
            {...flow.pick('anforderung')}
            searchPlaceholder={tx('Anforderung suchen …')}
          />
          <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Beurteiler')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Beurteiler')} description={tx('Wer beurteilt, und aus welchem Fachbereich?')} needs={['vorgang']}>
        <div className="space-y-6">
          <EntitySelectStep
            {...flow.picks.beurteiler.select}
            {...flow.pick('beurteiler')}
            avatar="initials"
            searchPlaceholder={tx('Name suchen …')}
          />
          <Bound form={beurteilung} name="fachbereich" />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Beurteilung')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Beurteilung')} description={tx('Halte die Beurteilung und offene Unsicherheiten fest.')} needs={['beurteiler']}>
        <div className="space-y-4">
          <Bound form={beurteilung} name="beurteilungstext" rows={5} />
          <Bound form={beurteilung} name="ergebnis" />
          <Bound form={beurteilung} name="unsicherheiten" rows={3} />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <div className="mb-4 rounded-2xl border bg-card p-4 overflow-hidden">
            <p className="text-sm font-medium">{tx('Gültigkeitsstatus: Entwurf')}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {tx('Die Beurteilung bleibt unbestätigt, bis sie fachlich geprüft wird. KI-Vorschläge werden nie automatisch bestätigt.')}
            </p>
          </div>
        )}
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'gueltigkeitsstatus', label: tx('Gültigkeitsstatus'), value: tx('Entwurf') },
              { key: 'prozessschritt', label: tx('Prozessschritt des Vorgangs'), value: tx('Beurteilungen vorbereiten') },
            ]}
            whatHappensNext={tx('Die Beurteilung wird als Entwurf angelegt und der Vorgang rückt zu „Beurteilungen vorbereiten“.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Rückfrage stellen'), href: '#/intents/rueckfrage-stellen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Offene Punkte kannst du als Rückfrage bündeln und stellen.')}
        />
      )}
    </IntentWizardShell>
  );
}
