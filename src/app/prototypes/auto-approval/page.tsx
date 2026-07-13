"use client";

import { useEffect, useRef, useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type ApprovalMode = "default" | "auto" | "bypass";

const APPROVAL_MODES: {
  id: ApprovalMode;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "default",
    label: "Default Approval",
    description: "Asks when approval settings don't apply",
    icon: "shield",
  },
  {
    id: "auto",
    label: "Auto Approval",
    description: "Assesses risk when approval settings don't apply",
    icon: "sparkle",
  },
  {
    id: "bypass",
    label: "Bypass Approval",
    description: "Runs tool calls without asking",
    icon: "warning",
  },
];

export default function AutoApprovalPage() {
  const [mode, setMode] = useState<ApprovalMode>("auto");
  const [menuOpen, setMenuOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedMode =
    APPROVAL_MODES.find((approvalMode) => approvalMode.id === mode) ??
    APPROVAL_MODES[0];

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <main className={styles.workbench}>
      <div className={styles.chatPanel}>
        <div className={styles.chatCanvas}>
          <div className={styles.emptyState}>
            <Codicon name="copilot" className={styles.copilotMark} />
            <span>Ask Copilot to build, explain, or fix something</span>
          </div>
        </div>

        <section className={styles.composerArea}>
          <div className={styles.composer}>
            <div className={styles.attachments}>
              <button className={styles.attachment} type="button">
                <Codicon name="close" />
                <span className={styles.imageThumb} aria-hidden="true" />
                <span>Pasted Image</span>
              </button>
            </div>

            <textarea
              className={styles.prompt}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Chat with Copilot"
              aria-label="Chat with Copilot"
            />

            <div className={styles.composerControls}>
              <div className={styles.composerControlsLeft}>
                <button className={styles.iconButton} type="button" aria-label="Add context">
                  <Codicon name="add" />
                </button>
                <button className={styles.compactButton} type="button">
                  <Codicon name="bracket-dot" />
                  <span>Agent</span>
                </button>
                <button className={styles.compactButton} type="button">
                  <Codicon name="sparkle" />
                  <span>Claude Sonnet 5</span>
                </button>
                <button className={styles.compactButton} type="button">
                  <span>Medium 1M</span>
                </button>
              </div>

              <div className={styles.composerControlsRight}>
                <button className={styles.iconButton} type="button" aria-label="Use voice input">
                  <Codicon name="mic" />
                </button>
                <button
                  className={`${styles.iconButton} ${prompt ? styles.sendButtonActive : ""}`}
                  type="button"
                  aria-label="Send message"
                >
                  <Codicon name="arrow-left" className={styles.sendIcon} />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.statusBar}>
            <button className={styles.statusItem} type="button">
              <Codicon name="device-desktop" />
              <span>Copilot</span>
            </button>
            <button className={styles.statusItem} type="button">
              <Codicon name="comment" />
              <span>Interactive</span>
            </button>

            <div className={styles.approvalControl} ref={menuRef}>
              {menuOpen && (
                <div className={styles.menu} role="menu" aria-label="Approval mode">
                  {APPROVAL_MODES.map((approvalMode) => (
                    <button
                      key={approvalMode.id}
                      type="button"
                      role="menuitemradio"
                      aria-checked={mode === approvalMode.id}
                      className={`${styles.menuItem} ${
                        mode === approvalMode.id ? styles.menuItemSelected : ""
                      }`}
                      onClick={() => {
                        setMode(approvalMode.id);
                        setMenuOpen(false);
                      }}
                    >
                      <Codicon name={approvalMode.icon} className={styles.menuIcon} />
                      <span className={styles.menuCopy}>
                        <span className={styles.menuLabel}>{approvalMode.label}</span>
                        <span className={styles.menuDescription}>
                          {approvalMode.description}
                        </span>
                      </span>
                      {mode === approvalMode.id && (
                        <Codicon name="check" className={styles.checkIcon} />
                      )}
                    </button>
                  ))}
                  <div className={styles.menuDivider} />
                  <button className={styles.learnMore} type="button">
                    Learn more about permissions
                  </button>
                </div>
              )}

              <button
                className={`${styles.statusItem} ${styles.approvalButton} ${
                  menuOpen ? styles.approvalButtonOpen : ""
                }`}
                type="button"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <Codicon name={selectedMode.icon} />
                <span>{selectedMode.label}</span>
              </button>
            </div>

            <button className={styles.statusItem} type="button" aria-label="Connectivity">
              <Codicon name="radio-tower" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
