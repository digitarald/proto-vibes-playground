export type Kind = 'plugin' | 'connector';
export type Status = 'Draft' | 'In review' | 'Changes requested' | 'Approved' | 'Published';
export type Outcome = 'pass' | 'blocked' | 'hold';
export type Policy = 'Publisher' | 'Automatic updates' | 'Reviewer';
export type Tab = 'Overview' | 'Review' | 'Versions' | 'Listing' | 'Usage' | 'Health' | 'Settings';
export type View = 'repository' | 'listings' | 'new' | 'wizard' | 'console' | 'public';
export const steps = {
  plugin: ['Source', 'Listing', 'Data handling', 'Releases', 'Review and submit'],
  connector: ['Connection', 'Tools', 'Listing', 'Authentication', 'Data and testing', 'Review and submit'],
};
export const acknowledgments = {
  plugin: [
    'I am authorized to publish this repository and its contents.',
    'The listing accurately describes the plugin and its capabilities.',
    'I have disclosed how the plugin handles and transfers data.',
    'I have reviewed the proposed Marketplace requirements.',
  ],
  connector: [
    'I have reviewed the proposed Marketplace guidelines.',
    'I own the underlying API or have permission to provide access.',
    'Tools comply with the proposed financial transaction restrictions.',
    'Tools comply with the proposed AI-generated media restrictions.',
    'Tool descriptions do not contain prompt-injection instructions.',
    'Conversation data is not collected beyond the declared use.',
    'Public documentation is available and up to date.',
  ],
};

const defaultFields = {
  repo: 'northwind/support-toolkit', path: 'plugins/support-toolkit', ref: 'main',
  visibility: 'Public', endpoint: 'https://mcp.northwind.example/mcp', topology: 'Universal URL',
  name: 'Northwind Helpdesk', summary: 'Find tickets, projects, and documents from your workspace.',
  description: 'Bring support context into your coding workflow. Find an open ticket, look up its project, and read the related runbook.',
  slug: 'northwind-helpdesk', category: 'Developer tools', docs: 'https://northwind.example/docs',
  privacy: 'https://northwind.example/privacy', support: 'support@northwind.example',
  company: 'Northwind', website: 'https://northwind.example', email: 'review@northwind.example',
  useCases: 'Find my open tickets.\nFind the runbook for the API migration.',
  prerequisites: 'A Northwind account with access to the seeded demo workspace.',
  auth: 'OAuth DCR', personal: '', transfers: '', retention: '', minors: '',
  ownership: 'First-party API', health: '', sponsored: '', safeguards: '',
  access: 'https://northwind.example/reviewer',
  testSteps: 'Sign in to the seeded demo workspace using OAuth (no SSO or MFA).\nsearch_tickets: search NW-42; expect one ticket.\nget_project: open project API; expect its title and owner.\nfind_documents: search migration; expect the runbook link.\nAll tools are read-only; no cleanup required.',
  notes: '', trigger: 'GitHub Releases', autoPublish: 'No', reviewTier: 'Community',
};
export type Fields = typeof defaultFields;
export type Field = keyof Fields;
export type Validation = { fingerprint: string; outcome: Outcome; revision: string };
export type Snapshot = { revision: string; fields: Fields; verified: boolean };
export type Event = { actor: 'Publisher' | 'Reviewer' | 'Checks'; text: string; at: string };
export type Version = { revision: string; outcome: Outcome; state: 'Candidate' | 'Failed' | 'Live' | 'Superseded' };
export type Submission = {
  id: string; kind: Kind; status: Status; step: number; fields: Fields; checks: string[];
  revision: number; validation: Validation | null; identity: string | null;
  policy: Policy; verifiedFingerprint: string | null; publicationRequested: boolean;
  live: Snapshot | null; versions: Version[]; events: Event[];
  fixPr: string | null; sourceSummary: string; scenario: Outcome;
};
export type State = { version: 2; submissions: Submission[]; activeId: string | null; view: View; tab: Tab };
export const STORAGE_KEY = 'github-marketplace-synthesis-v2';
export const emptyState = (): State => ({ version: 2, submissions: [], activeId: null, view: 'repository', tab: 'Overview' });

