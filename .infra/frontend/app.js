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
    expand: { rq: true, bl: true, sug: false, all: false, fresh: false, metrics: true, plv: false, pls: false, evv: false, evs: false, arch: false },
    // review-feedback modals (mission-window-style: drag + save-status + delete)
    reviewModal: { open: false, index: -1, item: '', feedback: '' },
    blModal: { open: false, index: -1, item: '', feedback: '' },
    reviewSave: { status: 'idle', msg: '' }, _reviewBaseline: '',
    blSave: { status: 'idle', msg: '' }, _blBaseline: '',
    newPillar: '', newEvo: '',
    newRqItem: '', newBlItem: '',
    missionComposer: false, newMission: { name: '', objective: '', bucket: 'standard', priority: 'MEDIUM', evoMode: 'FAST' },
    // mission-window save status: unsaved | saving | saved | error (idle reserved)
    missionSave: { status: 'idle', msg: '' },
    // new pillar/evo validated entry forms
    newValidatedPillar: { name: '', description: '', why: '' },
    newValidatedEvo: { name: '', description: '', objective: '' },
    // layout persistence
    leftW: 24, rightW: 24,
    // windows
    win: { x: 220, y: 140 }, pwin: { x: 260, y: 180 }, cwin: { x: 300, y: 220 },
    rwin: { x: 300, y: 160 }, bwin: { x: 340, y: 200 },
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
    // Full, flattened fill_queue for the expanded panel: [{group, text}, ...]
    get fqItems() {
      const fq = (this.runtime.fill_queue || {});
      const out = [];
      Object.keys(fq).forEach(k => {
        const v = fq[k];
        if (Array.isArray(v)) v.forEach(x => out.push({ group: k, text: String(x) }));
        else if (typeof v === 'number' && v > 0) out.push({ group: k, text: `${v} item(s)` });
      });
      return out;
    },

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
      // agent-task-generation flag (Hard Law): daemon flags, never writes tasks
      if (this.missionNeedsTasks(m.name)) tags.push('⚠ needs tasks');
      return tags;
    },
    // True when fill_queue.missions flags this mission as needing AGENT task generation
    missionNeedsTasks(name) {
      const fq = (this.runtime.fill_queue || {}).missions || [];
      return Array.isArray(fq) && fq.some(s => typeof s === 'string' && s.includes(`:${name}:`) && /needs task generation/.test(s));
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
      const raw = m.raw || {};
      const model = (raw.model || m.model || 'standard');
      const clone = obj => (obj && typeof obj === 'object') ? JSON.parse(JSON.stringify(obj)) : {};
      const st = raw.state || {};
      const rd = raw.rounds || {};
      const lv = raw.levels || {};
      const src = raw.sources || {};
      const ev = raw.evolution_objectives;
      const rd2 = raw.readiness || {};
      this.activeMission = Object.assign({}, raw, {
        name: m.name, _model: model,
        _objective: m.objective || '',
        _priority: m.priority || 'MEDIUM',
        _stateClass: st.class || 'PLANNING',
        _stateProgress: st.progress || 'pending',
        _dependsOn: Array.isArray(raw.depends_on) ? [...raw.depends_on] : [],
        // standard
        _roundsStatus: !!rd.status, _roundsPersistent: !!rd.persistent, _roundsMax: rd.max != null ? rd.max : 1,
        // research
        _subjects: clone(raw.subjects),
        _pillars: (typeof raw.pillars === 'string' || Array.isArray(raw.pillars)) ? raw.pillars : (raw.pillars || 'none'),
        _evoObj: (typeof ev === 'string' || Array.isArray(ev)) ? ev : (ev || 'none'),
        _depth: lv.depth_level || 'MEDIUM', _details: lv.details_level || 'MEDIUM', _precise: lv.precise_level || 'MEDIUM',
        _srcTraining: !!src.training_data, _srcWeb: !!src.web, _srcNbLm: !!src.notebook_lm, _srcYt: !!src.youtube,
        // evolution
        _type: raw.type || 'FAST',
        _readyParams: !!rd2.mission_params_read, _readyPrompt: !!rd2.evolution_os_prompt_read, _readyAdvance: !!rd2.ready_to_advance,
        _actionGates: (typeof raw.action_gates === 'string' || Array.isArray(raw.action_gates)) ? raw.action_gates : (raw.action_gates || 'all'),
        // sub-collections
        _goals: clone(raw.goals), _tasks: clone(raw.tasks),
        _topics: clone(raw.topics), _cases: clone(raw.cases),
        _dirty: false,
      });
      // freshly loaded from disk = in sync -> show "Saved"; flips to "Unsaved" on first edit
      this._missionBaseline = JSON.stringify(this.buildMission());
      this.missionSave = { status: 'saved', msg: 'Saved ✓' };
    },
    // Re-evaluate save state by diffing the form against the on-open baseline.
    // Reverting an edit brings it back to "Saved"; any real change shows "Unsaved".
    markUnsaved() {
      const am = this.activeMission; if (!am) return;
      if (this.missionSave.status === 'saving') return;
      const dirty = JSON.stringify(this.buildMission()) !== this._missionBaseline;
      am._dirty = dirty;
      this.missionSave = dirty ? { status: 'unsaved', msg: 'Unsaved' } : { status: 'saved', msg: 'Saved ✓' };
    },
    // Assemble the full mission object to PUT (preserves engine-managed branches).
    buildMission() {
      const am = this.activeMission; if (!am) return null;
      const raw = am.raw || {};
      const model = am._model;
      const out = {};
      out.model = model;
      if ('objective' in raw || am._objective) out.objective = am._objective;
      if ('priority' in raw || am._priority) out.priority = am._priority;
      if ('last_progress_at' in raw) out.last_progress_at = raw.last_progress_at;
      out.state = { status: (raw.state && raw.state.status) ?? true, class: am._stateClass, progress: am._stateProgress };
      if (model === 'standard') {
        out.rounds = { status: am._roundsStatus, persistent: am._roundsPersistent, max: Number(am._roundsMax) || 1 };
      }
      if (model === 'research') {
        if (am._subjects) out.subjects = am._subjects;
        out.pillars = am._pillars; out.evolution_objectives = am._evoObj;
        out.levels = { depth_level: am._depth, details_level: am._details, precise_level: am._precise };
        out.sources = { training_data: am._srcTraining, web: am._srcWeb, notebook_lm: am._srcNbLm, youtube: am._srcYt };
      }
      if (model === 'evolution') {
        out.type = am._type;
        out.pillars = am._pillars; out.evolution_objectives = am._evoObj; out.action_gates = am._actionGates;
        out.readiness = { mission_params_read: am._readyParams, evolution_os_prompt_read: am._readyPrompt, ready_to_advance: am._readyAdvance };
      }
      // preserve engine-managed branches verbatim
      ['metrics', 'runtime', 'review_queue', 'backlog'].forEach(k => { if (k in raw && !['metrics', 'fill_queue'].includes(k)) out[k] = raw[k]; });
      // sub-collections
      for (const subKey of this.missionSubKeys()) out[subKey] = am['_' + subKey] || {};
      return out;
    },
    cancelMission() { this.activeMission = null; this.missionSave = { status: 'idle', msg: '' }; },
    async saveMission() {
      const am = this.activeMission; if (!am) return;
      const ms = this.missionSave; ms.status = 'saving'; ms.msg = 'Saving…';
      const built = this.buildMission();
      if (!built) { ms.status = 'error'; ms.msg = 'Nothing to save'; return; }
      // locate bucket path (evolution nested under type)
      const msRaw = this.missionsRaw || {};
      let bucket;
      if (msRaw.standard && msRaw.standard[am.name]) bucket = ['standard', am.name];
      else if (msRaw.research && msRaw.research[am.name]) bucket = ['research', am.name];
      else if (msRaw.evolution) {
        for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX']) if (msRaw.evolution[mode] && msRaw.evolution[mode][am.name]) { bucket = ['evolution', mode, am.name]; break; }
      }
      if (!bucket) { ms.status = 'error'; ms.msg = 'Mission not found'; return; }
      try {
        const res = await fetch(`/api/entity/${this.entity}/patch`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: 'missions', path: bucket, value: built }),
        });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || 'patch rejected');
        await this.switchEntity();
        ms.status = 'saved'; ms.msg = 'Saved ✓';
        setTimeout(() => { if (this.activeMission === null) ms.status = 'idle'; }, 1500);
        this.activeMission = null;
      } catch (e) {
        console.error('saveMission failed', e);
        ms.status = 'error'; ms.msg = 'Save failed: ' + e.message;
      }
    },
    // Permanently delete the active mission from its bucket (with confirm).
    async deleteMission() {
      const am = this.activeMission; if (!am) return;
      if (!confirm(`Delete mission "${am.name}"? This permanently removes it from the mission file and cannot be undone.`)) return;
      const ms = this.missionSave; ms.status = 'saving'; ms.msg = 'Deleting…';
      const msRaw = this.missionsRaw || {};
      let bucket;
      if (msRaw.standard && msRaw.standard[am.name]) bucket = ['standard', am.name];
      else if (msRaw.research && msRaw.research[am.name]) bucket = ['research', am.name];
      else if (msRaw.evolution) {
        for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX']) if (msRaw.evolution[mode] && msRaw.evolution[mode][am.name]) { bucket = ['evolution', mode, am.name]; break; }
      }
      if (!bucket) { ms.status = 'error'; ms.msg = 'Mission not found'; return; }
      try {
        const res = await fetch(`/api/entity/${this.entity}/patch`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: 'missions', op: 'delete', path: bucket }),
        });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || 'delete rejected');
        await this.switchEntity();
        this.activeMission = null;
        ms.status = 'idle'; ms.msg = '';
      } catch (e) {
        console.error('deleteMission failed', e);
        ms.status = 'error'; ms.msg = 'Delete failed: ' + e.message;
      }
    },
    csvToArr(v) {
      if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
      if (typeof v === 'string') {
        if (v === 'none' || v === 'all' || !v.trim()) return [];
        return v.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [];
    },
    listMode(v) { return (typeof v === 'string') ? v : 'list'; },  // 'none'|'all'|'list'
    setListMode(field, mode) {
      const am = this.activeMission; if (!am) return;
      am[field] = mode;  // 'none' | 'all' | 'list'
      this.markUnsaved();
    },
    onListCsv(field, csv) {
      const am = this.activeMission; if (!am) return;
      am[field] = this.csvToArr(csv);
      this.markUnsaved();
    },
    listToCsv(v) {
      if (Array.isArray(v)) return v.join(', ');
      return (typeof v === 'string') ? v : '';
    },
    // per-type sub-collection field layout (from missions-templates.yaml)
    subFieldDefs(subKey) {
      const MAP = {
        goals: [
          { k: 'goal', l: 'Goal', t: 'ta' },
          { k: 'why', l: 'Why', t: 'ta' },
          { k: 'how', l: 'How', t: 'ta' },
          { k: 'priority', l: 'Priority', t: 'sel', opts: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          { k: 'status', l: 'Done', t: 'chk' },
        ],
        tasks: [
          { k: 'task', l: 'Task', t: 'ta' },
          { k: 'instructions', l: 'Instructions', t: 'list' },
          { k: 'progress', l: 'Progress', t: 'sel', opts: ['pending', 'in-progress', 'completed', 'blocked'] },
          { k: 'priority_ref', l: 'Prio ref', t: 'num' },
        ],
        topics: [
          { k: 'topic', l: 'Topic', t: 'ta' },
          { k: 'why', l: 'Why', t: 'ta' },
          { k: 'keywords', l: 'Keywords', t: 'list' },
          { k: 'priority', l: 'Priority', t: 'sel', opts: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          { k: 'status', l: 'Done', t: 'chk' },
        ],
        cases: [
          { k: 'case', l: 'Case', t: 'ta' },
          { k: 'solution', l: 'Solution', t: 'ta' },
          { k: 'why', l: 'Why', t: 'ta' },
          { k: 'how', l: 'How', t: 'ta' },
          { k: 'targets', l: 'Targets', t: 'list' },
          { k: 'priority', l: 'Priority', t: 'sel', opts: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          { k: 'status', l: 'Done', t: 'chk' },
        ],
      };
      return MAP[subKey] || [];
    },
    missionSubKeys() {
      const model = (this.activeMission && this.activeMission._model) || 'standard';
      if (model === 'research') return ['topics'];
      if (model === 'evolution') return ['cases'];
      return ['goals', 'tasks'];
    },
    missionSubTitle(subKey) {
      return { goals: 'Goals', tasks: 'Tasks', topics: 'Topics', cases: 'Cases' }[subKey] || subKey;
    },
    subItems(subKey) {
      const am = this.activeMission;
      if (!am) return [];
      const src = am['_' + subKey] || {};
      return Object.keys(src).map(name => ({ name, entry: src[name] || {} }));
    },
    addSubItem(subKey) {
      const am = this.activeMission; if (!am) return;
      const src = am['_' + subKey] || {};
      let i = 1; while (src['item_' + i]) i++;
      const blank = { status: false };
      const defs = this.subFieldDefs(subKey);
      defs.forEach(d => {
        if (d.t === 'ta') blank[d.k] = '';
        else if (d.t === 'list') blank[d.k] = [];
        else if (d.t === 'sel') blank[d.k] = d.opts[0];
        else if (d.t === 'num') blank[d.k] = Object.keys(src).length + 1;
        else if (d.t === 'chk') blank[d.k] = false;
      });
      src['item_' + i] = blank;
      am['_' + subKey] = src;
      am._dirty = true; this.markUnsaved();
    },
    removeSubItem(subKey, name) {
      const am = this.activeMission; if (!am) return;
      const src = am['_' + subKey] || {};
      delete src[name];
      am['_' + subKey] = src;
      am._dirty = true; this.markUnsaved();
    },
    subItemField(subKey, name, field, value) {
      const am = this.activeMission; if (!am) return;
      const src = am['_' + subKey] || {};
      if (!src[name]) src[name] = {};
      src[name][field] = value;
      am['_' + subKey] = src;
      am._dirty = true; this.markUnsaved();
    },
    subItemListPush(subKey, name, field) {
      const am = this.activeMission; if (!am) return;
      const src = am['_' + subKey] || {};
      if (!src[name]) src[name] = {};
      if (!Array.isArray(src[name][field])) src[name][field] = [];
      src[name][field].push('');
      am['_' + subKey] = src; am._dirty = true; this.markUnsaved();
    },
    subItemListPop(subKey, name, field, idx) {
      const am = this.activeMission; if (!am) return;
      const src = am['_' + subKey] || {};
      if (src[name] && Array.isArray(src[name][field])) src[name][field].splice(idx, 1);
      am['_' + subKey] = src; am._dirty = true; this.markUnsaved();
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
    get rqFeedback() { return (this.runtime.review_feedback && typeof this.runtime.review_feedback === 'object') ? this.runtime.review_feedback : {}; },
    get blFeedback() { return (this.runtime.backlog_feedback && typeof this.runtime.backlog_feedback === 'object') ? this.runtime.backlog_feedback : {}; },
    addRqItem() {
      const n = (this.newRqItem || '').trim(); if (!n) return;
      this.patch('runtime', ['review_queue'], [...this.rq, n]);
      this.newRqItem = '';
    },
    // open confirm-with-feedback modal for a review item
    reviewItem(i) {
      const it = this.rq[i];
      if (it === undefined) return;
      this.reviewModal = { open: true, index: i, item: it, feedback: this.rqFeedback[it] || '' };
      this._reviewBaseline = this.reviewModal.feedback;
      this.reviewSave = { status: 'saved', msg: 'Saved ✓' };
    },
    // flip saved/unsaved as the feedback textarea diverges from the on-open value
    markReviewDirty() {
      if (this.reviewSave.status === 'saving') return;
      const dirty = (this.reviewModal.feedback || '') !== (this._reviewBaseline || '');
      this.reviewSave = dirty ? { status: 'unsaved', msg: 'Unsaved' } : { status: 'saved', msg: 'Saved ✓' };
    },
    // Save = store/update feedback only (keeps the item in the queue for agents).
    async saveReview() {
      const { item, feedback } = this.reviewModal;
      this.reviewSave = { status: 'saving', msg: 'Saving…' };
      const fb = Object.assign({}, this.rqFeedback);
      const stored = (feedback || '').trim();
      if (stored) fb[item] = stored; else delete fb[item];
      try {
        await this.patch('runtime', ['review_feedback'], fb);
        this._reviewBaseline = feedback || '';
        this.reviewSave = { status: 'saved', msg: 'Saved ✓' };
      } catch (e) { this.reviewSave = { status: 'error', msg: 'Save failed' }; }
    },
    // Delete = remove the item (and any feedback) from the review queue.
    async deleteReview() {
      const { index, item } = this.reviewModal;
      if (!confirm(`Delete review item "${item}"? This removes it from the queue.`)) return;
      const list = [...this.rq];
      list.splice(index, 1);
      await this.patch('runtime', ['review_queue'], list);
      const fb = Object.assign({}, this.rqFeedback);
      delete fb[item];
      await this.patch('runtime', ['review_feedback'], fb);
      this.reviewModal.open = false;
    },
    // ── backlog editable W-list ──
    addBlItem() {
      const n = (this.newBlItem || '').trim(); if (!n) return;
      this.patch('runtime', ['backlog'], [...this.bl, n]);
      this.newBlItem = '';
    },
    reviewBlItem(i) {
      const it = this.bl[i];
      if (it === undefined) return;
      this.blModal = { open: true, index: i, item: it, feedback: this.blFeedback[it] || '' };
      this._blBaseline = this.blModal.feedback;
      this.blSave = { status: 'saved', msg: 'Saved ✓' };
    },
    markBlDirty() {
      if (this.blSave.status === 'saving') return;
      const dirty = (this.blModal.feedback || '') !== (this._blBaseline || '');
      this.blSave = dirty ? { status: 'unsaved', msg: 'Unsaved' } : { status: 'saved', msg: 'Saved ✓' };
    },
    // Save = store/update feedback only (keeps the item in the backlog).
    async saveBlReview() {
      const { item, feedback } = this.blModal;
      this.blSave = { status: 'saving', msg: 'Saving…' };
      const fb = Object.assign({}, this.blFeedback);
      const stored = (feedback || '').trim();
      if (stored) fb[item] = stored; else delete fb[item];
      try {
        await this.patch('runtime', ['backlog_feedback'], fb);
        this._blBaseline = feedback || '';
        this.blSave = { status: 'saved', msg: 'Saved ✓' };
      } catch (e) { this.blSave = { status: 'error', msg: 'Save failed' }; }
    },
    // Delete = remove the item (and any feedback) from the backlog.
    async deleteBlReview() {
      const { index, item } = this.blModal;
      if (!confirm(`Delete backlog item "${item}"? This removes it from the backlog.`)) return;
      const list = [...this.bl];
      list.splice(index, 1);
      await this.patch('runtime', ['backlog'], list);
      const fb = Object.assign({}, this.blFeedback);
      delete fb[item];
      await this.patch('runtime', ['backlog_feedback'], fb);
      this.blModal.open = false;
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
    // 18 Trig/Exec/Arch toggles (DRY: rendered via x-for in the eco-pop panel).
    get missionToggles() {
      const groups = [
        { g: 'Trig', key: 'auto_triggering' },
        { g: 'Exec', key: 'auto_execution' },
        { g: 'Arch', key: 'auto_archiving' },
      ];
      const modes = [
        { m: 'standard', l: 'Std' }, { m: 'research', l: 'Res' },
        { m: 'evolution.FAST', l: 'F' }, { m: 'evolution.DEEP', l: 'D' },
        { m: 'evolution.RESEARCH', l: 'R' }, { m: 'evolution.INBOX', l: 'I' },
      ];
      const missions = (this.entityConfig.missions && typeof this.entityConfig.missions === 'object') ? this.entityConfig.missions : {};
      const out = [];
      for (const grp of groups) for (const md of modes) {
        const path = ['missions', grp.key, ...md.m.split('.')];   // config path
        // null-safe nested read that distinguishes false from missing
        let cur = missions[grp.key];
        for (const k of md.m.split('.')) { if (cur && typeof cur === 'object' && k in cur) cur = cur[k]; else { cur = undefined; break; } }
        out.push({ g: grp.g, l: md.l, m: md.m, on: cur === true, path });
      }
      return out;
    },
    toggleMission(t) {
      const path = this.isOs ? t.path : [this.entity, ...t.path];
      this.patchConfig(path, !t.on);
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
    // generic window drag — pass the state key holding {x,y}
    drag(key, e) {
      const w = this[key];
      const dx = e.clientX - w.x, dy = e.clientY - w.y;
      const move = ev => { w.x = ev.clientX - dx; w.y = ev.clientY - dy; };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },
    startDrag(e) { this.drag('win', e); },
    startDragP(e) { this.drag('pwin', e); },
    startDragC(e) { this.drag('cwin', e); },

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
