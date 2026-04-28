"use client";

import { useState, useMemo, useCallback } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

/* ------------------------------------------------------------------ */
/*  Data types — unified rule primitive (Proposal A)                   */
/* ------------------------------------------------------------------ */

type RuleAction = "allow" | "ask" | "deny";
type RuleScope = "workspace" | "user";
type PermissionDomain =
  | "terminal"
  | "edits"
  | "read"
  | "fetch"
  | "mcp"
  | "builtin";

interface PermissionRule {
  id: string;
  domain: PermissionDomain;
  /** Pattern syntax depends on domain (glob, regex, URL, server:tool, tool-id) */
  pattern: string;
  action: RuleAction;
  scope: RuleScope;
  /** For terminal/edits/read — distinguishes glob vs regex */
  matchType?: "glob" | "regex" | "exact";
}

type CustomizationSection =
  | "agents"
  | "skills"
  | "instructions"
  | "prompts"
  | "hooks"
  | "mcp-servers"
  | "plugins";

type SidebarSection = CustomizationSection | `domain-${PermissionDomain}`;

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const PERMISSION_DOMAINS: {
  id: PermissionDomain;
  label: string;
  icon: string;
  settingKey: string;
  patternHint: string;
  description: string;
}[] = [
  {
    id: "terminal",
    label: "Terminal",
    icon: "terminal",
    settingKey: "chat.tools.terminal.rules",
    patternHint: "Subcommand glob or /regex/",
    description: "Control which terminal commands run automatically.",
  },
  {
    id: "edits",
    label: "File Edits",
    icon: "edit",
    settingKey: "chat.tools.edits.rules",
    patternHint: "Glob pattern (e.g. src/**)",
    description: "Control which files the agent may edit.",
  },
  {
    id: "read",
    label: "File Reads",
    icon: "file",
    settingKey: "chat.tools.read.rules",
    patternHint: "Glob pattern (e.g. .env*)",
    description: "Control which files the agent can read.",
  },
  {
    id: "fetch",
    label: "Network",
    icon: "globe",
    settingKey: "chat.tools.fetch.rules",
    patternHint: "Domain or URL pattern",
    description: "Control which URLs and domains the agent can access.",
  },
  {
    id: "mcp",
    label: "MCP Tools",
    icon: "server",
    settingKey: "chat.tools.mcp.rules",
    patternHint: "server:tool_name or server:*",
    description: "Control which MCP server tools may run.",
  },
  {
    id: "builtin",
    label: "Built-in Tools",
    icon: "tools",
    settingKey: "chat.tools.builtin.rules",
    patternHint: "Tool ID (e.g. fetch_webpage)",
    description: "Control built-in tools like fetch, browser, and notebook.",
  },
];

