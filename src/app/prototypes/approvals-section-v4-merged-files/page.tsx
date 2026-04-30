"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

/* ------------------------------------------------------------------ */
/*  Data types                                                         */
/* ------------------------------------------------------------------ */

type RuleAction = "allow" | "ask" | "deny";
type FileAccess = "none" | "read" | "edit";
type ExternalAccess = "read" | "write";
type RuleSource = "user" | "workspace" | "managed";
type PermissionDomain =
  | "terminal"
  | "files"
  | "fetch"
  | "mcp"
  | "builtin"
  | "external";

interface PermissionRule {
  id: string;
  domain: PermissionDomain;
  source: RuleSource;
  pattern: string;
  /** allow/ask/deny for tri-state domains (terminal, fetch, mcp, builtin) */
  action?: RuleAction;
  /** none/read/edit for the merged Files domain */
  fileAccess?: FileAccess;
  /** read/write for the External Folders domain */
  externalAccess?: ExternalAccess;
  /** Network-only: post-execution response review (allow = trust response, ask = review for prompt injection) */
  postApproval?: Exclude<RuleAction, "deny">;
  matchType?: "glob" | "regex";
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
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Highest priority wins. Managed > Workspace > User. */
const SOURCE_PRIORITY: Record<RuleSource, number> = {
  managed: 3,
  workspace: 2,
  user: 1,
};

const SOURCES: { id: RuleSource; label: string; icon: string; description: string }[] = [
  { id: "managed", label: "Managed", icon: "lock", description: "Enterprise policy — cannot be overridden" },
  { id: "workspace", label: "Workspace", icon: "folder-active", description: "Project-level settings" },
  { id: "user", label: "User", icon: "person", description: "Personal defaults" },
];

const PERMISSION_DOMAINS: {
  id: PermissionDomain;
  label: string;
  icon: string;
  settingKey: string;
  description: string;
}[] = [
  {
    id: "terminal",
    label: "Terminal",
    icon: "terminal",
    settingKey: "chat.tools.terminal.rules",
    description: "Control which terminal commands run automatically.",
  },
  {
    id: "files",
    label: "Files",
    icon: "file",
    settingKey: "chat.tools.files.rules",
    description: "Per-rule access to files in the workspace. None blocks the agent, Read allows inspection, Edit allows changes.",
  },
  {
    id: "fetch",
    label: "Network",
    icon: "globe",
    settingKey: "chat.tools.fetch.rules",
    description: "Control which URLs the agent can request, plus whether responses need review for prompt injection.",
  },
  {
    id: "mcp",
    label: "MCP Tools",
    icon: "server",
    settingKey: "chat.tools.mcp.rules",
    description: "Control which MCP server tools may run.",
  },
  {
    id: "builtin",
    label: "Built-in Tools",
    icon: "tools",
    settingKey: "chat.tools.builtin.rules",
    description: "Control built-in tools with side effects — fetch, browser, notebook, tasks. File and terminal access are managed in their own sections.",
  },
  {
    id: "external",
    label: "External Folders",
    icon: "folder-opened",
    settingKey: "chat.tools.external.rules",
    description: "Extend the agent's reach to folders outside the open workspace. Grant read-only or full read+write access per path.",
  },
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_RULES: PermissionRule[] = [
  // ── Terminal ──
  // Managed enforces blanket bans
  { id: "t-rm-mgd", domain: "terminal", pattern: "rm -rf *", action: "deny", source: "managed" },
  { id: "t-sudo-mgd", domain: "terminal", pattern: "^sudo\\s+", action: "deny", source: "managed", matchType: "regex" },
  // Workspace overrides — git push gets force-denied by managed below
  { id: "t-npm", domain: "terminal", pattern: "npm run *", action: "allow", source: "workspace" },
  { id: "t-git-status", domain: "terminal", pattern: "git status", action: "allow", source: "workspace" },
  { id: "t-git-show", domain: "terminal", pattern: "git show *", action: "allow", source: "workspace" },
  { id: "t-git-push-ws", domain: "terminal", pattern: "git push *", action: "allow", source: "workspace" },
  // Managed forces git push to ask (overrides the workspace allow above)
  { id: "t-git-push-mgd", domain: "terminal", pattern: "git push *", action: "ask", source: "managed" },
  // User defaults
  { id: "t-curl", domain: "terminal", pattern: "curl *", action: "deny", source: "user" },
  { id: "t-rm-user", domain: "terminal", pattern: "rm -rf *", action: "deny", source: "user" },

  // ── Files (merged Reads + Edits, per-rule access) ──
  // Managed locks down secrets entirely
  { id: "f-env-mgd", domain: "files", pattern: "**/.env*", fileAccess: "none", source: "managed" },
  { id: "f-secrets-mgd", domain: "files", pattern: "**/secrets/**", fileAccess: "none", source: "managed" },
  // Workspace permits edits to source/tests, read-only for lockfiles
  { id: "f-src", domain: "files", pattern: "src/**", fileAccess: "edit", source: "workspace" },
  { id: "f-tests", domain: "files", pattern: "tests/**", fileAccess: "edit", source: "workspace" },
  { id: "f-pkg", domain: "files", pattern: "**/package.json", fileAccess: "read", source: "workspace" },
  { id: "f-lock", domain: "files", pattern: "**/package-lock.json", fileAccess: "read", source: "workspace" },
  // Workspace tries to allow .env reads — overridden by managed "none"
  { id: "f-env-ws", domain: "files", pattern: "**/.env*", fileAccess: "read", source: "workspace" },
  // User adds personal denies
  { id: "f-git-user", domain: "files", pattern: "**/.git/**", fileAccess: "none", source: "user" },
  { id: "f-creds", domain: "files", pattern: "**/credentials/**", fileAccess: "none", source: "user" },

  // ── Network ──
  { id: "n-internal-mgd", domain: "fetch", pattern: "*.internal.corp", action: "deny", source: "managed", postApproval: "ask" },
  { id: "n-prod-mgd", domain: "fetch", pattern: "*.prod.corp", action: "ask", source: "managed", postApproval: "ask" },
  { id: "n-vscode", domain: "fetch", pattern: "code.visualstudio.com/*", action: "allow", source: "workspace", postApproval: "allow" },
  { id: "n-gh", domain: "fetch", pattern: "github.com/*", action: "allow", source: "workspace", postApproval: "ask" },
  { id: "n-npm", domain: "fetch", pattern: "*.npmjs.org", action: "allow", source: "workspace", postApproval: "allow" },
  { id: "n-internal-ws", domain: "fetch", pattern: "*.internal.corp", action: "allow", source: "workspace", postApproval: "allow" },
  { id: "n-so", domain: "fetch", pattern: "stackoverflow.com/*", action: "allow", source: "user", postApproval: "ask" },
  { id: "n-mdn", domain: "fetch", pattern: "developer.mozilla.org/*", action: "allow", source: "user", postApproval: "ask" },

  // ── MCP ──
  { id: "m-delete-mgd", domain: "mcp", pattern: "github:delete_*", action: "deny", source: "managed" },
  { id: "m-gh-all", domain: "mcp", pattern: "github:*", action: "allow", source: "workspace" },
  { id: "m-gh-merge", domain: "mcp", pattern: "github:merge_pull_request", action: "ask", source: "workspace" },
  { id: "m-perplexity", domain: "mcp", pattern: "perplexity:*", action: "allow", source: "workspace" },
  { id: "m-memory", domain: "mcp", pattern: "memory:*", action: "allow", source: "user" },
  { id: "m-excalidraw", domain: "mcp", pattern: "excalidraw:*", action: "allow", source: "user" },

  // ── Built-in ──
  { id: "b-task", domain: "builtin", pattern: "run_task", action: "ask", source: "workspace" },
  { id: "b-fetch", domain: "builtin", pattern: "fetch_webpage", action: "allow", source: "user" },
  { id: "b-notebook", domain: "builtin", pattern: "run_notebook_cell", action: "ask", source: "user" },
  { id: "b-browser", domain: "builtin", pattern: "open_browser_page", action: "allow", source: "user" },

  // ── External Folders ──
  { id: "e-shared-mgd", domain: "external", pattern: "/etc/", externalAccess: "read", source: "managed" },
  { id: "e-docs", domain: "external", pattern: "../docs/", externalAccess: "read", source: "workspace" },
  { id: "e-shared", domain: "external", pattern: "../shared-libs/", externalAccess: "write", source: "workspace" },
  { id: "e-design", domain: "external", pattern: "~/Design/proto-vibes-playground/", externalAccess: "read", source: "workspace" },
  { id: "e-notes", domain: "external", pattern: "~/Notes/", externalAccess: "read", source: "user" },
  { id: "e-scratch", domain: "external", pattern: "~/scratch/", externalAccess: "write", source: "user" },
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

const ACTION_OPTIONS = [
  { id: "deny" as const, label: "Deny", icon: "circle-slash", variant: "deny" },
  { id: "ask" as const, label: "Ask", icon: "question", variant: "ask" },
  { id: "allow" as const, label: "Allow", icon: "pass-filled", variant: "allow" },
];

const FILE_ACCESS_OPTIONS = [
  { id: "none" as const, label: "None", icon: "circle-slash", variant: "deny" },
  { id: "read" as const, label: "Read", icon: "eye", variant: "read" },
  { id: "edit" as const, label: "Edit", icon: "edit", variant: "write" },
];

const EXTERNAL_ACCESS_OPTIONS = [
  { id: "read" as const, label: "Read", icon: "eye", variant: "read" },
  { id: "write" as const, label: "Read + Write", icon: "edit", variant: "write" },
];

/* ------------------------------------------------------------------ */
/*  Override resolution                                                */
/* ------------------------------------------------------------------ */

/** For a rule, find the highest-priority rule with the same (domain, pattern). Returns null if none beats it. */
function findOverrider(rule: PermissionRule, all: PermissionRule[]): PermissionRule | null {
  const myPriority = SOURCE_PRIORITY[rule.source];
  let winner: PermissionRule | null = null;
  for (const other of all) {
    if (other.id === rule.id) continue;
    if (other.domain !== rule.domain) continue;
    if (other.pattern !== rule.pattern) continue;
    if (SOURCE_PRIORITY[other.source] > myPriority) {
      if (!winner || SOURCE_PRIORITY[other.source] > SOURCE_PRIORITY[winner.source]) {
        winner = other;
      }
    }
  }
  return winner;
}

function summarizeRuleEffect(rule: PermissionRule): string {
  if (rule.action) return rule.action;
  if (rule.fileAccess) return rule.fileAccess;
  if (rule.externalAccess) return rule.externalAccess;
  return "—";
}

/* ------------------------------------------------------------------ */
/*  Dropdown component                                                 */
/* ------------------------------------------------------------------ */

interface DropdownOption<T extends string> {
  id: T;
  label: string;
  icon: string;
  variant: string;
}

function Dropdown<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  size = "md",
  disabled = false,
}: {
  value: T;
  onChange: (next: T) => void;
  options: DropdownOption<T>[];
  ariaLabel: string;
  size?: "md" | "sm";
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    function handleDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className={styles.dropdownWrap} ref={wrapRef}>
      <button
        type="button"
        className={`${styles.dropdownTrigger} ${styles[`trigger_${current.variant}`]} ${size === "sm" ? styles.dropdownSm : ""} ${open ? styles.dropdownTriggerOpen : ""} ${disabled ? styles.dropdownDisabled : ""}`}
        onClick={(e) => {
          if (disabled) return;
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
      >
        <Codicon
          name={current.icon}
          style={{ fontSize: 12 }}
          className={styles.dropdownTriggerIcon}
        />
        <span className={styles.dropdownTriggerLabel}>{current.label}</span>
        {!disabled && (
          <Codicon
            name="chevron-down"
            style={{ fontSize: 11, color: "var(--muted)" }}
          />
        )}
      </button>
      {open && (
        <div className={styles.dropdownMenu} role="listbox">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={o.id === value}
              className={`${styles.dropdownItem} ${o.id === value ? styles.dropdownItemActive : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onChange(o.id);
                setOpen(false);
              }}
            >
              <Codicon
                name={o.icon}
                style={{ fontSize: 13 }}
                className={styles[`itemIcon_${o.variant}`]}
              />
              <span className={styles.dropdownItemLabel}>{o.label}</span>
              {o.id === value && (
                <Codicon
                  name="check"
                  style={{ fontSize: 12, color: "var(--accent)" }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Rule row                                                           */
/* ------------------------------------------------------------------ */

function RuleRow({
  rule,
  overrider,
  onActionChange,
  onPostApprovalChange,
  onFileAccessChange,
  onExternalAccessChange,
  onRemove,
}: {
  rule: PermissionRule;
  overrider: PermissionRule | null;
  onActionChange: (action: RuleAction) => void;
  onPostApprovalChange: (action: Exclude<RuleAction, "deny">) => void;
  onFileAccessChange: (access: FileAccess) => void;
  onExternalAccessChange: (access: ExternalAccess) => void;
  onRemove: () => void;
}) {
  const isRegex = rule.matchType === "regex";
  const isManaged = rule.source === "managed";
  const isOverridden = overrider !== null;
  const isFiles = rule.domain === "files";
  const isExternal = rule.domain === "external";
  const isFetch = rule.domain === "fetch";

  return (
    <div
      className={`${styles.ruleRow} ${isOverridden ? styles.ruleRowOverridden : ""}`}
    >
      <div className={styles.patternCell}>
        {isManaged && (
          <Codicon
            name="lock"
            style={{ fontSize: 12, color: "var(--muted)", flexShrink: 0 }}
          />
        )}
        {isRegex && (
          <Codicon
            name="regex"
            style={{ fontSize: 13, color: "var(--accent)", flexShrink: 0 }}
            title="Regular expression"
          />
        )}
        {isExternal && (
          <Codicon
            name="folder"
            style={{ fontSize: 14, color: "var(--muted)", flexShrink: 0 }}
          />
        )}
        <span className={styles.patternText}>{rule.pattern}</span>
        {isOverridden && overrider && (() => {
          const overriderMeta = SOURCES.find((s) => s.id === overrider.source);
          return (
            <span
              className={styles.overrideNote}
              title={`Overridden by ${overriderMeta?.label} rule`}
            >
              <Codicon name="arrow-right" style={{ fontSize: 11 }} />
              {overriderMeta && (
                <Codicon name={overriderMeta.icon} style={{ fontSize: 11 }} />
              )}
              <span>{summarizeRuleEffect(overrider)}</span>
            </span>
          );
        })()}
      </div>

      <div className={styles.controlsCell}>
        {isFiles ? (
          <Dropdown<FileAccess>
            value={rule.fileAccess ?? "none"}
            onChange={onFileAccessChange}
            options={FILE_ACCESS_OPTIONS}
            ariaLabel="File access"
            disabled={isManaged || isOverridden}
          />
        ) : isExternal ? (
          <Dropdown<ExternalAccess>
            value={rule.externalAccess ?? "read"}
            onChange={onExternalAccessChange}
            options={EXTERNAL_ACCESS_OPTIONS}
            ariaLabel="External folder access"
            disabled={isManaged || isOverridden}
          />
        ) : (
          <Dropdown<RuleAction>
            value={rule.action ?? "ask"}
            onChange={onActionChange}
            options={ACTION_OPTIONS}
            ariaLabel="Pre-execution action"
            disabled={isManaged || isOverridden}
          />
        )}
        {isFetch && (
          <label
            className={`${styles.postCheckbox} ${(isManaged || isOverridden || rule.action === "deny") ? styles.postCheckboxDisabled : ""}`}
            title="When unchecked, the agent reviews the response for prompt injection before using it."
          >
            <input
              type="checkbox"
              checked={(rule.postApproval ?? "ask") === "allow"}
              disabled={isManaged || isOverridden || rule.action === "deny"}
              onChange={(e) => onPostApprovalChange(e.target.checked ? "allow" : "ask")}
            />
            <span>Trust response</span>
          </label>
        )}
      </div>

      {!isManaged && (
        <button className={styles.removeBtn} onClick={onRemove} aria-label="Remove rule">
          <Codicon name="trash" style={{ fontSize: 14 }} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Source group header                                                */
/* ------------------------------------------------------------------ */

function SourceGroup({ source, count }: { source: RuleSource; count: number }) {
  const meta = SOURCES.find((s) => s.id === source)!;
  return (
    <div className={`${styles.sourceHeader} ${styles[`sourceHeader_${source}`]}`}>
      <Codicon name={meta.icon} style={{ fontSize: 12 }} />
      <span className={styles.sourceLabel}>{meta.label}</span>
      <span className={styles.sourceDesc}>{meta.description}</span>
      <span className={styles.sourceCount}>{count}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function ApprovalsMergedFilesPage() {
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

  const changePostApproval = useCallback((id: string, postApproval: Exclude<RuleAction, "deny">) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, postApproval } : r)));
  }, []);

  const changeFileAccess = useCallback((id: string, fileAccess: FileAccess) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, fileAccess } : r)));
  }, []);

  const changeExternalAccess = useCallback((id: string, externalAccess: ExternalAccess) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, externalAccess } : r)));
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  /* Filter to active domain + search */
  const visibleRules = useMemo(() => {
    if (!activeDomain) return [];
    let result = rules.filter((r) => r.domain === activeDomain);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) => r.pattern.toLowerCase().includes(q));
    }
    return result;
  }, [rules, activeDomain, searchQuery]);

  /* Group by source: managed → workspace → user */
  const groupedRules = useMemo(() => {
    const order: RuleSource[] = ["managed", "workspace", "user"];
    return order.map((source) => ({
      source,
      rules: visibleRules.filter((r) => r.source === source),
    }));
  }, [visibleRules]);

  /* Sidebar counts */
  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of PERMISSION_DOMAINS) {
      counts[d.id] = rules.filter((r) => r.domain === d.id).length;
    }
    return counts;
  }, [rules]);

  const renderRules = (items: PermissionRule[]) =>
    items.map((rule) => {
      const overrider = findOverrider(rule, rules);
      return (
        <RuleRow
          key={rule.id}
          rule={rule}
          overrider={overrider}
          onActionChange={(action) => changeAction(rule.id, action)}
          onPostApprovalChange={(p) => changePostApproval(rule.id, p)}
          onFileAccessChange={(a) => changeFileAccess(rule.id, a)}
          onExternalAccessChange={(a) => changeExternalAccess(rule.id, a)}
          onRemove={() => removeRule(rule.id)}
        />
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
              <div className={styles.domainHeader}>
                <Codicon
                  name={activeDomainMeta.icon}
                  style={{ fontSize: 16, color: "var(--foreground-bright)", flexShrink: 0 }}
                />
                <h1 className={styles.domainTitle}>{activeDomainMeta.label}</h1>
              </div>

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
                  <button className={styles.actionBtn}>
                    <Codicon name="add" style={{ fontSize: 14 }} />
                    <span>Add Rule</span>
                  </button>
                </div>
              </div>

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
                  groupedRules.map(({ source, rules: items }) =>
                    items.length > 0 ? (
                      <div key={source}>
                        <SourceGroup source={source} count={items.length} />
                        {renderRules(items)}
                      </div>
                    ) : null
                  )
                )}
              </div>

              <div className={styles.footer}>
                <span className={styles.footerText}>
                  <span className={styles.footerDescription}>{activeDomainMeta.description}</span>{" "}
                  Higher-priority sources override lower:{" "}
                  <code>managed</code> beats <code>workspace</code> beats <code>user</code>.
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
