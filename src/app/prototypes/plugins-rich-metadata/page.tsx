"use client";

import { useState, useMemo } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type Capability = "read" | "write" | "interactive";

interface Plugin {
  name: string; // kebab-case slug — the addressable id
  displayName?: string;
  domain?: string; // real brand domain → favicon logo
  brandColor?: string;
  category?: string;
  shortDescription?: string;
  description: string;
  publisher: string;
  verified?: boolean;
  version: string;
  license?: string;
  marketplace?: string;
  capabilities?: Capability[];
  defaultPrompts?: string[];
  contents?: {
    skills?: string[];
    mcpServers?: string[];
    agents?: string[];
    hooks?: string[];
  };
  installed?: boolean;
  featured?: boolean;
}

const PLUGINS: Plugin[] = [
  {
    name: "github-pull-requests",
    displayName: "GitHub",
    domain: "github.com",
    brandColor: "#8A7CE0",
    category: "Development",
    shortDescription: "Review, triage, and merge pull requests from the agent.",
    description:
      "Work with GitHub pull requests end to end — list review requests, read diffs, leave comments, and merge when checks are green.",
    publisher: "GitHub",
    verified: true,
    version: "1.4.0",
    license: "MIT",
    marketplace: "github/awesome-copilot",
    capabilities: ["read", "write", "interactive"],
    defaultPrompts: [
      "What PRs are waiting on my review?",
      "Summarize the changes in PR #482.",
    ],
    contents: {
      skills: [
        "/pr-review",
        "/pr-summarize",
        "/pr-merge",
        "/issue-triage",
        "/release-notes",
      ],
      mcpServers: ["github"],
      agents: ["pr-reviewer"],
    },
    installed: true,
    featured: true,
  },
  {
    name: "azure",
    displayName: "Azure",
    domain: "azure.microsoft.com",
    brandColor: "#3A8FE0",
    category: "Cloud",
    shortDescription: "Manage Azure infrastructure and deployments.",
    description:
      "Microsoft Azure MCP Server and skills for cloud resource management, deployments, and Azure services. Monitor applications and deploy resources directly from Copilot.",
    publisher: "Microsoft",
    verified: true,
    version: "2.0.5",
    license: "MIT",
    marketplace: "microsoft/mcp",
    capabilities: ["read", "write", "interactive"],
    defaultPrompts: [
      "List my resource groups in the prod subscription.",
      "Why is my App Service returning 502s?",
      "Deploy the staging slot to production.",
    ],
    contents: {
      skills: [
        "/azure-deploy",
        "/azure-monitor",
        "/azure-resource-list",
        "/azure-logs",
        "/azure-cost",
        "/azure-scale",
      ],
      mcpServers: ["azure"],
      agents: ["infra-operator"],
      hooks: ["pre-deploy-check"],
    },
    installed: true,
    featured: true,
  },
  {
    name: "microsoft-365",
    displayName: "Microsoft 365",
    domain: "microsoft.com",
    brandColor: "#7B83EB",
    category: "Productivity",
    shortDescription: "Access SharePoint, OneDrive, Outlook, and Teams.",
    description:
      "Query Microsoft 365 data with natural language — emails, meetings, documents, and Teams messages. Surface what matters without leaving the agent.",
    publisher: "Microsoft",
    verified: true,
    version: "2.4.1",
    license: "MIT",
    marketplace: "microsoft/m365-agents",
    capabilities: ["read", "interactive"],
    defaultPrompts: [
      "What did I miss in my unread Teams messages today?",
      "Summarize my meetings from this week.",
    ],
    contents: {
      skills: [
        "/outlook-search",
        "/teams-catch-up",
        "/calendar-summary",
        "/sharepoint-find",
        "/onedrive-read",
      ],
      mcpServers: ["microsoft-365"],
    },
    installed: true,
    featured: true,
  },
  {
    name: "figma",
    displayName: "Figma",
    domain: "figma.com",
    brandColor: "#A259FF",
    category: "Design",
    shortDescription: "Generate diagrams and better code from Figma context.",
    description:
      "Pull frames, components, and design tokens from Figma into the agent to generate accurate UI code and keep implementation in sync with design.",
    publisher: "Figma",
    verified: true,
    version: "0.7.2",
    license: "MIT",
    marketplace: "figma/figma-mcp",
    capabilities: ["read"],
    defaultPrompts: ["Build this selected frame as a React component."],
    contents: {
      skills: [
        "/figma-code-connect",
        "/figma-create-new-file",
        "/figma-generate-design",
        "/figma-generate-diagram",
        "/figma-generate-library",
        "/figma-use-figjam",
        "/figma-use",
        "/figma-use-slides",
      ],
      mcpServers: ["figma"],
    },
    installed: true,
  },
  {
    name: "slack",
    displayName: "Slack",
    domain: "slack.com",
    brandColor: "#4A154B",
    category: "Communication",
    shortDescription: "Send messages, create canvases, and fetch Slack data.",
    description:
      "Read and post to channels, summarize threads, create canvases, and pull context from your Slack workspace — all from the agent.",
    publisher: "Slack",
    verified: true,
    version: "1.1.0",
    license: "MIT",
    marketplace: "slackapi/slack-mcp",
    capabilities: ["read", "write", "interactive"],
    defaultPrompts: [
      "Summarize the #incidents thread from this morning.",
      "Post the release notes to #launches.",
    ],
    contents: {
      skills: ["/slack-search", "/slack-post", "/slack-summarize-thread", "/slack-canvas"],
      mcpServers: ["slack"],
    },
    installed: true,
    featured: true,
  },
  {
    name: "notion",
    displayName: "Notion",
    domain: "notion.so",
    brandColor: "#cfcfcf",
    category: "Productivity",
    shortDescription: "Search, update, and power workflows across Notion.",
    description:
      "Connect your Notion workspace to search pages, update databases, and power workflows across tools without leaving the agent.",
    publisher: "Notion",
    verified: true,
    version: "1.0.3",
    license: "MIT",
    marketplace: "makenotion/notion-mcp",
    capabilities: ["read", "write"],
    defaultPrompts: ["Find the launch checklist and mark QA as done."],
    contents: {
      skills: ["/notion-search", "/notion-update", "/notion-create-page"],
      mcpServers: ["notion"],
    },
    installed: true,
  },
  {
    name: "linear",
    displayName: "Linear",
    domain: "linear.app",
    brandColor: "#5E6AD2",
    category: "Development",
    shortDescription: "Create, triage, and track issues and cycles.",
    description:
      "Manage Linear issues, projects, and cycles — create tickets from a conversation, triage the backlog, and track sprint progress.",
    publisher: "Linear",
    verified: true,
    version: "0.9.0",
    license: "MIT",
    marketplace: "linear/linear-mcp",
    capabilities: ["read", "write"],
    defaultPrompts: ["Create a bug for the 502s and assign it to me."],
    contents: {
      skills: ["/linear-create-issue", "/linear-triage", "/linear-cycle-status"],
      mcpServers: ["linear"],
    },
  },
  {
    name: "sentry",
    displayName: "Sentry",
    domain: "sentry.io",
    brandColor: "#9b6dc7",
    category: "Development",
    shortDescription: "Investigate errors and performance regressions.",
    description:
      "Pull Sentry issues, stack traces, and performance data into the agent to triage incidents and find the commit that introduced a regression.",
    publisher: "Sentry",
    verified: true,
    version: "1.2.1",
    license: "MIT",
    marketplace: "getsentry/sentry-mcp",
    capabilities: ["read"],
    defaultPrompts: ["What's the most frequent unresolved error this week?"],
  },
  {
    name: "stripe",
    displayName: "Stripe",
    domain: "stripe.com",
    brandColor: "#635BFF",
    category: "Sales & Finance",
    shortDescription: "Look up customers, payments, and subscriptions.",
    description:
      "Query Stripe for customers, payments, invoices, and subscriptions, and draft changes for review — billing context without the dashboard.",
    publisher: "Stripe",
    verified: true,
    version: "1.0.0",
    license: "MIT",
    marketplace: "stripe/stripe-mcp",
    capabilities: ["read", "write"],
    defaultPrompts: ["Why did customer acme-co's last payment fail?"],
  },
  {
    name: "jira",
    displayName: "Jira",
    domain: "atlassian.com",
    brandColor: "#2684FF",
    category: "Development",
    shortDescription: "Access Jira & Confluence from the agent.",
    description:
      "Read and update Jira issues and Confluence pages — move tickets across the board, log work, and pull requirements into context.",
    publisher: "Atlassian",
    verified: true,
    version: "1.3.0",
    license: "MIT",
    marketplace: "atlassian/atlassian-mcp",
    capabilities: ["read", "write"],
    defaultPrompts: ["Move my in-review tickets to done."],
  },
  {
    name: "datadog",
    displayName: "Datadog",
    domain: "datadoghq.com",
    brandColor: "#632CA6",
    category: "Data & Analytics",
    shortDescription: "Query metrics, logs, and monitors.",
    description:
      "Investigate incidents with Datadog metrics, logs, and monitors — correlate spikes, inspect dashboards, and surface noisy alerts.",
    publisher: "Datadog",
    verified: true,
    version: "0.6.0",
    license: "MIT",
    marketplace: "datadog/datadog-mcp",
    capabilities: ["read"],
    defaultPrompts: ["Show p99 latency for the checkout service today."],
  },
  {
    name: "google-drive",
    displayName: "Google Drive",
    domain: "drive.google.com",
    brandColor: "#4285F4",
    category: "Productivity",
    shortDescription: "Search, read, and upload files instantly.",
    description:
      "Find and read documents, spreadsheets, and slides in Google Drive, and upload new files generated by the agent.",
    publisher: "Google",
    verified: true,
    version: "1.1.0",
    license: "MIT",
    marketplace: "google/drive-mcp",
    capabilities: ["read", "write"],
    defaultPrompts: ["Find the Q3 planning doc shared by Priya."],
  },
  {
    name: "postgres",
    displayName: "PostgreSQL",
    domain: "postgresql.org",
    brandColor: "#4169E1",
    category: "Data & Analytics",
    shortDescription: "Explore schemas and run read-only queries.",
    description:
      "Connect to a PostgreSQL database to explore schemas, inspect tables, and run read-only queries with results inline.",
    publisher: "community",
    verified: false,
    version: "0.4.2",
    license: "PostgreSQL",
    marketplace: "community/postgres-mcp",
    capabilities: ["read"],
    defaultPrompts: ["Show the 10 most recent orders with customer names."],
  },
  // Intentionally core-only: no displayName / domain / category / capabilities.
  // Demonstrates graceful degradation back to the kebab `name` + monogram tile.
  {
    name: "legacy-repo-linter",
    description:
      "A community linter published with only the minimal core fields. No presentation metadata is shipped, so the UI falls back to the slug and a monogram.",
    publisher: "octo-labs",
    verified: false,
    version: "0.3.0",
    license: "Apache-2.0",
    marketplace: "octo-labs/legacy-repo-linter",
  },
];

