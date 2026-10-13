"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type SetupId = "init" | "figma" | "workiq" | "notion";
type StepId = SetupId | "plan" | "browser" | "automation";

const STEPS: { id: StepId; label: string; action: string; icon: string; source?: string }[] = [
  { id: "init", label: "Teach Copilot this workspace", action: "Run /init", icon: "file-code" },
  { id: "figma", label: "Build from a Figma design", action: "Connect", icon: "symbol-color" },
  { id: "workiq", label: "Catch up on email", action: "Connect", icon: "mail", source: "WorkIQ" },
  { id: "notion", label: "Work from a Notion plan", action: "Connect", icon: "notebook" },
  { id: "plan", label: "Plan before bigger changes", action: "Try Plan", icon: "checklist" },
  { id: "browser", label: "Check your app in the browser", action: "Open", icon: "browser" },
  { id: "automation", label: "Set up a daily check-in", action: "Set up", icon: "history" },
];

const SETUP: Record<SetupId, { title: string; description: string; action: string; done: string }> = {
  init: {
    title: "Initialize this workspace",
    description: "Save this repo's build commands and conventions as workspace instructions.",
    action: "Run /init",
    done: "Workspace initialized in this demo. No files were written.",
  },
  figma: {
    title: "Connect Figma",
    description: "Share a frame link so Copilot can work from the design.",
    action: "Connect Figma",
    done: "Figma connected in this demo. Your draft is unchanged.",
  },
  workiq: {
    title: "Connect WorkIQ",
    description: "Ask Copilot to find an email or summarize a thread.",
    action: "Connect WorkIQ",
    done: "WorkIQ connected in this demo. No email was accessed.",
  },
  notion: {
    title: "Connect Notion",
    description: "Use a planning page as context for the work you want to do.",
    action: "Connect Notion",
    done: "Notion connected in this demo. No pages were accessed.",
  },
};

function FigmaMark() {
  return (
    <svg className={styles.figma} width="12" height="18" viewBox="0 0 18 27" aria-hidden="true">
      <path d="M4.5 27A4.5 4.5 0 0 0 9 22.5V18H4.5a4.5 4.5 0 0 0 0 9Z" fill="#0ACF83" />
      <path d="M0 13.5A4.5 4.5 0 0 1 4.5 9H9v9H4.5A4.5 4.5 0 0 1 0 13.5Z" fill="#A259FF" />
      <circle cx="13.5" cy="13.5" r="4.5" fill="#1ABCFE" />
      <path d="M0 4.5A4.5 4.5 0 0 1 4.5 0H9v9H4.5A4.5 4.5 0 0 1 0 4.5Z" fill="#F24E1E" />
      <path d="M9 0h4.5a4.5 4.5 0 0 1 0 9H9Z" fill="#FF7262" />
    </svg>
  );
}

