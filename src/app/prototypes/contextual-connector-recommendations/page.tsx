"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type Treatment = "inline" | "card";
type InstallState = "available" | "installing" | "installed";

function FigmaMark({ large = false }: { large?: boolean }) {
  return (
    <svg className={large ? styles.figmaLarge : styles.figma} width="18" height="27" viewBox="0 0 18 27" aria-hidden="true">
      <path d="M4.5 27A4.5 4.5 0 0 0 9 22.5V18H4.5a4.5 4.5 0 0 0 0 9Z" fill="#0ACF83" />
      <path d="M0 13.5A4.5 4.5 0 0 1 4.5 9H9v9H4.5A4.5 4.5 0 0 1 0 13.5Z" fill="#A259FF" />
      <circle cx="13.5" cy="13.5" r="4.5" fill="#1ABCFE" />
      <path d="M0 4.5A4.5 4.5 0 0 1 4.5 0H9v9H4.5A4.5 4.5 0 0 1 0 4.5Z" fill="#F24E1E" />
      <path d="M9 0h4.5a4.5 4.5 0 0 1 0 9H9Z" fill="#FF7262" />
    </svg>
  );
}

export default function ContextualConnectorRecommendations() {
  const [treatment, setTreatment] = useState<Treatment>("inline");
  const [draft, setDraft] = useState("Design my Figma ...");
  const [contextMatches, setContextMatches] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [details, setDetails] = useState(false);
  const [installState, setInstallState] = useState<InstallState>("available");
  const [submitted, setSubmitted] = useState<{ text: string; hasFigma: boolean } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const installTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const recommendationButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setContextMatches(/\bfigma\b|figma\.com/i.test(draft)), 450);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => () => {
    if (installTimer.current) clearTimeout(installTimer.current);
  }, []);

  useEffect(() => {
    if (details) detailsRef.current?.focus();
  }, [details]);

  const showRecommendation = contextMatches && !dismissed && installState === "available";

  function reset() {
    if (installTimer.current) clearTimeout(installTimer.current);
    setDraft("Design my Figma ...");
    setContextMatches(true);
    setDismissed(false);
    setDetails(false);
    setInstallState("available");
    setSubmitted(null);
    setSidebarOpen(false);
    inputRef.current?.focus();
  }

  function closeDetails() {
    setDetails(false);
    recommendationButton.current?.focus();
  }

  function install() {
    setInstallState("installing");
    installTimer.current = setTimeout(() => {
      setInstallState("installed");
      setDetails(false);
      inputRef.current?.focus();
    }, 1400);
  }

  function send() {
    if (!draft.trim() || installState === "installing") return;
    setSubmitted({ text: draft.trim(), hasFigma: installState === "installed" });
    setDraft("");
    setContextMatches(false);
    setDetails(false);
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
          <button className={styles.newSession} onClick={reset}><Codicon name="add" /> New Session <kbd>⌘ N</kbd></button>
          <div className={styles.navItem}><Codicon name="calendar" /> Automations</div>
          <div className={styles.navItem}><Codicon name="extensions" /> Customizations</div>
          <div className={styles.sectionHeading}>Sessions <Codicon name="filter" /><Codicon name="search" /><Codicon name="ellipsis" /></div>
          <div className={styles.group}><Codicon name="comment-discussion" /> Chats</div>
          <button className={styles.session} onClick={() => { setDraft("Export the metrics data as CSV"); setContextMatches(false); setDetails(false); setSubmitted(null); setSidebarOpen(false); }}><span className={styles.activeDot} /> Metrics data export</button>
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
                <p>{submitted.hasFigma ? "The Figma connector is available for this chat. Share a link to the frame you want to build." : "Share a design link or describe the screen you want to build."}</p>
                <span className={styles.demoNote}>Demo response. No request was sent.</span>
              </div>
            ) : <h1>What are we building, DIGITAAARLD?</h1>}

            <div className={styles.composerArea}>
              <div className={styles.contextBar}>
                <span><Codicon name="folder" /> vscode</span>
                <span><Codicon name="folder" /> Branch</span>
                <span><Codicon name="git-branch" /> main</span>
                <span><Codicon name="sync" /> 17↓</span>
                <span><Codicon name="copilot" /> Copilot</span>
                {installState === "installed" && <span className={styles.contextFigma}><Codicon name="plug" /> Figma</span>}
              </div>
              <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); send(); }}>
                <textarea
                  ref={inputRef}
                  aria-label="Chat prompt"
                  value={draft}
                  placeholder="Describe what you want to build"
                  onChange={(event) => { setDraft(event.target.value); setDetails(false); }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      send();
                    }
                  }}
                />
                <div className={styles.composerFooter}>
                  <span className={styles.composerLeft}><Codicon name="add" /><Codicon name="comment" /> Interactive <span className={styles.separator} /> <span className={styles.allow}>Allow all</span></span>
                  <span className={styles.model}><Codicon name="copilot" /> GPT-5.6 Sol <span className={styles.separator} /> Medium · 1M</span>
                  <button className={styles.send} type="submit" aria-label="Send prompt" disabled={!draft.trim() || installState === "installing"}><Codicon name="arrow-up" /></button>
                </div>
              </form>

              <div className={styles.recommendationSlot}>
                {showRecommendation && (
                  <section className={treatment === "inline" ? styles.inlineRecommendation : styles.cardRecommendation} aria-label="Figma connector recommendation">
                    <FigmaMark />
                    <div className={styles.recommendationCopy}>
                      {treatment === "inline" ? (
                        <p>Working from Figma? <span>Add design context to your chat.</span></p>
                      ) : (
                        <><h2>Build with your Figma designs</h2><p>Add the Figma connector so Copilot can work from your frames and design details.</p></>
                      )}
                    </div>
                    <button ref={recommendationButton} className={styles.installLink} onClick={() => setDetails(!details)} aria-expanded={details} aria-controls="figma-details">
                      {treatment === "inline" ? "Install connector" : "Review & install"}<Codicon name="chevron-right" />
                    </button>
                    <button className={styles.dismiss} aria-label="Dismiss Figma recommendation for this session" onClick={() => { setDismissed(true); setDetails(false); inputRef.current?.focus(); }}><Codicon name="close" /></button>
                  </section>
                )}

                {details && showRecommendation && (
                  <section
                    id="figma-details"
                    className={styles.details}
                    ref={detailsRef}
                    tabIndex={-1}
                    aria-label="Figma connector details"
                    onKeyDown={(event) => { if (event.key === "Escape") closeDetails(); }}
                  >
                    <div className={styles.detailsHeading}>
                      <FigmaMark large />
                      <div><h2>Figma connector</h2><p>Design context for Copilot</p></div>
                      <button className={styles.iconButton} aria-label="Close connector details" onClick={closeDetails}><Codicon name="close" /></button>
                    </div>
                    <p>Use a Figma link to bring frames, components, and design details into your conversation.</p>
                    <div className={styles.capability}><Codicon name="link" /><span>Share a link to a specific frame</span></div>
                    <div className={styles.capability}><Codicon name="symbol-color" /><span>Build with layout and styling context</span></div>
                    <div className={styles.detailsFooter}>
                      <span>Demo only · no account or data access</span>
                      <button className={styles.installButton} onClick={install}>Install connector</button>
                    </div>
                  </section>
                )}
                <div className={styles.installStatus} role="status" aria-live="polite">
                  {installState === "installing" && <><Codicon name="loading" spin /> Installing Figma connector… <span>Your draft stays right here.</span></>}
                  {installState === "installed" && <><Codicon name="check" className={styles.success} /> Figma connector installed <span>Ready for this chat · simulated</span></>}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <div className={styles.variantToolbar} aria-label="Recommendation comparison">
        <Link href="/" title="All prototypes" aria-label="Back to all prototypes"><Codicon name="arrow-left" /></Link>
        <span className={styles.toolbarLabel}>Recommendation</span>
        <button aria-pressed={treatment === "inline"} onClick={() => setTreatment("inline")}>Inline</button>
        <button aria-pressed={treatment === "card"} onClick={() => setTreatment("card")}>Card</button>
        <span className={styles.separator} />
        <button className={styles.resetButton} onClick={reset} title="Reset demo"><Codicon name="debug-restart" /><span>Reset</span></button>
      </div>
    </div>
  );
}