export function createSubmission(kind: Kind): Submission {
  return {
    id: crypto.randomUUID(), kind, status: 'Draft', step: 0,
    fields: { ...defaultFields, ...(kind === 'plugin' ? { name: '', summary: '', description: '' } : {}) },
    checks: [], revision: 1, validation: null, identity: null, policy: 'Publisher',
    verifiedFingerprint: null, publicationRequested: false, live: null, versions: [], events: [],
    fixPr: null, sourceSummary: 'Triage tickets, draft replies, and escalate incidents from Copilot.',
    scenario: kind === 'plugin' ? 'blocked' : 'pass',
  };
}
export function sourceIdentity(s: Submission): string {
  return JSON.stringify(s.kind === 'plugin'
    ? [s.fields.repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/$/, ''), s.fields.path]
    : [s.fields.endpoint]);
}
export function revisionId(s: Submission): string {
  return s.kind === 'plugin' ? `demo-${s.revision.toString(16).padStart(6, '0')}` : `snapshot-${s.revision}`;
}
export function fingerprint(s: Submission): string {
  const f = s.fields;
  return JSON.stringify(s.kind === 'plugin'
    ? [sourceIdentity(s), f.ref, f.visibility, s.revision, s.sourceSummary, s.checks.includes('private-consent')]
    : [f.endpoint, f.topology, f.auth, s.revision]);
}
export const currentValidation = (s: Submission): boolean => s.validation?.fingerprint === fingerprint(s);
export const reviewTier = (s: Submission): string =>
  s.kind === 'connector' && (s.fields.topology !== 'Universal URL' || s.fields.reviewTier === 'Verified') ? 'Verified' : 'Community';
