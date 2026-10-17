/**
 * Vorgang anlegen — 4-Schritt-Wizard.
 * Steps: 1) Kunde und Bearbeiter wählen → 2) Eingangsdatum & Kundenanfrage erfassen → 3) Erste Anforderung mit Informationsquelle → 4) Prüfen & anlegen.
 * Reads: beteiligte, informationsquellen, vorgaenge (Eindeutigkeit der Nummer). Writes: vorgaenge, anforderungen_und_angaben (via useVorgangAnlegenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, todayIso, useRecordCount } from '@/lib/journey';
import { useVorgangAnlegenFlow } from '@/lib/journey/flows/VorgangAnlegen';
import { formatDate } from '@/lib/formatters';
import { tx } from '@/i18n';

export default function VorgangAnlegenPage() {
  const [step, setStep] = useState(1);
  const flow = useVorgangAnlegenFlow({
    steps: {
      kunde: 1, bearbeiter: 1,
      vorgangsnummer: 2, kundenanfrage: 2,
      bezeichnung: 3, angabe: 3, informationsquelle: 3, quellenverweis: 3, angabestatus: 3, luecke_widerspruch: 3,
    },
    items: {
      kunde: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: fieldLookup(r, 'rolle')?.label,
      }),
      bearbeiter: r => ({
        id: r.id,
        title: `${fieldText(r, 'vorname')} ${fieldText(r, 'nachname')}`.trim(),
        subtitle: fieldLookup(r, 'rolle')?.label,
      }),
      informationsquelle: r => ({
        id: r.id,
        title: fieldText(r, 'bezeichnung'),
        subtitle: fieldLookup(r, 'art')?.label,
      }),
    },
  });

  const nummer = String(flow.forms.vorgaenge.get('vorgangsnummer') ?? '').trim();
  const safeNummer = nummer.replace(/['"\\]/g, '');
  const duplicate = useRecordCount(flow.port, 'vorgaenge', {
    filter: `r.v_vorgangsnummer == '${safeNummer}'`,
    where: r => fieldText(r, 'vorgangsnummer').trim() === safeNummer,
    enabled: safeNummer.length > 0,
  });

  const checkStep2 = () => {
    const ok = flow.validateStep(2);
    if (ok === false) return false;
    if (duplicate.count !== null && duplicate.count > 0) return tx('Diese Vorgangsnummer existiert bereits.');
    return ok;
  };

  return (
    <IntentWizardShell
      title={tx('Vorgang anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Kundenanfrage aufnehmen und den Vorgang mit ersten Anforderungen anlegen.'),
        needs: [tx('Vorgangsnummer'), tx('Kunde und Bearbeiter'), tx('Kundenanfrage')],
      }}
    >
      <WizardStep label={tx('Beteiligte')} description={tx('Wähle den Kunden und den Bearbeiter dieses Vorgangs.')}>
        <div className="space-y-6">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{tx('Kunde')}</h3>
            <EntitySelectStep
              {...flow.picks.kunde.select}
              {...flow.pick('kunde')}
              searchPlaceholder={tx('Name suchen …')}
            />
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{tx('Bearbeiter')}</h3>
            <EntitySelectStep
              {...flow.picks.bearbeiter.select}
              {...flow.pick('bearbeiter')}
              searchPlaceholder={tx('Name suchen …')}
            />
          </section>
          <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Kundenanfrage')} />
        </div>
      </WizardStep>

      <WizardStep label={tx('Anfrage')} description={tx('Vergib die Vorgangsnummer und halte die Kundenanfrage fest.')}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {tx`Eingangsdatum ist heute: ${formatDate(todayIso())}`}
          </p>
          <Bound form={flow.forms.vorgaenge} name="vorgangsnummer" />
          <Bound form={flow.forms.vorgaenge} name="kundenanfrage" rows={5} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={checkStep2}
            nextStepLabel={tx('Erste Anforderung')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Anforderung')}
        description={tx('Erfasse die erste Anforderung mit ihrer Informationsquelle — oder überspringe den Schritt.')}
      >
        <div className="space-y-4">
          <Bound form={flow.forms.anforderungen_und_angaben} name="bezeichnung" />
          <Bound form={flow.forms.anforderungen_und_angaben} name="angabe" rows={3} />
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">{tx('Informationsquelle')}</h3>
            <EntitySelectStep
              {...flow.picks.informationsquelle.select}
              {...flow.pick('informationsquelle')}
              searchPlaceholder={tx('Quelle suchen …')}
            />
          </section>
          <Bound form={flow.forms.anforderungen_und_angaben} name="quellenverweis" />
          <Bound form={flow.forms.anforderungen_und_angaben} name="angabestatus" />
          <Bound form={flow.forms.anforderungen_und_angaben} name="luecke_widerspruch" rows={3} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'eingangsdatum', label: tx('Eingangsdatum'), value: formatDate(todayIso()) },
              { key: 'prozessschritt', label: tx('Prozessschritt'), value: tx('Anfrage verstehen') },
              { key: 'freigabestatus', label: tx('Freigabestatus'), value: tx('Offen') },
              { key: 'uebergabestatus', label: tx('Übergabestatus'), value: tx('Nicht bereit') },
            ]}
            whatHappensNext={tx('Der Vorgang startet bei „Anfrage verstehen“, die erste Anforderung wird direkt daran gehängt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Anforderungen prüfen'), href: '#/intents/anforderungen-pruefen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Prüfe als Nächstes die erfassten Anforderungen und ihre Quellen.')}
        />
      )}
    </IntentWizardShell>
  );
}
