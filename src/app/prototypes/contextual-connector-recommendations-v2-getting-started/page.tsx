"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { Codicon } from "../../components/codicon";
import workiqIcon from "./workiq.png";
import notionIcon from "./notion.svg";
import styles from "./page.module.css";

type StepId = "init" | "plan" | "figma" | "workiq" | "notion" | "automation";

const INIT_COMMAND = /^\s*\/init(?:\s|$)/;

const STEPS: { id: StepId; label: string; action: string; icon: string; source?: string }[] = [
  { id: "init", label: "Document this workspace", action: "Run /init", icon: "file-code", source: "AGENTS.md" },
  { id: "plan", label: "Plan a bigger change", action: "Use Plan", icon: "checklist" },
  { id: "figma", label: "Implement this Figma frame", action: "Connectors", icon: "symbol-color" },
  { id: "workiq", label: "Triage my Outlook inbox", action: "Connectors", icon: "mail" },
  { id: "notion", label: "Turn my Notion plan into tasks", action: "Connectors", icon: "notebook" },
  { id: "automation", label: "Set up a daily check-in", action: "Automations", icon: "history" },
];

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
  const [hasPlanned, setHasPlanned] = useState(false);
  const [workspaceHasAgentsMd, setWorkspaceHasAgentsMd] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState<{ text: string; mode: "Agent" | "Plan"; isInit: boolean } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const compact = checklistStyle === "compact";
  const completedCount = Number(hasPlanned) + Number(workspaceHasAgentsMd);

  function newSession() {
    setDraft("");
    setSubmitted(null);
    setNotice("");
    setSidebarOpen(false);
    inputRef.current?.focus();
  }

  function reset() {
    newSession();
    setHasPlanned(false);
    setWorkspaceHasAgentsMd(true);
    setMode("Agent");
    setHidden(false);
    setCollapsed(false);
  }

  function startStep(id: StepId) {
    setNotice("");
    if (id === "init") {
      setDraft((current) => INIT_COMMAND.test(current) ? current : `/init${current.trim() ? `\n${current}` : ""}`);
    } else if (id === "plan") {
      setMode("Plan");
    } else {
      setNotice(`Opens ${id === "automation" ? "Automations" : "Connectors"}. Navigation only in this demo.`);
      return;
    }
    inputRef.current?.focus();
  }

  function send() {
    if (!draft.trim()) return;
    const isInit = INIT_COMMAND.test(draft);
    setSubmitted({ text: draft.trim(), mode, isInit });
    if (mode === "Plan" && !isInit) setHasPlanned(true);
    setDraft("");
    setNotice("");
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
                <p>{submitted.isInit ? "In the app, /init would create or update AGENTS.md with workspace instructions. No files were written in this demo." : submitted.mode === "Plan" ? "Plan mode is selected. In a live session, Copilot would outline the steps before editing files." : "This is a demo conversation. No changes have been made to your workspace."}</p>
                <span className={styles.demoNote}>No agent request was sent.</span>
              </div>
            ) : <h1>What are we building, DIGITAAARLD?</h1>}

            <div className={styles.composerArea}>
              <div className={styles.contextBar}>
                <span><Codicon name="folder" /> vscode</span>
                <span><Codicon name="folder" /> Branch</span>
                <span><Codicon name="git-branch" /> main</span>
                <span><Codicon name="copilot" /> Copilot</span>
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
                    <button className={styles.collapseButton} onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed} aria-controls="getting-started-steps">
                      <Codicon name={collapsed ? "chevron-right" : "chevron-down"} /><h2>Getting started</h2>
                    </button>
                    <span className={styles.count}>{completedCount} of {STEPS.length}</span>
                    <button className={styles.dismiss} aria-label="Hide getting started checklist" onClick={() => { setHidden(true); inputRef.current?.focus(); }}><Codicon name="close" /></button>
                  </div>
                  <div className={styles.progress} role="progressbar" aria-label="Getting started progress" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={completedCount}>
                    <div style={{ width: `${completedCount / STEPS.length * 100}%` }} />
                  </div>
                  {!collapsed && (
                    <ul className={styles.steps} id="getting-started-steps">
                      {STEPS.map((step) => {
                        const done = step.id === "init" ? workspaceHasAgentsMd : step.id === "plan" && hasPlanned;
                        const statusLabel = done ? step.id === "init" ? ". AGENTS.md present" : ". Tried" : "";
                        return (
                          <li key={step.id}>
                            <button
                              className={`${styles.step} ${done ? styles.stepDone : ""}`}
                              onClick={() => startStep(step.id)}
                              aria-label={`${step.label}. ${step.action}${step.id === "workiq" ? ". WorkIQ MCP" : ""}${statusLabel}`}
                              title={step.id === "init" && done ? "AGENTS.md exists. Run /init to review workspace instructions." : undefined}
                            >
                              <span className={styles.check} aria-hidden="true">{done ? <Codicon name="check" /> : null}</span>
                              <span className={styles.stepLabel}>{step.label}</span>
                              <span className={styles.stepSource}>
                                {step.source && <span>{step.source}</span>}
                                {step.id === "figma" ? <FigmaMark /> : step.id === "workiq" ? (
                                  <Image className={styles.brandIcon} src={workiqIcon} alt="" title="WorkIQ MCP" width={16} height={16} />
                                ) : step.id === "notion" ? (
                                  <Image className={styles.brandIcon} src={notionIcon} alt="" width={16} height={16} unoptimized />
                                ) : <Codicon name={step.icon} />}
                              </span>
                              {!compact && <span className={styles.stepAction}>{step.action}</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              )}

              <div className={`${styles.notice} ${compact ? styles.compactWidth : ""}`} role="status" aria-live="polite">{notice}</div>
            </div>
          </div>
        </main>

      </div>

      <div className={styles.demoToolbar} aria-label="Checklist demo controls">
        <Link href="/prototypes/contextual-connector-recommendations/" title="Original recommendation" aria-label="Open original recommendation"><Codicon name="arrow-left" /></Link>
        <span>Demo</span>
        <div className={styles.styleToggle} role="group" aria-label="Checklist style">
          <button aria-pressed={checklistStyle === "original"} onClick={() => setChecklistStyle("original")}>Original</button>
          <button aria-pressed={compact} onClick={() => setChecklistStyle("compact")}>Compact</button>
        </div>
        <button
          aria-label="Simulate AGENTS.md presence"
          aria-pressed={workspaceHasAgentsMd}
          title={workspaceHasAgentsMd ? "Demo workspace has AGENTS.md. Click to simulate it missing." : "Demo workspace has no AGENTS.md. Click to simulate it present."}
          onClick={() => {
            setWorkspaceHasAgentsMd(!workspaceHasAgentsMd);
            setNotice("");
          }}
        ><Codicon name="file-code" />AGENTS.md</button>
        {hidden && <button onClick={() => { setHidden(false); setCollapsed(false); }}>Show checklist</button>}
        <button onClick={reset} title="Reset demo"><Codicon name="debug-restart" />Reset</button>
      </div>
    </div>
  );
}
