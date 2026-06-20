/* ============================================================
   Agentic OS Mission Control — app.js v2
   ============================================================ */

// ── State ───────────────────────────────────────────────────
const state = {
  ctrl: null,
  dbCache: {},
  activeView: 'overview',
  queueFilter: 'ALL',
  scalerLedger: 'fi_sources',
  hustlerLedger: 'hustler_inbox',
  rawDbKey: null,
};

// DB file keys and their labels (must match server.py DB_FILES)
const DB_LABELS = {
  controler:    'CONTROLER.yaml',
  meta_os:      'meta_os.yaml',
  scaler_os:    'pipeline_scaler_os.yaml',
  hustler_os:   'pipeline_hustler_os.yaml',
  projects_os:  'projects_os.yaml',
  toolboxes:    '.toolboxes.yaml',
  scaler_inbox: 'Scaler Mixed Inbox',
  fi_sources:   'FI Sources',
  fi_proposals: 'FI Proposals',
  om_sources:   'OM Sources',
  om_proposals: 'OM Proposals',
  vg_sources:   'VG Sources',
  vg_proposals: 'VG Proposals',
  hustler_inbox:'Hustler Inbox',
};

// View title map
const VIEW_TITLES = {
  overview:       'Overview',
  'core-modes':   'Core Modes',
  'scaler-modes': 'Scaler Pipeline Modes',
  'review-queue': 'Scaler Review Queue',
  'scaler-ledgers': 'Scaler Ledgers',
  'hustler-modes':  'Hustler Pipeline Modes',
  'hustler-ledgers':'Hustler Ledgers',
  projects:       'Projects',
  toolboxes:      'Toolboxes',
  'raw-db':       'Raw DB Viewer',
};

// ── Toast ────────────────────────────────────────────────────
let toastTimer;
function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.className = '', 3000);
}

// ── API helpers ──────────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

async function apiPost(path, body) {
  return api(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function loadDB(key) {
  const data = await api(`/api/db?file=${key}`);
  state.dbCache[key] = data;
  return data;
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupNav();
  setupTopbar();
  setupQueueFilters();
  setupScalerLedgerTabs();
  setupHustlerLedgerTabs();
  setupRawDbTabs();
  fetchAndRender();
  setInterval(fetchAndRender, 8000);
});

// ── Navigation ───────────────────────────────────────────────
function setupNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const viewId = btn.dataset.view;
      showView(viewId);
    });
  });
}

