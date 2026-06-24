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
  severity?: "warning" | "critical";
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
        context: "Currently using PayPal Legacy SDK (v2.1). CTO mentioned Adyen in last week's meeting. VP of Sales wants Square for small merchants. No formal decision yet.",
        options: [
          { label: "Stripe only", description: "Focus research on Stripe — saves time but skips due diligence" },
          { label: "Stripe + Adyen", description: "Evaluate Adyen as backup — adds 2-3 days but covers enterprise" },
          { label: "Full comparison", description: "Stripe vs Adyen vs Square — comprehensive, adds a week" },
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
        context: "Found 2,847 active subscriptions. 34 enterprise accounts (>$10k/mo) have custom billing logic. Last migration attempt (2024) caused 6 hours of billing outage.",
        options: [
          { label: "Bulk migrate", description: "Move all at once during maintenance window. Fast but last time this caused a 6-hour outage." },
          { label: "Rolling migration", description: "Migrate at renewal over 30 days. Zero disruption but 34 enterprise accounts need manual handling." },
          { label: "Shadow + cutover", description: "Run both systems 7 days. Safest, but doubles infrastructure cost ($14k) and engineering effort." },
        ],
      },
      {
        prompt: "Feature flag granularity for the rollout?",
        context: "Feature flags control rollout targeting. Engineering estimates: per-tenant (2 days), per-user (5 days), percentage (1 day). Product wants per-user for beta program.",
        options: [
          { label: "Per-tenant", description: "Per organization — simple, 2 days. But can't target individual beta users." },
          { label: "Per-user", description: "Per individual user — 5 days to build. Product team needs this for beta invites." },
          { label: "Percentage rollout", description: "Random sampling — 1 day. Standard, but no way to guarantee specific users are included." },
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
        context: "The existing table has 4.2M rows. Finance team runs monthly reports on it. Compliance requires 7-year retention. The Architect Agent assumed we'd keep it, but that creates a dual-read problem for the billing dashboard.",
        options: [
          { label: "Keep as-is", description: "Legacy table stays read-only. Billing dashboard needs dual-read logic (extra complexity)." },
          { label: "Migrate data", description: "ETL 4.2M records into new schema. 2-3 hour downtime. Risk of data corruption on edge cases." },
          { label: "Archive + fresh start", description: "Move to cold storage. Finance loses quick access to historical queries until we build an archive viewer." },
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
        context: "Stripe webhooks can be delivered multiple times. Last month we had a duplicate charge incident caused by a similar system. VP of Engineering flagged this as P0.",
        options: [
          { label: "Idempotency keys", description: "Store processed event IDs, skip duplicates. Standard but adds a DB lookup per webhook (latency concern at scale)." },
          { label: "Event sourcing", description: "Full event log with replay. Robust, but over-engineered for current volume. Would take 3 extra days." },
          { label: "At-least-once + dedup", description: "Accept duplicates, deduplicate at processing layer. Simplest, but the duplicate charge incident was exactly this pattern." },
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
        context: "Stripe offers multiple integration options. Design team prefers embedded (matches brand). Legal says hosted checkout reduces our PCI scope from SAQ A-EP to SAQ A (significant compliance difference).",
        options: [
          { label: "Embedded Elements", description: "Inline form — matches brand perfectly, but keeps us at PCI SAQ A-EP (annual audit required)." },
          { label: "Stripe Checkout", description: "Redirect to Stripe-hosted page. Reduces PCI scope to SAQ A (self-assessment only). Breaks brand immersion." },
          { label: "Custom form + Tokens", description: "Full custom UI. Maximum control, but we handle raw card data — PCI SAQ D (most expensive compliance tier)." },
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
        prompt: "3 of 12 tests failing. How should we proceed?",
        context: "Tests failing: (1) subscription downgrade with proration, (2) concurrent webhook race condition, (3) payment retry after card update. These are edge cases but they affect ~8% of transactions.",
        severity: "warning",
        options: [
          { label: "Fix and re-run", description: "Send back to Backend Agent to fix the 3 failing cases. Adds estimated 10-15 minutes." },
          { label: "Ship with known gaps", description: "Document the 3 gaps, add monitoring alerts, fix post-launch. Faster but 8% of transactions at risk." },
          { label: "Reduce scope", description: "Disable proration and retry features at launch. Simpler but removes functionality users expect." },
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
        prompt: "Critical: Stripe test key found in committed config file",
        context: "Found STRIPE_TEST_KEY in src/config/stripe.ts line 4 (committed 3 days ago). This is a test key, not production, but it indicates the secret management pattern is wrong. The Backend Agent hardcoded it instead of using env vars.",
        severity: "critical",
        options: [
          { label: "Block and fix", description: "Stop all agents. Rotate the key, move to env vars, audit for other hardcoded secrets. Adds 20+ minutes." },
          { label: "Flag and continue", description: "It's a test key — not a production risk. Create a follow-up ticket, continue with deployment." },
          { label: "Fix inline", description: "Ask Backend Agent to fix just this file now. Don't block other agents. Risk: there may be other instances." },
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
        prompt: "Deploy blocked: Schema Agent used 'payment_status' but Backend Agent used 'status'",
        context: "Conflict detected. Schema migration creates column 'payment_status' on stripe_customers table. Backend service references column 'status'. This will cause a runtime error. Both agents completed successfully individually.",
        severity: "critical",
        options: [
          { label: "Use 'payment_status'", description: "Keep Schema's version. Backend Agent will need to regenerate 3 files (~5 min)." },
          { label: "Use 'status'", description: "Keep Backend's version. Schema Agent regenerates migration (~3 min). Risk: may conflict with existing 'status' column." },
          { label: "Rename to 'stripe_status'", description: "Neither agent's version. Both regenerate. Clearest naming but adds 8 minutes." },
        ],
      },
      {
        prompt: "Confirm deployment schedule",
        context: "All issues resolved. 9/12 tests passing (3 edge cases deferred). Security finding flagged. It's Friday 4 PM.",
        options: [
          { label: "Deploy now", description: "Begin shadow mode immediately. It's Friday afternoon — team may not be available if issues arise." },
          { label: "Monday morning", description: "Wait until Monday 9 AM when full team is available. 2.5 days delay." },
          { label: "Tonight 2 AM UTC", description: "Low-traffic window. On-call engineer available but it's a skeleton crew." },
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
    { time: "1:25", text: "Test: successful one-time payment flow ✔", type: "output" },
    { time: "1:28", text: "Test: subscription upgrade ✔", type: "output" },
    { time: "1:31", text: "Test: webhook signature verification ✔", type: "output" },
    { time: "1:33", text: "FAIL: subscription downgrade with proration — amount mismatch", type: "warning" },
    { time: "1:35", text: "FAIL: concurrent webhook race condition — duplicate charge", type: "warning" },
    { time: "1:37", text: "FAIL: payment retry after card update — stale token", type: "warning" },
    { time: "1:39", text: "Test: refund flow ✔", type: "output" },
    { time: "1:40", text: "9 passing, 3 failing — review required", type: "warning" },
  ],
  security: [
    { time: "1:44", text: "Scanning for PCI DSS compliance requirements...", type: "info" },
    { time: "1:48", text: "Verifying: no raw card numbers stored", type: "output" },
    { time: "1:51", text: "Checking webhook signature validation", type: "action" },
    { time: "1:54", text: "CRITICAL: Stripe test key hardcoded in src/config/stripe.ts:4", type: "warning" },
    { time: "1:57", text: "Key was committed 3 days ago by Backend Agent", type: "warning" },
    { time: "2:00", text: "Checking if key was rotated... NOT rotated", type: "warning" },
    { time: "2:03", text: "Audit blocked — secret management issue requires resolution", type: "warning" },
  ],
  deploy: [
    { time: "2:10", text: "Validating dependencies before deploy...", type: "action" },
    { time: "2:12", text: "CONFLICT: Schema column 'payment_status' vs Backend column 'status'", type: "warning" },
    { time: "2:14", text: "Agents produced incompatible database schema references", type: "warning" },
    { time: "2:17", text: "Waiting for conflict resolution...", type: "info" },
    { time: "2:20", text: "Preparing deployment manifest for staged rollout", type: "action" },
    { time: "2:23", text: "Phase 1: Shadow mode (dual-write, compare)", type: "output" },
    { time: "2:26", text: "Deployment plan ready — pending schedule confirmation", type: "success" },
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
  research: "Mapped 23 payment files, 4 API endpoints, 3 webhooks. Stripe migration path identified with 2 breaking changes in billing logic. Risk: subscription proration handling differs significantly.",
  architect: "3-phase rollout plan: shadow → canary (5%) → full cutover. Feature flag per-tenant. Auto-rollback at 2% error rate. Note: 34 enterprise accounts need manual handling regardless of strategy.",
  schema: "4 new tables, 1 altered table. All migrations reversible. Used column name 'payment_status' for consistency with existing conventions.",
  backend: "8 files changed (+464/-12 lines). Stripe SDK integrated with idempotency, retries, and webhook handling. Note: used column name 'status' for brevity.",
  frontend: "5 components built. Stripe Elements checkout, payment management, billing history. Responsive + accessible.",
  testing: "9 of 12 tests passing. 3 failures in edge cases: proration, race condition, stale token. Affects ~8% of transaction scenarios.",
  security: "BLOCKER: Stripe test key hardcoded in config (committed by Backend Agent). Not production key, but indicates broken secret management pattern. Must resolve before deploy.",
  deploy: "Staged rollout configured. Conflict detected between Schema and Backend agents on column naming. Requires manual resolution before execution.",
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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [missionStarted, setMissionStarted] = useState(false);
  const [budgetWarningDismissed, setBudgetWarningDismissed] = useState(false);
  const [tokenLimit, setTokenLimit] = useState(15000);
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
      setElapsedTime(now - startTimeRef.current);

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
    setElapsedTime(0);
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
  const selectedPrompt =
    selectedAgentData?.status === "needs-input"
      ? selectedAgentData.inputPrompts[selectedAgentData.currentInputIdx]
      : undefined;

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
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.taskTitle}>
            <Codicon name="tasklist" className={styles.taskIcon} />
            <span>Migrate Payments to Stripe</span>
            {isRunning && agents.some((a) => a.status === "running") && (
              <span className={styles.liveTag}>
                <span className={styles.liveDot} />
                Running
              </span>
            )}
          </div>
          <div className={styles.taskMeta}>
            {missionStarted && (
              <>
                <span className={styles.metaItem}>
                  <Codicon name="check" />
                  {completedCount}/{agents.length} complete
                </span>
                {elapsedTime > 0 && (
                  <span className={styles.metaItem}>
                    <Codicon name="clock" />
                    {formatElapsed(elapsedTime)}
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
              <span>Run All</span>
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

      {/* Budget warning */}
      {(() => {
        const warnThreshold = tokenLimit * 0.55;
        const overLimit = totalTokens >= tokenLimit;
        const show = totalTokens > warnThreshold && (!budgetWarningDismissed || overLimit);
        if (!show) return null;
        return (
          <div className={`${styles.budgetWarning} ${overLimit ? styles.budgetWarningOver : ""}`}>
            <Codicon name={overLimit ? "error" : "warning"} className={styles.budgetIcon} />
            <span className={styles.budgetText}>
              {overLimit ? (
                <>
                  Token usage (<strong>{formatTokens(totalTokens)}</strong>) has exceeded the workspace
                  limit ({formatTokens(tokenLimit)}). Raise the limit to keep the remaining agents running.
                </>
              ) : (
                <>
                  Token usage (<strong>{formatTokens(totalTokens)}</strong>) is approaching the workspace
                  limit ({formatTokens(tokenLimit)}).
                </>
              )}
            </span>
            <button className={styles.budgetDismiss} onClick={() => setBudgetWarningDismissed(true)}>
              Dismiss
            </button>
            <button
              className={styles.budgetAction}
              onClick={() => { setTokenLimit((l) => l + 15000); setBudgetWarningDismissed(false); }}
            >
              +15k limit
            </button>
          </div>
        );
      })()}

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
        <div className={styles.columns}>
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
                    const promptSeverity =
                      agent.status === "needs-input"
                        ? agent.inputPrompts[agent.currentInputIdx]?.severity
                        : undefined;

                    return (
                      <div
                        key={agent.id}
                        className={`${styles.card} ${styles[`card_${agent.status.replace("-", "")}`]} ${promptSeverity ? styles[`cardSeverity_${promptSeverity}`] : ""} ${isDimmed ? styles.cardDimmed : ""} ${isHighlighted ? styles.cardHighlighted : ""} ${isSelected ? styles.cardSelected : ""}`}
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
                              <span className={`${styles.cardAlert} ${promptSeverity ? styles[`cardAlert_${promptSeverity}`] : ""}`}>
                                <Codicon name={promptSeverity === "critical" ? "error" : promptSeverity === "warning" ? "warning" : "bell"} />
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
                          <div className={`${styles.inputHint} ${promptSeverity ? styles[`inputHint_${promptSeverity}`] : ""}`}>
                            {promptSeverity ? (
                              <span className={`${styles.severityTag} ${styles[`severityTag_${promptSeverity}`]}`}>
                                <Codicon name={promptSeverity === "critical" ? "error" : "warning"} />
                                <span>{promptSeverity === "critical" ? "Blocker" : "Failure"}</span>
                              </span>
                            ) : (
                              <Codicon name="comment-discussion" />
                            )}
                            <span className={styles.inputHintText}>{agent.inputPrompts[agent.currentInputIdx]?.prompt}</span>
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
                <div className={`${styles.panelInputSection} ${selectedPrompt?.severity ? styles[`panelInputSection_${selectedPrompt.severity}`] : ""}`}>
                  {selectedPrompt?.severity && (
                    <div className={`${styles.panelSeverityBanner} ${styles[`panelSeverityBanner_${selectedPrompt.severity}`]}`}>
                      <Codicon name={selectedPrompt.severity === "critical" ? "error" : "warning"} />
                      <span>
                        {selectedPrompt.severity === "critical"
                          ? "Blocker — this agent halted on a failure and can't continue until you resolve it"
                          : "Failure detected — the agent surfaced a problem that needs your call"}
                      </span>
                    </div>
                  )}
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
                      : "task completion"}.
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

      {!missionStarted && (
        <div className={styles.welcomeOverlay}>
          <div className={styles.welcomePanel}>
            <div className={styles.welcomeIcon}>
              <Codicon name="hubot" />
            </div>
            <h2 className={styles.welcomeTitle}>Migrate Payments to Stripe</h2>
            <p className={styles.welcomeDesc}>
              Copilot will coordinate 8 specialized agents to migrate your payment infrastructure from PayPal Legacy to Stripe. You&apos;ll guide key decisions, review outputs, and approve each step.
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
              <span>Start</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
