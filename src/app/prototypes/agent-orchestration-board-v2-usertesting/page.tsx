"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type AgentStatus = "queued" | "ready" | "running" | "needs-input" | "completed" | "reviewing";

interface LogEntry {
  time: string;
  text: string;
  type: "info" | "action" | "output" | "success" | "warning";
}

interface FileChange {
  file: string;
  additions: number;
  deletions: number;
}

interface InputPrompt {
  prompt: string;
  context: string;
  options: { label: string; description: string; recommended?: boolean }[];
}

interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: AgentStatus;
  progress: number;
  dependencies: string[];
  phase: number;
  inputPrompts: InputPrompt[];
  currentInputIdx: number;
  completedAt?: number;
  startedAt?: number;
  elapsed?: number;
  logs: LogEntry[];
  fileChanges?: FileChange[];
  summary?: string;
  model?: string;
  tokens?: number;
  reviewed?: boolean;
  selectedOptions?: string[];
}

const PHASES = [
  { id: 0, label: "Discovery", icon: "search" },
  { id: 1, label: "Planning", icon: "list-tree" },
  { id: 2, label: "Implementation", icon: "code" },
  { id: 3, label: "Verification", icon: "shield" },
  { id: 4, label: "Deployment", icon: "rocket" },
];

const INITIAL_AGENTS: Agent[] = [
  {
    id: "research",
    name: "Research Agent",
    icon: "search",
    description: "Analyzing current payment infrastructure, mapping API surfaces, and evaluating Stripe integration patterns",
    status: "queued",
    progress: 0,
    dependencies: [],
    phase: 0,
    currentInputIdx: 0,
    inputPrompts: [
      {
        prompt: "Which payment providers should we evaluate alongside Stripe?",
        context: "Currently using PayPal Legacy SDK (v2.1). The team has expressed interest in evaluating alternatives before committing.",
        options: [
          { label: "Stripe only", description: "Focus research on Stripe — team already aligned", recommended: true },
          { label: "Stripe + Adyen", description: "Evaluate Adyen as backup for enterprise clients" },
          { label: "Full comparison", description: "Stripe vs Adyen vs Square — comprehensive but slower" },
        ],
      },
    ],
    logs: [],
    model: "GPT-4o",
    tokens: 0,
  },
  {
    id: "architect",
    name: "Architect Agent",
    icon: "list-tree",
    description: "Designing migration plan with rollback strategy, feature flags, and zero-downtime deployment sequence",
    status: "queued",
    progress: 0,
    dependencies: ["research"],
    phase: 1,
    currentInputIdx: 0,
    inputPrompts: [
      {
        prompt: "Choose migration strategy for existing subscriptions",
        context: "Found 2,847 active subscriptions on the legacy system. Migration approach affects billing continuity and customer experience.",
        options: [
          { label: "Bulk migrate", description: "Move all in one batch during maintenance window (faster, higher risk)" },
          { label: "Rolling migration", description: "Migrate at renewal time over 30 days (slower, zero disruption)", recommended: true },
          { label: "Shadow + cutover", description: "Run both in parallel for 7 days, then cut over (safest, most expensive)" },
        ],
      },
      {
        prompt: "Feature flag granularity for the rollout?",
        context: "Feature flags control who sees the new payment system. Granularity affects how targeted you can be with the rollout.",
        options: [
          { label: "Per-tenant", description: "Enable Stripe per organization — simple but coarse" },
          { label: "Per-user", description: "Enable per individual user — fine control, more complexity", recommended: true },
          { label: "Percentage rollout", description: "Random 1% → 5% → 25% → 100% — standard but less targeted" },
        ],
      },
    ],
    logs: [],
    model: "Claude Opus",
    tokens: 0,
  },
  {
    id: "schema",
    name: "Schema Agent",
    icon: "database",
    description: "Generating database migrations for payment_methods, subscriptions, and webhook_events tables",
    status: "queued",
    progress: 0,
    dependencies: ["architect"],
    phase: 2,
    currentInputIdx: 0,
    inputPrompts: [
      {
        prompt: "How should we handle the legacy payment_transactions table?",
        context: "The existing table has 4.2M rows of historical data. New Stripe tables have a different schema.",
        options: [
          { label: "Keep as-is", description: "Legacy table stays read-only, new data goes to Stripe tables", recommended: true },
          { label: "Migrate data", description: "ETL historical records into new schema (complex, 2-3 hour migration)" },
          { label: "Archive + fresh start", description: "Move to cold storage, start clean (simplest but loses quick access)" },
        ],
      },
    ],
    logs: [],
    model: "GPT-4o",
    tokens: 0,
  },
  {
    id: "backend",
    name: "Backend Agent",
    icon: "code",
    description: "Implementing Stripe SDK integration, webhook handlers, and payment processing service layer",
    status: "queued",
    progress: 0,
    dependencies: ["architect"],
    phase: 2,
    currentInputIdx: 0,
    inputPrompts: [
      {
        prompt: "Webhook delivery guarantee strategy?",
        context: "Stripe webhooks can be delivered multiple times. We need to handle idempotency and ordering.",
        options: [
          { label: "Idempotency keys", description: "Store processed event IDs, skip duplicates (standard)", recommended: true },
          { label: "Event sourcing", description: "Full event log with replay capability (robust but over-engineered)" },
          { label: "At-least-once + dedup", description: "Accept duplicates, deduplicate at processing layer" },
        ],
      },
    ],
    logs: [],
    model: "Claude Opus",
    tokens: 0,
  },
  {
    id: "frontend",
    name: "Frontend Agent",
    icon: "browser",
    description: "Building Stripe Elements checkout flow, payment method management UI, and billing portal",
    status: "queued",
    progress: 0,
    dependencies: ["backend"],
    phase: 2,
    currentInputIdx: 0,
    inputPrompts: [
      {
        prompt: "Checkout UX pattern?",
        context: "Stripe offers multiple integration options with different user experiences.",
        options: [
          { label: "Embedded Elements", description: "Inline form within our UI — seamless but more work", recommended: true },
          { label: "Stripe Checkout", description: "Redirect to hosted Stripe page — quick but less branded" },
          { label: "Custom form + Tokens", description: "Full custom UI with tokenization — most control, PCI implications" },
        ],
      },
    ],
    logs: [],
    model: "GPT-4o",
    tokens: 0,
  },
  {
    id: "testing",
    name: "Testing Agent",
    icon: "beaker",
    description: "Writing integration tests for payment flows, webhook handling, and edge cases with Stripe test mode",
    status: "queued",
    progress: 0,
    dependencies: ["backend", "schema"],
    phase: 3,
    currentInputIdx: 0,
    inputPrompts: [
      {
        prompt: "Test coverage threshold for launch approval?",
        context: "Current codebase has 72% coverage. Payment code is critical infrastructure.",
        options: [
          { label: "90% coverage", description: "High bar — thorough but may slow delivery", recommended: true },
          { label: "80% coverage", description: "Balanced — covers critical paths, pragmatic" },
          { label: "Critical paths only", description: "Test happy paths + known edge cases, ship faster" },
        ],
      },
    ],
    logs: [],
    model: "GPT-4o",
    tokens: 0,
  },
  {
    id: "security",
    name: "Security Agent",
    icon: "shield",
    description: "Auditing PCI compliance, secret management, token handling, and data encryption at rest",
    status: "queued",
    progress: 0,
    dependencies: ["backend", "frontend"],
    phase: 3,
    currentInputIdx: 0,
    inputPrompts: [
      {
        prompt: "Approve elevated access for PCI compliance scan",
        context: "The security audit needs read access to production secret store and payment logs to verify no sensitive data exposure.",
        options: [
          { label: "Grant read-only access", description: "Allow access to vault and payment logs for this audit", recommended: true },
          { label: "Staging only", description: "Run audit against staging environment (may miss prod-specific issues)" },
          { label: "Request exception", description: "Skip production scan, document risk acceptance" },
        ],
      },
    ],
    logs: [],
    model: "Claude Opus",
    tokens: 0,
  },
  {
    id: "deploy",
    name: "Deploy Agent",
    icon: "rocket",
    description: "Orchestrating staged rollout with feature flags, canary deployment, and automated rollback triggers",
    status: "queued",
    progress: 0,
    dependencies: ["testing", "security"],
    phase: 4,
    currentInputIdx: 0,
    inputPrompts: [
      {
        prompt: "Ready to deploy — confirm rollout plan",
        context: "All tests passing (12/12). Security audit clean. No blockers.",
        options: [
          { label: "Deploy now", description: "Begin Phase 1 shadow mode deployment immediately" },
          { label: "Schedule 2 AM UTC", description: "Deploy during low-traffic window tonight", recommended: true },
          { label: "Hold for review", description: "Block deployment, request additional team review" },
        ],
      },
      {
        prompt: "Canary rollout percentage for Phase 2?",
        context: "Shadow mode completed with 0 errors across 1,247 transactions. Ready to route real traffic.",
        options: [
          { label: "1% canary", description: "Ultra-conservative — ~50 transactions/hour" },
          { label: "5% canary", description: "Standard approach — ~250 transactions/hour", recommended: true },
          { label: "10% canary", description: "Aggressive — ~500 transactions/hour, faster validation" },
        ],
      },
    ],
    logs: [],
    model: "GPT-4o",
    tokens: 0,
  },
];

