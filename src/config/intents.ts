/**
 * intents.ts — registry of intent workflow pages (Phase 2).
 *
 * The intents orchestrator REGISTERS every page it creates here; the sidebar
 * section (IntentsNav) renders automatically from this list — no Layout edit
 * needed. Keep `path` identical to the route added in App.tsx's
 * `<custom:routes>` block.
 *
 * ONLY write inside the marker blocks — everything outside is scaffold and is
 * overwritten on the next /build/update.
 *
 *   <custom:intent-imports>
 *   import { IconCalendarPlus } from '@tabler/icons-react';
 *   </custom:intent-imports>
 *   …
 *   <custom:intents>
 *   { path: '/intents/neue-buchung', label: { de: 'Neue Buchung', en: 'New booking' }, icon: IconCalendarPlus, description: { de: 'Buchung in 3 Schritten anlegen', en: 'Create a booking in 3 steps' } },
 *   </custom:intents>
 */
import type { ComponentType } from 'react';

// <custom:intent-imports>
import { IconFilePlus, IconChecklist, IconClipboardCheck, IconMessageQuestion, IconMessageCheck, IconGavel } from '@tabler/icons-react';
// </custom:intent-imports>

export interface IntentLink {
  /** Route path as wired in App.tsx (HashRouter), e.g. '/intents/neue-buchung'. */
  path: string;
  /**
   * Short sidebar label (1–3 words). Preferred: both UI languages
   * ({ de, en } — the runtime switcher picks the active one; cs stays
   * readable for legacy entries). A plain string stays valid and renders as-is.
   */
  label: string | { de?: string; en?: string; cs?: string };
  /** Tabler icon COMPONENT reference (not rendered JSX), e.g. IconCalendarPlus. */
  icon?: ComponentType<{ size?: number | string; className?: string; stroke?: number | string }>;
  /**
   * One-line purpose. Same shape as `label`: prefer both UI languages so a
   * language switch reaches it; a plain string stays valid.
   */
  description?: string | { de?: string; en?: string; cs?: string };
}

export const INTENTS: IntentLink[] = [
  // <custom:intents>
  { path: '/intents/vorgang-anlegen', label: { de: 'Vorgang anlegen', en: 'Create case' }, icon: IconFilePlus, description: 'Kundenanfrage aufnehmen und Vorgang mit ersten Anforderungen samt Quelle anlegen.' },
  { path: '/intents/anforderungen-pruefen', label: { de: 'Anforderungen prüfen', en: 'Review requirements' }, icon: IconChecklist, description: 'Angaben eines Vorgangs prüfen, Lücken und Widersprüche markieren und den Prozessschritt weiterschalten.' },
  { path: '/intents/beurteilung-vorbereiten', label: { de: 'Beurteilung vorbereiten', en: 'Prepare assessment' }, icon: IconClipboardCheck, description: 'Fachliche Beurteilung zu einer Anforderung durch den zuständigen Beurteiler anlegen; KI-Vorschläge bleiben unbestätigt.' },
  { path: '/intents/rueckfrage-stellen', label: { de: 'Rückfrage bündeln und stellen', en: 'Prepare follow-up question' }, icon: IconMessageQuestion, description: 'Rückfrage an zuständigen Beteiligten richten und mit betroffenen Anforderungen verbinden.' },
  { path: '/intents/antwort-erfassen', label: { de: 'Antwort erfassen', en: 'Record answer' }, icon: IconMessageCheck, description: 'Eingehende Antwort der Rückfrage zuordnen und bei geänderter Angabe alten und neuen Wert festhalten.' },
  { path: '/intents/entscheidung-treffen', label: { de: 'Entscheidung treffen', en: 'Make decision' }, icon: IconGavel, description: 'Entscheidung mit Grundlage, Beurteilung, Regel und geprüfter Befugnis festhalten und Freigabestatus setzen.' },
  // </custom:intents>
];

/**
 * True only in the Phase-1 deploy bundle (the service flips it): the sidebar
 * then shows ghost rows ("werden erstellt…") until Phase 2 registers the real
 * pages and sets this back to false. Lives OUTSIDE the custom markers on
 * purpose — a scaffold update resets it to false (self-healing if Phase 2
 * never ran).
 */
export const INTENTS_PENDING = false;

/**
 * When the Phase-1 bundle was deployed (ISO, set by the service together with
 * INTENTS_PENDING). The sidebar stops showing the ghost row PENDING_MAX_MINUTES
 * later on its own: a Phase 2 that ended red (or never ran) used to leave a
 * pulsing "werden erstellt …" in every deployed Phase-1 bundle forever — no
 * code path redeploys Phase 1 without the flag (live 03.09.2026).
 */
export const INTENTS_PENDING_SINCE: string | null = '2026-10-17T05:48:14+00:00';
export const PENDING_MAX_MINUTES = 30;