function showView(viewId) {
  state.activeView = viewId;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${viewId}`));
  document.getElementById('view-title').textContent = VIEW_TITLES[viewId] || viewId;

  // Lazy-load some views
  if (viewId === 'scaler-ledgers') loadScalerLedger(state.scalerLedger);
  if (viewId === 'hustler-ledgers') loadHustlerLedger(state.hustlerLedger);
  if (viewId === 'raw-db' && state.rawDbKey) loadRawDb(state.rawDbKey);
}

// ── Topbar buttons ───────────────────────────────────────────
function setupTopbar() {
  document.getElementById('btn-sync').addEventListener('click', async () => {
    const btn = document.getElementById('btn-sync');
    btn.innerHTML = '<span class="spinner"></span> Syncing…';
    btn.disabled = true;
    try {
      await apiPost('/api/sync', {});
      toast('✅ Sync complete');
      await fetchAndRender();
    } catch (e) {
      toast(`❌ Sync failed: ${e.message}`, 'err');
    } finally {
      btn.innerHTML = '🔄 Force Sync';
      btn.disabled = false;
    }
  });

  document.getElementById('btn-stop').addEventListener('click', async () => {
    if (!confirm('Shut down the Agentic OS Dashboard Server?')) return;
    try {
      await apiPost('/api/update_db', { file: 'controler', key_path: 'core.modes.dashboard_status', value: 'off 🔴' });
      document.body.innerHTML = '<div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#080A10;color:#9BA3B5;font-family:system-ui"><div style="text-align:center"><div style="font-size:3rem;margin-bottom:16px">🛑</div><h1 style="color:#fff;margin-bottom:8px">Dashboard Offline</h1><p>Set dashboard_status to on 🟢 in CONTROLER.yaml to restart.</p></div></div>';
    } catch (e) {
      toast(`❌ ${e.message}`, 'err');
    }
  });
}

// ── Main fetch & render ──────────────────────────────────────
async function fetchAndRender() {
  try {
    const data = await api('/api/state');
    state.ctrl = data.controller || {};
    renderAll();
    updateSyncStatus('fresh');
  } catch (e) {
    updateSyncStatus('error');
    console.error('State fetch failed:', e);
  }
}

function updateSyncStatus(status) {
  const dot = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  dot.className = `sync-dot ${status}`;
  label.textContent = status === 'fresh' ? 'Live' : status === 'error' ? 'Error' : 'Syncing';
  const ts = state.ctrl?.system_metadata?.freshness?.last_synced;
  if (ts) {
    document.getElementById('last-sync').textContent = 'Last sync: ' + new Date(ts).toLocaleTimeString();
  }
}

function renderAll() {
  const ctrl = state.ctrl;
  if (!ctrl) return;

  const meta = ctrl.metadata || {};
  const coreModes = ctrl.core?.modes || {};
  const pipelines = ctrl.pipelines || {};
  const scaler = pipelines.scaler || {};
  const hustler = pipelines.hustler || {};
  const projects = ctrl.projects || {};
  const toolboxes = ctrl.toolboxes || {};

  // Sidebar footer
  el('sf-health', meta.system_health || '—');
  el('sf-syncs', meta.sync_count ?? '—');
  el('sf-loc', meta.location || '—');

  // Nav badge — pending proposals
  const queue = scaler.queues?.scaler_review_queue || [];
  const pending = queue.filter(p => p.status === 'PENDING').length;
  el('nav-queue-count', pending);

  renderOverview(ctrl, coreModes, scaler, hustler, meta);
  renderCoreModes(coreModes, ctrl.core);
  renderScalerModes(scaler);
  renderReviewQueue(queue);
  renderHustlerModes(hustler);
  renderProjects(projects);
  renderToolboxes(toolboxes, meta);
}

// ── 1. Overview ──────────────────────────────────────────────
function renderOverview(ctrl, coreModes, scaler, hustler, meta) {
  el('ov-work-mode', modeTag(coreModes.work_mode));
  el('ov-action-gate', coreModes.action_gate || '—');

  const queue = scaler.queues?.scaler_review_queue || [];
  const pending = queue.filter(p => p.status === 'PENDING').length;
  el('ov-pending', `${pending} / ${queue.length}`);

  const tb = meta.toolbox_readiness || {};
  el('ov-toolboxes', `${tb.functional}✅ ${tb.partial}⚠️ ${tb.empty}⬜`);

  // Hub events
  const events = ctrl.core?.system?.hub?.recent_events || [];
  const evCont = document.getElementById('ov-hub-events');
  if (events.length) {
    evCont.innerHTML = events.map(e => `<div class="event-item">${escHtml(String(e))}</div>`).join('');
  } else {
    evCont.innerHTML = '<div class="empty"><span>📭</span>No recent events</div>';
  }

  // Errors
  const errors = ctrl.core?.system?.system_errors || [];
  const errCont = document.getElementById('ov-errors');
  const errBadge = document.getElementById('ov-err-badge');
  if (errors.length) {
    errBadge.style.display = '';
    errCont.innerHTML = errors.map(e => `<div class="event-item" style="color:var(--red)">${escHtml(String(e))}</div>`).join('');
  } else {
    errBadge.style.display = 'none';
    errCont.innerHTML = '<div class="empty"><span>✅</span>No errors — substrate is healthy</div>';
  }

  // Milestones
  const scalerMs = ctrl.pipelines?.scaler?.milestones || {};
  const coreMs   = ctrl.core?.milestones || {};
  const allMs = { ...coreMs, ...scalerMs };
  const msCont = document.getElementById('ov-milestones');
  const msKeys = Object.keys(allMs);
  if (msKeys.length) {
    msCont.innerHTML = msKeys.map(k => {
      const m = allMs[k];
      const sessions = m.sessions || [];
      const sessHtml = sessions.map(s => {
        const goals = s.goals || [];
        return `
          <div style="margin-bottom:10px; padding:12px; background:rgba(0,0,0,0.2); border-radius:8px; border-left:3px solid var(--purple)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <strong style="color:#fff">${escHtml(s.session_id || k)}</strong>
              ${badge(s.status, statusColor(s.status))}
              <span style="margin-left:auto;font-size:0.75rem;color:var(--text-3)">Round ${s.current_round || '?'} / ${s.max_rounds || '?'}</span>
            </div>
            ${goals.map(g => `
              <div style="display:flex;align-items:center;gap:6px;font-size:0.78rem;color:var(--text-2);margin-top:4px">
                <span>${goalIcon(g.status)}</span>
                <span style="font-family:var(--mono)">${escHtml(g.goal_id)}</span>
                ${badge(g.status, statusColor(g.status))}
              </div>
            `).join('')}
          </div>
        `;
      }).join('');
      return sessHtml || `<div class="event-item">${escHtml(k)}</div>`;
    }).join('');
  } else {
    msCont.innerHTML = '<div class="empty"><span>🎯</span>No active milestones</div>';
  }
}

// ── 2. Core Modes (editable) ─────────────────────────────────
function renderCoreModes(modes, coreBlock) {
  const table = document.getElementById('core-modes-table');

  const WORK_MODE_OPTIONS  = ['AUTO 🟢', 'COLLAB 🟢', 'STRICT 🔴'];
  const ACTION_GATE_OPTIONS = ['EXECUTION 🟢', 'PLANNING 🟠'];
  const ONOFF_OPTIONS = ['on 🟢', 'off 🔴'];
  const EVO_OPTIONS = ['on', 'off'];

  const rows = [
    { key: 'work_mode',        label: 'work_mode',        type: 'select', options: WORK_MODE_OPTIONS,   file: 'controler', path: 'core.modes.work_mode' },
    { key: 'action_gate',      label: 'action_gate',      type: 'select', options: ACTION_GATE_OPTIONS,  file: 'controler', path: 'core.modes.action_gate' },
    { key: 'evolution_status', label: 'evolution_status', type: 'select', options: EVO_OPTIONS,           file: 'controler', path: 'core.modes.evolution_status' },
    { key: 'autosync_status',  label: 'autosync_status',  type: 'select', options: ONOFF_OPTIONS,         file: 'controler', path: 'core.modes.autosync_status' },
    { key: 'dashboard_status', label: 'dashboard_status', type: 'select', options: ONOFF_OPTIONS,         file: 'controler', path: 'core.modes.dashboard_status' },
  ];

  table.innerHTML = buildCtrlRows(rows, modes, 'core-mode');

  // Evolution queue
  const pending = coreBlock?.evolution?.queues?.pending || [];
  const evoCont = document.getElementById('core-evolution');
  if (pending.length) {
    evoCont.innerHTML = pending.map(p => `
      <div class="event-item" style="margin-bottom:8px">
        <strong>${escHtml(p.id || '(no id)')}</strong>
        <span class="badge muted" style="margin-left:8px">${escHtml(p.target_file || '')}</span>
        <div style="margin-top:4px;color:var(--text-2)">${escHtml(p.description || '')}</div>
      </div>
    `).join('');
  } else {
    evoCont.innerHTML = '<div class="empty"><span>🧬</span>No pending evolution proposals</div>';
  }
}

// ── 3. Scaler Modes (editable) ───────────────────────────────
function renderScalerModes(scaler) {
  const modes = scaler.modes || {};
  const WORK_OPTS = ['AUTO 🟢', 'COLLAB 🟢', 'STRICT 🔴'];
  const INPUT_OPTS = ['AUTO', 'MANUAL'];
  const ONOFF = ['on', 'off'];

  const rows = [
    { key: 'work_mode',       label: 'work_mode',       type: 'select', options: WORK_OPTS,  file: 'scaler_os', path: 'metadata.modes.work_mode' },
    { key: 'input_mode',      label: 'input_mode',      type: 'select', options: INPUT_OPTS, file: 'scaler_os', path: 'metadata.modes.input_mode' },
    { key: 'pipeline_status', label: 'pipeline_status', type: 'select', options: ONOFF,      file: 'scaler_os', path: 'metadata.modes.pipeline_status' },
  ];
  document.getElementById('scaler-modes-table').innerHTML = buildCtrlRows(rows, modes, 'scaler-mode');

  // Stats
  const st = scaler.state || {};
  const gw = st.gateway_metrics || {};
  const mx = st.metrics || {};
  el('sm-phase', st.current_phase ?? '—');
  el('sm-proposals', mx.proposals_generated ?? '—');
  el('sm-pending', gw.pending_approvals_count ?? '—');
  el('sm-ops', mx.scaling_ops ?? '—');

  // Events
  const evs = st.recent_events || [];
  const evCont = document.getElementById('scaler-events');
  if (evs.length) {
    evCont.innerHTML = evs.map(e => `
      <div class="event-item">
        <strong>${escHtml(e.event || '')}</strong>
        <span style="float:right;color:var(--text-3);font-size:0.72rem">${escHtml(e.at || '')}</span>
        <div style="margin-top:4px">${escHtml(e.summary || '')}</div>
      </div>
    `).join('');
  } else {
    evCont.innerHTML = '<div class="empty"><span>📭</span>No events</div>';
  }

  // Profile gates
  const profiles = scaler.profiles || {};
  const internalGates = profiles.INTERNAL?.action_gate || {};
  const externalGates = profiles.EXTERNAL?.action_gate || {};

  const GATE_OPTS = ['FULL', '', 'EXECUTION', 'PLANNING'];
  const internalRows = Object.entries(internalGates).map(([k, v]) => ({
    key: k, label: k, type: 'text',
    file: 'scaler_os',
    path: `metadata.profiles.INTERNAL.action_gate.${k}`
  }));
  const externalRows = Object.entries(externalGates).map(([k, v]) => ({
    key: k, label: k, type: 'text',
    file: 'scaler_os',
    path: `metadata.profiles.EXTERNAL.action_gate.${k}`
  }));

  document.getElementById('scaler-internal-gates').innerHTML = buildCtrlRows(internalRows, internalGates, 'sint');
  document.getElementById('scaler-external-gates').innerHTML = buildCtrlRows(externalRows, externalGates, 'sext');
}

// ── 4. Review Queue ──────────────────────────────────────────
function setupQueueFilters() {
  document.getElementById('queue-filter-tabs').addEventListener('click', async e => {
    const tab = e.target.closest('.pill-tab');
    if (!tab) return;
    document.querySelectorAll('#queue-filter-tabs .pill-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.queueFilter = tab.dataset.filter;
    
    if (state.queueFilter === 'ARCHIVED') {
      const container = document.getElementById('review-queue-list');
      container.innerHTML = '<div class="empty"><span>⏳</span>Loading archives…</div>';
      try {
        const res = await api('/api/archives');
        // Archives have status INTEGRATED or similar, so override status to APPROVED for display
        const archives = (res.archives || []).map(p => ({...p, status: 'APPROVED'}));
        renderReviewQueue(archives);
      } catch (e) {
        container.innerHTML = `<div class="empty"><span>❌</span>Error loading archives: ${e.message}</div>`;
      }
    } else {
      renderReviewQueue(state.ctrl?.pipelines?.scaler?.queues?.scaler_review_queue || []);
    }
  });

  document.getElementById('btn-approve-all').addEventListener('click', async () => {
    const queue = state.ctrl?.pipelines?.scaler?.queues?.scaler_review_queue || [];
    const pendingIds = queue.filter(p => p.status === 'PENDING').map(p => p.id);
    if (!pendingIds.length) { toast('No pending proposals', 'ok'); return; }
    if (!confirm(`Approve all ${pendingIds.length} pending proposals?`)) return;
    for (const id of pendingIds) {
      try { await apiPost('/api/proposal_action', { proposal_id: id, action: 'APPROVE' }); }
      catch (e) { toast(`❌ ${id}: ${e.message}`, 'err'); }
    }
    toast(`✅ Approved ${pendingIds.length} proposals`);
    await fetchAndRender();
  });
}

function renderReviewQueue(queue) {
  const container = document.getElementById('review-queue-list');
  const f = state.queueFilter;

  let items = queue;
  if (f === 'PENDING')   items = queue.filter(p => p.status === 'PENDING');
  if (f === 'APPROVED')  items = queue.filter(p => p.status === 'APPROVED');
  if (f === 'REJECTED')  items = queue.filter(p => p.status === 'REJECTED');
  if (f === 'Foundational_Integrity') items = queue.filter(p => p.pillar === 'Foundational_Integrity');
  if (f === 'Operational_Muscles')    items = queue.filter(p => p.pillar === 'Operational_Muscles');
  if (f === 'Value_Generation')       items = queue.filter(p => p.pillar === 'Value_Generation');

  if (!items.length) {
    container.innerHTML = '<div class="empty"><span>📋</span>No proposals match this filter</div>';
    return;
  }

  container.innerHTML = items.map(p => {
    const statusCls = (p.status || 'PENDING').toLowerCase();
    const impactCls = `impact-${(p.impact || 'UNKNOWN').replace(/\s/g, '_')}`;
    return `
      <div class="proposal-card ${statusCls}" id="prop-${p.id}">
        <div class="prop-header">
          <div style="flex:1">
            <div class="prop-id">${escHtml(p.id || '—')}</div>
            <div class="prop-title">${escHtml(formatPropTitle(p.id))}</div>
          </div>
          <div class="prop-meta">
            ${badge(p.status || 'PENDING', proposalStatusColor(p.status))}
            ${badge(p.pillar || '—', 'purple')}
            <span class="${impactCls}" style="font-size:0.75rem;font-weight:700">${escHtml(p.impact || '—')}</span>
          </div>
        </div>
        <div class="prop-body">
          <div style="margin-bottom:6px">
            <span style="color:var(--text-3);font-size:0.72rem">Type: </span>
            <code style="font-size:0.72rem;color:var(--blue)">${escHtml(p.integration_type || '—')}</code>
            &nbsp;|&nbsp;
            <span style="color:var(--text-3);font-size:0.72rem">Aspect: </span>
            <code style="font-size:0.72rem;color:var(--blue)">${escHtml(p.primary_aspect || '—')}</code>
          </div>
          ${escHtml(p.summary || 'No summary provided.')}
          ${p.rejection_reason ? `<div style="margin-top:8px;color:var(--red);font-size:0.78rem">Rejection reason: ${escHtml(p.rejection_reason)}</div>` : ''}
        </div>
        <div class="prop-footer">
          <span style="font-size:0.72rem;color:var(--text-3);font-family:var(--mono)">${escHtml(p.created_at || '')}</span>
          <span class="spacer"></span>
          ${p.status === 'PENDING' ? `
            <button class="btn sm approve" onclick="proposalAction('${p.id}', 'APPROVE')">✅ Approve</button>
            <button class="btn sm reject"  onclick="proposalReject('${p.id}')">❌ Reject</button>
          ` : `<span style="font-size:0.75rem;color:var(--text-3)">${p.status}</span>`}
        </div>
      </div>
    `;
  }).join('');
}

async function proposalAction(id, action) {
  try {
    await apiPost('/api/proposal_action', { proposal_id: id, action });
    toast(`✅ ${id} → ${action}`);
    await fetchAndRender();
  } catch (e) {
    toast(`❌ ${e.message}`, 'err');
  }
}

async function proposalReject(id) {
  const reason = prompt(`Rejection reason for ${id} (optional):`);
  if (reason === null) return; // cancelled
  await proposalActionWithReason(id, 'REJECT', reason);
}

async function proposalActionWithReason(id, action, reason) {
  try {
    await apiPost('/api/proposal_action', { proposal_id: id, action, reason });
    toast(`🚫 ${id} rejected`);
    await fetchAndRender();
  } catch (e) {
    toast(`❌ ${e.message}`, 'err');
  }
}

// ── 5. Scaler Ledgers ────────────────────────────────────────
function setupScalerLedgerTabs() {
  document.getElementById('scaler-ledger-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.pill-tab');
    if (!tab) return;
    document.querySelectorAll('#scaler-ledger-tabs .pill-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.scalerLedger = tab.dataset.ledger;
    loadScalerLedger(state.scalerLedger);
  });
}

async function loadScalerLedger(key) {
  const content = document.getElementById('ledger-content');
  const title   = document.getElementById('ledger-title');
  const pathEl  = document.getElementById('ledger-path');
  content.textContent = 'Loading…';
  try {
    const data = await loadDB(key);
    title.textContent = DB_LABELS[key] || key;
    pathEl.textContent = data.path || '';
    content.textContent = jsToYaml(data.data);
  } catch (e) {
    content.textContent = `Error: ${e.message}`;
  }
}

// ── 6. Hustler Modes (editable) ──────────────────────────────
function renderHustlerModes(hustler) {
  const modes = hustler.modes || {};
  const WORK_OPTS = ['AUTO 🟢', 'COLLAB 🟢', 'STRICT 🔴'];
  const ONOFF = ['on', 'off'];
  const BOOL = ['true', 'false'];

  const rows = [
    { key: 'work_mode',       label: 'work_mode',       type: 'select', options: WORK_OPTS, file: 'hustler_os', path: 'metadata.modes.work_mode' },
    { key: 'pipeline_status', label: 'pipeline_status', type: 'select', options: ONOFF,     file: 'hustler_os', path: 'metadata.modes.pipeline_status' },
    { key: 'audit_request',   label: 'audit_request',   type: 'select', options: BOOL,      file: 'hustler_os', path: 'metadata.modes.audit_request' },
  ];
  document.getElementById('hustler-modes-table').innerHTML = buildCtrlRows(rows, modes, 'hustler-mode');

  // Stats
  const st = hustler.state || {};
  const gw = st.gateway || {};
  el('hm-gateway', gw.status || '—');
  el('hm-throughput', st.metrics?.throughput || '—');
  el('hm-audit', String(st.audit_in_progress ?? 'false'));
  const gapQ = hustler.queues?.product_gaps_queue || [];
  el('hm-gaps', gapQ.length);

  // Gaps table
  const tbody = document.getElementById('hustler-gaps-body');
  if (gapQ.length) {
    tbody.innerHTML = gapQ.map(g => `
      <tr>
        <td style="font-family:var(--mono);color:var(--blue)">${escHtml(g.gap_id || '—')}</td>
        <td>${escHtml(g.description || '—')}</td>
        <td>${escHtml(g.discovered_by || '—')}</td>
        <td>${badge(g.status || '—', g.status === 'open' ? 'orange' : 'muted')}</td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">No open gaps</td></tr>';
  }

  // Audit policy
  const policy = hustler.audit_policy || {};
  const auditRows = [
    { key: 'trigger_on_goal_complete', label: 'trigger_on_goal_complete', type: 'text', file: 'hustler_os', path: 'metadata.audit_policy.trigger_on_goal_complete' },
    { key: 'audit_check_timeout',      label: 'audit_check_timeout',      type: 'text', file: 'hustler_os', path: 'metadata.audit_policy.audit_check_timeout' },
  ];
  document.getElementById('hustler-audit-table').innerHTML = buildCtrlRows(auditRows, policy, 'h-audit');
}

