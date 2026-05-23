// Global App State
let appState = {
    controller: null
};

// DOM Elements
const viewTitle = document.getElementById('view-title');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const btnSync = document.getElementById('btn-sync');
const syncStatus = document.getElementById('sync-status');
const lastSyncTime = document.getElementById('last-sync-time');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupActions();
    fetchState();
    
    // Auto-refresh every 10 seconds
    setInterval(fetchState, 10000);
});

// Setup sidebar navigation
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active from all
            navItems.forEach(n => n.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            // Add active to clicked
            const btn = e.currentTarget;
            btn.classList.add('active');
            
            // Show target view
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // Update Title
            viewTitle.textContent = btn.textContent.trim();
        });
    });
}

function setupActions() {
    btnSync.addEventListener('click', async () => {
        const originalText = btnSync.innerHTML;
        btnSync.innerHTML = '<span class="icon">⏳</span> Syncing...';
        syncStatus.textContent = 'Syncing...';
        syncStatus.className = 'status-indicator';
        
        try {
            const res = await fetch('/api/sync', { method: 'POST' });
            if(res.ok) {
                await fetchState();
            }
        } catch(e) {
            console.error("Sync failed:", e);
        } finally {
            btnSync.innerHTML = originalText;
        }
    });
}

// Fetch Global State
async function fetchState() {
    try {
        const res = await fetch('/api/state');
        if(!res.ok) throw new Error("Failed to fetch state");
        const data = await res.json();
        
        appState.controller = data.controller || {};
        updateUI();
    } catch(err) {
        console.error("Error fetching state:", err);
        syncStatus.textContent = "Error";
        syncStatus.className = "status-indicator highlight danger";
    }
}

// Main Update Loop
function updateUI() {
    const ctrl = appState.controller;
    if(!ctrl || !ctrl.system_metadata) return;

    // 1. Sidebar Metadata
    const sysMeta = ctrl.system_metadata;
    const meta = ctrl.metadata || {};
    
    syncStatus.textContent = sysMeta.freshness?.status || "Unknown";
    syncStatus.className = `status-indicator ${sysMeta.freshness?.status === 'fresh' ? 'fresh' : ''}`;
    
    if (sysMeta.freshness?.last_synced) {
        const date = new Date(sysMeta.freshness.last_synced);
        lastSyncTime.textContent = `Last Sync: ${date.toLocaleTimeString()}`;
    }

    document.getElementById('meta-location').textContent = meta.location || "-";
    document.getElementById('meta-timezone').textContent = meta.timezone || "-";
    document.getElementById('meta-health').textContent = meta.system_health || "-";
    document.getElementById('meta-syncs').textContent = meta.sync_count || "0";

    // 2. Render Views
    renderCore(ctrl.core || {});
    renderScaler(ctrl.pipelines?.scaler || {});
    renderHustler(ctrl.pipelines?.hustler || {});
    renderProjects(ctrl.projects || {});
    renderToolboxes(ctrl.toolboxes || {});
}

// ==========================================
// 1. Core View
// ==========================================
function renderCore(core) {
    const modes = core.modes || {};
    
    document.getElementById('core-mode-work').textContent = modes.work_mode || "-";
    document.getElementById('core-mode-gate').textContent = modes.action_gate || "-";
    document.getElementById('core-mode-evo').textContent = modes.evolution_status || "-";
    document.getElementById('core-mode-sync').textContent = modes.autosync_status || "-";

    // Hub Events
    const eventsContainer = document.getElementById('core-hub-events');
    const events = core.system?.hub?.recent_events || [];
    if(events.length === 0) {
        eventsContainer.innerHTML = '<div class="empty-state">No recent events</div>';
    } else {
        eventsContainer.innerHTML = events.map(e => `<div class="log-item">${e}</div>`).join('');
    }

    // Milestones
    const milestonesContainer = document.getElementById('core-milestones');
    const milestones = core.milestones || {};
    const msKeys = Object.keys(milestones);
    
    if(msKeys.length === 0) {
        milestonesContainer.innerHTML = '<div class="empty-state">No active milestones</div>';
    } else {
        milestonesContainer.innerHTML = msKeys.map(k => {
            const m = milestones[k];
            return `
                <div class="log-item" style="border-left: 3px solid var(--accent-purple);">
                    <div style="font-weight: bold; margin-bottom: 4px; color: #fff;">${m.milestone || k}</div>
                    <div>${m.summary || ''}</div>
                </div>
            `;
        }).join('');
    }
}

