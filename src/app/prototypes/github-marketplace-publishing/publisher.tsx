"use client";
import React, { useEffect, useRef, useState } from 'react';
import { BaseStyles, Banner, Button, Checkbox, FormControl, Label, Radio, RadioGroup, Select, TextInput, Textarea } from '@primer/react';
import { ThemeProvider } from '@primer/react/next';
import '@primer/primitives/dist/css/functional/themes/light.css';
import { ArrowLeftIcon as ArrowLeft, ArrowRightIcon as ArrowRight, BookIcon as BookOpen, CheckCircleIcon as CheckCircle2, CodeIcon as Code2, FileCodeIcon as FileCode2, FileDirectoryIcon as Folder, GitCommitIcon as GitCommitHorizontal, GitPullRequestIcon as GitPullRequest, MarkGithubIcon as Github, PackageIcon as Package, PlusIcon as Plus, ServerIcon as Server, ShieldCheckIcon as ShieldCheck, AlertIcon as TriangleAlert, XCircleIcon as XCircle, } from '@primer/octicons-react';
import { STORAGE_KEY, acknowledgments, addComment, assignPolicy, changeField, createSubmission, currentValidation, emptyState, fingerprint, moveStep, parseState, publicationErrors, requiresDiscoverySignIn, retentionSummary, reviewTier, simulateSourceEvent, simulateValidation, sourceError, stepErrors, steps, submissionErrors, toggleCheck, toolCatalog, transition, } from './workflow';
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
        ['Ask for the risk, then the exception', 'Distinguish reading personal data from storing it. Start with a short retention choice and ask for details only when needed. Point reviewers to maintained documentation instead of making publishers rewrite it.', 'The supplied Claude portal screenshots distinguish read-only access from storage and use broad retention bands. We keep that low-effort approach without adopting their retention threshold or visual treatment.'],
        ['Release through existing GitHub events', 'Publishers choose Releases, pushes to a tracked ref, or manual checks. An assigned policy determines who publishes; opting into automatic updates cannot override a hold or missing approval.', 'Claude documents webhook or scheduled update detection. GitHub can use its own release and push events without another webhook installation.'],
        ['Approval does not choose the launch date', 'The final review brings source, disclosures, and acknowledgments together. Submission starts review; approval makes a revision eligible to publish. The publication policy keeps the launch decision explicit.', 'Claude separates submission, approval, and publication. Four acknowledgment topics are documented, but their exact wording is not public.'],
    ],
    connector: [
        ['Connect before discovering tools', 'server.json can supply an endpoint, not authenticated tool access. Establish an MCP connection and authorize it when metadata is protected. Only then import tool schemas. Discovery does not execute tools.', 'Claude documents syncing from a connected server in the developer portal, not discovery by Claude Code from a repository. Lazy-auth servers may expose tools/list before sign-in.'],
        ['Review the actual tool contract', 'Show each imported title, description, input schema, annotation, and data scope. Publishers fix metadata on the server and re-sync. A successful tools/list response is evidence of discovery, not proof that each tool works.', 'Claude says tools, prompts, and resources sync from the connected server. Actual tool execution is a separate publisher and reviewer testing requirement.'],
        ['Keep listing copy separate from access requirements', 'Publishers describe the value, example tasks, and account prerequisites together. Keep the public support address distinct from the private review contact. Required assets and broader category selection remain future work.', 'Claude documents separate Listing, Use cases, and Company steps, plus icon and category requirements. This condensed flow covers the core text, not every asset requirement.'],
        ['Catch incompatible choices before review', 'Show how authentication and endpoint topology fit together. Changing authentication invalidates connection checks and testing confirmations, so reviewers receive evidence for the configuration being submitted.', 'Claude documents authentication constraints by topology. Surfacing them in the form avoids discovering conflicts only after submission.'],
        ['Give reviewers a reproducible environment', 'Separate workspace setup, sign-in instructions, access restrictions, and test cases. Show the expected result for each imported tool. Schema discovery cannot replace these tests, and changing the plan requires a fresh confirmation.', 'Claude requires links, credentials where relevant, and steps for a populated test account. This prototype does not implement a secure credential handoff and never stores passwords or tokens.'],
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
      <a href={s?.kind === 'connector' ? 'https://claude.com/docs/connectors/building/submission' : 'https://claude.com/docs/plugins/submit'} target="_blank" rel="noreferrer">Claude submission documentation</a>
      {s?.kind === 'connector' && <p><a href="https://claude.com/docs/connectors/building/lazy-authentication" target="_blank" rel="noreferrer">Metadata discovery and lazy authentication</a></p>}
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
    const [authRequest, setAuthRequest] = useState<{ id: string; fingerprint: string } | null>(null);
    const authorizedConnection = useRef<{ id: string; fingerprint: string } | null>(null);
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
    async function validate(authorization?: string) {
        if (!s || busy)
            return;
        const id = s.id, source = fingerprint(s), outcome = s.scenario;
        const error = sourceError(s);
        if (error) { setErrors([error]); return; }
        const authorized = authorization === source || (authorizedConnection.current?.id === id && authorizedConnection.current.fingerprint === source);
        if (requiresDiscoverySignIn(s) && !authorized) {
            setAuthRequest({ id, fingerprint: source });
            setErrors([]);
            return;
        }
        setAuthRequest(null);
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
            const result = simulateValidation(item, outcome, authorized ? source : undefined);
            commit({ ...current, submissions: current.submissions.map(d => d.id === id ? result : d) });
        });
        setBusy(false);
    }
    function authorizeDiscovery() {
        if (!s || authRequest?.id !== s.id || authRequest.fingerprint !== fingerprint(s)) {
            setAuthRequest(null);
            setErrors(['Connection settings changed. Connect again to authorize the current endpoint.']);
            return;
        }
        authorizedConnection.current = authRequest;
        void validate(authRequest.fingerprint);
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
    function input(key: Field, label: string, multiline = false, hint?: string, max?: number, locked = false, type: 'text' | 'url' | 'email' | 'number' = 'text') {
        return <div className="field" key={key}><label htmlFor={`field-${key}`}>{label}{locked && <span className="optional" aria-hidden="true"> · locked</span>}</label>
      {multiline
                ? <Textarea id={`field-${key}`} value={f?.[key] ?? ''} readOnly={locked} onChange={e => field(key, e.target.value)} rows={4} maxLength={max} aria-describedby={hint ? `${key}-hint` : undefined} block/>
                : <TextInput id={`field-${key}`} value={f?.[key] ?? ''} readOnly={locked} onChange={e => field(key, e.target.value)} maxLength={max} type={type} min={type === 'number' ? 1 : undefined} step={type === 'number' ? 1 : undefined} aria-describedby={hint ? `${key}-hint` : undefined} block/>}
      {(hint || max) && <div className="field-help"><span id={`${key}-hint`}>{hint}</span>{max && <span>{f?.[key].length ?? 0}/{max}</span>}</div>}
    </div>;
    }
    function select(key: Field, label: string, values: string[], hint?: string) {
        return <div className="field"><label htmlFor={`field-${key}`}>{label}</label><Select id={`field-${key}`} value={f?.[key] ?? ''} onChange={e => field(key, e.target.value)} aria-describedby={hint ? `${key}-hint` : undefined} block>
      {!values.includes(f?.[key] ?? '') && <Select.Option value="">Select an answer</Select.Option>}{values.map(value => <Select.Option key={value} value={value}>{value}</Select.Option>)}
    </Select>{hint && <p className="field-help" id={`${key}-hint`}>{hint}</p>}</div>;
    }
    function radio(key: Field, label: string, options: { value: string; caption: string }[], caption?: string) {
        return <div className="field"><RadioGroup name={`field-${key}`} onChange={value => { if (value !== null) field(key, value); }}>
          <RadioGroup.Label>{label}</RadioGroup.Label>
          {caption && <RadioGroup.Caption>{caption}</RadioGroup.Caption>}
          {options.map(option => <FormControl key={option.value}>
            <Radio value={option.value} checked={f?.[key] === option.value} />
            <FormControl.Label>{option.value}</FormControl.Label>
            {option.caption && <FormControl.Caption>{option.caption}</FormControl.Caption>}
          </FormControl>)}
        </RadioGroup></div>;
    }
    function discoveryAuthorization() {
        if (!s || authRequest?.id !== s.id || authRequest.fingerprint !== fingerprint(s)) return null;
        return <section className="authorization-panel" aria-label="Connection authorization">
          <h3>Sign in before importing tool metadata</h3>
          <p>The endpoint requires authorization for discovery. In the live product, you would sign in on the service&apos;s OAuth page and choose an account and workspace.</p>
          <dl className="facts"><dt>Endpoint</dt><dd>{s.fields.endpoint}</dd><dt>Demo account</dt><dd>Northwind reviewer · Support sandbox</dd><dt>Requested scopes</dt><dd>{toolCatalog.map(tool => tool.scope).join(', ')}</dd></dl>
          <p>This step imports schemas only. It does not call tools, and metadata annotations are not proof of safe behavior.</p>
          <div className="actions"><Button variant="primary" onClick={authorizeDiscovery} disabled={busy}>Simulate sign-in and authorize</Button>
            <Button onClick={() => { setAuthRequest(null); setErrors(['Sign-in canceled. Tool metadata was not imported.']); }}>Cancel sign-in</Button></div>
        </section>;
    }
    function checkbox(key: string, text: string) {
        return <label className="checkbox" key={key}><Checkbox checked={s?.checks.includes(key) ?? false} onChange={() => check(key)}/><span>{text}</span></label>;
    }
    function checkPanel() {
        if (!s?.validation)
            return <Notice>{s?.kind === 'connector' ? 'No tool metadata imported. Connect to the server first.' : 'Checks have not run for this source.'}</Notice>;
        if (!currentValidation(s))
            return <Notice tone="warning">Source changed. Run checks again for the current revision.</Notice>;
        const result = s.validation.outcome;
        return <section className="checks-panel" aria-label="Commit checks">
      <div className="panel-title"><span><ShieldCheck size={18}/>marketplace/validate</span><Badge>{result === 'blocked' ? 'Blocked' : result === 'hold' ? 'Policy hold' : 'Passed'}</Badge></div>
      <div className="check-row"><GitCommitHorizontal size={18}/><div><strong>{s.validation.revision}</strong><small>{s.kind === 'plugin' ? `${f?.path}/plugin.json` : `Streamable HTTP · initialize → tools/list · ${requiresDiscoverySignIn(s) ? 'authorized discovery' : 'public metadata'}`}</small></div></div>
      {s.kind === 'connector' && <div className="check-row"><Code2 size={18}/><div><strong>3 tool schemas imported · 0 tools executed</strong><small>Capabilities came from the connected server, not server.json. Test tool behavior separately.</small></div></div>}
      {result === 'blocked' ? <>
        <div className="check-row"><XCircle size={18} className="red"/><div><strong>{s.kind === 'plugin' ? 'Blocking: manifest name is missing' : 'Blocking: search_tickets title is missing'}</strong>
          <small>{s.kind === 'plugin' ? 'plugin.json:2 — add the required name in source.' : 'server/tools.ts:12 — set the title on the server, then re-sync.'}</small></div></div>
        {s.status === 'Draft' && <div className="panel-actions">{s.fixPr
                        ? <><span><GitPullRequest size={16}/>Fix PR open · one source file changed</span><Button className="button primary" onClick={() => act('merge-fix-pr')} variant="primary">{s.kind === 'plugin' ? 'Merge fix and revalidate' : 'Deploy metadata fix'}</Button></>
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
      <p className="section-lead">{s.kind === 'plugin' ? 'The repository and folder supply the listing and every version. They lock on first submission.' : 'server.json supplies the endpoint. Connect to the running MCP server to import its tool metadata; sign in first if discovery is protected.'}</p>
      {s.kind === 'plugin' ? <>
        {input('repo', 'Repository', false, undefined, undefined, !!s.identity)}
        <p className="source-summary"><code>{f.path || 'Repository root'}</code> · {f.ref ? `Tracking ${f.ref}` : 'Following the repository default branch'}</p>
        <details className="progressive-details"><summary>Change folder or tracked reference</summary>
          <div className="form-grid">{input('path', 'Plugin folder (optional)', false, 'Folder containing plugin.json. Leave empty for the repository root.', undefined, !!s.identity)}
            {input('ref', 'Branch or tag (optional)', false, 'Leave empty to follow the default branch. A branch follows new commits; a tag stays on its selected version.')}</div>
        </details>
        {select('visibility', 'Repository visibility', ['Public', 'Private'])}
        {f.visibility === 'Private' && <><Notice tone="warning">Private source can be inspected with consent, but cannot be published. Make it public, revalidate, and obtain approval first.</Notice>
          {checkbox('private-consent', 'Allow simulated inspection of this private repository.')}</>}
        {checkbox('permission', 'I have write access and permission to publish this repository.')}
        <details className="progressive-details"><summary>What we check</summary><ul>
          <li>Access to the repository and the selected folder and reference.</li>
          <li>Manifest fields and declared plugin contents.</li>
          <li>Blocking findings, policy holds, and non-blocking recommendations.</li>
        </ul><p>Checks apply to one revision. A source change requires fresh validation; approval and publication remain separate.</p></details>
      </> : <>
        {input('endpoint', 'MCP server URL', false, 'Publicly reachable HTTPS endpoint using Streamable HTTP. Do not include tokens in the URL.', undefined, !!s.identity, 'url')}
        {select('topology', 'Connection type', ['Universal URL', 'Multiple URLs', 'URL pattern'])}
        {f.topology !== 'Universal URL' && <Notice tone="warning">Verified review is required. This prototype validates one example URL; multi-endpoint configuration is not implemented.</Notice>}
        {select('auth', 'Authentication method', ['OAuth DCR', 'OAuth CIMD', 'Publisher-provided OAuth client', 'Custom connection', 'None'], 'Choose the method your server supports before connecting.')}
        {f.auth !== 'None' && radio('discoveryAccess', 'Who can list tool metadata?', [
          { value: 'Sign-in required', caption: 'The server protects discovery. Authorize a publisher connection before importing tools.' },
          { value: 'Public metadata', caption: 'The server allows initialize and tools/list without sign-in. Protected tool calls still require authorization.' },
        ])}
        {f.auth === 'None' && <p className="muted">Only use no authentication for a service that is safe to access without an account. Discovery does not execute its tools.</p>}
      </>}
      <Button className="button primary" disabled={busy} onClick={() => void validate()} variant="primary" leadingVisual={ShieldCheck}>{busy ? 'Checking source…' : s.kind === 'connector' ? 'Connect and import metadata' : s.validation ? 'Run checks again' : 'Validate repository'}</Button>
      {discoveryAuthorization()}
      {checkPanel()}
      <details className="simulation-controls"><summary>Scanner simulation controls</summary><label htmlFor="scenario">Next check result</label>
        <Select id="scenario" value={s.scenario} disabled={busy} onChange={e => attempt(() => update(item => ({ ...item, scenario: e.target.value as Outcome })))} block>
          <Select.Option value="pass">Passing checks</Select.Option><Select.Option value="blocked">Blocking finding</Select.Option><Select.Option value="hold">Policy hold</Select.Option>
        </Select><p className="muted">Changing this choice does not change completed checks. Run them again.</p></details>
    </>;
        if (label === 'Tools')
            return <>
      <p className="section-lead">These schemas describe what the connected server exposes. They do not prove that the tools work. Titles, descriptions, inputs, and annotations come from the server; fix them there and re-sync. Data access and scope notes below are publisher declarations, not standard tools/list fields.</p>
      {!currentValidation(s) ? <Notice tone="warning">The connection changed. Reconnect before reviewing tool metadata.</Notice> : <>
        <p className="muted">Imported from {f.endpoint} · {s.validation?.revision} · no tools executed</p>
        <div className="panel">{toolCatalog.map(tool => <section className="tool-contract" key={tool.name}>
          <div className="tool-heading"><div><h3>{tool.title}</h3><code>{tool.name}</code></div><Badge>Read only</Badge></div>
          <p>{tool.description}</p>
          <dl className="facts"><dt>Input schema</dt><dd><details><summary>View JSON Schema</summary><pre>{JSON.stringify(tool.input, null, 2)}</pre></details></dd><dt>Data accessed</dt><dd>{tool.data}</dd><dt>Scope</dt><dd><code>{tool.scope}</code></dd><dt>Annotations</dt><dd>readOnlyHint: true · destructiveHint: false</dd></dl>
        </section>)}</div>
        <p className="field-help">Annotations are server declarations, not a safety guarantee. Test each tool and disclose the data it handles.</p>
      </>}
      <Button className="button" disabled={busy} onClick={() => void validate()} variant="default">Re-sync tool metadata</Button>
      {discoveryAuthorization()}
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
      {input('docs', 'Documentation URL', false, 'Public setup and tool documentation. Reviewers must be able to open it without signing in.', undefined, false, 'url')}
      {input('privacy', 'Privacy policy URL', false, 'Explain data use, retention, deletion, and third-party sharing.', undefined, false, 'url')}
      {input('support', 'Public support email', false, 'Shown to users on the listing. Your private review contact is collected at submission.', undefined, false, 'email')}
      {input('useCases', 'Example tasks', true, 'Write prompts users can try. Describe the outcome, not a list of tool names.')}
      {input('prerequisites', 'Account and plan requirements', true, 'Include required subscription tier, workspace role, and setup. State whether users need a paid account.')}
    </>;
        if (label === 'Authentication')
            return <>
      <h3>User sign-in experience</h3>
      {select('auth', 'Authentication method', ['OAuth DCR', 'OAuth CIMD', 'Publisher-provided OAuth client', 'Custom connection', 'None'])}
      <p>{f.auth === 'None' ? 'Users connect without signing in.' : f.discoveryAccess === 'Public metadata' ? 'Users can discover tools before signing in. The server must request authorization before a protected tool call.' : 'Users sign in when connecting, before protected metadata is imported.'}</p>
      <p className="muted">The publisher connection used for discovery does not grant access to users or reviewers. Each connects with their own authorized account.</p>
      {f.auth === 'OAuth DCR' && <p className="field-help">Dynamic Client Registration: the client registers with your authorization server during setup.</p>}
      {f.auth === 'OAuth CIMD' && <p className="field-help">Client ID Metadata Document: your authorization server must support client metadata discovery.</p>}
      <div className="panel"><div className="panel-title">Compatibility</div><div className="panel-body"><p>URL patterns cannot use a publisher-provided OAuth client.</p><p>Multiple URLs cannot use a custom connection.</p></div></div>
      {f.auth === 'Publisher-provided OAuth client' || f.auth === 'Custom connection' ? <Notice tone="warning">Credential registration and custom connection setup are not implemented in this prototype. Do not enter real client secrets. A production submission would need secure configuration before it could be verified.</Notice> : null}
      <p className="field-help">Changing authentication invalidates discovery and testing. Return to Connection to reconnect. No passwords or tokens are stored in this draft.</p>
    </>;
        if (label === 'Data handling')
            return <>
      <p className="section-lead">Tell reviewers what the plugin reads, keeps, and sends to other services. Include personal data accessed through connectors.</p>
      {radio('personal', 'Does the plugin read or store personal data?', [
        { value: 'No', caption: 'It does not access identifiable user or customer information.' },
        { value: 'Reads only', caption: 'It reads personal data, including through connectors, without keeping a copy.' },
        { value: 'Reads and stores', caption: 'The plugin or a service you operate keeps a copy.' },
      ])}
      {f.personal === 'Yes' && <p className="field-help">Your earlier answer was Yes. Confirm whether the plugin only reads data or also stores a copy; your notes are preserved below.</p>}
      {radio('transfers', 'Does it send data beyond declared connectors?', [
        { value: 'No', caption: 'No additional external recipients.' },
        { value: 'Yes', caption: 'Document the recipients, data sent, and purpose in your README or public docs.' },
      ])}
      {f.transfers === 'Yes' && input('transferDetails', 'Where are external transfers documented?', true, 'Link to a README section or public page covering recipients, data, and purpose. Existing explanations can stay here.')}
      {radio('retention', 'How does your service retain data?', [
        { value: 'No retention', caption: 'No copy remains after processing, including in logs or caches.' },
        { value: 'Limited retention', caption: 'Data is deleted automatically after the session or a fixed period.' },
        { value: 'Custom policy', caption: 'Data is kept until deleted, or retention varies by data type or legal requirement.' },
      ], 'Answer for copies kept by the plugin or your service, not the original records in a connected system.')}
      {f.retention === 'Limited retention' && <>
        {select('retentionPeriod', 'Automatically delete', ['End of session', 'Days'])}
        {f.retentionPeriod === 'Days' && input('retentionDays', 'Maximum retention in days', false, 'Include logs and backups. Use Custom policy if there are exceptions.', undefined, false, 'number')}
      </>}
      {f.retention === 'Custom policy' && input('retentionDetails', 'Retention and deletion policy', true, 'Link to your policy or explain retention periods, exceptions, and how users can delete data.')}
      {radio('minors', 'Is the plugin intended for people under 18?', [{ value: 'No', caption: '' }, { value: 'Yes', caption: '' }])}
      <details className="progressive-details"><summary>Additional context (optional)</summary>
        {input('personalDetails', 'Personal data notes', true, 'Add context for reviewers if the data use needs explanation.')}
        {input('storedData', 'Stored data notes', true, 'Optional detail about copies, logs, or storage locations.')}
        {input('deletionProcess', 'Deletion notes', true, 'Optional detail about deletion requests or backup cleanup.')}
      </details>
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
      <h3>Reviewer access</h3>
      <p>Give reviewers a populated test workspace they can access independently. The publisher&apos;s discovery sign-in is not a reviewer account.</p>
      <Button variant="invisible" onClick={() => attempt(() => update(item => {
        let next = changeField(item, 'reviewerSetup', 'Northwind Support sandbox, Team plan, read-only reviewer role. Seed ticket NW-42, project API, and the migration runbook.');
        next = changeField(next, 'reviewerSignIn', 'Open the reviewer URL, select Sign in with OAuth, and use the separately provisioned demo reviewer account. Select the Support sandbox workspace.');
        return changeField(next, 'reviewerRestrictions', 'No SSO enforcement, MFA enrollment, IP allowlist, or VPN required for this sandbox.');
      }))}>Use example reviewer setup</Button>
      {input('access', 'Reviewer access URL', false, 'Landing page for the test environment, not a URL containing a token or password.', undefined, false, 'url')}
      {input('reviewerSetup', 'Test workspace and prerequisites', true, 'Name the seeded workspace, plan, role, and sample data reviewers will need.')}
      {input('reviewerSignIn', 'Reviewer sign-in instructions', true, 'Explain account provisioning and sign-in steps. Refer to a secure credential handoff; do not enter credentials here.')}
      {input('reviewerRestrictions', 'SSO, MFA, and network requirements', true, 'Describe required SSO, MFA, IP allowlisting, VPN, or approval steps. Enter None if there are no restrictions.')}
      <Notice>Secure credential delivery is not implemented. Do not enter passwords, client secrets, or tokens in these fields.</Notice>
      <h3>Tool execution plan</h3>
      <div className="test-coverage">{toolCatalog.map(tool => <div key={tool.name}><code>{tool.name}</code><p>{tool.example}</p><small>Expected: {tool.expected}. Read-only; no cleanup required.</small></div>)}</div>
      {input('testSteps', 'Reviewer test instructions', true, 'Provide executable steps, inputs, and expected results for every imported tool. For write tools, include required permissions, safe test data, and cleanup.')}
      <p className="field-help">The examples above cover the demo server. Reviewers must actually execute the tests; discovery and annotations alone are insufficient.</p>
      {checkbox('tested', 'I personally tested every tool.')}
    </>;
        return <>
      <Listing s={s}/>
      <dl className="facts"><dt>Source</dt><dd>{s.kind === 'plugin' ? `${f.repo} / ${f.path || '(root)'} @ ${f.ref || 'default branch'}` : f.endpoint}</dd>
        <dt>Checked revision</dt><dd>{s.validation?.revision ?? 'Not checked'}</dd>
        <dt>Publication</dt><dd>{s.policy} · {s.kind === 'plugin' ? f.trigger : reviewTier(s)}</dd></dl>
      <section className="submission-summary" aria-label="Submission details">
        <div className="summary-heading"><h3>{s.kind === 'plugin' ? 'Data handling and deletion' : 'Connection and reviewer access'}</h3>
          <Button variant="invisible" size="small" onClick={() => attempt(() => update(item => moveStep(item, item.kind === 'plugin' ? 2 : 4)))}>Edit details</Button></div>
        {s.kind === 'plugin' ? <dl className="facts">
          <dt>Personal data</dt><dd>{f.personal === 'Yes' ? 'Needs confirmation: previously Yes' : f.personal}{f.personalDetails && <p>{f.personalDetails}</p>}</dd>
          <dt>External transfers</dt><dd>{f.transfers}{f.transfers === 'Yes' && <p>{f.transferDetails}</p>}</dd>
          <dt>Retention</dt><dd>{retentionSummary(f)}</dd>
          {f.storedData && <><dt>Stored data notes</dt><dd>{f.storedData}</dd></>}
          {f.deletionProcess && <><dt>Deletion notes</dt><dd>{f.deletionProcess}</dd></>}
          <dt>Under-18 audience</dt><dd>{f.minors}</dd>
        </dl> : <dl className="facts">
          <dt>Authentication</dt><dd>{f.auth} · {f.auth === 'None' ? 'No sign-in' : f.discoveryAccess}</dd>
          <dt>Discovery</dt><dd>Tool schemas imported; tool execution must be tested separately.</dd>
          <dt>Data declarations</dt><dd>{f.ownership} · Health data: {f.health} · Sponsored content: {f.sponsored}{f.health === 'Yes' && <p>{f.safeguards}</p>}</dd>
          <dt>Test environment</dt><dd>{f.access}<p>{f.reviewerSetup}</p></dd>
          <dt>Reviewer sign-in</dt><dd>{f.reviewerSignIn}</dd>
          <dt>Access restrictions</dt><dd>{f.reviewerRestrictions}</dd>
          <dt>Execution plan</dt><dd className="preserve-lines">{f.testSteps}</dd>
        </dl>}
      </section>
      {s.kind === 'connector' && <>{select('reviewTier', 'Requested review path', ['Community', 'Verified'])}
        {f.topology !== 'Universal URL' && <Notice>Effective review: Verified, required by this topology.</Notice>}</>}
      {input('email', 'Private review contact email', false, 'Used for review questions and release decisions. Not displayed on the public listing.', undefined, false, 'email')}{input('notes', 'Notes for reviewers (optional)', true)}
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
    const stepRequirements = s ? steps[s.kind].slice(0, s.step + 1).map((_, index) => ({ index, errors: stepErrors(s, index) })) : [];
    const firstUnmet = stepRequirements.find(step => step.errors.length);
    const finalStep = s && s.step === steps[s.kind].length - 1;
    const progressionErrors = s ? finalStep ? submissionErrors(s) : stepRequirements.flatMap(step => step.errors) : [];
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
          <p>{kind === 'plugin' ? 'Publish a versioned package of skills, agents, and connector references from a repository. Maintain it through commits and releases.' : 'List a running remote service that users connect to. Maintain its authentication, tools, availability, and support independently of plugin releases.'}</p>
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
      {state.view === 'wizard' && s && <div className="page"><div className="page-heading"><div><Button className="text-button" onClick={() => go('listings')} variant="invisible" leadingVisual={ArrowLeft}>Your listings</Button><h1 ref={heading} tabIndex={-1}>Publish {s.kind === 'plugin' ? 'a plugin' : 'an MCP server'}</h1></div><div className="actions"><Badge>{s.live ? 'Live listing · draft update' : 'Draft'}</Badge><Button disabled={busy} onClick={() => go('listings')}>Save and exit</Button><Button className="button" onClick={() => go('console')} variant="default">Open publisher console</Button></div></div>
        <div className="publisher-wizard"><nav className="step-nav" aria-label="Submission steps"><ol>{steps[s.kind].map((label, i) => <li key={label}><Button aria-current={i === s.step ? 'step' : undefined} disabled={blocked || busy} onClick={() => attempt(() => update(item => moveStep(item, i)))} variant="invisible">
          <span className="step-label"><span className="step-number">{i + 1}</span>{label}</span></Button></li>)}</ol></nav>
          <section className="step-content"><h2>{steps[s.kind][s.step]}</h2>{wizardBody()}<footer className="wizard-actions"><span className="muted" role="status">{storageError ? 'Not saved' : 'Saved in this browser'}</span>
            <div className="actions">{s.step > 0 && <Button className="button" disabled={busy} onClick={() => attempt(() => update(item => moveStep(item, item.step - 1)))} variant="default">Back</Button>}
              <Button className="button primary" disabled={busy || blocked || progressionErrors.length > 0} aria-describedby={progressionErrors.length || busy ? 'progression-reason' : undefined} onClick={() => finalStep ? act('submit') : attempt(() => update(item => moveStep(item, item.step + 1)))} variant="primary" trailingVisual={ArrowRight}>
                {finalStep ? 'Submit for review' : 'Continue'}</Button></div>
            {(progressionErrors.length > 0 || busy) && <div className="progression-reason" id="progression-reason" role="status">
              <span>{busy ? 'Wait for source checks to finish.' : progressionErrors[0]}</span>
              {!busy && firstUnmet && firstUnmet.index < s.step && <Button variant="invisible" size="small" onClick={() => attempt(() => update(item => moveStep(item, firstUnmet.index)))}>Go to {steps[s.kind][firstUnmet.index]}</Button>}
            </div>}
          </footer></section></div>
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
