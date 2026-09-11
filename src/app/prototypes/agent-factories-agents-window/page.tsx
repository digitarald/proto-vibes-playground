"use client";

import { useEffect, useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type Variation = "sessions" | "graph" | "loops";
type SidePanel = "changes" | "files";
type RunStatus = "running" | "waiting" | "failed" | "completed" | "queued";

const variationMeta: Record<Variation, { label: string; short: string; scenario: string }> = {
  sessions: {
    label: "Factory as session group",
    short: "Sessions",
    scenario: "Large migration",
  },
  graph: {
    label: "Run graph in active session",
    short: "Run graph",
    scenario: "PR repair loop",
  },
  loops: {
    label: "Recurring loop view",
    short: "Recurring",
    scenario: "Issue triage-to-fix",
  },
};

const migrationWorkers = [
  { id: "auth", title: "Migrate auth-service", status: "completed" as const, meta: "+482 −197 · 18m" },
  { id: "api", title: "Migrate api-gateway", status: "running" as const, meta: "+216 −84 · 11m" },
  { id: "billing", title: "Migrate billing-core", status: "waiting" as const, meta: "Conflict · needs review" },
  { id: "web", title: "Migrate web-client", status: "failed" as const, meta: "Limit reached · resumable" },
  { id: "verify", title: "Independent verifier", status: "queued" as const, meta: "Waiting on 2 shards" },
];

const graphNodes = [
  { id: "observe", label: "Observe PR", detail: "CI + review", status: "completed" as const, x: 9, y: 44 },
  { id: "investigate", label: "Investigate", detail: "3 agents", status: "completed" as const, x: 25, y: 16 },
  { id: "fix", label: "Apply fixes", detail: "2 worktrees", status: "running" as const, x: 25, y: 68 },
  { id: "verify", label: "Verify", detail: "Independent", status: "failed" as const, x: 49, y: 42 },
  { id: "approval", label: "Approval", detail: "Product sign-off", status: "queued" as const, x: 73, y: 42 },
  { id: "external", label: "Wait for CI", detail: "External event", status: "queued" as const, x: 90, y: 42 },
];

const cycles = [
  { id: "sep10", date: "Sep 10, 9:00 PM", status: "running" as const, found: "6 found · 2 ready" },
  { id: "sep10am", date: "Sep 10, 9:00 AM", status: "completed" as const, found: "8 found · 3 fixed" },
  { id: "sep09", date: "Sep 9, 9:00 PM", status: "failed" as const, found: "12 found · limit reached" },
  { id: "sep09am", date: "Sep 9, 9:00 AM", status: "completed" as const, found: "4 found · 1 fixed" },
];

function StatusIcon({ status }: { status: RunStatus }) {
  const names: Record<RunStatus, string> = {
    running: "loading",
    waiting: "account",
    failed: "error",
    completed: "pass-filled",
    queued: "circle-outline",
  };
  return (
    <Codicon
      name={names[status]}
      spin={status === "running"}
      className={`${styles.statusIcon} ${styles[`status_${status}`]}`}
    />
  );
}

function IconButton({
  name,
  label,
  onClick,
}: {
  name: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button className={styles.iconButton} aria-label={label} title={label} onClick={onClick}>
      <Codicon name={name} />
    </button>
  );
}

export default function AgentFactoriesAgentsWindowPage() {
  const [variation, setVariation] = useState<Variation>("sessions");
  const [sidePanel, setSidePanel] = useState<SidePanel>("changes");
  const [expanded, setExpanded] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState("billing");
  const [comparisonWorker, setComparisonWorker] = useState("verify");
  const [migrationResolved, setMigrationResolved] = useState(false);
  const [webResumed, setWebResumed] = useState(false);
  const [selectedNode, setSelectedNode] = useState("verify");
  const [verifyResumed, setVerifyResumed] = useState(false);
  const [approvalGranted, setApprovalGranted] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState("sep10");
  const [schedulePaused, setSchedulePaused] = useState(false);
  const [ranNow, setRanNow] = useState(false);
  const [scopeApproved, setScopeApproved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const fromHash = window.location.hash.slice(1);
      if (fromHash === "sessions" || fromHash === "graph" || fromHash === "loops") {
        setVariation(fromHash);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectVariation = (next: Variation) => {
    setVariation(next);
    window.history.replaceState(null, "", `#${next}`);
  };

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  };

  return (
    <main className={styles.window}>
      <header className={styles.titleBar}>
        <div className={styles.windowTitle}>
          <Codicon name="copilot" />
          <span>Agents</span>
          <span className={styles.titleDivider}>/</span>
          <strong>{variationMeta[variation].scenario}</strong>
        </div>
        <nav className={styles.variationSwitch} aria-label="Prototype variation">
          {(Object.keys(variationMeta) as Variation[]).map((key) => (
            <button
              key={key}
              className={variation === key ? styles.variationActive : ""}
              onClick={() => selectVariation(key)}
              title={variationMeta[key].label}
              aria-pressed={variation === key}
            >
              <span className={styles.variationLetter}>
                {key === "sessions" ? "A" : key === "graph" ? "B" : "C"}
              </span>
              {variationMeta[key].short}
            </button>
          ))}
        </nav>
        <div className={styles.titleActions}>
          <IconButton name="terminal" label="Open terminal" />
          <IconButton name="layout-sidebar-right" label="Toggle secondary side bar" />
          <IconButton name="account" label="Accounts" />
        </div>
      </header>

      <div className={styles.body}>
        <SessionsSidebar
          variation={variation}
          expanded={expanded}
          selectedWorker={selectedWorker}
          migrationResolved={migrationResolved}
          webResumed={webResumed}
          verifyResumed={verifyResumed}
          schedulePaused={schedulePaused}
          onToggle={() => setExpanded((value) => !value)}
          onWorker={setSelectedWorker}
        />

        <section className={styles.workbench}>
          <div className={styles.editorTabs}>
            <div className={styles.editorTabActive}>
              <StatusIcon status={variation === "loops" ? "running" : variation === "graph" ? "waiting" : "running"} />
              <span>{variationMeta[variation].scenario}</span>
              <Codicon name="close" />
            </div>
            {variation === "sessions" && (
              <div className={styles.editorTab}>
                <Codicon name="split-horizontal" />
                {migrationWorkers.find((worker) => worker.id === comparisonWorker)?.title}
              </div>
            )}
            <IconButton name="add" label="New chat" />
          </div>

          {variation === "sessions" && (
            <SessionsVariation
              selectedWorker={selectedWorker}
              comparisonWorker={comparisonWorker}
              migrationResolved={migrationResolved}
              webResumed={webResumed}
              onCompare={setComparisonWorker}
              onResolve={() => {
                setMigrationResolved(true);
                notify("Conflict resolved; billing-core resumed");
              }}
              onResumeWeb={() => {
                setWebResumed(true);
                notify("web-client resumed; 7 completed steps skipped");
              }}
              onNotify={notify}
            />
          )}
          {variation === "graph" && (
            <GraphVariation
              selectedNode={selectedNode}
              verifyResumed={verifyResumed}
              approvalGranted={approvalGranted}
              onNode={setSelectedNode}
              onResumeVerify={() => {
                setVerifyResumed(true);
                setSelectedNode("approval");
                notify("Verification passed; product approval is now ready");
              }}
              onApprove={() => {
                setApprovalGranted(true);
                setSelectedNode("external");
                notify("Approved; Agent Host is waiting for CI");
              }}
              onNotify={notify}
            />
          )}
          {variation === "loops" && (
            <LoopsVariation
              selectedCycle={selectedCycle}
              schedulePaused={schedulePaused}
              ranNow={ranNow}
              scopeApproved={scopeApproved}
              onCycle={setSelectedCycle}
              onToggleSchedule={() => setSchedulePaused((value) => !value)}
              onRunNow={() => {
                setRanNow(true);
                setSelectedCycle("now");
                notify("New observation cycle started");
              }}
              onApproveScope={() => {
                setScopeApproved(true);
                notify("Scope approved; implementation session queued");
              }}
              onNotify={notify}
            />
          )}
        </section>

        <Inspector panel={sidePanel} onPanel={setSidePanel} variation={variation} selectedWorker={selectedWorker} />
      </div>

      <footer className={styles.statusBar}>
        <span><Codicon name="remote" /> Agent Host · localhost</span>
        <span><Codicon name="radio-tower" /> Run continues without this client</span>
        <span className={styles.statusSpacer} />
        <span><Codicon name="pulse" /> {variation === "loops" ? (schedulePaused ? "Schedule paused" : "Scheduled · every 12h") : "Live updates"}</span>
        <span><Codicon name="bell" /></span>
      </footer>

      {message && (
        <div className={styles.toast} role="status">
          <Codicon name="check" />
          {message}
        </div>
      )}
    </main>
  );
}

function SessionsSidebar({
  variation,
  expanded,
  selectedWorker,
  migrationResolved,
  webResumed,
  verifyResumed,
  schedulePaused,
  onToggle,
  onWorker,
}: {
  variation: Variation;
  expanded: boolean;
  selectedWorker: string;
  migrationResolved: boolean;
  webResumed: boolean;
  verifyResumed: boolean;
  schedulePaused: boolean;
  onToggle: () => void;
  onWorker: (id: string) => void;
}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <strong>Sessions</strong>
        <button className={styles.newButton}><Codicon name="add" /> New</button>
        <IconButton name="filter" label="Filter sessions" />
        <IconButton name="search" label="Search sessions" />
      </div>
      <div className={styles.sessionList}>
        <div className={styles.quickGroup}>
          <Codicon name="comment-discussion" />
          <span>Chats</span>
          <span className={styles.count}>2</span>
        </div>
        <WorkspaceLabel label="github/copilot-sdk" count="6" />

        {variation === "sessions" ? (
          <div className={styles.factoryTree}>
            <button className={styles.factoryParent} onClick={onToggle}>
              <Codicon name={expanded ? "chevron-down" : "chevron-right"} />
              <Codicon name="type-hierarchy-super" className={styles.factoryIcon} />
              <span>
                <strong>SDK 2.0 package migration</strong>
                <small>{migrationResolved ? "Factory run · 3/5 shards · converging" : "Factory run · 1 blocked · 31m"}</small>
              </span>
              <StatusIcon status={migrationResolved ? "running" : "waiting"} />
            </button>
            {expanded && (
              <div className={styles.workerTree}>
                {migrationWorkers.map((worker) => {
                  const status = worker.id === "billing" && migrationResolved
                    ? "running"
                    : worker.id === "web" && webResumed
                      ? "running"
                      : worker.status;
                  const meta = worker.id === "billing" && migrationResolved
                    ? "Converging shared client changes"
                    : worker.id === "web" && webResumed
                      ? "Resumed · 7 steps skipped"
                      : worker.meta;
                  return (
                    <button
                      key={worker.id}
                      className={`${styles.workerRow} ${selectedWorker === worker.id ? styles.workerSelected : ""}`}
                      onClick={() => onWorker(worker.id)}
                      aria-pressed={selectedWorker === worker.id}
                    >
                      <span className={styles.treeRail} />
                      <StatusIcon status={status} />
                      <span>
                        <strong>{worker.title}</strong>
                        <small>{meta}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {variation === "graph" && <SessionRow title="Repair PR #1842" status={verifyResumed ? "waiting" : "failed"} active />}
            <SessionRow title="Update SDK reference docs" status="completed" />
          </>
        )}

        <WorkspaceLabel label="microsoft/vscode" count="3" />
        {variation === "loops" && (
          <div className={styles.loopParent}>
            <Codicon name="sync" />
            <span>
              <strong>Issue triage-to-fix</strong>
              <small>{schedulePaused ? "Schedule paused · Agent Host" : "Every 12 hours · Agent Host"}</small>
            </span>
            <StatusIcon status={schedulePaused ? "waiting" : "running"} />
          </div>
        )}
        <SessionRow title="Agents window accessibility" status="completed" />
        <SessionRow title="Refine quick chat handoff" status="queued" />
      </div>
      <div className={styles.customizations}>
        <strong>Customizations</strong>
        <span><Codicon name="home" /> Overview</span>
        <span><Codicon name="hubot" /> Agents</span>
        <span><Codicon name="lightbulb" /> Skills</span>
        <span><Codicon name="clock" /> Automations</span>
      </div>
    </aside>
  );
}

function WorkspaceLabel({ label, count }: { label: string; count: string }) {
  return (
    <div className={styles.workspaceLabel}>
      <Codicon name="chevron-down" />
      <span>{label}</span>
      <small>{count}</small>
      <Codicon name="add" />
    </div>
  );
}

function SessionRow({
  title,
  status,
  active,
}: {
  title: string;
  status: RunStatus;
  active?: boolean;
}) {
  return (
    <button className={`${styles.sessionRow} ${active ? styles.sessionActive : ""}`}>
      <StatusIcon status={status} />
      <span>
        <strong>{title}</strong>
        <small>{status === "completed" ? "Yesterday" : status === "waiting" ? "Approval needed" : "12 mins ago"}</small>
      </span>
    </button>
  );
}

function SessionHeader({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: RunStatus;
}) {
  return (
    <header className={styles.sessionHeader}>
      <div>
        <span className={styles.headingStatus}><StatusIcon status={status} /></span>
        <span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
      </div>
      <div className={styles.sessionActions}>
        <IconButton name="ellipsis" label="More actions" />
      </div>
    </header>
  );
}

function SessionsVariation({
  selectedWorker,
  comparisonWorker,
  migrationResolved,
  webResumed,
  onCompare,
  onResolve,
  onResumeWeb,
  onNotify,
}: {
  selectedWorker: string;
  comparisonWorker: string;
  migrationResolved: boolean;
  webResumed: boolean;
  onCompare: (id: string) => void;
  onResolve: () => void;
  onResumeWeb: () => void;
  onNotify: (text: string) => void;
}) {
  const worker = migrationWorkers.find((item) => item.id === selectedWorker) ?? migrationWorkers[2];
  const compared = migrationWorkers.find((item) => item.id === comparisonWorker) ?? migrationWorkers[4];
  const workerStatus = worker.id === "billing" && migrationResolved
    ? "running"
    : worker.id === "web" && webResumed
      ? "running"
      : worker.status;
  const workerSummary: Record<string, string> = {
    auth: "Migration completed. Public API snapshots are unchanged and 92 package tests pass.",
    api: "Updating gateway imports and regenerating the typed API client.",
    billing: migrationResolved ? "Conflict ownership is resolved. This shard is converging against api-gateway." : "This shard is blocked until the shared client owner is chosen.",
    web: webResumed ? "Run resumed from the durable journal. Seven completed migration steps were skipped." : "The credit limit stopped this shard after seven durable steps.",
    verify: "Queued until all available migration shards converge.",
  };
  return (
    <div className={styles.splitSessions}>
      <article className={styles.sessionPane}>
        <SessionHeader title="SDK 2.0 package migration" subtitle="Factory run · run_7f2c · Agent Host" status="running" />
        <div className={styles.runSummary}>
          <div><span>Phase</span><strong>Converge</strong></div>
          <div><span>Workers</span><strong>{migrationResolved ? "3 active · 0 blocked" : "2 active · 1 blocked"}</strong></div>
          <div><span>Limits</span><strong>4 concurrent · 16 total</strong></div>
          <div><span>Credits</span><strong>12.4 / 20</strong></div>
        </div>
        <div className={styles.chatScroll}>
          <div className={styles.factoryUpdate}>
            <Codicon name="type-hierarchy-super" />
            <div>
              <strong>Factory coordinated 5 isolated worktrees</strong>
              <p>Completed shards remain journaled. Resuming a blocked shard will not repeat package discovery or completed migrations.</p>
            </div>
          </div>
          <div className={styles.phaseStrip}>
            <span className={styles.phaseDone}><Codicon name="check" /> Inventory</span>
            <span className={styles.phaseDone}><Codicon name="check" /> Shard</span>
            <span className={styles.phaseActive}><Codicon name="loading" spin /> Migrate</span>
            <span>Converge</span>
            <span>Verify</span>
          </div>
          {worker.id === "billing" && !migrationResolved && (
            <div className={styles.chatMessage}>
              <small>Factory · 9:27 PM</small>
              <p><strong>billing-core is blocked by a cross-shard conflict.</strong> Both billing-core and api-gateway modify <code>packages/shared/src/client.ts</code>. Choose an owner before convergence.</p>
              <div className={styles.inlineActions}>
                <button className={styles.primaryButton} onClick={onResolve}>Assign to api-gateway</button>
                <button className={styles.secondaryButton} onClick={() => onNotify("Opened the shared client conflict in Changes")}>Open conflict</button>
              </div>
            </div>
          )}
          <div className={styles.chatMessage}>
            <small>{worker.title} · selected worker</small>
            <p><strong>{workerSummary[worker.id]}</strong></p>
          </div>
          <WorkerFocus
            worker={worker}
            status={workerStatus}
            onCompare={() => onCompare(worker.id)}
            onResume={onResumeWeb}
          />
        </div>
        <PromptBar placeholder="Message the factory or selected worker" />
      </article>

      <article className={styles.sessionPane}>
        <SessionHeader title={compared.title} subtitle="Child session · isolated worktree" status={compared.status} />
        <div className={styles.verifierBody}>
          <div className={styles.verifierBadge}><Codicon name={compared.id === "verify" ? "shield" : "git-branch"} /></div>
          <h3>{compared.id === "verify" ? "Verification waits for convergence" : workerSummary[compared.id]}</h3>
          <p>{compared.id === "verify" ? "This child session has a separate role and context. It runs deterministic package tests after all unblocked shards merge." : "This is the selected child session's own chat and worktree, opened beside the factory parent."}</p>
          <div className={styles.checkList}>
            <span><Codicon name="check" /> Public API snapshot</span>
            <span><Codicon name="check" /> Package dependency graph</span>
            <span><Codicon name="circle-outline" /> 428 integration tests</span>
          </div>
          <button className={styles.secondaryButton} onClick={() => onNotify(`${compared.title} is active beside the factory`)}>
            Make active session
          </button>
        </div>
      </article>
    </div>
  );
}

function WorkerFocus({
  worker,
  status,
  onCompare,
  onResume,
}: {
  worker: (typeof migrationWorkers)[number];
  status: RunStatus;
  onCompare: () => void;
  onResume: () => void;
}) {
  return (
    <div className={styles.workerFocus}>
      <StatusIcon status={status} />
      <div>
        <small>Selected child session</small>
        <strong>{worker.title}</strong>
        <p>{worker.meta}</p>
      </div>
      {status === "failed" ? (
        <button className={styles.primaryButton} onClick={onResume}>
          <Codicon name="debug-rerun" /> Resume
        </button>
      ) : (
        <button className={styles.secondaryButton} onClick={onCompare}>Open beside parent</button>
      )}
    </div>
  );
}

function GraphVariation({
  selectedNode,
  verifyResumed,
  approvalGranted,
  onNode,
  onResumeVerify,
  onApprove,
  onNotify,
}: {
  selectedNode: string;
  verifyResumed: boolean;
  approvalGranted: boolean;
  onNode: (id: string) => void;
  onResumeVerify: () => void;
  onApprove: () => void;
  onNotify: (text: string) => void;
}) {
  const nodes = graphNodes.map((item) => {
    if (item.id === "verify") return { ...item, status: verifyResumed ? "completed" as const : "failed" as const };
    if (item.id === "approval") return { ...item, status: approvalGranted ? "completed" as const : verifyResumed ? "waiting" as const : "queued" as const };
    if (item.id === "external") return { ...item, status: approvalGranted ? "running" as const : "queued" as const };
    return item;
  });
  const node = nodes.find((item) => item.id === selectedNode) ?? nodes[3];
  const settled = verifyResumed ? (approvalGranted ? 5 : 4) : 3;
  const bannerStatus: RunStatus = approvalGranted ? "running" : verifyResumed ? "waiting" : "failed";
  return (
    <article className={styles.graphSession}>
      <SessionHeader title="Repair PR #1842" subtitle="PR repair factory · run_c91a · attempt 2" status={bannerStatus} />
      <div className={styles.factoryBanner}>
        <div>
          <StatusIcon status={bannerStatus} />
          <span>
            <strong>{approvalGranted ? "Waiting for required CI" : verifyResumed ? "Product approval required" : "Independent verification failed"}</strong>
            <small>{approvalGranted ? "Agent Host will resume when the external check settles." : verifyResumed ? "Telemetry behavior changed; product must approve before CI." : "Windows path validation failed. Three completed nodes remain durable."}</small>
          </span>
        </div>
        {!verifyResumed && <button className={styles.primaryButton} onClick={onResumeVerify}>Resume verifier</button>}
        {verifyResumed && !approvalGranted && <button className={styles.primaryButton} onClick={onApprove}>Review approval</button>}
      </div>
      <div className={styles.graphToolbar}>
        <div className={styles.progressText}><strong>{settled} of 6 nodes settled</strong><span>28m active · 1h 12m elapsed</span></div>
        <div className={styles.limitMeters}>
          <span><i style={{ width: "50%" }} />2 / 4 concurrent</span>
          <span><i style={{ width: "67%" }} />8 / 12 agents</span>
          <span><i style={{ width: "74%" }} />14.8 / 20 credits</span>
        </div>
      </div>
      <div className={styles.graphCanvas}>
        <svg className={styles.edges} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M12 49 L25 25 M12 49 L25 73 M37 25 L49 47 M37 73 L49 53 M61 50 L71 50 M82 50 L87 50" />
        </svg>
        {nodes.map((item) => (
          <button
            key={item.id}
            className={`${styles.graphNode} ${styles[`node_${item.status}`]} ${selectedNode === item.id ? styles.nodeSelected : ""}`}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onClick={() => onNode(item.id)}
            aria-pressed={selectedNode === item.id}
          >
            <StatusIcon status={item.status} />
            <span><strong>{item.label}</strong><small>{item.detail}</small></span>
          </button>
        ))}
      </div>
      <div className={styles.nodeDetail}>
        <div className={styles.nodeDetailTitle}>
          <StatusIcon status={node.status} />
          <span><small>Selected node</small><strong>{node.label}</strong></span>
        </div>
        <p>
          {node.id === "verify"
            ? verifyResumed ? "Windows path validation passed after resume. Linux and macOS results were restored from the durable journal." : "Verifier found a missing Windows path case. The failed attempt is retained and can resume after the fix without re-running Linux and macOS."
            : node.id === "approval"
              ? approvalGranted ? "Product approved the telemetry behavior change. The run advanced to the external CI wait." : "The patch changes telemetry collection behavior. Product sign-off is required before another CI cycle."
              : node.id === "external"
                ? approvalGranted ? "Agent Host is observing the required CI check. No client needs to remain connected." : "This external wait starts after verification and product approval settle."
                : "Open the owning child session for its transcript, workspace, changes, and terminal state."}
        </p>
        <div className={styles.nodeActions}>
          {node.status === "failed" && <button className={styles.primaryButton} onClick={onResumeVerify}>Resume node</button>}
          {node.status === "waiting" && <button className={styles.primaryButton} onClick={onApprove}>Approve gate</button>}
          {node.id !== "external" && <button className={styles.secondaryButton} onClick={() => onNotify(`${node.label} child session opened beside the run`)}>Open child session</button>}
          <button className={styles.secondaryButton} onClick={() => onNotify(`${node.label} activity log opened`)}><Codicon name="output" /> View log</button>
        </div>
      </div>
      <PromptBar placeholder="Ask about this run or change its limits" />
    </article>
  );
}

function LoopsVariation({
  selectedCycle,
  schedulePaused,
  ranNow,
  scopeApproved,
  onCycle,
  onToggleSchedule,
  onRunNow,
  onApproveScope,
  onNotify,
}: {
  selectedCycle: string;
  schedulePaused: boolean;
  ranNow: boolean;
  scopeApproved: boolean;
  onCycle: (id: string) => void;
  onToggleSchedule: () => void;
  onRunNow: () => void;
  onApproveScope: () => void;
  onNotify: (text: string) => void;
}) {
  const visibleCycles = ranNow
    ? [
        { id: "now", date: "Just now", status: "running" as const, found: "Observing new issues" },
        ...cycles.map((item) => item.id === "sep10" ? { ...item, status: "completed" as const, found: "6 found · 2 ready" } : item),
      ]
    : cycles;
  const cycle = visibleCycles.find((item) => item.id === selectedCycle) ?? visibleCycles[0];
  const historical = cycle.id !== "sep10" && cycle.id !== "now";
  return (
    <article className={styles.loopSession}>
      <SessionHeader title="Issue triage-to-fix" subtitle="Recurring factory · owned by Agent Host" status={schedulePaused ? "waiting" : "running"} />
      <div className={styles.loopHero}>
        <div className={styles.nextTrigger}>
          <Codicon name="clock" />
          <span>
            <small>{schedulePaused ? "Schedule" : "Next trigger"}</small>
            <strong>{schedulePaused ? "Paused" : "Today at 9:00 AM"}</strong>
            <em>{schedulePaused ? "Existing implementation sessions continue" : "Every 12 hours · Agent Host"}</em>
          </span>
        </div>
        <div className={styles.loopControls}>
          <button className={styles.primaryButton} onClick={onRunNow}>
            <Codicon name="run-all" /> Run now
          </button>
          <button className={styles.secondaryButton} onClick={onToggleSchedule}>{schedulePaused ? "Resume schedule" : "Pause schedule"}</button>
        </div>
      </div>
      <div className={styles.loopBody}>
        <aside className={styles.cycleHistory}>
          <div className={styles.sectionHeading}><strong>Cycle history</strong><span>18 cycles</span></div>
          {visibleCycles.map((item) => (
            <button
              key={item.id}
              className={selectedCycle === item.id ? styles.cycleSelected : ""}
              onClick={() => onCycle(item.id)}
              aria-pressed={selectedCycle === item.id}
            >
              <StatusIcon status={item.status} />
              <span><strong>{item.date}</strong><small>{item.found}</small></span>
            </button>
          ))}
        </aside>
        <section className={styles.discoveredWork}>
          <div className={styles.sectionHeading}>
            <span><strong>{cycle.date}</strong><small>{historical ? "Historical cycle · read-only" : "Current observation cycle"}</small></span>
            <span className={styles.limitLabel}>{cycle.found}</span>
          </div>
          {cycle.status === "failed" ? (
            <div className={styles.limitReached}>
              <StatusIcon status="failed" />
              <div><strong>Cycle stopped at its 12-credit limit</strong><p>Five issues were classified and journaled. Seven remain ready to inspect after the limit changes.</p></div>
              <button className={styles.primaryButton} onClick={() => onNotify("Limit review opened; completed classifications will be preserved")}>Review and resume</button>
            </div>
          ) : historical ? (
            <>
              <WorkItem icon="pass-filled" title="Tree view keyboard navigation" issue="#280994" status="completed" detail="Fixed in child session" action="View result" onAction={() => onNotify("Completed implementation result opened")} />
              <WorkItem icon="issues" title="Clarify tunnel reconnect message" issue="#280981" status="completed" detail="Triaged · ready for contributor" action="Open issue" onAction={() => onNotify("Issue opened")} />
            </>
          ) : (
            <>
              <WorkItem icon="bug" title="Terminal loses focus after agent approval" issue="#281044" status="running" detail="Implementation session · worktree" action="Open session" onAction={() => onNotify("Implementation child session opened")} />
              <WorkItem icon="warning" title="Remote tunnel auth regression" issue="#281039" status={scopeApproved ? "queued" : "waiting"} detail={scopeApproved ? "Approved · implementation queued" : "High impact · product approval"} action={scopeApproved ? "Open session" : "Review scope"} onAction={scopeApproved ? () => onNotify("Queued implementation session opened") : onApproveScope} />
              <WorkItem icon="issues" title="Improve empty Chats group copy" issue="#281021" status="completed" detail="Classified as good first issue" action="View result" onAction={() => onNotify("Classification result opened")} />
              <WorkItem icon="circle-slash" title="Crash report lacks reproduction" issue="#281017" status="queued" detail="Waiting for reporter response" action="Open issue" onAction={() => onNotify("Issue opened in GitHub")} />
            </>
          )}
          <div className={styles.cycleJournal}>
            <Codicon name="book" />
            <p><strong>Cycle journal retained</strong><br />The observer remembers classifications and prior approvals, but each implementation run gets its own bounded child session and worktree.</p>
          </div>
        </section>
      </div>
    </article>
  );
}

function WorkItem({
  icon,
  title,
  issue,
  status,
  detail,
  action,
  onAction,
}: {
  icon: string;
  title: string;
  issue: string;
  status: RunStatus;
  detail: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <div className={styles.workItem}>
      <Codicon name={icon} />
      <div>
        <strong>{title}</strong>
        <small>{issue} · {detail}</small>
      </div>
      <span className={styles.workStatus}><StatusIcon status={status} />{status === "waiting" ? "Approval" : status}</span>
      <button className={styles.secondaryButton} onClick={onAction}>{action}</button>
    </div>
  );
}

function PromptBar({ placeholder }: { placeholder: string }) {
  return (
    <div className={styles.promptBar}>
      <span>{placeholder}</span>
      <div>
        <Codicon name="add" />
        <Codicon name="hubot" /> Agent
        <Codicon name="shield" /> Default permissions
        <button aria-label="Send message"><Codicon name="arrow-up" /></button>
      </div>
    </div>
  );
}

function Inspector({
  panel,
  onPanel,
  variation,
  selectedWorker,
}: {
  panel: SidePanel;
  onPanel: (panel: SidePanel) => void;
  variation: Variation;
  selectedWorker: string;
}) {
  const [selectedFile, setSelectedFile] = useState(0);
  const workerFiles: Record<string, string[]> = {
    auth: ["packages/auth/src/session.ts", "packages/auth/src/session.test.ts"],
    api: ["packages/api/src/router.ts", "packages/shared/src/client.ts"],
    billing: ["packages/shared/src/client.ts", "packages/billing/src/index.ts"],
    web: ["packages/web/src/copilot.ts", "packages/web/src/copilot.test.ts"],
    verify: ["reports/sdk-migration.md", "reports/api-snapshot.json"],
  };
  const changeFiles = variation === "sessions"
    ? workerFiles[selectedWorker]
    : variation === "graph"
      ? ["src/telemetry/collector.ts", "src/telemetry/collector.test.ts", ".github/workflows/ci.yml"]
      : ["src/vs/workbench/contrib/chat/browser/chatList.ts", "src/vs/workbench/contrib/chat/test/chatList.test.ts"];
  const workspaceName = variation === "loops" ? "microsoft/vscode" : "github/copilot-sdk";
  const additions = changeFiles.reduce((total, _, index) => total + (index === 0 ? 47 : 18), 0);
  const deletions = changeFiles.reduce((total, _, index) => total + (index === 0 ? 9 : 3), 0);
  return (
    <aside className={styles.inspector}>
      <div className={styles.inspectorTabs}>
        <button className={panel === "changes" ? styles.inspectorActive : ""} onClick={() => onPanel("changes")}>
          <Codicon name="diff" /> Changes
        </button>
        <button className={panel === "files" ? styles.inspectorActive : ""} onClick={() => onPanel("files")}>
          <Codicon name="files" /> Files
        </button>
        <IconButton name="add" label="Add view" />
      </div>
      {panel === "changes" ? (
        <>
          <div className={styles.inspectorHeader}>
            <span>All Changes <Codicon name="chevron-down" /></span>
            <span className={styles.diffStats}>{changeFiles.length} files <b>+{additions}</b> <i>−{deletions}</i></span>
          </div>
          <div className={styles.fileList}>
            {changeFiles.map((file, index) => (
              <button key={file} className={index === selectedFile ? styles.fileActive : ""} onClick={() => setSelectedFile(index)}>
                <Codicon name={index === 0 ? "chevron-down" : "chevron-right"} />
                <Codicon name={file.endsWith(".yml") ? "file-code" : "symbol-file"} />
                <span>{file}</span>
                <b>+{index === 0 ? 47 : 18}</b>
                <i>−{index === 0 ? 9 : 3}</i>
              </button>
            ))}
          </div>
          <div className={styles.diffPreview}>
            <div><span>1</span><code>export async function runFactory(</code></div>
            <div className={styles.diffAdded}><span>2</span><code>  context: DurableRunContext,</code></div>
            <div className={styles.diffAdded}><span>3</span><code>  signal: AbortSignal,</code></div>
            <div><span>4</span><code>{`) {`}</code></div>
            <div className={styles.diffRemoved}><span>5</span><code>  return startLegacyTask();</code></div>
            <div className={styles.diffAdded}><span>5</span><code>  return context.resume();</code></div>
          </div>
        </>
      ) : (
        <div className={styles.filesTree}>
          <span><Codicon name="chevron-down" /><Codicon name="folder-opened" /> {workspaceName}</span>
          <span className={styles.treeIndent}><Codicon name="chevron-down" /><Codicon name="folder" /> packages</span>
          <span className={styles.treeIndent2}><Codicon name="chevron-right" /><Codicon name="folder" /> agent-runtime</span>
          <span className={styles.treeIndent2}><Codicon name="chevron-right" /><Codicon name="folder" /> sdk</span>
          <span className={styles.treeIndent}><Codicon name="chevron-right" /><Codicon name="folder" /> tests</span>
          <span className={styles.treeIndent}><Codicon name="json" /> package.json</span>
        </div>
      )}
    </aside>
  );
}
