"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type Status = "queued" | "running" | "input-needed" | "completed" | "idle";

interface Session {
  id: string;
  title: string;
  repo: string;
  added: number;
  removed: number;
  time: string;
  group: "today" | "yesterday" | "week";
  status: Status;
  progress: number;
  /** ms of simulated work remaining baseline — controls fill pace */
  pace: number;
  /** progress threshold at which this session pauses for input (once) */
  inputAt?: number;
  inputPrompt?: string;
  inputOptions?: string[];
  /** internal: has this session already consumed its input pause */
  inputDone?: boolean;
  selected?: boolean;
}

const INITIAL: Session[] = [
  {
    id: "card-updates",
    title: "Card updates not reflecting in task",
    repo: "vscode-cdnotes",
    added: 0,
    removed: 0,
    time: "just now",
    group: "today",
    status: "input-needed",
    progress: 38,
    pace: 1,
    inputAt: 38,
    inputDone: true,
    inputPrompt: "Two cards share an ID. Keep both or merge into one?",
    inputOptions: ["Keep both", "Merge"],
    selected: true,
  },
  {
    id: "imagegen",
    title: "Install imagegen into .agent/skills",
    repo: "vscode-cdnotes",
    added: 150,
    removed: 1,
    time: "4 mins ago",
    group: "today",
    status: "running",
    progress: 64,
    pace: 1.4,
  },
  {
    id: "ux-survey",
    title: "UX ideas for VS Code survey",
    repo: "proto-vibes-playground",
    added: 906,
    removed: 55,
    time: "4 mins ago",
    group: "today",
    status: "running",
    progress: 22,
    pace: 0.9,
    inputAt: 55,
    inputPrompt: "Survey hosting: GitHub Pages or internal tool?",
    inputOptions: ["GitHub Pages", "Internal"],
  },
  {
    id: "vision-insights",
    title: "Insights for @vision.md from meeting notes",
    repo: "planwerk",
    added: 3726,
    removed: 221,
    time: "4 mins ago",
    group: "today",
    status: "running",
    progress: 81,
    pace: 1.8,
  },
  {
    id: "subagents-exercise",
    title: "Spawn subagents for exercise review",
    repo: "papa-fitness",
    added: 1041,
    removed: 119,
    time: "4 mins ago",
    group: "today",
    status: "running",
    progress: 8,
    pace: 1.1,
  },
  {
    id: "update-deps",
    title: "Update all dependencies",
    repo: "planwerk",
    added: 274,
    removed: 238,
    time: "5 mins ago",
    group: "today",
    status: "queued",
    progress: 0,
    pace: 1.3,
  },
  {
    id: "rubber-duck",
    title: "Rubber duck slash command integration",
    repo: "vscode",
    added: 0,
    removed: 0,
    time: "7 mins ago",
    group: "today",
    status: "completed",
    progress: 100,
    pace: 1,
  },
  {
    id: "debug-subagent",
    title: "Debugging research subagent session issues",
    repo: "vscode",
    added: 0,
    removed: 0,
    time: "4 hrs ago",
    group: "today",
    status: "idle",
    progress: 0,
    pace: 1,
  },
  {
    id: "orch-board-yest",
    title: "Agent orchestration board user testing",
    repo: "proto-vibes-playground",
    added: 0,
    removed: 0,
    time: "23 hrs ago",
    group: "yesterday",
    status: "idle",
    progress: 0,
    pace: 1,
  },
  {
    id: "settings-endpoint",
    title: "GitHub managed settings endpoint",
    repo: "vscode",
    added: 0,
    removed: 0,
    time: "23 hrs ago",
    group: "yesterday",
    status: "idle",
    progress: 0,
    pace: 1,
  },
  {
    id: "deck-feedback",
    title: "deck feedback and encouragement",
    repo: "vscode-cdnotes",
    added: 0,
    removed: 0,
    time: "23 hrs ago",
    group: "yesterday",
    status: "idle",
    progress: 0,
    pace: 1,
  },
  {
    id: "orch-board-week",
    title: "Agent orchestration board user testing",
    repo: "proto-vibes-playground",
    added: 0,
    removed: 0,
    time: "2 days ago",
    group: "week",
    status: "idle",
    progress: 0,
    pace: 1,
  },
];

const GROUPS: { key: Session["group"]; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "Last 7 Days" },
];

function clone(list: Session[]): Session[] {
  return list.map((s) => ({ ...s }));
}