const INITIAL_RULES: PermissionRule[] = [
  // Terminal
  { id: "t-npm", domain: "terminal", pattern: "npm run *", action: "allow", scope: "workspace" },
  { id: "t-git-status", domain: "terminal", pattern: "git status", action: "allow", scope: "workspace" },
  { id: "t-git-show", domain: "terminal", pattern: "git show *", action: "allow", scope: "workspace" },
  { id: "t-git-push", domain: "terminal", pattern: "git push *", action: "ask", scope: "workspace" },
  { id: "t-curl", domain: "terminal", pattern: "curl *", action: "deny", scope: "user" },
  { id: "t-rm", domain: "terminal", pattern: "rm -rf *", action: "deny", scope: "user" },
  { id: "t-sudo", domain: "terminal", pattern: "^sudo\\s+", action: "deny", scope: "user", matchType: "regex" },
  // Edits
  { id: "e-src", domain: "edits", pattern: "src/**", action: "allow", scope: "workspace" },
  { id: "e-tests", domain: "edits", pattern: "tests/**", action: "allow", scope: "workspace" },
  { id: "e-pkg", domain: "edits", pattern: "**/package.json", action: "ask", scope: "workspace" },
  { id: "e-lock", domain: "edits", pattern: "**/package-lock.json", action: "ask", scope: "workspace" },
  { id: "e-git", domain: "edits", pattern: "**/.git/**", action: "deny", scope: "user" },
  { id: "e-env", domain: "edits", pattern: "**/.env*", action: "deny", scope: "user" },
  // Read
  { id: "r-env", domain: "read", pattern: ".env*", action: "deny", scope: "user" },
  { id: "r-secrets", domain: "read", pattern: "**/secrets/**", action: "deny", scope: "user" },
  { id: "r-credentials", domain: "read", pattern: "**/credentials/**", action: "deny", scope: "user" },
  { id: "r-git", domain: "read", pattern: "**/.git/**", action: "deny", scope: "user" },
  // Fetch
  { id: "f-vscode", domain: "fetch", pattern: "code.visualstudio.com/*", action: "allow", scope: "workspace" },
  { id: "f-gh", domain: "fetch", pattern: "github.com/*", action: "allow", scope: "workspace" },
  { id: "f-npm", domain: "fetch", pattern: "*.npmjs.org", action: "allow", scope: "workspace" },
  { id: "f-internal", domain: "fetch", pattern: "*.internal.corp", action: "deny", scope: "user" },
  { id: "f-so", domain: "fetch", pattern: "stackoverflow.com/*", action: "allow", scope: "user" },
  { id: "f-mdn", domain: "fetch", pattern: "developer.mozilla.org/*", action: "allow", scope: "user" },
  // MCP
  { id: "m-gh-all", domain: "mcp", pattern: "github:*", action: "allow", scope: "workspace" },
  { id: "m-gh-merge", domain: "mcp", pattern: "github:merge_pull_request", action: "ask", scope: "workspace" },
  { id: "m-gh-delete", domain: "mcp", pattern: "github:delete_*", action: "deny", scope: "workspace" },
  { id: "m-perplexity", domain: "mcp", pattern: "perplexity:*", action: "allow", scope: "workspace" },
  { id: "m-memory", domain: "mcp", pattern: "memory:*", action: "allow", scope: "user" },
  { id: "m-excalidraw", domain: "mcp", pattern: "excalidraw:*", action: "allow", scope: "user" },
  // Built-in
  { id: "b-readfile", domain: "builtin", pattern: "read_file", action: "allow", scope: "workspace" },
  { id: "b-edit", domain: "builtin", pattern: "replace_string_in_file", action: "ask", scope: "workspace" },
  { id: "b-task", domain: "builtin", pattern: "run_task", action: "deny", scope: "workspace" },
  { id: "b-search", domain: "builtin", pattern: "semantic_search", action: "allow", scope: "user" },
  { id: "b-notebook", domain: "builtin", pattern: "run_notebook_cell", action: "ask", scope: "user" },
  { id: "b-browser", domain: "builtin", pattern: "open_browser_page", action: "allow", scope: "user" },
];

const CUSTOMIZATION_ITEMS: { id: CustomizationSection; label: string; icon: string; count: number }[] = [
  { id: "agents", label: "Agents", icon: "hubot", count: 17 },
  { id: "skills", label: "Skills", icon: "lightbulb", count: 35 },
  { id: "instructions", label: "Instructions", icon: "file-text", count: 1 },
  { id: "prompts", label: "Prompts", icon: "comment-discussion", count: 26 },
  { id: "hooks", label: "Hooks", icon: "git-commit", count: 3 },
  { id: "mcp-servers", label: "MCP Servers", icon: "server-environment", count: 5 },
  { id: "plugins", label: "Plugins", icon: "extensions", count: 3 },
];

