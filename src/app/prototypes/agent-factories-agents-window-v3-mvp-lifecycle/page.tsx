"use client";

import { useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type Stage = "define" | "test" | "publish" | "today";
type RunState = "observing" | "fixing" | "approval" | "verifying" | "complete";

const stages: { id: Stage; label: string; icon: string }[] = [
  { id: "define", label: "Define", icon: "edit" },
  { id: "test", label: "Test", icon: "beaker" },
  { id: "publish", label: "Publish", icon: "cloud-upload" },
  { id: "today", label: "Use", icon: "play" },
];

const workflow = [
  { icon: "eye", label: "Observe", detail: "Required CI and review feedback", owner: "Agent Host" },
  { icon: "wrench", label: "Repair", detail: "Fix actionable blockers in a worktree", owner: "Copilot" },
  { icon: "beaker", label: "Verify", detail: "Run required checks independently", owner: "Verifier" },
  { icon: "person", label: "Ask", detail: "Only for product or policy decisions", owner: "You" },
];

function IconButton({ name, label }: { name: string; label: string }) {
  return (
    <button className={styles.iconButton} aria-label={label} title={label}>
      <Codicon name={name} />
    </button>
  );
}

function StateIcon({ state }: { state: "ready" | "running" | "waiting" | "done" }) {
  const icons = { ready: "circle-outline", running: "loading", waiting: "account", done: "pass-filled" };
  return <Codicon name={icons[state]} spin={state === "running"} className={styles[`state_${state}`]} />;
}

export default function AgentFactoryMvpLifecyclePage() {
  const [stage, setStage] = useState<Stage>("define");
  const [draftImproved, setDraftImproved] = useState(false);
  const [testRan, setTestRan] = useState(false);
  const [published, setPublished] = useState(false);
  const [runState, setRunState] = useState<RunState>("observing");
  const [filesView, setFilesView] = useState<"changes" | "files">("changes");

  const unlocked: Record<Stage, boolean> = {
    define: true,
    test: draftImproved,
    publish: testRan,
    today: published,
  };

  const go = (next: Stage) => {
    if (unlocked[next]) setStage(next);
  };

  return (
    <main className={styles.window}>
      <header className={styles.titleBar}>
        <div className={styles.crumb}>
          <Codicon name="type-hierarchy-super" />
          <span>Factories</span>
          <span>/</span>
          <strong>Keep PR green</strong>
          {published && <span className={styles.published}><Codicon name="verified-filled" /> Published</span>}
        </div>
        <nav className={styles.lifecycle} aria-label="Factory lifecycle">
          {stages.map((item, index) => {
            const activeIndex = stages.findIndex((candidate) => candidate.id === stage);
            const done = index < activeIndex || (item.id === "today" && runState === "complete");
            return (
              <button
                key={item.id}
                className={`${stage === item.id ? styles.lifecycleActive : ""} ${done ? styles.lifecycleDone : ""}`}
                disabled={!unlocked[item.id]}
                onClick={() => go(item.id)}
                aria-current={stage === item.id ? "step" : undefined}
              >
                <Codicon name={done ? "check" : item.icon} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className={styles.titleActions}>
          <IconButton name="history" label="Factory history" />
          <IconButton name="ellipsis" label="More actions" />
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>AGENTS</div>
          <div className={styles.navItem}><Codicon name="comment-discussion" /> Sessions</div>
          <div className={`${styles.navItem} ${styles.navActive}`}><Codicon name="type-hierarchy-super" /> Factories <span>1</span></div>
          <div className={styles.factoryRow}>
            <Codicon name="git-pull-request" />
            <span><strong>Keep PR green</strong><small>{published ? "Published · runs on PR updates" : "Draft · workspace factory"}</small></span>
            <StateIcon state={published ? "done" : "ready"} />
          </div>
          <div className={styles.sidebarSection}>CUSTOMIZATIONS</div>
          <div className={styles.navItem}><Codicon name="hubot" /> Agents</div>
          <div className={styles.navItem}><Codicon name="lightbulb" /> Skills</div>
          <div className={styles.navItem}><Codicon name="tools" /> Tools</div>

          <div className={styles.factoryFile}>
            <div><Codicon name="file-code" /><strong>keep-pr-green.factory.ts</strong></div>
            <small>Source-controlled in .github/factories</small>
          </div>
        </aside>

        <section className={styles.content}>
          {stage === "define" && (
            <DefineStage
              improved={draftImproved}
              onImprove={() => setDraftImproved(true)}
              onContinue={() => setStage("test")}
            />
          )}
          {stage === "test" && (
            <TestStage
              ran={testRan}
              onRun={() => setTestRan(true)}
              onContinue={() => setStage("publish")}
            />
          )}
          {stage === "publish" && (
            <PublishStage
              published={published}
              onPublish={() => setPublished(true)}
              onContinue={() => setStage("today")}
            />
          )}
          {stage === "today" && (
            <TodayStage state={runState} onState={setRunState} />
          )}
        </section>

        <aside className={styles.inspector}>
          <div className={styles.inspectorTabs}>
            <button className={filesView === "changes" ? styles.inspectorTabActive : ""} onClick={() => setFilesView("changes")}>
              <Codicon name="diff" /> Changes
            </button>
            <button className={filesView === "files" ? styles.inspectorTabActive : ""} onClick={() => setFilesView("files")}>
              <Codicon name="files" /> Files
            </button>
          </div>
          {filesView === "changes" ? (
            <ChangesPanel stage={stage} improved={draftImproved} />
          ) : (
            <FilesPanel />
          )}
        </aside>
      </div>

      <footer className={styles.statusBar}>
        <span><Codicon name="remote" /> Agent Host · local</span>
        <span><Codicon name="git-branch" /> main</span>
        <span className={styles.spacer} />
        <span>{published ? "Factory v1 published" : "Factory draft"}</span>
        <span><Codicon name="bell" /></span>
      </footer>
    </main>
  );
}

function StageHeader({ step, title, detail }: { step: string; title: string; detail: string }) {
  return (
    <header className={styles.stageHeader}>
      <div className={styles.stepNumber}>{step}</div>
      <div><h1>{title}</h1><p>{detail}</p></div>
    </header>
  );
}

function DefineStage({ improved, onImprove, onContinue }: { improved: boolean; onImprove: () => void; onContinue: () => void }) {
  return (
    <div className={styles.stage}>
      <StageHeader step="1" title="Define the job" detail="Describe the outcome. The factory assistant turns it into a bounded, reviewable workflow." />
      <div className={styles.defineGrid}>
        <div className={styles.formPane}>
          <label>WHEN</label>
          <button className={styles.selectControl}><Codicon name="git-pull-request" /> A pull request changes <Codicon name="chevron-down" /></button>
          <label>GOAL</label>
          <div className={styles.goalInput}>
            Keep required CI green and address actionable review feedback. Ask me before changing product behavior.
          </div>
          <label>WORKFLOW</label>
          <div className={styles.workflowList}>
            {workflow.map((item, index) => (
              <div key={item.label} className={styles.workflowRow}>
                <span className={styles.workflowIndex}>{index + 1}</span>
                <Codicon name={item.icon} />
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                <em>{item.owner}</em>
              </div>
            ))}
          </div>
          <div className={styles.limitsRow}>
            <span><label>CONCURRENCY</label><strong>2 agents</strong></span>
            <span><label>COST LIMIT</label><strong>8 credits / run</strong></span>
            <span><label>STOP AFTER</label><strong>45 minutes</strong></span>
          </div>
        </div>
        <aside className={styles.assistantPane}>
          <div className={styles.assistantHeading}><Codicon name="sparkle" /><span><strong>Factory assistant</strong><small>Checks the draft, not just the syntax</small></span></div>
          {!improved ? (
            <>
              <div className={styles.finding}>
                <Codicon name="warning" />
                <div><strong>Verification can repeat work</strong><p>The verifier has no durable key, so a resume could rerun completed checks.</p></div>
              </div>
              <div className={styles.finding}>
                <Codicon name="info" />
                <div><strong>Approval boundary is clear</strong><p>Only product behavior changes wait for you. CI repairs continue unattended.</p></div>
              </div>
              <button className={styles.primaryWide} onClick={onImprove}><Codicon name="sparkle" /> Apply safe improvement</button>
            </>
          ) : (
            <>
              <div className={styles.successBlock}>
                <Codicon name="pass-filled" />
                <div><strong>Draft is ready to test</strong><p>Added a durable key to verification. Limits and approval policy are unchanged.</p></div>
              </div>
              <div className={styles.diffSnippet}>
                <span>− verify({`{`} role: &quot;verifier&quot; {`}`})</span>
                <strong>+ verify({`{`} role: &quot;verifier&quot;, durable: &quot;required-checks&quot; {`}`})</strong>
              </div>
              <button className={styles.primaryWide} onClick={onContinue}>Test with a real fixture <Codicon name="arrow-right" /></button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function TestStage({ ran, onRun, onContinue }: { ran: boolean; onRun: () => void; onContinue: () => void }) {
  return (
    <div className={styles.stage}>
      <StageHeader step="2" title="Replay before publishing" detail="Run the draft against one representative PR event. Nothing is pushed and no live review is changed." />
      <div className={styles.testLayout}>
        <div className={styles.fixtureHeader}>
          <span><Codicon name="archive" /><strong>Fixture: failing Windows CI + review comment</strong></span>
          <small>Captured from PR #1842 · secrets removed</small>
          {!ran && <button className={styles.primaryButton} onClick={onRun}><Codicon name="play" /> Run replay</button>}
        </div>
        <div className={styles.trace}>
          <TraceRow state="done" title="Observe" detail="1 failed check · 1 actionable review thread" meta="3s" />
          <TraceRow state={ran ? "done" : "ready"} title="Repair" detail={ran ? "Updated Windows path normalization" : "Waiting for replay"} meta={ran ? "1.8 cr" : "—"} />
          <TraceRow state={ran ? "done" : "ready"} title="Verify" detail={ran ? "Linux restored from journal · Windows passed" : "Waiting for repair"} meta={ran ? "1.2 cr" : "—"} />
          <TraceRow state={ran ? "done" : "ready"} title="Ask" detail={ran ? "Skipped · no product behavior changed" : "Conditional gate"} meta="—" />
        </div>
        {ran && (
          <div className={styles.testResult}>
            <div><Codicon name="pass-filled" /><span><strong>Replay passed</strong><small>All completion rules satisfied</small></span></div>
            <dl>
              <div><dt>Quality</dt><dd>4 / 4 checks</dd></div>
              <div><dt>Cost</dt><dd>3.2 / 8 credits</dd></div>
              <div><dt>Agents</dt><dd>2 peak</dd></div>
              <div><dt>Time</dt><dd>6m 14s</dd></div>
            </dl>
            <button className={styles.primaryButton} onClick={onContinue}>Review and publish <Codicon name="arrow-right" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function TraceRow({ state, title, detail, meta }: { state: "ready" | "done"; title: string; detail: string; meta: string }) {
  return (
    <div className={styles.traceRow}>
      <StateIcon state={state} />
      <span><strong>{title}</strong><small>{detail}</small></span>
      <em>{meta}</em>
    </div>
  );
}

function PublishStage({ published, onPublish, onContinue }: { published: boolean; onPublish: () => void; onContinue: () => void }) {
  return (
    <div className={styles.stage}>
      <StageHeader step="3" title="Publish to this workspace" detail="The factory remains source-controlled. Publishing registers the reviewed version with Agent Host." />
      <div className={styles.publishCard}>
        <div className={styles.publishIdentity}>
          <Codicon name="type-hierarchy-super" />
          <span><strong>Keep PR green</strong><small>.github/factories/keep-pr-green.factory.ts</small></span>
          <span className={styles.version}>v1</span>
        </div>
        <div className={styles.publishRows}>
          <div><span>Trigger</span><strong>PR updates in this workspace</strong></div>
          <div><span>Capabilities</span><strong>Read PRs · edit worktree · run checks</strong></div>
          <div><span>Human gate</span><strong>Product or policy behavior changes</strong></div>
          <div><span>Limits</span><strong>2 concurrent · 8 credits · 45 minutes</strong></div>
          <div><span>Validated by</span><strong>1 replay fixture · 4 completion checks</strong></div>
        </div>
        {!published ? (
          <div className={styles.publishFooter}>
            <p><Codicon name="shield" /> Future limit or capability increases require another review.</p>
            <button className={styles.primaryButton} onClick={onPublish}><Codicon name="cloud-upload" /> Publish factory</button>
          </div>
        ) : (
          <div className={styles.publishedState}>
            <Codicon name="pass-filled" />
            <div><strong>Factory v1 published</strong><p>Agent Host is watching PR updates. You can close VS Code.</p></div>
            <button className={styles.primaryButton} onClick={onContinue}>See today&apos;s run <Codicon name="arrow-right" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

function TodayStage({ state, onState }: { state: RunState; onState: (state: RunState) => void }) {
  const approvalDone = state === "verifying" || state === "complete";
  return (
    <div className={styles.todayStage}>
      <StageHeader step="4" title="Use it in daily work" detail="The published factory appears with ordinary sessions. Open it only when it needs attention or review." />
      <div className={styles.runBanner}>
        <StateIcon state={state === "complete" ? "done" : state === "approval" ? "waiting" : "running"} />
        <span>
          <strong>{state === "complete" ? "PR #1842 is green" : state === "approval" ? "Your decision is needed" : "Repairing PR #1842"}</strong>
          <small>Keep PR green · run_84f2 · Agent Host</small>
        </span>
        <em>{state === "complete" ? "6m · 3.1 credits" : "Running without a client"}</em>
      </div>
      <div className={styles.dailyGrid}>
        <div className={styles.runTimeline}>
          <RunStep state="done" title="Observed PR update" detail="Windows CI failed after commit a18c2e" />
          <RunStep state={state === "observing" ? "running" : "done"} title="Repair session" detail="Normalized workspace paths in an isolated worktree" action={state === "observing" ? () => onState("fixing") : undefined} actionLabel="Continue run" />
          <RunStep state={state === "fixing" ? "running" : state === "observing" ? "ready" : "done"} title="Independent verification" detail="Linux restored · Windows passed" action={state === "fixing" ? () => onState("approval") : undefined} actionLabel="Complete check" />
          <RunStep state={state === "approval" ? "waiting" : approvalDone ? "done" : "ready"} title="Product decision" detail={approvalDone ? "Approved: preserve legacy path fallback" : "Path fallback changes compatibility behavior"} />
          <RunStep state={state === "verifying" ? "running" : state === "complete" ? "done" : "ready"} title="Wait for required CI" detail={state === "complete" ? "All 6 required checks passed" : "Agent Host observes the external check"} action={state === "verifying" ? () => onState("complete") : undefined} actionLabel="Simulate CI passing" />
        </div>
        <aside className={styles.dailyDetail}>
          {state === "approval" ? (
            <>
              <div className={styles.decisionTitle}><Codicon name="account" /><span><strong>Compatibility decision</strong><small>Requested by Repair session</small></span></div>
              <p>The fix can remove the legacy path fallback or preserve it for older extensions. The factory cannot infer the product policy.</p>
              <button className={styles.choice} onClick={() => onState("verifying")}><strong>Preserve fallback</strong><small>Recommended · keeps current compatibility</small></button>
              <button className={styles.choice} onClick={() => onState("verifying")}><strong>Remove fallback</strong><small>Smaller change · may break older extensions</small></button>
            </>
          ) : state === "complete" ? (
            <>
              <div className={styles.completionMark}><Codicon name="pass-filled" /></div>
              <h2>Ready for review</h2>
              <p>The factory fixed one blocker, resolved one review thread, and left a reviewable two-file diff.</p>
              <button className={styles.primaryWide}><Codicon name="diff" /> Review changes</button>
              <button className={styles.secondaryWide}>Open repair session</button>
            </>
          ) : (
            <>
              <div className={styles.liveMark}><Codicon name="radio-tower" /></div>
              <h2>No attention needed</h2>
              <p>Agent Host owns the run. Completed work is journaled and the factory will surface a decision only if its approval rule matches.</p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function RunStep({ state, title, detail, action, actionLabel }: { state: "ready" | "running" | "waiting" | "done"; title: string; detail: string; action?: () => void; actionLabel?: string }) {
  return (
    <div className={`${styles.runStep} ${styles[`runStep_${state}`]}`}>
      <StateIcon state={state} />
      <span><strong>{title}</strong><small>{detail}</small></span>
      {action && <button className={styles.secondaryButton} onClick={action}>{actionLabel}</button>}
    </div>
  );
}

function ChangesPanel({ stage, improved }: { stage: Stage; improved: boolean }) {
  return (
    <>
      <div className={styles.panelHeader}><span>Working Tree</span><small>{improved ? "2 files" : "1 file"}</small></div>
      <div className={styles.changeFile}><Codicon name="file-code" /><span>keep-pr-green.factory.ts</span><b>M</b></div>
      {improved && <div className={styles.changeFile}><Codicon name="beaker" /><span>pr-update.fixture.json</span><b>A</b></div>}
      <div className={styles.diffPreview}>
        <small>{stage === "today" ? "RUN RESULT" : "FACTORY SOURCE"}</small>
        {stage === "today" ? (
          <>
            <code>2 files changed</code>
            <ins>+ normalize Windows paths</ins>
            <ins>+ preserve legacy fallback</ins>
            <code>6 required checks passed</code>
          </>
        ) : (
          <>
            <code>defineFactory(&quot;Keep PR green&quot;, {`{`}</code>
            <code>  trigger: pr.updated(),</code>
            <code>  limits: {`{`} concurrent: 2, credits: 8 {`}`},</code>
            {improved && <ins>+ durable: &quot;required-checks&quot;,</ins>}
            <code>{`}`});</code>
          </>
        )}
      </div>
    </>
  );
}

function FilesPanel() {
  return (
    <div className={styles.filesTree}>
      <div><Codicon name="chevron-down" /><Codicon name="folder-opened" /> proto-vibes-playground</div>
      <div className={styles.indent}><Codicon name="chevron-down" /><Codicon name="folder" /> .github</div>
      <div className={styles.indent2}><Codicon name="chevron-down" /><Codicon name="folder" /> factories</div>
      <div className={styles.indent3}><Codicon name="file-code" /> keep-pr-green.factory.ts</div>
      <div className={styles.indent3}><Codicon name="beaker" /> pr-update.fixture.json</div>
      <div className={styles.indent}><Codicon name="chevron-right" /><Codicon name="folder" /> src</div>
    </div>
  );
}