export default function AgentSessionsProgressPage() {
  const [sessions, setSessions] = useState<Session[]>(() => clone(INITIAL));
  const [selectedId, setSelectedId] = useState<string>("card-updates");
  const [running, setRunning] = useState(true);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeCount = sessions.filter(
    (s) => s.status === "running" || s.status === "input-needed" || s.status === "queued"
  ).length;

  useEffect(() => {
    if (!running) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }

    tickRef.current = setInterval(() => {
      setSessions((prev) => {
        let anyActive = false;
        const next = prev.map((s) => {
          if (s.group !== "today") return s;

          // promote a queued session when there's headroom
          if (s.status === "queued") {
            anyActive = true;
            const runningNow = prev.filter((x) => x.status === "running").length;
            if (runningNow < 5 && Math.random() < 0.04) {
              return { ...s, status: "running" as Status, progress: 1 };
            }
            return s;
          }

          if (s.status === "running") {
            anyActive = true;
            const speed = s.pace * (0.6 + Math.random() * 1.1);
            let progress = Math.min(100, s.progress + speed);

            // pause for input once, if configured
            if (
              s.inputAt != null &&
              !s.inputDone &&
              progress >= s.inputAt
            ) {
              return {
                ...s,
                progress: s.inputAt,
                status: "input-needed" as Status,
                inputDone: true,
              };
            }

            if (progress >= 100) {
              return { ...s, progress: 100, status: "completed" as Status, time: "just now" };
            }
            return { ...s, progress };
          }

          if (s.status === "input-needed") {
            anyActive = true;
          }
          return s;
        });

        if (!anyActive) setRunning(false);
        return next;
      });
    }, 130);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running]);

  const resolveInput = useCallback((id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "running" as Status, progress: Math.max(s.progress, (s.inputAt ?? 0) + 2) }
          : s
      )
    );
    setRunning(true);
  }, []);

  const restart = useCallback(() => {
    setSessions(clone(INITIAL));
    setSelectedId("card-updates");
    setRunning(true);
  }, []);

  return (
    <div className={styles.frame}>
      <aside className={styles.sidebar}>
        <header className={styles.sidebarHeader}>
          <div className={styles.headerTitle}>
            <Codicon name="copilot" className={styles.headerIcon} />
            <span>Agent Sessions</span>
          </div>
          <div className={styles.headerActions}>
            <span className={styles.activePill}>
              <span className={styles.activeDot} />
              {activeCount} active
            </span>
            <button className={styles.iconButton} title="New session" aria-label="New session">
              <Codicon name="add" />
            </button>
          </div>
        </header>

        <div className={styles.searchRow}>
          <Codicon name="search" className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>Search sessions</span>
        </div>

        <div className={styles.list}>
          {GROUPS.map((group) => {
            const rows = sessions.filter((s) => s.group === group.key);
            if (rows.length === 0) return null;
            return (
              <section key={group.key} className={styles.group}>
                <div className={styles.groupLabel}>{group.label}</div>
                {rows.map((s) => (
                  <SessionRow
                    key={s.id}
                    session={s}
                    selected={s.id === selectedId}
                    onSelect={() => setSelectedId(s.id)}
                    onResolve={() => resolveInput(s.id)}
                  />
                ))}
              </section>
            );
          })}
        </div>
      </aside>

      <button
        className={styles.replay}
        onClick={restart}
        title="Replay simulation"
        aria-label="Replay simulation"
      >
        <Codicon name="debug-restart" />
        <span>Replay</span>
      </button>
    </div>
  );
}

function SessionRow({
  session,
  selected,
  onSelect,
  onResolve,
}: {
  session: Session;
  selected: boolean;
  onSelect: () => void;
  onResolve: () => void;
}) {
  const { status, progress } = session;
  const active = status === "running" || status === "input-needed";
  const showDiff = (session.added > 0 || session.removed > 0) && status !== "input-needed";

  return (
    <div
      className={`${styles.row} ${selected ? styles.rowSelected : ""} ${styles[`row_${status}`]}`}
      onClick={onSelect}
    >
      <span className={styles.statusGutter}>
        <StatusDot status={status} />
      </span>

      <div className={styles.rowBody}>
        <div className={styles.rowTitle}>{session.title}</div>

        <div className={styles.rowMeta}>
          {status === "input-needed" ? (
            <span className={styles.inputPill}>
              <Codicon name="comment-discussion" className={styles.inputPillIcon} />
              Input needed
            </span>
          ) : (
            <>
              <Codicon name="repo" className={styles.repoIcon} />
              <span className={styles.repoName}>{session.repo}</span>
              {showDiff && (
                <span className={styles.diff}>
                  <span className={styles.diffAdd}>+{session.added}</span>
                  <span className={styles.diffRemove}>−{session.removed}</span>
                </span>
              )}
              {status === "running" && (
                <span className={styles.percent}>{Math.round(progress)}%</span>
              )}
              {status === "completed" && (
                <span className={styles.doneTag}>
                  <Codicon name="check" />
                  Done
                </span>
              )}
              <span className={styles.dotSep}>·</span>
              <span className={styles.time}>{session.time}</span>
            </>
          )}
        </div>

        {status === "input-needed" && session.inputPrompt && selected && (
          <div className={styles.inputBlock}>
            <div className={styles.inputPrompt}>{session.inputPrompt}</div>
            <div className={styles.inputOptions}>
              {session.inputOptions?.map((opt) => (
                <button
                  key={opt}
                  className={styles.inputOption}
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve();
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {active && (
        <div className={`${styles.track} ${status === "input-needed" ? styles.trackPaused : ""}`}>
          <div
            className={`${styles.bar} ${status === "input-needed" ? styles.barPaused : styles.barRunning}`}
            style={{ width: `${progress}%` }}
          >
            {status === "running" && <span className={styles.shimmer} />}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: Status }) {
  if (status === "running") {
    return <Codicon name="loading" spin className={styles.dotRunning} />;
  }
  if (status === "input-needed") {
    return <span className={styles.dotInput} />;
  }
  if (status === "completed") {
    return <Codicon name="pass-filled" className={styles.dotDone} />;
  }
  if (status === "queued") {
    return <span className={styles.dotQueued} />;
  }
  return <span className={styles.dotIdle} />;
}
