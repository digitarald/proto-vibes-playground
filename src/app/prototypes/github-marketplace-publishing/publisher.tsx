"use client";
import React, { useEffect, useRef, useState } from 'react';
import { BaseStyles, Banner, Button, Checkbox, Label, Select, TextInput, Textarea } from '@primer/react';
import { ThemeProvider } from '@primer/react/next';
import '@primer/primitives/dist/css/functional/themes/light.css';
import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight, BookIcon as BookOpen, CheckCircleIcon as CheckCircle2, CodeIcon as Code2, FileCodeIcon as FileCode2, FileDirectoryIcon as Folder, GitCommitIcon as GitCommitHorizontal, GitPullRequestIcon as GitPullRequest, MarkGithubIcon as Github, PackageIcon as Package, PlusIcon as Plus, ServerIcon as Server, ShieldCheckIcon as ShieldCheck, AlertIcon as TriangleAlert, XCircleIcon as XCircle, } from '@primer/octicons-react';
import { STORAGE_KEY, acknowledgments, addComment, assignPolicy, changeField, createSubmission, currentValidation, emptyState, fingerprint, moveStep, parseState, publicationErrors, reviewTier, simulateSourceEvent, simulateValidation, steps, toggleCheck, transition, } from './workflow';
import type { Action, Field, Kind, Outcome, Policy, State, Submission, Tab, View } from './workflow';
import styles from './page.module.css';
function restore(): {
    state: State;
    error: string;
    raw: string;
} {
    let raw = '';
    try {
        raw = localStorage.getItem(STORAGE_KEY) ?? '';
        return { state: raw ? parseState(raw) : emptyState(), error: '', raw };
    }
    catch (error) {
        return { state: emptyState(), error: `Drafts could not be restored. Nothing has been overwritten. ${message(error)}`, raw };
    }
}
function message(error: unknown): string { return error instanceof Error ? error.message : 'An unexpected error occurred.'; }
function Badge({ children }: {
    children: string;
}) {
    const variant = ['Passed', 'Published', 'Live', 'Verified'].includes(children) ? 'success'
        : ['Blocked', 'Failed', 'Changes requested'].includes(children) ? 'danger'
            : ['In review', 'Policy hold'].includes(children) ? 'attention' : 'default';
    return <Label variant={variant}>{children}</Label>;
}
function Notice({ tone = 'info', children }: {
    tone?: 'info' | 'warning' | 'success' | 'danger';
    children: React.ReactNode;
}) {
    return <Banner className="notice" variant={tone === 'danger' ? 'critical' : tone} layout="compact"><Banner.Title>{children}</Banner.Title></Banner>;
}
function Listing({ s, live = false }: {
    s: Submission;
    live?: boolean;
}) {
    const f = live && s.live ? s.live.fields : s.fields;
    return <article className="listing-preview full">
    <div className="listing-top"><div className={`app-icon ${s.kind}`}>{s.kind === 'plugin' ? <Package size={28}/> : <Server size={28}/>}</div>
      <div><h2>{f.name || 'Source has not been validated'}</h2><p className="muted">By {f.company} {live && s.live?.verified && <Badge>Verified</Badge>}</p></div></div>
    <p>{f.summary}</p><div className="tags"><span>{s.kind === 'plugin' ? 'Plugin' : 'MCP server'}</span><span>{f.category}</span></div>
    <hr /><h3>About this listing</h3><p className="preserve-lines">{f.description}</p>
    {s.kind === 'plugin' ? <p>3 skills · 1 agent · Northwind Helpdesk connector reference</p> : <>
      <h3>Example tasks</h3><p className="preserve-lines">{f.useCases}</p><h3>Before you connect</h3><p>{f.prerequisites}</p><p>Authentication: {f.auth}</p>
    </>}
  </article>;
}
const narrative = {
    repository: ['Publishing starts in the repository', 'Publishers already keep their code, metadata, and review history here. Detecting the plugin manifest or server.json makes publishing the next step in that workflow, rather than a separate registration task.', 'Claude Directory starts with a repository and folder entered in its publisher portal. GitHub can use the repository as the entry point.'],
    new: ['One console, two release lifecycles', 'A plugin ships a versioned bundle. An MCP server runs a live service. Separate submission paths ask for the right evidence while one console keeps ownership and dependencies visible.', 'Claude also separates plugins from connectors and recommends submitting a referenced connector first.'],
    plugin: [
        ['Fix findings where the code lives', 'Checks belong to a specific commit. Publishers can turn a blocking finding into a pull request, merge the fix, and revalidate the new revision. Policy holds remain visible without preventing submission for review.', 'Claude ties validation to a commit and distinguishes blockers from review holds. GitHub adds the familiar check-to-PR recovery path.'],
        ['The listing stays with the source', 'The manifest and README supply the listing. Changing them through a pull request keeps the public description and installable code under the same review history. Revalidation refreshes the preview.', 'Claude also derives plugin metadata from source rather than maintaining a separate listing editor.'],
        ['Make data use reviewable', 'Keep personal data, external transfers, retention, and audience disclosures together. Publishers make explicit declarations that reviewers can check against the plugin, rather than accepting inferred answers as consent.', 'The reconstructed Claude flow includes these four disclosures. Its exact authenticated form was not inspected.'],
        ['Release through existing GitHub events', 'Publishers choose Releases, pushes to a tracked ref, or manual checks. An assigned policy determines who publishes; opting into automatic updates cannot override a hold or missing approval.', 'Claude documents webhook or scheduled update detection. GitHub can use its own release and push events without another webhook installation.'],
        ['Approval does not choose the launch date', 'The final review brings source, disclosures, and acknowledgments together. Submission starts review; approval makes a revision eligible to publish. The publication policy keeps the launch decision explicit.', 'Claude separates submission, approval, and publication. Four acknowledgment topics are documented, but their exact wording is not public.'],
    ],
    connector: [
        ['Reuse the server definition', 'Import the endpoint from server.json, then check the connection before asking for listing details. Make topology requirements visible early so a publisher knows when Verified review is needed.', 'Claude supports remote HTTPS endpoints and requires Verified status for multiple URLs or URL patterns.'],
        ['Review what the server actually exposes', 'Import tool titles, descriptions, and annotations from the server. Publishers fix metadata in source and re-sync, so the listing cannot drift into a second tool definition.', 'Claude imports capabilities and directs publishers to fix metadata on the server, not in a directory-only copy.'],
        ['Fewer steps, the same evidence', 'Combine listing details with example tasks and reuse the organization profile. Six steps replace ten without dropping requirements. The publisher spends time describing what users can do, not re-entering company information.', 'Claude documents separate Listing, Use cases, and Company steps. GitHub already has an organization context to build on.'],
        ['Catch incompatible choices before review', 'Show how authentication and endpoint topology fit together. Changing authentication invalidates connection checks and testing confirmations, so reviewers receive evidence for the configuration being submitted.', 'Claude documents authentication constraints by topology. Surfacing them in the form avoids discovering conflicts only after submission.'],
        ['Put declarations beside proof', 'Reviewers need to know both what data the server touches and how to exercise every tool. Keep disclosures, reviewer access, and reproducible tests together. Editing the test plan requires a fresh publisher confirmation.', 'Claude separates Data handling from Test and launch. Verified reviewers exercise every tool using a populated test environment.'],
        ['Give each review path a clear finish', 'Community screening and Verified review have explicit completion steps. Verified requires recorded reviewer tool tests before approval. Neither route silently publishes a new listing or promises a review deadline.', 'Claude distinguishes Community screening from Verified human review and documents seven acknowledgment topics. Publisher anecdotes are not turnaround guarantees.'],
    ],
    console: {
        Overview: ['Make the next action clear', 'Keep the candidate revision and live listing distinct. Publishers can see whether they need to fix checks, address feedback, or publish an approved revision without guessing what users currently receive.', 'Claude distinguishes approval from publication and preserves the last published plugin version when a newer version fails.'],
        Review: ['Keep feedback with the revision', 'Review requests, publisher replies, and decisions form one conversation. Source identity stays locked during revisions, so addressing feedback cannot quietly replace the submitted repository or endpoint.', 'Claude documents review feedback and immutable source identifiers. A persistent conversation makes the revision history easier to follow.'],
        Versions: ['A failed update should not break the live listing', 'Each source event creates a candidate with its own checks. A failed candidate stays available for repair while the last published revision remains live. Only an approved replacement moves users forward.', 'Claude retains the last published version when an update fails. Native GitHub events make the link between release, commit, and checks explicit.'],
        Listing: ['Review the change, not just the new text', 'Show the live listing beside a pending diff. Publishers can check what will change before approval, while the public preview continues to show only the published snapshot.', 'Claude distinguishes source-derived plugin metadata from editable connector listings. Both need a clear boundary between pending and public content.'],
        Usage: ['Understand which versions people use', 'Version adoption shows whether users have reached the latest release. Earlier-version cohorts help publishers plan compatibility and support instead of treating publication as the end of the job.', 'Claude documents plugin adoption and version reporting. The figures shown here are sample data, not measured installations.'],
        Health: ['Separate request failures from tool errors', 'A successful request can still return a tool result marked isError. Keep request error rate separate from overall error rate so publishers can distinguish transport failures from unsuccessful tool execution.', 'Claude health reporting uses request errors while the topline error rate also counts isError results. Combining the two hides different failure modes.'],
        Settings: ['Separate publisher preference from review policy', 'Publishers choose detection and update preferences. Reviewers assign who may publish. Private-source consent permits inspection, not publication; making source public still requires fresh checks and approval.', 'Claude documents assigned publication policies and private-source conditions. Showing both prevents an auto-publish preference from looking like permission to bypass review.'],
    },
};
function ProductNarrative({ view, s, tab }: {
    view: View;
    s?: Submission;
    tab: Tab;
}) {
    const content = view === 'wizard' && s ? narrative[s.kind][s.step]
        : view === 'repository' ? narrative.repository : view === 'new' ? narrative.new
            : view === 'console' ? narrative.console[tab] : narrative.console[view === 'public' ? 'Listing' : 'Overview'];
    return <aside id="product-narrative" className="narrative-rail" aria-label="Product Narrative">
    <h2>{content[0]}</h2><p>{content[1]}</p>
    <aside className="competitive-insight" aria-label="Competitive insight">
      <h3>Competitive insight</h3><p>{content[2]}</p>
      <a href="https://claude.com/docs/directory/publish" target="_blank" rel="noreferrer">Claude Directory documentation</a>
    </aside>
  </aside>;
}
function App() {
    const [initial] = useState(restore);
    const [state, setState] = useState(initial.state);
    const [blocked, setBlocked] = useState(!!initial.error);
    const [storageError, setStorageError] = useState(initial.error);
    const [errors, setErrors] = useState<string[]>([]);
    const [resetConfirmed, setResetConfirmed] = useState(false);
    const [showNarrative, setShowNarrative] = useState(false);
    const [reply, setReply] = useState('');
    const [query, setQuery] = useState('');
    const [busy, setBusy] = useState(false);
    const stateRef = useRef(state);
    const mounted = useRef(true);
    const heading = useRef<HTMLHeadingElement>(null);
    const errorBox = useRef<HTMLDivElement>(null);
    const s = state.submissions.find(item => item.id === state.activeId);
    const f = s?.fields;
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    useEffect(() => { heading.current?.focus(); window.scrollTo({ top: 0 }); }, [state.view, s?.step, state.tab]);
    useEffect(() => { if (errors.length)
        errorBox.current?.focus(); }, [errors]);
    useEffect(() => { document.title = `${s?.fields.name || 'Repository'} · Marketplace prototype`; }, [s?.fields.name]);
    function commit(next: State, reset = false) {
        if (blocked && !reset)
            throw new Error('Restore or reset saved data before making changes.');
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setStorageError('');
            if (reset)
                setBlocked(false);
        }
        catch (error) {
            setStorageError(`Changes are not saved. Keep this page open, export your work, or retry storage. ${message(error)}`);
            if (reset)
                return;
        }
        stateRef.current = next;
        setState(next);
    }
    function attempt(work: () => void) {
        try {
            work();
            setErrors([]);
        }
        catch (error) {
            setErrors(message(error).split('\n'));
        }
    }
    function go(view: View, tab: Tab = 'Overview') { attempt(() => commit({ ...stateRef.current, view, tab })); }
    function update(fn: (item: Submission) => Submission, view?: View) {
        const current = stateRef.current;
        const active = current.submissions.find(item => item.id === current.activeId);
        if (!active)
            throw new Error('Choose a listing first.');
        const next = fn(active);
        commit({ ...current, view: view ?? current.view, tab: view ? 'Overview' : current.tab, submissions: current.submissions.map(item => item.id === next.id ? next : item) });
    }
    function act(action: Action) { attempt(() => update(item => transition(item, action), action === 'submit' ? 'console' : action === 'revise' ? 'wizard' : undefined)); }
    function field(key: Field, value: string) { attempt(() => update(item => changeField(item, key, value))); }
    function check(key: string) { attempt(() => update(item => toggleCheck(item, key))); }
    function open(item: Submission) { attempt(() => commit({ ...stateRef.current, activeId: item.id, view: item.status === 'Draft' ? 'wizard' : 'console', tab: 'Overview' })); }
    function create(kind: Kind) {
        attempt(() => {
            const current = stateRef.current;
            const existing = current.submissions.find(item => item.kind === kind);
            if (existing) {
                open(existing);
                return;
            }
            const item = createSubmission(kind);
            commit({ ...current, submissions: [...current.submissions, item], activeId: item.id, view: 'wizard', tab: 'Overview' });
        });
    }
    async function validate() {
        if (!s || busy)
            return;
        const id = s.id, source = fingerprint(s), outcome = s.scenario;
        setBusy(true);
        setErrors([]);
        await new Promise(resolve => setTimeout(resolve, 350));
        if (!mounted.current)
            return;
        attempt(() => {
            const current = stateRef.current;
            const item = current.submissions.find(d => d.id === id);
            if (!item || item.status !== 'Draft' || fingerprint(item) !== source)
                throw new Error('Source changed while checks ran. Revalidate the current source.');
            const result = simulateValidation(item, outcome);
            commit({ ...current, submissions: current.submissions.map(d => d.id === id ? result : d) });
        });
        setBusy(false);
    }
    function exportData() {
        attempt(() => {
            const blob = new Blob([blocked ? initial.raw : JSON.stringify(state, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob), a = document.createElement('a');
            a.href = url;
            a.download = 'marketplace-drafts.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    function input(key: Field, label: string, multiline = false, hint?: string, max?: number, locked = false) {
        return <div className="field" key={key}><label htmlFor={`field-${key}`}>{label}{locked && <span className="optional" aria-hidden="true"> · locked</span>}</label>
      {multiline
                ? <Textarea id={`field-${key}`} value={f?.[key] ?? ''} readOnly={locked} onChange={e => field(key, e.target.value)} rows={4} maxLength={max} aria-describedby={hint ? `${key}-hint` : undefined} block/>
                : <TextInput id={`field-${key}`} value={f?.[key] ?? ''} readOnly={locked} onChange={e => field(key, e.target.value)} maxLength={max} aria-describedby={hint ? `${key}-hint` : undefined} block/>}
      {(hint || max) && <div className="field-help"><span id={`${key}-hint`}>{hint}</span>{max && <span>{f?.[key].length ?? 0}/{max}</span>}</div>}
    </div>;
    }
    function select(key: Field, label: string, values: string[], hint?: string) {
        return <div className="field"><label htmlFor={`field-${key}`}>{label}</label><Select id={`field-${key}`} value={f?.[key] ?? ''} onChange={e => field(key, e.target.value)} block>
      {!values.includes(f?.[key] ?? '') && <Select.Option value="">Select an answer</Select.Option>}{values.map(value => <Select.Option key={value} value={value}>{value}</Select.Option>)}
    </Select>{hint && <p className="field-help">{hint}</p>}</div>;
    }
    function checkbox(key: string, text: string) {
        return <label className="checkbox" key={key}><Checkbox checked={s?.checks.includes(key) ?? false} onChange={() => check(key)}/><span>{text}</span></label>;
    }
    function checkPanel() {
        if (!s?.validation)
            return <Notice>Checks have not run for this source.</Notice>;
        if (!currentValidation(s))
            return <Notice tone="warning">Source changed. Run checks again for the current revision.</Notice>;
        const result = s.validation.outcome;
        return <section className="checks-panel" aria-label="Commit checks">
      <div className="panel-title"><span><ShieldCheck size={18}/>marketplace/validate</span><Badge>{result === 'blocked' ? 'Blocked' : result === 'hold' ? 'Policy hold' : 'Passed'}</Badge></div>
      <div className="check-row"><GitCommitHorizontal size={18}/><div><strong>{s.validation.revision}</strong><small>{s.kind === 'plugin' ? `${f?.path}/plugin.json` : 'Streamable HTTP · 3 read-only tools'}</small></div></div>
      {result === 'blocked' ? <>
        <div className="check-row"><XCircle size={18} className="red"/><div><strong>{s.kind === 'plugin' ? 'Blocking: manifest name is missing' : 'Blocking: search_tickets title is missing'}</strong>
          <small>{s.kind === 'plugin' ? 'plugin.json:2 — add the required name in source.' : 'server/tools.ts:12 — set the title on the server, then re-sync.'}</small></div></div>
        {s.status === 'Draft' && <div className="panel-actions">{s.fixPr
                        ? <><span><GitPullRequest size={16}/>Fix PR open · one source file changed</span><Button className="button primary" onClick={() => act('merge-fix-pr')} variant="primary">Merge fix and revalidate</Button></>
                        : <Button className="button" onClick={() => act('open-fix-pr')} variant="default" leadingVisual={GitPullRequest}>Open simulated fix PR</Button>}</div>}
      </> : result === 'hold' ? <div className="check-row"><TriangleAlert size={18} className="amber"/><div><strong>Policy hold: ownership needs review</strong><small>Submission is allowed. A reviewer must clear this hold before approval or publication.</small></div></div>
                : <div className="check-row"><CheckCircle2 size={18} className="green"/><div><strong>Source and capability checks passed</strong><small>Warning: add an empty-result example. This does not block submission.</small></div></div>}
    </section>;
    }
    function policyControls() {
        return s && <details className="simulation-controls"><summary>Reviewer simulation controls</summary>
      <p className="muted">These controls simulate the reviewing team, not publisher permissions.</p>
      <label htmlFor="policy">Assigned publication policy</label><Select id="policy" value={s.policy} onChange={e => attempt(() => update(item => assignPolicy(item, e.target.value as Policy)))} block>
        <Select.Option value="Publisher">Publisher</Select.Option><Select.Option value="Automatic updates">Automatic updates</Select.Option><Select.Option value="Reviewer">Reviewer</Select.Option>
      </Select>
      {s.status === 'In review' && <div className="actions">
        <Button className="button" onClick={() => act('request-changes')} variant="default">Request changes</Button>
        {s.validation?.outcome === 'hold' && <Button className="button" onClick={() => act('clear-hold')} variant="default">Clear policy hold</Button>}
        {reviewTier(s) === 'Verified' && <Button className="button" disabled={s.validation?.outcome !== 'pass' || s.verifiedFingerprint === fingerprint(s)} onClick={() => act('verify-tools')} variant="default">Record reviewer tool tests</Button>}
        <Button className="button" onClick={() => act('approve')} disabled={s.validation?.outcome !== 'pass' || (reviewTier(s) === 'Verified' && s.verifiedFingerprint !== fingerprint(s))} variant="default">
          {s.kind === 'connector' && reviewTier(s) === 'Community' ? 'Complete screening and approve' : 'Approve revision'}
        </Button>
      </div>}
      {s.status === 'Approved' && s.policy === 'Reviewer' && <Button className="button" disabled={!s.publicationRequested || publicationErrors(s).length > 0} onClick={() => act('reviewer-publish')} variant="default">Reviewer publish</Button>}
    </details>;
    }
    function wizardBody() {
        if (!s || !f)
            return null;
        const label = steps[s.kind][s.step];
        if (s.step === 0)
            return <>
      <p className="section-lead">{s.kind === 'plugin' ? 'The repository and folder supply the listing and every version. They lock on first submission.' : 'Start with the endpoint from server.json and check the connection.'}</p>
      {s.kind === 'plugin' ? <>
        {input('repo', 'Repository', false, undefined, undefined, !!s.identity)}
        <div className="form-grid">{input('path', 'Plugin folder', false, 'Folder containing plugin.json.', undefined, !!s.identity)}{input('ref', 'Tracked branch or tag')}</div>
        {select('visibility', 'Repository visibility', ['Public', 'Private'])}
        {f.visibility === 'Private' && <><Notice tone="warning">Private source can be inspected with consent, but cannot be published. Make it public, revalidate, and obtain approval first.</Notice>
          {checkbox('private-consent', 'Allow simulated inspection of this private repository.')}</>}
        {checkbox('permission', 'I have write access and permission to publish this repository.')}
      </> : <>
        {input('endpoint', 'MCP server URL', false, 'HTTPS · Streamable HTTP', undefined, !!s.identity)}
        {select('topology', 'Connection type', ['Universal URL', 'Multiple URLs', 'URL pattern'])}
        {f.topology !== 'Universal URL' && <Notice tone="warning">Verified review is required. This prototype validates one example URL; multi-endpoint configuration is not implemented.</Notice>}
      </>}
      <Button className="button primary" disabled={busy} onClick={validate} variant="primary" leadingVisual={ShieldCheck}>{busy ? 'Checking source…' : s.validation ? 'Run checks again' : s.kind === 'plugin' ? 'Validate repository' : 'Connect and check'}</Button>
      {checkPanel()}
      <details className="simulation-controls"><summary>Scanner simulation controls</summary><label htmlFor="scenario">Next check result</label>
        <Select id="scenario" value={s.scenario} disabled={busy} onChange={e => attempt(() => update(item => ({ ...item, scenario: e.target.value as Outcome })))} block>
          <Select.Option value="pass">Passing checks</Select.Option><Select.Option value="blocked">Blocking finding</Select.Option><Select.Option value="hold">Policy hold</Select.Option>
        </Select><p className="muted">Changing this choice does not change completed checks. Run them again.</p></details>
    </>;
        if (label === 'Tools')
            return <>
      <p className="section-lead">Imported capabilities remain source-owned. Fix metadata on the server and re-sync; do not maintain a directory-only copy.</p>
      <div className="panel">{['search_tickets', 'get_project', 'find_documents'].map(name => <div className="tool-row" key={name}><Code2 size={18}/><div><strong>{name.replaceAll('_', ' ')}</strong><code>{name}</code></div><Badge>Read only</Badge></div>)}</div>
      <p className="muted">All tools: readOnlyHint = true, destructiveHint = false.</p>
      <Button className="button" disabled={busy} onClick={validate} variant="default">Re-sync tool metadata</Button>
      {checkbox('tools', 'The imported tools accurately describe my server.')}
    </>;
        if (label === 'Listing')
            return s.kind === 'plugin' ? <>
      <Notice>Metadata comes from plugin.json and README. Edit source, then revalidate.</Notice>
      <Listing s={s}/><Button className="button" onClick={() => act('source-edit')} variant="default" leadingVisual={GitPullRequest}>Simulate source listing PR</Button>
      {s.sourceSummary !== f.summary && <Notice tone="warning">Source PR merged. Return to Source and revalidate to import the new summary.</Notice>}
    </> : <>
      <p className="muted">Publisher: {f.company} · {f.website}</p>
      {input('name', 'Server name', false, undefined, 100)}{input('summary', 'Short description', false, undefined, 200)}
      {input('description', 'Description', true, undefined, 2000)}
      <div className="form-grid">{input('slug', 'Listing slug', false, 'Locks at first publication.', undefined, !!s.live)}{select('category', 'Category', ['Developer tools', 'Productivity', 'Support'])}</div>
      {input('docs', 'Documentation URL')}{input('privacy', 'Privacy policy URL')}{input('support', 'Support email')}
      {input('useCases', 'Example tasks', true)}{input('prerequisites', 'Prerequisites')}
    </>;
        if (label === 'Authentication')
            return <>
      {select('auth', 'Authentication method', ['OAuth DCR', 'OAuth CIMD', 'Publisher-provided OAuth client', 'Custom connection', 'None'])}
      <div className="panel"><div className="panel-title">Compatibility</div><div className="panel-body"><p>URL patterns cannot use a publisher-provided OAuth client.</p><p>Multiple URLs cannot use a custom connection.</p></div></div>
      <Notice>Changing authentication invalidates connection checks and testing. Return to Connection to revalidate. Client secrets and real credentials are deliberately not collected.</Notice>
    </>;
        if (label === 'Data handling')
            return <>
      {select('personal', 'Does the plugin read or store personal data?', ['No', 'Yes'])}
      {select('transfers', 'Does it transfer data beyond declared connectors?', ['No', 'Yes'])}
      {input('retention', 'Data retention')}{select('minors', 'Is the plugin intended for people under 18?', ['No', 'Yes'])}
    </>;
        if (label === 'Releases')
            return <>
      {select('trigger', 'Detect new versions', ['GitHub Releases', 'Push to tracked ref', 'Manual'], 'Native GitHub events; no separate webhook installation.')}
      {select('autoPublish', 'Automatically publish approved updates?', ['No', 'Yes'], 'Only the Automatic updates policy permits this. The first publication remains explicit.')}
      <Notice>Assigned policy: <strong>{s.policy}</strong>. Blocking checks, private source, review holds, and missing approval always prevent publication.</Notice>
      {policyControls()}
    </>;
        if (label === 'Data and testing')
            return <>
      {select('ownership', 'Underlying API ownership', ['First-party API', 'Authorized partner proxy', 'Uncontrolled third-party API'])}
      {select('health', 'Does the connector handle personal health data?', ['No', 'Yes'])}
      {f.health === 'Yes' && input('safeguards', 'Health-data safeguards and test case', true)}
      {select('sponsored', 'Does the connector return sponsored content?', ['No', 'Yes'])}
      <h3>Reviewer access and test plan</h3><Notice>Use a populated demo environment. Do not put credentials in this browser draft; secure credential delivery is outside this prototype.</Notice>
      {input('access', 'Reviewer access URL')}{input('testSteps', 'Reviewer test instructions', true, 'Include sign-in steps, every tool, expected outputs, and cleanup.')}
      {checkbox('tested', 'I personally tested every tool.')}
    </>;
        return <>
      <Listing s={s}/>
      <dl className="facts"><dt>Source</dt><dd>{s.kind === 'plugin' ? `${f.repo} / ${f.path} @ ${f.ref}` : f.endpoint}</dd>
        <dt>Checked revision</dt><dd>{s.validation?.revision ?? 'Not checked'}</dd>
        <dt>Publication</dt><dd>{s.policy} · {s.kind === 'plugin' ? f.trigger : reviewTier(s)}</dd></dl>
      {s.kind === 'connector' && <>{select('reviewTier', 'Requested review path', ['Community', 'Verified'])}
        {f.topology !== 'Universal URL' && <Notice>Effective review: Verified, required by this topology.</Notice>}</>}
      {input('email', 'Review contact email')}{input('notes', 'Notes for reviewers (optional)', true)}
      <h3>Acknowledgments</h3><p className="muted">Illustrative proposal wording, not a legal agreement or current GitHub policy.</p>
      {acknowledgments[s.kind].map((text, i) => checkbox(`compliance-${i}`, text))}
      <Notice>Submit starts review, not publication. No review turnaround is promised.</Notice>
    </>;
    }
    function consoleBody() {
        if (!s || !f)
            return null;
        if (state.tab === 'Review')
            return <>
      <h2>Review conversation</h2>{f.notes && <Notice>Publisher notes: {f.notes}</Notice>}
      <ol className="review-events">{s.events.map((event, i) => <li key={i}><strong>{event.actor}</strong><time>{new Date(event.at).toLocaleString()}</time><p>{event.text}</p></li>)}</ol>
      <label htmlFor="reply">Reply to review</label><Textarea id="reply" value={reply} onChange={e => setReply(e.target.value)} rows={3} block/>
      <Button className="button" onClick={() => attempt(() => { update(item => addComment(item, reply)); setReply(''); })} variant="default">Post simulated reply</Button>{policyControls()}
    </>;
        if (state.tab === 'Versions')
            return <>
      <h2>Versions and checks</h2><p>Listening for: <strong>{f.trigger}</strong>. {s.live ? `${s.live.revision} remains live until a replacement is published.` : 'No version is live yet.'}</p>
      <div className="panel">{[...s.versions].reverse().map((v, i) => <div className="version-row" key={`${v.revision}-${i}`}><GitCommitHorizontal size={18}/><code>{v.revision}</code><span>{v.outcome}</span><Badge>{v.state}</Badge></div>)}</div>
      {s.kind === 'plugin' && s.status === 'Published' && <div className="actions">
        <Button className="button" onClick={() => attempt(() => update(item => simulateSourceEvent(item, item.fields.trigger, 'blocked')))} variant="default">Simulate failing source event</Button>
        <Button className="button" onClick={() => attempt(() => update(item => simulateSourceEvent(item, item.fields.trigger, 'pass')))} variant="default">Simulate passing source event</Button>
      </div>}
      {s.status === 'Draft' && <Button className="button primary" onClick={() => go('wizard')} variant="primary">Open candidate and resolve checks</Button>}
    </>;
        if (state.tab === 'Listing') {
            const changes = s.live ? (['name', 'summary', 'description', 'slug', 'category', 'docs', 'privacy', 'support', 'useCases', 'prerequisites', 'auth', 'company', 'website'] as const).filter(key => s.live?.fields[key] !== f[key]) : [];
            return <><h2>{s.live ? 'Live listing and pending changes' : 'Listing preview'}</h2>
        <Listing s={s} live={!!s.live}/>
        {s.live && <section aria-label="Pending listing changes"><h3>Pending listing diff</h3>{changes.length ? changes.map(key => <div className="listing-diff" key={key}><strong>{key}</strong><del>{s.live?.fields[key]}</del><ins>{f[key]}</ins></div>) : <p className="muted">No pending text changes.</p>}</section>}
        {s.status === 'Published' && <Button className="button" onClick={() => act('revise')} variant="default">Edit a new revision</Button>}
      </>;
        }
        if (state.tab === 'Usage')
            return <><h2>Version adoption</h2><Notice>Sample data, not measured installations.</Notice>
      <table className="data-table"><caption>Fictional adoption snapshot</caption><thead><tr><th>Version cohort</th><th>Active installs</th><th>Share</th></tr></thead>
        <tbody><tr><td>Latest released version</td><td>720</td><td>72%</td></tr><tr><td>Earlier versions</td><td>280</td><td>28%</td></tr></tbody></table>
      <p className="muted">No adoption is inferred from publishing a local fixture.</p></>;
        if (state.tab === 'Health')
            return <><h2>Connector health</h2><Notice>Illustrative snapshot: 1,000 calls, 20 request failures, 30 additional tool results marked isError.</Notice>
      <table className="data-table"><caption>Different error denominators must not be conflated</caption><thead><tr><th>Metric</th><th>Value</th><th>Counts</th></tr></thead>
        <tbody><tr><td>Request error rate</td><td>2%</td><td>20 failed requests / 1,000 calls</td></tr><tr><td>Overall error rate</td><td>5%</td><td>(20 failed requests + 30 other isError results) / 1,000 calls</td></tr></tbody></table>
      <p>No live health badge or availability claim is derived from these fixtures.</p></>;
        if (state.tab === 'Settings')
            return <><h2>Publication settings</h2><dl className="facts">
      <dt>Source identity</dt><dd>{s.kind === 'plugin' ? `${f.repo} / ${f.path}` : f.endpoint} · locked after submission</dd>
      <dt>Review path</dt><dd>{s.kind === 'plugin' ? 'Plugin review' : reviewTier(s)}</dd>
      <dt>Assigned policy</dt><dd>{s.policy}</dd><dt>Source visibility</dt><dd>{s.kind === 'plugin' ? f.visibility : 'Hosted endpoint'}</dd>
      {s.kind === 'plugin' && <><dt>Detection</dt><dd>{f.trigger}</dd><dt>Auto-publish preference</dt><dd>{f.autoPublish}</dd></>}
    </dl><p>Change publisher settings in a revision. Private-to-public changes require fresh checks and approval.</p>
      {['Approved', 'Published', 'Changes requested'].includes(s.status) && <Button className="button" onClick={() => act('revise')} variant="default">Open settings revision</Button>}
      {s.status === 'Draft' && <Button className="button" onClick={() => go('wizard')} variant="default">Continue draft</Button>}{policyControls()}</>;
        const title = s.status === 'Published' ? 'Your listing is live' : s.status === 'Approved' ? 'Approved, not yet published'
            : s.status === 'Changes requested' ? 'Changes requested' : s.status === 'Draft' ? 'Candidate needs your attention' : `${s.kind === 'connector' ? reviewTier(s) : 'Plugin'} review in progress`;
        return <><h2>{title}</h2><div className="lifecycle" aria-label="Publication lifecycle">{['Draft', 'In review', 'Approved', 'Published'].map(stage => <Badge key={stage}>{stage === s.status ? `${stage} · current` : stage}</Badge>)}</div>
      {s.live && <Notice tone="success"><strong>{s.live.revision} is live.</strong> Pending edits and failing checks do not replace it.</Notice>}
      {s.status === 'In review' && <Notice>{reviewTier(s) === 'Verified' ? 'Verified review requires a reviewer to record every-tool testing, then approve. Publication follows the assigned policy.' : 'Checks are not approval. Complete the simulated review before publication.'}</Notice>}
      {s.status === 'Approved' && <>
        {publicationErrors(s).map(error => <Notice key={error} tone="warning">{error}</Notice>)}
        {s.policy === 'Reviewer' ? <><Button className="button primary" disabled={s.publicationRequested || publicationErrors(s).length > 0} onClick={() => act('request-publication')} variant="primary">{s.publicationRequested ? 'Publication requested' : 'Request publication'}</Button><p className="muted">A separate reviewer action publishes this revision.</p></>
                    : <Button className="button primary" disabled={publicationErrors(s).length > 0} onClick={() => act('publish')} variant="primary">Publish listing</Button>}
        <Button className="button" onClick={() => act('revise')} variant="default">Revise before publishing</Button>
      </>}
      {s.status === 'Changes requested' && <><p>Review the conversation, update the draft, and revalidate.</p><Button className="button primary" onClick={() => act('revise')} variant="primary">Address feedback</Button></>}
      {s.status === 'Draft' && <Button className="button primary" onClick={() => go('wizard')} variant="primary">Continue draft</Button>}
      {s.status === 'Published' && <Button className="button" onClick={() => act('revise')} variant="default">Edit a new revision</Button>}
      {checkPanel()}{policyControls()}
    </>;
    }
    const tabs: Tab[] = ['Overview', 'Review', ...(s?.kind === 'plugin' ? ['Versions' as const] : []), 'Listing', s?.kind === 'plugin' ? 'Usage' : 'Health', 'Settings'];
    return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="global-header"><div className="global-left"><Github size={30} aria-label="GitHub"/><Button className="header-name" onClick={() => go('repository')} variant="invisible">northwind / support-toolkit</Button></div></header>
    <nav className="top-nav" aria-label="Primary">{([['repository', 'Repository'], ['listings', 'Your listings'], ['new', 'New listing']] as const).map(([view, label]) => <Button key={view} className={state.view === view ? 'selected' : ''} disabled={blocked} onClick={() => go(view)} variant="invisible">{label}</Button>)}</nav>
    <div className="presentation-toolbar" aria-label="Presentation tools">
      <Button className="button small" onClick={() => setShowNarrative(!showNarrative)} aria-expanded={showNarrative} aria-controls="product-narrative" variant="default" size="small" leadingVisual={BookOpen}>Product Narrative</Button>
      <details><summary>Demo</summary><p>Actions stay in this browser. No GitHub actions or MCP requests are sent. Drafts are stored on this origin; drafts from the standalone preview remain there.</p></details>
    </div>
    <div className={`experience ${showNarrative ? 'with-narrative' : ''}`}><div id="main">
      {storageError && <section className="storage-warning" aria-label="Storage recovery"><Notice tone="danger">{storageError}</Notice>
        <div className="actions"><Button className="button" onClick={exportData} variant="default">Export {blocked ? 'saved data' : 'current draft'}</Button>
          {!blocked && <Button className="button" onClick={() => attempt(() => commit(state))} variant="default">Retry saving</Button>}
          {blocked && <><label className="checkbox"><Checkbox checked={resetConfirmed} onChange={e => setResetConfirmed(e.target.checked)}/>I understand reset replaces the saved data for this prototype.</label>
            <Button className="button" disabled={!resetConfirmed} onClick={() => attempt(() => commit(emptyState(), true))} variant="default">Reset prototype storage</Button></>}</div></section>}
      {errors.length > 0 && <div className="error-summary page-errors" role="alert" tabIndex={-1} ref={errorBox}><strong>Resolve these items</strong><ul>{errors.map((error, i) => <li key={i}>{error}</li>)}</ul></div>}
      {state.view === 'repository' && <div className="page">
        <div className="page-heading"><h1 ref={heading} tabIndex={-1}>northwind / support-toolkit</h1></div>
        <div className="repo-layout"><section>
          <div className="discovery"><Package size={24}/><div><h2>A plugin was found in this repository</h2><p><code>plugins/support-toolkit/plugin.json</code> on <code>main</code></p><p>Start from the source. Fix check findings in a pull request, then publish.</p></div>
            <Button className="button primary" disabled={blocked} onClick={() => create('plugin')} variant="primary">{state.submissions.some(item => item.kind === 'plugin') ? 'Open plugin submission' : 'Publish this plugin'}</Button></div>
          <div className="panel"><div className="panel-title"><span><GitCommitHorizontal size={16}/>Repository files</span><code>main</code></div>
            {['.github/marketplace/test-plan.md', 'plugins/support-toolkit/plugin.json', 'plugins/support-toolkit/README.md', 'server/tools.ts', 'server.json', 'LICENSE'].map(file => <div className="file-row" key={file}><FileCode2 size={16}/><code>{file}</code></div>)}</div>
          <section className="repo-readme"><h2>Support Toolkit</h2><p>Reusable skills and an agent for ticket triage, reproducible reports, and incident escalation.</p><h3>One repository, two listings</h3><p>The plugin references the Northwind Helpdesk MCP server. Publish that connector separately so users can understand and authorize its tools.</p></section>
        </section><aside className="dashboard-aside"><h2>Marketplace</h2><p>Repository-native publishing, with separate review and release controls.</p>
          <Button className="text-button" disabled={blocked} onClick={() => create('connector')} variant="invisible" leadingVisual={Server}>Import server.json</Button>
        </aside></div>
      </div>}
      {state.view === 'new' && <div className="page choose-page"><h1 ref={heading} tabIndex={-1}>New Marketplace listing</h1><p>Publish a versioned plugin or connect a live MCP service.</p>
        <div className="type-options">{(['plugin', 'connector'] as const).map(kind => <section className="type-option" key={kind}>{kind === 'plugin' ? <Package size={28}/> : <Server size={28}/>}<h2>{kind === 'plugin' ? 'Plugin bundle' : 'MCP server'}</h2>
          <p>{kind === 'plugin' ? 'Source-derived listing, commit checks, release-triggered versions.' : 'Imported tools, endpoint compatibility, reproducible reviewer tests.'}</p>
          <Button className="button primary" disabled={blocked} onClick={() => create(kind)} variant="primary" trailingVisual={ArrowRight}>Start {kind === 'plugin' ? 'plugin' : 'connector'} submission</Button></section>)}</div>
        <p className="muted">Starting again resumes your existing submission for that listing type.</p>
      </div>}
      {state.view === 'listings' && <div className="page"><div className="page-heading"><div><h1 ref={heading} tabIndex={-1}>Your listings</h1><p className="muted">Owned by northwind.</p></div><Button className="button primary" onClick={() => go('new')} variant="primary" leadingVisual={Plus}>New listing</Button></div>
        <div className="filter-bar"><TextInput aria-label="Search listings" placeholder="Find a listing" value={query} onChange={e => setQuery(e.target.value)} block/></div>
        <div className="submission-table">{state.submissions.filter(item => `${item.fields.name} ${item.kind}`.toLowerCase().includes(query.toLowerCase())).map(item => <Button className="submission-row" key={item.id} onClick={() => open(item)} variant="invisible">
          {item.kind === 'plugin' ? <Package size={24}/> : <Server size={24}/>}<span className="submission-copy"><strong>{item.fields.name || 'Support Toolkit draft'}</strong><span>{item.kind} · {item.live ? `Live: ${item.live.revision}` : 'Not published'}</span></span><Badge>{item.status}</Badge></Button>)}
          {!state.submissions.length && <div className="empty"><Folder size={28}/><h2>No submissions yet</h2><p>Start with the plugin detected in your repository, or import its MCP server.</p><Button className="button" onClick={() => go('repository')} variant="default">Open repository</Button></div>}
          {state.submissions.length > 0 && !state.submissions.some(item => `${item.fields.name} ${item.kind}`.toLowerCase().includes(query.toLowerCase())) && <p className="empty">No listings match your search.</p>}</div>
      </div>}
      {state.view === 'wizard' && s && <div className="page"><div className="page-heading"><div><Button className="text-button" onClick={() => go('listings')} variant="invisible" leadingVisual={ArrowLeft}>Your listings</Button><h1 ref={heading} tabIndex={-1}>Publish {s.kind === 'plugin' ? 'a plugin' : 'an MCP server'}</h1></div><div className="actions"><Badge>{s.live ? 'Live listing · draft update' : 'Draft'}</Badge><Button className="button" onClick={() => go('console')} variant="default">Open publisher console</Button></div></div>
        <div className="publisher-wizard"><nav className="step-nav" aria-label="Submission steps"><ol>{steps[s.kind].map((label, i) => <li key={label}><Button aria-current={i === s.step ? 'step' : undefined} disabled={blocked || busy} onClick={() => attempt(() => update(item => moveStep(item, i)))} variant="invisible">
          <span className="step-label"><span className="step-number">{i + 1}</span>{label}</span></Button></li>)}</ol></nav>
          <section className="step-content"><h2>{steps[s.kind][s.step]}</h2>{wizardBody()}<footer className="wizard-actions"><span className="muted" role="status">{storageError ? 'Not saved' : 'Saved in this browser'}</span>
            <div className="actions"><Button className="button" disabled={busy} onClick={() => go('listings')} variant="default">Save and exit</Button>{s.step > 0 && <Button className="button" disabled={busy} onClick={() => attempt(() => update(item => moveStep(item, item.step - 1)))} variant="default">Back</Button>}
              <Button className="button primary" disabled={busy || blocked} onClick={() => s.step === steps[s.kind].length - 1 ? act('submit') : attempt(() => update(item => moveStep(item, item.step + 1)))} variant="primary" trailingVisual={ArrowRight}>
                {s.step === steps[s.kind].length - 1 ? 'Submit for review' : 'Continue'}</Button></div></footer></section></div>
      </div>}
      {state.view === 'console' && s && <div className="page"><div className="page-heading"><div><Button className="text-button" onClick={() => go('listings')} variant="invisible" leadingVisual={ArrowLeft}>Your listings</Button><h1 ref={heading} tabIndex={-1}>{s.fields.name || 'Publisher console'}</h1><p className="muted">Publisher console · {s.kind}</p></div><div className="actions"><Badge>{s.status}</Badge>{s.live && <Button className="button" onClick={() => go('public')} variant="default">View live listing</Button>}</div></div>
        <div className="console-layout"><nav className="console-nav" aria-label="Publisher console">{tabs.map(tab => <Button key={tab} aria-current={tab === state.tab ? 'page' : undefined} onClick={() => go('console', tab)} variant="invisible">{tab}</Button>)}</nav>
          <section className="console-content">{consoleBody()}</section></div>
      </div>}
      {state.view === 'public' && s && <div className="page public-page"><Button className="text-button" onClick={() => go('console')} variant="invisible">Back to publisher console</Button><h1 ref={heading} tabIndex={-1}>Live listing preview</h1>{s.live ? <><Notice>Published snapshot {s.live.revision}. Pending draft edits are not shown here.</Notice><Listing s={s} live/></> : <Notice tone="warning">This listing has not been published.</Notice>}</div>}
    </div>{showNarrative && <ProductNarrative view={state.view} s={s} tab={state.tab}/>}</div>
  </>;
}
export default function MarketplacePublishing() {
    return <ThemeProvider colorMode="light" dayScheme="light">
    <BaseStyles className={styles.surface}>
      <App />
    </BaseStyles>
  </ThemeProvider>;
}