export function validHttps(value: string): boolean {
  try { const u = new URL(value); return u.protocol === 'https:' && !!u.hostname && !u.username && !u.password; }
  catch { return false; }
}
export function sourceError(s: Submission): string | null {
  const f = s.fields;
  if (s.identity && s.identity !== sourceIdentity(s)) return 'The submitted source identity is locked. Create a new listing for a different source.';
  if (s.kind === 'connector') return validHttps(f.endpoint) ? null : 'Enter an HTTPS MCP endpoint without embedded credentials.';
  const repo = f.repo.trim().replace(/^https:\/\/github\.com\//, '').replace(/\/$/, '');
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return 'Enter owner/repository or a GitHub repository URL.';
  if (!f.ref.trim()) return 'Enter a tracked branch or tag.';
  if (f.path.startsWith('/') || f.path.includes('\\') || f.path.split('/').includes('..')) return 'Use a repository-relative plugin folder without parent traversal.';
  if (f.visibility === 'Private' && !s.checks.includes('private-consent')) return 'Consent to private-source inspection before running checks.';
  return null;
}

const choices: Partial<Record<Field, readonly string[]>> = {
  visibility: ['Public', 'Private'], topology: ['Universal URL', 'Multiple URLs', 'URL pattern'],
  auth: ['OAuth DCR', 'OAuth CIMD', 'Publisher-provided OAuth client', 'Custom connection', 'None'],
  personal: ['', 'No', 'Yes'], transfers: ['', 'No', 'Yes'], minors: ['', 'No', 'Yes'],
  health: ['', 'No', 'Yes'], sponsored: ['', 'No', 'Yes'],
  ownership: ['First-party API', 'Authorized partner proxy', 'Uncontrolled third-party API'],
  trigger: ['GitHub Releases', 'Push to tracked ref', 'Manual'],
  autoPublish: ['No', 'Yes'], reviewTier: ['Community', 'Verified'],
};
export function stepErrors(s: Submission, step = s.step): string[] {
  const f = s.fields;
  const label = steps[s.kind][step];
  if (!label) return ['Unknown submission step.'];
  const errors: string[] = [];
  const required = (key: Field, title: string) => { if (!f[key].trim()) errors.push(`${title} is required.`); };
  const url = (key: Field, title: string) => { if (!validHttps(f[key])) errors.push(`${title} must be an HTTPS URL without embedded credentials.`); };
  const email = (key: Field, title: string) => { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f[key])) errors.push(`Enter a valid ${title.toLowerCase()}.`); };
  const confirm = (key: string, text: string) => { if (!s.checks.includes(key)) errors.push(text); };
  if (step === 0) {
    const error = sourceError(s);
    if (error) errors.push(error);
    if (!currentValidation(s)) errors.push('Run checks for the current source before continuing.');
    else if (s.validation?.outcome === 'blocked') errors.push('Resolve the blocking finding and revalidate.');
    if (s.kind === 'plugin') confirm('permission', 'Confirm permission to publish this repository.');
  }
  if (label === 'Tools') confirm('tools', 'Confirm the imported tool capabilities.');
  if (label === 'Listing') {
    required('name', 'Listing name'); required('summary', 'Short description'); required('description', 'Description');
    if (f.name.length > 100 || f.summary.length > 200 || f.description.length > 2000) errors.push('Listing text exceeds its character limit.');
    if (s.kind === 'connector') {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug)) errors.push('Use lowercase words separated by hyphens for the listing slug.');
      if (s.live && f.slug !== s.live.fields.slug) errors.push('The published listing slug is locked.');
      url('docs', 'Documentation'); url('privacy', 'Privacy policy'); email('support', 'Support email');
      required('useCases', 'Example tasks'); required('prerequisites', 'Prerequisites');
      required('company', 'Organization name'); url('website', 'Organization website');
    }
  }
  if (label === 'Authentication') {
    if (f.topology === 'URL pattern' && f.auth === 'Publisher-provided OAuth client') errors.push('URL patterns require DCR, CIMD, custom connection, or no authentication; a publisher-provided client is incompatible.');
    if (f.topology === 'Multiple URLs' && f.auth === 'Custom connection') errors.push('Custom connection cannot be combined with multiple URLs.');
  }
  if (label === 'Data handling') {
    required('personal', 'Personal data disclosure'); required('transfers', 'External transfer disclosure');
    required('retention', 'Data retention'); required('minors', 'Audience disclosure');
  }
  if (label === 'Data and testing') {
    required('health', 'Health data disclosure'); required('sponsored', 'Sponsored content disclosure');
    if (f.health === 'Yes') required('safeguards', 'Health-data safeguards and test case');
    if (f.sponsored === 'Yes') errors.push('Sponsored content is unsupported in this prototype policy.');
    if (f.ownership === 'Uncontrolled third-party API') errors.push('Obtain authorization for the underlying API before submitting.');
    url('access', 'Reviewer access'); required('testSteps', 'Reviewer test instructions');
    confirm('tested', 'Confirm you personally tested every tool.');
  }
  if (label === 'Review and submit') {
    email('email', 'Review contact email');
    acknowledgments[s.kind].forEach((_, i) => confirm(`compliance-${i}`, `Accept acknowledgment ${i + 1}.`));
  }
  return errors;
}
export function submissionErrors(s: Submission): string[] {
  const invalid = Object.entries(choices).filter(([key, values]) => !values.includes(s.fields[key as Field]));
  return [...invalid.map(([key]) => `Invalid ${key} selection.`), ...steps[s.kind].flatMap((_, i) => stepErrors(s, i))];
}
function event(s: Submission, actor: Event['actor'], text: string): Submission {
  return { ...s, events: [...s.events, { actor, text, at: new Date().toISOString() }] };
}
export function changeField(s: Submission, key: Field, value: string): Submission {
  if (s.status !== 'Draft') throw new Error('Open a revision before editing this submission.');
  if (s.identity && (s.kind === 'plugin' ? ['repo', 'path'] : ['endpoint']).includes(key)) throw new Error('Source identity is locked after submission.');
  if (s.live && key === 'slug') throw new Error('The published slug cannot change.');
  if (s.kind === 'plugin' && ['name', 'summary', 'description'].includes(key)) throw new Error('Plugin listing text comes from the source. Use a source pull request.');
  if (choices[key] && !choices[key]?.includes(value)) throw new Error(`Invalid ${key} selection.`);
  const next = { ...s, fields: { ...s.fields, [key]: value }, verifiedFingerprint: null, publicationRequested: false };
  if (fingerprint(next) !== fingerprint(s)) {
    next.checks = s.checks.filter(c => !['tools', 'tested'].includes(c));
    next.fixPr = null;
  }
  if (['access', 'testSteps', 'safeguards'].includes(key)) next.checks = next.checks.filter(c => c !== 'tested');
  if (['repo', 'path'].includes(key)) next.checks = next.checks.filter(c => !['private-consent', 'permission'].includes(c));
  return next;
}
export function toggleCheck(s: Submission, key: string): Submission {
  if (s.status !== 'Draft') throw new Error('Only drafts can change acknowledgments.');
  return { ...s, checks: s.checks.includes(key) ? s.checks.filter(c => c !== key) : [...s.checks, key] };
}
export function moveStep(s: Submission, step: number): Submission {
  if (s.status !== 'Draft' || !Number.isInteger(step) || step < 0 || step >= steps[s.kind].length) throw new Error('That step is unavailable.');
  if (step > s.step) {
    const errors = Array.from({ length: step }, (_, i) => stepErrors(s, i)).flat();
    if (errors.length) throw new Error(errors.join('\n'));
  }
  return { ...s, step };
}
export function simulateValidation(s: Submission, outcome: Outcome = s.scenario): Submission {
  if (s.status !== 'Draft') throw new Error('Open a revision before validating.');
  const error = sourceError(s);
  if (error) throw new Error(error);
  const revision = revisionId(s);
  const fields = s.kind === 'plugin' ? {
    ...s.fields, name: 'Support Toolkit', summary: s.sourceSummary,
    description: 'Three support skills, one issue-maintainer agent, and a reference to the Northwind Helpdesk connector. Review the runbook before escalating a ticket.',
  } : s.fields;
  return event({
    ...s, fields, validation: { fingerprint: fingerprint(s), revision, outcome },
    verifiedFingerprint: null, publicationRequested: false,
    versions: [...s.versions.filter(v => v.revision !== revision || v.state === 'Live' || v.state === 'Superseded'),
      { revision, outcome, state: outcome === 'blocked' ? 'Failed' : 'Candidate' }],
  }, 'Checks', `${revision}: ${outcome === 'blocked' ? 'blocking finding' : outcome === 'hold' ? 'checks complete; reviewer hold' : 'checks passed'}.`);
}