// ── 7. Hustler Ledgers ───────────────────────────────────────
function setupHustlerLedgerTabs() {
  document.getElementById('hustler-ledger-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.pill-tab');
    if (!tab) return;
    document.querySelectorAll('#hustler-ledger-tabs .pill-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.hustlerLedger = tab.dataset.ledger;
    loadHustlerLedger(state.hustlerLedger);
  });
}

async function loadHustlerLedger(key) {
  const content = document.getElementById('hustler-ledger-content');
  const title   = document.getElementById('hustler-ledger-title');
  const pathEl  = document.getElementById('hustler-ledger-path');
  content.textContent = 'Loading…';
  try {
    const data = await loadDB(key);
    title.textContent = DB_LABELS[key] || key;
    pathEl.textContent = data.path || '';
    content.textContent = jsToYaml(data.data);
  } catch (e) {
    content.textContent = `Error: ${e.message}`;
  }
}

// ── 8. Projects ──────────────────────────────────────────────
function renderProjects(projects) {
  const modes = projects.modes || {};
  const ONOFF = ['on', 'off'];
  const rows = [
    { key: 'project_status', label: 'project_status', type: 'select', options: ONOFF, file: 'projects_os', path: 'metadata.modes.project_status' },
    { key: 'autosync_status',label: 'autosync_status',type: 'select', options: ONOFF, file: 'projects_os', path: 'metadata.modes.autosync_status' },
  ];
  document.getElementById('projects-modes-table').innerHTML = buildCtrlRows(rows, modes, 'prj-mode');

  const pList = document.getElementById('projects-list');
  const pData = projects.projects || {};
  const keys = Object.keys(pData);
  if (keys.length) {
    pList.innerHTML = `<div class="grid-auto">${keys.map(k => {
      const p = pData[k];
      return `<div class="tb-mini-card">
        <div class="tb-mini-name">${escHtml(p.name || k)}</div>
        <div style="margin-bottom:8px">${badge(p.status || 'unknown', 'muted')}</div>
        <div style="font-size:0.78rem;color:var(--text-3)">${escHtml(p.description || '')}</div>
      </div>`;
    }).join('')}</div>`;
  } else {
    pList.innerHTML = '<div class="empty"><span>📦</span>No projects registered</div>';
  }
}

