/**
 * useAntwortErfassenFlow — the plumbing of the flow « Antwort erfassen », generated from the plan.
 *
 * Changes `rueckfragen`: the record to change is picked (`flow.pick('rueckfragen')`), the form is prefilled with its values; asks `antwort`, `alter_wert`, `neuer_wert`; sets `antwortdatum`, `status` itself.
Changes `anforderungen_und_angaben` (only when the person fills it): the record to change is picked (`flow.pick('anforderungen_und_angaben')`), the form is prefilled with its values; asks `angabe`, `angabestatus`.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 4)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useAntwortErfassenFlow({
 *     steps: { rueckfragen: 1, anforderungen_und_angaben: 2, antwort: 3, alter_wert: 3, neuer_wert: 3, angabe: 3, angabestatus: 3 },
 *     items: { rueckfragen: r => ({ id: r.id, title: fieldText(r, 'fragetext') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.rueckfragen.select} {...flow.pick('rueckfragen')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.anforderungen_und_angaben.select} {...flow.pick('anforderungen_und_angaben')} />
 *     <Bound form={flow.forms.rueckfragen} name="antwort" />
 *     <Bound form={flow.forms.rueckfragen} name="alter_wert" />
 *     <Bound form={flow.forms.rueckfragen} name="neuer_wert" />
 *     <Bound form={flow.forms.anforderungen_und_angaben} name="angabe" />
 *     <Bound form={flow.forms.anforderungen_und_angaben} name="angabestatus" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import { useState } from 'react';
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,
  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep, type SummaryItem,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';
export type AntwortErfassenFieldKey = 'alter_wert' | 'anforderungen_und_angaben' | 'angabe' | 'angabestatus' | 'antwort' | 'neuer_wert' | 'rueckfragen';

export interface AntwortErfassenForms {
  rueckfragen: StepForm<'rueckfragen'>;
  anforderungen_und_angaben: StepForm<'anforderungen_und_angaben'>;
}

// Alias so the option generics stay readable.
type Key = AntwortErfassenFieldKey;

export interface AntwortErfassenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    rueckfragen?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    anforderungen_und_angaben?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"alter_wert": 3, "anforderungen_und_angaben": 2, "angabe": 3, "angabestatus": 3, "antwort": 3, "neuer_wert": 3, "rueckfragen": 1};
export const ANTWORTERFASSEN_REVIEW_STEP = 4;

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}

export function useAntwortErfassenFlow(options: AntwortErfassenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [rueckfragenTargetId, setRueckfragenTargetId] = useState<string | null>(null);
  const [anforderungen_und_angabenTargetId, setAnforderungenUndAngabenTargetId] = useState<string | null>(null);
  const rueckfragen = useStepForm('rueckfragen', {
    fields: ["antwort", "alter_wert", "neuer_wert"],
    steps: only(steps, ["antwort", "alter_wert", "neuer_wert"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["antwort", "alter_wert", "neuer_wert"]),
    messages: only(options.messages as Record<string, string> | undefined, ["antwort", "alter_wert", "neuer_wert"]),
  });
  const anforderungen_und_angaben = useStepForm('anforderungen_und_angaben', {
    fields: ["angabe", "angabestatus"],
    steps: only(steps, ["angabe", "angabestatus"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["angabe", "angabestatus"]),
    messages: only(options.messages as Record<string, string> | undefined, ["angabe", "angabestatus"]),
  });
  const forms: AntwortErfassenForms = { rueckfragen, anforderungen_und_angaben };
  const formList: StepForm[] = [rueckfragen, anforderungen_und_angaben];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    rueckfragen: useRecordSearch(servicePort, 'rueckfragen', withPickPolicy('rueckfragen', {
      searchFields: ["fragetext"] as never,
      filter: "r.v_status == 'gesendet'",
      where: (r: JourneyRecord) => (fieldLookup(r, "status")?.key ?? null) === "gesendet",
      toItem: options.items?.rueckfragen as never,
    })),
    anforderungen_und_angaben: useRecordSearch(servicePort, 'anforderungen_und_angaben', withPickPolicy('anforderungen_und_angaben', {
      searchFields: ["bezeichnung"] as never,
      toItem: options.items?.anforderungen_und_angaben as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:antwort-erfassen:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:antwort-erfassen:write:${entity}.${field}`,
  });
  const picks = {
    rueckfragen: { ...searches.rueckfragen, select: { ...searches.rueckfragen.select, create: false as boolean, hint: hintFor('rueckfragen', 'rueckfragen', {"conditions": [{"field": "status", "op": "eq", "value": "gesendet"}], "mode": "all"} as PickWhere | null) } },
    anforderungen_und_angaben: { ...searches.anforderungen_und_angaben, select: { ...searches.anforderungen_und_angaben.select, create: false as boolean, hint: hintFor('anforderungen_und_angaben', 'anforderungen_und_angaben', null as PickWhere | null) } },
  };

  const anforderungen_und_angabenFilled = hasValues(anforderungen_und_angaben);
  const plan: PlanStep[] = [
    {
      key: 'rueckfragen', entity: 'rueckfragen', form: rueckfragen,
      updates: () => rueckfragenTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => rueckfragenTargetId
        ? { key: 'target:rueckfragen', label: entityLabel('rueckfragen'), value: picks.rueckfragen.labelOf(rueckfragenTargetId) ?? rueckfragenTargetId, step: steps.rueckfragen }
        : undefined,
      values: (): FormValues => ({
        antwortdatum: policyFixedValue('rueckfragen', 'antwortdatum') ?? todayIso(),
        status: policyFixedValue('rueckfragen', 'status') ?? "beantwortet",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('rueckfragen', 'status', policyFixedValue('rueckfragen', 'status') ?? "beantwortet")],
    },
    ...(anforderungen_und_angabenFilled ? [{
      key: 'anforderungen_und_angaben', entity: 'anforderungen_und_angaben', form: anforderungen_und_angaben, primary: true,
      updates: () => anforderungen_und_angabenTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => anforderungen_und_angabenTargetId
        ? { key: 'target:anforderungen_und_angaben', label: entityLabel('anforderungen_und_angaben'), value: picks.anforderungen_und_angaben.labelOf(anforderungen_und_angabenTargetId) ?? anforderungen_und_angabenTargetId, step: steps.anforderungen_und_angaben }
        : undefined,    } as PlanStep] : []),
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'antwort-erfassen' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    rueckfragen: {
      selectedId: rueckfragenTargetId,
      onSelect: (id: string) => {
        setRueckfragenTargetId(id);
        const rec = picks.rueckfragen.recordOf(id);
        if (rec) rueckfragen.reset({ antwort: fieldText(rec, "antwort"), alter_wert: fieldText(rec, "alter_wert"), neuer_wert: fieldText(rec, "neuer_wert"), });
      },
      get record(): JourneyRecord | undefined { return rueckfragenTargetId ? picks.rueckfragen.recordOf(rueckfragenTargetId) : undefined; },
    },
    anforderungen_und_angaben: {
      selectedId: anforderungen_und_angabenTargetId,
      onSelect: (id: string) => {
        setAnforderungenUndAngabenTargetId(id);
        const rec = picks.anforderungen_und_angaben.recordOf(id);
        if (rec) anforderungen_und_angaben.reset({ angabe: fieldText(rec, "angabe"), angabestatus: fieldLookup(rec, "angabestatus")?.key, });
      },
      get record(): JourneyRecord | undefined { return anforderungen_und_angabenTargetId ? picks.anforderungen_und_angaben.recordOf(anforderungen_und_angabenTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: AntwortErfassenFieldKey) => {
    if (field in targets) {
      const t = targets[field as keyof typeof targets];
      return { selectedId: t.selectedId, onSelect: t.onSelect };
    }
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id)),
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: AntwortErfassenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setRueckfragenTargetId(null); setAnforderungenUndAngabenTargetId(null); };

  return {
    slug: 'antwort-erfassen' as const,
    draftKey: 'antwort-erfassen' as const,
    entity: 'anforderungen_und_angaben' as const,
    form: anforderungen_und_angaben,
    forms, formList, picks, submit, steps, targets,    reviewStep: ANTWORTERFASSEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type AntwortErfassenFlow = ReturnType<typeof useAntwortErfassenFlow>;