export type Action = 'submit' | 'request-changes' | 'revise' | 'clear-hold' | 'verify-tools' | 'approve' |
  'publish' | 'request-publication' | 'reviewer-publish' | 'open-fix-pr' | 'merge-fix-pr' | 'source-edit';
function publish(s: Submission, actor: Event['actor']): Submission {
  return event({
    ...s, status: 'Published', publicationRequested: false,
    live: { revision: revisionId(s), fields: { ...s.fields }, verified: reviewTier(s) === 'Verified' },
    versions: s.versions.map(v => ({
      ...v, state: v.revision === revisionId(s) ? 'Live' : v.state === 'Live' ? 'Superseded' : v.state,
    })),
  }, actor, `Published ${revisionId(s)}. Approval and publication are recorded separately.`);
}
export function publicationErrors(s: Submission): string[] {
  return [
    ...(s.status !== 'Approved' ? ['This revision must be approved first.'] : []),
    ...submissionErrors(s),
    ...(!currentValidation(s) || s.validation?.outcome !== 'pass' ? ['Current passing checks and a cleared hold are required.'] : []),
    ...(s.kind === 'plugin' && s.fields.visibility !== 'Public' ? ['Make the source public, then revalidate and obtain approval.'] : []),
    ...(reviewTier(s) === 'Verified' && s.verifiedFingerprint !== fingerprint(s) ? ['A reviewer must verify every tool on this revision.'] : []),
  ];
}
export function transition(s: Submission, action: Action): Submission {
  if (action === 'submit' && s.status === 'Draft') {
    const errors = submissionErrors(s);
    if (errors.length) throw new Error(errors.join('\n'));
    return event({ ...s, status: 'In review', identity: s.identity ?? sourceIdentity(s) }, 'Publisher', `Submitted ${revisionId(s)} for ${s.kind === 'plugin' ? 'plugin' : reviewTier(s)} review.`);
  }
  if (action === 'request-changes' && s.status === 'In review') return event({ ...s, status: 'Changes requested' }, 'Reviewer', 'Please add expected results and clarify the data disclosure before resubmitting.');
  if (action === 'revise' && ['Changes requested', 'Approved', 'Published'].includes(s.status)) return event({
    ...s, status: 'Draft', step: 0, validation: null, verifiedFingerprint: null, publicationRequested: false,
    revision: s.live ? s.revision + 1 : s.revision, checks: s.checks.filter(c => !['tools', 'tested'].includes(c)),
  }, 'Publisher', 'Opened a revision. Source identity stays locked; the live listing is unchanged.');
  if (action === 'clear-hold' && s.status === 'In review' && currentValidation(s) && s.validation?.outcome === 'hold') return event({
    ...s, validation: { ...s.validation, outcome: 'pass' },
    versions: s.versions.map(v => v.revision === revisionId(s) ? { ...v, outcome: 'pass' } : v),
  }, 'Reviewer', 'Policy hold cleared for this checked revision.');
  if (action === 'verify-tools' && s.kind === 'connector' && s.status === 'In review' && currentValidation(s)
    && s.validation?.outcome === 'pass' && submissionErrors(s).length === 0 && reviewTier(s) === 'Verified') {
    return event({ ...s, verifiedFingerprint: fingerprint(s) }, 'Reviewer', 'All three tools tested with the supplied test plan. Verified review complete.');
  }
  if (action === 'approve' && s.status === 'In review') {
    const errors = submissionErrors(s);
    if (!currentValidation(s) || s.validation?.outcome !== 'pass') errors.push('Resolve findings and clear policy holds before approval.');
    if (reviewTier(s) === 'Verified' && s.verifiedFingerprint !== fingerprint(s)) errors.push('Complete the reviewer tool tests before Verified approval.');
    if (errors.length) throw new Error(errors.join('\n'));
    const approved = event({ ...s, status: 'Approved' }, 'Reviewer', `Approved ${revisionId(s)}.`);
    return s.live && s.policy === 'Automatic updates' && s.fields.autoPublish === 'Yes' && !publicationErrors(approved).length
      ? publish(approved, 'Checks') : approved;
  }
  if (['publish', 'request-publication', 'reviewer-publish'].includes(action)) {
    const errors = publicationErrors(s);
    if (errors.length) throw new Error(errors.join('\n'));
    if (action === 'request-publication' && s.policy === 'Reviewer' && !s.publicationRequested) return event({ ...s, publicationRequested: true }, 'Publisher', 'Requested reviewer publication.');
    if (action === 'reviewer-publish' && s.policy === 'Reviewer' && s.publicationRequested) return publish(s, 'Reviewer');
    if (action === 'publish' && s.policy !== 'Reviewer') return publish(s, 'Publisher');
  }
  if (action === 'open-fix-pr' && s.status === 'Draft' && currentValidation(s) && s.validation?.outcome === 'blocked' && !s.fixPr) {
    return event({ ...s, fixPr: fingerprint(s) }, 'Publisher', 'Opened simulated fix PR: add manifest name or complete tool metadata.');
  }
  if (action === 'merge-fix-pr' && s.status === 'Draft' && s.fixPr === fingerprint(s)) {
    const next = { ...s, revision: s.revision + 1, fixPr: null, scenario: 'pass' as const };
    return simulateValidation(event(next, 'Publisher', 'Merged simulated fix PR; revalidating the new revision.'), 'pass');
  }
  if (action === 'source-edit' && s.kind === 'plugin' && s.status === 'Draft') {
    return event({ ...s, sourceSummary: 'Triage support tickets with clearer escalation steps and reproducible reports.',
      revision: s.revision + 1, fixPr: null }, 'Publisher', 'Merged simulated README and manifest update. Revalidate to refresh the listing.');
  }
  throw new Error('This action is unavailable in the current state or publication policy.');
}
export function simulateSourceEvent(s: Submission, trigger: string, outcome: Outcome): Submission {
  if (!s.live || s.kind !== 'plugin' || s.status !== 'Published') throw new Error('Publish the current plugin revision before simulating an update.');
  if (s.fields.trigger !== trigger) throw new Error(`This listing listens for ${s.fields.trigger}, not ${trigger}.`);
  const draft = transition(s, 'revise');
  return simulateValidation(event({ ...draft, scenario: outcome }, 'Checks', `${trigger} detected a new commit.`), outcome);
}
export function addComment(s: Submission, text: string): Submission {
  if (!text.trim()) throw new Error('Write a review reply before posting.');
  return event(s, 'Publisher', text.trim());
}
export function assignPolicy(s: Submission, policy: Policy): Submission {
  if (!['Publisher', 'Automatic updates', 'Reviewer'].includes(policy)) throw new Error('Unknown publication policy.');
  return event({ ...s, policy, publicationRequested: false }, 'Reviewer', `Assigned publication policy: ${policy}.`);
}

