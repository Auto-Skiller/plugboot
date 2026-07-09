// PlugBoot dashboard — blueprint theme. Alpine + Cytoscape + SSE.
function os() {
  return {
    // ── state ──
    entity: 'os', projects: [], isOs: true,
    board: '', runtime: {}, missions: [], missionsRaw: {}, toolboxesData: {}, inbox: {}, prompts: {},
    kpi: { missions: 0, toolboxes: 0, pillars: 0 },
    filter: { m: '' }, sort: { m: 'priority' }, mview: 'PLANNING',
    activeMission: null, activePrompt: null, toolboxesOpen: false,
    ecoOpen: false, eco: { totals: {}, entities: [] },
    chatMin: true, theme: 'light',
    rightTab: 'runtime', expand: { rq: false, bl: false, sug: false },
    newPillar: '', newEvo: '',
    // layout persistence
    leftW: 24, rightW: 24,
    // windows
    win: { x: 220, y: 140 }, pwin: { x: 260, y: 180 },

    // ── lifecycle ──
    init() {
      this.theme = localStorage.getItem('pb-theme') || 'light';
      const lw = parseFloat(localStorage.getItem('pb-left')); const rw = parseFloat(localStorage.getItem('pb-right'));
      if (lw) this.leftW = lw; if (rw) this.rightW = rw;
      this.loadConfig();
      this.switchEntity();
      const log = document.getElementById('chat-log');
      if (log) new MutationObserver(() => { this.chatMin = false; }).observe(log, { childList: true });
    },
    toggleTheme() { this.theme = this.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('pb-theme', this.theme); },

    // ── data ──
    async loadConfig() {
      try {
        const c = await (await fetch('/api/config')).json();
        this.projects = Object.keys(c).filter(k => c[k] && typeof c[k] === 'object' && 'status' in c[k]);
      } catch (e) { console.error(e); }
    },
    async switchEntity() {
      this.isOs = this.entity === 'os';
      try {
        const d = await (await fetch(`/api/entity/${this.entity}`)).json();
        this.board = d.board || '';
        this.runtime = d.runtime || {};
        this.toolboxesData = d.toolboxes || {};
        this.inbox = d.inbox || {};
        this.prompts = d.prompts || {};
        this.missionsRaw = d.missions || {};
        this.missions = this.flatten(d.missions || {});
        this.kpi.missions = this.missions.length;
        this.kpi.pillars = this.pillarActives.length;
        this.kpi.toolboxes = this.tbActive;
        this.$nextTick(() => { this.drawFlow(); this.drawMissionGraph(); });
      } catch (e) { console.error(e); }
    },
    async loadEco() {
      try { this.eco = await (await fetch('/api/ecosystem')).json(); } catch (e) { console.error(e); }
    },

    // ── derived getters ──
    get rq() { return (this.runtime.review_queue && !Array.isArray(this.runtime.review_queue) ? [] : this.runtime.review_queue) || []; },
    get bl() { return (this.runtime.backlog && !Array.isArray(this.runtime.backlog) ? [] : this.runtime.backlog) || []; },
    get pillarActives() { return (this.runtime.pillars && this.runtime.pillars.actives) || []; },
    get evoActives() { return (this.runtime.evolution_objectives && this.runtime.evolution_objectives.actives) || []; },
    get plCounts() {
      const p = this.runtime.pillars || {};
      return { v: (p.validated && p.validated.active) || 0, vt: (p.validated && p.validated.total) || 0, s: (p.suggestions && p.suggestions.total) || 0 };
    },
    get evoCounts() {
      const e = this.runtime.evolution_objectives || {};
      return { v: (e.validated && e.validated.active) || 0, vt: (e.validated && e.validated.total) || 0, s: (e.suggestions && e.suggestions.total) || 0 };
    },
    get fq() {
      const fq = (this.runtime.fill_queue || {});
      const out = {};
      Object.keys(fq).forEach(k => {
        if (k === 'os_prompts' && !this.isOs) return;
        const v = fq[k];
        out[k] = Array.isArray(v) ? v.length : (typeof v === 'number' ? v : 0);
      });
      return out;
    },
    get fqTotal() { return Object.values(this.fq).reduce((a, b) => a + (b || 0), 0); },
    get events() { return (this.runtime.recent_events || []); },
    get tbActive() {
      let n = 0;
      Object.entries(this.toolboxesData || {}).forEach(([dk, dv]) => {
        if (dk === 'freshness' || dk === 'metrics') return;
        if (!dv || typeof dv !== 'object') return;
        Object.values(dv).forEach(tv => { if (tv && typeof tv === 'object' && tv.status) n++; });
      });
      return n;
    },

    // ── left panel: sources & flow ──
    get promptsList() {
      const out = [];
      const walk = (o, pre) => {
        if (!o || typeof o !== 'object') return;
        Object.entries(o).forEach(([k, v]) => {
          if (k === 'freshness' || k === 'path') return;
          if (v && typeof v === 'object') {
            if ('role' in v || 'contains' in v || 'when_to_use' in v) out.push({ name: (pre + k).replace(/^[0-9_-]+/, ''), role: v.role || k, ...v });
            else walk(v, pre + k + ' › ');
          }
        });
      };
      walk(this.prompts, '');
      return out;
    },
    get inboxRaw() {
      const raw = this.inbox.raw || {};
      return Object.keys(raw).filter(k => k !== 'freshness');
    },
    get gatewayFlat() {
      const gw = this.inbox.gateway || {};
      const out = [];
      Object.entries(gw).forEach(([pillar, groups]) => {
        if (!groups || typeof groups !== 'object') return;
        Object.entries(groups).forEach(([grp, items]) => {
          if (!items || typeof items !== 'object') return;
          Object.keys(items).forEach(it => out.push({ label: `${pillar} › ${grp} › ${it}`, path: `${pillar}/${grp}/${it}` }));
        });
      });
      return out;
    },
    get gatewayCount() { return this.gatewayFlat.length; },

    // ── missions ──
    flatten(missions) {
      const out = [];
      const pct = s => ({ pending: 5, 'in-progress': 55, completed: 100, blocked: 30 }[s] ?? 10);
      const push = (obj, model) => Object.entries(obj || {}).forEach(([name, m]) => {
        if (!m || typeof m !== 'object') return;
        const st = m.state || {};
        out.push({ name, model, objective: m.objective || m.subjects || '', priority: m.priority || 'MEDIUM',
          klass: st.class || 'PLANNING', progress: st.progress || 'pending', pct: pct(st.progress), raw: m });
      });
      push(missions.standard, 'standard');
      push(missions.research, 'research');
      ['FAST', 'DEEP', 'RESEARCH', 'INBOX'].forEach(t => push(missions.evolution && missions.evolution[t], 'evolution:' + t));
      return out;
    },
    viewMissions() {
      const f = this.filter.m.toLowerCase();
      let list = this.missions.filter(m => {
        if (this.mview === 'PLANNING') return m.klass === 'PLANNING';
        if (this.mview === 'EXECUTION') return m.klass === 'EXECUTION';
        return true;
      });
      if (f) list = list.filter(m => m.name.toLowerCase().includes(f) || (m.objective || '').toLowerCase().includes(f));
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      if (this.sort.m === 'priority') list.sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
      return list;
    },
    prioClass(p) { return ({ CRITICAL: 'crit', HIGH: 'high', MEDIUM: '', LOW: 'low' })[p] || ''; },
    openMission(m) { this.activeMission = Object.assign({}, m.raw, { name: m.name }); },
    openPrompt(p) { this.activePrompt = p; },
    arr(v) { return Array.isArray(v) ? v.join(', ') : (v || '—'); },

    // ── write-backs (guarded; never touch metrics/fill_queue) ──
    async patch(file, path, value) {
      try {
        await fetch(`/api/entity/${this.entity}/patch`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file, path, value })
        });
        this.switchEntity();
      } catch (e) { console.error('patch failed', e); }
    },
    addPillar() {
      const n = (this.newPillar || '').trim(); if (!n) return;
      const list = [...this.pillarActives, n];
      this.patch('runtime', ['pillars', 'actives'], list);
      this.newPillar = '';
    },
    removePillar(n) { this.patch('runtime', ['pillars', 'actives'], this.pillarActives.filter(x => x !== n)); },
    addEvo() {
      const n = (this.newEvo || '').trim(); if (!n) return;
      const list = [...this.evoActives, n];
      this.patch('runtime', ['evolution_objectives', 'actives'], list);
      this.newEvo = '';
    },
    removeEvo(n) { this.patch('runtime', ['evolution_objectives', 'actives'], this.evoActives.filter(x => x !== n)); },

    async setReady(name, val) {
      const path = this.missionPath(name, 'readiness.ready_to_advance');
      if (path) this.patch('missions', path, val);
    },
    missionPath(name, leaf) {
      const ms = this.missionsRaw || {};
      for (const top of ['standard', 'research']) if (ms[top] && ms[top][name]) return [top, name, ...leaf.split('.')];
      for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX']) if (ms.evolution && ms.evolution[mode] && ms.evolution[mode][name]) return ['evolution', mode, name, ...leaf.split('.')];
      return null;
    },

    async saveBoard() {
      try {
        const res = await fetch(`/api/entity/${this.entity}/board`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: this.board })
        });
        console.log('board saved', (await res.json()).ok);
      } catch (e) { console.error(e); }
    },
    async toggleToolbox(keyPath, status) {
      try {
        await fetch(`/api/entity/${this.entity}/toolboxes`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: keyPath, status })
        });
        this.switchEntity();
      } catch (e) { console.error(e); }
    },
    get ecoTiles() {
      return [
        { k: 'missions', l: 'Missions', c: '' },
        { k: 'toolboxes_active', l: 'Toolboxes on', c: 'accent' },
        { k: 'toolboxes_total', l: 'Toolboxes', c: '' },
        { k: 'pillars', l: 'Pillars', c: 'teal' },
        { k: 'evolution', l: 'Evolution', c: 'teal' },
        { k: 'review_queue', l: 'Review Q', c: 'accent' },
        { k: 'backlog', l: 'Backlog', c: '' },
        { k: 'inbox_raw', l: 'Inbox raw', c: '' },
        { k: 'gateway', l: 'Gateway', c: '' },
        { k: 'prompts', l: 'Prompts', c: 'teal' },
      ];
    },

    // ── relationship graphs ──
    drawFlow() {
      const el = document.getElementById('flow-graph');
      if (!el || !window.cytoscape) return;
      el._cy && el._cy.destroy();
      const els = [
        { data: { id: 'inbox', label: 'Inbox' } },
        { data: { id: 'gw', label: 'Gateway' } },
        { data: { id: 'pd', label: this.isOs ? 'OS Prompts' : 'Data' } },
        { data: { source: 'inbox', target: 'gw' } },
        { data: { source: 'gw', target: 'pd' } },
      ];
      this.inboxRaw.slice(0, 6).forEach((r, i) => els.push({ data: { id: 'r' + i, label: (r || '').slice(0, 8) }, parent: 'inbox' }));
      this.gatewayFlat.slice(0, 6).forEach((g, i) => els.push({ data: { id: 'g' + i, label: g.label.split(' › ')[0] }, parent: 'gw' }));
      this.promptsList.slice(0, 6).forEach((p, i) => els.push({ data: { id: 'p' + i, label: (p.name || '').slice(0, 8) }, parent: 'pd' }));
      el._cy = cytoscape({
        container: el, elements: els,
        style: [
          { selector: 'node', style: { 'background-color': '#f2a93b', 'label': 'data(label)', 'color': '#1a1a1a', 'font-size': '9px', 'text-valign': 'center', 'text-halign': 'center', 'width': 26, 'height': 26, 'border-width': 2, 'border-color': '#2b2b2b' } },
          { selector: 'edge', style: { 'width': 2, 'line-color': '#1a8c7b', 'target-arrow-color': '#1a8c7b', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } },
          { selector: ':parent', style: { 'background-color': 'rgba(26,140,123,.12)', 'border-width': 2, 'border-color': '#1a8c7b', 'border-style': 'dashed', 'label': '' } },
        ],
        layout: { name: 'cose', animate: false, fit: true }
      });
    },
    drawMissionGraph() {
      const el = document.getElementById('mission-graph');
      if (!el || !window.cytoscape) return;
      el._cy && el._cy.destroy();
      const els = [];
      this.missions.slice(0, 40).forEach((m, i) => {
        els.push({ data: { id: 'm' + i, label: (m.name || '').slice(0, 10) } });
        const tag = (m.name.split(/[_\- ]/)[0] || '').toLowerCase();
        if (tag) els.push({ data: { id: 't_' + tag, label: tag, cls: 'tag' } });
      });
      this.missions.slice(0, 40).forEach((m, i) => {
        const tag = (m.name.split(/[_\- ]/)[0] || '').toLowerCase();
        if (tag) els.push({ data: { source: 't_' + tag, target: 'm' + i } });
      });
      el._cy = cytoscape({
        container: el, elements: els,
        style: [
          { selector: 'node[cls="tag"]', style: { 'background-color': '#1a8c7b', 'label': 'data(label)', 'color': '#e5e7eb', 'font-size': '8px', 'width': 18, 'height': 18, 'border-width': 2, 'border-color': '#2b2b2b' } },
          { selector: 'node', style: { 'background-color': '#f2a93b', 'label': 'data(label)', 'color': '#1a1a1a', 'font-size': '8px', 'width': 16, 'height': 16 } },
          { selector: 'edge', style: { 'width': 1, 'line-color': 'rgba(42,43,43,.4)', 'curve-style': 'bezier' } },
        ],
        layout: { name: 'cose', animate: false, fit: true }
      });
    },

    // ── drag windows ──
    startDrag(e) {
      const dx = e.clientX - this.win.x, dy = e.clientY - this.win.y;
      const move = ev => { this.win.x = ev.clientX - dx; this.win.y = ev.clientY - dy; };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },
    startDragP(e) {
      const dx = e.clientX - this.pwin.x, dy = e.clientY - this.pwin.y;
      const move = ev => { this.pwin.x = ev.clientX - dx; this.pwin.y = ev.clientY - dy; };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },

    // ── resizable borders (persist across restart) ──
    startResize(side, e) {
      const move = ev => {
        const pct = (ev.clientX / window.innerWidth) * 100;
        if (side === 'L') this.leftW = Math.min(48, Math.max(14, pct));
        else this.rightW = Math.min(48, Math.max(14, 100 - pct));
        document.documentElement.style.setProperty(side === 'L' ? '--left' : '--right', this.leftW + '%');
      };
      const up = () => {
        document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up);
        localStorage.setItem('pb-left', this.leftW); localStorage.setItem('pb-right', this.rightW);
      };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },
  };
}
