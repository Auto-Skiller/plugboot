// Agentic OS dashboard client. htmx handles SSE chat; Alpine handles state,
// windows, project switching; Cytoscape renders the two left-side maps.
function osApp() {
  return {
    entities: ['os'],
    current: 'os',
    synced: true,
    board: '',
    runtimeText: '',
    toolboxText: '',
    toolboxOpen: false,
    toolboxMetrics: { active: 0, total: 0 },
    metrics: { total: 0, planning: 0, execution: 0 },
    missions: [],
    filterPlanning: '', sortPlanning: 'priority',
    filterExec: '', sortExec: 'priority',
    missionWin: { open: false, data: null, text: '', x: 300, y: 120, dx: 0, dy: 0 },
    _cyData: null, _cyInbox: null,

    async init() {
      const r = await fetch('/api/entities').then(x => x.json());
      this.entities = r.entities; this.current = r.current_window || 'os';
      await this.loadAll();
      // live refresh via SSE (switch + refresh events)
      const es = new EventSource('/sse');
      es.addEventListener('switch', e => { this.current = e.data; this.loadAll(); });
      es.addEventListener('refresh', () => this.loadAll());
      window.addEventListener('mousemove', e => this.dragMove(e));
      window.addEventListener('mouseup', () => this.missionWin.dragging = false);
    },

    async switchEntity() {
      await fetch('/api/switch', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity: this.current })
      });
      this.loadAll();
    },

    async loadAll() {
      await Promise.all([this.loadMissions(), this.loadBoard(), this.loadRuntime(),
                         this.loadToolboxes(), this.loadMetrics()]);
      this.renderMaps();
    },

    async loadMetrics() {
      const m = await fetch(`/api/metrics/${this.current}`).then(x => x.json()).catch(() => null);
      if (m && m.missions) this.metrics = m.missions;
    },

    async loadMissions() {
      const y = await fetch(`/api/yaml/${this.current}/missions`).then(x => x.json()).catch(() => ({}));
      const out = [];
      const pull = (block, model) => {
        Object.entries(block || {}).forEach(([name, m]) => {
          if (!m || typeof m !== 'object') return;
          out.push({
            name, model,
            objective: m.objective || m.subjects || '',
            priority: m.priority || 'MEDIUM',
            klass: (m.state && m.state.class) || 'PLANNING',
            progress: (m.state && m.state.progress) || 'pending',
            raw: m
          });
        });
      };
      pull(y.standard, 'standard');
      pull(y.research, 'research');
      if (y.evolution) Object.entries(y.evolution).forEach(([mode, blk]) => pull(blk, 'evolution:' + mode));
      this.missions = out;
    },

    view(klass) {
      const f = (klass === 'PLANNING' ? this.filterPlanning : this.filterExec).toLowerCase();
      const s = klass === 'PLANNING' ? this.sortPlanning : this.sortExec;
      const rank = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return this.missions
        .filter(m => m.klass === klass)
        .filter(m => !f || m.name.toLowerCase().includes(f) || (m.objective || '').toLowerCase().includes(f))
        .sort((a, b) => {
          if (s === 'priority') return (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
          if (s === 'name') return a.name.localeCompare(b.name);
          return (a.progress || '').localeCompare(b.progress || '');
        });
    },

    openMission(m) {
      this.missionWin.data = m;
      this.missionWin.text = JSON.stringify(m.raw, null, 2);
      this.missionWin.open = true;
    },
    dragStart(e) { this.missionWin.dragging = true; this.missionWin.dx = e.clientX - this.missionWin.x; this.missionWin.dy = e.clientY - this.missionWin.y; },
    dragMove(e) { if (this.missionWin.dragging) { this.missionWin.x = e.clientX - this.missionWin.dx; this.missionWin.y = e.clientY - this.missionWin.dy; } },

    async loadBoard() { this.board = await fetch(`/api/yaml/${this.current}/board`).then(x => x.text()).catch(() => ''); },
    async saveBoard() {
      await fetch(`/api/yaml/${this.current}/board`, { method: 'POST', body: this.board });
    },
    async loadRuntime() {
      const y = await fetch(`/api/yaml/${this.current}/runtime`).then(x => x.json()).catch(() => ({}));
      this.runtimeText = this.dump(y);
    },
    async loadToolboxes() {
      const y = await fetch(`/api/yaml/${this.current}/toolboxes`).then(x => x.json()).catch(() => ({}));
      this.toolboxText = this.dump(y);
      const mt = y.metrics || {};
      this.toolboxMetrics = { active: (mt.active && mt.active.total) || 0, total: mt.total || 0 };
    },
    dump(o) { try { return JSON.stringify(o, null, 2); } catch { return ''; } },

    // ---- Cytoscape maps ----
    renderMaps() {
      this.renderGraph('map-data', this.buildDataGraph());
      this.renderGraph('map-inbox', this.buildInboxGraph());
    },
    buildDataGraph() {
      // nodes from runtime pillars + fill_queue data files
      const els = [{ data: { id: 'root', label: this.current } }];
      fetch; // pillars pulled from runtimeText best-effort
      try {
        const rt = JSON.parse(this.runtimeText || '{}');
        const pillars = (rt.pillars && rt.pillars.validated) || {};
        Object.keys(pillars).forEach(p => {
          if (p === 'total' || p === 'active') return;
          els.push({ data: { id: 'p_' + p, label: p } });
          els.push({ data: { source: 'root', target: 'p_' + p } });
        });
      } catch (e) {}
      return els;
    },
    buildInboxGraph() {
      const els = [{ data: { id: 'inbox', label: 'inbox' } }];
      return els;
    },
    renderGraph(id, elements) {
      const el = document.getElementById(id);
      if (!el || !window.cytoscape) return;
      cytoscape({
        container: el, elements,
        style: [
          { selector: 'node', style: { 'background-color': '#8b5cf6', label: 'data(label)',
            color: '#ededed', 'font-size': '9px', 'text-valign': 'center', 'text-halign': 'center',
            width: 26, height: 26 } },
          { selector: 'edge', style: { 'line-color': 'rgba(255,255,255,.15)', width: 1 } }
        ],
        layout: { name: 'cose', animate: false }
      });
    }
  };
}