function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null && !Array.isArray(v); }
function oneOf(v: unknown, values: readonly string[]): boolean { return typeof v === 'string' && values.includes(v); }
function fieldsValid(v: unknown): v is Fields {
  return isRecord(v) && Object.keys(defaultFields).every(k => typeof v[k] === 'string')
    && Object.entries(choices).every(([key, options]) => options.includes(String(v[key])));
}
export function parseState(raw: string): State {
  const state: unknown = JSON.parse(raw);
  const invalid = () => { throw new Error('Saved data is invalid or from an unsupported version. Export it before resetting.'); };
  if (!isRecord(state) || state.version !== 2 || !Array.isArray(state.submissions)
    || !oneOf(state.view, ['repository', 'listings', 'new', 'wizard', 'console', 'public'])
    || !oneOf(state.tab, ['Overview', 'Review', 'Versions', 'Listing', 'Usage', 'Health', 'Settings'])
    || !(state.activeId === null || typeof state.activeId === 'string')) return invalid();
  const ids = new Set<string>();
  for (const item of state.submissions) {
    if (!isRecord(item) || !oneOf(item.kind, ['plugin', 'connector']) || typeof item.id !== 'string' || !item.id || ids.has(item.id)
      || !oneOf(item.status, ['Draft', 'In review', 'Changes requested', 'Approved', 'Published'])
      || !Number.isInteger(item.step) || Number(item.step) < 0 || Number(item.step) >= (item.kind === 'plugin' ? 5 : 6)
      || !fieldsValid(item.fields) || !Array.isArray(item.checks) || !item.checks.every(c => typeof c === 'string')
      || !Number.isInteger(item.revision) || Number(item.revision) < 1
      || !oneOf(item.policy, ['Publisher', 'Automatic updates', 'Reviewer'])
      || !oneOf(item.scenario, ['pass', 'hold', 'blocked']) || typeof item.publicationRequested !== 'boolean'
      || typeof item.sourceSummary !== 'string'
      || ![item.identity, item.fixPr, item.verifiedFingerprint].every(v => v === null || typeof v === 'string')
      || !Array.isArray(item.events) || !item.events.every(e => isRecord(e) && oneOf(e.actor, ['Publisher', 'Reviewer', 'Checks']) && typeof e.text === 'string' && typeof e.at === 'string' && Number.isFinite(Date.parse(e.at)))
      || !Array.isArray(item.versions) || !item.versions.every(v => isRecord(v) && typeof v.revision === 'string' && oneOf(v.outcome, ['pass', 'blocked', 'hold']) && oneOf(v.state, ['Candidate', 'Failed', 'Live', 'Superseded']))) return invalid();
    ids.add(item.id);
    const v = item.validation;
    if (v !== null && (!isRecord(v) || typeof v.fingerprint !== 'string' || typeof v.revision !== 'string' || !oneOf(v.outcome, ['pass', 'blocked', 'hold']))) return invalid();
    const live = item.live;
    if (live !== null && (!isRecord(live) || typeof live.revision !== 'string' || typeof live.verified !== 'boolean' || !fieldsValid(live.fields))) return invalid();
    if (item.status === 'Published' && live === null) return invalid();
  }
  if (typeof state.activeId === 'string' && !ids.has(state.activeId)) return invalid();
  if (['wizard', 'console', 'public'].includes(String(state.view)) && state.activeId === null) return invalid();
  // Every nested property consumed by the UI has been checked at this storage boundary.
  return state as State;
}
