"use client";

import { useEffect, useState } from "react";
import { Codicon } from "../../components/codicon";
import styles from "./page.module.css";

type Variant = "code" | "spec" | "structure";
type Evidence = "diagnostic" | "trace" | "evals" | "cost";
type ImprovementStage = "evidence" | "hypothesis" | "change" | "compare" | "rollout";

const variantMeta: Record<Variant, { letter: string; label: string; detail: string }> = {
  code: { letter: "A", label: "Code", detail: "Schema-aware source" },
  spec: { letter: "B", label: "Co-author", detail: "Agent-guided spec" },
  structure: { letter: "C", label: "Structure", detail: "Source-backed outline" },
};

const steps = [
  { id: "observe", label: "Observe PR", role: "Scout", model: "GPT-5.4 mini", state: "ready" },
  { id: "investigate", label: "Investigate", role: "Scout", model: "GPT-5.4", state: "ready" },
  { id: "patch", label: "Apply fixes", role: "Fixer", model: "Claude Sonnet 5", state: "ready" },
  { id: "verify", label: "Verify", role: "Verifier", model: "GPT-5.4", state: "warning" },
  { id: "approval", label: "Product approval", role: "Owner", model: "Human gate", state: "gate" },
  { id: "wait", label: "Wait for CI", role: "Agent Host", model: "External event", state: "wait" },
];

const sourceBefore = [
  'export default defineFactory({',
  '  name: "Repair PR",',
  '  limits: { concurrent: 4, agents: 12, credits: 20 },',
  '  journal: durable({ resume: "completed-steps" }),',
  '  steps: [',
  '    observe({ role: "scout", model: "gpt-5.4-mini" }),',
  '    fanout("investigate", { max: 3, role: "scout" }),',
  '    fanout("patch", { max: 2, worktree: "isolated" }),',
  '    verify({ role: "verifier", retries: 2 }),',
  '    approve({ owner: "product", when: diff.telemetry }),',
  '    waitFor("required-checks", { timeout: "45m" }),',
  '  ],',
  '});',
];

function IconButton({ name, label, onClick }: { name: string; label: string; onClick?: () => void }) {
  return (
    <button className={styles.iconButton} aria-label={label} title={label} onClick={onClick}>
      <Codicon name={name} />
    </button>
  );
}

function Status({ kind }: { kind: "error" | "warning" | "success" | "info" }) {
  const icons = { error: "error", warning: "warning", success: "pass-filled", info: "info" };
  return <Codicon name={icons[kind]} className={styles[`status_${kind}`]} />;
}

