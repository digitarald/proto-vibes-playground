"use client";

import { useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

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

const groups = [
  { label: "System", icon: "device-desktop", count: "8 paths", rows: [["Read-only", "/Applications/Xcode.app/Contents/Developer"], ["Read-only", "/bin"], ["Read-only", "/opt/homebrew"], ["Read-only", "/System"], ["Read-only", "/usr/bin"], ["Read-only", "/usr/lib"], ["Read-only", "/usr/local"], ["Read/Write", "/private/var/folders/9p/.../T"]] },
  { label: "Current session", icon: "history", count: "2 paths", rows: [["Read-only", "~/.copilot/session-state/b281.../events.jsonl"], ["Read/Write", "~/.copilot/session-state/b281.../files"]] },
  { label: "Copilot home", icon: "copilot", count: "2 paths", rows: [["Read-only", "~/.copilot/logs"], ["Read-only", "~/.copilot/skills"]] },
  { label: "Personal skills", icon: "lightbulb", count: "1 path", rows: [["Read-only", "~/.agents/skills"]] },
];

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return <button className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`} onClick={onChange} disabled={disabled} role="switch" aria-checked={checked} aria-label={label}><span /></button>;
}

function Row({ title, description, checked, onChange, managed }: { title: string; description: string; checked: boolean; onChange: () => void; managed?: boolean }) {
  return (
    <div className={styles.row}>
      <div>
        <strong>{title}</strong>
        {managed && <span className={styles.managed}><Codicon name="lock" /> Managed</span>}
        <p>{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} disabled={managed} />
    </div>
  );
}

export default function SandboxPolicyInspectorPage() {
  const [settings, setSettings] = useState({ enabled: true, bypass: true, mcp: true, lsp: true, git: true, gh: true, keychain: false, cwd: true, dev: true, outbound: true, local: true });
  const [expanded, setExpanded] = useState("Current session");
  const [showPolicy, setShowPolicy] = useState(false);
  const [paths, setPaths] = useState([
    { id: 1, path: "~/Developer/shared-fixtures", access: "Read-only" },
    { id: 2, path: "~/Library/Caches/playwright", access: "Read/Write" },
    { id: 3, path: "~/.ssh", access: "Denied" },
  ]);
  const flip = (key: keyof typeof settings) => setSettings((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className={styles.scene}>
      <header className={styles.titleBar}><span>Agent Customizations - Copilot</span><div><Codicon name="go-to-file" /><Codicon name="chrome-maximize" /><Codicon name="close" /></div></header>
      <div className={styles.editorBody}>
        <nav className={styles.sidebar}>
          {navItems.map(([icon, label, count]) => (
            <button key={label} className={`${styles.sidebarItem} ${label === "Sandbox" ? styles.sidebarItemActive : ""} ${label === "Migrate Prompts" ? styles.sidebarSeparated : ""}`}>
              <Codicon name={icon} /><span>{label}</span>{count && <small>{count}</small>}
            </button>
          ))}
        </nav>

        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <div><h1>Sandbox</h1><p>Configure isolation and inspect the access Copilot receives.</p></div>
            <div className={styles.headerStatus}><Codicon name="shield" /><span><strong>{settings.enabled ? "On" : "Off"}</strong> for this machine</span><Toggle checked={settings.enabled} onChange={() => flip("enabled")} label="Enable sandbox" /></div>
          </div>
          <div className={styles.scrollArea}>
            <section className={styles.outcome}>
              <div className={styles.inspectorHeader}>
                <div><h2>Effective policy</h2><p>What Copilot can access with the current configuration</p></div>
                <button aria-label="Refresh"><Codicon name="refresh" /></button>
              </div>
              <div className={styles.summaryLine}>
                <span><Codicon name="shield" /> Sandbox {settings.enabled ? "on" : "off"}</span>
                <span><Codicon name="folder-opened" /> {settings.cwd ? "1 writable root" : "No writable root"}</span>
                <span><Codicon name="eye" /> 12 readable paths</span>
                <span><Codicon name="globe" /> Network {settings.outbound ? "on" : "off"}</span>
              </div>
              <div className={styles.policyOverview}>
                <div>
                  <Codicon name="folder-opened" />
                  <strong>Working directory</strong>
                  <code>/Users/digitarald/Developer/vscode</code>
                  <span>{settings.cwd ? "Read/Write" : "No access"}</span>
                </div>
                <div>
                  <Codicon name="globe" />
                  <strong>Network</strong>
                  <code>{settings.local ? "Outbound and local network" : "Outbound only"}</code>
                  <span>{settings.outbound ? "Allowed" : "Blocked"}</span>
                </div>
                <div>
                  <Codicon name="tools" />
                  <strong>Dev-tool access</strong>
                  <code>{settings.dev ? "npm detected" : "Automatic grants disabled"}</code>
                  <span>{settings.dev ? "Allowed" : "Off"}</span>
                </div>
              </div>
              <button className={styles.disclosure} onClick={() => setShowPolicy((current) => !current)}>
                <Codicon name={showPolicy ? "chevron-down" : "chevron-right"} />
                {showPolicy ? "Hide all policy sources" : "Show all policy sources"}
              </button>
              {showPolicy && (
                <div className={styles.policyList}>
                  {groups.map((group) => (
                    <div className={styles.group} key={group.label}>
                      <button onClick={() => setExpanded(expanded === group.label ? "" : group.label)}>
                        <Codicon name={expanded === group.label ? "chevron-down" : "chevron-right"} />
                        <Codicon name={group.icon} />
                        <strong>{group.label}</strong>
                        <span>{group.count}</span>
                      </button>
                      {expanded === group.label && (
                        <div className={styles.groupRows}>
                          {group.rows.map(([access, path]) => (
                            <div key={path}><span>{access}</span><code>{path}</code></div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className={`${styles.configuration} ${!settings.enabled ? styles.configurationDisabled : ""}`}>
              <section>
                <h2>General</h2>
                <Row title="Allow sandbox bypass" description="Copilot can request approval to run a command outside the sandbox." checked={settings.bypass} onChange={() => flip("bypass")} />
                <Row title="Sandbox MCP servers" description="Run MCP servers inside the sandbox." checked={settings.mcp} onChange={() => flip("mcp")} />
                <Row title="Sandbox language servers" description="Run language servers inside the sandbox." checked={settings.lsp} onChange={() => flip("lsp")} managed />
              </section>
              <section>
                <h2>Authentication</h2>
                <Row title="Authenticate Git" description="Inject credentials for authenticated HTTPS Git operations." checked={settings.git} onChange={() => flip("git")} />
                <Row title="Authenticate GitHub CLI" description="Export GH_TOKEN for gh commands." checked={settings.gh} onChange={() => flip("gh")} />
                <Row title="Allow macOS Keychain access" description="Expose credentials stored in the macOS Keychain." checked={settings.keychain} onChange={() => flip("keychain")} />
              </section>
              <section>
                <div className={styles.sectionHeading}>
                  <div><h2>Filesystem</h2><p>Specific paths override broader grants.</p></div>
                  <button onClick={() => setPaths((current) => [...current, { id: Date.now(), path: "", access: "Read-only" }])}>
                    <Codicon name="add" /> Add path
                  </button>
                </div>
                <Row title="Include working directory" description="Grant read/write access to the working directory and repository metadata." checked={settings.cwd} onChange={() => flip("cwd")} />
                <Row title="Allow dev-tool access" description="Grant toolchains access to configuration, registries, and caches." checked={settings.dev} onChange={() => flip("dev")} />
                <div className={styles.paths}>
                  {paths.map((path) => (
                    <div key={path.id}>
                      <Codicon name={path.access === "Denied" ? "circle-slash" : "folder"} />
                      <input
                        value={path.path}
                        placeholder="/absolute/path"
                        aria-label="Path"
                        autoFocus={!path.path}
                        onChange={(event) => setPaths((current) => current.map((item) => item.id === path.id ? { ...item, path: event.target.value } : item))}
                      />
                      <select
                        value={path.access}
                        aria-label={`Access for ${path.path || "new path"}`}
                        onChange={(event) => setPaths((current) => current.map((item) => item.id === path.id ? { ...item, access: event.target.value } : item))}
                      >
                        <option>Read/Write</option><option>Read-only</option><option>Denied</option>
                      </select>
                      <button aria-label={`Remove ${path.path || "new path"}`} onClick={() => setPaths((current) => current.filter((item) => item.id !== path.id))}>
                        <Codicon name="trash" />
                      </button>
                    </div>
                  ))}
                  {paths.length === 0 && <p className={styles.emptyPaths}>No custom path rules.</p>}
                </div>
              </section>
              <section>
                <h2>Network</h2>
                <Row title="Allow outbound connections" description="Let sandboxed processes reach the internet." checked={settings.outbound} onChange={() => flip("outbound")} />
                <Row title="Allow local network" description="Let processes reach localhost and the local network." checked={settings.local} onChange={() => flip("local")} />
                <label className={styles.proxy}><span><strong>HTTP proxy</strong><small>Route sandboxed traffic through a proxy.</small></span><input placeholder="No proxy configured" /></label>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
