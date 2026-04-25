"use client";

import { useState, useMemo, useCallback } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

/* ------------------------------------------------------------------ */
/*  Data types                                                         */
/* ------------------------------------------------------------------ */

type ApprovalScope = "workspace" | "user";
type SourceKind = "mcp" | "extension" | "builtin" | "url" | "path";

interface EntryApproval {
  id: string;
  label: string;
  allowed: boolean; // true = auto-approve, false = always deny
}

interface SourceGroup {
  id: string;
  label: string;
  kind: SourceKind;
  icon: string;
  scope: ApprovalScope;
  totalTools?: number;
  approvals: EntryApproval[];
  allowAll: boolean; // source-level bulk allow
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

const INITIAL_SOURCES: SourceGroup[] = [
  // ── Workspace ──
  {
    id: "ws-github-mcp",
    label: "GitHub MCP Server",
    kind: "mcp",
    icon: "server",
    scope: "workspace",
    totalTools: 42,
    allowAll: false,
    approvals: [
      { id: "ws-gh-search", label: "github_text_search", allowed: true },
      { id: "ws-gh-issues", label: "list_issues", allowed: true },
      { id: "ws-gh-create-pr", label: "create_pull_request", allowed: true },
      { id: "ws-gh-merge", label: "merge_pull_request", allowed: false },
    ],
  },
  {
    id: "ws-perplexity",
    label: "Perplexity AI",
    kind: "mcp",
    icon: "server",
    scope: "workspace",
    totalTools: 4,
    allowAll: true,
    approvals: [],
  },
  {
    id: "ws-workiq",
    label: "WorkIQ",
    kind: "mcp",
    icon: "server",
    scope: "workspace",
    totalTools: 2,
    allowAll: false,
    approvals: [
      { id: "ws-wiq-eula", label: "accept_eula", allowed: true },
    ],
  },
  {
    id: "ws-pylance",
    label: "Pylance Language Server",
    kind: "extension",
    icon: "extensions",
    scope: "workspace",
    totalTools: 12,
    allowAll: false,
    approvals: [
      { id: "ws-py-diag", label: "pylanceDiagnostics", allowed: true },
      { id: "ws-py-hover", label: "pylanceHover", allowed: true },
    ],
  },
  {
    id: "ws-builtin",
    label: "Built-in Tools",
    kind: "builtin",
    icon: "tools",
    scope: "workspace",
    totalTools: 18,
    allowAll: false,
    approvals: [
      { id: "ws-bi-terminal", label: "run_in_terminal", allowed: false },
      { id: "ws-bi-readfile", label: "read_file", allowed: true },
      { id: "ws-bi-edit", label: "replace_string_in_file", allowed: true },
      { id: "ws-bi-task", label: "run_task", allowed: false },
    ],
  },
  {
    id: "ws-urls",
    label: "Allowed URLs",
    kind: "url",
    icon: "globe",
    scope: "workspace",
    allowAll: false,
    approvals: [
      { id: "ws-url-vscode", label: "code.visualstudio.com/*", allowed: true },
      { id: "ws-url-gh-wiki", label: "github.com/microsoft/vscode/wiki/*", allowed: true },
      { id: "ws-url-gh", label: "github.com/*", allowed: true },
      { id: "ws-url-npm", label: "registry.npmjs.org/*", allowed: true },
      { id: "ws-url-supabase", label: "supabase.com/docs/*", allowed: false },
    ],
  },
  {
    id: "ws-paths",
    label: "Folder Access",
    kind: "path",
    icon: "folder",
    scope: "workspace",
    allowAll: false,
    approvals: [
      { id: "ws-path-src", label: "./src", allowed: true },
      { id: "ws-path-tests", label: "./tests", allowed: true },
      { id: "ws-path-node", label: "./node_modules", allowed: false },
    ],
  },
  // ── User ──
  {
    id: "user-excalidraw",
    label: "Excalidraw",
    kind: "mcp",
    icon: "server",
    scope: "user",
    totalTools: 6,
    allowAll: true,
    approvals: [],
  },
  {
    id: "user-browser",
    label: "Browser Tools",
    kind: "extension",
    icon: "browser",
    scope: "user",
    totalTools: 8,
    allowAll: false,
    approvals: [
      { id: "user-br-open", label: "open_browser_page", allowed: true },
      { id: "user-br-click", label: "click_element", allowed: true },
      { id: "user-br-nav", label: "navigate_page", allowed: true },
    ],
  },
  {
    id: "user-builtin",
    label: "Built-in Tools",
    kind: "builtin",
    icon: "tools",
    scope: "user",
    totalTools: 18,
    allowAll: false,
    approvals: [
      { id: "user-bi-edit", label: "replace_string_in_file", allowed: true },
      { id: "user-bi-search", label: "semantic_search", allowed: true },
    ],
  },
  {
    id: "user-urls",
    label: "Allowed URLs",
    kind: "url",
    icon: "globe",
    scope: "user",
    allowAll: false,
    approvals: [
      { id: "user-url-so", label: "stackoverflow.com/*", allowed: true },
      { id: "user-url-mdn", label: "developer.mozilla.org/*", allowed: true },
    ],
  },
  {
    id: "user-paths",
    label: "Folder Access",
    kind: "path",
    icon: "folder",
    scope: "user",
    allowAll: false,
    approvals: [
      { id: "user-path-home", label: "~/Documents", allowed: true },
    ],
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

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function AllowIcon({
  allowed,
  onClick,
}: {
  allowed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`${styles.allowIcon} ${allowed ? styles.allowIconOn : styles.allowIconOff}`}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={allowed ? "Allowed — click to deny" : "Denied — click to allow"}
      aria-label={allowed ? "Allowed" : "Denied"}
    >
      <Codicon
        name={allowed ? "pass-filled" : "circle-slash"}
        style={{ fontSize: 14 }}
      />
    </button>
  );
}

function SourceHeader({
  source,
  expanded,
  onToggle,
  onAllowAll,
  onAdd,
}: {
  source: SourceGroup;
  expanded: boolean;
  onToggle: () => void;
  onAllowAll: () => void;
  onAdd: () => void;
}) {
  const allowedCount = source.approvals.filter((a) => a.allowed).length;
  const totalCount = source.approvals.length;
  const hasTools = source.kind === "mcp" || source.kind === "extension" || source.kind === "builtin";

  let summary: string;
  if (source.allowAll) {
    summary = source.totalTools
      ? `All ${source.totalTools} tools`
      : "All allowed";
  } else if (totalCount > 0) {
    const denied = totalCount - allowedCount;
    const parts: string[] = [];
    if (allowedCount > 0) {
      parts.push(source.totalTools ? `${allowedCount} of ${source.totalTools} allowed` : `${allowedCount} allowed`);
    }
    if (denied > 0) parts.push(`${denied} denied`);
    if (allowedCount === 0 && source.totalTools) parts.push(`${source.totalTools} tools`);
    summary = parts.join(" · ");
  } else {
    summary = source.totalTools
      ? `${source.totalTools} tools`
      : "No rules";
  }

  return (
    <div className={styles.sourceHeader} onClick={onToggle}>
      <Codicon
        name={expanded ? "chevron-down" : "chevron-right"}
        style={{ color: "var(--muted)", fontSize: 14, flexShrink: 0 }}
      />
      <Codicon
        name={source.icon}
        style={{ color: "var(--foreground)", fontSize: 16, flexShrink: 0 }}
      />
      <span className={styles.sourceLabel}>{source.label}</span>
      {source.allowAll && (
        <span className={styles.allowAllBadge}>
          <Codicon name="pass-filled" style={{ fontSize: 12 }} />
        </span>
      )}
      <span className={styles.sourceSummary}>{summary}</span>
      <button
        className={styles.sourceAddBtn}
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        title={`Add to ${source.label}`}
        aria-label={`Add to ${source.label}`}
      >
        <Codicon name="add" style={{ fontSize: 14 }} />
      </button>
      {hasTools && (
        <button
          className={`${styles.allowAllBtn} ${source.allowAll ? styles.allowAllBtnActive : ""}`}
          onClick={(e) => { e.stopPropagation(); onAllowAll(); }}
          title={source.allowAll ? "Revoke allow-all" : "Allow all tools"}
        >
          <Codicon name={source.allowAll ? "pass-filled" : "pass"} style={{ fontSize: 12 }} />
          <span>{source.allowAll ? "All Allowed" : "Allow All"}</span>
        </button>
      )}
    </div>
  );
}

function EntryRow({
  entry,
  onToggle,
  onRemove,
}: {
  entry: EntryApproval;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <div className={styles.entryRow}>
      <AllowIcon allowed={entry.allowed} onClick={onToggle} />
      <span className={styles.entryLabel}>{entry.label}</span>
      <button className={styles.removeBtn} onClick={onRemove} aria-label="Remove">
        <Codicon name="trash" style={{ fontSize: 14 }} />
      </button>
    </div>
  );
}

function ScopeGroup({ label, count }: { label: string; count: number }) {
  return (
    <div className={styles.scopeHeader}>
      <Codicon name="chevron-down" style={{ color: "var(--muted)", fontSize: 14 }} />
      <span className={styles.scopeLabel}>{label}</span>
      <span className={styles.scopeCount}>{count}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function ApprovalsSectionPage() {
  const [activeSection, setActiveSection] = useState<SidebarSection>("approvals");
  const [sources, setSources] = useState<SourceGroup[]>(INITIAL_SOURCES);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(
    () => new Set(["ws-github-mcp", "ws-urls", "ws-builtin", "user-browser"])
  );
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpanded = useCallback((id: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAllowAll = useCallback((sourceId: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, allowAll: !s.allowAll } : s))
    );
  }, []);

  const toggleEntry = useCallback((sourceId: string, entryId: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === sourceId
          ? {
              ...s,
              approvals: s.approvals.map((a) =>
                a.id === entryId ? { ...a, allowed: !a.allowed } : a
              ),
            }
          : s
      )
    );
  }, []);

