"use client";

import { useState } from "react";
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
  { value: "shipping", label: "Shipping changes faster" },
  { value: "unstuck", label: "Getting unstuck on bugs" },
  { value: "multi-file", label: "Making multi-file changes" },
  { value: "automate", label: "Automating repetitive work" },
  { value: "navigate", label: "Understanding the codebase" },
  { value: "planning", label: "Planning an approach" },
  { value: "review", label: "Improving or reviewing code" },
  { value: "no-value", label: "I haven\u2019t gotten clear value yet" },
] as const;

const BLOCKER_OPTIONS = [
  { value: "trust", label: "Output is hard to trust" },
  { value: "context", label: "Missing repo or project context" },
  { value: "multi-step", label: "Struggles with bigger tasks" },
  { value: "review-overhead", label: "Too much time reviewing" },
  { value: "steering", label: "Too much steering needed" },
  { value: "slow", label: "Too slow / breaks flow" },
  { value: "setup", label: "Setup or integrations are hard" },
  { value: "security", label: "Security or permissions friction" },
  { value: "pricing", label: "Limits, cost, or billing" },
] as const;

function EditorTabBar() {
  return (
    <div className={styles.tabBar} role="tablist" aria-label="Editor tabs">
      <div className={styles.tabGroup}>
        <div className={styles.tab} role="tab" aria-selected="false">
          <Codicon name="file" />
          <span className={styles.tabLabel}>index.ts</span>
          <span className={styles.tabClose} aria-hidden="true"><Codicon name="close" /></span>
        </div>
        <div className={`${styles.tab} ${styles.tabActive}`} role="tab" aria-selected="true">
          <Codicon name="sparkle" />
          <span className={styles.tabLabel}>Help Improve Copilot</span>
          <span className={styles.tabClose} aria-hidden="true"><Codicon name="close" /></span>
        </div>
      </div>
      <div className={styles.tabActions} aria-hidden="true">
        <Codicon name="split-horizontal" />
        <Codicon name="ellipsis" />
      </div>
    </div>
  );
}

export default function CopilotPmfSurveyCompactPage() {
  const [pmf, setPmf] = useState<string | null>(null);
  const [helped, setHelped] = useState<string | null>(null);
  const [blocker, setBlocker] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = pmf !== null && helped !== null && blocker !== null;

  if (submitted) {
    return (
      <div className={styles.editor}>
        <EditorTabBar />
        <div className={styles.editorContent}>
          <div className={styles.page}>
            <div className={styles.doneState} role="status" aria-live="polite">
              <div className={styles.doneIcon} aria-hidden="true"><Codicon name="check" /></div>
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
        <div className={styles.page} role="form" aria-label="Copilot feedback survey">
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.headerRow}>
              <Codicon name="sparkle" />
              <span className={styles.headerTitle}>Help Us Improve GitHub Copilot</span>
            </div>
            <p className={styles.subtitle}>This short survey helps us understand how well Copilot fits into your workflow.</p>
          </header>

          {/* Q1: PMF — 5-point Likert */}
          <fieldset className={styles.section}>
            <legend className={styles.question}>How disappointed would you be if you could no longer use Copilot?</legend>
            <div className={styles.likertRow} role="radiogroup" aria-label="Disappointment level">
              {PMF_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={pmf === opt.value}
                  className={`${styles.likertItem} ${pmf === opt.value ? styles.likertSelected : ""}`}
                  onClick={() => setPmf(opt.value)}
                >
                  <span className={styles.likertLabel}>{opt.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Q2: Helped with */}
          <fieldset className={styles.section}>
            <legend className={styles.question}>What has Copilot helped you with most recently?</legend>
            <div className={styles.optionList} role="radiogroup" aria-label="Main benefit">
              {HELPED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={helped === opt.value}
                  className={`${styles.optionRow} ${helped === opt.value ? styles.optionSelected : ""}`}
                  onClick={() => setHelped(opt.value)}
                >
                  <span className={styles.radio} aria-hidden="true">
                    {helped === opt.value && <span className={styles.radioDot} />}
                  </span>
                  <span className={styles.optionLabel}>{opt.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Q3: Blockers — single select */}
          <fieldset className={styles.section}>
            <legend className={styles.question}>What most gets in your way?</legend>
            <div className={styles.optionList} role="radiogroup" aria-label="Main blocker">
              {BLOCKER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={blocker === opt.value}
                  className={`${styles.optionRow} ${blocker === opt.value ? styles.optionSelected : ""}`}
                  onClick={() => setBlocker(opt.value)}
                >
                  <span className={styles.radio} aria-hidden="true">
                    {blocker === opt.value && <span className={styles.radioDot} />}
                  </span>
                  <span className={styles.optionLabel}>{opt.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!canSubmit}
            onClick={() => setSubmitted(true)}
            aria-disabled={!canSubmit}
          >
            Submit feedback
          </button>
        </div>
      </div>
    </div>
  );
}