export default function CopilotGettingStarted() {
  const [checklistStyle, setChecklistStyle] = useState<"original" | "compact">("compact");
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"Agent" | "Plan">("Agent");
  const [completed, setCompleted] = useState<Set<StepId>>(new Set());
  const [hidden, setHidden] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<SetupId | "automation" | null>(null);
  const [pending, setPending] = useState<SetupId | null>(null);
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState<{ text: string; mode: "Agent" | "Plan" } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserDraft, setBrowserDraft] = useState("");
  const [browserUrl, setBrowserUrl] = useState("");
  const [browserError, setBrowserError] = useState("");
  const [automationName, setAutomationName] = useState("Daily workspace check-in");
  const [automationPrompt, setAutomationPrompt] = useState("Summarize recent changes and open tasks in this workspace.");
  const [schedule, setSchedule] = useState("weekdays");
  const [time, setTime] = useState("09:00");
  const [automationError, setAutomationError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const browserInputRef = useRef<HTMLInputElement>(null);
  const stepRefs = useRef<Partial<Record<StepId, HTMLButtonElement | null>>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compact = checklistStyle === "compact";

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (expanded) detailsRef.current?.focus();
  }, [expanded, pending]);

  useEffect(() => {
    if (browserOpen) browserInputRef.current?.focus();
  }, [browserOpen]);

  function complete(id: StepId, message: string) {
    setCompleted((previous) => new Set(previous).add(id));
    setNotice(message);
  }

  function closeSetup() {
    if (timer.current) clearTimeout(timer.current);
    const id = expanded;
    setPending(null);
    setExpanded(null);
    if (id) requestAnimationFrame(() => stepRefs.current[id]?.focus());
  }

  function newSession() {
    if (timer.current) clearTimeout(timer.current);
    setPending(null);
    setExpanded(null);
    setDraft("");
    setSubmitted(null);
    setNotice("");
    setSidebarOpen(false);
    inputRef.current?.focus();
  }

  function reset() {
    newSession();
    setCompleted(new Set());
    setMode("Agent");
    setHidden(false);
    setCollapsed(false);
    setBrowserOpen(false);
    setBrowserDraft("");
    setBrowserUrl("");
    setBrowserError("");
    setAutomationName("Daily workspace check-in");
    setAutomationPrompt("Summarize recent changes and open tasks in this workspace.");
    setSchedule("weekdays");
    setTime("09:00");
    setAutomationError("");
  }

  function startStep(id: StepId) {
    setNotice("");
    if (id === "plan") {
      setMode("Plan");
      complete(id, "Plan selected. Outline the change first, then switch to Agent to build it.");
      inputRef.current?.focus();
    } else if (id === "browser") {
      setBrowserOpen(true);
      complete(id, "Browser opened. Enter your app's local URL to preview it.");
    } else {
      if (id === "automation") setAutomationError("");
      setExpanded(expanded === id ? null : id);
    }
  }

  function runSetup() {
    if (!expanded || expanded === "automation" || pending) return;
    const id = expanded;
    setPending(id);
    timer.current = setTimeout(() => {
      complete(id, SETUP[id].done);
      setPending(null);
      setExpanded(null);
      inputRef.current?.focus();
    }, 1100);
  }

  function send() {
    if (!draft.trim()) return;
    setSubmitted({ text: draft.trim(), mode });
    setDraft("");
    setNotice("");
  }

  function openUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let url: URL;
    try {
      url = new URL(browserDraft);
    } catch {
      setBrowserError("Enter a full local URL, such as http://localhost:3000.");
      return;
    }
    if (!["http:", "https:"].includes(url.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      setBrowserError("Use a localhost URL. This demo only previews local apps.");
      return;
    }
    setBrowserError("");
    setBrowserUrl(url.href);
  }

  return (
    <div className={styles.app}>
      <header className={styles.titlebar}>
        <div className={styles.windowControls} aria-hidden="true"><i /><i /><i /></div>
        <button className={styles.iconButton} aria-label="Toggle sessions sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}><Codicon name="layout-sidebar-left" /></button>
        <div className={styles.titleCenter}>
          <Codicon name="arrow-left" /><Codicon name="arrow-right" />
          <div className={styles.projectTitle}><Codicon name="folder" /> vscode</div>
          <Codicon name="vscode" />
        </div>
        <span className={styles.titleEnd} aria-hidden="true"><Codicon name="layout" /><Codicon name="account" /></span>
      </header>

      <div className={styles.workbench}>
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`} aria-label="Sessions">
          <button className={styles.newSession} onClick={newSession}><Codicon name="add" /> New Session <kbd>⌘ N</kbd></button>
          <div className={styles.navItem}><Codicon name="calendar" /> Automations</div>
          <div className={styles.navItem}><Codicon name="extensions" /> Customizations</div>
          <div className={styles.sectionHeading}>Sessions <Codicon name="filter" /><Codicon name="search" /><Codicon name="ellipsis" /></div>
          <div className={styles.group}><Codicon name="comment-discussion" /> Chats</div>
          <button className={styles.session} onClick={() => { newSession(); setDraft("Export the metrics data as CSV"); }}><span className={styles.activeDot} /> Metrics data export</button>
          <div className={styles.session}><span className={styles.dot} /> Validate Foundry agent</div>
          <div className={styles.group}><Codicon name="library" /> Research</div>
          <div className={styles.group}><Codicon name="library" /> Workstreams</div>
          {[
            ["Managed Settings Strategy", "+69287", "-4059"],
            ["Customer Updates", "+31093", "-4109"],
            ["VS Code Customization WS", "+29458", "-1032"],
            ["Sandbox Governance", "+59734", "-3683"],
          ].map(([name, added, removed]) => (
            <div className={styles.workstream} key={name}>
              <div><span className={styles.dot} />{name}</div>
              <p><Codicon name="folder" /> vscode-cdnotes · <span className={styles.added}>{added}</span> <span className={styles.removed}>{removed}</span> · 5 hrs ago</p>
            </div>
          ))}
          <div className={styles.group}><Codicon name="extensions" /> Open Plugins</div>
          <div className={styles.more}>+1 more</div>
          <div className={styles.group}><Codicon name="folder" /> mos-pilot</div>
          <div className={styles.group}><Codicon name="folder" /> vscode</div>
          <div className={styles.workstream}><div><span className={styles.dot} />Extension signature enforcement</div><p><Codicon name="folder" /> 20 mins ago</p></div>
          <div className={styles.workstream}><div><span className={styles.dot} />Check Claude feature lag</div><p><Codicon name="folder" /> Yesterday</p></div>
        </aside>

        <main className={styles.chat}>
          <span className={styles.chatIcon} aria-hidden="true"><Codicon name="copilot" /></span>
          <div className={`${styles.content} ${submitted ? styles.conversation : ""}`}>
            {submitted ? (
              <div className={styles.messages}>
                <div className={styles.messageLabel}><Codicon name="account" /> You</div>
                <p className={styles.userMessage}>{submitted.text}</p>
                <div className={styles.messageLabel}><Codicon name="copilot" /> Copilot</div>
                <p>{submitted.mode === "Plan" ? "Plan mode is selected. In a live session, Copilot would outline the steps before editing files." : "This is a demo conversation. No changes have been made to your workspace."}</p>
                <span className={styles.demoNote}>No agent request was sent.</span>
              </div>
            ) : <h1>What are we building, DIGITAAARLD?</h1>}

            <div className={styles.composerArea}>
              <div className={styles.contextBar}>
                <span><Codicon name="folder" /> vscode</span>
                <span><Codicon name="folder" /> Branch</span>
                <span><Codicon name="git-branch" /> main</span>
                <span><Codicon name="copilot" /> Copilot</span>
                {(["figma", "workiq", "notion"] as const).filter((id) => completed.has(id)).map((id) => (
                  <span className={styles.connectorContext} key={id}><Codicon name="plug" />{id === "workiq" ? "WorkIQ" : id === "figma" ? "Figma" : "Notion"}</span>
                ))}
              </div>
              <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); send(); }}>
                <textarea
                  ref={inputRef}
                  aria-label="Chat prompt"
                  value={draft}
                  placeholder="Describe what you want to build"
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      send();
                    }
                  }}
                />
                <div className={styles.composerFooter}>
                  <div className={styles.composerLeft}>
                    <Codicon name="add" />
                    <button className={styles.modeButton} type="button" aria-label={`Switch to ${mode === "Agent" ? "Plan" : "Agent"} mode`} onClick={() => { setMode(mode === "Agent" ? "Plan" : "Agent"); inputRef.current?.focus(); }}>
                      <Codicon name={mode === "Plan" ? "checklist" : "comment"} />{mode}<Codicon name="chevron-down" />
                    </button>
                    <span className={styles.separator} /><span className={styles.allow}>Allow all</span>
                  </div>
                  <span className={styles.model}><Codicon name="copilot" /> GPT-5.6 Sol <span className={styles.separator} /> Medium · 1M</span>
                  <button className={styles.send} type="submit" aria-label="Send prompt" disabled={!draft.trim()}><Codicon name="arrow-up" /></button>
                </div>
              </form>

              {!hidden && (
                <section className={`${styles.checklist} ${compact ? styles.compactWidth : ""}`} aria-label="Getting started checklist">
                  <div className={styles.checklistHeader}>
                    <button className={styles.collapseButton} onClick={() => { closeSetup(); setCollapsed(!collapsed); }} aria-expanded={!collapsed} aria-controls="getting-started-steps">
                      <Codicon name={collapsed ? "chevron-right" : "chevron-down"} /><h2>Getting started</h2>
                    </button>
                    <span className={styles.count}>{completed.size} of {STEPS.length}</span>
                    <button className={styles.dismiss} aria-label="Hide getting started checklist" onClick={() => { closeSetup(); setHidden(true); inputRef.current?.focus(); }}><Codicon name="close" /></button>
                  </div>
                  <div className={styles.progress} role="progressbar" aria-label="Getting started progress" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={completed.size}>
                    <div style={{ width: `${completed.size / STEPS.length * 100}%` }} />
                  </div>
                  {!collapsed && (
                    <ul className={styles.steps} id="getting-started-steps">
                      {STEPS.map((step) => {
                        const done = completed.has(step.id);
                        return (
                          <li key={step.id}>
                            <button
                              ref={(element) => { stepRefs.current[step.id] = element; }}
                              className={`${styles.step} ${done ? styles.stepDone : ""} ${expanded === step.id ? styles.stepExpanded : ""}`}
                              onClick={() => startStep(step.id)}
                              disabled={done || pending !== null}
                              aria-label={`${step.label}. ${done ? "Completed" : step.action}`}
                              aria-expanded={step.id === "plan" || step.id === "browser" ? undefined : expanded === step.id}
                            >
                              <span className={styles.check} aria-hidden="true">{done ? <Codicon name="check" /> : pending === step.id ? <Codicon name="loading" spin /> : null}</span>
                              <span className={styles.stepLabel}>{step.label}</span>
                              <span className={styles.stepSource}>
                                {step.source && <span>{step.source}</span>}
                                {step.id === "figma" ? <FigmaMark /> : <Codicon name={step.icon} />}
                              </span>
                              {!compact && <span className={styles.stepAction}>{done ? "Done" : pending === step.id ? "Working…" : step.action}</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              )}

              {expanded && !hidden && (
                <section className={`${styles.details} ${compact ? styles.compactWidth : ""}`} ref={detailsRef} tabIndex={-1} aria-label={expanded === "automation" ? "Set up an automation" : SETUP[expanded].title} onKeyDown={(event) => { if (event.key === "Escape") closeSetup(); }}>
                  <div className={styles.detailsHeading}>
                    <h2>{expanded === "automation" ? "Set up a daily check-in" : SETUP[expanded].title}</h2>
                    <button className={styles.iconButton} aria-label="Close setup" onClick={closeSetup}><Codicon name="close" /></button>
                  </div>
                  {expanded === "automation" ? (
                    <form onSubmit={(event) => {
                      event.preventDefault();
                      if (!automationName.trim() || !automationPrompt.trim() || !time) {
                        setAutomationError("Add a name, prompt, and time before creating the automation.");
                        return;
                      }
                      complete("automation", `${automationName.trim()} created in this demo. Nothing is scheduled to run.`);
                      setExpanded(null);
                      inputRef.current?.focus();
                    }}>
                      <label className={styles.field}>Name<input required value={automationName} maxLength={80} onChange={(event) => setAutomationName(event.target.value)} /></label>
                      <label className={styles.field}>Prompt<textarea required value={automationPrompt} onChange={(event) => setAutomationPrompt(event.target.value)} /></label>
                      <div className={styles.schedule}>
                        <label className={styles.field}>Repeat<select value={schedule} onChange={(event) => setSchedule(event.target.value)}><option value="weekdays">Every weekday</option><option value="daily">Every day</option><option value="weekly">Every Monday</option></select></label>
                        <label className={styles.field}>At<input type="time" required value={time} onChange={(event) => setTime(event.target.value)} /></label>
                      </div>
                      {automationError && <p className={styles.formError} role="alert">{automationError}</p>}
                      <div className={styles.detailsFooter}><span>Demo only. Nothing will run.</span><button className={styles.setupButton} disabled={!automationName.trim() || !automationPrompt.trim()} type="submit">Create automation</button></div>
                    </form>
                  ) : (
                    <>
                      <p>{SETUP[expanded].description}</p>
                      <div className={styles.detailsFooter}>
                        <span>Demo only. No files or accounts are accessed.</span>
                        <button className={styles.setupButton} disabled={pending !== null} onClick={runSetup}>{pending ? <><Codicon name="loading" spin />{expanded === "init" ? "Running /init…" : "Connecting…"}</> : SETUP[expanded].action}</button>
                      </div>
                    </>
                  )}
                </section>
              )}
              <div className={`${styles.notice} ${compact ? styles.compactWidth : ""}`} role="status" aria-live="polite">{notice}</div>
            </div>
          </div>
        </main>

        {browserOpen && (
          <aside className={styles.browser} aria-label="Integrated browser">
            <div className={styles.browserHeader}><Codicon name="browser" /><span>Browser</span><button className={styles.iconButton} aria-label="Close integrated browser" onClick={() => { setBrowserOpen(false); inputRef.current?.focus(); }}><Codicon name="close" /></button></div>
            <form className={styles.addressBar} onSubmit={openUrl}>
              <input ref={browserInputRef} aria-label="Local app URL" value={browserDraft} placeholder="http://localhost:3000" onChange={(event) => setBrowserDraft(event.target.value)} />
              <button className={styles.iconButton} aria-label="Load local app" type="submit"><Codicon name="arrow-right" /></button>
            </form>
            {browserError && <p className={styles.browserError} role="alert">{browserError}</p>}
            {browserUrl ? (
              <iframe className={styles.browserFrame} title="Local app preview" src={browserUrl} sandbox="allow-scripts" />
            ) : (
              <div className={styles.browserEmpty}><Codicon name="browser" /><h2>Preview your app</h2><p>Start your dev server, then enter its local URL above.</p></div>
            )}
          </aside>
        )}
      </div>

      <div className={styles.demoToolbar} aria-label="Checklist demo controls">
        <Link href="/prototypes/contextual-connector-recommendations/" title="Original recommendation" aria-label="Open original recommendation"><Codicon name="arrow-left" /></Link>
        <span>Demo</span>
        <div className={styles.styleToggle} role="group" aria-label="Checklist style">
          <button aria-pressed={checklistStyle === "original"} onClick={() => setChecklistStyle("original")}>Original</button>
          <button aria-pressed={compact} onClick={() => setChecklistStyle("compact")}>Compact</button>
        </div>
        {hidden && <button onClick={() => { setHidden(false); setCollapsed(false); }}>Show checklist</button>}
        <button onClick={reset} title="Reset demo"><Codicon name="debug-restart" />Reset</button>
      </div>
    </div>
  );
}
