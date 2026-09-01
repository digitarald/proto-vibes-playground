"use client";

import { useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type PolicyGroup = {
  id: string;
  label: string;
  icon: string;
  summary: string;
  rows: { access: "read" | "write" | "allow"; value: string }[];
};

const navItems = [
  ["home", "Overview", ""],
  ["extensions", "Plugins", "5"],
  ["server", "MCP Servers", "3"],
  ["lightbulb", "Skills", "58"],
  ["file-text", "Instructions", "4"],
  ["hubot", "Agents", "1"],
  ["git-commit", "Hooks", ""],
  ["tools", "Tools", "27"],
  ["shield", "Sandbox", ""],
  ["arrow-swap", "Migrate Prompts", "23"],
];

const policyGroups: PolicyGroup[] = [
  {
    id: "system",
    label: "System",
    icon: "device-desktop",
    summary: "7 read-only paths, 1 read-write path",
    rows: [
      { access: "read", value: "/Applications/Xcode.app/Contents/Developer" },
      { access: "read", value: "/bin" },
      { access: "read", value: "/opt/homebrew" },
      { access: "read", value: "/System" },
      { access: "read", value: "/usr/bin" },
      { access: "read", value: "/usr/lib" },
      { access: "read", value: "/usr/local" },
      { access: "write", value: "/private/var/folders/9p/.../T" },
    ],
  },
  {
    id: "workspace",
    label: "Working directory",
    icon: "folder-opened",
    summary: "1 read-write path",
    rows: [{ access: "write", value: "/Users/digitarald/Developer/vscode" }],
  },
  {
    id: "session",
    label: "Current session",
    icon: "history",
    summary: "1 read-only path, 1 read-write path",
    rows: [
      { access: "read", value: "~/.copilot/session-state/b281de30.../events.jsonl" },
      { access: "write", value: "~/.copilot/session-state/b281de30.../files" },
    ],
  },
  {
    id: "copilot",
    label: "Copilot home",
    icon: "copilot",
    summary: "2 read-only paths",
    rows: [
      { access: "read", value: "~/.copilot/logs" },
      { access: "read", value: "~/.copilot/skills" },
    ],
  },
  {
    id: "skills",
    label: "Personal skill roots",
    icon: "lightbulb",
    summary: "1 read-only path",
    rows: [{ access: "read", value: "~/.agents/skills" }],
  },
  {
    id: "network",
    label: "Network",
    icon: "globe",
    summary: "Outbound and local network allowed",
    rows: [
      { access: "allow", value: "Outbound connections" },
      { access: "allow", value: "Local network" },
    ],
  },
  {
    id: "tools",
    label: "Dev-tool access",
    icon: "tools",
    summary: "npm detected",
    rows: [{ access: "allow", value: "npm and related tool paths" }],
  },
];

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
      onClick={onChange}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span />
    </button>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  managed,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  managed?: boolean;
}) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingCopy}>
        <div className={styles.settingTitle}>
          {title}
          {managed && (
            <span className={styles.managed}>
              <Codicon name="lock" /> Managed
            </span>
          )}
        </div>
        <div className={styles.settingDescription}>{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={managed} label={title} />
    </div>
  );
}

export default function SandboxConfigurationFirstPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    bypass: true,
    mcp: true,
    lsp: true,
    git: true,
    gh: true,
    keychain: false,
    cwd: true,
    devTools: true,
    outbound: true,
    local: true,
  });
  const [expanded, setExpanded] = useState<string[]>(["workspace", "session"]);
  const [paths, setPaths] = useState([
    { id: 1, path: "~/Developer/shared-fixtures", access: "Read-only" },
    { id: 2, path: "~/Library/Caches/playwright", access: "Read/Write" },
    { id: 3, path: "~/.ssh", access: "Denied" },
  ]);

  const flip = (key: keyof typeof settings) =>
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  const toggleGroup = (id: string) =>
    setExpanded((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  return (
    <div className={styles.scene}>
      <header className={styles.titleBar}>
        <span>Agent Customizations - Copilot</span>
        <div className={styles.titleActions}>
          <Codicon name="go-to-file" />
          <Codicon name="chrome-maximize" />
          <Codicon name="close" />
        </div>
      </header>
      <div className={styles.editorBody}>
        <nav className={styles.sidebar}>
          <div className={styles.sidebarItems}>
            {navItems.map(([icon, label, count]) => (
              <button
                key={label}
                className={`${styles.sidebarItem} ${label === "Sandbox" ? styles.sidebarItemActive : ""} ${label === "Migrate Prompts" ? styles.sidebarSeparated : ""}`}
              >
                <Codicon name={icon} />
                <span>{label}</span>
                {count && <small>{count}</small>}
              </button>
            ))}
          </div>
        </nav>

        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <div>
              <h1>Sandbox</h1>
              <p>Limit what agent processes can access on this machine.</p>
            </div>
            <a href="https://docs.github.com/en/copilot/how-tos/cloud-and-local-sandboxes/configuring-local-sandbox-settings">
              Learn more
            </a>
          </div>

          <div className={styles.statusStrip}>
            <span className={styles.statusIcon}>
              <Codicon name="shield" />
            </span>
            <div>
              <strong>Sandbox is {settings.enabled ? "on" : "off"}</strong>
              <span>
                {settings.enabled
                  ? "Shell commands, MCP servers, and language servers run inside the sandbox."
                  : "Turn on the sandbox to edit its configuration."}
              </span>
            </div>
            <Toggle checked={settings.enabled} onChange={() => flip("enabled")} label="Enable sandbox" />
          </div>

          <div className={`${styles.scrollArea} ${!settings.enabled ? styles.configurationDisabled : ""}`}>
            <section className={styles.section}>
              <h2>General</h2>
              <SettingRow title="Allow sandbox bypass" description="Let Copilot request approval to run a command outside the sandbox." checked={settings.bypass} onChange={() => flip("bypass")} />
              <SettingRow title="Sandbox MCP servers" description="Run MCP servers inside the sandbox." checked={settings.mcp} onChange={() => flip("mcp")} />
              <SettingRow title="Sandbox language servers" description="Run language servers inside the sandbox." checked={settings.lsp} onChange={() => flip("lsp")} managed />
            </section>

            <section className={styles.section}>
              <h2>Authentication</h2>
              <SettingRow title="Authenticate Git" description="Inject credentials for authenticated HTTPS Git operations." checked={settings.git} onChange={() => flip("git")} />
              <SettingRow title="Authenticate GitHub CLI" description="Export GH_TOKEN so gh works without keychain access." checked={settings.gh} onChange={() => flip("gh")} />
              <SettingRow title="Allow macOS Keychain access" description="Let sandboxed commands use credentials stored in the macOS Keychain." checked={settings.keychain} onChange={() => flip("keychain")} />
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <div>
                  <h2>Filesystem</h2>
                  <p>More specific paths take precedence over broader paths.</p>
                </div>
                <button
                  className={styles.secondaryButton}
                  onClick={() =>
                    setPaths((current) => [
                      ...current,
                      { id: Date.now(), path: "", access: "Read-only" },
                    ])
                  }
                >
                  <Codicon name="add" /> Add path
                </button>
              </div>
              <SettingRow title="Include working directory" description="Grant read/write access to the current working directory and repository metadata." checked={settings.cwd} onChange={() => flip("cwd")} />
              <SettingRow title="Allow dev-tool access" description="Grant access to toolchains, package registries, configuration, and shared build caches." checked={settings.devTools} onChange={() => flip("devTools")} />
              <div className={styles.pathTable}>
                <div className={styles.tableHeader}><span>Path</span><span>Access</span><span /></div>
                {paths.map((row) => (
                  <div className={styles.pathRow} key={row.id}>
                    <Codicon name={row.access === "Denied" ? "circle-slash" : "folder"} />
                    <input
                      className={styles.pathInput}
                      value={row.path}
                      placeholder="/absolute/path"
                      aria-label="Path"
                      autoFocus={!row.path}
                      onChange={(event) =>
                        setPaths((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, path: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <select
                      value={row.access}
                      aria-label={`Access for ${row.path || "new path"}`}
                      onChange={(event) =>
                        setPaths((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, access: event.target.value } : item,
                          ),
                        )
                      }
                    >
                      <option>Read/Write</option>
                      <option>Read-only</option>
                      <option>Denied</option>
                    </select>
                    <button
                      aria-label={`Remove ${row.path || "new path"}`}
                      onClick={() =>
                        setPaths((current) => current.filter((item) => item.id !== row.id))
                      }
                    >
                      <Codicon name="trash" />
                    </button>
                  </div>
                ))}
                {paths.length === 0 && (
                  <div className={styles.emptyPaths}>No custom path rules.</div>
                )}
              </div>
            </section>

            <section className={styles.section}>
              <h2>Network</h2>
              <SettingRow title="Allow outbound connections" description="Let sandboxed processes reach hosts on the internet." checked={settings.outbound} onChange={() => flip("outbound")} />
              <SettingRow title="Allow local network" description="Let sandboxed processes reach localhost and other hosts on the local network." checked={settings.local} onChange={() => flip("local")} />
              <div className={styles.inputRow}>
                <div><strong>HTTP proxy</strong><span>Route sandboxed traffic through a proxy.</span></div>
                <input placeholder="No proxy configured" />
              </div>
            </section>

            <section className={`${styles.section} ${styles.policySection}`}>
              <div className={styles.sectionHeading}>
                <div>
                  <h2>Effective policy</h2>
                  <p>Computed from your settings, automatic grants, the current session, and managed policy.</p>
                </div>
                <button className={styles.iconButton} aria-label="Refresh effective policy"><Codicon name="refresh" /></button>
              </div>
              <div className={styles.policyGroups}>
                {policyGroups.map((group) => {
                  const isOpen = expanded.includes(group.id);
                  return (
                    <div className={styles.policyGroup} key={group.id}>
                      <button className={styles.policyHeader} onClick={() => toggleGroup(group.id)}>
                        <Codicon name={isOpen ? "chevron-down" : "chevron-right"} />
                        <Codicon name={group.icon} />
                        <strong>{group.label}</strong>
                        <span>{group.summary}</span>
                      </button>
                      {isOpen && (
                        <div className={styles.policyRows}>
                          {group.rows.map((row) => (
                            <div className={styles.policyRow} key={row.value}>
                              <span className={`${styles.accessMark} ${styles[`access_${row.access}`]}`}>
                                <Codicon name={row.access === "write" ? "edit" : row.access === "allow" ? "check" : "eye"} />
                                {row.access === "write" ? "Read/Write" : row.access === "allow" ? "Allowed" : "Read-only"}
                              </span>
                              <code>{row.value}</code>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
