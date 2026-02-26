"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type AgentStatus = "queued" | "running" | "needs-input" | "completed";

interface Agent {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: AgentStatus;
  progress: number;
  dependencies: string[];
  inputPrompt?: string;
  inputOptions?: string[];
  completedAt?: number;
  startedAt?: number;
  elapsed?: number;
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: "research",
    name: "Research",
    icon: "search",
    description: "Analyzing auth patterns, OAuth2 flows, and session management best practices",
    status: "queued",
    progress: 0,
    dependencies: [],
  },
  {
    id: "planner",
    name: "Planner",
    icon: "list-tree",
    description: "Breaking down auth feature into implementation tasks and sequencing work",
    status: "queued",
    progress: 0,
    dependencies: ["research"],
  },
  {
    id: "designer",
    name: "Designer",
    icon: "symbol-color",
    description: "Creating login flow wireframes, token refresh UX, and error state designs",
    status: "queued",
    progress: 0,
    dependencies: ["planner"],
  },
  {
    id: "coder",
    name: "Coder",
    icon: "code",
    description: "Implementing auth middleware, JWT validation, and protected route handlers",
    status: "queued",
    progress: 0,
    dependencies: ["planner"],
  },
  {
    id: "tester",
    name: "Tester",
    icon: "beaker",
    description: "Writing integration tests for auth endpoints and session edge cases",
    status: "queued",
    progress: 0,
    dependencies: ["coder"],
  },
  {
    id: "security",
    name: "Security",
    icon: "shield",
    description: "Auditing token storage, CSRF protection, and rate limiting configuration",
    status: "queued",
    progress: 0,
    dependencies: ["designer"],
  },
  {
    id: "reviewer",
    name: "Reviewer",
    icon: "git-pull-request",
    description: "Reviewing code quality, architecture decisions, and test coverage",
    status: "queued",
    progress: 0,
    dependencies: ["coder", "security", "tester"],
  },
  {
    id: "deployer",
    name: "Deployer",
    icon: "rocket",
    description: "Rolling out auth service to staging with feature flags and monitoring",
    status: "queued",
    progress: 0,
    dependencies: ["reviewer"],
  },
];

