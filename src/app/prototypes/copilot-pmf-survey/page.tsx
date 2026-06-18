"use client";

import { useCallback, useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

/* ── Survey Data ── */

const PMF_OPTIONS = [
  { value: "1", label: "Not at all" },
  { value: "2", label: "Slightly" },
  { value: "3", label: "Somewhat" },
  { value: "4", label: "Very" },
  { value: "5", label: "Extremely" },
] as const;

const HELPED_OPTIONS = [
  { value: "code-faster", label: "Writing or completing code faster" },
  { value: "unstuck", label: "Getting unstuck on bugs, errors, or unfamiliar code" },
  { value: "multi-file", label: "Making changes across multiple files" },
  { value: "automate", label: "Automating repetitive tasks like tests, docs, refactors, or boilerplate" },
  { value: "navigate", label: "Understanding or navigating a codebase" },
  { value: "planning", label: "Planning an implementation before coding" },
  { value: "review", label: "Reviewing, explaining, or improving code" },
  { value: "no-value", label: "I haven\u2019t gotten clear value yet" },
] as const;

const BLOCKER_OPTIONS = [
  { value: "trust", label: "Output is wrong, incomplete, or hard to trust" },
  { value: "context", label: "It lacks enough project, repo, or dependency context" },
  { value: "multi-step", label: "It struggles with larger multi-step tasks" },
  { value: "overhead", label: "I spend too much time reviewing, steering, or fixing its work" },
  { value: "slow", label: "It is too slow or interrupts my flow" },
  { value: "setup", label: "Setup, configuration, or integrations are too hard" },
  { value: "security", label: "Security, privacy, permissions, or approval prompts are frustrating" },
  { value: "pricing", label: "Usage limits, pricing, or billing are hard to predict" },
  { value: "nothing", label: "Nothing major" },
] as const;

function EditorTabBar() {
  return (
    <div className={styles.tabBar}>
      <div className={styles.tabGroup}>
        {/* Inactive tab */}
        <div className={styles.tab}>
          <Codicon name="file" />
          <span className={styles.tabLabel}>index.ts</span>
          <span className={styles.tabClose}><Codicon name="close" /></span>
        </div>
        {/* Active survey tab */}
        <div className={`${styles.tab} ${styles.tabActive}`}>
          <Codicon name="sparkle" />
          <span className={styles.tabLabel}>Help Improve Copilot</span>
          <span className={styles.tabClose}><Codicon name="close" /></span>
        </div>
      </div>
      <div className={styles.tabActions}>
        <Codicon name="split-horizontal" />
        <Codicon name="ellipsis" />
      </div>
    </div>
  );
}

export default function CopilotPmfSurveyPage() {
  const [pmf, setPmf] = useState<string | null>(null);
  const [helped, setHelped] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const toggleSet = useCallback((set: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }, []);

  const canSubmit = pmf !== null && helped !== null && blockers.size > 0;

  if (submitted) {
    return (
      <div className={styles.editor}>
        <EditorTabBar />
        <div className={styles.editorContent}>
          <div className={styles.page}>
            <div className={styles.doneState}>
              <div className={styles.doneIcon}><Codicon name="check" /></div>
              <p className={styles.doneTitle}>Thanks for your feedback!</p>
              <p className={styles.doneSubtitle}>Your input helps shape GitHub Copilot.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <EditorTabBar />
      <div className={styles.editorContent}>
        <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <Codicon name="sparkle" />
          <span className={styles.headerTitle}>Help Us Improve GitHub Copilot</span>
        </div>
        <p className={styles.subtitle}>This short survey helps us understand how well Copilot fits into your workflow.</p>
      </header>

      {/* Q1: PMF — 5-point Likert */}
      <section className={styles.section}>
        <p className={styles.question}>How disappointed would you be if you could no longer use Copilot?</p>
        <div className={styles.likertRow}>
          {PMF_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.likertItem} ${pmf === opt.value ? styles.likertSelected : ""}`}
              onClick={() => setPmf(opt.value)}
            >
              <span className={styles.likertLabel}>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Q3: Helped with */}
      <section className={styles.section}>
        <p className={styles.question}>What has Copilot helped you with most recently?</p>
        <div className={styles.optionList}>
          {HELPED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.optionRow} ${helped === opt.value ? styles.optionSelected : ""}`}
              onClick={() => setHelped(opt.value)}
            >
              <span className={styles.radio}>
                {helped === opt.value && <span className={styles.radioDot} />}
              </span>
              <span className={styles.optionLabel}>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Q4: Blockers */}
      <section className={styles.section}>
        <p className={styles.question}>
          What most gets in your way when using Copilot?
          <span className={styles.hint}> · Select all that apply</span>
        </p>
        <div className={styles.optionList}>
          {BLOCKER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.optionRow} ${blockers.has(opt.value) ? styles.optionSelected : ""}`}
              onClick={() => toggleSet(blockers, setBlockers, opt.value)}
            >
              <span className={styles.checkbox}>
                {blockers.has(opt.value) && <Codicon name="check" />}
              </span>
              <span className={styles.optionLabel}>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Submit */}
      <button
        className={styles.submitBtn}
        disabled={!canSubmit}
        onClick={() => setSubmitted(true)}
      >
        Submit feedback
      </button>
    </div>
      </div>
    </div>
  );
}