// ==========================================
// 2. Scaler View
// ==========================================
function renderScaler(scaler) {
    const state = scaler.state || {};
    const metrics = state.metrics || {};
    const gateway = state.gateway_metrics || {};

    document.getElementById('scaler-phase').textContent = state.current_phase ?? "0";
    document.getElementById('scaler-audit').textContent = state.last_audit?.outcome || "-";
    document.getElementById('scaler-deferred').textContent = state.deferred_assets_count ?? "0";
    
    document.getElementById('scaler-approvals').textContent = gateway.pending_approvals_count ?? "0";
    
    document.getElementById('scaler-ops').textContent = metrics.scaling_ops ?? "0";
    document.getElementById('scaler-scaled').textContent = metrics.systems_scaled ?? "0";
    document.getElementById('scaler-proposals').textContent = metrics.proposals_generated ?? "0";
    document.getElementById('scaler-solutions').textContent = metrics.solutions_generated ?? "0";

    const findings = state.audit_findings || [];
    const findingsContainer = document.getElementById('scaler-findings');
    if(findings.length === 0) {
        findingsContainer.innerHTML = '<div class="empty-state">Substrate is clean.</div>';
    } else {
        findingsContainer.innerHTML = findings.map(f => `<div class="log-item" style="color: var(--accent-orange);">${f}</div>`).join('');
    }
}

// ==========================================
// 3. Hustler View
// ==========================================
function renderHustler(hustler) {
    const state = hustler.state || {};
    const metrics = state.metrics || {};
    const gateway = state.gateway || {};
    const queues = hustler.queues || {};
    const hub = hustler.hub || {};

    document.getElementById('hustler-gateway').textContent = gateway.status || "-";
    document.getElementById('hustler-pipelines').textContent = gateway.active_pipelines ?? "0";
    document.getElementById('hustler-throughput').textContent = metrics.throughput || "-";
    document.getElementById('hustler-audit-prog').textContent = state.audit_in_progress ? "True" : "False";

    const gaps = queues.product_gaps_queue || [];
    const gapsContainer = document.getElementById('hustler-gaps');
    if(gaps.length === 0) {
        gapsContainer.innerHTML = '<div class="empty-state">No open gaps.</div>';
    } else {
        gapsContainer.innerHTML = gaps.map(g => `
            <div class="log-item" style="border-left: 3px solid var(--accent-blue);">
                <div style="font-weight: bold; margin-bottom: 4px; color: #fff;">[${g.status.toUpperCase()}] ${g.gap_id}</div>
                <div>${g.description}</div>
                <div style="font-size: 0.75rem; color: var(--accent-green); margin-top: 4px;">Discovered by: ${g.discovered_by}</div>
            </div>
        `).join('');
    }

    const events = hub.recent_events || [];
    const eventsContainer = document.getElementById('hustler-events');
    if(events.length === 0) {
        eventsContainer.innerHTML = '<div class="empty-state">No recent events.</div>';
    } else {
        eventsContainer.innerHTML = events.map(e => `<div class="log-item">${e}</div>`).join('');
    }
}

// ==========================================
// 4. Projects View
// ==========================================
function renderProjects(projectsBlock) {
    const modes = projectsBlock.modes || {};
    const state = projectsBlock.state || {};
    const projects = projectsBlock.projects || {};

    document.getElementById('projects-mode').textContent = modes.project_status || "-";
    document.getElementById('projects-active').textContent = state.metrics?.active_projects ?? "0";

    const pKeys = Object.keys(projects);
    const pContainer = document.getElementById('projects-list');
    
    if(pKeys.length === 0) {
        pContainer.innerHTML = '<div class="empty-state">No projects registered.</div>';
    } else {
        pContainer.innerHTML = pKeys.map(k => {
            const p = projects[k];
            return `
                <div class="glass-card tb-card">
                    <h4>${p.name || k}</h4>
                    <span class="tb-status">${p.status || 'unknown'}</span>
                    <p>${p.description || 'No description provided.'}</p>
                </div>
            `;
        }).join('');
    }
}

// ==========================================
// 5. Toolboxes View
// ==========================================
function renderToolboxes(toolboxes) {
    const meta = appState.controller?.metadata?.toolbox_readiness || {};
    
    document.getElementById('tb-total').textContent = meta.total ?? "0";
    document.getElementById('tb-func').textContent = meta.functional ?? "0";
    document.getElementById('tb-partial').textContent = meta.partial ?? "0";
    document.getElementById('tb-empty').textContent = meta.empty ?? "0";

    const renderCat = (categoryObj, containerId) => {
        const container = document.getElementById(containerId);
        if(!categoryObj) {
            container.innerHTML = '<div class="empty-state">No toolboxes</div>';
            return;
        }
        
        const keys = Object.keys(categoryObj);
        if(keys.length === 0) {
            container.innerHTML = '<div class="empty-state">No toolboxes</div>';
            return;
        }

        container.innerHTML = keys.map(k => {
            const tb = categoryObj[k];
            const agents = tb.agent_count || 0;
            const skills = tb.skill_count || 0;
            
            return `
                <div class="tb-card">
                    <h4>${k.replace(/_/g, ' ')}</h4>
                    <span class="tb-status">${tb.status || 'unknown'}</span>
                    <p><strong>Agents:</strong> ${agents}</p>
                    <p><strong>Skills:</strong> ${skills}</p>
                </div>
            `;
        }).join('');
    };

    renderCat(toolboxes.core_toolboxes, 'tb-grid-core');
    renderCat(toolboxes.engineering_toolboxes, 'tb-grid-eng');
    renderCat(toolboxes.business_toolboxes, 'tb-grid-biz');
}
