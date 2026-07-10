"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type FocusId = "frontend" | "backend" | "ai" | "devops";

interface Focus {
  id: FocusId;
  label: string;
  tagline: string;
  icon: string;
  accent: string;
}

const FOCI: Focus[] = [
  {
    id: "frontend",
    label: "Frontend & Design",
    tagline: "React, design tokens, and pixel-perfect UI.",
    icon: "symbol-color",
    accent: "#A259FF",
  },
  {
    id: "backend",
    label: "Backend & APIs",
    tagline: "Services, databases, and cloud infra.",
    icon: "server-process",
    accent: "#3994BC",
  },
  {
    id: "ai",
    label: "AI & Agents",
    tagline: "Build with LLMs, MCP servers, and skills.",
    icon: "sparkle",
    accent: "#48C9C4",
  },
  {
    id: "devops",
    label: "DevOps & SRE",
    tagline: "Ship, monitor, and keep the lights on.",
    icon: "pulse",
    accent: "#e5ba7d",
  },
];

interface Plugin {
  name: string;
  displayName: string;
  domain?: string;
  publisher: string;
  verified?: boolean;
  installs: string;
  rating: number;
  description: string;
  foci: FocusId[];
  /** Recommended plugins are pre-selected for the matching focus. */
  essential?: boolean;
}

const PLUGINS: Plugin[] = [
  {
    name: "github-pull-requests",
    displayName: "GitHub Pull Requests",
    domain: "github.com",
    publisher: "GitHub",
    verified: true,
    installs: "24.1M",
    rating: 4.8,
    description: "Review, create, and merge pull requests without leaving the editor.",
    foci: ["frontend", "backend", "ai", "devops"],
    essential: true,
  },
  {
    name: "figma",
    displayName: "Figma for VS Code",
    domain: "figma.com",
    publisher: "Figma",
    verified: true,
    installs: "1.9M",
    rating: 4.6,
    description: "Pull frames and design tokens straight into code with pixel accuracy.",
    foci: ["frontend"],
    essential: true,
  },
  {
    name: "eslint",
    displayName: "ESLint",
    domain: "eslint.org",
    publisher: "Microsoft",
    verified: true,
    installs: "38.2M",
    rating: 4.5,
    description: "Find and fix problems in your JavaScript and TypeScript as you type.",
    foci: ["frontend", "backend"],
    essential: true,
  },
  {
    name: "tailwind",
    displayName: "Tailwind CSS IntelliSense",
    domain: "tailwindcss.com",
    publisher: "Tailwind Labs",
    verified: true,
    installs: "9.4M",
    rating: 4.7,
    description: "Autocomplete, linting, and hover previews for utility classes.",
    foci: ["frontend"],
  },
  {
    name: "azure",
    displayName: "Azure Tools",
    domain: "azure.microsoft.com",
    publisher: "Microsoft",
    verified: true,
    installs: "12.6M",
    rating: 4.4,
    description: "Manage resources, deploy apps, and stream logs from the cloud.",
    foci: ["backend", "devops"],
    essential: true,
  },
  {
    name: "postgres",
    displayName: "PostgreSQL",
    domain: "postgresql.org",
    publisher: "Microsoft",
    verified: true,
    installs: "6.1M",
    rating: 4.3,
    description: "Connect, query, and explore Postgres databases inline.",
    foci: ["backend"],
    essential: true,
  },
  {
    name: "docker",
    displayName: "Docker",
    domain: "docker.com",
    publisher: "Microsoft",
    verified: true,
    installs: "31.7M",
    rating: 4.5,
    description: "Build, manage, and debug containerized applications.",
    foci: ["backend", "devops"],
  },
  {
    name: "mcp-toolkit",
    displayName: "MCP Toolkit",
    domain: "modelcontextprotocol.io",
    publisher: "Anthropic",
    verified: true,
    installs: "2.3M",
    rating: 4.9,
    description: "Scaffold, test, and debug Model Context Protocol servers.",
    foci: ["ai"],
    essential: true,
  },
  {
    name: "jupyter",
    displayName: "Jupyter",
    domain: "jupyter.org",
    publisher: "Microsoft",
    verified: true,
    installs: "78.4M",
    rating: 4.6,
    description: "Interactive notebooks for data exploration and model prototyping.",
    foci: ["ai"],
    essential: true,
  },
  {
    name: "python",
    displayName: "Python",
    domain: "python.org",
    publisher: "Microsoft",
    verified: true,
    installs: "142M",
    rating: 4.5,
    description: "IntelliSense, debugging, and environments for Python projects.",
    foci: ["ai", "backend"],
  },
  {
    name: "datadog",
    displayName: "Datadog",
    domain: "datadoghq.com",
    publisher: "Datadog",
    verified: true,
    installs: "0.9M",
    rating: 4.2,
    description: "Jump from code to traces, logs, and dashboards in one click.",
    foci: ["devops"],
    essential: true,
  },
  {
    name: "kubernetes",
    displayName: "Kubernetes",
    domain: "kubernetes.io",
    publisher: "Microsoft",
    verified: true,
    installs: "18.9M",
    rating: 4.3,
    description: "Explore clusters, edit manifests, and tail pod logs.",
    foci: ["devops"],
    essential: true,
  },
  {
    name: "prettier",
    displayName: "Prettier",
    domain: "prettier.io",
    publisher: "Prettier",
    verified: true,
    installs: "52.3M",
    rating: 4.6,
    description: "Opinionated code formatting that keeps every file consistent.",
    foci: ["frontend", "backend", "ai", "devops"],
  },
];

