/**
 * useAnforderungenPruefenFlow — the plumbing of the flow « Anforderungen prüfen », generated from the plan.
 *
 * Changes `anforderungen_und_angaben`: the record to change is picked (`flow.pick('anforderungen_und_angaben')`), the form is prefilled with its values; asks `pruefpunkt`, `angabestatus`, `unsicherheit`, `quellenverweis`, `informationsquelle`, `luecke_widerspruch`.
Changes `vorgaenge`: the record to change is picked (`flow.pick('vorgaenge')`), the form is prefilled with its values; ; sets `prozessschritt` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 5)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useAnforderungenPruefenFlow({
 *     steps: { anforderungen_und_angaben: 1, vorgaenge: 2, informationsquelle: 3, pruefpunkt: 4, angabestatus: 4, unsicherheit: 4, quellenverweis: 4, luecke_widerspruch: 4 },
 *     items: { informationsquelle: r => ({ id: r.id, title: fieldText(r, 'bezeichnung') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.informationsquelle.select} {...flow.pick('informationsquelle')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.anforderungen_und_angaben.select} {...flow.pick('anforderungen_und_angaben')} />
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.vorgaenge.select} {...flow.pick('vorgaenge')} />
 *     <Bound form={flow.forms.anforderungen_und_angaben} name="pruefpunkt" />
 *     <Bound form={flow.forms.anforderungen_und_angaben} name="angabestatus" />
 *     <Bound form={flow.forms.anforderungen_und_angaben} name="unsicherheit" />
 *     <Bound form={flow.forms.anforderungen_und_angaben} name="quellenverweis" />
 *     <Bound form={flow.forms.anforderungen_und_angaben} name="luecke_widerspruch" />
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
export type AnforderungenPruefenFieldKey = 'anforderungen_und_angaben' | 'angabestatus' | 'informationsquelle' | 'luecke_widerspruch' | 'pruefpunkt' | 'quellenverweis' | 'unsicherheit' | 'vorgaenge';

export interface AnforderungenPruefenForms {
  anforderungen_und_angaben: StepForm<'anforderungen_und_angaben'>;
  vorgaenge: StepForm<'vorgaenge'>;
}

// Alias so the option generics stay readable.
type Key = AnforderungenPruefenFieldKey;

export interface AnforderungenPruefenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    informationsquelle?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    anforderungen_und_angaben?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    vorgaenge?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"anforderungen_und_angaben": 1, "angabestatus": 4, "informationsquelle": 3, "luecke_widerspruch": 4, "pruefpunkt": 4, "quellenverweis": 4, "unsicherheit": 4, "vorgaenge": 2};
export const ANFORDERUNGENPRUEFEN_REVIEW_STEP = 5;

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

export function useAnforderungenPruefenFlow(options: AnforderungenPruefenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const [anforderungen_und_angabenTargetId, setAnforderungenUndAngabenTargetId] = useState<string | null>(null);
  const [vorgaengeTargetId, setVorgaengeTargetId] = useState<string | null>(null);
  const anforderungen_und_angaben = useStepForm('anforderungen_und_angaben', {
    fields: ["pruefpunkt", "angabestatus", "unsicherheit", "quellenverweis", "informationsquelle", "luecke_widerspruch"],
    steps: only(steps, ["pruefpunkt", "angabestatus", "unsicherheit", "quellenverweis", "informationsquelle", "luecke_widerspruch"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["pruefpunkt", "angabestatus", "unsicherheit", "quellenverweis", "informationsquelle", "luecke_widerspruch"]),
    messages: only(options.messages as Record<string, string> | undefined, ["pruefpunkt", "angabestatus", "unsicherheit", "quellenverweis", "informationsquelle", "luecke_widerspruch"]),
  });
  const vorgaenge = useStepForm('vorgaenge', {
    fields: [],
    steps: only(steps, []) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, []),
    messages: only(options.messages as Record<string, string> | undefined, []),
  });
  const forms: AnforderungenPruefenForms = { anforderungen_und_angaben, vorgaenge };
  const formList: StepForm[] = [anforderungen_und_angaben, vorgaenge];

  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    informationsquelle: useRecordSearch(servicePort, 'informationsquellen', withPickPolicy('informationsquelle', {
      searchFields: ["bezeichnung"] as never,
      toItem: options.items?.informationsquelle as never,
    })),
    anforderungen_und_angaben: useRecordSearch(servicePort, 'anforderungen_und_angaben', withPickPolicy('anforderungen_und_angaben', {
      searchFields: ["bezeichnung", "angabe"] as never,
      toItem: options.items?.anforderungen_und_angaben as never,
    })),
    vorgaenge: useRecordSearch(servicePort, 'vorgaenge', withPickPolicy('vorgaenge', {
      searchFields: ["vorgangsnummer"] as never,
      filter: "r.v_prozessschritt != 'abgeschlossen'",
      where: (r: JourneyRecord) => (fieldLookup(r, "prozessschritt")?.key ?? null) !== "abgeschlossen",
      toItem: options.items?.vorgaenge as never,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:anforderungen-pruefen:read:${entity}`);
  // a fixed value the flow sets itself, as a review row with the link that changes it
  const setting = (entity: EntityKey, field: string, value: unknown): SummaryItem => ({
    key: `setting:${entity}.${field}`, label: labelOf(entity, field),
    value: optionsOf(entity, field).find(o => o.key === String(value))?.label ?? String(value ?? ''),
    href: `#/verwaltung/anwendung?line=intent:anforderungen-pruefen:write:${entity}.${field}`,
  });
  const picks = {
    informationsquelle: { ...searches.informationsquelle, select: { ...searches.informationsquelle.select, create: false as boolean, hint: hintFor('informationsquelle', 'informationsquellen', null as PickWhere | null) } },
    anforderungen_und_angaben: { ...searches.anforderungen_und_angaben, select: { ...searches.anforderungen_und_angaben.select, create: false as boolean, hint: hintFor('anforderungen_und_angaben', 'anforderungen_und_angaben', null as PickWhere | null) } },
    vorgaenge: { ...searches.vorgaenge, select: { ...searches.vorgaenge.select, create: false as boolean, hint: hintFor('vorgaenge', 'vorgaenge', {"conditions": [{"field": "prozessschritt", "op": "ne", "value": "abgeschlossen"}], "mode": "all"} as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'anforderungen_und_angaben', entity: 'anforderungen_und_angaben', form: anforderungen_und_angaben,
      updates: () => anforderungen_und_angabenTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => anforderungen_und_angabenTargetId
        ? { key: 'target:anforderungen_und_angaben', label: entityLabel('anforderungen_und_angaben'), value: picks.anforderungen_und_angaben.labelOf(anforderungen_und_angabenTargetId) ?? anforderungen_und_angabenTargetId, step: steps.anforderungen_und_angaben }
        : undefined,    },
    {
      key: 'vorgaenge', entity: 'vorgaenge', form: vorgaenge, primary: true,
      updates: () => vorgaengeTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => vorgaengeTargetId
        ? { key: 'target:vorgaenge', label: entityLabel('vorgaenge'), value: picks.vorgaenge.labelOf(vorgaengeTargetId) ?? vorgaengeTargetId, step: steps.vorgaenge }
        : undefined,
      values: (): FormValues => ({
        prozessschritt: policyFixedValue('vorgaenge', 'prozessschritt') ?? "informationen_pruefen",
      }),

      // the review shows what this step sets itself — changeable on „Deine Anwendung“, not here
      settings: () => [setting('vorgaenge', 'prozessschritt', policyFixedValue('vorgaenge', 'prozessschritt') ?? "informationen_pruefen")],
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'anforderungen-pruefen' });

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    anforderungen_und_angaben: {
      selectedId: anforderungen_und_angabenTargetId,
      onSelect: (id: string) => {
        setAnforderungenUndAngabenTargetId(id);
        const rec = picks.anforderungen_und_angaben.recordOf(id);
        if (rec) anforderungen_und_angaben.reset({ pruefpunkt: fieldText(rec, "pruefpunkt"), angabestatus: fieldLookup(rec, "angabestatus")?.key, unsicherheit: fieldText(rec, "unsicherheit"), quellenverweis: fieldText(rec, "quellenverweis"), informationsquelle: fieldRef(rec, "informationsquelle"), luecke_widerspruch: fieldText(rec, "luecke_widerspruch"), });
      },
      get record(): JourneyRecord | undefined { return anforderungen_und_angabenTargetId ? picks.anforderungen_und_angaben.recordOf(anforderungen_und_angabenTargetId) : undefined; },
    },
    vorgaenge: {
      selectedId: vorgaengeTargetId,
      onSelect: (id: string) => {
        setVorgaengeTargetId(id);
        const rec = picks.vorgaenge.recordOf(id);
        if (rec) vorgaenge.reset({ });
      },
      get record(): JourneyRecord | undefined { return vorgaengeTargetId ? picks.vorgaenge.recordOf(vorgaengeTargetId) : undefined; },
    },
  };
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: AnforderungenPruefenFieldKey) => {
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
  const pickMany = (field: AnforderungenPruefenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setAnforderungenUndAngabenTargetId(null); setVorgaengeTargetId(null); };

  return {
    slug: 'anforderungen-pruefen' as const,
    draftKey: 'anforderungen-pruefen' as const,
    entity: 'vorgaenge' as const,
    form: vorgaenge,
    forms, formList, picks, submit, steps, targets,    reviewStep: ANFORDERUNGENPRUEFEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,
    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type AnforderungenPruefenFlow = ReturnType<typeof useAnforderungenPruefenFlow>;