const INPUT_PROMPTS: Record<string, { prompt: string; options: string[] }> = {
  research: {
    prompt: "Found 3 auth strategies. Which approach should we pursue?",
    options: ["JWT + Refresh Tokens", "Session-based Auth", "OAuth2 + PKCE"],
  },
  designer: {
    prompt: "Login modal or full-page redirect for the sign-in flow?",
    options: ["Modal overlay", "Full-page redirect"],
  },
  reviewer: {
    prompt: "3 issues flagged in review. Approve to continue deployment?",
    options: ["Approve all", "Fix & re-review"],
  },
  security: {
    prompt: "Token rotation interval: what refresh cadence?",
    options: ["15 min", "1 hour", "24 hours"],
  },
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

export default function AgentOrchestrationBoardPage() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [missionTime, setMissionTime] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const allQueued = agents.every((a) => a.status === "queued");

  const depsReady = useCallback(
    (agent: Agent, agentList: Agent[]) => {
      return agent.dependencies.every((depId) => {
        const dep = agentList.find((a) => a.id === depId);
        return dep?.status === "completed";
      });
    },
    []
  );

  // Simulation tick
  useEffect(() => {
    if (!isRunning || allCompleted) {
      if (tickRef.current) clearInterval(tickRef.current);
      if (allCompleted) setIsRunning(false);
      return;
    }

    tickRef.current = setInterval(() => {
      const now = Date.now();
      setMissionTime(now - startTimeRef.current);

      setAgents((prev) => {
        const next = prev.map((a) => ({ ...a }));

        for (const agent of next) {
          if (agent.status === "queued" && depsReady(agent, next)) {
            agent.status = "running";
            agent.startedAt = now;
            agent.progress = 0;
          }

          if (agent.status === "running") {
            agent.elapsed = now - (agent.startedAt ?? now);
            const speed = 1.5 + Math.random() * 2;
            agent.progress = Math.min(100, agent.progress + speed);

            // Check if should pause for input
            const shouldPause = INPUT_PROMPTS[agent.id];
            if (shouldPause && agent.progress >= 40 && agent.progress < 45) {
              agent.status = "needs-input";
              agent.inputPrompt = shouldPause.prompt;
              agent.inputOptions = shouldPause.options;
              agent.progress = 40;
            }

            if (agent.progress >= 100) {
              agent.status = "completed";
              agent.progress = 100;
              agent.completedAt = now;
            }
          }
        }

        return next;
      });
    }, 150);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [isRunning, allCompleted, depsReady]);

  function startMission() {
    setAgents(INITIAL_AGENTS.map((a) => ({ ...a })));
    setMissionTime(0);
    startTimeRef.current = Date.now();
    setIsRunning(true);
    setExpandedAgent(null);
  }

  function resolveInput(agentId: string) {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? { ...a, status: "running" as AgentStatus, inputPrompt: undefined, inputOptions: undefined, progress: 45 }
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

  const hoveredDeps = hoveredAgent
    ? agents.find((a) => a.id === hoveredAgent)?.dependencies ?? []
    : [];
  const hoveredDependents = hoveredAgent
    ? agents.filter((a) => a.dependencies.includes(hoveredAgent)).map((a) => a.id)
    : [];

  return (
    <div className={styles.board}>
      {/* Mission header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.missionTitle}>
            <Codicon name="rocket" className={styles.missionIcon} />
            <span>Ship Auth Feature</span>
          </div>
          <div className={styles.missionMeta}>
            <span className={styles.metaItem}>
              <Codicon name="organization" />
              {agents.length} agents
            </span>
            {isRunning && (
              <span className={styles.metaItem}>
                <Codicon name="clock" />
                {formatElapsed(missionTime)}
              </span>
            )}
            {allCompleted && (
              <span className={`${styles.metaItem} ${styles.metaSuccess}`}>
                <Codicon name="check-all" />
                Mission complete
              </span>
            )}
          </div>
        </div>
        <div className={styles.headerRight}>
          {(allQueued || allCompleted) && (
            <button className={styles.startButton} onClick={startMission}>
              <Codicon name={allCompleted ? "debug-restart" : "play"} />
              <span>{allCompleted ? "Restart" : "Start Mission"}</span>
            </button>
          )}
          {isRunning && (
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot} />
              <span>Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Kanban columns */}
      <div className={styles.columns}>
        {COLUMNS.map((col) => {
          const columnAgents = agents.filter((a) => a.status === col.key);
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
                  const isExpanded = expandedAgent === agent.id;
                  const isHighlighted = isHovered || isDep || isDependent;
                  const isDimmed = hoveredAgent !== null && !isHighlighted;

                  return (
                    <div
                      key={agent.id}
                      className={`${styles.card} ${styles[`card_${agent.status.replace("-", "")}`]} ${isDimmed ? styles.cardDimmed : ""} ${isHighlighted ? styles.cardHighlighted : ""} ${isDep ? styles.cardIsDep : ""} ${isDependent ? styles.cardIsDependent : ""}`}
                      onMouseEnter={() => handleCardEnter(agent.id)}
                      onMouseLeave={handleCardLeave}
                      onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                    >
                      <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                          <Codicon name={agent.icon} className={styles.cardIcon} />
                          <span>{agent.name}</span>
                        </div>
                        <div className={styles.cardStatus}>
                          {isDep && (
                            <span className={`${styles.depBadge} ${styles.depBadge_up}`}>
                              <Codicon name="arrow-small-up" /> dep
                            </span>
                          )}
                          {isDependent && (
                            <span className={`${styles.depBadge} ${styles.depBadge_down}`}>
                              <Codicon name="arrow-small-down" /> needs
                            </span>
                          )}
                          {agent.status === "running" && (
                            <span className={styles.cardPercent}>{Math.round(agent.progress)}%</span>
                          )}
                          {agent.status === "completed" && (
                            <Codicon name="check" className={styles.cardDone} />
                          )}
                          {agent.status === "needs-input" && (
                            <span className={styles.cardAlert}>
                              <Codicon name="bell" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress bar for running agents */}
                      {agent.status === "running" && (
                        <div className={styles.progressTrack}>
                          <div
                            className={styles.progressBar}
                            style={{ width: `${agent.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Needs-input prompt */}
                      {agent.status === "needs-input" && agent.inputPrompt && (
                        <div className={styles.inputSection}>
                          <div className={styles.inputPrompt}>{agent.inputPrompt}</div>
                          <div className={styles.inputActions}>
                            {agent.inputOptions?.map((opt) => (
                              <button
                                key={opt}
                                className={styles.inputOption}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resolveInput(agent.id);
                                }}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className={styles.detail}>
                          <p className={styles.detailDesc}>{agent.description}</p>
                          {agent.dependencies.length > 0 && (
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>Depends on</span>
                              <span className={styles.detailValue}>
                                {getDependencyNames(agent).join(", ")}
                              </span>
                            </div>
                          )}
                          {getDependents(agent.id).length > 0 && (
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>Blocks</span>
                              <span className={styles.detailValue}>
                                {getDependents(agent.id).join(", ")}
                              </span>
                            </div>
                          )}
                          {agent.elapsed != null && (
                            <div className={styles.detailRow}>
                              <span className={styles.detailLabel}>Elapsed</span>
                              <span className={styles.detailValue}>{formatElapsed(agent.elapsed)}</span>
                            </div>
                          )}
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
    </div>
  );
}
