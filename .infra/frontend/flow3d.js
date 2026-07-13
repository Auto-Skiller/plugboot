// PlugBoot — 3D Flow Explorer (live data). Classic script (no importmap/ESM).
// Loaded lazily by app.js. Uses window.THREE + window.THREE.OrbitControls
// (UMD globals from /static/three.min.js + /static/OrbitControls.js), so it
// resolves through the SAME origin/path as app.js — no fragile module graph.
// Adds NO dependency to the default 2D path: three.js loads only on first 3D toggle.
(function (global) {
  'use strict';
  const THREE = global.THREE;
  const OrbitControls = global.THREE && global.THREE.OrbitControls;
  const NEUTRAL = 0x8b95a8;
  const hexToInt = h => parseInt(String(h).replace('#', ''), 16) || NEUTRAL;

  // pipeline stage ordering (must match the 2D tier order)
  const STAGES = ['Discovery', 'Inbox', 'Analysing', 'Gateway', 'Prompts'];
  const stageX = { Discovery: -70, Inbox: -35, Analysing: 0, Gateway: 35, Prompts: 70 };

  class Flow3D {
    constructor(host, api) {
      this.host = host;
      this.api = api;
      this.nodes = [];
      this.linkDefs = [];
      this.running = false;
      this._raf = null;
      this._built = false;
      this._ro = null;
    }

    start() {
      if (this._built) { this.resume(); return; }
      this._initThree();
      this.refresh();
      this._built = true;
      this.resume();
    }

    _initThree() {
      const w = this.host.clientWidth || 800, h = this.host.clientHeight || 400;
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x0b0f17, 0.0038);
      this.cam = new THREE.PerspectiveCamera(55, w / h, 0.1, 2000);
      this.cam.position.set(0, 26, 118);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(Math.min(global.devicePixelRatio || 1, 2));
      this.renderer.setSize(w, h);
      this.renderer.setClearColor(0x0b0f17, 1);
      this.host.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.cam, this.renderer.domElement);
      this.controls.enableDamping = true; this.controls.dampingFactor = 0.08;
      this.controls.autoRotate = true; this.controls.autoRotateSpeed = 0.4;
      this.controls.minDistance = 50; this.controls.maxDistance = 320;

      this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));
      const dl = new THREE.DirectionalLight(0xffffff, 0.85); dl.position.set(40, 90, 70);
      this.scene.add(dl);

      // starfield for depth cue
      const sg = new THREE.BufferGeometry(), N = 700, sp = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) { sp[i*3]=(Math.random()-.5)*700; sp[i*3+1]=(Math.random()-.5)*450; sp[i*3+2]=(Math.random()-.5)*700; }
      sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
      this.scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x223049, size: 0.7 })));

      // groups
      this.nodeGroup = new THREE.Group(); this.scene.add(this.nodeGroup);
      this.labelGroup = new THREE.Group(); this.scene.add(this.labelGroup);

      // raycast for clicks
      this.ray = new THREE.Raycaster(); this.mouse = new THREE.Vector2();
      this.renderer.domElement.addEventListener('click', e => this._onClick(e));

      // resize observer
      this._ro = new ResizeObserver(() => this._resize());
      this._ro.observe(this.host);
    }

    _resize() {
      if (!this.renderer) return;
      const w = this.host.clientWidth || 800, h = this.host.clientHeight || 400;
      this.cam.aspect = w / h; this.cam.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }

    // -- build node + link model from live getters (flat loops, ES-module safe) --
    _buildModel() {
      const api = this.api;
      const nodes = [];
      const byStage = {};
      STAGES.forEach(s => { byStage[s] = []; });

      const push = (label, stage, pillar, color) => {
        const n = { label, stage, pillar: pillar || null,
          color: color != null ? color : NEUTRAL,
          base: new THREE.Vector3(), phase: Math.random() * Math.PI * 2,
          r: stage === 'Gateway' ? 3.2 : 2.4, curY: 0 };
        nodes.push(n); byStage[stage].push(n); return n;
      };

      (api.inboxDiscovery || []).forEach(d => push(d.name, 'Discovery', null, null));
      (api.inboxRaw || []).forEach(r => push(r, 'Inbox', null, null));
      (api.inboxAnalysing || []).forEach(a => push(a.name, 'Analysing', null, null));

      const pal = api.pillarPalette || {};
      const pColor = name => { const c = pal[name]; return c ? hexToInt(c) : NEUTRAL; };
      const gwNodes = {};
      (api.gatewayPillars || []).forEach(p => {
        p.aspects.forEach(a => a.fgs.forEach(fg => {
          gwNodes[fg.path] = push(fg.name, 'Gateway', p.name, pColor(p.name));
        }));
      });

      const prNodes = {};
      (api.promptsList || []).forEach(p => {
        const pl = api.promptPillar ? api.promptPillar(p.fullName || p.name) : null;
        const col = pl ? pColor(pl) : NEUTRAL;
        prNodes[p.fullName || p.name] = push(p.name, 'Prompts', pl, col);
      });

      const raw = api.inbox.raw || {};
      const linkDefs = [];

      const rawsForFg = fg => {
        const set = new Set();
        (fg.items || []).forEach(itemName => {
          Object.keys(raw).forEach(rn => {
            if (rn === 'freshness') return;
            const ri = raw[rn]; if (!ri) return;
            const contains = Array.isArray(ri.contains) ? ri.contains : [];
            const hit = contains.some(c => c === itemName ||
              c.toLowerCase().includes(itemName.toLowerCase()) ||
              itemName.toLowerCase().includes(c.toLowerCase()));
            if (hit) set.add(rn);
            else if (fg.path && fg.path.toLowerCase().includes(rn.toLowerCase())) set.add(rn);
          });
        });
        return set;
      };

      for (const p of (api.gatewayPillars || [])) {
        const col = pColor(p.name);
        for (const a of p.aspects) {
          for (const fg of a.fgs) {
            const fgNode = gwNodes[fg.path];
            if (!fgNode) continue;
            rawsForFg(fg).forEach(rn => {
              const rnNode = byStage.Inbox.find(n => n.label === rn);
              if (rnNode) linkDefs.push({ a: rnNode, b: fgNode, color: col });
            });
            const pKey = p.name.toLowerCase().replace(/_/g, ' ');
            const aKey = a.name.toLowerCase();
            const fgKey = fg.name.toLowerCase().replace(/_/g, ' ');
            for (const label in prNodes) {
              const pr = (api.promptsList || []).find(x => (x.fullName || x.name) === label) || {};
              const role = (pr.role || '').toLowerCase();
              const nm = (pr.name || '').toLowerCase();
              const path = (pr.path || '').toLowerCase();
              const isMatch = role.includes(pKey) || path.includes(pKey.replace(/ /g, '_')) ||
                              role.includes(fgKey) || nm.includes(fgKey) || fgKey.includes(nm) || role.includes(aKey);
              if (isMatch) linkDefs.push({ a: fgNode, b: prNodes[label], color: col });
            }
          }
        }
      }

      const seen = new Set();
      this.linkDefs = linkDefs.filter(l => {
        const k = l.a.label + '|' + l.b.label + '|' + l.color;
        if (seen.has(k)) return false;
        seen.add(k); return true;
      });
      this.nodes = nodes; this.byStage = byStage;
      return nodes;
    }

    _layout() {
      STAGES.forEach(s => {
        const arr = this.byStage[s] || [];
        const radius = 14 + arr.length * 2.2;
        arr.forEach((n, i) => {
          const ang = (i / Math.max(1, arr.length)) * Math.PI * 2;
          n.base.set(stageX[s], Math.sin(ang) * radius * 0.6 + (Math.random() - .5) * 4,
                                Math.cos(ang) * radius * 0.6 + (Math.random() - .5) * 4);
        });
      });
    }

    _render() {
      while (this.nodeGroup.children.length) {
        const c = this.nodeGroup.children.pop(); c.geometry && c.geometry.dispose(); c.material && c.material.dispose && c.material.dispose();
        if (c.children) c.children.forEach(ch => { ch.material && ch.material.map && ch.material.map.dispose && ch.material.map.dispose(); ch.material && ch.material.dispose && ch.material.dispose(); });
      }
      while (this.labelGroup.children.length) { const c = this.labelGroup.children.pop(); c.material && c.material.map && c.material.map.dispose && c.material.map.dispose(); c.material && c.material.dispose && c.material.dispose(); }

      STAGES.forEach(s => {
        const sp = this._makeLabel(s, 0x6f80a0); sp.scale.set(26, 6.5, 1);
        sp.position.set(stageX[s], 38, 0); this.labelGroup.add(sp);
      });

      this._labels = [];
      this.nodes.forEach(n => {
        const geo = new THREE.SphereGeometry(n.r, 18, 18);
        const mat = new THREE.MeshStandardMaterial({ color: n.color, emissive: n.color, emissiveIntensity: 0.5, roughness: 0.4, metalness: 0.1 });
        const m = new THREE.Mesh(geo, mat); m.userData = n; this.nodeGroup.add(m); n.mesh = m;
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this._glow(n.color), color: n.color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        halo.scale.set(n.r * 6, n.r * 6, 1); m.add(halo);
        const sp = this._makeLabel(n.label, n.color); sp.position.copy(n.base); this.labelGroup.add(sp);
        this._labels.push({ sp, n });
      });

      const L = this.linkDefs.length;
      const lgeo = new THREE.BufferGeometry();
      const lpos = new Float32Array(L * 2 * 3);
      lgeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
      const lcol = new Float32Array(L * 2 * 3);
      this.linkDefs.forEach((l, i) => { const c = new THREE.Color(l.color); lcol.set([c.r,c.g,c.b], i*6); lcol.set([c.r,c.g,c.b], i*6+3); });
      lgeo.setAttribute('color', new THREE.BufferAttribute(lcol, 3));
      this.linkLines = new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, linewidth: 2 }));
      this.scene.add(this.linkLines); this._lpos = lpos; this._lgeo = lgeo;

      const PPL = 6, fc = L * PPL;
      const fgeo = new THREE.BufferGeometry(); const fpos = new Float32Array(fc * 3);
      fgeo.setAttribute('position', new THREE.BufferAttribute(fpos, 3));
      const fcol = new Float32Array(fc * 3);
      this._fdata = [];
      this.linkDefs.forEach((l, li) => {
        for (let k = 0; k < PPL; k++) {
          const ci = li * PPL + k;
          this._fdata.push({ link: l, t: (k / PPL) + Math.random()*0.05, speed: 0.10 + Math.random()*0.12, ci });
          const c = new THREE.Color(l.color); fcol.set([c.r,c.g,c.b], ci*3);
        }
      });
      fgeo.setAttribute('color', new THREE.BufferAttribute(fcol, 3));
      this._fPoints = new THREE.Points(fgeo, new THREE.PointsMaterial({ size: 3.4, vertexColors: true, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, depthWrite: false }));
      this.scene.add(this._fPoints); this._fpos = fpos;

      // Faint backbone connecting the stage centers in pipeline order, so the
      // flow direction always reads even when item-level links are sparse.
      if (this._backbone) { this.scene.remove(this._backbone); this._backbone.geometry.dispose(); this._backbone.material.dispose(); }
      const backbonePts = STAGES.map(s => new THREE.Vector3(stageX[s], 0, 0));
      const bgeo = new THREE.BufferGeometry().setFromPoints(backbonePts);
      this._backbone = new THREE.Line(bgeo, new THREE.LineBasicMaterial({ color: 0x33507a, transparent: true, opacity: 0.5 }));
      this.scene.add(this._backbone);
    }

    _glow(hex) {
      const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
      const g = x.createRadialGradient(64,64,0,64,64,64); const h = '#' + hex.toString(16).padStart(6,'0');
      g.addColorStop(0, h); g.addColorStop(0.25, h); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.fillRect(0,0,128,128); return new THREE.CanvasTexture(c);
    }
    _makeLabel(text, hex) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
      x.font = '600 28px -apple-system,Segoe UI,Roboto,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = '#' + hex.toString(16).padStart(6,'0'); x.fillText(text, 128, 32);
      const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
      sp.scale.set(14, 3.5, 1); return sp;
    }

    refresh() {
      if (!this._built) return;
      this._buildModel();
      this._layout();
      this._render();
    }

    _onClick(e) {
      if (!this.renderer) return;
      const r = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      this.mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      this.ray.setFromCamera(this.mouse, this.cam);
      const hit = this.ray.intersectObjects(this.nodeGroup.children, false);
      if (hit.length && this.api.openNodeDrawer) {
        const n = hit[0].object.userData;
        if (n.stage === 'Gateway') this.api.openNodeDrawer('gw:' + (this._fgPathFor(n.label) || n.label));
        else if (n.stage === 'Inbox') this.api.openNodeDrawer('raw:' + n.label);
        else if (n.stage === 'Prompts') this.api.openNodeDrawer('pr:' + (n.fullName || n.label));
        else this.api.openNodeDrawer('disc:' + n.label);
      }
    }
    _fgPathFor(label) {
      const all = this.api.gatewayPillars || [];
      for (const p of all) for (const a of p.aspects) for (const fg of a.fgs) if (fg.name === label) return fg.path;
      return null;
    }

    resume() {
      if (this.running) return; this.running = true;
      this.host.style.display = 'block';
      const clock = new THREE.Clock();
      const loop = () => {
        if (!this.running) return;
        this._raf = requestAnimationFrame(loop);
        const t = clock.getElapsedTime();
        this.nodes.forEach(n => { n.curY = n.base.y + Math.sin(t * 0.8 + n.phase) * 1.6; n.mesh.position.set(n.base.x, n.curY, n.base.z); });
        if (this._labels) this._labels.forEach(({ sp, n }) => sp.position.set(n.base.x, n.curY + 5.0, n.base.z));
        if (this._lpos && this.linkDefs) this.linkDefs.forEach((l, i) => this._lpos.set([l.a.base.x, l.a.curY, l.a.base.z, l.b.base.x, l.b.curY, l.b.base.z], i * 6));
        if (this._lgeo) this._lgeo.attributes.position.needsUpdate = true;
        if (this._fpos && this._fdata) {
          this._fdata.forEach(d => {
            d.t += d.speed * 0.016; if (d.t > 1) d.t -= 1;
            const a = d.link.a, b = d.link.b;
            const x = a.base.x + (b.base.x - a.base.x) * d.t;
            const y = a.curY + (b.curY - a.curY) * d.t;
            const z = a.base.z + (b.base.z - a.base.z) * d.t;
            this._fpos.set([x, y, z], d.ci * 3);
          });
          this._fPoints.geometry.attributes.position.needsUpdate = true;
        }
        this.controls.update();
        this.renderer.render(this.scene, this.cam);
      };
      loop();
    }

    pause() {
      this.running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      this.host.style.display = 'none';
    }

    destroy() {
      this.pause();
      if (this._ro) { this._ro.disconnect(); this._ro = null; }
      if (this.renderer) { this.renderer.dispose(); if (this.renderer.domElement.parentNode) this.renderer.domElement.parentNode.removeChild(this.renderer.domElement); }
      this._built = false;
    }
  }

  global.Flow3D = Flow3D;
})(window);
