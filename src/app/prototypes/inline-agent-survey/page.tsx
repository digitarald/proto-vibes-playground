"use client";

import { useState, useCallback } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

/* ────────────────────────────────────────────────────────────
   Rating-format variations (from issue #8378, section A/B)
   Each variant swaps the primary question + rating control.
   Shared: progressive reason chips + optional one-liner reveal
   on any non-positive rating. Happy path stays one tap.
   ──────────────────────────────────────────────────────────── */

type Tone = "positive" | "neutral" | "negative";

interface RatingOption {
  value: string;
  label: string;
  tone: Tone;
  icon?: string;
}

type Style = "outcome" | "sentiment" | "descriptive" | "scale";

interface Variant {
  id: Style;
  switchLabel: string;
  blurb: string;
  question: string;
  style: Style;
  options: RatingOption[];
}

const VARIANTS: Variant[] = [
  {
    id: "outcome",
    switchLabel: "3-point outcome",
    blurb: "Proposed · measures task success",
    question: "Did this do what you wanted?",
    style: "outcome",
    options: [
      { value: "yes", label: "Yes", tone: "positive" },
      { value: "partly", label: "Partly", tone: "neutral" },
      { value: "no", label: "No", tone: "negative" },
    ],
  },
  {
    id: "sentiment",
    switchLabel: "Two-tap sentiment",
    blurb: "Satisfaction-framed · closest to Claude",
    question: "How did this session go?",
    style: "sentiment",
    options: [
      { value: "good", label: "Good", tone: "positive", icon: "thumbsup" },
      { value: "fine", label: "Fine", tone: "neutral", icon: "dash" },
      { value: "bad", label: "Bad", tone: "negative", icon: "thumbsdown" },
    ],
  },
  {
    id: "descriptive",
    switchLabel: "Descriptive chips",
    blurb: "Qualitative · a low rating is already diagnostic",
    question: "How close did this land?",
    style: "descriptive",
    options: [
      { value: "nailed", label: "Nailed it", tone: "positive" },
      { value: "mostly", label: "Mostly there", tone: "neutral" },
      { value: "off", label: "Off track", tone: "negative" },
    ],
  },
  {
    id: "scale",
    switchLabel: "5-point outcome",
    blurb: "More granularity · slightly higher friction",
    question: "Did this do what you wanted?",
    style: "scale",
    options: [
      { value: "5", label: "Exactly", tone: "positive" },
      { value: "4", label: "Mostly", tone: "positive" },
      { value: "3", label: "Partly", tone: "neutral" },
      { value: "2", label: "Barely", tone: "negative" },
      { value: "1", label: "Not at all", tone: "negative" },
    ],
  },
];

/* Shared reason chips revealed on any non-positive rating */
const REASON_CHIPS = [
  "Wrong edit",
  "Too slow",
  "Misunderstood",
  "Lost context",
  "Incomplete",
];

/* ────────────────────────────────────────────────────────────
   Window / session chrome
   ──────────────────────────────────────────────────────────── */

function WindowChrome() {
  return (
    <div className={styles.titlebar}>
      <div className={styles.trafficLights}>
        <span className={`${styles.light} ${styles.lightClose}`} />
        <span className={`${styles.light} ${styles.lightMin}`} />
        <span className={`${styles.light} ${styles.lightMax}`} />
      </div>
      <div className={styles.titleCenter}>
        <button className={styles.navBtn} aria-label="Back">
          <Codicon name="arrow-left" />
        </button>
        <button className={styles.navBtn} aria-label="Forward">
          <Codicon name="arrow-right" />
        </button>
        <div className={styles.commandCenter}>
          <Codicon name="copilot" className={styles.ccIcon} />
          <span>Filing feature request for VS Code surveys</span>
        </div>
        <button className={styles.navBtn} aria-label="Run">
          <Codicon name="play" />
        </button>
      </div>
      <div className={styles.titleRight}>
        <Codicon name="terminal" />
        <Codicon name="layout-sidebar-right" />
        <Codicon name="broadcast" />
      </div>
    </div>
  );
}