const CONTENT_META: Record<
  "skills" | "mcpServers" | "agents" | "hooks",
  { label: string; icon: string }
> = {
  skills: { label: "Skills", icon: "lightbulb" },
  mcpServers: { label: "MCP servers", icon: "server-process" },
  agents: { label: "Agents", icon: "compass" },
  hooks: { label: "Hooks", icon: "plug" },
};

type Variation = "list" | "grid" | "detail";

const NAV_PRIMARY = [
  { icon: "plug", label: "Plugins", count: 13 },
  { icon: "lightbulb", label: "Skills", count: 61 },
  { icon: "server", label: "MCP Servers", count: 7 },
];

const NAV_SECONDARY = [
  { icon: "home", label: "Overview", count: null },
  { icon: "compass", label: "Agents", count: 7 },
  { icon: "book", label: "Instructions", count: 3 },
  { icon: "bookmark", label: "Prompts", count: 40 },
  { icon: "zap", label: "Hooks", count: 3 },
];

function titleOf(p: Plugin) {
  return p.displayName ?? p.name;
}

function faviconUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function PluginIcon({ plugin, size = 44 }: { plugin: Plugin; size?: number }) {
  if (!plugin.domain) {
    return (
      <span
        className={styles.iconTile}
        style={{ width: size, height: size, fontSize: size * 0.34 }}
      >
        {plugin.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <span className={styles.iconTile} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={faviconUrl(plugin.domain)}
        alt=""
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        loading="lazy"
      />
    </span>
  );
}

function VerifiedPublisher({ plugin }: { plugin: Plugin }) {
  return (
    <span className={styles.publisher}>
      {plugin.publisher}
      {plugin.verified && (
        <Codicon
          name="verified-filled"
          className={styles.verified}
          title="Verified publisher"
        />
      )}
    </span>
  );
}

function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      className={`${styles.toggle} ${on ? styles.toggleOn : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}

export default function PluginsRichMetadataPage() {
  const [variation, setVariation] = useState<Variation>("list");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [detailSlug, setDetailSlug] = useState<string>("azure");
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PLUGINS.filter((p) => p.installed).map((p) => [p.name, true]))
  );

  function toggle(slug: string) {
    setEnabled((m) => ({ ...m, [slug]: !m[slug] }));
  }

  const categories = useMemo(() => {
    const set = new Set<string>();
    PLUGINS.forEach((p) => p.category && set.add(p.category));
    return ["All", ...Array.from(set)];
  }, []);

  const configured = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLUGINS.filter(
      (p) => p.installed && (!q || titleOf(p).toLowerCase().includes(q) || p.name.includes(q))
    );
  }, [query]);

  // Catalog = not-yet-configured plugins.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLUGINS.filter((p) => {
      if (p.installed) return false;
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (!q) return true;
      return (
        titleOf(p).toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.shortDescription ?? "").toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const detailPlugin = PLUGINS.find((p) => p.name === detailSlug) ?? PLUGINS[0];

  function openDetail(slug: string) {
    setDetailSlug(slug);
    setVariation("detail");
  }

  // Grid catalog sections grouped by category.
  const gridSections = useMemo<[string, Plugin[]][]>(() => {
    if (activeCategory !== "All" || query.trim()) {
      return [["Popular plugins", filtered]];
    }
    const byCat = new Map<string, Plugin[]>();
    filtered.forEach((p) => {
      const key = p.category ?? "Other";
      if (!byCat.has(key)) byCat.set(key, []);
      byCat.get(key)!.push(p);
    });
    return Array.from(byCat.entries());
  }, [filtered, activeCategory, query]);

  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        {/* Title bar */}
        <div className={styles.titleBar}>
          <span className={styles.titleText}>Agent Customizations for Local</span>
          <div className={styles.titleActions}>
            <Codicon name="layout-sidebar-right" />
            <Codicon name="screen-full" />
            <Codicon name="close" />
          </div>
        </div>

        <div className={styles.body}>
          {/* Nav rail */}
          <nav className={styles.nav}>
            {NAV_PRIMARY.map((item) => (
              <button
                key={item.label}
                className={`${styles.navItem} ${item.label === "Plugins" ? styles.navActive : ""}`}
              >
                <Codicon name={item.icon} className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
                {item.count != null && <span className={styles.navCount}>{item.count}</span>}
              </button>
            ))}
            <div className={styles.navDivider} />
            {NAV_SECONDARY.map((item) => (
              <button key={item.label} className={`${styles.navItem} ${styles.navItemMuted}`}>
                <Codicon name={item.icon} className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
                {item.count != null && <span className={styles.navCount}>{item.count}</span>}
              </button>
            ))}
          </nav>

          {/* Content */}
          <main className={styles.content}>
            {variation === "detail" ? (
              <DetailView
                plugin={detailPlugin}
                on={!!enabled[detailPlugin.name]}
                onToggle={() => toggle(detailPlugin.name)}
                onBack={() => setVariation("list")}
              />
            ) : (
              <>
                <header className={styles.contentHead}>
                  <h1 className={styles.h1}>Plugins</h1>
                  <p className={styles.lede}>
                    Extend your agent with plugins that connect your favorite tools and
                    add commands, skills, and MCP servers.{" "}
                    <a className={styles.link} href="#">
                      Learn more
                    </a>
                  </p>
                </header>

                <div className={styles.toolbar}>
                  <div className={styles.searchWrap}>
                    <Codicon name="search" className={styles.searchIcon} />
                    <input
                      className={styles.search}
                      placeholder="Search plugins and skills…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <button className={styles.secondaryBtn}>
                    <Codicon name="add" /> Install from Source
                  </button>
                </div>

                {/* Configured plugins */}
                {!query.trim() && configured.length > 0 && (
                  <section className={styles.configured}>
                    <h2 className={styles.sectionTitle}>Configured plugins</h2>
                    <div className={styles.configRows}>
                      {configured.map((p) => (
                        <ConfiguredRow
                          key={p.name}
                          plugin={p}
                          on={!!enabled[p.name]}
                          onToggle={() => toggle(p.name)}
                          onOpen={() => openDetail(p.name)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {variation === "grid" && (
                  <div className={styles.filterRow}>
                    {categories.map((c) => (
                      <button
                        key={c}
                        className={`${styles.filterChip} ${
                          activeCategory === c ? styles.filterChipActive : ""
                        }`}
                        onClick={() => setActiveCategory(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}

                {variation === "list" && (
                  <>
                    <h2 className={styles.sectionTitle}>
                      {query.trim() ? "Results" : "Popular plugins"}
                    </h2>
                    <ListView plugins={filtered} onOpen={openDetail} />
                  </>
                )}
                {variation === "grid" && (
                  <GridView sections={gridSections} onOpen={openDetail} />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Floating variation switcher */}
      <div className={styles.switcher}>
        {(
          [
            ["list", "list-flat", "Enriched List"],
            ["grid", "layout-panel", "Catalog Grid"],
            ["detail", "preview", "Detail View"],
          ] as const
        ).map(([id, icon, label]) => (
          <button
            key={id}
            className={`${styles.switchBtn} ${variation === id ? styles.switchActive : ""}`}
            onClick={() => setVariation(id)}
          >
            <Codicon name={icon} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Configured row (GitHub Copilot MCP style) ─── */
function ConfiguredRow({
  plugin,
  on,
  onToggle,
  onOpen,
}: {
  plugin: Plugin;
  on: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <div className={`${styles.configRow} ${on ? "" : styles.configRowOff}`} onClick={onOpen}>
      <PluginIcon plugin={plugin} size={34} />
      <div className={styles.configMain}>
        <span className={styles.configName}>{titleOf(plugin)}</span>
        <VerifiedPublisher plugin={plugin} />
      </div>
      <div className={styles.configActions}>
        <button
          className={styles.rowAction}
          title="Edit"
          onClick={(e) => e.stopPropagation()}
        >
          <Codicon name="settings-gear" />
        </button>
        <button
          className={styles.rowAction}
          title="Remove"
          onClick={(e) => e.stopPropagation()}
        >
          <Codicon name="trash" />
        </button>
        <Toggle on={on} onToggle={onToggle} />
      </div>
    </div>
  );
}

/* ─── Variation A: Enriched List ─── */
function ListView({ plugins, onOpen }: { plugins: Plugin[]; onOpen: (s: string) => void }) {
  return (
    <ul className={styles.list}>
      {plugins.map((p) => (
        <li key={p.name} className={styles.listRow} onClick={() => onOpen(p.name)}>
          <PluginIcon plugin={p} />
          <div className={styles.listMain}>
            <div className={styles.listTitleLine}>
              <span className={styles.listTitle}>{titleOf(p)}</span>
              <VerifiedPublisher plugin={p} />
            </div>
            <p className={styles.listDesc}>{p.shortDescription ?? p.description}</p>
          </div>
          {p.installed ? (
            <button className={styles.installedBtn} onClick={(e) => e.stopPropagation()}>
              <Codicon name="check" /> Added
            </button>
          ) : (
            <button className={styles.installBtn} onClick={(e) => e.stopPropagation()}>
              Add plugin
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/* ─── Variation B: Catalog Grid ─── */
function GridView({
  sections,
  onOpen,
}: {
  sections: [string, Plugin[]][];
  onOpen: (s: string) => void;
}) {
  const empty = sections.every(([, items]) => items.length === 0);
  if (empty) return <p className={styles.empty}>No plugins match your search.</p>;
  return (
    <div className={styles.groups}>
      {sections.map(([title, plugins]) =>
        plugins.length === 0 ? null : (
          <section key={title} className={styles.group}>
            <h2 className={styles.groupTitle}>{title}</h2>
            <div className={styles.grid}>
              {plugins.map((p) => (
                <article key={p.name} className={styles.card} onClick={() => onOpen(p.name)}>
                  <PluginIcon plugin={p} size={40} />
                  <div className={styles.cardMain}>
                    <div className={styles.cardTitle}>{titleOf(p)}</div>
                    <VerifiedPublisher plugin={p} />
                    <p className={styles.cardDesc}>{p.shortDescription ?? p.description}</p>
                  </div>
                  <button
                    className={p.installed ? styles.addBtnDone : styles.addBtn}
                    title={p.installed ? "Added" : "Add plugin"}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Codicon name={p.installed ? "check" : "add"} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        )
      )}
    </div>
  );
}

/* ─── Variation C: Detail View ─── */
function DetailView({
  plugin,
  on,
  onToggle,
  onBack,
}: {
  plugin: Plugin;
  on: boolean;
  onToggle: () => void;
  onBack: () => void;
}) {
  return (
    <div className={styles.detail}>
      <button className={styles.backBtn} onClick={onBack}>
        <Codicon name="arrow-left" /> Back to plugins
      </button>

      <div className={styles.detailHero}>
        <PluginIcon plugin={plugin} size={64} />
        <div className={styles.detailHeroMain}>
          <h1 className={styles.detailTitle}>{titleOf(plugin)}</h1>
          <div className={styles.detailByline}>
            <VerifiedPublisher plugin={plugin} />
            {plugin.category && (
              <>
                <span className={styles.dot}>·</span>
                <span>{plugin.category}</span>
              </>
            )}
          </div>
          {plugin.shortDescription && (
            <p className={styles.detailTagline}>{plugin.shortDescription}</p>
          )}
        </div>
        <div className={styles.detailAction}>
          {plugin.installed ? (
            <>
              <div className={styles.detailToggle}>
                <span className={on ? styles.enabledLabel : styles.disabledLabel}>
                  {on ? "Enabled" : "Disabled"}
                </span>
                <Toggle on={on} onToggle={onToggle} />
              </div>
              <button className={styles.uninstallBtn}>
                <Codicon name="trash" /> Uninstall
              </button>
            </>
          ) : (
            <button className={styles.installBtnLg}>Add plugin</button>
          )}
        </div>
      </div>

      <div className={styles.factRow}>
        {plugin.version && (
          <div className={styles.fact}>
            <span className={styles.factLabel}>Version</span>
            <span className={styles.factValue}>{plugin.version}</span>
          </div>
        )}
        {plugin.license && (
          <div className={styles.fact}>
            <span className={styles.factLabel}>License</span>
            <span className={styles.factValue}>{plugin.license}</span>
          </div>
        )}
        {plugin.publisher && (
          <div className={styles.fact}>
            <span className={styles.factLabel}>Publisher</span>
            <span className={styles.factValue}>{plugin.publisher}</span>
          </div>
        )}
        {plugin.marketplace && (
          <div className={styles.fact}>
            <span className={styles.factLabel}>Marketplace</span>
            <a className={styles.factLink} href="#">
              {plugin.marketplace} <Codicon name="link-external" />
            </a>
          </div>
        )}
      </div>

      <p className={styles.detailDesc}>{plugin.description}</p>

      {/* What this plugin adds */}
      {plugin.contents &&
        (["skills", "mcpServers", "agents", "hooks"] as const).map((kind) => {
          const items = plugin.contents?.[kind];
          if (!items || items.length === 0) return null;
          const meta = CONTENT_META[kind];
          const isSkill = kind === "skills";
          const cap = isSkill ? 6 : 8;
          const shown = items.slice(0, cap);
          const extra = items.length - shown.length;
          return (
            <section key={kind} className={styles.contentSection}>
              <div className={styles.contentSecHead}>
                <Codicon name={meta.icon} />
                <h3 className={styles.contentTitle}>{meta.label}</h3>
                <span className={styles.countBadge}>{items.length}</span>
              </div>
              <div className={styles.chips}>
                {shown.map((item) => (
                  <span
                    key={item}
                    className={`${styles.chip} ${isSkill ? styles.chipMono : ""}`}
                  >
                    {item}
                  </span>
                ))}
                {extra > 0 && <span className={styles.chipMore}>+{extra} more</span>}
              </div>
            </section>
          );
        })}

      {/* Starter prompts */}
      {plugin.defaultPrompts && plugin.defaultPrompts.length > 0 && (
        <section className={styles.panel}>
          <h3 className={styles.panelTitle}>
            <Codicon name="rocket" /> Try this after installing
          </h3>
          <div className={styles.prompts}>
            {plugin.defaultPrompts.map((prompt) => (
              <button key={prompt} className={styles.promptChip}>
                <Codicon name="sparkle" />
                {prompt}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