export default function AgentFactoryAuthoringPage() {
  const [variant, setVariant] = useState<Variant>("code");
  const [evidence, setEvidence] = useState<Evidence>("diagnostic");
  const [selectedStep, setSelectedStep] = useState("verify");
  const [changeReady, setChangeReady] = useState(false);
  const [changeApplied, setChangeApplied] = useState(false);
  const [evalRan, setEvalRan] = useState(false);
  const [published, setPublished] = useState(false);
  const [conversationSent, setConversationSent] = useState(false);
  const [propertyEdited, setPropertyEdited] = useState(false);
  const [problemsOpen, setProblemsOpen] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const fromHash = window.location.hash.slice(1);
      if (fromHash === "code" || fromHash === "spec" || fromHash === "structure") {
        setVariant(fromHash);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const selectVariant = (next: Variant) => {
    setVariant(next);
    window.history.replaceState(null, "", `#${next}`);
  };

  const improvementStage: ImprovementStage = published
    ? "rollout"
    : evalRan
      ? "compare"
      : changeApplied
        ? "change"
        : changeReady
          ? "hypothesis"
          : "evidence";

  const proposeChange = () => {
    setChangeReady(true);
    setEvidence("diagnostic");
  };

  const applyChange = () => {
    setChangeReady(true);
    setChangeApplied(true);
    setProblemsOpen(false);
  };

  const runEval = () => {
    setChangeApplied(true);
    setEvalRan(true);
    setEvidence("evals");
  };

  return (
    <main className={styles.window}>
      <header className={styles.titleBar}>
        <div className={styles.crumb}>
          <Codicon name="type-hierarchy-super" />
          <span>Factories</span>
          <span>/</span>
          <strong>Repair PR</strong>
          <span className={styles.branch}>factory/pr-repair</span>
        </div>
        <nav className={styles.variantSwitch} aria-label="Authoring approach">
          {(Object.keys(variantMeta) as Variant[]).map((key) => (
            <button
              key={key}
              className={variant === key ? styles.variantActive : ""}
              onClick={() => selectVariant(key)}
              aria-pressed={variant === key}
              title={variantMeta[key].detail}
            >
              <b>{variantMeta[key].letter}</b>
              <span>{variantMeta[key].label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.titleActions}>
          <button className={styles.secondaryButton}><Codicon name="history" /> 18 runs</button>
          <IconButton name="split-horizontal" label="Split editor" />
          <IconButton name="ellipsis" label="More actions" />
        </div>
      </header>

      <div className={styles.body}>
        <ActivityBar />
        <FactoryExplorer selectedStep={selectedStep} onStep={setSelectedStep} published={published} />

        <section className={styles.editorArea}>
          <div className={styles.editorTabs}>
            <div className={styles.editorTabActive}>
              <Codicon name={variant === "spec" ? "comment-discussion" : variant === "structure" ? "list-tree" : "file-code"} />
              <span>{variant === "spec" ? "Factory co-author" : variant === "structure" ? "Repair PR · Structure" : "repair-pr.factory.ts"}</span>
              {changeApplied && <span className={styles.dirty} />}
              <Codicon name="close" />
            </div>
            <div className={styles.editorTab}><Codicon name="beaker" /> repair-pr.eval.ts</div>
          </div>

          <ImprovementLoop stage={improvementStage} />

          <div className={styles.authoring}>
            {variant === "code" && (
              <CodeAuthoring
                changeReady={changeReady}
                changeApplied={changeApplied}
                onPropose={proposeChange}
                onApply={applyChange}
              />
            )}
            {variant === "spec" && (
              <SpecAuthoring
                sent={conversationSent}
                changeReady={changeReady}
                changeApplied={changeApplied}
                onSend={() => {
                  setConversationSent(true);
                  proposeChange();
                }}
                onApply={applyChange}
              />
            )}
            {variant === "structure" && (
              <StructureAuthoring
                selectedStep={selectedStep}
                propertyEdited={propertyEdited}
                changeApplied={changeApplied}
                onStep={setSelectedStep}
                onEdit={() => {
                  setPropertyEdited(true);
                  proposeChange();
                }}
                onApply={applyChange}
              />
            )}
          </div>

          <BottomPanel
            open={problemsOpen}
            changeApplied={changeApplied}
            onToggle={() => setProblemsOpen((value) => !value)}
            onPropose={proposeChange}
          />
        </section>

        <EvidencePanel
          selected={evidence}
          onSelect={setEvidence}
          changeReady={changeReady}
          changeApplied={changeApplied}
          evalRan={evalRan}
          published={published}
          onPropose={proposeChange}
          onApply={applyChange}
          onEval={runEval}
          onPublish={() => setPublished(true)}
        />
      </div>

      <footer className={styles.statusBar}>
        <span><Codicon name="git-branch" /> factory/pr-repair*</span>
        <span><Codicon name="error" /> {changeApplied ? "0" : "1"} <Codicon name="warning" /> {changeApplied ? "1" : "2"}</span>
        <span className={styles.spacer} />
        <span>Factory schema 0.8</span>
        <span><Codicon name="shield" /> Policy: workspace</span>
        <span><Codicon name="remote" /> Agent Host ready</span>
      </footer>
    </main>
  );
}

function ActivityBar() {
  return (
    <aside className={styles.activityBar} aria-label="Activity bar">
      {["files", "search", "source-control", "run-all", "extensions"].map((icon, index) => (
        <button key={icon} className={index === 3 ? styles.activityActive : ""}><Codicon name={icon} /></button>
      ))}
      <span />
      <button><Codicon name="account" /></button>
      <button><Codicon name="settings-gear" /></button>
    </aside>
  );
}

function FactoryExplorer({
  selectedStep,
  onStep,
  published,
}: {
  selectedStep: string;
  onStep: (id: string) => void;
  published: boolean;
}) {
  return (
    <aside className={styles.explorer}>
      <div className={styles.paneTitle}><span>FACTORY EXPLORER</span><IconButton name="ellipsis" label="Explorer actions" /></div>
      <div className={styles.factoryIdentity}>
        <div><Codicon name="type-hierarchy-super" /><strong>Repair PR</strong></div>
        <small>v7 {published ? "published just now" : "published 3d ago"}</small>
      </div>
      <div className={styles.treeSection}>
        <div className={styles.treeHeading}><Codicon name="chevron-down" /><strong>ORCHESTRATION</strong></div>
        {steps.map((step) => (
          <button
            key={step.id}
            className={`${styles.treeItem} ${selectedStep === step.id ? styles.treeSelected : ""}`}
            onClick={() => onStep(step.id)}
          >
            <Codicon name={step.state === "warning" ? "warning" : step.state === "gate" ? "lock" : step.state === "wait" ? "clock" : "circle-small-filled"} />
            <span><strong>{step.label}</strong><small>{step.role}</small></span>
          </button>
        ))}
      </div>
      <div className={styles.treeSection}>
        <div className={styles.treeHeading}><Codicon name="chevron-down" /><strong>FACTORY FILES</strong></div>
        <div className={styles.fileItem}><Codicon name="file-code" /><span>repair-pr.factory.ts</span><i>M</i></div>
        <div className={styles.fileItem}><Codicon name="beaker" /><span>repair-pr.eval.ts</span></div>
        <div className={styles.fileItem}><Codicon name="file" /><span>fixtures/windows-path.json</span></div>
        <div className={styles.fileItem}><Codicon name="book" /><span>prompts/verifier.md</span></div>
      </div>
      <div className={styles.treeSection}>
        <div className={styles.treeHeading}><Codicon name="chevron-down" /><strong>RECENT RUNS</strong></div>
        <div className={styles.runItem}><Status kind="error" /><span><strong>run_c91a</strong><small>14.8 cr · 71m</small></span></div>
        <div className={styles.runItem}><Status kind="success" /><span><strong>run_b72e</strong><small>11.2 cr · 42m</small></span></div>
      </div>
      <div className={styles.boundaryNote}>
        <Codicon name="info" />
        <p><strong>Factory owns orchestration.</strong> Child sessions own chats, worktrees, files, and terminals.</p>
      </div>
    </aside>
  );
}

function ImprovementLoop({ stage }: { stage: ImprovementStage }) {
  const stages: { id: ImprovementStage; label: string; icon: string }[] = [
    { id: "evidence", label: "Evidence", icon: "pulse" },
    { id: "hypothesis", label: "Hypothesis", icon: "lightbulb" },
    { id: "change", label: "Source change", icon: "diff" },
    { id: "compare", label: "Compare", icon: "beaker" },
    { id: "rollout", label: "Rollout", icon: "rocket" },
  ];
  const activeIndex = stages.findIndex((item) => item.id === stage);
  return (
    <div className={styles.loopBar}>
      <span className={styles.loopLabel}>IMPROVEMENT LOOP</span>
      {stages.map((item, index) => (
        <div key={item.id} className={`${styles.loopStage} ${index <= activeIndex ? styles.loopStageDone : ""} ${index === activeIndex ? styles.loopStageActive : ""}`}>
          <Codicon name={index < activeIndex ? "check" : item.icon} />
          <span>{item.label}</span>
          {index < stages.length - 1 && <Codicon name="chevron-right" />}
        </div>
      ))}
    </div>
  );
}

function CodeAuthoring({
  changeReady,
  changeApplied,
  onPropose,
  onApply,
}: {
  changeReady: boolean;
  changeApplied: boolean;
  onPropose: () => void;
  onApply: () => void;
}) {
  return (
    <div className={styles.codeWorkspace}>
      <div className={styles.breadcrumbs}>src <Codicon name="chevron-right" /> factories <Codicon name="chevron-right" /> repair-pr.factory.ts <Codicon name="chevron-right" /> <span>verify</span></div>
      <div className={styles.codeEditor}>
        {sourceBefore.map((line, index) => {
          const diagnostic = index === 8 && !changeApplied;
          const modified = index === 8 && changeApplied;
          return (
            <div key={line} className={`${styles.codeLine} ${diagnostic ? styles.codeDiagnostic : ""} ${modified ? styles.codeModified : ""}`}>
              <span>{index + 1}</span>
              <code>{modified ? '    verify({ role: "verifier", retries: 1, fixture: "windows-path" }),' : line}</code>
              {diagnostic && <Status kind="warning" />}
            </div>
          );
        })}
      </div>
      {!changeReady && !changeApplied && (
        <div className={styles.codeAction}>
          <div><Codicon name="sparkle" /><span><strong>Recurring failure detected</strong><small>3 of 5 recent runs retried Windows path verification after identical tool output.</small></span></div>
          <button className={styles.primaryButton} onClick={onPropose}>Propose bounded fix</button>
        </div>
      )}
      {changeReady && !changeApplied && (
        <InlineDiff onApply={onApply} compact />
      )}
      {changeApplied && (
        <div className={styles.appliedBanner}><Status kind="success" /><span><strong>Source updated</strong><small>Retry reduced to 1 and deterministic fixture added. Eval comparison is ready.</small></span></div>
      )}
    </div>
  );
}

function SpecAuthoring({
  sent,
  changeReady,
  changeApplied,
  onSend,
  onApply,
}: {
  sent: boolean;
  changeReady: boolean;
  changeApplied: boolean;
  onSend: () => void;
  onApply: () => void;
}) {
  return (
    <div className={styles.specWorkspace}>
      <div className={styles.chatHeader}>
        <span><Codicon name="copilot" /><strong>Factory co-author</strong></span>
        <small>Edits durable source only after review</small>
      </div>
      <div className={styles.chatBody}>
        <div className={styles.contextCard}>
          <Codicon name="pulse" />
          <div><strong>Attached evidence</strong><p>run_c91a trace · 5-run regression · 24 eval cases · workspace policy</p></div>
        </div>
        <div className={styles.userMessage}>
          Reduce recurring verifier failures without weakening independent verification or increasing the 20-credit ceiling.
        </div>
        {(sent || changeReady) && (
          <div className={styles.agentMessage}>
            <div className={styles.agentLabel}><Codicon name="copilot" /><strong>Factory co-author</strong><span>grounded in 5 runs</span></div>
            <p>The retry is not recovering a transient failure. All three retries repeat the same Windows path miss. I propose one bounded source change:</p>
            <ol>
              <li>Add <code>windows-path.json</code> as a deterministic verifier fixture.</li>
              <li>Reduce verifier retries from 2 to 1, preserving warm resume and independent ownership.</li>
              <li>Do not change model, fan-out, approval policy, or credit ceiling.</li>
            </ol>
            <div className={styles.rationale}>
              <Status kind="info" />
              <span><strong>Confidence 0.82</strong><small>High evidence agreement; uncertainty remains on two monorepo cases. Both stay in the eval set.</small></span>
            </div>
            {!changeApplied && <InlineDiff onApply={onApply} />}
            {changeApplied && <div className={styles.appliedBanner}><Status kind="success" /><span><strong>Applied to 2 files</strong><small>Source and fixture are visible in Source Control. No run has started.</small></span></div>}
          </div>
        )}
      </div>
      {!sent && !changeReady && (
        <div className={styles.promptBox}>
          <span>Ask the co-author to diagnose, refactor, or update this factory…</span>
          <div><span><Codicon name="paperclip" /> 5 runs</span><span><Codicon name="shield" /> Respect policy + budget</span><button onClick={onSend}><Codicon name="send" /></button></div>
        </div>
      )}
    </div>
  );
}

function StructureAuthoring({
  selectedStep,
  propertyEdited,
  changeApplied,
  onStep,
  onEdit,
  onApply,
}: {
  selectedStep: string;
  propertyEdited: boolean;
  changeApplied: boolean;
  onStep: (id: string) => void;
  onEdit: () => void;
  onApply: () => void;
}) {
  const step = steps.find((item) => item.id === selectedStep) ?? steps[3];
  return (
    <div className={styles.structureWorkspace}>
      <div className={styles.outline}>
        <div className={styles.outlineHeader}><strong>Execution outline</strong><span>Source order</span></div>
        {steps.map((item, index) => (
          <button key={item.id} className={`${styles.outlineStep} ${selectedStep === item.id ? styles.outlineSelected : ""}`} onClick={() => onStep(item.id)}>
            <span className={styles.stepIndex}>{index + 1}</span>
            <span><strong>{item.label}</strong><small>{item.role} · {item.model}</small></span>
            {item.state === "warning" && <Status kind="warning" />}
            {item.state === "gate" && <Codicon name="lock" />}
            {item.state === "wait" && <Codicon name="clock" />}
          </button>
        ))}
        <div className={styles.edgeLabel}><Codicon name="arrow-down" /> durable journal between steps</div>
      </div>
      <div className={styles.properties}>
        <div className={styles.propertiesHeader}><span><Codicon name="settings-gear" /><strong>{step.label}</strong></span><button className={styles.linkButton}>Open source</button></div>
        {selectedStep === "verify" ? (
          <>
            <Property label="Role" value="Verifier · independent child session" />
            <Property label="Model" value="GPT-5.4 · 2.0 credit cap" meter="quality 91 · 1.8 cr median" />
            <Property label="Stop condition" value="All platform fixtures pass" />
            <div className={styles.property}>
              <label>Retries</label>
              <div className={styles.segmented}>
                {[0, 1, 2].map((value) => (
                  <button key={value} className={(propertyEdited ? value === 1 : value === 2) ? styles.segmentActive : ""} onClick={value === 1 ? onEdit : undefined}>{value}</button>
                ))}
              </div>
              <small>Retries consume up to 2 credits each.</small>
            </div>
            <Property label="Fixture" value={propertyEdited || changeApplied ? "fixtures/windows-path.json" : "Live repository only"} warning={!propertyEdited && !changeApplied} />
            <div className={styles.policyCard}><Codicon name="shield" /><span><strong>Policy boundary</strong><small>This role remains read-only and cannot approve its own patch.</small></span></div>
            {propertyEdited && !changeApplied && <InlineDiff onApply={onApply} compact />}
            {changeApplied && <div className={styles.appliedBanner}><Status kind="success" /><span><strong>Source updated</strong><small>Outline and properties are projections of the saved diff.</small></span></div>}
          </>
        ) : (
          <>
            <Property label="Owner" value={`${step.role} child session`} />
            <Property label="Model / event" value={step.model} />
            <Property label="Persistence" value={step.id === "wait" ? "Agent Host observes; no client required" : "Journal output before advancing"} />
            <div className={styles.boundaryCard}><Codicon name="workspace-trusted" /><p>The factory sequences and bounds this step. Its child session still owns the conversation, worktree, files, and terminal.</p></div>
          </>
        )}
      </div>
    </div>
  );
}

function Property({ label, value, meter, warning }: { label: string; value: string; meter?: string; warning?: boolean }) {
  return (
    <div className={styles.property}>
      <label>{label}</label>
      <button className={styles.propertyValue}>{value}<Codicon name="chevron-down" /></button>
      {meter && <small><Codicon name="pulse" /> {meter}</small>}
      {warning && <small className={styles.warningText}><Codicon name="warning" /> Missing regression fixture</small>}
    </div>
  );
}

function InlineDiff({ onApply, compact }: { onApply: () => void; compact?: boolean }) {
  return (
    <div className={`${styles.inlineDiff} ${compact ? styles.inlineDiffCompact : ""}`}>
      <div className={styles.diffHeader}>
        <span><Codicon name="diff" /><strong>Proposed change</strong><small>2 files · +18 −2</small></span>
        <span><button className={styles.linkButton}>Open full diff</button><button className={styles.primaryButton} onClick={onApply}>Apply</button></span>
      </div>
      <div className={styles.diffLineRemoved}>− verify({`{ role: "verifier", retries: 2 }`}),</div>
      <div className={styles.diffLineAdded}>+ verify({`{ role: "verifier", retries: 1, fixture: "windows-path" }`}),</div>
      <div className={styles.diffFooter}><Codicon name="shield" /> Within policy · projected −2.1 credits/run · no role or gate changes</div>
    </div>
  );
}

function BottomPanel({
  open,
  changeApplied,
  onToggle,
  onPropose,
}: {
  open: boolean;
  changeApplied: boolean;
  onToggle: () => void;
  onPropose: () => void;
}) {
  return (
    <div className={`${styles.bottomPanel} ${open ? styles.bottomPanelOpen : ""}`}>
      <div className={styles.panelTabs}>
        <button className={styles.panelTabActive} onClick={onToggle}>PROBLEMS <b>{changeApplied ? 1 : 3}</b></button>
        <button>TRACE</button><button>OUTPUT</button>
        <span />
        <IconButton name={open ? "chevron-down" : "chevron-up"} label="Toggle panel" onClick={onToggle} />
      </div>
      {open && (
        <div className={styles.problemList}>
          {!changeApplied && <button onClick={onPropose}><Status kind="warning" /><span><strong>Retry repeats deterministic verifier failure</strong><small>repair-pr.factory.ts:9 · 3/5 runs · projected waste 2.1 credits/run</small></span><Codicon name="sparkle" /></button>}
          <button><Status kind="warning" /><span><strong>Model alias gpt-5.4-mini retires Oct 15</strong><small>repair-pr.factory.ts:6 · replacement keeps price class</small></span><Codicon name="chevron-right" /></button>
          {!changeApplied && <button><Status kind="info" /><span><strong>Fan-out can reach 12 agents before approval</strong><small>Peak estimate 18.4 / 20 credits · policy allows, review recommended</small></span><Codicon name="chevron-right" /></button>}
        </div>
      )}
    </div>
  );
}

function EvidencePanel({
  selected,
  onSelect,
  changeReady,
  changeApplied,
  evalRan,
  published,
  onPropose,
  onApply,
  onEval,
  onPublish,
}: {
  selected: Evidence;
  onSelect: (value: Evidence) => void;
  changeReady: boolean;
  changeApplied: boolean;
  evalRan: boolean;
  published: boolean;
  onPropose: () => void;
  onApply: () => void;
  onEval: () => void;
  onPublish: () => void;
}) {
  const tabs: { id: Evidence; label: string; icon: string }[] = [
    { id: "diagnostic", label: "Finding", icon: "sparkle" },
    { id: "trace", label: "Trace", icon: "pulse" },
    { id: "evals", label: "Evals", icon: "beaker" },
    { id: "cost", label: "Limits", icon: "dashboard" },
  ];
  return (
    <aside className={styles.evidence}>
      <div className={styles.evidenceTabs}>
        {tabs.map((tab) => (
          <button key={tab.id} className={selected === tab.id ? styles.evidenceTabActive : ""} onClick={() => onSelect(tab.id)}>
            <Codicon name={tab.icon} /><span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className={styles.evidenceContent}>
        {selected === "diagnostic" && (
          <>
            <div className={styles.findingTitle}><Status kind={changeApplied ? "success" : "warning"} /><div><small>MAINTENANCE FINDING</small><h3>{changeApplied ? "Bounded fix applied" : "Verifier retry loop"}</h3></div></div>
            <p className={styles.lede}>{changeApplied ? "The durable source now adds a replayable Windows fixture and caps retries at one." : "Three of five recent runs repeated the same deterministic Windows path failure before exhausting retries."}</p>
            <div className={styles.evidenceBlock}>
              <label>EVIDENCE</label>
              <div><span>Failure recurrence</span><strong>3 / 5 runs</strong></div>
              <div><span>Wasted median</span><strong>12m · 2.1 cr</strong></div>
              <div><span>Affected evals</span><strong>2 / 24</strong></div>
            </div>
            <div className={styles.hypothesis}>
              <Codicon name="lightbulb" />
              <div><strong>Hypothesis</strong><p>A deterministic Windows fixture will catch the path miss before live fan-out. One retry remains for transient tool failures.</p></div>
            </div>
            <div className={styles.uncertainty}>
              <Status kind="info" />
              <div><strong>Confidence: 0.82</strong><p>Two monorepo layouts are underrepresented. Keep both as rollout sentinels.</p></div>
            </div>
            {!changeReady && <button className={styles.primaryWide} onClick={onPropose}><Codicon name="sparkle" /> Propose source change</button>}
            {changeReady && !changeApplied && <button className={styles.primaryWide} onClick={onApply}><Codicon name="diff" /> Review and apply diff</button>}
            {changeApplied && !evalRan && <button className={styles.primaryWide} onClick={onEval}><Codicon name="beaker" /> Replay 24 eval cases</button>}
          </>
        )}
        {selected === "trace" && (
          <>
            <PanelHeading eyebrow="RUN_C91A · ATTEMPT 2" title="Verifier trace" icon="pulse" />
            <div className={styles.traceList}>
              <TraceRow time="10:42:01" title="Linux fixture passed" detail="restored from journal" state="success" />
              <TraceRow time="10:42:01" title="macOS fixture passed" detail="restored from journal" state="success" />
              <TraceRow time="10:42:08" title="Windows path failed" detail="packages\\shared\\src\\client.ts" state="error" />
              <TraceRow time="10:54:16" title="Retry repeated output" detail="same hash · +12m · +2.1 cr" state="warning" />
            </div>
            <div className={styles.traceBoundary}><Codicon name="debug-disconnect" /><p><strong>Warm resume boundary</strong>Completed platform checks stay journaled. The child verifier session owns its transcript and read-only worktree.</p></div>
            <button className={styles.secondaryWide}>Open child session trace</button>
          </>
        )}
        {selected === "evals" && (
          <>
            <PanelHeading eyebrow="REPLAY · 24 CASES" title={evalRan ? "Candidate comparison" : "Regression set"} icon="beaker" />
            <div className={styles.comparison}>
              <div className={styles.compareHeader}><span>Metric</span><span>Published</span><span>Candidate</span></div>
              <CompareRow label="Quality pass" before="21 / 24" after={evalRan ? "23 / 24" : "—"} good={evalRan} />
              <CompareRow label="Reliability" before="88.4%" after={evalRan ? "96.1%" : "—"} good={evalRan} />
              <CompareRow label="Median latency" before="42m" after={evalRan ? "34m" : "—"} good={evalRan} />
              <CompareRow label="Median credits" before="11.8" after={evalRan ? "9.7" : "—"} good={evalRan} />
              <CompareRow label="Peak agents" before="8" after={evalRan ? "8" : "—"} />
            </div>
            {evalRan && (
              <div className={styles.evalNote}><Status kind="warning" /><p><strong>1 sentinel still fails</strong>Monorepo junction path remains uncertain. Roll out to 10% with automatic rollback below 92% reliability.</p></div>
            )}
            {!evalRan && <button className={styles.primaryWide} onClick={onEval}><Codicon name="run-all" /> Run candidate replay</button>}
            {evalRan && !published && <button className={styles.primaryWide} onClick={onPublish}><Codicon name="rocket" /> Publish to 10% of runs</button>}
            {published && <div className={styles.rolloutState}><Status kind="success" /><div><strong>Canary published</strong><p>10% rollout · rollback if reliability &lt; 92% · review after 20 runs</p></div></div>}
          </>
        )}
        {selected === "cost" && (
          <>
            <PanelHeading eyebrow="AUTHORING GUARDRAILS" title="Limits and policy" icon="dashboard" />
            <Limit label="Concurrent agents" value="4" max="4" fill="100%" warning />
            <Limit label="Total agents" value="12" max="16 policy max" fill="75%" />
            <Limit label="Credit ceiling" value="20" max="25 workspace max" fill="80%" warning />
            <Limit label="Stop after" value="90m" max="required" fill="72%" />
            <div className={styles.costEstimate}>
              <label>ESTIMATED PER RUN</label>
              <div><span>Typical</span><strong>{changeApplied ? "9.7" : "11.8"} credits</strong></div>
              <div><span>Worst case</span><strong>18.4 credits</strong></div>
              <div><span>Model mix</span><strong>3 models · 6 roles</strong></div>
            </div>
            <div className={styles.policyConflict}>
              <Status kind="warning" />
              <div><strong>Cost-increasing recommendations require approval</strong><p>The agent can draft a higher ceiling, but workspace policy blocks applying it without an owner review.</p></div>
            </div>
            <button className={styles.secondaryWide}>Compare model alternatives</button>
          </>
        )}
      </div>
    </aside>
  );
}

function PanelHeading({ eyebrow, title, icon }: { eyebrow: string; title: string; icon: string }) {
  return <div className={styles.panelHeading}><Codicon name={icon} /><div><small>{eyebrow}</small><h3>{title}</h3></div></div>;
}

function TraceRow({ time, title, detail, state }: { time: string; title: string; detail: string; state: "success" | "warning" | "error" }) {
  return <div className={styles.traceRow}><small>{time}</small><Status kind={state} /><span><strong>{title}</strong><small>{detail}</small></span></div>;
}

function CompareRow({ label, before, after, good }: { label: string; before: string; after: string; good?: boolean }) {
  return <div className={styles.compareRow}><span>{label}</span><span>{before}</span><strong className={good ? styles.better : ""}>{after}</strong></div>;
}

function Limit({ label, value, max, fill, warning }: { label: string; value: string; max: string; fill: string; warning?: boolean }) {
  return (
    <div className={styles.limit}>
      <div><span>{label}</span><strong>{value}</strong></div>
      <div className={styles.meter}><i style={{ width: fill }} /></div>
      <small>{max}{warning ? " · near guardrail" : ""}</small>
    </div>
  );
}
