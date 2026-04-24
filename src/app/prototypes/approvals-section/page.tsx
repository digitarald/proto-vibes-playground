"use client";

import { useState, useMemo, useCallback } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

/* ------------------------------------------------------------------ */
/*  Data types                                                         */
/* ------------------------------------------------------------------ */

type ApprovalKind = "tool-pre" | "tool-post" | "server-pre" | "server-post" | "url";
type ApprovalScope = "workspace" | "user";

interface ApprovalEntry {
  id: string;
  label: string;
  description: string;
  kind: ApprovalKind;
  scope: ApprovalScope;
  icon: string;
  enabled: boolean;
}

type SidebarSection =
  | "agents"
  | "skills"
  | "instructions"
  | "prompts"
  | "hooks"
  | "mcp-servers"
  | "plugins"
  | "approvals";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_APPROVALS: ApprovalEntry[] = [
  // Workspace
  {
    id: "ws-tool-github-search",
    label: "github_text_search",
    description: "Run without asking · GitHub MCP",
    kind: "tool-pre",
    scope: "workspace",
    icon: "tools",
    enabled: true,
  },
  {
    id: "ws-tool-file-read",
    label: "read_file",
    description: "Run without asking · Built-in",
    kind: "tool-pre",
    scope: "workspace",
    icon: "tools",
    enabled: true,
  },
  {
    id: "ws-tool-terminal",
    label: "run_in_terminal",
    description: "Continue without reviewing results · Built-in",
    kind: "tool-post",
    scope: "workspace",
    icon: "terminal",
    enabled: true,
  },
  {
    id: "ws-server-perplexity",
    label: "perplexity",
    description: "Start server without asking · User MCP",
    kind: "server-pre",
    scope: "workspace",
    icon: "server",
    enabled: true,
  },
  {
    id: "ws-url-github",
    label: "github.com/*",
    description: "Fetch URL without asking",
    kind: "url",
    scope: "workspace",
    icon: "globe",
    enabled: true,
  },
  {
    id: "ws-url-npm",
    label: "registry.npmjs.org/*",
    description: "Fetch URL without asking",
    kind: "url",
    scope: "workspace",
    icon: "globe",
    enabled: true,
  },
  // User
  {
    id: "user-tool-edit-file",
    label: "replace_string_in_file",
    description: "Run without asking · Built-in",
    kind: "tool-pre",
    scope: "user",
    icon: "tools",
    enabled: true,
  },
  {
    id: "user-tool-search",
    label: "semantic_search",
    description: "Run without asking · Built-in",
    kind: "tool-pre",
    scope: "user",
    icon: "search",
    enabled: true,
  },
  {
    id: "user-server-excalidraw",
    label: "excalidraw",
    description: "Start server without asking · User MCP",
    kind: "server-pre",
    scope: "user",
    icon: "server",
    enabled: true,
  },
  {
    id: "user-tool-browser",
    label: "open_browser_page",
    description: "Continue without reviewing results · Browser Tools",
    kind: "tool-post",
    scope: "user",
    icon: "browser",
    enabled: false,
  },
  {
    id: "user-url-stackoverflow",
    label: "stackoverflow.com/*",
    description: "Fetch URL without asking",
    kind: "url",
    scope: "user",
    icon: "globe",
    enabled: true,
  },
];

const SIDEBAR_ITEMS: { id: SidebarSection; label: string; icon: string; count: number }[] = [
  { id: "agents", label: "Agents", icon: "hubot", count: 17 },
  { id: "skills", label: "Skills", icon: "lightbulb", count: 35 },
  { id: "instructions", label: "Instructions", icon: "file-text", count: 1 },
  { id: "prompts", label: "Prompts", icon: "comment-discussion", count: 26 },
  { id: "hooks", label: "Hooks", icon: "git-commit", count: 3 },
  { id: "mcp-servers", label: "MCP Servers", icon: "server-environment", count: 5 },
  { id: "plugins", label: "Plugins", icon: "extensions", count: 3 },
  { id: "approvals", label: "Approvals", icon: "shield", count: 0 },
];