const AGENT_LOGS: Record<string, LogEntry[]> = {
  research: [
    { time: "0:02", text: "Scanning codebase for payment-related modules...", type: "info" },
    { time: "0:05", text: "Found 23 files in src/payments/ using legacy PayPal SDK", type: "output" },
    { time: "0:08", text: "Mapping API surface: 4 endpoints, 3 webhooks, 2 cron jobs", type: "output" },
    { time: "0:12", text: "Analyzing Stripe API docs for equivalent patterns", type: "action" },
    { time: "0:18", text: "Identified migration path: PaymentIntents → Stripe PaymentIntents", type: "output" },
    { time: "0:22", text: "Risk assessment: 2 breaking changes in subscription billing", type: "warning" },
    { time: "0:25", text: "Research complete — generated compatibility matrix", type: "success" },
  ],
  architect: [
    { time: "0:26", text: "Reading research output and dependency graph...", type: "info" },
    { time: "0:30", text: "Designing adapter pattern for payment provider abstraction", type: "action" },
    { time: "0:35", text: "Planning 3-phase rollout: shadow → canary → cutover", type: "output" },
    { time: "0:40", text: "Defining feature flag: stripe_payments_enabled", type: "output" },
    { time: "0:44", text: "Creating rollback trigger: error rate > 2% → revert", type: "output" },
    { time: "0:48", text: "Architecture plan finalized — 14 tasks", type: "success" },
  ],
  schema: [
    { time: "0:49", text: "Generating migration: 20260622_add_stripe_tables.sql", type: "action" },
    { time: "0:52", text: "CREATE TABLE stripe_customers (id, user_id, stripe_id...)", type: "output" },
    { time: "0:54", text: "CREATE TABLE payment_methods (id, stripe_pm_id, type...)", type: "output" },
    { time: "0:56", text: "ALTER TABLE subscriptions ADD stripe_subscription_id", type: "output" },
    { time: "0:58", text: "CREATE TABLE webhook_events (id, stripe_event_id...)", type: "output" },
    { time: "1:01", text: "Adding indexes for stripe_id lookups", type: "action" },
    { time: "1:04", text: "Migration validated — no data loss, reversible", type: "success" },
  ],
  backend: [
    { time: "0:49", text: "Installing stripe@14.x SDK and configuring client", type: "action" },
    { time: "0:53", text: "Implementing StripePaymentService extends PaymentProvider", type: "output" },
    { time: "0:58", text: "Building webhook handler: /api/webhooks/stripe", type: "output" },
    { time: "1:03", text: "Handling: payment_intent.succeeded, invoice.paid...", type: "output" },
    { time: "1:08", text: "Implementing customer portal session creation", type: "output" },
    { time: "1:12", text: "Adding idempotency keys for mutating operations", type: "action" },
    { time: "1:16", text: "Writing retry logic with exponential backoff", type: "output" },
    { time: "1:20", text: "Backend complete — 8 files changed", type: "success" },
  ],
  frontend: [
    { time: "1:21", text: "Installing @stripe/react-stripe-js and elements", type: "action" },
    { time: "1:25", text: "Building <CheckoutForm /> with PaymentElement", type: "output" },
    { time: "1:30", text: "Implementing payment method management", type: "output" },
    { time: "1:35", text: "Adding loading states, error handling, retry UX", type: "output" },
    { time: "1:39", text: "Creating billing history with invoice downloads", type: "output" },
    { time: "1:43", text: "Frontend complete — responsive and accessible", type: "success" },
  ],
  testing: [
    { time: "1:21", text: "Setting up Stripe test mode with fixtures", type: "action" },
    { time: "1:25", text: "Test: successful one-time payment flow", type: "output" },
    { time: "1:28", text: "Test: subscription upgrade/downgrade", type: "output" },
    { time: "1:31", text: "Test: webhook signature verification", type: "output" },
    { time: "1:34", text: "Test: failed payment → retry → success", type: "output" },
    { time: "1:37", text: "Test: concurrent payment race condition", type: "output" },
    { time: "1:40", text: "All 12 integration tests passing ✓", type: "success" },
  ],
  security: [
    { time: "1:44", text: "Scanning for PCI DSS compliance requirements...", type: "info" },
    { time: "1:48", text: "Verifying: no raw card numbers stored", type: "output" },
    { time: "1:51", text: "Checking webhook signature validation", type: "action" },
    { time: "1:54", text: "Auditing secret storage: STRIPE_SECRET_KEY in vault ✓", type: "output" },
    { time: "1:57", text: "Scanning for exposed keys in git history...", type: "action" },
    { time: "2:00", text: "Verifying TLS 1.2+ enforcement", type: "output" },
    { time: "2:03", text: "Security audit passed — no critical findings", type: "success" },
  ],
  deploy: [
    { time: "2:10", text: "Preparing deployment manifest for staged rollout", type: "action" },
    { time: "2:14", text: "Phase 1: Shadow mode (dual-write, compare)", type: "output" },
    { time: "2:17", text: "Phase 2: Canary 5% → monitor error rates", type: "output" },
    { time: "2:20", text: "Phase 3: Full cutover, old system on standby", type: "output" },
    { time: "2:23", text: "Configuring rollback trigger (error rate > 2%)", type: "action" },
    { time: "2:26", text: "Deployment plan ready — awaiting execution", type: "success" },
  ],
};

