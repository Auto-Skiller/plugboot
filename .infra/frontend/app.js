// PlugBoot dashboard — blueprint theme. Alpine + Cytoscape + SSE.
// v21 — full-field audit: every YAML key reflected with correct access class.

function os() {
  return {
    // ── state ──
    entity: 'os', projects: [], isOs: true,
    board: '', runtime: {}, missions: [], missionsRaw: {}, toolboxesData: {}, inbox: {}, prompts: {},
    kpi: { missions: 0, toolboxes: 0, pillars: 0, evo: 0, prompts: 0 },
    filter: { m: '' }, sort: { m: 'priority' }, relGroup: 'type', relHover: null, flowHover: null,
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
    detailDrawer: { open: false, title: '', desc: '', items: [] },
    // ── Dynamic Packing v2: measured auto-fit + overflow bucket ──
    // Replaces the old binary isCrowded() threshold for the 3 Sources & Flow
    // tiers. Each tier is measured against its own real (fixed) height at up
    // to 3 shrink levels; if it still doesn't fit at the tightest level, the
    // overflow gets bucketed behind a "+N more" chip instead of being
    // silently clipped by overflow:hidden. See recalcFit() below.
    fit: {
      raw: { level: 0, shown: [], hiddenCount: 0 },
      discovery: { level: 0, shown: [], hiddenCount: 0 },
      analysing: { level: 0, shown: [], hiddenCount: 0 },
      prompts: { level: 0, shown: [], hiddenCount: 0 },
      gatewayLevel: 0,
      gatewayAspects: {},
    },
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
      // Clamp initial float-window positions to the viewport so they never open off-screen
      ['win', 'pwin', 'cwin', 'rwin', 'bwin', 'plwin', 'evwin'].forEach(k => {
        const w = this[k]; if (!w) return;
        w.x = Math.min(w.x, Math.max(0, window.innerWidth - 560));
        w.y = Math.min(w.y, Math.max(0, window.innerHeight - 300));
      });
      this.loadConfig();
      this.switchEntity();
      const log = document.getElementById('chat-log');
      if (log) new MutationObserver(() => { this.chatMin = false; }).observe(log, { childList: true });
      // auto-refresh every 6s
      this._pollTimer = setInterval(() => this.refreshData(), 6000);
      this.startAnimationLoop();
      this.bindHorizontalWheelPan();
    },
    // Below the app's --app-min-w floor, the page becomes wider than the
    // viewport (by design, so nothing overlaps) and the topbar/bottombar/
    // sidebar content past the right edge has to be reached by scrolling
    // right. A native horizontal scrollbar is easy to miss (hidden by
    // default on macOS, absent on most mice), so a plain vertical mouse-
    // wheel also pans the page sideways whenever it's in that overflowed
    // state — as long as the pointer isn't over something with its own
    // real vertical scroll (a modal, drawer, or list), which keeps
    // working normally.
    bindHorizontalWheelPan() {
      const hasScrollableAncestor = el => {
        let node = el;
        while (node && node !== document.body) {
          const cs = getComputedStyle(node);
          if (/(auto|scroll)/.test(cs.overflowY) && node.scrollHeight > node.clientHeight) return true;
          node = node.parentElement;
        }
        return false;
      };
      window.addEventListener('wheel', ev => {
        if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) return; // already a horizontal gesture (trackpad) — leave it alone
        if (document.body.scrollWidth <= document.body.clientWidth) return; // nothing to pan
        if (hasScrollableAncestor(ev.target)) return; // let modals/drawers/lists scroll vertically as normal
        document.body.scrollLeft += ev.deltaY;
        ev.preventDefault();
      }, { passive: false });
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('pb-theme', this.theme);
      this.patchConfig(['dashboard', 'theme'], this.theme);
      this.$nextTick(() => { this.drawMissionRel(); this.drawFlowRel(); });
    },
    startAnimationLoop() {
      if (this._animLoopRunning) return;
      this._animLoopRunning = true;
      let offset = 0;
      const tick = () => {
        offset = (offset + 0.25) % 16;
        this.drawMissionRel(offset);
        this.drawFlowRel(offset);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },

    // ── Dynamic Packing: payload-density crowd control (Missions board only) ──
    // The mission column crosses its high-volume threshold and gets bound
    // `:class="{crowded:…}"` in index.html, which flips on the `.crowded`
    // utility rules in style.css (tighter type/padding/gap). The 3 Sources &
    // Flow tiers used to share this same binary approach but now use the
    // measured recalcFit() engine below instead — a single hardcoded
    // threshold can't tell you whether 50 items fit, only whether there are
    // "a lot" of them, so it either shrank too early or (past the threshold)
    // not enough, and anything still left over just vanished under
    // overflow:hidden with zero indication.
    _crowdThresholds: { missionCol: 4 },
    isCrowded(countOrList, kind) {
      const n = Array.isArray(countOrList) ? countOrList.length : (countOrList || 0);
      const t = this._crowdThresholds[kind] ?? 6;
      return n > t;
    },

    // ── Dynamic Packing v2: measured auto-fit + overflow bucket ──
    // Core idea: don't guess whether content fits — render it into an
    // offscreen probe using the SAME classes as the real tier, measure its
    // height against the real tier's fixed height, and only then decide.
    // 3 shrink levels are tried in order ('', 'crowded', 'crowded-2'); if
    // even the tightest still overflows, we binary-search how many items
    // actually fit and bucket the rest behind a "+N more" chip that opens
    // the existing detail drawer — never silently clipped, never scrolled.
    _fitLevels: ['', 'crowded', 'crowded-2'],
    fitClass(level) { return this._fitLevels[level] || ''; },

    recalcFit() {
      this._fitRaw();
      this._fitDiscovery();
      this._fitAnalysing();
      this._fitPrompts();
      this._fitGateway();
    },

    // generic offscreen probe: builds `.tier-body[bodyCls] > .flexlist > chips`
    // matching the real DOM shape so real CSS rules (incl. .crowded/.crowded-2)
    // apply during measurement.
    _probeFlatFits(items, nameFn, chipClass, bodyCls, width, avail, overflowCount) {
      const probe = document.createElement('div');
      probe.className = ('tier-body ' + bodyCls).trim();
      probe.style.cssText = `position:absolute; visibility:hidden; height:auto; width:${width}px;`;
      const list = document.createElement('div');
      list.className = 'flexlist';
      items.forEach(it => {
        const span = document.createElement('span');
        span.className = chipClass;
        span.textContent = nameFn(it);
        list.appendChild(span);
      });
      if (overflowCount > 0) {
        const wrap = document.createElement('span');
        wrap.className = 'overflow-chip-wrap';
        const chip = document.createElement('span');
        chip.className = 'chip overflow-chip mono';
        chip.textContent = '+' + overflowCount;
        wrap.appendChild(chip);
        list.appendChild(wrap);
      }
      probe.appendChild(list);
      document.body.appendChild(probe);
      const fits = probe.scrollHeight <= avail;
      document.body.removeChild(probe);
      return fits;
    },
    _fitFlatList(refEl, items, nameFn, chipClass) {
      if (!refEl || !items.length) return { level: 0, shown: items, hiddenCount: 0 };
      const avail = refEl.clientHeight;
      const width = refEl.clientWidth;
      for (let level = 0; level < this._fitLevels.length; level++) {
        if (this._probeFlatFits(items, nameFn, chipClass, this._fitLevels[level], width, avail, 0)) {
          return { level, shown: items, hiddenCount: 0 };
        }
      }
      const level = this._fitLevels.length - 1;
      let lo = 0, hi = items.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        const remaining = items.length - mid;
        if (this._probeFlatFits(items.slice(0, mid), nameFn, chipClass, this._fitLevels[level], width, avail, remaining)) lo = mid; else hi = mid - 1;
      }
      return { level, shown: items.slice(0, lo), hiddenCount: items.length - lo };
    },
    _fitRaw() {
      this.fit.raw = this._fitFlatList(this.$refs.rawTierBody, this.inboxRaw, r => r, 'chip raw-chip');
    },
    _fitDiscovery() {
      this.fit.discovery = this._fitFlatList(this.$refs.discoveryTierBody, this.inboxDiscovery, d => d.name, 'chip discovery-chip');
    },
    _fitAnalysing() {
      this.fit.analysing = this._fitFlatList(this.$refs.analysingTierBody, this.inboxAnalysing, a => a.name, 'chip analysing-chip');
    },
    _fitPrompts() {
      this.fit.prompts = this._fitFlatList(this.$refs.promptsTierBody, this.promptsList, p => p.name, 'chip mono prompt-chip');
    },

    // Gateway is hierarchical (pillar > aspect > FG), so instead of one flat
    // list we measure the WHOLE gateway tier at once, then — if even the
    // tightest shrink level still overflows — trim one FG at a time from
    // whichever aspect currently has the most FGs showing, re-measuring
    // after each trim, until it fits. Each aspect keeps its own hidden
    // bucket so "+N more" appears exactly where the trimmed FGs came from.
    _probeGateway(pillars, byKey, bodyCls, width, avail) {
      const probe = document.createElement('div');
      probe.className = ('tier-body gw-grid ' + bodyCls).trim();
      probe.style.cssText = `position:absolute; visibility:hidden; height:auto; width:${width}px;`;
      pillars.forEach(p => {
        const pDiv = document.createElement('div');
        pDiv.className = 'gw-pillar';
        const ph = document.createElement('div');
        ph.className = 'gw-ph';
        ph.textContent = p.name;
        pDiv.appendChild(ph);
        const aspectsWrap = document.createElement('div');
        aspectsWrap.className = 'gw-aspects';
        p.aspects.forEach(a => {
          const key = p.name + '/' + a.name;
          const cur = byKey[key];
          const aDiv = document.createElement('div');
          aDiv.className = 'gw-aspect';
          const ah = document.createElement('div');
          ah.className = 'gw-ah';
          ah.textContent = a.name;
          aDiv.appendChild(ah);
          const fgsDiv = document.createElement('div');
          fgsDiv.className = 'gw-fgs';
          cur.visible.forEach(fg => {
            const block = document.createElement('div');
            block.className = 'fg-block';
            const chip = document.createElement('span');
            chip.className = 'chip fg fg-chip';
            chip.textContent = fg.name;
            block.appendChild(chip);
            fgsDiv.appendChild(block);
          });
          if (cur.hiddenMeta.length) {
            const wrap = document.createElement('span');
            wrap.className = 'overflow-chip-wrap';
            const chip = document.createElement('span');
            chip.className = 'chip overflow-chip mono sm';
            chip.textContent = '+' + cur.hiddenMeta.length;
            wrap.appendChild(chip);
            fgsDiv.appendChild(wrap);
          }
          aDiv.appendChild(fgsDiv);
          aspectsWrap.appendChild(aDiv);
        });
        pDiv.appendChild(aspectsWrap);
        probe.appendChild(pDiv);
      });
      document.body.appendChild(probe);
      const fits = probe.scrollHeight <= avail;
      document.body.removeChild(probe);
      return fits;
    },
    _fitGateway() {
      const el = this.$refs.gatewayTierBody;
      // NOTE: gatewayPillars is a getter that manufactures brand-new fg
      // objects (with open:false) on every call — it's the same getter the
      // template's own x-for calls independently. So this local `pillars`
      // snapshot is ONLY used here to measure shapes/counts; we never store
      // these object refs for rendering (that's what broke fg.open before —
      // see aspectFit below).
      const pillars = this.gatewayPillars;
      if (!el || !pillars.length) { this.fit.gatewayLevel = 0; this.fit.gatewayAspects = {}; return; }
      const avail = el.clientHeight;
      const width = el.clientWidth;
      const byKey = {};
      pillars.forEach(p => p.aspects.forEach(a => {
        byKey[p.name + '/' + a.name] = { visible: a.fgs.slice(), hiddenMeta: [] };
      }));

      let level = 0, fits = false;
      for (; level < this._fitLevels.length; level++) {
        if (this._probeGateway(pillars, byKey, this._fitLevels[level], width, avail)) { fits = true; break; }
      }
      if (!fits) {
        level = this._fitLevels.length - 1;
        const cls = this._fitLevels[level];
        let guard = 0;
        while (!this._probeGateway(pillars, byKey, cls, width, avail) && guard < 300) {
          const keys = Object.keys(byKey);
          let biggestKey = null, biggestLen = 0;
          keys.forEach(k => { if (byKey[k].visible.length > biggestLen) { biggestLen = byKey[k].visible.length; biggestKey = k; } });
          if (!biggestKey) break; // every aspect is already down to 0 fgs — nothing left to trim
          byKey[biggestKey].hiddenMeta.unshift(byKey[biggestKey].visible.pop());
          guard++;
        }
      }
      // Only carry forward names + display metadata, never the fg objects
      // themselves — aspectFit() below filters the LIVE fgs array by name
      // instead, so a fg's `open` state (which lives on that live object)
      // survives every recalcFit(), including the one triggered right after
      // a user expands/collapses an fg.
      const result = {};
      Object.entries(byKey).forEach(([key, v]) => {
        result[key] = { hiddenNames: v.hiddenMeta.map(fg => fg.name), hiddenMeta: v.hiddenMeta };
      });
      this.fit.gatewayLevel = level;
      this.fit.gatewayAspects = result;
    },
    // read helpers used directly in the x-for templates — filter the LIVE
    // `fgs` array passed in from the template's own gatewayPillars() call,
    // rather than returning a stored snapshot, so click-to-expand state
    // (fg.open) is always the real live object, never a stale copy.
    aspectFit(pillarName, aspectName, fgs) {
      const f = this.fit.gatewayAspects[pillarName + '/' + aspectName];
      if (!f || !f.hiddenNames.length) return fgs;
      const hidden = new Set(f.hiddenNames);
      return fgs.filter(fg => !hidden.has(fg.name));
    },
    aspectOverflow(pillarName, aspectName) {
      const f = this.fit.gatewayAspects[pillarName + '/' + aspectName];
      return f ? f.hiddenNames.length : 0;
    },
    openTierOverflow(kind, pillarName, aspectName) {
      if (kind === 'discovery') {
        const shown = new Set(this.fit.discovery.shown);
        const hidden = this.inboxDiscovery.filter(d => !shown.has(d.name));
        this.detailDrawer = {
          open: true,
          title: `Discovery — ${hidden.length} more`,
          desc: "Didn't fit in the visible tier. Click any item below to inspect it.",
          items: hidden.map(d => ({ name: d.name, description: this.inboxDiscoveryMeta(d.name) })),
        };
      } else if (kind === 'analysing') {
        const shown = new Set(this.fit.analysing.shown);
        const hidden = this.inboxAnalysing.filter(a => !shown.has(a.name));
        this.detailDrawer = {
          open: true,
          title: `Analysing — ${hidden.length} more`,
          desc: "Didn't fit in the visible tier. Click any item below to inspect it.",
          items: hidden.map(a => ({ name: a.name, description: this.inboxAnalysingMeta(a.name) })),
        };
      } else if (kind === 'raw') {
        const shown = new Set(this.fit.raw.shown);
        const hidden = this.inboxRaw.filter(r => !shown.has(r));
        this.detailDrawer = {
          open: true,
          title: `Inbox — ${hidden.length} more`,
          desc: "Didn't fit in the visible tier. Click any item below to inspect it.",
          items: hidden.map(r => ({ name: r, description: this.inboxRawMeta(r) })),
        };
      } else if (kind === 'prompts') {
        const shown = new Set(this.fit.prompts.shown.map(p => p.fullName || p.name));
        const hidden = this.promptsList.filter(p => !shown.has(p.fullName || p.name));
        this.detailDrawer = {
          open: true,
          title: `${this.isOs ? 'OS Prompts' : 'Project Data'} — ${hidden.length} more`,
          desc: "Didn't fit in the visible tier. Click any item below to inspect it.",
          items: hidden.map(p => ({ name: p.name, description: p.role || p.when_to_use || '' })),
        };
      } else if (kind === 'gateway') {
        const f = this.fit.gatewayAspects[pillarName + '/' + aspectName];
        const hidden = f ? f.hiddenMeta : [];
        this.detailDrawer = {
          open: true,
          title: `${aspectName.replace(/_/g, ' ')} — ${hidden.length} more functional groups`,
          desc: `Pillar: ${pillarName.replace(/_/g, ' ')} — didn't fit in the visible tier.`,
          items: hidden.map(fg => ({ name: fg.name, description: `${fg.count} items — ${fg.path}` })),
        };
      }
    },
    // relative space each of the 3 tiers gets, driven by actual item counts
    // instead of a fixed 23% cap — a quiet week for Inbox no longer starves
    // Gateway of room it's actively short on, and vice versa.
    get tierWeights() {
      const counts = { raw: this.inboxRaw.length, prompts: this.promptsList.length,
                       discovery: this.inboxDiscovery.length, analysing: this.inboxAnalysing.length };
      const scores = {}; let total = 0;
      Object.entries(counts).forEach(([k, c]) => { scores[k] = Math.sqrt(c + 1); total += scores[k]; });
      const pct = {};
      Object.entries(scores).forEach(([k, s]) => { pct[k] = Math.min(42, Math.max(10, Math.round((s / total) * 70))); });
      return pct;
    },

    // ── data ──
    async loadConfig() {
      try {
        const c = await (await fetch('/api/config')).json();
        this.config = c;
        this.projects = Object.keys(c).filter(k => c[k] && typeof c[k] === 'object' && 'status' in c[k]);
        if (c.dashboard && c.dashboard.theme) this.theme = c.dashboard.theme;
        if (c.current_window && c.current_window !== this.entity) {
          this.entity = c.current_window;
          await this.switchEntity();
        }
      } catch (e) { console.error(e); }
    },
    async switchEntity() {
      this.isOs = this.entity === 'os';
      if (this.config && this.config.current_window !== this.entity) {
        this.patchConfig(['current_window'], this.entity);
      }
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
        this.$nextTick(() => { this.drawMissionRel(); this.drawFlowRel(); this.recalcFit(); });
        if (!this._relBound) {
          this._relBound = true;
          window.addEventListener('resize', () => { this.drawMissionRel(); this.drawFlowRel(); this.recalcFit(); });
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
        this.$nextTick(() => this.recalcFit());
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
    // fill_queue is now nested: top-level os_prompts/missions/toolboxes are flat
    // lists; inbox = {raw:[], gateway:[]}; runtime = {pillars:[], evolution_objectives:[]}.
    // Flatten into leaf group counts so the rest of the UI (metrics, badges) works unchanged.
    flatten_fq(fq) {
      const out = {};
      const walk = (node, prefix) => {
        if (!node) return;
        if (Array.isArray(node)) { out[prefix] = (out[prefix] || 0) + node.length; return; }
        if (typeof node === 'number') { out[prefix] = (out[prefix] || 0) + node; return; }
        if (typeof node === 'object') {
          Object.keys(node).forEach(k => walk(node[k], prefix ? `${prefix}.${k}` : k));
        }
      };
      walk(fq, '');
      return out;
    },
    get fq() {
      return this.flatten_fq(this.runtime.fill_queue || {});
    },
    get fqTotal() { return Object.values(this.fq).reduce((a, b) => a + (b || 0), 0); },
    // Full, flattened fill_queue for the expanded panel: [{group, text}, ...]
    get fqItems() {
      const out = [];
      const walk = (node, prefix) => {
        if (!node) return;
        if (Array.isArray(node)) {
          node.forEach(x => out.push({ group: prefix, text: String(x) }));
        } else if (typeof node === 'object') {
          Object.keys(node).forEach(k => walk(node[k], prefix ? `${prefix}.${k}` : k));
        }
      };
      walk(this.runtime.fill_queue || {}, '');
      return out;
    },
    // ── review_queue / backlog (merged with feedback) ──
    // New shape: [{item, feedback}] (feedback may be '' / undefined).
    get rq() { return (this.runtime.review_queue || []).map(e => (typeof e === 'string' ? e : (e && e.item) || '')); },
    get bl() { return (this.runtime.backlog || []).map(e => (typeof e === 'string' ? e : (e && e.item) || '')); },
    get rqFeedback() {
      const m = {};
      (this.runtime.review_queue || []).forEach(e => { if (e && typeof e === 'object' && e.item) m[e.item] = e.feedback || ''; });
      return m;
    },
    get blFeedback() {
      const m = {};
      (this.runtime.backlog || []).forEach(e => { if (e && typeof e === 'object' && e.item) m[e.item] = e.feedback || ''; });
      return m;
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
    // DISCOVERY tier — drops the daemon has snapshotted + written a full tree for.
    // Source of truth for item decisions; not yet promoted into `raw`.
    get inboxDiscovery() {
      const d = this.inbox.discovery || {};
      return Object.keys(d).filter(k => k !== 'freshness').map(name => {
        const v = d[name] || {};
        // count files at any depth from the nested tree
        let files = 0;
        const walk = (node) => { if (Array.isArray(node)) files += node.length; else if (node && typeof node === 'object') Object.values(node).forEach(walk); };
        walk(v.tree);
        return { name, drop: v.drop || name, status: v.status || '?', files };
      });
    },
    // ANALYSING tier — items with merged per-member records (raw_path + gateway_path
    // + semantics + status). Each member file carries its own progress.
    get inboxAnalysing() {
      const a = this.inbox.analysing || {};
      return Object.keys(a).filter(k => k !== 'freshness').map(name => {
        const v = a[name] || {};
        const members = v.members && typeof v.members === 'object' ? Object.entries(v.members) : [];
        const counts = { pending: 0, routed: 0, rejected: 0, dupe: 0 };
        members.forEach(([, m]) => { const s = (m && m.status) || 'pending'; if (s in counts) counts[s]++; });
        return {
          name,
          drop: v.drop || '?',
          status: v.status || 'needs_semantics',
          disposition: v.disposition || '',
          members: members.map(([p, m]) => ({ path: p, raw_path: (m && m.raw_path) || p, gateway_path: (m && m.gateway_path) || '', status: (m && m.status) || 'pending' })),
          counts,
        };
      });
    },
    get inboxAnalysingCount() { return this.inboxAnalysing.length; },
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
      const paths = (item.paths || []).join(', ');
      return `drop: ${item.drop || '?'}\npaths: ${paths || '—'}\nstatus: ${item.status || '?'}`;
    },
    inboxDiscoveryMeta(d) {
      const item = (this.inbox.discovery || {})[d] || {};
      const files = (this.inboxDiscovery.find(x => x.name === d) || {}).files || 0;
      return `drop: ${item.drop || d}\nstatus: ${item.status || '?'}\nfiles in tree: ${files}\nsource of truth for item decisions`;
    },
    inboxAnalysingMeta(a) {
      const item = this.inboxAnalysing.find(x => x.name === a);
      if (!item) return '—';
      const c = item.counts;
      return `drop: ${item.drop}\nstatus: ${item.status}\nmembers: ${item.members.length} (pending ${c.pending} / routed ${c.routed} / rejected ${c.rejected} / dupe ${c.dupe})`;
    },
    mTags(m) {
      // Each tag now carries a `kind` (type / dep / alert) instead of being a
      // bare string, so the card template can style dependency chips and the
      // needs-tasks alert distinctly instead of guessing from text content.
      const tags = [];
      const t = (m.name.split(/[_\- ]/)[0] || '').toLowerCase();
      if (t) tags.push({ text: t, kind: 'type' });
      const dep = (m.raw && m.raw.depends_on) || [];
      if (Array.isArray(dep)) dep.forEach(d => tags.push({ text: '→ ' + d, kind: 'dep' }));
      // agent-task-generation flag (Hard Law): daemon flags, never writes tasks
      if (this.missionNeedsTasks(m.name)) tags.push({ text: '⚠ needs tasks', kind: 'alert' });
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
      // k may be a nested path like 'inbox.gateway' or 'runtime.pillars'
      const fq = this.runtime.fill_queue || {};
      let v = fq;
      for (const part of k.split('.')) {
        if (v && typeof v === 'object' && part in v) v = v[part];
        else { v = undefined; break; }
      }
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
      if (missions.analytics) push(missions.analytics, 'analytics');
      ['FAST', 'DEEP', 'RESEARCH', 'INBOX', 'ANALYTICS'].forEach(t => push(missions.evolution && missions.evolution[t], 'evolution:' + t));
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
    // Average progress % for a list of missions — used by the Planning /
    // Execution column headers so the board gives a glance-level sense of
    // how far along each lane is, not just a raw card count.
    avgPct(list) {
      if (!list || !list.length) return 0;
      return Math.round(list.reduce((s, m) => s + (m.pct || 0), 0) / list.length);
    },
    // Color-index legend for the mission relational map (ported from App.tsx / .os-archive)
    // Groups missions by the current relGroup and returns a stable color per
    // group, with `active` reflecting the same hover-dim state as the canvas
    // trace lines (drawMissionRel) so the DOM legend bar stays in sync with
    // what's currently highlighted, without the canvas ever drawing text.
    get missionRelLegend() {
      const palette = ['#f2a93b', '#1a8c7b', '#e0556b', '#5a7fd6', '#9b59b6', '#27ae60', '#e67e22', '#16a085', '#d9534f', '#3a8ed6'];
      const mode = this.relGroup;
      const activeCard = this.relHover;
      if (mode === 'depends_on') return [{ color: '#5a7fd6', label: 'depends_on (mission links)', active: true }];
      const all = (this.missions || []).concat(this.archivedMissions || []);
      const byName = {}; all.forEach(m => { byName[m.name] = m; });
      const groups = {};
      all.forEach(m => {
        let keys = [];
        if (mode === 'source') { const s = (m.raw && m.raw.sources) || []; keys = Array.isArray(s) ? s.map(x => 'src:' + x) : []; }
        else if (mode === 'klass') keys = [m.klass];
        else if (mode === 'model') keys = [m.model];
        else keys = [m.type ? m.type : m.model];
        keys.forEach(k => { (groups[k] = groups[k] || []).push(m.name); });
      });
      const keys = Object.keys(groups).filter(k => groups[k].length >= 2);
      const hoveredKey = activeCard ? (() => {
        const m = byName[activeCard]; if (!m) return null;
        if (mode === 'source') { const s = (m.raw && m.raw.sources) || []; return s.length ? 'src:' + s[0] : null; }
        if (mode === 'klass') return m.klass;
        if (mode === 'model') return m.model;
        return m.type ? m.type : m.model;
      })() : null;
      return keys.slice(0, 6).map((k, i) => ({
        color: palette[i % palette.length],
        label: (k.length > 18 ? k.slice(0, 17) + '…' : k) + ' (' + groups[k].length + ')',
        active: !activeCard || hoveredKey === k
      }));
    },
    // Color-index legend for the Sources & Flow pillar map — same DOM-chip
    // pattern as missionRelLegend above (ported so both sections read the
    // same way). One chip per gateway pillar, dimmed unless it's the pillar
    // of the currently hovered chip (raw / fg / prompt), matching the
    // highlight state drawFlowRel already computes for the canvas links.
    get flowLegend() {
      const pal = this.pillarPalette || {};
      const keys = Object.keys(pal);
      const hoverItem = this.flowHover;
      let hoveredPillar = null;
      if (hoverItem) {
        if (hoverItem.includes('/')) {
          // fg path is "pillar/aspect/fg"
          hoveredPillar = hoverItem.split('/')[0];
        } else if (this.inboxPillarMap && this.inboxPillarMap[hoverItem]) {
          // raw chip name -> resolved pillar (when unambiguous)
          hoveredPillar = this.inboxPillarMap[hoverItem];
        } else {
          // prompt chip name -> heuristic pillar match
          hoveredPillar = this.promptPillar(hoverItem);
        }
      }
      return keys.map(p => ({
        color: pal[p],
        label: p.replace(/_/g, ' '),
        active: !hoverItem || hoveredPillar === p
      }));
    },
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
        else if (ms.evolution) for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX', 'ANALYTICS']) if (ms.evolution[mode] && ms.evolution[mode][name]) { src = ['evolution', mode, name]; break; }
      }
      if (!src) return;
      if (klass === 'ARCHIVE') {
        const cat = 'completed';
        const built = this.findMissionRaw(name);
        if (!built) return;
        try {
          await fetch(`/api/entity/${this.entity}/patch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'missions', path: ['archived', cat, name], value: built }) });
          await fetch(`/api/entity/${this.entity}/patch`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: 'missions', op: 'delete', path: src }) });
          await this.refreshData();
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
          await this.refreshData();
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
        // analytics
        _subject: raw.subject || '', _scope: (typeof raw.scope === 'string' || Array.isArray(raw.scope)) ? raw.scope : (raw.scope || 'none'),
        _aspects: (typeof raw.aspects === 'string' || Array.isArray(raw.aspects)) ? raw.aspects : (raw.aspects || 'all'),
        _methodology: raw.analysis_methodology || '',
        // sub-collections
        _goals: clone(raw.goals), _tasks: clone(raw.tasks),
        _topics: clone(raw.topics), _cases: clone(raw.cases), _findings: clone(raw.findings),
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
      if (model === 'analytics') {
        if (am._subject) out.subject = am._subject;
        if (am._scope) out.scope = am._scope;
        out.aspects = am._aspects;
        if (am._methodology) out.analysis_methodology = am._methodology;
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
        for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX', 'ANALYTICS']) if (msRaw.evolution[mode] && msRaw.evolution[mode][am.name]) { bucket = ['evolution', mode, am.name]; break; }
      }
      if (!bucket) { ms.status = 'error'; ms.msg = 'Mission not found'; return; }
      try {
        const res = await fetch(`/api/entity/${this.entity}/patch`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: 'missions', path: bucket, value: built }),
        });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || 'patch rejected');
        await this.refreshData();
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
        for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX', 'ANALYTICS']) if (msRaw.evolution[mode] && msRaw.evolution[mode][am.name]) { bucket = ['evolution', mode, am.name]; break; }
      }
      if (!bucket) { ms.status = 'error'; ms.msg = 'Mission not found'; return; }
      try {
        const res = await fetch(`/api/entity/${this.entity}/patch`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: 'missions', op: 'delete', path: bucket }),
        });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || 'delete rejected');
        await this.refreshData();
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
        findings: [
          { k: 'insight', l: 'Insight', t: 'ta' },
          { k: 'evidence', l: 'Evidence', t: 'ta' },
          { k: 'metric', l: 'Metric', t: 'ta' },
          { k: 'recommendation', l: 'Recommendation', t: 'ta' },
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
      if (model === 'analytics') return ['findings'];
      return ['goals', 'tasks'];
    },
    missionSubTitle(subKey) {
      return { goals: 'Goals', tasks: 'Tasks', topics: 'Topics', cases: 'Cases', findings: 'Findings' }[subKey] || subKey;
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
        await this.refreshData();
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
    async restartDaemon() {
      try {
        const res = await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cmd: 'restart_daemon' })
        });
        const j = await res.json();
        if (!j.ok) console.error('restart failed:', j.error);
        else console.log('daemon restart command sent');
      } catch (e) { console.error('restart failed', e); }
    },
    async shutdownDaemon() {
      await this.patchConfig(['sync_daemon'], false);
    },
    async shutdownDashboard() {
      await this.patchConfig(['dashboard', 'enabled'], false);
    },

    // ── review_queue editable W-list ──
    addRqItem() {
      const n = (this.newRqItem || '').trim(); if (!n) return;
      const list = (this.runtime.review_queue || []).map(e => (typeof e === 'string') ? e : (e && e.item) || '');
      list.push(n);
      this.patch('runtime', ['review_queue'], list);
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
      // Merge feedback into the merged review_queue: [{item, feedback}]
      const list = (this.runtime.review_queue || []).map(e => {
        const it = (typeof e === 'string') ? e : (e && e.item) || '';
        return it === item ? { item, feedback: (feedback || '').trim() } : e;
      });
      try {
        await this.patch('runtime', ['review_queue'], list);
        this._reviewBaseline = feedback || '';
        this.reviewSave = { status: 'saved', msg: 'Saved ✓' };
      } catch (e) { this.reviewSave = { status: 'error', msg: 'Save failed' }; }
    },
    // Delete = remove the item (and its feedback) from the merged review_queue.
    async deleteReview() {
      const { index, item } = this.reviewModal;
      if (!confirm(`Delete review item "${item}"? This removes it from the queue.`)) return;
      const list = (this.runtime.review_queue || []).filter(e => {
        const it = (typeof e === 'string') ? e : (e && e.item) || '';
        return it !== item;
      });
      try {
        await this.patch('runtime', ['review_queue'], list);
        this.reviewModal.open = false;
      } catch (e) { console.error('deleteReview failed', e); }
    },
    // ── backlog editable W-list ──
    addBlItem() {
      const n = (this.newBlItem || '').trim(); if (!n) return;
      const list = (this.runtime.backlog || []).map(e => (typeof e === 'string') ? e : (e && e.item) || '');
      list.push(n);
      this.patch('runtime', ['backlog'], list);
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
      const list = (this.runtime.backlog || []).map(e => {
        const it = (typeof e === 'string') ? e : (e && e.item) || '';
        return it === item ? { item, feedback: (feedback || '').trim() } : e;
      });
      try {
        await this.patch('runtime', ['backlog'], list);
        this._blBaseline = feedback || '';
        this.blSave = { status: 'saved', msg: 'Saved ✓' };
      } catch (e) { this.blSave = { status: 'error', msg: 'Save failed' }; }
    },
    // Delete = remove the item (and its feedback) from the merged backlog.
    async deleteBlReview() {
      const { index, item } = this.blModal;
      if (!confirm(`Delete backlog item "${item}"? This removes it from the backlog.`)) return;
      const list = (this.runtime.backlog || []).filter(e => {
        const it = (typeof e === 'string') ? e : (e && e.item) || '';
        return it !== item;
      });
      try {
        await this.patch('runtime', ['backlog'], list);
        this.blModal.open = false;
      } catch (e) { console.error('deleteBlReview failed', e); }
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
      const model = bucket === 'analytics' ? 'analytics' : (bucket === 'standard' ? 'standard' : (bucket === 'research' ? 'research' : 'evolution'));
      const obj = {
        model,
        objective: this.newMission.objective || '(set objective)',
        priority: this.newMission.priority || 'MEDIUM',
        state: { class: 'PLANNING', progress: 'pending' },
        readiness: { ready_to_advance: false },
        rounds: { status: false, persistent: false, max: 1 },
      };
      // analytics + evolution missions need a canonical proposal_name
      if (model === 'analytics' || model === 'evolution') obj.proposal_name = nm;
      // analytics missions need an analysis_methodology (generic default)
      if (model === 'analytics') obj.analysis_methodology = 'progress / bottleneck / value / risk';
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
      for (const top of ['standard', 'research', 'analytics']) {
        if (ms[top] && ms[top][name]) return ms[top][name];
      }
      if (ms.evolution) {
        for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX', 'ANALYTICS']) {
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
      for (const top of ['standard', 'research', 'analytics']) if (ms[top] && ms[top][name]) return [top, name, ...leaf.split('.')];
      for (const mode of ['FAST', 'DEEP', 'RESEARCH', 'INBOX', 'ANALYTICS']) if (ms.evolution && ms.evolution[mode] && ms.evolution[mode][name]) return ['evolution', mode, name, ...leaf.split('.')];
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
        await this.refreshData();
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
    drawMissionRel(offset = 0) {
      const cv = document.getElementById('mission-rel'); if (!cv) return;
      const pane = cv.parentElement;
      const dpr = window.devicePixelRatio || 1;
      const W = pane.clientWidth, H = pane.clientHeight;
      if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const cards = [...pane.querySelectorAll('.mcard')];
      if (!cards.length) return;
      const cr0 = cv.getBoundingClientRect();
      
      // rectOf tracks the card's LIVE bounding footprint (never a cached/static
      // coordinate) plus the right edge of its OWN mission column — that column
      // edge is the safe "margin gutter" loopback lines route into so they never
      // cross over foreground card content.
      const rectOf = c => {
        const r = c.getBoundingClientRect();
        const col = c.closest('.ms-col');
        const colR = col ? col.getBoundingClientRect() : null;
        return {
          left: r.left - cr0.left,
          right: r.right - cr0.left,
          cx: r.left - cr0.left + r.width / 2,
          cy: r.top - cr0.top + r.height / 2,
          width: r.width,
          height: r.height,
          colRight: colR ? (colR.right - cr0.left) : (r.right - cr0.left + 16)
        };
      };

      // Guard: if a card is scrolled off-screen, skip drawing lines to it.
      const isVisible = rect => rect.cy >= 0 && rect.cy <= H && rect.left >= -10 && rect.right <= W + 10;

      const klassOrder = { PLANNING: 0, EXECUTION: 1, ARCHIVE: 2 };
      const byName = {};
      [...this.missions, ...this.archivedMissions].forEach(m => { byName[m.name] = m; });
      const mode = this.relGroup;

      // ── Lane-stacking for same-column loopbacks ──
      // Every loopback that shares a column's margin gutter gets its own lane
      // (offset a few px further out) so parallel traces stack in order
      // instead of drawing directly on top of one another.
      const gutterLanes = {};
      const laneStep = 3.2, maxGutterExtra = 15;
      const nextLane = colRight => {
        const key = Math.round(colRight);
        const lane = gutterLanes[key] || 0;
        gutterLanes[key] = lane + 1;
        return lane;
      };

      // Draw trace helper. `colRight` (right edge of the source card's own
      // .ms-col) is only used for the same-column loopback case — it anchors
      // the gutter to the real column margin instead of a fixed card-relative
      // offset, so the line never drifts onto a neighboring card.
      const drawTrace = (xA, yA, xB, yB, color, active, colRight) => {
        const sameColumn = Math.abs(xA - xB) < 40;
        const radius = 8;
        const midX = (xA + xB) / 2;
        const signY = Math.sign(yB - yA);
        let gutterX = null;
        if (sameColumn) {
          const base = colRight != null ? colRight : Math.max(xA, xB) + 6;
          const lane = nextLane(base);
          gutterX = Math.min(base + 6 + lane * laneStep, base + maxGutterExtra);
        }
        const r = sameColumn ? 0 : Math.min(radius, Math.abs(xB - xA) / 2, Math.abs(yB - yA) / 2);

        const buildPath = () => {
          ctx.moveTo(xA, yA);
          if (sameColumn) {
            ctx.lineTo(gutterX - radius, yA);
            ctx.arcTo(gutterX, yA, gutterX, yA + signY * radius, radius);
            ctx.lineTo(gutterX, yB - signY * radius);
            ctx.arcTo(gutterX, yB, gutterX - radius, yB, radius);
            ctx.lineTo(xB, yB);
          } else {
            if (r > 0 && Math.abs(yB - yA) > 4) {
              ctx.lineTo(midX - r, yA);
              ctx.arcTo(midX, yA, midX, yA + signY * r, r);
              ctx.lineTo(midX, yB - signY * r);
              ctx.arcTo(midX, yB, midX + r, yB, r);
            }
            ctx.lineTo(xB, yB);
          }
        };

        ctx.strokeStyle = color;
        ctx.lineWidth = active ? 2.8 : 1.2;
        ctx.globalAlpha = active ? 0.9 : 0.15;
        ctx.beginPath();
        buildPath();
        ctx.stroke();

        // Draw animated flow pulses
        if (active) {
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3.2;
          ctx.globalAlpha = 0.95;
          ctx.setLineDash([4, 12]);
          ctx.lineDashOffset = -offset;
          ctx.beginPath();
          buildPath();
          ctx.stroke();
          ctx.restore();

          // Draw arrowhead at target card edge. Loopbacks always re-enter
          // their column from the gutter on the right, so the arrow always
          // points left-into-card regardless of the (near-identical) xA/xB.
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          const arriveFromRight = sameColumn ? true : (xA >= xB);
          if (arriveFromRight) {
            ctx.moveTo(xB + 6, yB - 4);
            ctx.lineTo(xB, yB);
            ctx.lineTo(xB + 6, yB + 4);
          } else {
            ctx.moveTo(xB - 6, yB - 4);
            ctx.lineTo(xB, yB);
            ctx.lineTo(xB - 6, yB + 4);
          }
          ctx.fill();
        }
      };

      const palette = ['#f2a93b', '#1a8c7b', '#e0556b', '#5a7fd6', '#9b59b6', '#27ae60', '#e67e22', '#16a085', '#d9534f', '#3a8ed6'];
      const activeCard = this.relHover;
      
      if (mode === 'depends_on') {
        // --- Dependency-based mapping ---
        // Render dependencies based on card.depends_on
        cards.forEach(c => {
          const name = c.getAttribute('data-name');
          const m = byName[name]; if (!m) return;
          const deps = m.depends_on || [];
          const isCurrentActive = activeCard === name;
          
          deps.forEach(depName => {
            const depCardEl = cards.find(el => el.getAttribute('data-name') === depName);
            if (!depCardEl) return;
            const rA = rectOf(depCardEl);
            const rB = rectOf(c);
            // Skip if either card is scrolled out of view
            if (!isVisible(rA) || !isVisible(rB)) return;
            const isActive = isCurrentActive || activeCard === depName || !activeCard;

            // Connect RIGHT edge of source to LEFT edge of target (or flip if reversed)
            let x0, y0, x1, y1;
            if (rA.cx < rB.cx) {
              x0 = rA.right; y0 = rA.cy;   // depart from right border of A
              x1 = rB.left;  y1 = rB.cy;   // arrive at left border of B
            } else {
              x0 = rA.left;  y0 = rA.cy;   // depart from left border of A
              x1 = rB.right; y1 = rB.cy;   // arrive at right border of B
            }
            
            drawTrace(x0, y0, x1, y1, '#5a7fd6', isActive, rA.colRight);
          });
        });
        // Legend now lives in the DOM (.rel-legend-bar below the board, driven
        // by the missionRelLegend getter) — not drawn on canvas.
      } else {
        // --- Group-based attribute mapping (type/model/class/source) ---
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

        const keys = Object.keys(groups).filter(k => groups[k].length >= 2);
        const hoveredKey = activeCard ? (() => {
          const m = byName[activeCard]; if (!m) return null;
          if (mode === 'source') { const s = (m.raw && m.raw.sources) || []; return s.length ? 'src:' + s[0] : null; }
          if (mode === 'klass') return m.klass;
          if (mode === 'model') return m.model;
          return m.type ? m.type : m.model;
        })() : null;

        keys.forEach((k, i) => {
          const list = groups[k];
          const isGroupActive = !activeCard || hoveredKey === k;
          const color = palette[i % palette.length];
          
          // Sort cards Planning -> Execution -> Archive
          const pts = list.map(c => ({ el: c, rect: rectOf(c), name: c.getAttribute('data-name') }))
            .sort((a, b) => (klassOrder[byName[a.name] ? byName[a.name].klass : ''] ?? 9) - (klassOrder[byName[b.name] ? byName[b.name].klass : ''] ?? 9));
          
          for (let j = 0; j < pts.length - 1; j++) {
            const ptA = pts[j], ptB = pts[j + 1];
            // Skip if either card is out of visible area (scrolled)
            if (!isVisible(ptA.rect) || !isVisible(ptB.rect)) continue;
            
            let x0, y0, x1, y1;
            if (ptA.rect.cx < ptB.rect.cx) {
              x0 = ptA.rect.right; y0 = ptA.rect.cy;  // right border → left border
              x1 = ptB.rect.left;  y1 = ptB.rect.cy;
            } else {
              x0 = ptA.rect.left;  y0 = ptA.rect.cy;  // left border → right border
              x1 = ptB.rect.right; y1 = ptB.rect.cy;
            }
            
            const isLinkActive = isGroupActive && (!activeCard || activeCard === ptA.name || activeCard === ptB.name);
            drawTrace(x0, y0, x1, y1, color, isLinkActive, ptA.rect.colRight);
          }
        });

        // Legend now lives in the DOM (.rel-legend-bar below the board, driven
        // by the missionRelLegend getter) — not drawn on canvas.
      }
    },
    relMove(e) {
      const cv = document.getElementById('mission-rel'); if (!cv) return;
      const r = cv.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cards = [...cv.parentElement.querySelectorAll('.mcard')];
      let hit = null;
      for (const c of cards) {
        const cr = c.getBoundingClientRect();
        if (x >= cr.left - r.left && x <= cr.right - r.left && y >= cr.top - r.top && y <= cr.bottom - r.top) {
          hit = c.getAttribute('data-name');
          break;
        }
      }
      this.relHover = hit;
    },
    relLeave() {
      this.relHover = null;
    },
    // ══ FLOW MAP: Sankey-style flow (ribbon width = real item volume) ══
    // NEW LOGIC: a supply-chain flow, not a node tree. Raw inbox sources ->
    // gateway pillars -> OS prompt destinations, where each ribbon's thickness
    // is proportional to the number of items moving through it (so you SEE
    // throughput, not just structure). Hover a ribbon/node to dim the rest
    // and read the volume. Click a prompt node to open it.
    drawFlowRel(offset = 0) {
      // Find canvas inside the Sources & Flow pane
      const cv = document.getElementById('flow-rel');
      if (!cv) return;
      // The canvas parent must be the .pane or .src-stack container
      const container = cv.parentElement;
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      const W = container.clientWidth;
      const H = container.clientHeight;

      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
        cv.style.width = W + 'px';
        cv.style.height = H + 'px';
      }

      const ctx = cv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Get canvas bounding rect (its top-left in screen coords)
      const cr0 = cv.getBoundingClientRect();

      // Helper: convert element screen rect → canvas-local coords
      // Returns null if the element is outside the canvas visible area
      const chipRect = el => {
        const r = el.getBoundingClientRect();
        const left   = r.left   - cr0.left;
        const right  = r.right  - cr0.left;
        const top    = r.top    - cr0.top;
        const bottom = r.bottom - cr0.top;
        const cy     = (top + bottom) / 2;
        // Reject if element is fully outside canvas bounds
        if (right < 0 || left > W || bottom < 0 || top > H) return null;
        return { left, right, top, bottom, cy, cx: (left + right) / 2 };
      };

      // Collect all chip elements currently in the DOM
      const rawEls    = [...container.querySelectorAll('.raw-chip')];
      const fgEls     = [...container.querySelectorAll('.fg-chip')];
      const promptEls = [...container.querySelectorAll('.prompt-chip')];

      const hoverItem = this.flowHover; // null when nothing hovered
      const raw = (this.inbox && this.inbox.raw) || {};

      // ── Vertical channel geometry ──
      // Inbox / Gateway / Prompts are 3 STACKED rows (.src-tier, column flow),
      // not side-by-side columns — so routing should travel through the clear
      // horizontal gaps BETWEEN those rows, never diagonally across a row's
      // own chip content. We read the live rects of the 3 tiers each frame
      // and route every link: down out of the source row -> across the gap
      // channel -> down into the target row.
      const tierEls = [...container.querySelectorAll('.src-tier')];
      const tierBand = el => { const r = el.getBoundingClientRect(); return { top: r.top - cr0.top, bottom: r.bottom - cr0.top }; };
      const rawTierR = tierEls[0] ? tierBand(tierEls[0]) : null;
      const gwTierR  = tierEls[1] ? tierBand(tierEls[1]) : null;
      const prTierR  = tierEls[2] ? tierBand(tierEls[2]) : null;
      // Channel Y = midpoint of the gap between two stacked tiers
      const channelRawGw = (rawTierR && gwTierR) ? (rawTierR.bottom + gwTierR.top) / 2 : null;
      const channelGwPr  = (gwTierR && prTierR)  ? (gwTierR.bottom + prTierR.top) / 2  : null;

      // Fan each pillar's traffic out to its own lane within the channel so
      // parallel pillar flows read as distinct parking lanes instead of one
      // overlapping horizontal smear.
      const pillarKeys = Object.keys(this.pillarPalette || {});
      const pillarLaneOffset = name => {
        const idx = pillarKeys.indexOf(name);
        if (idx < 0 || pillarKeys.length <= 1) return 0;
        const mid = (pillarKeys.length - 1) / 2;
        return (idx - mid) * 3;
      };

      // Draw a channel-routed link from (xA, yA) [source row, exits its
      // BOTTOM edge] to (xB, yB) [target row, enters its TOP edge], via the
      // horizontal gap channel at channelY. Falls back to a direct bezier
      // only if the tier geometry couldn't be read (defensive, shouldn't
      // normally happen since the 3 tiers are always in the DOM together).
      const drawLink = (xA, yA, xB, yB, color, active, channelY) => {
        const alpha = active ? 0.75 : 0.08;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = active ? 2.0 : 1.0;
        ctx.setLineDash([]);

        const buildPath = () => {
          ctx.moveTo(xA, yA);
          if (channelY == null) {
            // Fallback: no tier geometry — direct S-curve so something still draws
            const cpOffset = Math.abs(xB - xA) * 0.45;
            ctx.bezierCurveTo(xA + cpOffset, yA, xB - cpOffset, yB, xB, yB);
            return;
          }
          const cornerR = Math.min(6, Math.abs(channelY - yA), Math.abs(yB - channelY), Math.abs(xB - xA) / 2);
          if (cornerR > 1) {
            const signH = Math.sign(xB - xA) || 1;
            ctx.lineTo(xA, channelY - cornerR);
            ctx.arcTo(xA, channelY, xA + signH * cornerR, channelY, cornerR);
            ctx.lineTo(xB - signH * cornerR, channelY);
            ctx.arcTo(xB, channelY, xB, channelY + cornerR, cornerR);
            ctx.lineTo(xB, yB);
          } else {
            // Not enough vertical room to round — sharp Manhattan bend,
            // still routed cleanly through the channel gap.
            ctx.lineTo(xA, channelY);
            ctx.lineTo(xB, channelY);
            ctx.lineTo(xB, yB);
          }
        };

        ctx.beginPath();
        buildPath();
        ctx.stroke();

        // Draw animated marching dashes on active links
        if (active && offset !== undefined) {
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.9;
          ctx.setLineDash([3, 10]);
          ctx.lineDashOffset = -offset;
          ctx.beginPath();
          buildPath();
          ctx.stroke();
          ctx.restore();
        }

        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      };

      // ── Step 1: raw → fg connections ──
      // For each fg chip, look at its data-path and items to find which raw dir it came from
      this.gatewayPillars.forEach(pillar => {
        const pColor = this.pillarColor(pillar.name);
        pillar.aspects.forEach(aspect => {
          aspect.fgs.forEach(fg => {
            // Find this fg's chip in the DOM
            const fgEl = fgEls.find(el => el.getAttribute('data-path') === fg.path || el.getAttribute('data-name') === fg.name);
            if (!fgEl) return;
            const rFG = chipRect(fgEl);
            if (!rFG) return; // not visible — skip

            // Find which raw dir this fg's items came from
            const matchedRaws = new Set();
            fg.items.forEach(itemName => {
              Object.entries(raw).forEach(([rawName, rawInfo]) => {
                if (rawName === 'freshness') return;
                const contains = (rawInfo.contains || []);
                // Match if any contained file name overlaps with the item name
                const matched = contains.some(c =>
                  c === itemName ||
                  c.toLowerCase().includes(itemName.toLowerCase()) ||
                  itemName.toLowerCase().includes(c.toLowerCase())
                );
                if (matched) matchedRaws.add(rawName);
              });
              // Fallback: match via fg path containing rawName
              if (matchedRaws.size === 0) {
                Object.keys(raw).forEach(rawName => {
                  if (rawName === 'freshness') return;
                  if (fg.path && fg.path.toLowerCase().includes(rawName.toLowerCase())) {
                    matchedRaws.add(rawName);
                  }
                });
              }
            });

            matchedRaws.forEach(rawName => {
              const rawEl = rawEls.find(el => el.getAttribute('data-name') === rawName);
              if (!rawEl) return;
              const rRaw = chipRect(rawEl);
              if (!rRaw) return; // not visible

              const isActive = !hoverItem || hoverItem === rawName || hoverItem === fg.path || hoverItem === fg.name;
              // Raw chip is on the LEFT, fg chip is in the middle → draw right-edge of raw to left-edge of fg
              drawLink(rRaw.right, rRaw.cy, rFG.left, rFG.cy, pColor, isActive);
            });

            // ── Step 2: fg → prompt connections ──
            const pKey = pillar.name.toLowerCase().replace(/_/g, ' ');
            const aKey = aspect.name.toLowerCase();
            const fgKey = fg.name.toLowerCase().replace(/_/g, ' ');

            promptEls.forEach(prEl => {
              const prName = prEl.getAttribute('data-name') || '';
              const pr = this.promptsList.find(p => (p.fullName || p.name) === prName || p.name === prName);
              if (!pr) return;

              const rPR = chipRect(prEl);
              if (!rPR) return; // not visible

              const role = (pr.role || '').toLowerCase();
              const name = (pr.name || '').toLowerCase();
              const path = (pr.path || '').toLowerCase();

              // Match if prompt's role or path relates to this pillar OR fg group
              const matchesPillar = role.includes(pKey) || path.includes(pKey.replace(/ /g, '_'));
              const matchesFG = role.includes(fgKey) || name.includes(fgKey) || fgKey.includes(name);
              const matchesAspect = role.includes(aKey);

              const isMatch = matchesPillar || matchesFG || matchesAspect;
              if (!isMatch) return;

              const isActive = !hoverItem || hoverItem === fg.path || hoverItem === fg.name || hoverItem === prName;
              // FG chip is in the middle, prompt chip is on the right → right-edge of fg to left-edge of prompt
              drawLink(rFG.right, rFG.cy, rPR.left, rPR.cy, pColor, isActive);
            });
          });
        });
      });

      // Flow legend (pillar color index) now lives in the DOM (.rel-legend-bar
      // below the src-stack, driven by the flowLegend getter) — not drawn on
      // canvas, same reasoning as the Missions relation legend: real DOM
      // chips stay crisp/legible at any zoom instead of tiny canvas text.
    },
    openNodeDrawer(id) {
      if (id.startsWith('disc:')) {
        const name = id.replace('disc:', '');
        const d = this.inboxDiscovery.find(x => x.name === name) || {};
        const tree = (this.inbox.discovery || {})[name] || {};
        const files = [];
        const walk = (node, prefix) => {
          if (Array.isArray(node)) node.forEach(f => files.push({ name: prefix ? prefix + '/' + f : f }));
          else if (node && typeof node === 'object') Object.entries(node).forEach(([k, v]) => walk(v, prefix ? prefix + '/' + k : k));
        };
        walk(tree.tree, '');
        this.detailDrawer = {
          open: true,
          title: `Discovery: ${name}`,
          desc: `drop: ${d.drop || name}\nstatus: ${d.status || '?'}\n${files.length} files snapshotted`,
          items: files
        };
      } else if (id.startsWith('an:')) {
        const name = id.replace('an:', '');
        const a = this.inboxAnalysing.find(x => x.name === name) || {};
        this.detailDrawer = {
          open: true,
          title: `Analysing: ${name}`,
          desc: `drop: ${a.drop || '?'}\nstatus: ${a.status || '?'}${a.disposition ? '\ndisposition: ' + a.disposition : ''}`,
          items: (a.members || []).map(m => ({ name: m.path, description: `status: ${m.status}\nraw_path: ${m.raw_path}\ngateway_path: ${m.gateway_path || '—'}` }))
        };
      } else if (id.startsWith('raw:')) {
        const name = id.replace('raw:', '');
        const rawItem = this.inbox.raw[name] || {};
        const files = (rawItem.paths || []).map(f => ({ name: f }));
        this.detailDrawer = {
          open: true,
          title: `Raw Drop: ${name}`,
          desc: rawItem.description || 'Raw input directory containing files.',
          items: files
        };
      } else if (id.startsWith('gw:')) {
        const path = id.replace('gw:', '');
        const parts = path.split('/');
        const pillar = parts[0], aspect = parts[1], fg = parts[2];
        
        const items = [];
        const fgItems = (this.inbox && this.inbox.gateway && this.inbox.gateway[pillar] && this.inbox.gateway[pillar][aspect] && this.inbox.gateway[pillar][aspect][fg]) || {};
        Object.entries(fgItems).forEach(([itemName, itemInfo]) => {
          if (itemName !== 'freshness') {
            items.push({ name: itemName, description: itemInfo.description || itemInfo.extracted_concern });
          }
        });
        
        this.detailDrawer = {
          open: true,
          title: `Gateway Functional Group: ${fg.replace(/_/g, ' ')}`,
          desc: `Pillar: ${pillar.replace(/_/g, ' ')} › Aspect: ${aspect}`,
          items: items
        };
      }
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

    // ── resizable vertical border between SIDEBAR and main column (persist)
    //    SIDEBAR is on the RIGHT, so its width = distance from the right viewport edge ──
    startResizeV(e) {
      e.preventDefault();
      const move = ev => {
        const pixelWidth = window.innerWidth - ev.clientX;
        const minWidthPx = 280;                     // keep in sync with .grid's minmax(280px, ...) floor in style.css
        const maxWidthPx = window.innerWidth * 0.50; // sidebar still can't take more than half the app width
        const targetWidthPx = Math.max(minWidthPx, Math.min(maxWidthPx, pixelWidth));
        this.sideW = (targetWidthPx / window.innerWidth) * 100;
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
    toggleTop() { this.minTop = !this.minTop; if (this.minTop) this.minMid = false; this.$nextTick(() => { this.drawFlowRel(); this.recalcFit(); }); },
    toggleMid() { this.minMid = !this.minMid; if (this.minMid) this.minTop = false; this.$nextTick(() => { this.drawFlowRel(); this.recalcFit(); }); },
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
        const topbar = document.querySelector('.topbar');
        const bottombar = document.querySelector('.bottombar');
        const topH = topbar ? topbar.offsetHeight : 40;
        const botH = bottombar ? bottombar.offsetHeight : 44;
        const usable = window.innerHeight - topH - botH - 12; // measured chrome
        const minRowPx = 220; // keep in sync with .grid's minmax(220px, ...) row floors in style.css
        const rawPx = ev.clientY - topH;
        const clampedPx = Math.max(minRowPx, Math.min(usable - minRowPx, rawPx));
        this.topH = (clampedPx / usable) * 100;
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