/* ------------------------------------------------------------------ */
/*  Install state machine                                              */
/* ------------------------------------------------------------------ */

type InstallStatus = "idle" | "queued" | "installing" | "installed";

const STEPS = ["Focus", "Extensions", "Done"] as const;

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function PluginIcon({ plugin, size = 40 }: { plugin: Plugin; size?: number }) {
  if (!plugin.domain) {
    return (
      <span className={styles.iconTile} style={{ width: size, height: size }}>
        {plugin.displayName.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <span className={styles.iconTile} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={faviconUrl(plugin.domain)}
        alt=""
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        loading="lazy"
      />
    </span>
  );
}

export default function WelcomePluginOnboardingPage() {
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState<FocusId | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<Record<string, InstallStatus>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const timers = useRef<number[]>([]);

  const activeFocus = useMemo(
    () => FOCI.find((f) => f.id === focus) ?? null,
    [focus]
  );

  const recommended = useMemo(() => {
    if (!focus) return [];
    return PLUGINS.filter((p) => p.foci.includes(focus)).sort((a, b) => {
      const ae = a.essential ? 0 : 1;
      const be = b.essential ? 0 : 1;
      return ae - be;
    });
  }, [focus]);

  // Choosing a focus pre-selects the essential extensions for it.
  const chooseFocus = useCallback((id: FocusId) => {
    setFocus(id);
    const preset = new Set(
      PLUGINS.filter((p) => p.foci.includes(id) && p.essential).map((p) => p.name)
    );
    setSelected(preset);
  }, []);

  const toggle = useCallback(
    (name: string) => {
      // Don't allow toggling something that's mid-install or installed.
      const s = status[name];
      if (s === "installing" || s === "queued") return;
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      });
    },
    [status]
  );

  // Simulated install: queued → installing (progress bar) → installed.
  const runInstall = useCallback((name: string, startDelay: number) => {
    setStatus((s) => ({ ...s, [name]: "queued" }));
    const startT = window.setTimeout(() => {
      setStatus((s) => ({ ...s, [name]: "installing" }));
      setProgress((p) => ({ ...p, [name]: 0 }));
      const stepT = window.setInterval(() => {
        setProgress((p) => {
          const cur = p[name] ?? 0;
          const next = Math.min(100, cur + Math.random() * 22 + 8);
          if (next >= 100) {
            window.clearInterval(stepT);
            window.setTimeout(() => {
              setStatus((s) => ({ ...s, [name]: "installed" }));
            }, 180);
          }
          return { ...p, [name]: next };
        });
      }, 220);
      timers.current.push(stepT);
    }, startDelay);
    timers.current.push(startT);
  }, []);

  const installedCount = useMemo(
    () => Object.values(status).filter((s) => s === "installed").length,
    [status]
  );
  const inFlight = useMemo(
    () =>
      Object.values(status).some((s) => s === "queued" || s === "installing"),
    [status]
  );
  const allDone = useMemo(() => {
    const targets = [...selected];
    return (
      targets.length > 0 &&
      targets.every((n) => status[n] === "installed")
    );
  }, [selected, status]);

  const startInstalling = useCallback(() => {
    let delay = 0;
    [...selected].forEach((name) => {
      if (status[name] === "installed") return;
      runInstall(name, delay);
      delay += 520;
    });
  }, [selected, status, runInstall]);

  useEffect(() => {
    const t = timers.current;
    return () => {
      t.forEach((id) => {
        window.clearTimeout(id);
        window.clearInterval(id);
      });
    };
  }, []);

  const restart = useCallback(() => {
    timers.current.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    timers.current = [];
    setStep(0);
    setFocus(null);
    setSelected(new Set());
    setStatus({});
    setProgress({});
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.tabstrip}>
        <div className={styles.tab}>
          <Codicon name="sparkle" className={styles.tabIcon} />
          <span>Welcome</span>
          <Codicon name="close" className={styles.tabClose} />
        </div>
      </div>

      <div className={styles.canvas}>
        <div className={styles.shell}>
          {/* Header */}
          <header className={styles.header}>
            <div className={styles.brand}>
              <span className={styles.logoMark}>
                <Codicon name="vscode" />
              </span>
              <div>
                <h1 className={styles.title}>Let’s set up your editor</h1>
                <p className={styles.subtitle}>
                  Three quick steps and you’ll be ready to build.
                </p>
              </div>
            </div>
            <Stepper step={step} />
          </header>

          {/* Body */}
          <div className={styles.body}>
            {step === 0 && (
              <FocusStep
                focus={focus}
                onChoose={chooseFocus}
                onContinue={() => setStep(1)}
              />
            )}

            {step === 1 && activeFocus && (
              <ExtensionsStep
                focus={activeFocus}
                plugins={recommended}
                selected={selected}
                status={status}
                progress={progress}
                inFlight={inFlight}
                allDone={allDone}
                onToggle={toggle}
                onBack={restart}
                onInstall={startInstalling}
                onContinue={() => setStep(2)}
              />
            )}

            {step === 2 && activeFocus && (
              <DoneStep
                focus={activeFocus}
                installedCount={installedCount}
                onRestart={restart}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stepper                                                            */
/* ------------------------------------------------------------------ */

function Stepper({ step }: { step: number }) {
  return (
    <ol className={styles.stepper}>
      {STEPS.map((label, i) => {
        const state =
          i < step ? "done" : i === step ? "active" : "upcoming";
        return (
          <li key={label} className={styles.stepItem} data-state={state}>
            <span className={styles.stepDot}>
              {state === "done" ? <Codicon name="check" /> : i + 1}
            </span>
            <span className={styles.stepLabel}>{label}</span>
            {i < STEPS.length - 1 && <span className={styles.stepBar} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Focus                                                     */
/* ------------------------------------------------------------------ */

function FocusStep({
  focus,
  onChoose,
  onContinue,
}: {
  focus: FocusId | null;
  onChoose: (id: FocusId) => void;
  onContinue: () => void;
}) {
  return (
    <section className={styles.stepPane}>
      <div className={styles.paneHead}>
        <h2 className={styles.paneTitle}>What are you building?</h2>
        <p className={styles.paneCopy}>
          We’ll recommend a starter set of extensions. You can always change
          this later.
        </p>
      </div>

      <div className={styles.focusGrid}>
        {FOCI.map((f) => (
          <button
            key={f.id}
            type="button"
            className={styles.focusCard}
            data-selected={focus === f.id}
            style={{ ["--focus-accent" as string]: f.accent }}
            onClick={() => onChoose(f.id)}
          >
            <span className={styles.focusIcon}>
              <Codicon name={f.icon} />
            </span>
            <span className={styles.focusLabel}>{f.label}</span>
            <span className={styles.focusTagline}>{f.tagline}</span>
            <span className={styles.focusCheck}>
              <Codicon name="check" />
            </span>
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <span className={styles.footerHint}>
          {focus ? "Nice choice — let’s pick extensions." : "Pick one to continue."}
        </span>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={!focus}
          onClick={onContinue}
        >
          Continue
          <Codicon name="arrow-right" />
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Extensions                                                */
/* ------------------------------------------------------------------ */

function ExtensionsStep({
  focus,
  plugins,
  selected,
  status,
  progress,
  inFlight,
  allDone,
  onToggle,
  onBack,
  onInstall,
  onContinue,
}: {
  focus: Focus;
  plugins: Plugin[];
  selected: Set<string>;
  status: Record<string, InstallStatus>;
  progress: Record<string, number>;
  inFlight: boolean;
  allDone: boolean;
  onToggle: (name: string) => void;
  onBack: () => void;
  onInstall: () => void;
  onContinue: () => void;
}) {
  const selectedCount = selected.size;
  const hasStarted = Object.keys(status).length > 0;

  return (
    <section className={styles.stepPane}>
      <div className={styles.paneHead}>
        <h2 className={styles.paneTitle}>
          Recommended for{" "}
          <span style={{ color: focus.accent }}>{focus.label}</span>
        </h2>
        <p className={styles.paneCopy}>
          We pre-selected the essentials. Toggle anything you like, then install
          them all at once.
        </p>
      </div>

      <ul className={styles.pluginList}>
        {plugins.map((p) => {
          const s = status[p.name] ?? "idle";
          const isSelected = selected.has(p.name);
          const pct = Math.round(progress[p.name] ?? 0);
          return (
            <li
              key={p.name}
              className={styles.pluginRow}
              data-selected={isSelected}
              data-status={s}
            >
              <PluginIcon plugin={p} />

              <div className={styles.pluginMain}>
                <div className={styles.pluginTop}>
                  <span className={styles.pluginName}>{p.displayName}</span>
                  {p.essential && (
                    <span className={styles.recBadge}>Recommended</span>
                  )}
                </div>
                <p className={styles.pluginDesc}>{p.description}</p>
                <div className={styles.pluginMeta}>
                  <span className={styles.metaPublisher}>
                    {p.publisher}
                    {p.verified && (
                      <Codicon
                        name="verified-filled"
                        className={styles.verified}
                      />
                    )}
                  </span>
                  <span className={styles.metaDot}>·</span>
                  <span>
                    <Codicon name="cloud-download" /> {p.installs}
                  </span>
                  <span className={styles.metaDot}>·</span>
                  <span>
                    <Codicon name="star-full" className={styles.star} />{" "}
                    {p.rating.toFixed(1)}
                  </span>
                </div>

                {s === "installing" && (
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>

              <div className={styles.pluginAction}>
                {s === "installed" ? (
                  <span className={styles.installedPill}>
                    <Codicon name="check" /> Installed
                  </span>
                ) : s === "installing" ? (
                  <span className={styles.installingPill}>
                    <Codicon name="loading" spin /> {pct}%
                  </span>
                ) : s === "queued" ? (
                  <span className={styles.queuedPill}>
                    <Codicon name="watch" /> Queued
                  </span>
                ) : (
                  <button
                    type="button"
                    className={styles.checkbox}
                    data-checked={isSelected}
                    onClick={() => onToggle(p.name)}
                    aria-label={
                      isSelected ? "Deselect extension" : "Select extension"
                    }
                  >
                    {isSelected && <Codicon name="check" />}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.footer}>
        <button type="button" className={styles.ghostBtn} onClick={onBack}>
          <Codicon name="arrow-left" /> Start over
        </button>

        <div className={styles.footerRight}>
          <span className={styles.footerHint}>
            {allDone
              ? "All set — everything installed."
              : `${selectedCount} selected`}
          </span>
          {allDone ? (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onContinue}
            >
              Continue
              <Codicon name="arrow-right" />
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={selectedCount === 0 || inFlight}
              onClick={onInstall}
            >
              {inFlight ? (
                <>
                  <Codicon name="loading" spin /> Installing…
                </>
              ) : (
                <>
                  <Codicon name="cloud-download" />
                  {hasStarted ? "Install remaining" : `Install ${selectedCount}`}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Done                                                      */
/* ------------------------------------------------------------------ */

function DoneStep({
  focus,
  installedCount,
  onRestart,
}: {
  focus: Focus;
  installedCount: number;
  onRestart: () => void;
}) {
  const nextSteps = [
    {
      icon: "folder-opened",
      title: "Open a folder",
      copy: "Start from an existing project or clone a repository.",
    },
    {
      icon: "comment-discussion",
      title: "Ask Copilot",
      copy: "Your new extensions plug straight into the chat sidebar.",
    },
    {
      icon: "settings-gear",
      title: "Tune your setup",
      copy: "Adjust themes, keybindings, and settings anytime.",
    },
  ];

  return (
    <section className={styles.stepPane}>
      <div className={styles.doneHero}>
        <span
          className={styles.doneBadge}
          style={{ ["--focus-accent" as string]: focus.accent }}
        >
          <Codicon name="check-all" />
        </span>
        <h2 className={styles.doneTitle}>You’re ready to build</h2>
        <p className={styles.doneCopy}>
          {installedCount} extension{installedCount === 1 ? "" : "s"} installed
          for <strong>{focus.label}</strong>. Here’s where to go next.
        </p>
      </div>

      <div className={styles.nextGrid}>
        {nextSteps.map((n) => (
          <div key={n.title} className={styles.nextCard}>
            <span className={styles.nextIcon}>
              <Codicon name={n.icon} />
            </span>
            <span className={styles.nextTitle}>{n.title}</span>
            <span className={styles.nextCopy}>{n.copy}</span>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.ghostBtn} onClick={onRestart}>
          <Codicon name="debug-restart" /> Run onboarding again
        </button>
        <button type="button" className={styles.primaryBtn}>
          <Codicon name="folder-opened" /> Open a folder
        </button>
      </div>
    </section>
  );
}