const AGENT_FILE_CHANGES: Record<string, FileChange[]> = {
  schema: [
    { file: "migrations/20260622_add_stripe_tables.sql", additions: 87, deletions: 0 },
    { file: "src/models/stripe_customer.ts", additions: 34, deletions: 0 },
    { file: "src/models/payment_method.ts", additions: 28, deletions: 0 },
    { file: "src/models/webhook_event.ts", additions: 22, deletions: 0 },
  ],
  backend: [
    { file: "src/services/stripe-payment.service.ts", additions: 186, deletions: 0 },
    { file: "src/controllers/webhooks.controller.ts", additions: 94, deletions: 0 },
    { file: "src/controllers/payments.controller.ts", additions: 67, deletions: 12 },
    { file: "src/middleware/stripe-signature.ts", additions: 32, deletions: 0 },
    { file: "src/config/stripe.ts", additions: 18, deletions: 0 },
    { file: "src/services/payment-provider.interface.ts", additions: 24, deletions: 0 },
    { file: "src/utils/retry.ts", additions: 41, deletions: 0 },
    { file: "package.json", additions: 2, deletions: 0 },
  ],
  frontend: [
    { file: "src/components/CheckoutForm.tsx", additions: 112, deletions: 0 },
    { file: "src/components/PaymentMethods.tsx", additions: 89, deletions: 0 },
    { file: "src/components/BillingHistory.tsx", additions: 67, deletions: 0 },
    { file: "src/pages/billing.tsx", additions: 45, deletions: 8 },
    { file: "src/hooks/useStripe.ts", additions: 34, deletions: 0 },
  ],
  testing: [
    { file: "tests/integration/payments.test.ts", additions: 234, deletions: 0 },
    { file: "tests/fixtures/stripe-webhooks.json", additions: 156, deletions: 0 },
    { file: "tests/helpers/stripe-mock.ts", additions: 67, deletions: 0 },
  ],
};

