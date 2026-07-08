// Agentic OS dashboard client.
// htmx handles SSE + swaps declaratively (see index.html). Alpine owns UI state
// (windows, popups, filters). Cytoscape renders the two left-section maps.
// Panels pull their data from the daemon's /api/yaml + /api/md endpoints.

function os() {
  return {
    currentWindow: 'os',
    projects: [],
    switchOpen: false,
    toolboxOpen: false,
    chatMin: true,
    missionWin: null,
    filter: { planning: '', execution: '' },
    sort: { planning: 'priority', execution: 'priority' },
    kpi: { missions: 0, active: 0, toolboxes: 0, toolboxesActive: 0 },
    sync: 'fresh',
    boardText: '',
    runtimeText: '',
    toolboxText: '',
    missions: [],
    _drag: null,
    floaterStyle: '',

    prefix() { return this.currentWindow === 'os' ? 'os' : this.currentWindow; },
    base() { return this.currentWindow === 'os' ? '_os' : this.currentWindow; },

    async init() {
      await this.loadProjects();
      await this.reload();
    },

    async loadProjects() {
      const idx = await this.getYaml('index.yaml');
      this.projects = idx && idx.projects ? Object.keys(idx.projects).filter(k => k !== '...') : [];
    },

    async getYaml(path) {
      try { const r = await fetch('/api/yaml?path=' + encodeURIComponent(path)); return await r.json(); }
      catch (e) { return {}; }
    },
    async getMd(path) {
      try { const r = await fetch('/api/md?path=' + encodeURIComponent(path)); return await r.text(); }
      catch (e) { return ''; }
    },

    async reload() {
      const b = this.base(), p = this.prefix();
      const runtime = await this.getYaml(`${b}/${p}-runtime.yaml`);
      const missions = await this.getYaml(`${b}/${p}-missions.yaml`);
      const toolboxes = await this.getYaml(`${b}/${p}-toolboxes.yaml`);
      this.boardText = await this.getMd(`${b}/${p}-board.md`);
      this.runtimeText = JSON.stringify(runtime, null, 2);
      this.toolboxText = JSON.stringify(toolboxes, null, 2);
      this.sync = (runtime.freshness && runtime.freshness.sync_status) || 'fresh';
      this.missions = this.flattenMissions(missions);
      this.kpi.missions = this.missions.length;
      this.kpi.active = this.missions.filter(m => m.class === 'EXECUTION').length;
      const tbm = (toolboxes.metrics) || {};
      this.kpi.toolboxes = tbm.total || 0;
      this.kpi.toolboxesActive = (tbm.active && tbm.active.total) || 0;
      this.drawMaps(runtime, await this.getYaml(`${b}/${p}-inbox.yaml`));
    },

    flattenMissions(doc) {
      const out = [];
      const push = (name, kind, raw) => {
        if (!name || name === '...' || typeof raw !== 'object') return;
        const st = raw.state || {};
        out.push({
          name, kind, raw,
          class: st.class || 'PLANNING',
          priority: raw.priority || 'MEDIUM',
          progress: this.pct(raw),
        });
      };
      for (const [n, r] of Object.entries(doc.standard || {})) push(n, 'standard', r);
      for (const [n, r] of Object.entries(doc.research || {})) push(n, 'research', r);
      const evo = doc.evolution || {};
      for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX'])
        for (const [n, r] of Object.entries(evo[mode] || {})) push(n, 'evolution:' + mode, r);
      return out;
    },
    pct(raw) {
      const m = raw.metrics || {};
      const v = m.progress_percentage || m.round_progress_percentage || '0';
      const n = parseInt(String(v).replace('%', '')) || 0;
      return Math.max(0, Math.min(100, n));
    },

    view(cls) {
      const key = cls === 'PLANNING' ? 'planning' : 'execution';
      const f = (this.filter[key] || '').toLowerCase();
      let list = this.missions.filter(m => m.class === cls &&
        (!f || m.name.toLowerCase().includes(f) || m.kind.toLowerCase().includes(f)));
      const s = this.sort[key];
      const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      list.sort((a, b) => {
        if (s === 'name') return a.name.localeCompare(b.name);
        if (s === 'progress') return b.progress - a.progress;
        return (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
      });
      return list;
    },

    openMission(m) {
      this.missionWin = m;
      this.floaterStyle = 'top:120px;left:35%';
    },
    startDrag(e) {
      const el = e.currentTarget.parentElement;
      const ox = e.clientX - el.offsetLeft, oy = e.clientY - el.offsetTop;
      const move = ev => { this.floaterStyle = `top:${ev.clientY - oy}px;left:${ev.clientX - ox}px`; };
      const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
      window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
    },

    async switchWindow(w) {
      this.currentWindow = w; this.switchOpen = false;
      await this.reload();
    },

    async saveBoard() {
      const b = this.base(), p = this.prefix();
      await fetch('/api/md', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: `${b}/${p}-board.md`, text: this.boardText }) });
    },

    // ---- Cytoscape maps ----
    drawMaps(runtime, inbox) {
      this.renderGraph('map-data', this.dataElements(runtime));
      this.renderGraph('map-inbox', this.inboxElements(inbox));
    },
    dataElements(runtime) {
      const els = [{ data: { id: 'root', label: this.currentWindow } }];
      const fq = (runtime && runtime.fill_queue) || {};
      for (const cat of Object.keys(fq)) {
        els.push({ data: { id: 'c_' + cat, label: cat } });
        els.push({ data: { source: 'root', target: 'c_' + cat } });
        (fq[cat] || []).forEach((item, i) => {
          const id = 'i_' + cat + '_' + i;
          els.push({ data: { id, label: String(item).split(':').pop() } });
          els.push({ data: { source: 'c_' + cat, target: id } });
        });
      }
      return els;
    },
    inboxElements(inbox) {
      const els = [{ data: { id: 'inbox', label: 'inbox' } }];
      const gw = (inbox && inbox.gateway) || {};
      for (const pillar of Object.keys(gw)) {
        if (pillar === '...') continue;
        els.push({ data: { id: 'p_' + pillar, label: pillar } });
        els.push({ data: { source: 'inbox', target: 'p_' + pillar } });
        for (const item of Object.keys(gw[pillar] || {})) {
          const id = 'gi_' + pillar + '_' + item;
          els.push({ data: { id, label: item } });
          els.push({ data: { source: 'p_' + pillar, target: id } });
        }
      }
      return els;
    },
    renderGraph(elId, elements) {
      const el = document.getElementById(elId);
      if (!el || !window.cytoscape) return;
      cytoscape({
        container: el, elements,
        style: [
          { selector: 'node', style: { 'background-color': '#8b5cf6', label: 'data(label)',
            color: '#ededed', 'font-size': 9, 'text-valign': 'center', 'text-halign': 'right',
            'text-margin-x': 4, width: 14, height: 14 } },
          { selector: 'edge', style: { width: 1, 'line-color': 'rgba(255,255,255,.15)',
            'curve-style': 'bezier' } },
        ],
        layout: { name: 'cose', animate: false, padding: 20 },
      });
    },
  };
}
window.os = os;
document.addEventListener('alpine:init', () => { /* Alpine picks up x-data="os()" */ });