function SessionHeader() {
  return (
    <div className={styles.sessionHeader}>
      <span className={styles.sessionDot} />
      <span className={styles.sessionTitle}>
        Filing feature request for VS Code surveys
      </span>
      <div className={styles.sessionActions}>
        <Codicon name="check" />
        <Codicon name="pinned" />
        <Codicon name="close" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Transcript (the agent's completed work, per the screenshot)
   ──────────────────────────────────────────────────────────── */

function Transcript() {
  return (
    <>
      <div className={styles.recap}>
        <p className={styles.recapQ}>
          Q: What kind of &ldquo;more options&rdquo; do you want me to add to the
          issue?
        </p>
        <p className={styles.recapA}>
          A: All of the above — add an options/alternatives section
        </p>
      </div>

      <p className={styles.toolLine}>
        <span className={styles.toolVerb}>Fetched</span> current content and
        updated issue with new section
      </p>

      <p className={styles.para}>
        I&rsquo;ll expand the issue with an options/alternatives section covering
        rating scales, question wordings, and additional questions. Let me fetch
        the current body and append.
      </p>

      <p className={styles.toolLine}>
        <span className={styles.toolVerb}>Fetched</span> current issue body and
        updated options section
      </p>

      <p className={styles.para}>
        Updated <span className={styles.check}>✅</span> —{" "}
        <a className={styles.issueLink}>#8378</a> now has an{" "}
        <strong>Options &amp; alternatives (for discussion)</strong> section with
        three groups:
      </p>

      <ul className={styles.bullets}>
        <li>
          <strong>A. Rating scale options</strong> — 3-point (proposed), 5-point
          outcome, descriptive chips, two-tap sentiment, 4-point + one-liner.
        </li>
        <li>
          <strong>B. Question wording options</strong> — outcome-framed
          (proposed), satisfaction, trust, and effort framings.
        </li>
        <li>
          <strong>C. Additional questions</strong> — correctness, effort-saved,
          trust, free-text — all strictly progressive so the happy path stays one
          tap.
        </li>
      </ul>

      <p className={styles.para}>
        The proposed direction is still called out, but the team now has clear
        alternatives to weigh.
      </p>

      <div className={styles.metaRow}>
        <span className={styles.copyBtn}>
          <Codicon name="copy" />
        </span>
        <span className={styles.credits}>Claude Opus 4.8 · 32.9 credits</span>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   Inline survey
   ──────────────────────────────────────────────────────────── */

function InlineSurvey({ variant }: { variant: Variant }) {
  const [rating, setRating] = useState<RatingOption | null>(null);
  const [reasons, setReasons] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Reset when the variant changes
  const [lastVariant, setLastVariant] = useState<Style>(variant.id);
  if (lastVariant !== variant.id) {
    setLastVariant(variant.id);
    setRating(null);
    setReasons(new Set());
    setNote("");
    setSubmitted(false);
    setDismissed(false);
  }

  const pickRating = useCallback((opt: RatingOption) => {
    setRating(opt);
    // Happy path: a positive rating is a one-tap submit.
    if (opt.tone === "positive") setSubmitted(true);
  }, []);

  const toggleReason = useCallback((chip: string) => {
    setReasons((prev) => {
      const next = new Set(prev);
      if (next.has(chip)) next.delete(chip);
      else next.add(chip);
      return next;
    });
  }, []);

  if (dismissed) {
    return (
      <div className={styles.surveyDismissed}>
        <Codicon name="feedback" />
        <span>Feedback skipped.</span>
        <button className={styles.undo} onClick={() => setDismissed(false)}>
          Undo
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.surveyThanks}>
        <span className={styles.thanksIcon}>
          <Codicon name="check" />
        </span>
        <div className={styles.thanksBody}>
          <p className={styles.thanksTitle}>Thanks — logged for this session.</p>
          <p className={styles.thanksSub}>
            We read every one. Fixes ship in the{" "}
            <a className={styles.issueLink}>changelog</a>.
          </p>
        </div>
      </div>
    );
  }

  const showFollowUp = rating !== null && rating.tone !== "positive";

  return (
    <div className={styles.survey}>
      <div className={styles.surveyPrimary}>
        <span className={styles.surveyQ}>{variant.question}</span>

        <div
          className={`${styles.ratingRow} ${
            variant.style === "scale" ? styles.ratingScale : ""
          }`}
        >
          {variant.options.map((opt) => {
            const active = rating?.value === opt.value;
            return (
              <button
                key={opt.value}
                className={`${styles.ratingBtn} ${
                  variant.style === "sentiment" ? styles.ratingEmoji : ""
                } ${active ? styles.ratingActive : ""}`}
                onClick={() => pickRating(opt)}
                title={opt.label}
              >
                {opt.icon && (
                  <Codicon name={opt.icon} className={styles.icon} />
                )}
                <span className={styles.ratingLabel}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <button
          className={styles.dismiss}
          onClick={() => setDismissed(true)}
          title="Not now"
        >
          <Codicon name="close" />
        </button>
      </div>

      {showFollowUp && (
        <div className={styles.followUp}>
          <p className={styles.followLabel}>What went wrong?</p>
          <div className={styles.chipRow}>
            {REASON_CHIPS.map((chip) => (
              <button
                key={chip}
                className={`${styles.chip} ${
                  reasons.has(chip) ? styles.chipActive : ""
                }`}
                onClick={() => toggleReason(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
          <div className={styles.noteRow}>
            <input
              className={styles.noteInput}
              placeholder="Anything we should know? (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              className={styles.sendBtn}
              onClick={() => setSubmitted(true)}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Composer (bottom input, matches screenshot)
   ──────────────────────────────────────────────────────────── */

function Composer() {
  return (
    <div className={styles.composerWrap}>
      <div className={styles.composer}>
        <div className={styles.composerInput}>Ask a follow-up…</div>
        <div className={styles.composerFooter}>
          <span className={styles.composerAdd}>
            <Codicon name="add" />
          </span>
          <span className={styles.composerPill}>
            <Codicon name="copilot" /> Agent
          </span>
          <span className={styles.composerMeta}>
            <Codicon name="sparkle" /> Claude Opus 4.8
          </span>
          <span className={styles.composerMeta}>Medium 200K</span>
          <span className={styles.composerEnter}>
            <Codicon name="arrow-right" />
          </span>
        </div>
      </div>
      <div className={styles.composerBar}>
        <span className={styles.barItem}>
          <Codicon name="comment" /> Interactive
        </span>
        <span className={`${styles.barItem} ${styles.barWarn}`}>
          <Codicon name="warning" /> Bypass Approvals
        </span>
        <span className={styles.barSpin}>
          <Codicon name="loading" spin />
        </span>
        <Codicon name="ellipsis" />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────── */

export default function InlineAgentSurveyPage() {
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = VARIANTS[variantIdx];

  return (
    <div className={styles.screen}>
      <div className={styles.window}>
        <WindowChrome />
        <SessionHeader />
        <div className={styles.body}>
          <div className={styles.thread}>
            <Transcript />
            <InlineSurvey variant={variant} />
          </div>
        </div>
        <Composer />
      </div>

      {/* Minimal floating switcher — iteration control, not part of the surface */}
      <div className={styles.switcher}>
        <span className={styles.switcherHint}>Rating format</span>
        <div className={styles.switcherRow}>
          {VARIANTS.map((v, i) => (
            <button
              key={v.id}
              className={`${styles.switchBtn} ${
                i === variantIdx ? styles.switchActive : ""
              }`}
              onClick={() => setVariantIdx(i)}
            >
              {v.switchLabel}
            </button>
          ))}
        </div>
        <span className={styles.switcherBlurb}>{variant.blurb}</span>
      </div>
    </div>
  );
}