const KIND_LABELS: Record<ApprovalKind, string> = {
  "tool-pre": "Tool — Pre-execution",
  "tool-post": "Tool — Post-execution",
  "server-pre": "Server — Pre-start",
  "server-post": "Server — Post-start",
  url: "URL — Auto-fetch",
};

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function ApprovalRow({
  entry,
  onToggle,
  onRemove,
}: {
  entry: ApprovalEntry;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={styles.approvalRow}>
      <button
        className={styles.checkbox}
        onClick={() => onToggle(entry.id)}
        aria-label={entry.enabled ? "Disable approval" : "Enable approval"}
      >
        {entry.enabled && <Codicon name="check" />}
      </button>
      <Codicon
        name={entry.icon}
        style={{ color: "var(--muted)", fontSize: 16, flexShrink: 0 }}
      />
      <div className={styles.approvalInfo}>
        <span className={`${styles.approvalLabel} ${!entry.enabled ? styles.approvalDisabled : ""}`}>
          {entry.label}
        </span>
        <span className={styles.approvalDesc}>{entry.description}</span>
      </div>
      <span className={styles.kindBadge}>{KIND_LABELS[entry.kind]}</span>
      <button
        className={styles.removeBtn}
        onClick={() => onRemove(entry.id)}
        aria-label="Remove approval"
      >
        <Codicon name="trash" />
      </button>
    </div>
  );
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className={styles.groupHeader}>
      <Codicon name="chevron-down" style={{ color: "var(--muted)", fontSize: 14 }} />
      <span className={styles.groupLabel}>{label}</span>
      <span className={styles.groupCount}>{count}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function ApprovalsSectionPage() {
  const [activeSection, setActiveSection] = useState<SidebarSection>("approvals");
  const [approvals, setApprovals] = useState<ApprovalEntry[]>(INITIAL_APPROVALS);
  const [searchQuery, setSearchQuery] = useState("");

  const toggle = useCallback((id: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return approvals;
    const q = searchQuery.toLowerCase();
    return approvals.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        KIND_LABELS[a.kind].toLowerCase().includes(q)
    );
  }, [approvals, searchQuery]);

  const workspaceItems = filtered.filter((a) => a.scope === "workspace");
  const userItems = filtered.filter((a) => a.scope === "user");

  // Update the sidebar count for approvals
  const sidebarItems = useMemo(
    () =>
      SIDEBAR_ITEMS.map((s) =>
        s.id === "approvals" ? { ...s, count: approvals.length } : s
      ),
    [approvals]
  );

  return (
    <div className={styles.scene}>
      {/* Title bar */}
      <div className={styles.titleBar}>
        <div className={styles.titleBarLeft}>
          <Codicon name="settings-gear" style={{ fontSize: 14 }} />
          <span>Agent Customizations</span>
        </div>
        <div className={styles.titleBarActions}>
          <button className={styles.titleBarBtn} aria-label="Open in editor">
            <Codicon name="go-to-file" />
          </button>
          <button className={styles.titleBarBtn} aria-label="Maximize">
            <Codicon name="chrome-maximize" />
          </button>
          <button className={styles.titleBarBtn} aria-label="Close">
            <Codicon name="close" />
          </button>
        </div>
      </div>

      <div className={styles.editorBody}>
        {/* Sidebar */}
        <nav className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.scopeSelector}>
              <Codicon name="home" style={{ fontSize: 14 }} />
              <span>Local</span>
              <Codicon name="chevron-down" style={{ fontSize: 12, color: "var(--muted)" }} />
            </div>
          </div>
          <div className={styles.sidebarNav}>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                className={`${styles.sidebarItem} ${activeSection === item.id ? styles.sidebarItemActive : ""}`}
                onClick={() => setActiveSection(item.id)}
              >
                <Codicon name={item.icon} style={{ fontSize: 16 }} />
                <span className={styles.sidebarLabel}>{item.label}</span>
                <span className={styles.sidebarCount}>{item.count}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className={styles.content}>
          {activeSection === "approvals" ? (
            <>
              {/* Content header with search */}
              <div className={styles.contentHeader}>
                <button className={styles.backBtn} onClick={() => setActiveSection("agents")}>
                  <Codicon name="arrow-left" />
                </button>
                <div className={styles.searchBox}>
                  <Codicon name="search" style={{ color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Type to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className={styles.clearBtn}
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    >
                      <Codicon name="close" />
                    </button>
                  )}
                </div>
              </div>

              {/* Approvals list */}
              <div className={styles.listArea}>
                {filtered.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Codicon name="shield" style={{ fontSize: 48, color: "var(--muted)" }} />
                    <span className={styles.emptyTitle}>No approvals found</span>
                    <span className={styles.emptyDesc}>
                      {searchQuery
                        ? "No approvals match your search."
                        : "Tool, server, and URL approvals will appear here once configured."}
                    </span>
                  </div>
                ) : (
                  <>
                    {workspaceItems.length > 0 && (
                      <>
                        <GroupHeader label="Workspace" count={workspaceItems.length} />
                        {workspaceItems.map((entry) => (
                          <ApprovalRow
                            key={entry.id}
                            entry={entry}
                            onToggle={toggle}
                            onRemove={remove}
                          />
                        ))}
                      </>
                    )}
                    {userItems.length > 0 && (
                      <>
                        <GroupHeader label="User" count={userItems.length} />
                        {userItems.map((entry) => (
                          <ApprovalRow
                            key={entry.id}
                            entry={entry}
                            onToggle={toggle}
                            onRemove={remove}
                          />
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className={styles.footer}>
                <span className={styles.footerText}>
                  Manage tool execution permissions — which tools and servers can run without asking.
                </span>
                <a className={styles.footerLink} href="#">
                  Learn more about approvals
                </a>
              </div>
            </>
          ) : (
            /* Placeholder for other sections */
            <div className={styles.otherSection}>
              <Codicon
                name={sidebarItems.find((s) => s.id === activeSection)?.icon || "info"}
                style={{ fontSize: 48, color: "var(--muted)" }}
              />
              <span className={styles.emptyTitle}>
                {sidebarItems.find((s) => s.id === activeSection)?.label}
              </span>
              <span className={styles.emptyDesc}>
                Select &quot;Approvals&quot; in the sidebar to see the prototype.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