  const removeEntry = useCallback((sourceId: string, entryId: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === sourceId
          ? { ...s, approvals: s.approvals.filter((a) => a.id !== entryId) }
          : s
      )
    );
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sources;
    const q = searchQuery.toLowerCase();
    return sources
      .map((s) => ({
        ...s,
        approvals: s.approvals.filter((a) => a.label.toLowerCase().includes(q)),
      }))
      .filter((s) => s.label.toLowerCase().includes(q) || s.approvals.length > 0);
  }, [sources, searchQuery]);

  const workspaceSources = filtered.filter((s) => s.scope === "workspace");
  const userSources = filtered.filter((s) => s.scope === "user");

  const totalApprovals = sources.reduce((n, s) => n + s.approvals.length + (s.allowAll ? 1 : 0), 0);

  const sidebarItems = useMemo(
    () =>
      SIDEBAR_ITEMS.map((s) =>
        s.id === "approvals" ? { ...s, count: totalApprovals } : s
      ),
    [totalApprovals]
  );

  const renderSources = (items: SourceGroup[]) =>
    items.map((source) => {
      const isExpanded = expandedSources.has(source.id);
      return (
        <div key={source.id} className={styles.sourceGroup}>
          <SourceHeader
            source={source}
            expanded={isExpanded}
            onToggle={() => toggleExpanded(source.id)}
            onAllowAll={() => toggleAllowAll(source.id)}
            onAdd={() => {}}
          />
          {isExpanded && source.approvals.length > 0 && (
            <div className={styles.sourceEntries}>
              {source.approvals.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  onToggle={() => toggleEntry(source.id, entry.id)}
                  onRemove={() => removeEntry(source.id, entry.id)}
                />
              ))}
            </div>
          )}
          {isExpanded && source.approvals.length === 0 && (
            <div className={styles.sourceEmpty}>
              {source.allowAll
                ? "All tools run without approval"
                : "No individual rules configured"}
            </div>
          )}
        </div>
      );
    });

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
              <div className={styles.contentHeader}>
                <button className={styles.backBtn} onClick={() => setActiveSection("agents")}>
                  <Codicon name="arrow-left" />
                </button>
                <div className={styles.searchBox}>
                  <Codicon name="search" style={{ color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Filter approvals..."
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
                <div className={styles.headerActions}>
                  <button className={styles.actionBtn} title="Add approval rule">
                    <Codicon name="add" style={{ fontSize: 14 }} />
                    <span>Add Rule</span>
                  </button>
                </div>
              </div>

              <div className={styles.listArea}>
                {filtered.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Codicon name="shield" style={{ fontSize: 48, color: "var(--muted)" }} />
                    <span className={styles.emptyTitle}>No approvals found</span>
                    <span className={styles.emptyDesc}>
                      {searchQuery
                        ? "No approvals match your search."
                        : "Tool, server, URL, and path approvals will appear here once configured."}
                    </span>
                  </div>
                ) : (
                  <>
                    {workspaceSources.length > 0 && (
                      <>
                        <ScopeGroup label="Workspace" count={workspaceSources.length} />
                        {renderSources(workspaceSources)}
                      </>
                    )}
                    {userSources.length > 0 && (
                      <>
                        <ScopeGroup label="User" count={userSources.length} />
                        {renderSources(userSources)}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className={styles.footer}>
                <span className={styles.footerText}>
                  Manage which tools, servers, URLs, and paths can run without confirmation.
                </span>
                <a className={styles.footerLink} href="#">
                  Learn more
                </a>
              </div>
            </>
          ) : (
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