const AGENT_SUMMARIES: Record<string, string> = {
  research: "Mapped 23 payment files, 4 API endpoints, 3 webhooks. Stripe migration path identified with 2 breaking changes in billing logic.",
  architect: "3-phase rollout plan: shadow → canary (5%) → full cutover. Feature flag per-tenant. Auto-rollback at 2% error rate.",
  schema: "4 new tables, 1 altered table. All migrations reversible. Zero data loss guaranteed.",
  backend: "8 files changed (+464/-12 lines). Stripe SDK integrated with idempotency, retries, and webhook handling.",
  frontend: "5 components built. Stripe Elements checkout, payment management, billing history. Responsive + accessible.",
  testing: "12 integration tests covering happy paths, edge cases, and race conditions. All passing.",
  security: "PCI DSS Level 1 compliant. No raw card data stored. Secrets in vault. TLS 1.2+ enforced.",
  deploy: "Staged rollout configured. Shadow mode → 5% canary → full cutover. Auto-rollback ready.",
};

const COLUMNS: { key: AgentStatus; label: string; color: string; icon: string }[] = [
  { key: "queued", label: "Queued", color: "var(--muted)", icon: "circle-outline" },
  { key: "running", label: "Running", color: "var(--accent)", icon: "loading" },
  { key: "needs-input", label: "Needs Input", color: "var(--warning)", icon: "bell" },
  { key: "completed", label: "Completed", color: "var(--success)", icon: "check" },
];

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return `${n}`;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function AgentOrchestrationBoardV2Page() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [missionTime, setMissionTime] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [missionStarted, setMissionStarted] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logIndexRef = useRef<Record<string, number>>({});

  const handleCardEnter = useCallback((agentId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredAgent(agentId);
  }, []);

  const handleCardLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredAgent(null);
      hoverTimeoutRef.current = null;
    }, 120);
  }, []);

  const allCompleted = agents.every((a) => a.status === "completed");
  const needsInputCount = agents.filter((a) => a.status === "needs-input").length;
  const reviewingCount = agents.filter((a) => a.status === "reviewing").length;
  const readyCount = agents.filter((a) => a.status === "ready").length;

  const depsReady = useCallback(
    (agent: Agent, agentList: Agent[]) => {
      return agent.dependencies.every((depId) => {
        const dep = agentList.find((a) => a.id === depId);
        return dep?.status === "completed" && dep?.reviewed;
      });
    },
    []
  );

  // Mark agents as "ready" when dependencies are met + reviewed
  useEffect(() => {
    if (!missionStarted) return;
    setAgents((prev) => {
      let changed = false;
      const next = prev.map((a) => {
        if (a.status === "queued" && depsReady(a, prev)) {
          changed = true;
          return { ...a, status: "ready" as AgentStatus };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [agents, missionStarted, depsReady]);

  // Simulation tick - only advances running agents
  useEffect(() => {
    const anyRunning = agents.some((a) => a.status === "running");
    if (!anyRunning) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }

    tickRef.current = setInterval(() => {
      const now = Date.now();
      setMissionTime(now - startTimeRef.current);

      setAgents((prev) => {
        const next = prev.map((a) => ({ ...a, logs: [...a.logs] }));
        let tokenDelta = 0;

        for (const agent of next) {
          if (agent.status === "running") {
            agent.elapsed = now - (agent.startedAt ?? now);
            const speed = 1.0 + Math.random() * 1.5;
            agent.progress = Math.min(100, agent.progress + speed);

            const tokenIncrement = Math.floor(Math.random() * 150 + 30);
            agent.tokens = (agent.tokens ?? 0) + tokenIncrement;
            tokenDelta += tokenIncrement;

            // Trigger input prompts at progress thresholds
            const inputTrigger = 45 + agent.currentInputIdx * 25;
            if (agent.inputPrompts.length > agent.currentInputIdx && agent.progress >= inputTrigger && agent.progress < inputTrigger + 5) {
              agent.status = "needs-input";
              agent.progress = inputTrigger;
            }

            // Stream logs
            const agentLogs = AGENT_LOGS[agent.id] ?? [];
            const currentIdx = logIndexRef.current[agent.id] ?? 0;
            const logThreshold = (agent.progress / 100) * agentLogs.length;
            if (currentIdx < logThreshold && currentIdx < agentLogs.length) {
              agent.logs.push(agentLogs[currentIdx]);
              logIndexRef.current[agent.id] = currentIdx + 1;
            }

            if (agent.progress >= 100) {
              agent.status = "reviewing";
              agent.progress = 100;
              agent.completedAt = now;
              agent.fileChanges = AGENT_FILE_CHANGES[agent.id];
              agent.summary = AGENT_SUMMARIES[agent.id];
              const remainingLogs = AGENT_LOGS[agent.id]?.slice(logIndexRef.current[agent.id] ?? 0) ?? [];
              agent.logs.push(...remainingLogs);
            }
          }
        }

        setTotalTokens((t) => t + tokenDelta);
        return next;
      });
    }, 200);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [agents]);

  function startMission() {
    const initial = INITIAL_AGENTS.map((a) => ({ ...a, logs: [], selectedOptions: [] as string[] }));
    const withReady = initial.map((a) =>
      a.dependencies.length === 0 ? { ...a, status: "ready" as AgentStatus } : a
    );
    setAgents(withReady);
    setMissionTime(0);
    setTotalTokens(0);
    setMissionStarted(true);
    startTimeRef.current = Date.now();
    logIndexRef.current = {};
    setIsRunning(true);
    setSelectedAgent(null);
  }

  function kickoffAgent(agentId: string) {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId && a.status === "ready"
          ? { ...a, status: "running" as AgentStatus, startedAt: Date.now(), progress: 0 }
          : a
      )
    );
    setSelectedAgent(agentId);
  }

  function resolveInput(agentId: string, optionLabel: string) {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a;
        const newIdx = a.currentInputIdx + 1;
        return {
          ...a,
          status: "running" as AgentStatus,
          currentInputIdx: newIdx,
          progress: a.progress + 5,
          selectedOptions: [...(a.selectedOptions ?? []), optionLabel],
        };
      })
    );
  }

  function reviewAgent(agentId: string) {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId && a.status === "reviewing"
          ? { ...a, status: "completed" as AgentStatus, reviewed: true }
          : a
      )
    );
  }

  function getDependencyNames(agent: Agent): string[] {
    return agent.dependencies
      .map((depId) => agents.find((a) => a.id === depId)?.name)
      .filter(Boolean) as string[];
  }

  function getDependents(agentId: string): string[] {
    return agents
      .filter((a) => a.dependencies.includes(agentId))
      .map((a) => a.name);
  }

  const selectedAgentData = selectedAgent ? agents.find((a) => a.id === selectedAgent) : null;

  const hoveredDeps = hoveredAgent
    ? agents.find((a) => a.id === hoveredAgent)?.dependencies ?? []
    : [];
  const hoveredDependents = hoveredAgent
    ? agents.filter((a) => a.dependencies.includes(hoveredAgent)).map((a) => a.id)
    : [];

  const completedCount = agents.filter((a) => a.status === "completed").length;

  function getColumnAgents(colKey: AgentStatus) {
    if (colKey === "queued") return agents.filter((a) => a.status === "queued" || a.status === "ready");
    if (colKey === "completed") return agents.filter((a) => a.status === "completed" || a.status === "reviewing");
    return agents.filter((a) => a.status === colKey);
  }

  return (
    <div className={styles.board}>
      {/* Mission header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.missionTitle}>
            <Codicon name="rocket" className={styles.missionIcon} />
            <span>Migrate Payments to Stripe</span>
            {isRunning && agents.some((a) => a.status === "running") && (
              <span className={styles.liveTag}>
                <span className={styles.liveDot} />
                Live
              </span>
            )}
          </div>
          <div className={styles.missionMeta}>
            {missionStarted && (
              <>
                <span className={styles.metaItem}>
                  <Codicon name="check" />
                  {completedCount}/{agents.length} complete
                </span>
                {missionTime > 0 && (
                  <span className={styles.metaItem}>
                    <Codicon name="clock" />
                    {formatElapsed(missionTime)}
                  </span>
                )}
                {totalTokens > 0 && (
                  <span className={styles.metaItem}>
                    <Codicon name="pulse" />
                    {formatTokens(totalTokens)} tokens
                  </span>
                )}
                {readyCount > 0 && (
                  <span className={`${styles.metaItem} ${styles.metaReady}`}>
                    <Codicon name="play-circle" />
                    {readyCount} ready to start
                  </span>
                )}
                {needsInputCount > 0 && (
                  <span className={`${styles.metaItem} ${styles.metaWarning}`}>
                    <Codicon name="bell" />
                    {needsInputCount} awaiting input
                  </span>
                )}
                {reviewingCount > 0 && (
                  <span className={`${styles.metaItem} ${styles.metaReview}`}>
                    <Codicon name="eye" />
                    {reviewingCount} awaiting review
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        <div className={styles.headerRight}>
          {!missionStarted && (
            <button className={styles.startButton} onClick={startMission}>
              <Codicon name="play" />
              <span>Start Mission</span>
            </button>
          )}
          {allCompleted && (
            <button className={styles.secondaryButton} onClick={startMission}>
              <Codicon name="debug-restart" />
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* Phase indicator */}
      {missionStarted && (
        <div className={styles.phaseBar}>
          {PHASES.map((phase) => {
            const phaseAgents = agents.filter((a) => a.phase === phase.id);
            const phaseComplete = phaseAgents.every((a) => a.status === "completed");
            const phaseActive = phaseAgents.some((a) => a.status !== "queued" && a.status !== "completed");
            return (
              <div
                key={phase.id}
                className={`${styles.phaseItem} ${phaseComplete ? styles.phaseComplete : ""} ${phaseActive ? styles.phaseActive : ""}`}
              >
                <Codicon name={phase.icon} className={styles.phaseIcon} />
                <span>{phase.label}</span>
                {phaseComplete && <Codicon name="check" className={styles.phaseCheck} />}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.mainArea}>
        {/* Kanban columns */}
        <div className={`${styles.columns} ${selectedAgent ? styles.columnsWithPanel : ""}`}>
          {COLUMNS.map((col) => {
            const columnAgents = getColumnAgents(col.key);
            return (
              <div key={col.key} className={styles.column}>
                <div className={styles.columnHeader} style={{ borderTopColor: col.color }}>
                  <div className={styles.columnTitle}>
                    <Codicon
                      name={col.icon}
                      spin={col.icon === "loading" && columnAgents.length > 0}
                      className={styles.columnIcon}
                      style={{ color: col.color }}
                    />
                    <span>{col.label}</span>
                  </div>
                  <span
                    className={styles.columnCount}
                    style={{
                      background: columnAgents.length > 0 ? `color-mix(in srgb, ${col.color} 20%, transparent)` : undefined,
                      color: columnAgents.length > 0 ? col.color : undefined,
                    }}
                  >
                    {columnAgents.length}
                  </span>
                </div>

                <div className={styles.columnBody}>
                  {columnAgents.map((agent) => {
                    const isHovered = hoveredAgent === agent.id;
                    const isDep = hoveredDeps.includes(agent.id);
                    const isDependent = hoveredDependents.includes(agent.id);
                    const isSelected = selectedAgent === agent.id;
                    const isHighlighted = isHovered || isDep || isDependent;
                    const isDimmed = hoveredAgent !== null && !isHighlighted;

                    return (
                      <div
                        key={agent.id}
                        className={`${styles.card} ${styles[`card_${agent.status.replace("-", "")}`]} ${isDimmed ? styles.cardDimmed : ""} ${isHighlighted ? styles.cardHighlighted : ""} ${isSelected ? styles.cardSelected : ""}`}
                        onMouseEnter={() => handleCardEnter(agent.id)}
                        onMouseLeave={handleCardLeave}
                        onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
                      >
                        <div className={styles.cardHeader}>
                          <div className={styles.cardTitle}>
                            <span className={styles.iconWrap}>
                              <Codicon name={agent.icon} className={`${styles.cardIcon} ${isDep || isDependent ? styles.cardIconHidden : ""}`} />
                              {isDep && <Codicon name="arrow-up" className={`${styles.depIcon} ${styles.depIcon_up}`} />}
                              {isDependent && <Codicon name="arrow-down" className={`${styles.depIcon} ${styles.depIcon_down}`} />}
                            </span>
                            <span>{agent.name}</span>
                          </div>
                          <div className={styles.cardStatus}>
                            {agent.status === "running" && (
                              <span className={styles.cardPercent}>{Math.round(agent.progress)}%</span>
                            )}
                            {agent.status === "completed" && (
                              <Codicon name="check" className={styles.cardDone} />
                            )}
                            {agent.status === "reviewing" && (
                              <span className={styles.cardReview}>
                                <Codicon name="eye" />
                              </span>
                            )}
                            {agent.status === "needs-input" && (
                              <span className={styles.cardAlert}>
                                <Codicon name="bell" />
                              </span>
                            )}
                            {agent.status === "ready" && (
                              <button
                                className={styles.cardRunBtn}
                                onClick={(e) => { e.stopPropagation(); kickoffAgent(agent.id); }}
                              >
                                <Codicon name="play" />
                                <span>Run</span>
                              </button>
                            )}
                            {agent.status === "queued" && (
                              <span className={styles.cardWaiting}>
                                <Codicon name="watch" />
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={styles.cardDesc}>{agent.description}</div>

                        {agent.status === "running" && (
                          <div className={styles.progressTrack}>
                            <div className={styles.progressBar} style={{ width: `${agent.progress}%` }} />
                          </div>
                        )}

                        {agent.status === "running" && agent.logs.length > 0 && (
                          <div className={styles.logSection}>
                            <div className={styles.logEntry}>
                              <span className={`${styles.logIcon} ${styles[`log_${agent.logs[agent.logs.length - 1].type}`]}`}>
                                <Codicon name={
                                  agent.logs[agent.logs.length - 1].type === "action" ? "arrow-right" :
                                  agent.logs[agent.logs.length - 1].type === "success" ? "check" :
                                  agent.logs[agent.logs.length - 1].type === "warning" ? "warning" :
                                  agent.logs[agent.logs.length - 1].type === "output" ? "chevron-right" : "info"
                                } />
                              </span>
                              <span className={styles.logText}>{agent.logs[agent.logs.length - 1].text}</span>
                            </div>
                          </div>
                        )}

                        {agent.status === "needs-input" && (
                          <div className={styles.inputHint}>
                            <Codicon name="comment-discussion" />
                            <span>{agent.inputPrompts[agent.currentInputIdx]?.prompt}</span>
                            <Codicon name="chevron-right" className={styles.inputHintArrow} />
                          </div>
                        )}

                        {agent.status === "reviewing" && (
                          <div className={styles.reviewHint}>
                            <Codicon name="eye" />
                            <span>Review output to unblock dependents</span>
                            <Codicon name="chevron-right" className={styles.inputHintArrow} />
                          </div>
                        )}

                        {agent.status === "ready" && (
                          <div className={styles.readyHint}>
                            <span>Dependencies met — ready to execute</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {columnAgents.length === 0 && (
                    <div className={styles.emptyColumn}>
                      <Codicon name={col.icon} className={styles.emptyIcon} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedAgentData && (
          <div className={styles.detailPanel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <Codicon name={selectedAgentData.icon} className={styles.panelIcon} />
                <span>{selectedAgentData.name}</span>
                <span className={`${styles.panelBadge} ${styles[`panelBadge_${selectedAgentData.status.replace("-", "")}`]}`}>
                  {selectedAgentData.status === "ready" ? "Ready" :
                   selectedAgentData.status === "reviewing" ? "Awaiting Review" :
                   selectedAgentData.status === "needs-input" ? "Needs Input" :
                   selectedAgentData.status.charAt(0).toUpperCase() + selectedAgentData.status.slice(1)}
                </span>
              </div>
              <button className={styles.panelClose} onClick={() => setSelectedAgent(null)}>
                <Codicon name="close" />
              </button>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.panelSection}>
                <p className={styles.panelDesc}>{selectedAgentData.description}</p>
                <div className={styles.panelMetaRow}>
                  {selectedAgentData.model && <span className={styles.panelModel}>{selectedAgentData.model}</span>}
                  {(selectedAgentData.tokens ?? 0) > 0 && <span className={styles.panelTokens}>{formatTokens(selectedAgentData.tokens ?? 0)} tokens</span>}
                  {selectedAgentData.elapsed != null && <span className={styles.panelElapsed}>{formatElapsed(selectedAgentData.elapsed)}</span>}
                </div>
              </div>

              {selectedAgentData.dependencies.length > 0 && (
                <div className={styles.panelSection}>
                  <div className={styles.panelLabel}>Dependencies</div>
                  <div className={styles.depList}>
                    {selectedAgentData.dependencies.map((depId) => {
                      const dep = agents.find((a) => a.id === depId);
                      return (
                        <div key={depId} className={styles.depItem} onClick={() => setSelectedAgent(depId)}>
                          <Codicon name={dep?.icon ?? "circle-outline"} className={styles.depItemIcon} />
                          <span>{dep?.name}</span>
                          {dep?.reviewed && <Codicon name="check" className={styles.depItemCheck} />}
                          {dep && !dep.reviewed && dep.status !== "completed" && (
                            <span className={styles.depItemStatus}>{dep.status}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(selectedAgentData.selectedOptions?.length ?? 0) > 0 && (
                <div className={styles.panelSection}>
                  <div className={styles.panelLabel}>Your decisions</div>
                  <div className={styles.decisionList}>
                    {selectedAgentData.selectedOptions?.map((opt, i) => (
                      <div key={i} className={styles.decisionItem}>
                        <Codicon name="check" className={styles.decisionCheck} />
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAgentData.status === "needs-input" && (
                <div className={styles.panelInputSection}>
                  <div className={styles.panelInputPrompt}>
                    {selectedAgentData.inputPrompts[selectedAgentData.currentInputIdx]?.prompt}
                  </div>
                  <div className={styles.panelInputContext}>
                    {selectedAgentData.inputPrompts[selectedAgentData.currentInputIdx]?.context}
                  </div>
                  <div className={styles.panelInputOptions}>
                    {selectedAgentData.inputPrompts[selectedAgentData.currentInputIdx]?.options.map((opt) => (
                      <button
                        key={opt.label}
                        className={`${styles.panelOption} ${opt.recommended ? styles.panelOptionRecommended : ""}`}
                        onClick={() => resolveInput(selectedAgentData.id, opt.label)}
                      >
                        <div className={styles.panelOptionHeader}>
                          <span className={styles.panelOptionLabel}>{opt.label}</span>
                          {opt.recommended && <span className={styles.recommendedBadge}>Recommended</span>}
                        </div>
                        <span className={styles.panelOptionDesc}>{opt.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedAgentData.status === "ready" && (
                <div className={styles.panelAction}>
                  <button className={styles.panelRunBtn} onClick={() => kickoffAgent(selectedAgentData.id)}>
                    <Codicon name="play" />
                    <span>Start {selectedAgentData.name}</span>
                  </button>
                  <p className={styles.panelActionHint}>All dependencies met. Click to begin execution.</p>
                </div>
              )}

              {selectedAgentData.status === "reviewing" && (
                <div className={styles.panelReviewSection}>
                  {selectedAgentData.summary && (
                    <div className={styles.panelSummary}>{selectedAgentData.summary}</div>
                  )}
                  {selectedAgentData.fileChanges && (
                    <div className={styles.panelFiles}>
                      <div className={styles.panelLabel}>Files changed</div>
                      {selectedAgentData.fileChanges.map((fc) => (
                        <div key={fc.file} className={styles.fileRow}>
                          <Codicon name="file" className={styles.fileIcon} />
                          <span className={styles.fileName}>{fc.file}</span>
                          <span className={styles.fileAdded}>+{fc.additions}</span>
                          {fc.deletions > 0 && <span className={styles.fileDeleted}>-{fc.deletions}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <button className={styles.panelApproveBtn} onClick={() => reviewAgent(selectedAgentData.id)}>
                    <Codicon name="check" />
                    <span>Approve &amp; Continue</span>
                  </button>
                  <p className={styles.panelActionHint}>
                    Approving unblocks {getDependents(selectedAgentData.id).length > 0
                      ? getDependents(selectedAgentData.id).join(", ")
                      : "mission completion"}.
                  </p>
                </div>
              )}

              {selectedAgentData.logs.length > 0 && (
                <div className={styles.panelSection}>
                  <div className={styles.panelLabel}>Activity log</div>
                  <div className={styles.panelLog}>
                    {selectedAgentData.logs.map((log, i) => (
                      <div key={i} className={styles.panelLogEntry}>
                        <span className={styles.logTime}>{log.time}</span>
                        <span className={`${styles.logDot} ${styles[`log_${log.type}`]}`} />
                        <span className={styles.panelLogText}>{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAgentData.status === "completed" && selectedAgentData.summary && (
                <div className={styles.panelSection}>
                  <div className={styles.panelCompleteSummary}>
                    <Codicon name="check" className={styles.panelCompleteIcon} />
                    <span>{selectedAgentData.summary}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Welcome state */}
      {!missionStarted && (
        <div className={styles.welcomeOverlay}>
          <div className={styles.welcomePanel}>
            <div className={styles.welcomeIcon}>
              <Codicon name="rocket" />
            </div>
            <h2 className={styles.welcomeTitle}>Migrate Payments to Stripe</h2>
            <p className={styles.welcomeDesc}>
              8 specialized AI agents will collaborate to migrate your payment infrastructure from PayPal Legacy to Stripe. You&apos;ll guide key decisions, approve outputs, and control the pace.
            </p>
            <div className={styles.welcomeAgents}>
              {INITIAL_AGENTS.map((a) => (
                <div key={a.id} className={styles.welcomeAgent}>
                  <Codicon name={a.icon} />
                  <span>{a.name}</span>
                </div>
              ))}
            </div>
            <div className={styles.welcomeInfo}>
              <div className={styles.welcomeInfoItem}>
                <Codicon name="comment-discussion" />
                <span>You&apos;ll make {INITIAL_AGENTS.reduce((s, a) => s + a.inputPrompts.length, 0)} key decisions</span>
              </div>
              <div className={styles.welcomeInfoItem}>
                <Codicon name="eye" />
                <span>Review each agent&apos;s output before proceeding</span>
              </div>
              <div className={styles.welcomeInfoItem}>
                <Codicon name="play" />
                <span>Manually start each agent when ready</span>
              </div>
            </div>
            <button className={styles.welcomeStart} onClick={startMission}>
              <Codicon name="play" />
              <span>Start Mission</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
