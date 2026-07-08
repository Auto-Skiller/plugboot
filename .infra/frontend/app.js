// Agentic OS dashboard client.
// htmx = data/control, Alpine = windows/popups, Cytoscape = maps, SSE = live.

function os() {
  return {
    current: 'os', entities: ['os'], syncAt: '\u2014', tbMetrics: '',
    toolboxOpen: false, missionOpen: false, missionName: '', missionBody: '',
    chatMin: true, winStyle: '',

    async init() {
      await this.loadState();
      this.wireSSE();
      this.renderGraphs();
      this.loadBoard();
      this.loadToolboxes();
    },

    async loadState() {
      const s = await (await fetch('/api/state')).json();
      this.entities = s.entities;
      this.current = s.current_window || 'os';
    },

    wireSSE() {
      const es = new EventSource('/events');
      es.addEventListener('sync', (e) => {
        this.syncAt = new Date().toLocaleTimeString();
        // htmx elements listen for sse:sync via hx-trigger; also refresh graphs
        document.body.dispatchEvent(new CustomEvent('sse:sync'));
        this.renderGraphs();
        this.loadToolboxes();
      });
      es.addEventListener('chat', (e) => {
        const log = document.getElementById('chat-log');
        log.insertAdjacentHTML('beforeend', e.data);
        log.scrollTop = log.scrollHeight;
        this.chatMin = false; // auto-pop on new agent message
      });
    },

    async renderGraphs() {
      await this.graph('brain-graph', 'brain');
      await this.graph('inbox-graph', 'inbox');
    },

    async graph(elId, which) {
      const el = document.getElementById(elId);
      if (!el) return;
      const r = await (await fetch(`/panel/graph?entity=${this.current}&which=${which}`)).json();
      cytoscape({
        container: el,
        elements: [...r.elements.nodes, ...r.elements.edges],
        style: [
          { selector: 'node', style: {
            'background-color': '#8b5cf6', 'label': 'data(label)',
            'color': '#a1a1aa', 'font-size': '7px', 'width': 12, 'height': 12 } },
          { selector: 'node[kind="root"]', style: { 'background-color': '#3b82f6', 'width': 20, 'height': 20 } },
          { selector: 'node[kind="pillar"]', style: { 'background-color': '#10b981', 'width': 16, 'height': 16 } },
          { selector: 'node[kind="group"]', style: { 'background-color': '#f59e0b' } },
          { selector: 'edge', style: {
            'width': 1, 'line-color': 'rgba(255,255,255,.15)',
            'curve-style': 'bezier' } },
        ],
        layout: { name: 'cose', animate: false, padding: 10 },
      });
    },

    async loadBoard() {
      const t = await (await fetch(`/panel/board?entity=${this.current}`)).text();
      if (this.$refs.board) this.$refs.board.value = t;
    },

    async saveBoard() {
      // v1: board save endpoint is a follow-up; log intent for now
      console.log('board save queued (endpoint pending)');
    },

    async loadToolboxes() {
      const r = await (await fetch(`/panel/toolboxes?entity=${this.current}`)).json();
      const m = r.metrics || {};
      this.tbMetrics = `${m.active || 0}/${m.total || 0} active`;
      const body = document.getElementById('toolbox-body');
      if (body) body.textContent = JSON.stringify(r.toolboxes, null, 2);
    },

    async switchEntity() {
      // switch content of every panel to the selected entity; topbar stays
      document.getElementById('planning').setAttribute(
        'hx-get', `/panel/missions?entity=${this.current}&phase=planning`);
      document.getElementById('execution').setAttribute(
        'hx-get', `/panel/missions?entity=${this.current}&phase=execution`);
      document.getElementById('runtime').setAttribute(
        'hx-get', `/panel/runtime?entity=${this.current}`);
      htmx.trigger('#planning', 'load');
      htmx.trigger('#execution', 'load');
      htmx.trigger('#runtime', 'load');
      this.renderGraphs();
      this.loadBoard();
      this.loadToolboxes();
    },

    async openMission(name) {
      this.missionName = name;
      const rt = await (await fetch(`/panel/runtime?entity=${this.current}`)).text();
      this.missionBody = 'Loaded mission: ' + name + '\n\n(full mission detail view is a follow-up pass)';
      this.missionOpen = true;
      this.winStyle = 'top:120px;left:36%';
    },

    filterCards(ev, which) {
      const q = ev.target.value.toLowerCase();
      document.querySelectorAll('#' + which + ' .mission-card').forEach((c) => {
        c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    },

    drag(ev) {
      const win = ev.currentTarget;
      if (!ev.target.classList.contains('fw-h')) return;
      const ox = ev.clientX - win.offsetLeft, oy = ev.clientY - win.offsetTop;
      const mv = (e) => { win.style.left = (e.clientX - ox) + 'px'; win.style.top = (e.clientY - oy) + 'px'; };
      const up = () => { document.removeEventListener('mousemove', mv); document.removeEventListener('mouseup', up); };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    },
  };
}
