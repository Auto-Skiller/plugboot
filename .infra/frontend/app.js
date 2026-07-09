// PlugBoot dashboard — blueprint theme. Alpine + Cytoscape + SSE.
// v21 — full-field audit: every YAML key reflected with correct access class.
function os() {
  return {
    // ── state ──
    entity: 'os', projects: [], isOs: true,
    board: '', runtime: {}, missions: [], missionsRaw: {}, toolboxesData: {}, inbox: {}, prompts: {},
    kpi: { missions: 0, toolboxes: 0, pillars: 0, evo: 0, prompts: 0 },
    filter: { m: '' }, sort: { m: 'priority' },
    activeMission: null, activePrompt: null, toolboxesOpen: false,
    ecoOpen: false, eco: { totals: {}, entities: [] },
    chatMin: true, theme: 'light', config: {},
    rightTab: 'runtime',
    expand: { rq: true, bl: true, sug: false, all: false, fresh: false, plv: false, pls: false, evv: false, evs: false, arch: false },
    newPillar: '', newEvo: '',
    newRqItem: '', newBlItem: '',
    missionComposer: false, newMission: { name: '', objective: '', bucket: 'standard', priority: 'MEDIUM', evoMode: 'FAST' },
    // new pillar/evo validated entry forms
    newValidatedPillar: { name: '', description: '', why: '' },
    newValidatedEvo: { name: '', description: '', objective: '' },
    // layout persistence
    leftW: 24, rightW: 24,
    // windows
    win: { x: 220, y: 140 }, pwin: { x: 260, y: 180 }, cwin: { x: 300, y: 220 },
    // polling
    _pollTimer: null,

    // ── lifecycle ──
    init() {
      this.theme = localStorage.getItem('pb-theme') || 'light';
      const lw = parseFloat(localStorage.getItem('pb-left')); const rw = parseFloat(localStorage.getItem('pb-right'));
      if (lw) this.leftW = lw; if (rw) this.rightW = rw;
      this.loadConfig();
      this.switchEntity();
      const log = document.getElementById('chat-log');
      if (log) new MutationObserver(() => { this.chatMin = false; }).observe(log, { childList: true });
      // auto-refresh every 6s
      this._pollTimer = setInterval(() => this.refreshData(), 6000);
    },
    toggleTheme() { this.theme = this.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('pb-theme', this.theme); },

    // ── data ──
    async loadConfig() {
      try {
        const c = await (await fetch('/api/config')).json();
        this.config = c;
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
        this._updateKpis();
        this.$nextTick(() => { this.drawFlow(); this.drawMissionGraph(); });
      } catch (e) { console.error(e); }
    },
    async refreshData() {
      try {
        const d = await (await fetch(`/api/entity/${this.entity}`)).json();
        this.runtime = d.runtime || {};
        this.toolboxesData = d.toolboxes || {};
        this.inbox = d.inbox || {};
        this.prompts = d.prompts || {};
        this.missionsRaw = d.missions || {};
        this.missions = this.flatten(d.missions || {});
        this._updateKpis();
      } catch (e) { /* silent */ }
    },
    _updateKpis() {
      this.kpi.missions = this.missions.length;
      this.kpi.pillars = this.pillarActives.length;
      this.kpi.evo = this.evoActives.length;
      this.kpi.toolboxes = this.tbActive;
      this.kpi.prompts = this.promptsList.length;
    },
    async loadEco() {
      try { this.eco = await (await fetch('/api/ecosystem')).json(); } catch (e) { console.error(e); }
    },

    // ── derived getters ──
    get rq() { return Array.isArray(this.runtime.review_queue) ? this.runtime.review_queue : []; },
    get bl() { return Array.isArray(this.runtime.backlog) ? this.runtime.backlog : []; },
    get entityConfig() {
      if (!this.config) return {};
      if (this.isOs) {
        return {
          status: this.config.status ?? null,
          autonomy: this.config.autonomy ?? null,
          toolboxes: this.config.toolboxes ?? null,
          inbox_gateway_delivery: this.config['inbox-gateway_delivery'] ?? null,
          missions: this.config.missions || {}
        };
      } else {
        const p = this.config[this.entity] || {};
        return {
          status: p.status ?? null,
          autonomy: p.autonomy ?? null,
          toolboxes: p.toolboxes ?? null,
          inbox_gateway_delivery: p['inbox-gateway_delivery'] ?? null,
          missions: p.missions || {}
        };
      }
    },
    get pillarActives() { return (this.runtime.pillars && this.runtime.pillars.actives) || []; },
    get evoActives() { return (this.runtime.evolution_objectives && this.runtime.evolution_objectives.actives) || []; },

    // ── pillars validated/suggestions ──
    get pillarValidated() {
      const v = (this.runtime.pillars && this.runtime.pillars.validated) || {};
      const out = [];
      Object.entries(v).forEach(([k, val]) => {
        if (k === 'total' || k === 'active' || typeof val !== 'object') return;
        out.push({ name: k, ...val });
      });
      return out;
    },
    get pillarSuggestions() {
      const s = (this.runtime.pillars && this.runtime.pillars.suggestions) || {};
      const out = [];
      Object.entries(s).forEach(([k, val]) => {
        if (k === 'total' || typeof val !== 'object') return;
        out.push({ name: k, ...val });
      });
      return out;
    },
    get plCounts() {
      const p = this.runtime.pillars || {};
      return {
        v: this.pillarValidated.length,
        vt: (p.validated && p.validated.total) || this.pillarValidated.length,
        s: this.pillarSuggestions.length || (p.suggestions && p.suggestions.total) || 0
      };
    },

    // ── evolution objectives validated/suggestions ──
    get evoValidated() {
      const v = (this.runtime.evolution_objectives && this.runtime.evolution_objectives.validated) || {};
      const out = [];
      Object.entries(v).forEach(([k, val]) => {
        if (k === 'total' || k === 'active' || typeof val !== 'object') return;
        out.push({ name: k, ...val });
      });
      return out;
    },
    get evoSuggestions() {
      const s = (this.runtime.evolution_objectives && this.runtime.evolution_objectives.suggestions) || {};
      const out = [];
      Object.entries(s).forEach(([k, val]) => {
        if (k === 'total' || typeof val !== 'object') return;
        out.push({ name: k, ...val });
      });
      return out;
    },
    get evoCounts() {
      const e = this.runtime.evolution_objectives || {};
      return {
        v: this.evoValidated.length,
        vt: (e.validated && e.validated.total) || this.evoValidated.length,
        s: this.evoSuggestions.length || (e.suggestions && e.suggestions.total) || 0
      };
    },

    // ── fill_queue (RO) ──
    get fq() {
      const fq = (this.runtime.fill_queue || {});
      const out = {};
      Object.keys(fq).forEach(k => {
        const v = fq[k];
        out[k] = Array.isArray(v) ? v.length : (typeof v === 'number' ? v : 0);
      });
      return out;
    },
    get fqTotal() { return Object.values(this.fq).reduce((a, b) => a + (b || 0), 0); },

    // ── freshness (RO) ──
    get freshness() { return this.runtime.freshness || {}; },
    get runtimeMetrics() { return this.runtime.metrics || {}; },

    // ── recent events (RO-display) ──
    get events() { return (this.runtime.recent_events || []); },

    // ── toolboxes counts ──
    get activeDomainsCount() {
      let n = 0;
      Object.values(this._tbRoot).forEach(dom => {
        if (dom && typeof dom === 'object' && dom.status) n++;
      });
      return n;
    },
    get totalDomainsCount() {
      return Object.keys(this._tbRoot).filter(k => k !== 'freshness' && k !== 'metrics').length;
    },
    get activeToolboxesCount() {
      let n = 0;
      Object.values(this._tbRoot).forEach(dom => {
        if (!dom || typeof dom !== 'object' || !dom.toolboxes) return;
        Object.values(dom.toolboxes).forEach(cat => {
          if (cat && typeof cat === 'object' && cat.status) n++;
        });
      });
      return n;
    },
    get totalToolboxesCount() {
      let n = 0;
      Object.values(this._tbRoot).forEach(dom => {
        if (!dom || typeof dom !== 'object' || !dom.toolboxes) return;
        Object.values(dom.toolboxes).forEach(cat => {
          if (cat && typeof cat === 'object' && 'status' in cat) n++;
        });
      });
      return n;
    },
    get activeSkillsCount() {
      let n = 0;
      Object.values(this._tbRoot).forEach(dom => {
        if (!dom || typeof dom !== 'object' || !dom.toolboxes) return;
        Object.values(dom.toolboxes).forEach(cat => {
          if (!cat || typeof cat !== 'object' || !cat.skills) return;
          Object.values(cat.skills).forEach(sk => {
            if (sk && typeof sk === 'object' && sk.status) n++;
          });
        });
      });
      return n;
    },
    get totalSkillsCount() {
      let n = 0;
      Object.values(this._tbRoot).forEach(dom => {
        if (!dom || typeof dom !== 'object' || !dom.toolboxes) return;
        Object.values(dom.toolboxes).forEach(cat => {
          if (!cat || typeof cat !== 'object' || !cat.skills) return;
          Object.values(cat.skills).forEach(sk => {
            if (sk && typeof sk === 'object' && 'status' in sk) n++;
          });
        });
      });
      return n;
    },
    get activeAgentsCount() {
      let n = 0;
      Object.values(this._tbRoot).forEach(dom => {
        if (!dom || typeof dom !== 'object' || !dom.toolboxes) return;
        Object.values(dom.toolboxes).forEach(cat => {
          if (!cat || typeof cat !== 'object' || !cat.agents) return;
          Object.values(cat.agents).forEach(ag => {
            if (ag && typeof ag === 'object' && ag.status) n++;
          });
        });
      });
      return n;
    },
    get totalAgentsCount() {
      let n = 0;
      Object.values(this._tbRoot).forEach(dom => {
        if (!dom || typeof dom !== 'object' || !dom.toolboxes) return;
        Object.values(dom.toolboxes).forEach(cat => {
          if (!cat || typeof cat !== 'object' || !cat.agents) return;
          Object.values(cat.agents).forEach(ag => {
            if (ag && typeof ag === 'object' && 'status' in ag) n++;
          });
        });
      });
      return n;
    },
    get tbActive() {
      let n = 0;
      const tb = this._tbRoot;
      Object.values(tb).forEach(dom => {
        if (!dom || typeof dom !== 'object' || !dom.toolboxes) return;
        Object.values(dom.toolboxes).forEach(cat => {
          if (!cat || typeof cat !== 'object') return;
          // count skills + agents
          ['skills', 'agents'].forEach(kind => {
            const items = cat[kind];
            if (items && typeof items === 'object') {
              Object.values(items).forEach(t => { if (t && typeof t === 'object' && t.status) n++; });
            }
          });
        });
      });
      return n;
    },
    get tbTotal() {
      let n = 0;
      const tb = this._tbRoot;
      Object.values(tb).forEach(dom => {
        if (!dom || typeof dom !== 'object' || !dom.toolboxes) return;
        Object.values(dom.toolboxes).forEach(cat => {
          if (!cat || typeof cat !== 'object') return;
          ['skills', 'agents'].forEach(kind => {
            const items = cat[kind];
            if (items && typeof items === 'object') {
              Object.values(items).forEach(t => { if (t && typeof t === 'object' && 'status' in t) n++; });
            }
          });
        });
      });
      return n;
    },
    // normalized toolbox root: always the `toolboxes` sub-key
    get _tbRoot() {
      const data = this.toolboxesData || {};
      if (data.toolboxes && typeof data.toolboxes === 'object') return data.toolboxes;
      // fallback: top-level domains (legacy)
      const out = {};
      Object.entries(data).forEach(([k, v]) => {
        if (k !== 'freshness' && k !== 'metrics' && v && typeof v === 'object') out[k] = v;
      });
      return out;
    },
    get toolboxDomains() { return this._tbRoot; },

    // ── left panel: sources & flow ──
    get promptsList() {
      const out = [];
      const pr = this.prompts || {};
      Object.entries(pr).forEach(([k, v]) => {
        if (k === 'freshness' || !v || typeof v !== 'object') return;
        // leaf entry: has role or contains or when_to_use
        if ('role' in v || 'contains' in v || 'when_to_use' in v) {
          out.push({ name: k.replace(/^[0-9_-]+/, ''), fullName: k, role: v.role || k, ...v });
        } else {
          // nested folder
          Object.entries(v).forEach(([sk, sv]) => {
            if (sk === 'freshness' || !sv || typeof sv !== 'object') return;
            if ('role' in sv || 'contains' in sv || 'when_to_use' in sv) {
              out.push({ name: sk.replace(/^[0-9_-]+/, ''), fullName: sk, role: sv.role || sk, ...sv });
            }
          });
        }
      });
      return out;
    },
    get inboxRaw() {
      const raw = this.inbox.raw || {};
      return Object.keys(raw).filter(k => k !== 'freshness');
    },
    get inboxRawItems() {
      const raw = this.inbox.raw || {};
      return Object.entries(raw).filter(([k]) => k !== 'freshness').map(([k, v]) => ({ name: k, ...(v || {}) }));
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

    // ── metadata helpers ──
    inboxRawMeta(r) {
      const item = (this.inbox.raw || {})[r] || {};
      return `type: ${item.type || '?'}\n${item.description || ''}\nscaffolded_by: ${item.scaffolded_by || '—'}`;
    },
    mTags(m) {
      const tags = [];
      const t = (m.name.split(/[_\- ]/)[0] || '').toLowerCase();
      if (t) tags.push(t);
      const dep = (m.raw && m.raw.depends_on) || [];
      if (Array.isArray(dep)) dep.forEach(d => tags.push('→ ' + d));
      return tags;
    },

    // ── recursive read-only inspector ──
    get rtInspect() {
      const out = [];
      const walk = (obj, depth, prefix) => {
        if (obj == null) { out.push({ key: prefix || '(null)', val: '—', depth, kind: 'null', path: prefix }); return; }
        if (Array.isArray(obj)) {
          if (!obj.length) { out.push({ key: prefix, val: '[] (empty)', depth, kind: 'empty', path: prefix }); return; }
          if (obj.every(x => typeof x !== 'object' || x === null)) {
            out.push({ key: prefix, val: obj.join(String.fromCharCode(10)), depth, kind: 'list', path: prefix });
          } else {
            out.push({ key: prefix, val: `[${obj.length} items]`, depth, kind: 'count', path: prefix });
            obj.forEach((v, i) => walk(v, depth + 1, `${prefix}[${i}]`));
          }
          return;
        }
        if (typeof obj !== 'object') {
          out.push({ key: prefix, val: String(obj), depth, kind: 'scalar', path: prefix }); return;
        }
        Object.entries(obj).forEach(([k, v]) => {
          const key = prefix ? `${prefix}.${k}` : k;
          if (v == null || typeof v !== 'object') {
            out.push({ key, val: v == null ? '—' : String(v), depth, kind: v == null ? 'null' : 'scalar', path: key });
          } else if (Array.isArray(v)) {
            walk(v, depth + 1, key);
          } else if (Object.keys(v).length === 0) {
            out.push({ key, val: '{} (empty)', depth: depth + 1, kind: 'empty', path: key });
          } else {
            out.push({ key, val: '{…}', depth: depth + 1, kind: 'obj', path: key });
            walk(v, depth + 1, key);
          }
        });
      };
      const rt = this.runtime || {};
      Object.keys(rt).forEach(k => walk(rt[k], 0, k));
      return out;
    },
    fqDetail(k) {
      const v = (this.runtime.fill_queue || {})[k];
      if (Array.isArray(v)) return v.length ? v.join('\n') : '(empty)';
      return typeof v === 'number' ? `${v} items` : '';
    },

    // ── missions ──
    flatten(missions) {
      const out = [];
      const pct = s => ({ pending: 5, 'in-progress': 55, completed: 100, blocked: 30 }[s] ?? 10);
      const push = (obj, model) => Object.entries(obj || {}).forEach(([name, m]) => {
        if (!m || typeof m !== 'object') return;
        const st = m.state || {};
        out.push({
          name, model,
          objective: m.objective || m.subjects || '',
          priority: m.priority || 'MEDIUM',
          klass: st.class || 'PLANNING',
          progress: st.progress || 'pending',
          pct: pct(st.progress),
          raw: m,
          readiness: m.readiness || null,
          depends_on: m.depends_on || [],
          rounds: m.rounds || null,
        });
      });
      push(missions.standard, 'standard');
      push(missions.research, 'research');
      ['FAST', 'DEEP', 'RESEARCH', 'INBOX'].forEach(t => push(missions.evolution && missions.evolution[t], 'evolution:' + t));
      return out;
    },
    planningMissions() { return this.splitByClass('PLANNING'); },
    executionMissions() { return this.splitByClass('EXECUTION'); },
    splitByClass(klass) {
      const f = this.filter.m.toLowerCase();
      let list = this.missions.filter(m => m.klass === klass);
      if (f) list = list.filter(m => m.name.toLowerCase().includes(f) || (m.objective || '').toLowerCase().includes(f));
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      if (this.sort.m === 'priority') list.sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
      return list;
    },
    // archived missions (RO-display)
    get archivedMissions() {
      const arch = this.missionsRaw.archived || {};
      const out = [];
      ['completed', 'cancelled'].forEach(cat => {
        Object.entries(arch[cat] || {}).forEach(([name, m]) => {
          if (m && typeof m === 'object') out.push({ name, category: cat, ...m });
        });
      });
      return out;
    },
    prioClass(p) { return ({ CRITICAL: 'crit', HIGH: 'high', MEDIUM: '', LOW: 'low' })[p] || ''; },
    openMission(m) {
      this.activeMission = Object.assign({}, m.raw, {
        name: m.name, _model: m.model,
        _objective: m.objective,
        _priority: m.priority || 'MEDIUM',
        _stateClass: (m.raw.state && m.raw.state.class) || 'PLANNING',
        _stateProgress: (m.raw.state && m.raw.state.progress) || 'pending',
        _dependsOn: Array.isArray(m.raw.depends_on) ? [...m.raw.depends_on] : [],
      });
    },
    openPrompt(p) { this.activePrompt = p; },
    arr(v) { return Array.isArray(v) ? v.join(', ') : (v || '—'); },

    // ── write-backs (guarded; NEVER touch metrics/fill_queue) ──
    async patch(file, path, value) {
      try {
        const res = await fetch(`/api/entity/${this.entity}/patch`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file, path, value })
        });
        const j = await res.json();
        if (!j.ok) console.error('patch rejected:', j.error);
        await this.switchEntity();
      } catch (e) { console.error('patch failed', e); }
    },
    async patchConfig(path, value) {
      try {
        const res = await fetch('/api/config', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, value })
        });
        const j = await res.json();
        if (!j.ok) console.error('config patch rejected:', j.error);
        await this.loadConfig();
      } catch (e) { console.error('config patch failed', e); }
    },
    async toggleEntityConfig(field, currentVal) {
      const path = this.isOs ? [field] : [this.entity, field];
      await this.patchConfig(path, !currentVal);
    },

    // ── review_queue editable W-list ──
    addRqItem() {
      const n = (this.newRqItem || '').trim(); if (!n) return;
      this.patch('runtime', ['review_queue'], [...this.rq, n]);
      this.newRqItem = '';
    },
    removeRqItem(i) {
      const list = [...this.rq]; list.splice(i, 1);
      this.patch('runtime', ['review_queue'], list);
    },
    // ── backlog editable W-list ──
    addBlItem() {
      const n = (this.newBlItem || '').trim(); if (!n) return;
      this.patch('runtime', ['backlog'], [...this.bl, n]);
      this.newBlItem = '';
    },
    removeBlItem(i) {
      const list = [...this.bl]; list.splice(i, 1);
      this.patch('runtime', ['backlog'], list);
    },

    // ── pillars W-list / EXTEND / promote ──
    addPillar() {
      const n = (this.newPillar || '').trim(); if (!n) return;
      this.patch('runtime', ['pillars', 'actives'], [...this.pillarActives, n]);
      this.newPillar = '';
    },
    removePillar(n) { this.patch('runtime', ['pillars', 'actives'], this.pillarActives.filter(x => x !== n)); },
    addValidatedPillarEntry() {
      const nm = (this.newValidatedPillar.name || '').trim().replace(/\s+/g, '_');
      if (!nm) return;
      this.patch('runtime', ['pillars', 'validated', nm], {
        status: true,
        description: this.newValidatedPillar.description || '',
        why: this.newValidatedPillar.why || '',
        contains: [], triggers: [], relevant_paths: []
      });
      this.newValidatedPillar = { name: '', description: '', why: '' };
    },
    promotePillarSuggestion(name) {
      // set suggestion status to true → engine moves to validated
      this.patch('runtime', ['pillars', 'suggestions', name, 'status'], true);
    },
    updatePillarValidatedField(name, field, value) {
      this.patch('runtime', ['pillars', 'validated', name, field], value);
    },

    // ── evolution objectives W-list / EXTEND / promote ──
    addEvo() {
      const n = (this.newEvo || '').trim(); if (!n) return;
      this.patch('runtime', ['evolution_objectives', 'actives'], [...this.evoActives, n]);
      this.newEvo = '';
    },
    removeEvo(n) { this.patch('runtime', ['evolution_objectives', 'actives'], this.evoActives.filter(x => x !== n)); },
    addValidatedEvoEntry() {
      const nm = (this.newValidatedEvo.name || '').trim().replace(/\s+/g, '_');
      if (!nm) return;
      this.patch('runtime', ['evolution_objectives', 'validated', nm], {
        status: true,
        description: this.newValidatedEvo.description || '',
        objective: this.newValidatedEvo.objective || '',
      });
      this.newValidatedEvo = { name: '', description: '', objective: '' };
    },
    promoteEvoSuggestion(name) {
      this.patch('runtime', ['evolution_objectives', 'suggestions', name, 'status'], true);
    },

    // ── mission writes ──
    async launchMission() {
      const nm = (this.newMission.name || '').trim().replace(/\s+/g, '_');
      if (!nm) return;
      const bucket = this.newMission.bucket || 'standard';
      const obj = {
        model: bucket === 'standard' ? 'standard' : (bucket === 'research' ? 'research' : 'evolution'),
        objective: this.newMission.objective || '(set objective)',
        priority: this.newMission.priority || 'MEDIUM',
        state: { class: 'PLANNING', progress: 'pending' },
        readiness: { ready_to_advance: false },
        rounds: { status: false, persistent: false, max: 1 },
      };
      // evolution missions go under evolution.{MODE}.{name}, not evolution.{name}
      const path = bucket === 'evolution'
        ? ['evolution', this.newMission.evoMode || 'FAST', nm]
        : [bucket, nm];
      await this.patch('missions', path, obj);
      this.newMission = { name: '', objective: '', bucket: 'standard', priority: 'MEDIUM', evoMode: 'FAST' };
      this.missionComposer = false;
    },
    async saveMissionField(fieldPath, value) {
      if (!this.activeMission) return;
      const path = this.missionPath(this.activeMission.name, fieldPath);
      if (path) await this.patch('missions', path, value);
    },
    async advanceMission(name) {
      const path = this.missionPath(name, 'state.class');
      if (!path) return;
      const raw = this.findMissionRaw(name);
      const cur = (raw && raw.state && raw.state.class) || 'PLANNING';
      const next = { PLANNING: 'EXECUTION', EXECUTION: 'DONE', DONE: 'DONE' }[cur] || 'EXECUTION';
      await this.patch('missions', path, next);
    },
    findMissionRaw(name) {
      const ms = this.missionsRaw || {};
      for (const top of ['standard', 'research']) {
        if (ms[top] && ms[top][name]) return ms[top][name];
      }
      if (ms.evolution) {
        for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX']) {
          if (ms.evolution[mode] && ms.evolution[mode][name]) return ms.evolution[mode][name];
        }
      }
      return null;
    },
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

    // ── board ──
    async saveBoard() {
      try {
        const res = await fetch(`/api/entity/${this.entity}/board`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: this.board })
        });
        console.log('board saved', (await res.json()).ok);
      } catch (e) { console.error(e); }
    },

    // ── toolboxes ──
    async toggleToolbox(keyPath, status) {
      try {
        await fetch(`/api/entity/${this.entity}/toolboxes`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path: keyPath, status })
        });
        await this.switchEntity();
      } catch (e) { console.error(e); }
    },
    async patchToolbox(keyPath, field, value) {
      // Use the generic patch endpoint for toolbox fields
      const fullPath = ['toolboxes', ...keyPath, field];
      await this.patch('toolboxes', fullPath, value);
    },

    // ── ecosystem ──
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
        { data: { id: 'pd', label: this.isOs ? 'OS Prompts' : 'Data' } }
      ];

      // Add Inbox items
      const inboxItems = this.inboxRaw.slice(0, 10);
      inboxItems.forEach(r => {
        els.push({ data: { id: 'inbox_item_' + r, label: r.slice(0, 10) }, parent: 'inbox' });
      });

      // Add Gateway items
      const gwItems = this.gatewayFlat.slice(0, 10);
      gwItems.forEach(g => {
        els.push({ data: { id: 'gw_item_' + g.path, label: g.name.slice(0, 10) }, parent: 'gw' });
      });

      // Add Prompts/Data items
      const promptItems = this.promptsList.slice(0, 10);
      promptItems.forEach(p => {
        els.push({ data: { id: 'prompt_item_' + p.fullName, label: p.name.slice(0, 10) }, parent: 'pd' });
      });

      // Inbox -> Gateway edges
      gwItems.forEach(g => {
        inboxItems.forEach(r => {
          if (g.source === r || r.toLowerCase().includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(r.toLowerCase())) {
            els.push({ data: { source: 'inbox_item_' + r, target: 'gw_item_' + g.path } });
          }
        });
      });

      // Gateway -> Prompt/Data edges
      gwItems.forEach(g => {
        promptItems.forEach(p => {
          const pStr = (p.role + ' ' + p.name + ' ' + (p.triggers || []).join(' ')).toLowerCase();
          const pillar = g.pillar.toLowerCase();
          const grp = g.grp.toLowerCase();
          if (pStr.includes(pillar) || pStr.includes(grp)) {
            els.push({ data: { source: 'gw_item_' + g.path, target: 'prompt_item_' + p.fullName } });
          }
        });
      });

      el._cy = cytoscape({
        container: el, elements: els,
        style: [
          { selector: 'node', style: { 'background-color': '#f2a93b', 'label': 'data(label)', 'color': '#1a1a1a', 'font-size': '8px', 'text-valign': 'center', 'text-halign': 'center', 'width': 22, 'height': 22, 'border-width': 1.5, 'border-color': '#2b2b2b' } },
          { selector: 'edge', style: { 'width': 1.5, 'line-color': '#1a8c7b', 'target-arrow-color': '#1a8c7b', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } },
          { selector: ':parent', style: { 'background-color': 'rgba(26,140,123,.1)', 'border-width': 1.5, 'border-color': '#1a8c7b', 'border-style': 'dashed', 'label': 'data(label)', 'color': '#1a8c7b', 'font-size': '9px', 'text-valign': 'top', 'text-halign': 'center' } },
        ],
        layout: { name: 'cose', animate: false, fit: true }
      });
    },
    drawMissionGraph() {
      const el = document.getElementById('mission-graph');
      if (!el || !window.cytoscape) return;
      el._cy && el._cy.destroy();
      const els = [];
      const tagIds = new Set();
      this.missions.slice(0, 60).forEach((m, i) => {
        els.push({ data: { id: 'm' + i, label: (m.name || '').slice(0, 12) } });
        const tag = (m.name.split(/[_\- ]/)[0] || '').toLowerCase();
        if (tag && !tagIds.has('t_' + tag)) { els.push({ data: { id: 't_' + tag, label: tag, cls: 'tag' } }); tagIds.add('t_' + tag); }
      });
      this.missions.slice(0, 60).forEach((m, i) => {
        const tag = (m.name.split(/[_\- ]/)[0] || '').toLowerCase();
        if (tag) els.push({ data: { source: 't_' + tag, target: 'm' + i, cls: 'taglink' } });
      });
      const byName = {};
      this.missions.slice(0, 60).forEach((m, i) => { byName[m.name] = 'm' + i; });
      this.missions.slice(0, 60).forEach((m, i) => {
        const dep = (m.raw && m.raw.depends_on) || [];
        if (Array.isArray(dep)) dep.forEach(d => {
          if (byName[d]) els.push({ data: { source: byName[d], target: 'm' + i, cls: 'dep' } });
        });
      });
      el._cy = cytoscape({
        container: el, elements: els,
        style: [
          { selector: 'node[cls="tag"]', style: { 'background-color': '#1a8c7b', 'label': 'data(label)', 'color': '#e5e7eb', 'font-size': '9px', 'width': 22, 'height': 22, 'border-width': 2, 'border-color': '#2b2b2b' } },
          { selector: 'node', style: { 'background-color': '#f2a93b', 'label': 'data(label)', 'color': '#1a1a1a', 'font-size': '8px', 'width': 16, 'height': 16, 'border-width': 1, 'border-color': '#2b2b2b' } },
          { selector: 'edge[cls="taglink"]', style: { 'width': 1, 'line-color': 'rgba(26,140,123,.45)', 'curve-style': 'bezier' } },
          { selector: 'edge[cls="dep"]', style: { 'width': 2, 'line-color': '#f2a93b', 'target-arrow-color': '#f2a93b', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } },
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
    startDragC(e) {
      const dx = e.clientX - this.cwin.x, dy = e.clientY - this.cwin.y;
      const move = ev => { this.cwin.x = ev.clientX - dx; this.cwin.y = ev.clientY - dy; };
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