// ── 9. Toolboxes ─────────────────────────────────────────────
function renderToolboxes(toolboxes, meta) {
  const tb = meta.toolbox_readiness || {};
  el('tb-total',   tb.total   ?? '—');
  el('tb-func',    tb.functional ?? '—');
  el('tb-partial', tb.partial ?? '—');
  el('tb-empty',   tb.empty   ?? '—');

  const DOMAINS = [
    { key: 'core_toolboxes',        icon: '⚙️',  label: 'Core Toolboxes' },
    { key: 'engineering_toolboxes', icon: '🏗️', label: 'Engineering Toolboxes' },
    { key: 'business_toolboxes',    icon: '💼',  label: 'Business Toolboxes' },
    { key: 'studio_toolboxes',      icon: '🎨',  label: 'Studio Toolboxes' },
    { key: 'life_toolboxes',        icon: '🌱',  label: 'Life Toolboxes' },
  ];

  const sections = document.getElementById('tb-sections');
  sections.innerHTML = DOMAINS.map(d => {
    const cat = toolboxes[d.key] || {};
    const keys = Object.keys(cat);
    const cards = keys.map(k => {
      const t = cat[k];
      const ag = t.agent_count || 0;
      const sk = t.skill_count || 0;
      const statusBadge = ag + sk > 0
        ? (ag > 0 && sk > 0 ? '<span class="badge green" style="font-size:0.65rem">Functional</span>' : '<span class="badge orange" style="font-size:0.65rem">Partial</span>')
        : '<span class="badge muted" style="font-size:0.65rem">Empty</span>';
      return `<div class="tb-mini-card">
        <div class="tb-mini-name">${k.replace(/_/g, ' ')}</div>
        <div style="margin-bottom:8px">${statusBadge}</div>
        <div class="tb-mini-counts">Agents: <strong>${ag}</strong> · Skills: <strong>${sk}</strong></div>
      </div>`;
    }).join('') || '<div class="empty" style="padding:20px">No toolboxes</div>';

    return `<div class="mt-6">
      <div class="section-title">${d.icon} ${d.label}</div>
      <div class="tb-grid">${cards}</div>
    </div>`;
  }).join('');
}

