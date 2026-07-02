const state = {
  rootIndex: null,
  entities: {},
  activeEntity: 'system'
};

async function fetchYaml(url) {
  const res = await fetch(url + '?t=' + Date.now());
  if (!res.ok) throw new Error('Failed to fetch ' + url);
  const text = await res.text();
  return jsyaml.load(text);
}

async function loadData() {
  try {
    state.rootIndex = await fetchYaml('/index.yaml');
    
    // Build sidebar
    const navMenu = document.getElementById('nav-menu');
    navMenu.innerHTML = '';
    
    // System
    navMenu.innerHTML += `<div class="nav-group-label">System</div>`;
    navMenu.innerHTML += `<button class="nav-item ${state.activeEntity === 'system' ? 'active' : ''}" data-entity="system">
      <span class="ni-icon">⚙️</span> System Core
    </button>`;
    
    // Load System Board
    try { state.entities['system'] = await fetchYaml('/_system/system-board.yaml'); } catch(e){}

    // Projects
    navMenu.innerHTML += `<div class="nav-group-label" style="margin-top:16px;">Projects</div>`;
    const projects = state.rootIndex.projects || {};
    for (const [pname, pdata] of Object.entries(projects)) {
      navMenu.innerHTML += `<button class="nav-item ${state.activeEntity === pname ? 'active' : ''}" data-entity="${pname}">
        <span class="ni-icon">📁</span> ${pname}
      </button>`;
      
      try {
        state.entities[pname] = await fetchYaml(`/${pdata.board}`);
      } catch (e) {
        console.error('Error loading board for ' + pname, e);
      }
    }

    // Attach listeners
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeEntity = btn.dataset.entity;
        renderEntity();
      });
    });

    document.getElementById('sync-dot').classList.remove('error');
    document.getElementById('sync-dot').classList.add('fresh');

    renderEntity();
  } catch (err) {
    console.error(err);
    document.getElementById('sync-dot').classList.add('error');
    document.getElementById('sync-dot').classList.remove('fresh');
  }
}

function renderEntity() {
  const entity = state.activeEntity;
  const board = state.entities[entity];
  if (!board) return;

  document.getElementById('view-title').textContent = board.metadata.name + ' — Board Control';
  
  // 1. Metrics Grid
  const metrics = board.metrics || {};
  const tbm = metrics.toolboxes || {};
  document.getElementById('metrics-grid').innerHTML = `
    <div class="metric-card"><h4>Active Missions</h4><div class="val">${metrics.missions?.active || 0}</div></div>
    <div class="metric-card"><h4>Active Toolboxes</h4><div class="val">${tbm.active || 0}</div></div>
    <div class="metric-card"><h4>OS Prompts</h4><div class="val">${metrics.os_prompts || 0}</div></div>
  `;

  // 2. Missions & Hub Queues
  let mHTML = '<h4 style="color:var(--purple); margin-bottom: 8px;">Missions</h4>';
  const missions = board.missions || {};
  let hasMissions = false;
  for (const [mname, mdata] of Object.entries(missions)) {
    hasMissions = true;
    mHTML += `<div class="mission-item"><strong>${mname}</strong>: ${mdata.mission_control?.status || 'unknown'}</div>`;
  }
  if (!hasMissions) mHTML += '<div class="mission-item" style="color:var(--text-3)">No active missions.</div>';

  const live_state = board.live_state || {};
  const live_hub = board.live_hub || {};
  mHTML += '<h4 style="color:var(--blue); margin-top: 16px; margin-bottom: 8px;">Queues</h4>';
  mHTML += `<div class="mission-item"><strong>Fill Queue:</strong> ${Object.keys(live_state.fill_queue || {}).length} items</div>`;
  mHTML += `<div class="mission-item"><strong>Review Queue:</strong> ${Object.keys(live_hub.review_queue || {}).length} items</div>`;
  document.getElementById('missions-list').innerHTML = mHTML;

  // 3. Pipelines & Profiles
  let pHTML = '';
  const pipelines = board.pipelines || {};
  const sharedPipelines = pipelines.shared_pipelines || {};
  for (const [pname, pdata] of Object.entries(sharedPipelines)) {
    pHTML += `<div class="event-item" style="border-left: 3px solid var(--orange);">
                <strong>${pname.toUpperCase()}</strong> (${pdata.status})
              </div>`;
    const profiles = pdata.pipeline_profiles || {};
    for (const [profName, profData] of Object.entries(profiles)) {
      pHTML += `<div class="event-item" style="padding-left: 24px;">
                  <span>↳ Profile: <strong>${profName}</strong></span>
                </div>`;
    }
  }
  if (!pHTML) pHTML = '<p style="color:var(--text-3)">No shared pipelines active.</p>';
  document.getElementById('pipelines-list').innerHTML = pHTML;

  // 4. Toolboxes (Domain -> Hierarchy)
  let tHTML = '';
  const toolboxes = board.toolboxes || {};
  const sharedToolboxes = toolboxes.shared_toolboxes || {};
  for (const [domain, ddata] of Object.entries(sharedToolboxes)) {
    if (ddata.status !== 'on') continue;
    tHTML += `<div class="event-item" style="border-left: 3px solid var(--green);">
                <strong>${domain.toUpperCase()}</strong> (Active)
              </div>`;
    for (const [tboxName, tboxData] of Object.entries(ddata)) {
      if (['status', 'maturity', 'total_toolboxes', 'active_toolboxes'].includes(tboxName)) continue;
      tHTML += `<div class="event-item" style="padding-left: 24px;">
                  <span>↳ ${tboxName}: <strong>${tboxData.status || 'on'}</strong></span>
                </div>`;
    }
  }
  if (!tHTML) tHTML = '<p style="color:var(--text-3)">No active toolboxes.</p>';
  document.getElementById('toolboxes-list').innerHTML = tHTML;

  // 5. Events
  const events = board.live_state?.recent_events || [];
  let eHTML = '';
  events.slice().reverse().forEach(ev => {
    eHTML += `<div class="event-item"><div class="time">${ev.at || ''}</div><div>${ev.event}</div></div>`;
  });
  if (!eHTML) eHTML = '<p style="color:var(--text-3)">No recent events.</p>';
  document.getElementById('events-log').innerHTML = eHTML;

  // 6. Raw Board
  document.getElementById('raw-board').textContent = jsyaml.dump(board);
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setInterval(loadData, 5000);
});