const ACTIONS: { id: RuleAction; label: string; icon: string }[] = [
  { id: "deny", label: "Deny", icon: "circle-slash" },
  { id: "ask", label: "Ask", icon: "question" },
  { id: "allow", label: "Allow", icon: "pass-filled" },
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function ActionToggle({
  value,
  onChange,
}: {
  value: RuleAction;
  onChange: (next: RuleAction) => void;
}) {
  return (
    <div className={styles.actionToggle} role="radiogroup" aria-label="Rule action">
      {ACTIONS.map((a) => (
        <button
          key={a.id}
          className={`${styles.actionPill} ${styles[`action_${a.id}`]} ${value === a.id ? styles.actionActive : ""}`}
          onClick={() => onChange(a.id)}
          aria-pressed={value === a.id}
          title={a.label}
        >
          <Codicon name={a.icon} style={{ fontSize: 11 }} />
          <span>{a.label}</span>
        </button>
      ))}
    </div>
  );
}

function RuleRow({
  rule,
  onActionChange,
  onRemove,
}: {
  rule: PermissionRule;
  onActionChange: (action: RuleAction) => void;
  onRemove: () => void;
}) {
  const isRegex = rule.matchType === "regex";
  return (
    <div className={styles.ruleRow}>
      <div className={styles.patternCell}>
        {isRegex && <span className={styles.matchTag}>regex</span>}
        <span className={styles.patternText}>{rule.pattern}</span>
      </div>
      <ActionToggle value={rule.action} onChange={onActionChange} />
      <button className={styles.removeBtn} onClick={onRemove} aria-label="Remove rule">
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

export default function ApprovalsProposalAPage() {
  const [activeSection, setActiveSection] = useState<SidebarSection>("domain-terminal");
  const [rules, setRules] = useState<PermissionRule[]>(INITIAL_RULES);
  const [searchQuery, setSearchQuery] = useState("");

  const isPermissionSection = activeSection.startsWith("domain-");
  const activeDomain: PermissionDomain | null = isPermissionSection
    ? (activeSection.replace("domain-", "") as PermissionDomain)
    : null;

  const activeDomainMeta = PERMISSION_DOMAINS.find((d) => d.id === activeDomain);

  const changeAction = useCallback((id: string, action: RuleAction) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, action } : r)));
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  /* Filter rules to current domain + search */
  const visibleRules = useMemo(() => {
    if (!activeDomain) return [];
    let result = rules.filter((r) => r.domain === activeDomain);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.pattern.toLowerCase().includes(q));
    }
    return result;
  }, [rules, activeDomain, searchQuery]);

  const workspaceRules = visibleRules.filter((r) => r.scope === "workspace");
  const userRules = visibleRules.filter((r) => r.scope === "user");

  /* Counts per domain for the sidebar */
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of PERMISSION_DOMAINS) {
      counts[d.id] = rules.filter((r) => r.domain === d.id).length;
    }
    return counts;
  }, [rules]);

  /* Action breakdown for the active domain (for header summary) */
  const actionBreakdown = useMemo(() => {
    if (!activeDomain) return { allow: 0, ask: 0, deny: 0 };
    const domainRules = rules.filter((r) => r.domain === activeDomain);
    return {
      allow: domainRules.filter((r) => r.action === "allow").length,
      ask: domainRules.filter((r) => r.action === "ask").length,
      deny: domainRules.filter((r) => r.action === "deny").length,
    };
  }, [rules, activeDomain]);

  const renderRules = (items: PermissionRule[]) =>
    items.map((rule) => (
      <RuleRow
        key={rule.id}
        rule={rule}
        onActionChange={(action) => changeAction(rule.id, action)}
        onRemove={() => removeRule(rule.id)}
      />
    ));

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
        {/* Sidebar — split into Customizations / Permissions */}
        <nav className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.scopeSelector}>
              <Codicon name="home" style={{ fontSize: 14 }} />
              <span>Local</span>
              <Codicon name="chevron-down" style={{ fontSize: 12, color: "var(--muted)" }} />
            </div>
          </div>

          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarGroupHeader}>Customizations</div>
            <div className={styles.sidebarNav}>
              {CUSTOMIZATION_ITEMS.map((item) => (
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
          </div>

          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarGroupHeader}>Permissions</div>
            <div className={styles.sidebarNav}>
              {PERMISSION_DOMAINS.map((d) => {
                const navId: SidebarSection = `domain-${d.id}`;
                return (
                  <button
                    key={d.id}
                    className={`${styles.sidebarItem} ${activeSection === navId ? styles.sidebarItemActive : ""}`}
                    onClick={() => setActiveSection(navId)}
                  >
                    <Codicon name={d.icon} style={{ fontSize: 16 }} />
                    <span className={styles.sidebarLabel}>{d.label}</span>
                    <span className={styles.sidebarCount}>{domainCounts[d.id] ?? 0}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className={styles.content}>
          {isPermissionSection && activeDomainMeta ? (
            <>
              {/* Domain header — title, setting key, action summary */}
              <div className={styles.domainHeader}>
                <div className={styles.domainTitleRow}>
                  <Codicon
                    name={activeDomainMeta.icon}
                    style={{ fontSize: 18, color: "var(--foreground-bright)" }}
                  />
                  <h1 className={styles.domainTitle}>{activeDomainMeta.label}</h1>
                  <code className={styles.settingKey}>{activeDomainMeta.settingKey}</code>
                </div>
                <p className={styles.domainDescription}>{activeDomainMeta.description}</p>

                <div className={styles.summaryRow}>
                  <span className={`${styles.summaryChip} ${styles.summaryAllow}`}>
                    <Codicon name="pass-filled" style={{ fontSize: 11 }} />
                    {actionBreakdown.allow} allow
                  </span>
                  <span className={`${styles.summaryChip} ${styles.summaryAsk}`}>
                    <Codicon name="question" style={{ fontSize: 11 }} />
                    {actionBreakdown.ask} ask
                  </span>
                  <span className={`${styles.summaryChip} ${styles.summaryDeny}`}>
                    <Codicon name="circle-slash" style={{ fontSize: 11 }} />
                    {actionBreakdown.deny} deny
                  </span>
                </div>
              </div>

              {/* Filter + add */}
              <div className={styles.contentHeader}>
                <div className={styles.searchBox}>
                  <Codicon name="search" style={{ color: "var(--muted)", fontSize: 14 }} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={`Filter ${activeDomainMeta.label.toLowerCase()} rules...`}
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
                  <button className={styles.actionBtn} title={activeDomainMeta.patternHint}>
                    <Codicon name="add" style={{ fontSize: 14 }} />
                    <span>Add Rule</span>
                  </button>
                </div>
              </div>

              {/* Rule list */}
              <div className={styles.listArea}>
                {visibleRules.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Codicon name={activeDomainMeta.icon} style={{ fontSize: 48, color: "var(--muted)" }} />
                    <span className={styles.emptyTitle}>No {activeDomainMeta.label.toLowerCase()} rules</span>
                    <span className={styles.emptyDesc}>
                      {searchQuery
                        ? "No rules match your search."
                        : `Add a rule to control ${activeDomainMeta.label.toLowerCase()} access.`}
                    </span>
                  </div>
                ) : (
                  <>
                    {workspaceRules.length > 0 && (
                      <>
                        <ScopeGroup label="Workspace" count={workspaceRules.length} />
                        {renderRules(workspaceRules)}
                      </>
                    )}
                    {userRules.length > 0 && (
                      <>
                        <ScopeGroup label="User" count={userRules.length} />
                        {renderRules(userRules)}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className={styles.footer}>
                <span className={styles.footerText}>
                  Rules evaluate top-down. <code>deny</code> always blocks, <code>ask</code> always prompts, <code>allow</code> auto-approves.
                </span>
                <a className={styles.footerLink} href="#">
                  Learn more
                </a>
              </div>
            </>
          ) : (
            <div className={styles.otherSection}>
              <Codicon
                name={CUSTOMIZATION_ITEMS.find((s) => s.id === activeSection)?.icon || "info"}
                style={{ fontSize: 48, color: "var(--muted)" }}
              />
              <span className={styles.emptyTitle}>
                {CUSTOMIZATION_ITEMS.find((s) => s.id === activeSection)?.label}
              </span>
              <span className={styles.emptyDesc}>
                Select a Permissions section in the sidebar to see the prototype.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
