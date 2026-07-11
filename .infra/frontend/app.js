// PlugBoot dashboard — blueprint theme. Alpine + Cytoscape + SSE.
// v21 — full-field audit: every YAML key reflected with correct access class.
function os() {
  return {
    // ── state ──
    entity: 'os', projects: [], isOs: true,
    board: '', runtime: {}, missions: [], missionsRaw: {}, toolboxesData: {}, inbox: {}, prompts: {},
    kpi: { missions: 0, toolboxes: 0, pillars: 0, evo: 0, prompts: 0 },
    filter: { m: '' }, sort: { m: 'priority' }, relGroup: 'type', relHover: null,
    activeMission: null, activePrompt: null, toolboxesOpen: false,
    ecoOpen: false, eco: { totals: {}, entities: [] },
    chatMin: true, theme: 'light', config: {},
    rightTab: 'runtime',
    expand: { rq: true, bl: true, sug: false, all: false, fresh: false, metrics: true, plv: false, pls: false, evv: false, evs: false, arch: false },
    // minbar news ticker — change-detection across the 6s polls
    news: [], _prev: null, _newsId: 0,
    // review-feedback modals (mission-window-style: drag + save-status + delete)
    reviewModal: { open: false, index: -1, item: '', feedback: '' },
    blModal: { open: false, index: -1, item: '', feedback: '' },
    pillarModal: { open: false },
    evoModal: { open: false },
    rqManager: { open: false },
    blManager: { open: false },
    pillarEditor: { open: false, name: '', bucket: 'validated', description: '', why: '', status: false },
    evoEditor: { open: false, name: '', bucket: 'validated', description: '', objective: '', status: false },
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
    // layout persistence (LEFT sidebar width [Runtime/Board] | main col [Missions top / Sources bottom])
    sideW: 24, topH: 52,
    minTop: false, minMid: false, minSide: false,
    // flow map (Sankey): raw sources -> gateway pillars -> OS prompts (ribbon width = volume)
    flowCy: null, flowMode: 'pillar', flowShowAspects: false,
    flowFocus: null, flowInfo: '', flowEl: null,
    // windows
    win: { x: 220, y: 140 }, pwin: { x: 260, y: 180 }, cwin: { x: 300, y: 220 },
    rwin: { x: 300, y: 160 }, bwin: { x: 340, y: 200 }, plwin: { x: 320, y: 150 }, evwin: { x: 360, y: 170 },
    // polling
    _pollTimer: null,

    // ── lifecycle ──
    init() {
      this.theme = localStorage.getItem('pb-theme') || 'light';
      const tw = parseFloat(localStorage.getItem('pb-top')); const sw = parseFloat(localStorage.getItem('pb-side'));
      if (tw) this.topH = tw; if (sw) this.sideW = sw;
      document.documentElement.style.setProperty('--top', this.topH + '%');
      document.documentElement.style.setProperty('--side', this.sideW + '%');
      this.loadConfig();
      this.switchEntity();
      const log = document.getElementById('chat-log');
      if (log) new MutationObserver(() => { this.chatMin = false; }).observe(log, { childList: true });
      // auto-refresh every 6s
      this._pollTimer = setInterval(() => this.refreshData(), 6000);
    },
    toggleTheme() { this.theme = this.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('pb-theme', this.theme); this.$nextTick(() => { this.drawMissionRel(); this.drawFlowRel(); }); },

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
        this.detectNews(this._prev);
        this._prev = this.snapshot();
        this.$nextTick(() => { this.drawMissionRel(); this.drawFlowRel(); });
        if (!this._relBound) {
          this._relBound = true;
          window.addEventListener('resize', () => { this.drawMissionRel(); this.drawFlowRel(); });
        }
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
        this.detectNews(this._prev);
        this._prev = this.snapshot();
      } catch (e) { /* silent */ }
    },
    _updateKpis() {
      this.kpi.missions = this.missions.length;
      this.kpi.pillars = this.pillarActives.length;
      this.kpi.evo = this.evoActives.length;
      this.kpi.toolboxes = this.tbActive;
      this.kpi.prompts = this.promptsList.length;
    },
    // ── minbar news: diff each 6s poll and surface "what changed" hints ──
    snapshot() {
      const ms = {};
      this.missions.forEach(m => { ms[m.name] = m.klass; });
      const arch = {};
      this.archivedMissions.forEach(a => { arch[a.name] = a.category; });
      return { inbox: this.inboxRaw.length, missions: ms, arch };
    },
    pushNews(kind, text) {
      const id = ++this._newsId;
      this.news = [{ id, kind, text }].concat(this.news).slice(0, 4);
      setTimeout(() => { this.news = this.news.filter(n => n.id !== id); }, 16000);
    },
    detectNews(prev) {
      if (!prev) return;
      const cur = this.snapshot();
      const prevM = prev.missions, curM = cur.missions, prevA = prev.arch, curA = cur.arch;
      if (cur.inbox > prev.inbox) {
        const d = cur.inbox - prev.inbox;
        this.pushNews('inbox', `+${d} new inbox item${d > 1 ? 's' : ''}`);
      }
      const prevAll = new Set([...Object.keys(prevM), ...Object.keys(prevA)]);
      const added = Object.keys(curM).filter(n => !prevAll.has(n));
      if (added.length) this.pushNews('mission', `+${added.length} new mission${added.length > 1 ? 's' : ''}: ${added.slice(0, 2).join(', ')}`);
      for (const n of Object.keys(curM)) {
        if (n in prevM && prevM[n] !== curM[n]) this.pushNews('move', `${n} → ${curM[n]}`);
      }
      for (const n of Object.keys(prevM)) {
        if (n in curA && !(n in curM)) this.pushNews('arch', `${n} archived`);
      }
      for (const n of Object.keys(prevA)) {
        if (n in curM && !(n in curA)) this.pushNews('arch', `${n} restored`);
      }
    },
    newsFor(kinds) {
      const set = new Set(kinds);
      return this.news.filter(n => set.has(n.kind));
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
        out.push({ name: k, ...val, _active: this.pillarActives.includes(k) });
      });
      out.sort((a, b) => (b._active ? 1 : 0) - (a._active ? 1 : 0));
      return out;
    },
    get pillarSuggestions() {
      const s = (this.runtime.pillars && this.runtime.pillars.suggestions) || {};
      const out = [];
      Object.entries(s).forEach(([k, val]) => {
        if (k === 'total' || typeof val !== 'object') return;
        out.push({ name: k, ...val, _active: this.pillarActives.includes(k) });
      });
      out.sort((a, b) => (b._active ? 1 : 0) - (a._active ? 1 : 0));
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
        out.push({ name: k, ...val, _active: this.evoActives.includes(k) });
      });
      out.sort((a, b) => (b._active ? 1 : 0) - (a._active ? 1 : 0));
      return out;
    },
    get evoSuggestions() {
      const s = (this.runtime.evolution_objectives && this.runtime.evolution_objectives.suggestions) || {};
      const out = [];
      Object.entries(s).forEach(([k, val]) => {
        if (k === 'total' || typeof val !== 'object') return;
        out.push({ name: k, ...val, _active: this.evoActives.includes(k) });
      });
      out.sort((a, b) => (b._active ? 1 : 0) - (a._active ? 1 : 0));
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
          name, model, type: m.type || '',
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
    // gateway grouped by 3 pillars > aspects (F/C/M) > functional groups (expandable)
    // Gateway topology is derived from the inbox.gateway YAML — the daemon and
    // agent own the pillar/aspect/FG structure (the 5 Routing Laws: LAW 1 route
    // by pillar/aspect/FG). The dashboard never hardcodes pillar or aspect names;
    // it just renders whatever the YAML declares, in declaration order.
    get gatewayPillars() {
      const gw = this.inbox.gateway || {};
      return Object.keys(gw).filter(k => k !== 'freshness').map(pname => ({
        name: pname,
        aspects: Object.keys(gw[pname] || {}).map(aname => ({
          name: aname,
          fgs: Object.entries(gw[pname][aname] || {}).map(([fgName, items]) => ({
            name: fgName,
            path: `${pname}/${aname}/${fgName}`,
            count: Object.keys(items || {}).length,
            items: Object.keys(items || {}),
            open: false,
          })),
        })),
      }));
    },
    get fqMissionsCount() { return ((this.runtime.fill_queue || {}).missions || []).length; },
    // ── Relational-map color system ──
    // Stable palette assigned per gateway PILLAR so every FG / branch / link under a
    // pillar shares one hue — the user can trace pillar→aspect→FG chains by color.
    get pillarPalette() {
      const P = ['#1a8c7b', '#f2a93b', '#e0556b', '#5a7fd6', '#9b59b6', '#27ae60'];
      const pillars = Object.keys(this.inbox.gateway || {}).filter(k => k !== 'freshness');
      const out = {};
      pillars.forEach((p, i) => { out[p] = P[i % P.length]; });
      return out;
    },
    pillarColor(name) { return this.pillarPalette[name] || '#1a8c7b'; },
    gwPillarStyle(name) { return { '--gw-pillar': this.pillarColor(name) }; },
    // Inbox→Gateway routing state (data-honest; raw item status drives the color)
    get inboxRouting() {
      const raw = this.inbox.raw || {};
      const out = {};
      Object.entries(raw).forEach(([k, v]) => {
        if (k === 'freshness' || !v) return;
        const moved = (v.status === 'drained_to_archive') || (v.status === 'moved') ||
                      (typeof v.contains === 'string' && /drain|archiv|moved/i.test(v.contains || ''));
        out[k] = { moved, needsSemantics: !!v.needs_semantics };
      });
      return out;
    },
    // Resolve a raw inbox DIR to the single Gateway PILLAR it feeds, via its
    // `contains` files → gateway FG items (basename match, generic files ignored).
    // Returns the pillar name only when all matches collapse to ONE pillar; else null
    // (ambiguous / no specific files) so we fall back to a status-colored center link.
    get inboxPillarMap() {
      const GENERIC = new Set(['README.md', '.gitkeep', 'LICENSE', 'index.md']);
      const byBase = {};
      Object.entries(this.inbox.gateway || {}).forEach(([p, aspects]) => {
        if (p === 'freshness') return;
        Object.values(aspects || {}).forEach(fgs => {
          Object.values(fgs || {}).forEach(items => {
            Object.keys(items || {}).forEach(it => {
              const b = (it.split('/').pop() || '').trim();
              if (b && !GENERIC.has(b)) (byBase[b] = byBase[b] || new Set()).add(p);
            });
          });
        });
      });
      const raw = this.inbox.raw || {};
      const out = {};
      Object.entries(raw).forEach(([k, v]) => {
        if (k === 'freshness' || !v) return;
        const pillars = new Set();
        (v.contains || []).forEach(c => {
          if (typeof c !== 'string' || c.endsWith('/')) return;
          const b = (c.split('/').pop() || '').trim();
          if (byBase[b]) byBase[b].forEach(p => pillars.add(p));
        });
        out[k] = pillars.size === 1 ? [...pillars][0] : null;
      });
      return out;
    },
    // Gateway→Prompt association (heuristic: per-item routing fields not yet emitted by
    // daemon — see drawFlowRel NOTE). We infer a prompt's pillar from the prompt name and
    // tint it; true per-item links will come once the daemon populates routing fields.
    promptPillar(name) {
      const n = (name || '').toLowerCase();
      const pillars = Object.keys(this.pillarPalette);
      for (const p of pillars) {
        const key = p.toLowerCase().replace(/_/g, ' ');
        if (n.includes(key) || key.split(' ').some(w => w.length > 3 && n.includes(w))) return p;
      }
      return null;
    },
    promptPillarStyle(name) {
      const p = this.promptPillar(name);
      if (!p) return {};
      return { '--gw-pillar': this.pillarColor(p) };
    },
    // ── mission card drag → change class / archive ──
    onMissionDrag(e, m, fromArchive) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ name: m.name, fromArchive: !!fromArchive }));
    },
    async onMissionDrop(e, klass) {
      let data; try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
      if (!data || !data.name) return;
      await this.moveMission(data.name, klass, data.fromArchive);
    },
    async moveMission(name, klass, fromArchive) {
      const ms = this.missionsRaw || {};
      let src = null;
      if (fromArchive) {
        for (const cat of ['completed', 'cancelled']) if (ms.archived && ms.archived[cat] && ms.archived[cat][name]) { src = ['archived', cat, name]; break; }
      } else {
        if (ms.standard && ms.standard[name]) src = ['standard', name];
        else if (ms.research && ms.research[name]) src = ['research', name];
        else if (ms.evolution) for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX']) if (ms.evolution[mode] && ms.evolution[mode][name]) { src = ['evolution', mode, name]; break; }
      }
      if (!src) return;
      if (klass === 'ARCHIVE') {
        const cat = 'completed';
        const built = this.findMissionRaw(name);
        if (!built) return;
        try {
          await fetch(`/api/entity/${this.entity}/patch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'missions', path: ['archived', cat, name], value: built }) });
          await fetch(`/api/entity/${this.entity}/patch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'missions', op: 'delete', path: src }) });
          await this.switchEntity();
        } catch (e) { console.error('archive failed', e); }
      } else if (fromArchive) {
        // ── un-archive: relocate the archived entry back into its live bucket ──
        const entry = (ms.archived && ms.archived[src[1]] && ms.archived[src[1]][name]) || null;
        if (!entry) return;
        // resolve the live bucket from the mission's own model/type
        let bucket;
        const model = entry.model;
        if (model === 'evolution') bucket = ['evolution', entry.type || 'FAST', name];
        else if (model === 'research') bucket = ['research', name];
        else bucket = ['standard', name];
        const restored = JSON.parse(JSON.stringify(entry));
        // an archived entry carries state.status:false + progress:completed — revive it
        restored.state = Object.assign({}, restored.state, {
          status: true,
          class: klass,
          progress: (klass === 'PLANNING' ? 'pending' : 'in-progress'),
        });
        delete restored.archived_at;
        try {
          await fetch(`/api/entity/${this.entity}/patch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'missions', path: bucket, value: restored }) });
          await fetch(`/api/entity/${this.entity}/patch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'missions', op: 'delete', path: src }) });
          await this.switchEntity();
        } catch (e) { console.error('un-archive failed', e); }
      } else {
        const path = src.concat(['state', 'class']);
        await this.patch('missions', path, klass);
      }
    },
    openArchived(am) {
      const clone = obj => (obj && typeof obj === 'object') ? JSON.parse(JSON.stringify(obj)) : {};
      const model = am.model || 'standard';
      this.activeMission = Object.assign({}, am, {
        name: am.name, _model: model, _readonly: true,
        _objective: am.objective || '', _priority: am.priority || 'MEDIUM',
        _stateClass: (am.state && am.state.class) || 'DONE',
        _stateProgress: (am.state && am.state.progress) || 'completed',
        _goals: clone(am.goals), _tasks: clone(am.tasks), _topics: clone(am.topics), _cases: clone(am.cases),
      });
      this.missionSave = { status: 'saved', msg: 'Archived (read-only)' };
    },
    openPrompt(p) {
      const pr = (this.prompts || {})[p.fullName] || (this.prompts || {})[p.name] || {};
      this.activePrompt = Object.assign({ name: p.name, fullName: p.fullName }, pr);
    },

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
    async patch(file, path, value, op) {
      try {
        const body = (op) ? { file, path, value, op } : { file, path, value };
        const res = await fetch(`/api/entity/${this.entity}/patch`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
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
      // a validated entry is active → register in actives so the agent reads it (bucket-agnostic)
      const act = [...this.pillarActives];
      if (!act.includes(nm)) act.push(nm);
      this.patch('runtime', ['pillars', 'actives'], act);
      this.newValidatedPillar = { name: '', description: '', why: '' };
    },
    togglePillarActive(name, bucket) {
      // Activate/Deactivate an entry in either bucket. An entry is "active" iff its
      // name is in pillars.actives (and status:true). Toggling flips status AND syncs
      // the actives list. NOT a move between buckets.
      const sec = (bucket === 'validated')
        ? (this.runtime.pillars.validated || {})
        : (this.runtime.pillars.suggestions || {});
      const cur = sec[name] ? !!sec[name].status : false;
      const now = !cur;
      this.patch('runtime', ['pillars', bucket, name, 'status'], now);
      const act = [...this.pillarActives];
      const idx = act.indexOf(name);
      if (now && idx < 0) act.push(name);
      if (!now && idx >= 0) act.splice(idx, 1);
      this.patch('runtime', ['pillars', 'actives'], act);
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
        objective: this.newValidatedEvo.objective || ''
      });
      // a validated objective is active → register in actives so the agent reads it
      const act = [...this.evoActives];
      if (!act.includes(nm)) act.push(nm);
      this.patch('runtime', ['evolution_objectives', 'actives'], act);
      this.newValidatedEvo = { name: '', description: '', objective: '' };
    },
    toggleEvoActive(name, bucket) {
      // Activate/Deactivate an entry in either bucket (validated | suggestions).
      // Active iff name in evolution_objectives.actives (and status:true). Toggling
      // flips status AND syncs the actives list. NOT a move between buckets.
      const sec = (bucket === 'validated')
        ? (this.runtime.evolution_objectives.validated || {})
        : (this.runtime.evolution_objectives.suggestions || {});
      const cur = sec[name] ? !!sec[name].status : false;
      const now = !cur;
      this.patch('runtime', ['evolution_objectives', bucket, name, 'status'], now);
      const act = [...this.evoActives];
      const idx = act.indexOf(name);
      if (now && idx < 0) act.push(name);
      if (!now && idx >= 0) act.splice(idx, 1);
      this.patch('runtime', ['evolution_objectives', 'actives'], act);
    },

    // ── Pillar / Evo single-item EDITOR window (opened from active chips + manager Edit buttons) ──
    openPillarEditor(name, bucket) {
      const v = (this.runtime.pillars[bucket] || {})[name] || {};
      this.pillarEditor = {
        open: true, name, bucket,
        description: v.description || '', why: v.why || '',
        status: !!v.status,
        _origBucket: bucket
      };
    },
    savePillarEditor() {
      const { name, bucket, description, why, status } = this.pillarEditor;
      const norm = String(name).trim().replace(/\s+/g, '_');
      if (!norm) return;
      // if renamed, remove the old entry first
      if (norm !== name) this.patch('runtime', ['pillars', bucket, name], null, 'delete');
      this.patch('runtime', ['pillars', bucket, norm], { status, description, why });
      const act = [...this.pillarActives];
      const idx = act.indexOf(norm);
      if (status && idx < 0) act.push(norm);
      if (!status && idx >= 0) act.splice(idx, 1);
      this.patch('runtime', ['pillars', 'actives'], act);
      this.pillarEditor.open = false;
    },
    async deletePillarEntry(bucket, name) {
      if (!confirm(`Delete pillar "${name}"? This removes it from ${bucket} and actives.`)) return;
      await this.patch('runtime', ['pillars', bucket, name], null, 'delete');
      this.patch('runtime', ['pillars', 'actives'], this.pillarActives.filter(x => x !== name));
      this.pillarEditor.open = false;
    },
    openEvoEditor(name, bucket) {
      const v = (this.runtime.evolution_objectives[bucket] || {})[name] || {};
      this.evoEditor = {
        open: true, name, bucket,
        description: v.description || '', objective: v.objective || '',
        status: !!v.status,
        _origBucket: bucket
      };
    },
    saveEvoEditor() {
      const { name, bucket, description, objective, status } = this.evoEditor;
      const norm = String(name).trim().replace(/\s+/g, '_');
      if (!norm) return;
      if (norm !== name) this.patch('runtime', ['evolution_objectives', bucket, name], null, 'delete');
      this.patch('runtime', ['evolution_objectives', bucket, norm], { status, description, objective });
      const act = [...this.evoActives];
      const idx = act.indexOf(norm);
      if (status && idx < 0) act.push(norm);
      if (!status && idx >= 0) act.splice(idx, 1);
      this.patch('runtime', ['evolution_objectives', 'actives'], act);
      this.evoEditor.open = false;
    },
    async deleteEvoEntry(bucket, name) {
      if (!confirm(`Delete evolution objective "${name}"? This removes it from ${bucket} and actives.`)) return;
      await this.patch('runtime', ['evolution_objectives', bucket, name], null, 'delete');
      this.patch('runtime', ['evolution_objectives', 'actives'], this.evoActives.filter(x => x !== name));
      this.evoEditor.open = false;
    },
    // open the editor for an active item (sidebar chip has name only → resolve its bucket)
    openActivePillar(name) {
      const b = (this.runtime.pillars.validated && this.runtime.pillars.validated[name]) ? 'validated'
              : (this.runtime.pillars.suggestions && this.runtime.pillars.suggestions[name]) ? 'suggestions' : 'validated';
      this.openPillarEditor(name, b);
    },
    openActiveEvo(name) {
      const b = (this.runtime.evolution_objectives.validated && this.runtime.evolution_objectives.validated[name]) ? 'validated'
              : (this.runtime.evolution_objectives.suggestions && this.runtime.evolution_objectives.suggestions[name]) ? 'suggestions' : 'validated';
      this.openEvoEditor(name, b);
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
    // ══ Relational map: missions (planning→execution→archive) linked by model/type dots ══
    // ══ MISSIONS RELATIONAL MAP: links the REAL board cards by a shared attribute
    //    (type / model / class / source) — no depends_on, no invented nodes. The map
    //    reads each .mcard's actual DOM position, so lines are always anchored to the
    //    real cards. relGroup selects the attribute; relHover dims the rest. ══
    drawMissionRel() {
      const cv = document.getElementById('mission-rel'); if (!cv) return;
      const pane = cv.parentElement;
      const dpr = window.devicePixelRatio || 1;
      const W = pane.clientWidth, H = pane.clientHeight;
      if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const cards = [...pane.querySelectorAll('.mcard')];
      if (!cards.length) return;
      const cr0 = cv.getBoundingClientRect();
      const rectOf = c => { const r = c.getBoundingClientRect(); return { cx: r.left - cr0.left + r.width / 2, cy: r.top - cr0.top + r.height / 2 }; };
      const klassOrder = { PLANNING: 0, EXECUTION: 1, ARCHIVE: 2 };
      const byName = {};
      [...this.missions, ...this.archivedMissions].forEach(m => { byName[m.name] = m; });
      const mode = this.relGroup;
      const groups = {}; // key -> [cardEls]
      cards.forEach(c => {
        const name = c.getAttribute('data-name'); if (!name) return;
        const m = byName[name]; if (!m) return;
        let keys = [];
        if (mode === 'source') { const s = (m.raw && m.raw.sources) || []; keys = Array.isArray(s) ? s.map(x => 'src:' + x) : []; }
        else if (mode === 'klass') keys = [m.klass];
        else if (mode === 'model') keys = [m.model];
        else keys = [m.type ? m.type : m.model];
        keys.forEach(k => { (groups[k] = groups[k] || []).push(c); });
      });
      const palette = ['#f2a93b', '#1a8c7b', '#e0556b', '#5a7fd6', '#9b59b6', '#27ae60', '#e67e22', '#16a085', '#d9534f', '#3a8ed6'];
      const keys = Object.keys(groups).filter(k => groups[k].length >= 2);
      const hoveredKey = this.relHover ? (() => {
        const m = byName[this.relHover]; if (!m) return null;
        if (mode === 'source') { const s = (m.raw && m.raw.sources) || []; return s.length ? 'src:' + s[0] : null; }
        if (mode === 'klass') return m.klass;
        if (mode === 'model') return m.model;
        return m.type ? m.type : m.model;
      })() : null;
      keys.forEach((k, i) => {
        const list = groups[k];
        const active = !this.relHover || hoveredKey === k;
        const color = palette[i % palette.length];
        const pts = list.map(c => ({ x: rectOf(c).cx, y: rectOf(c).cy, name: c.getAttribute('data-name') }))
          .sort((a, b) => (klassOrder[byName[a.name] ? byName[a.name].klass : ''] ?? 9) - (klassOrder[byName[b.name] ? byName[b.name].klass : ''] ?? 9));
        ctx.strokeStyle = color; ctx.globalAlpha = active ? .85 : .12; ctx.lineWidth = active ? 2.5 : 1.2;
        ctx.beginPath(); pts.forEach((p, j) => j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.stroke();
        pts.forEach(p => { ctx.fillStyle = color; ctx.globalAlpha = active ? 1 : .18; ctx.beginPath(); ctx.arc(p.x, p.y, active ? 4 : 3, 0, 7); ctx.fill(); });
        ctx.globalAlpha = 1;
      });
      if (keys.length) {
        ctx.font = '10px monospace';
        const txt = getComputedStyle(document.body).getPropertyValue('--text') || '#333';
        const lh = 14, ly0 = 8;
        keys.forEach((k, i) => {
          const y = ly0 + i * lh;
          ctx.globalAlpha = (!this.relHover || hoveredKey === k) ? 1 : .3;
          ctx.fillStyle = palette[i % palette.length]; ctx.beginPath(); ctx.arc(10, y + 4, 4, 0, 7); ctx.fill();
          ctx.fillStyle = txt; ctx.fillText((k.length > 18 ? k.slice(0, 17) + '…' : k) + ' (' + groups[k].length + ')', 18, y + 8);
          ctx.globalAlpha = 1;
        });
      }
    },
    relMove(e) {
      const cv = document.getElementById('mission-rel'); if (!cv) return;
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cards = [...cv.parentElement.querySelectorAll('.mcard')];
      let hit = null;
      for (const c of cards) { const cr = c.getBoundingClientRect(); if (x >= cr.left - r.left && x <= cr.right - r.left && y >= cr.top - r.top && y <= cr.bottom - r.top) { hit = c.getAttribute('data-name'); break; } }
      if (hit !== this.relHover) { this.relHover = hit; this.drawMissionRel(); }
    },
    relLeave() { if (this.relHover) { this.relHover = null; this.drawMissionRel(); } },
    // ══ FLOW MAP: Sankey-style flow (ribbon width = real item volume) ══
    // NEW LOGIC: a supply-chain flow, not a node tree. Raw inbox sources ->
    // gateway pillars -> OS prompt destinations, where each ribbon's thickness
    // is proportional to the number of items moving through it (so you SEE
    // throughput, not just structure). Hover a ribbon/node to dim the rest
    // and read the volume. Click a prompt node to open it.
    flowPillars() {
      const gw = (this.inbox && this.inbox.gateway) || {};
      return Object.keys(gw).filter(p => p !== 'freshness');
    },
    flowPalette(p) { return this.pillarPalette[p] || '#1a8c7b'; },
    // count REAL leaf gateway files under a pillar (each leaf has a real
    // source_raw_item link back to its raw inbox drop)
    flowGwCount(pillar) {
      const sub = (this.inbox && this.inbox.gateway && this.inbox.gateway[pillar]) || {};
      let n = 0;
      const walk = o => { if (!o || typeof o !== 'object') return; if (o.source_raw_item) { n++; return; } for (const k in o) walk(o[k]); };
      walk(sub);
      return n;
    },
    // REAL documented routing: each raw drop maps to exactly one gateway pillar
    // (verified in 07_inbox-Inbox_and_Gateway.md). This is the actual design,
    // not an invented link.
    flowSourcePillar(name) {
      if (!name) return null;
      if (/best uses|operat|bound|profile|security/i.test(name)) return 'agent_operating_conventions';
      if (/capab|skill/i.test(name)) return 'capability_and_skill_library';
      if (/complex|system|engine|method/i.test(name)) return 'engineering_methodologies';
      return null;
    },
    flowVolumes() {
      const gw = (this.inbox && this.inbox.gateway) || {};
      const pillars = this.flowPillars();
      // pillar volume = real gateway leaf-file count
      const pillarVol = {}; pillars.forEach(p => pillarVol[p] = this.flowGwCount(p));
      // sources = the 3 REAL raw inbox drops; volume = real item count (contains[])
      const raw = (this.inbox && this.inbox.raw) || {};
      const sources = Object.keys(raw).map(name => {
        const it = raw[name] || {};
        const vol = Array.isArray(it.contains) ? it.contains.length : 1;
        const tgt = this.flowSourcePillar(name);
        return { id: 'raw:' + name, label: name, vol, target: tgt, color: tgt ? this.flowPalette(tgt) : '#9aa0a6' };
      });
      const pillarNodes = pillars.map(p => ({ id: 'gw:' + p, label: p.replace(/_/g, ' '), vol: pillarVol[p] || 1, color: this.flowPalette(p) }));
      // prompts = the REAL os_prompts files; pillar routed from each prompt's real role field
      const prompts = Object.keys(this.prompts || {}).filter(k => k !== 'freshness').map(k => {
        const v = this.prompts[k] || {};
        const pc = this.flowSourcePillar(v.role) || this.flowSourcePillar(k);
        return { id: 'pr:' + k, label: (k || '').replace(/\.md$/, ''), pillar: pc || null, color: pc ? this.flowPalette(pc) : '#9aa0a6' };
      });
      const links = [];
      // raw -> pillar (real documented routing; gw hub if unmapped)
      sources.forEach(s0 => { const t = s0.target || 'gw'; links.push({ s: s0.id, t: (t === 'gw' ? 'gw' : 'gw:' + t), vol: s0.vol, kind: 'raw', color: s0.color }); });
      // pillar -> prompt (real prompt role; gw hub if unmapped)
      prompts.forEach(p0 => { const k = p0.pillar || 'gw'; links.push({ s: (k === 'gw' ? 'gw' : 'gw:' + k), t: p0.id, vol: 1, kind: 'prompt', color: p0.color }); });
      return { sources, pillars: pillarNodes, prompts, links };
    },
    flowGeometry() {
      const V = this.flowVolumes();
      const el = this.flowEl;
      const W = el ? (el.clientWidth || 760) : 760;
      const H = el ? (el.clientHeight || 320) : 320;
      const padL = 80, padR = 80, padT = 14, padB = 14;
      const srcW = 64, dstW = 64, midW = 120;
      const srcX = 8, midX = Math.round(W / 2 - midW / 2), dstX = W - dstW - 8;
      const gap = 6;
      const maxVol = Math.max(1, ...V.pillars.map(p => p.vol), ...V.links.map(l => l.vol));
      const scale = (H - padT - padB) / maxVol;
      const box = (x, w, y0, y1) => ({ x, w, y0, y1 });
      let y = padT; const srcBox = {};
      V.sources.forEach(s0 => { const h = Math.max(8, s0.vol * scale); srcBox[s0.id] = box(srcX, srcW, y, y + h); y += h + gap; });
      y = padT; const midBox = {};
      V.pillars.forEach(p => { const h = Math.max(10, p.vol * scale); midBox[p.id] = box(midX, midW, y, y + h); y += h + gap; });
      y = padT; const dstBox = {};
      V.prompts.forEach(p0 => { const h = Math.max(5, 1 * scale); dstBox[p0.id] = box(dstX, dstW, y, y + h); y += h + gap; });
      let srcCur = {}, midCur = {}, dstCur = {}, gwCur = padT;
      V.sources.forEach(s0 => srcCur[s0.id] = srcBox[s0.id].y0);
      V.pillars.forEach(p => midCur[p.id] = midBox[p.id].y0);
      V.prompts.forEach(p0 => dstCur[p0.id] = dstBox[p0.id].y0);
      const gwBox = box(midX, midW, padT, H - padB);
      const ribs = [];
      V.links.forEach(l => {
        const sh = Math.max(2, l.vol * scale), dh = Math.max(2, l.vol * scale);
        if (l.kind === 'raw') {
          const sB = srcBox[l.s]; if (!sB) return;
          const tB = (l.t === 'gw') ? gwBox : midBox[l.t]; if (!tB) return;
          const ys0 = srcCur[l.s]; srcCur[l.s] += sh;
          let yT0;
          if (l.t === 'gw') { yT0 = gwCur; gwCur += dh; } else { yT0 = midCur[l.t]; midCur[l.t] += dh; }
          ribs.push({ x0: sB.x + sB.w, x1: tB.x, y0a: ys0, y0b: ys0 + sh, y1a: yT0, y1b: yT0 + dh, color: l.color, kind: l.kind, sId: l.s, tId: l.t, vol: l.vol });
        } else { // prompt pillar -> prompts
          const sB = (l.s === 'gw') ? gwBox : midBox[l.s]; if (!sB) return;
          const tB = dstBox[l.t]; if (!tB) return;
          let ys0;
          if (l.s === 'gw') { ys0 = gwCur; gwCur += dh; } else { ys0 = midCur[l.s]; midCur[l.s] += dh; }
          const yT0 = dstCur[l.t]; dstCur[l.t] += dh;
          ribs.push({ x0: sB.x + sB.w, x1: tB.x - 2, y0a: ys0, y0b: ys0 + dh, y1a: yT0, y1b: yT0 + dh, color: l.color, kind: l.kind, sId: l.s, tId: l.t, vol: l.vol });
        }
      });
      return { W, H, srcBox, midBox, dstBox, ribs, V };
    },
    drawFlowRel() {
      const host = document.getElementById('flow-cy');
      if (!host) return;
      this.flowEl = host;
      const G = this.flowGeometry();
      const ribPaths = G.ribs.map((r, i) => {
        const cx0 = (r.x0 + r.x1) / 2;
        const d = `M${r.x0},${r.y0a} C${cx0},${r.y0a} ${cx0},${r.y1a} ${r.x1},${r.y1a} L${r.x1},${r.y1b} C${cx0},${r.y1b} ${cx0},${r.y0b} ${r.x0},${r.y0b} Z`;
        return `<path class="rib" data-i="${i}" d="${d}" fill="${r.color}" fill-opacity="0.30" stroke="${r.color}" stroke-opacity="0.45" stroke-width="1"></path>`;
      }).join('');
      const nodeBox = (b, id, label, color, x, w) => {
        const h = Math.max(6, b.y1 - b.y0);
        return `<rect class="fnode" data-id="${id}" x="${x}" y="${b.y0}" width="${w}" height="${h}" rx="4" fill="${color}" fill-opacity="0.92" stroke="#fff" stroke-width="1.5"></rect>`
          + `<text class="flabel" data-id="${id}" x="${x + w / 2}" y="${(b.y0 + b.y1) / 2}" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="9">${label}</text>`;
      };
      const nodes = [];
      const W = G.W;
      Object.entries(G.srcBox).forEach(([id, b]) => { const s = G.V.sources.find(x => x.id === id); nodes.push(nodeBox(b, id, s.label, s.color, b.x, b.w)); });
      Object.entries(G.midBox).forEach(([id, b]) => { const p = G.V.pillars.find(x => x.id === id); nodes.push(nodeBox(b, id, p.label, p.color, b.x, b.w)); });
      Object.entries(G.dstBox).forEach(([id, b]) => { const p = G.V.prompts.find(x => x.id === id); nodes.push(nodeBox(b, id, p.label, p.color, b.x, b.w)); });
      host.innerHTML = `<svg width="${W}" height="${G.H}" viewBox="0 0 ${W} ${G.H}" style="width:100%;height:100%;display:block">${ribPaths}${nodes.join('')}</svg>`;
      this.flowBind(host, G);
    },
    flowBind(host, G) {
      const self = this;
      host.querySelectorAll('.rib, .fnode, .flabel').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('mouseenter', () => self.flowFocus(el.getAttribute('data-i') !== null ? +el.getAttribute('data-i') : el.getAttribute('data-id'), G));
        el.addEventListener('mouseleave', () => self.flowClearFocus());
        if (el.classList.contains('fnode') && el.getAttribute('data-id').startsWith('pr:')) {
          el.addEventListener('click', () => { const id = el.getAttribute('data-id'); const nm = G.V.prompts.find(p => p.id === id); if (nm && self.openPrompt) self.openPrompt(nm.label); });
        }
      });
    },
    flowFocus(sel, G) {
      const svg = this.flowEl && this.flowEl.querySelector('svg'); if (!svg) return;
      const keep = new Set();
      if (typeof sel === 'number') {
        const r = G.ribs[sel]; keep.add(r.sId); keep.add(r.tId);
        this.flowInfo = `flow ${r.vol} item(s) - ${r.kind}`;
      } else {
        G.ribs.forEach((r, i) => { if (r.sId === sel || r.tId === sel) { keep.add(r.sId); keep.add(r.tId); svg.querySelectorAll('.rib')[i].setAttribute('fill-opacity', '0.85'); } });
        const node = G.V.sources.find(x => x.id === sel) || G.V.pillars.find(x => x.id === sel) || G.V.prompts.find(x => x.id === sel);
        if (node) this.flowInfo = node.label + (node.vol !== undefined ? ` - ${node.vol} item(s)` : '');
      }
      svg.querySelectorAll('.rib').forEach((p, i) => { const r = G.ribs[i]; if (!r || !(keep.has(r.sId) && keep.has(r.tId))) p.setAttribute('fill-opacity', '0.05'); });
      svg.querySelectorAll('.fnode, .flabel').forEach(n => { if (!keep.has(n.getAttribute('data-id'))) n.setAttribute('opacity', '0.22'); });
    },
    flowClearFocus() {
      const svg = this.flowEl && this.flowEl.querySelector('svg'); if (!svg) return;
      svg.querySelectorAll('.rib').forEach(p => p.setAttribute('fill-opacity', '0.30'));
      svg.querySelectorAll('.fnode, .flabel').forEach(n => n.setAttribute('opacity', '1'));
      this.flowInfo = '';
    },
    flowReset() { this.flowClearFocus(); },



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

    // ── resizable vertical border between SIDEBAR and main column (persist)
    //    SIDEBAR is on the RIGHT, so its width = distance from the right viewport edge ──
    startResizeV(e) {
      e.preventDefault();
      const move = ev => {
        const pct = ((window.innerWidth - ev.clientX) / window.innerWidth) * 100;
        this.sideW = Math.min(50, Math.max(12, pct));
        document.documentElement.style.setProperty('--side', this.sideW + '%');
        this.drawMissionRel(); this.drawFlowRel();
      };
      const up = () => {
        document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up);
        localStorage.setItem('pb-side', this.sideW);
      };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },
    // ── Missions / Sources can't both be minimized at once: maximizing one clears the other ──
    toggleTop() { this.minTop = !this.minTop; if (this.minTop) this.minMid = false; this.$nextTick(() => this.drawFlowRel()); },
    toggleMid() { this.minMid = !this.minMid; if (this.minMid) this.minTop = false; this.$nextTick(() => this.drawFlowRel()); },
    // ── draggable agent "A" fab (free-floating; opens chat on click) ──
    startDragFab(e) {
      e.preventDefault();
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const offX = e.clientX - r.left, offY = e.clientY - r.top;
      const move = ev => {
        const x = Math.max(0, Math.min(window.innerWidth - r.width, ev.clientX - offX));
        const y = Math.max(0, Math.min(window.innerHeight - r.height, ev.clientY - offY));
        el.style.left = x + 'px'; el.style.top = y + 'px'; el.style.right = 'auto'; el.style.bottom = 'auto';
      };
      const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },
    // ── resizable horizontal border: controls the TOP row (Missions) height in the main column; Sources bottom row is auto ──
    startResizeH(which, e) {
      e.preventDefault();
      const move = ev => {
        const usable = window.innerHeight - 110; // minus topbar+footer
        const h = ((ev.clientY - 56) / usable) * 100;
        this.topH = Math.min(75, Math.max(20, h));
        document.documentElement.style.setProperty('--top', this.topH + '%');
        this.drawMissionRel(); this.drawFlowRel();
      };
      const up = () => {
        document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up);
        localStorage.setItem('pb-top', this.topH);
      };
      document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
    },
  };
}
