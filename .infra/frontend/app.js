// PlugBoot dashboard — htmx + Alpine + Cytoscape + SSE.
function os() {
  return {
    entity: 'os', projects: [], board: '', runtimeYaml: '', toolboxesYaml: '', toolboxesData: {},
    missions: [], kpi: { missions: 0, toolboxes: 0, pillars: 0 },
    filter: { planning: '', execution: '' }, sort: { planning: 'priority', execution: 'priority' },
    activeMission: null, toolboxesOpen: false, chatMin: true,
    win: { x: 200, y: 140, dx: 0, dy: 0 },

    init() {
      this.loadConfig();
      this.switchEntity();
      const log = document.getElementById('chat-log');
      if (log) new MutationObserver(() => { this.chatMin = false; }).observe(log, { childList: true });
    },
    async loadConfig() {
      try {
        const c = await (await fetch('/api/config')).json();
        this.projects = Object.keys(c).filter(k => c[k] && typeof c[k] === 'object' && 'status' in c[k]);
      } catch (e) { console.error(e); }
    },
    async switchEntity() {
      try {
        const d = await (await fetch(`/api/entity/${this.entity}`)).json();
        this.board = d.board || '';
        this.runtimeYaml = JSON.stringify(d.runtime || {}, null, 2);
        this.toolboxesYaml = JSON.stringify(d.toolboxes || {}, null, 2);
        this.toolboxesData = d.toolboxes || {};
        this.missions = this.flatten(d.missions || {});
        const rt = d.runtime || {};
        this.kpi.missions = this.missions.length;
        this.kpi.pillars = ((rt.pillars && rt.pillars.actives) || []).length;
        this.kpi.toolboxes = (d.toolboxes && d.toolboxes.metrics && d.toolboxes.metrics.active && d.toolboxes.metrics.active.total) || 0;
        this.drawMaps(d);
      } catch (e) { console.error(e); }
    },
    flatten(missions) {
      const out = [];
      const push = (obj, model) => Object.entries(obj || {}).forEach(([name, m]) => {
        if (!m || typeof m !== 'object') return;
        out.push({ name, model, objective: m.objective || m.subjects || '', priority: m.priority || 'MEDIUM',
          klass: (m.state && m.state.class) || 'PLANNING', progress: (m.state && m.state.progress) || 'pending', raw: m });
      });
      push(missions.standard, 'standard');
      push(missions.research, 'research');
      ['FAST','DEEP','RESEARCH','INBOX'].forEach(t => push(missions.evolution && missions.evolution[t], 'evolution:' + t));
      return out;
    },
    view(klass) {
      const f = (klass === 'PLANNING' ? this.filter.planning : this.filter.execution).toLowerCase();
      let list = this.missions.filter(m => m.klass === klass);
      if (f) list = list.filter(m => m.name.toLowerCase().includes(f) || (m.objective || '').toLowerCase().includes(f));
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const s = klass === 'PLANNING' ? this.sort.planning : this.sort.execution;
      if (s === 'priority') list.sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
      return list;
    },
    openMission(m) { this.activeMission = m.raw ? Object.assign({}, m.raw, { name: m.name }) : m; },
    startDrag(e) {
      this.win.dx = e.clientX - this.win.x; this.win.dy = e.clientY - this.win.y;
      const move = ev => { this.win.x = ev.clientX - this.win.dx; this.win.y = ev.clientY - this.win.dy; };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },
    async saveBoard() {
      try {
        const res = await fetch(`/api/entity/${this.entity}/board`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: this.board }),
        });
        const r = await res.json();
        console.log('[board] saved:', r.ok);
      } catch (e) { console.error('[board] save failed:', e); }
    },
    async toggleToolbox(keyPath, status) {
      try {
        await fetch(`/api/entity/${this.entity}/toolboxes`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: keyPath, status }),
        });
        this.switchEntity();
      } catch (e) { console.error('[toolbox] toggle failed:', e); }
    },
    drawMaps(d) {
      this.mapFromTree('map-data', this.promptDataNodes(d));
      this.mapFromTree('map-inbox', this.inboxNodes(d.inbox || {}));
    },
    promptDataNodes(d) {
      const els = [{ data: { id: 'root', label: this.entity } }];
      const rt = d.runtime || {};
      ((rt.pillars && rt.pillars.actives) || []).forEach((p, i) => {
        els.push({ data: { id: 'p' + i, label: p } });
        els.push({ data: { source: 'root', target: 'p' + i } });
      });
      return els;
    },
    inboxNodes(inbox) {
      const els = [{ data: { id: 'inbox', label: 'inbox' } }];
      const gw = inbox.gateway || {};
      Object.keys(gw).forEach((pillar, i) => {
        const pid = 'gw' + i;
        els.push({ data: { id: pid, label: pillar } });
        els.push({ data: { source: 'inbox', target: pid } });
        Object.keys(gw[pillar] || {}).forEach((grp, j) => {
          const gid = pid + 'g' + j;
          els.push({ data: { id: gid, label: grp } });
          els.push({ data: { source: pid, target: gid } });
        });
      });
      return els;
    },
    mapFromTree(elId, elements) {
      const container = document.getElementById(elId);
      if (!container || !window.cytoscape) return;
      cytoscape({
        container, elements,
        style: [
          { selector: 'node', style: { 'background-color': '#8b5cf6', 'label': 'data(label)', 'color': '#ededed', 'font-size': '9px', 'text-valign': 'center', 'text-halign': 'center', 'width': 14, 'height': 14 } },
          { selector: 'edge', style: { 'width': 1, 'line-color': 'rgba(255,255,255,.15)' } },
        ],
        layout: { name: 'cose', animate: false },
      });
    },
  };
}

document.body.addEventListener('htmx:sseMessage', (e) => {
  try {
    const msg = JSON.parse(e.detail.data);
    const log = document.getElementById('chat-log');
    if (!log) return;
    const b = document.createElement('div');
    b.className = 'chat-bubble ' + (msg.kind || 'info');
    b.textContent = msg.text;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  } catch (_) {}
});