// ── 10. Raw DB Viewer ────────────────────────────────────────
function setupRawDbTabs() {
  const tabsEl = document.getElementById('raw-db-tabs');
  const KEYS = Object.keys(DB_LABELS);
  tabsEl.innerHTML = KEYS.map((k, i) => `
    <button class="pill-tab ${i === 0 ? 'active' : ''}" data-rawdb="${k}">${DB_LABELS[k] || k}</button>
  `).join('');

  state.rawDbKey = KEYS[0];

  tabsEl.addEventListener('click', e => {
    const tab = e.target.closest('.pill-tab');
    if (!tab) return;
    document.querySelectorAll('#raw-db-tabs .pill-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.rawDbKey = tab.dataset.rawdb;
    loadRawDb(state.rawDbKey);
  });
}

async function loadRawDb(key) {
  const content = document.getElementById('raw-db-content');
  const title   = document.getElementById('raw-db-title');
  const pathEl  = document.getElementById('raw-db-path');
  content.textContent = 'Loading…';
  const treeContainer = document.getElementById('tree-db-content');
  if (treeContainer) treeContainer.innerHTML = '<div class="empty"><span>⏳</span>Loading Editor…</div>';
  
  try {
    const data = await loadDB(key);
    title.textContent = DB_LABELS[key] || key;
    pathEl.textContent = data.path || '';
    content.textContent = jsToYaml(data.data);
    if (typeof renderEditableTree === 'function') {
      renderEditableTree(data.data, key, 'tree-db-content');
    }
  } catch (e) {
    content.textContent = `Error: ${e.message}`;
    if (treeContainer) treeContainer.textContent = `Error: ${e.message}`;
  }
}

// ── Control Row Builder ──────────────────────────────────────
/**
 * Builds <tr> rows for a ctrl-table.
 * rows: Array<{ key, label, type: 'select'|'text'|'toggle', options?, file, path }>
 * values: object of current values
 * idPrefix: for uniqueness
 */
function buildCtrlRows(rows, values, idPrefix) {
  return rows.map(row => {
    const currVal = String(values[row.key] ?? '');
    const uid = `${idPrefix}-${row.key}`;

    let control = '';
    if (row.type === 'select' && row.options) {
      const opts = row.options.map(o => `<option value="${escHtml(o)}" ${currVal === o ? 'selected' : ''}>${escHtml(o)}</option>`).join('');
      control = `<select class="field-select" id="${uid}" onchange="commitField('${uid}','${row.file}','${row.path}',this.value)">${opts}</select>`;
    } else {
      control = `<input class="field-input" id="${uid}" value="${escHtml(currVal)}" onblur="commitField('${uid}','${row.file}','${row.path}',this.value)" onkeydown="if(event.key==='Enter')commitField('${uid}','${row.file}','${row.path}',this.value)">`;
    }

    return `<tr>
      <td class="ctrl-key"><span class="key-tag">${escHtml(row.label)}</span></td>
      <td class="ctrl-value">${control}</td>
      <td class="ctrl-action">
        <span id="${uid}-status" style="font-size:0.7rem;color:var(--text-3)"></span>
      </td>
    </tr>`;
  }).join('');
}

async function commitField(uid, file, keyPath, value) {
  const statusEl = document.getElementById(`${uid}-status`);
  if (statusEl) statusEl.innerHTML = '<span class="spinner"></span>';
  try {
    await apiPost('/api/update_db', { file, key_path: keyPath, value });
    if (statusEl) { statusEl.textContent = '✅'; setTimeout(() => { if(statusEl) statusEl.textContent = ''; }, 2000); }
    // Re-fetch to keep state fresh
    await fetchAndRender();
  } catch (e) {
    if (statusEl) statusEl.textContent = '❌';
    toast(`❌ ${e.message}`, 'err');
  }
}

// ── Utilities ────────────────────────────────────────────────
function el(id, htmlOrText) {
  const node = document.getElementById(id);
  if (!node) return;
  // If it contains html tags, use innerHTML, else textContent
  if (typeof htmlOrText === 'string' && htmlOrText.includes('<')) {
    node.innerHTML = htmlOrText;
  } else {
    node.textContent = String(htmlOrText);
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function badge(text, color) {
  return `<span class="badge ${color}">${escHtml(String(text))}</span>`;
}

function modeTag(val) {
  if (!val) return '—';
  const cls = val.includes('AUTO') ? 'mode-AUTO' : val.includes('STRICT') ? 'mode-STRICT' : val.includes('COLLAB') ? 'mode-COLLAB' : '';
  return `<span class="mode-tag ${cls}">${escHtml(String(val))}</span>`;
}

function proposalStatusColor(status) {
  if (status === 'APPROVED') return 'green';
  if (status === 'REJECTED') return 'red';
  return 'orange';
}

function statusColor(status) {
  if (!status) return 'muted';
  const s = status.toLowerCase();
  if (s === 'active')    return 'green';
  if (s === 'pending')   return 'orange';
  if (s === 'done')      return 'blue';
  if (s === 'archived' || s === 'paused') return 'muted';
  return 'muted';
}

function goalIcon(status) {
  if (!status) return '⬜';
  const s = status.toLowerCase();
  if (s === 'done')    return '✅';
  if (s === 'active')  return '🔵';
  if (s === 'pending') return '⏳';
  if (s === 'archived')return '📦';
  return '⬜';
}

function formatPropTitle(id) {
  if (!id) return '—';
  return id.replace(/^PROP-EXT-/, '').replace(/-/g, ' ');
}

/**
 * Minimal JS→YAML serialiser (best-effort for display).
 * Good enough for read-only viewer, not for writing back.
 */
function jsToYaml(obj, indent = 0) {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj === 'boolean') return String(obj);
  if (typeof obj === 'number') return String(obj);
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(': ') || obj.startsWith('>') || obj.startsWith('|'))
      return `|\n${obj.split('\n').map(l => ' '.repeat(indent + 2) + l).join('\n')}`;
    if (/[:#{}[\],&*?|<>=!%@`]/.test(obj) || obj === '') return `"${obj.replace(/"/g, '\\"')}"`;
    return obj;
  }
  const pad = '  '.repeat(indent);
  if (Array.isArray(obj)) {
    if (!obj.length) return '[]';
    return obj.map(item => `\n${pad}- ${jsToYaml(item, indent + 1).replace(/^\n/, '')}`).join('');
  }
  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (!keys.length) return '{}';
    return keys.map(k => {
      const val = obj[k];
      const valStr = jsToYaml(val, indent + 1);
      if (typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length > 0) {
        return `\n${pad}${k}:${valStr}`;
      }
      if (Array.isArray(val) && val.length > 0) {
        return `\n${pad}${k}:${valStr}`;
      }
      return `\n${pad}${k}: ${valStr}`;
    }).join('');
  }
  return String(obj);
}

// Expose for inline event handlers
window.commitField = commitField;
window.proposalAction = proposalAction;
window.proposalReject = proposalReject;
window.proposalActionWithReason = proposalActionWithReason;

// -- Tree Editor ----------------------------------------------
let currentDbMode = "tree";

document.getElementById("btn-db-mode")?.addEventListener("click", () => {
  currentDbMode = currentDbMode === "tree" ? "raw" : "tree";
  document.getElementById("raw-db-content").style.display = currentDbMode === "raw" ? "block" : "none";
  document.getElementById("tree-db-content").style.display = currentDbMode === "tree" ? "block" : "none";
});

function renderEditableTree(data, fileKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  container.appendChild(createTreeNode(data, "", fileKey, true));
}

function createTreeNode(value, path, fileKey, isRoot = false) {
  const node = document.createElement("div");
  node.className = "tree-node" + (isRoot ? " root-node" : "");

  if (value === null || typeof value !== "object") {
    // Leaf node: input or toggle
    const row = document.createElement("div");
    row.className = "tree-row";
    
    const keyParts = path.split(".");
    const keyName = keyParts[keyParts.length - 1];

    const keySpan = document.createElement("div");
    keySpan.className = "tree-key";
    keySpan.textContent = keyName;
    row.appendChild(keySpan);

    const valDiv = document.createElement("div");
    valDiv.className = "tree-value";

    if (typeof value === "boolean") {
      const label = document.createElement("label");
      label.className = "tree-toggle";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = value;
      input.addEventListener("change", () => commitTreeField(fileKey, path, input.checked, statusSpan));
      const slider = document.createElement("span");
      slider.className = "slider";
      label.appendChild(input);
      label.appendChild(slider);
      valDiv.appendChild(label);
    } else {
      const input = document.createElement("input");
      input.className = "tree-input";
      input.type = typeof value === "number" ? "number" : "text";
      input.value = value === null ? "" : value;
      input.addEventListener("blur", () => commitTreeField(fileKey, path, input.type === "number" ? Number(input.value) : input.value, statusSpan));
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          input.blur();
        }
      });
      valDiv.appendChild(input);
    }
    
    row.appendChild(valDiv);

    const statusSpan = document.createElement("div");
    statusSpan.className = "tree-status";
    row.appendChild(statusSpan);

    node.appendChild(row);
  } else {
    // Object or Array
    const keys = Object.keys(value);
    const keyParts = path.split(".");
    const keyName = path === "" ? "ROOT" : keyParts[keyParts.length - 1];
    
    const header = document.createElement("div");
    header.className = "collapsible-header";
    header.innerHTML = `<span class="collapsible-icon">?</span> ${keyName} <span style="color:var(--text-3);font-size:0.7rem;margin-left:8px;font-weight:normal;">${Array.isArray(value) ? `[${keys.length}]` : `{${keys.length}}`}</span>`;
    header.addEventListener("click", () => {
      node.classList.toggle("collapsed");
    });
    if(!isRoot) {
      node.appendChild(header);
    }

    const childrenDiv = document.createElement("div");
    childrenDiv.className = "tree-children";
    
    keys.forEach(k => {
      const childPath = path === "" ? k : `${path}.${k}`;
      childrenDiv.appendChild(createTreeNode(value[k], childPath, fileKey, false));
    });

    node.appendChild(childrenDiv);
  }

  return node;
}

async function commitTreeField(file, keyPath, value, statusEl) {
  statusEl.innerHTML = "<span class=\"spinner\"></span>";
  try {
    await apiPost("/api/update_db", { file, key_path: keyPath, value });
    statusEl.textContent = "?";
    setTimeout(() => { statusEl.textContent = ""; }, 2000);
    // Silent background fetch to keep cache synced without rebuilding the whole tree and losing focus
    api(`/api/state`).then(d => {
      state.ctrl = d.controller || {};
    }).catch(e => console.error("Silent state fetch failed", e));
  } catch (e) {
    statusEl.textContent = "?";
    toast(`? ${e.message}`, "err");
  }
}

