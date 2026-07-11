import { useEffect } from "react";
import "../imports/style.css";
// @ts-ignore
import appJsRaw from "../imports/app.js?raw";

const INNER_HTML = `
  <style>
    /* Mission cards: use the room they receive; never force unreadable copy. */
    .mcard.sm { padding: clamp(.32rem, .55vw, .52rem) !important; }
    .mcard-top b { font-size: clamp(.67rem, .72vw, .84rem) !important; line-height: 1.2 !important; }
    .mcard.sm p { font-size: clamp(.59rem, .64vw, .73rem) !important; max-height: 2.55em !important; margin: .16rem 0 !important; line-height: 1.28 !important; }
    .mcard .bar { height: clamp(.22rem, .25vw, .3rem) !important; margin: .16rem 0 !important; }
    .mcard .mtags { gap: .18rem !important; margin-top: .16rem !important; }
    .mcard .mt { font-size: clamp(.52rem, .55vw, .61rem) !important; padding: .04rem .24rem !important; }
    .pill { font-size: clamp(.52rem, .55vw, .62rem) !important; padding: .07rem .3rem !important; }
    .ms-head { font-size: clamp(.66rem, .7vw, .78rem) !important; padding-bottom: .3rem !important; }
  </style>

  <!-- ================= TOPBAR ================= -->
  <header class="topbar">

    <!-- ── Left: Global daemon controls ── -->
    <div class="kpis-fixed">
      <span class="kpi tb-freshness" title="Daemon Freshness: sync_status (sync_count)" x-text="'Freshness: ' + (config.freshness?.sync_status || '—') + ' (' + (config.freshness?.sync_count ?? '0') + ')'"></span>
      <span class="kpi toggle-kpi" :class="{warn: !config.manager_boot}" @click="patchConfig(['manager_boot'], !config.manager_boot)" title="Click to toggle manager boot">
        <span class="kpi-dot" :class="config.manager_boot ? 'kpi-dot-on' : 'kpi-dot-off'"></span>
        <span class="kpi-label">Boot</span>
        <span class="kpi-val" x-text="config.manager_boot ? 'ON' : 'OFF'"></span>
      </span>
      <button class="mini tb-restart-btn" @click="confirm('Restart daemon?') && restartDaemon()" title="Restart daemon process via manager">&#8634; Daemon</button>
      <div class="tb-danger-group">
        <button class="mini tb-danger-btn" @click="confirm('Shut down daemon?') && shutdownDaemon()" title="Shut down daemon completely">&#9209; Dmn</button>
        <button class="mini tb-danger-btn" @click="confirm('Shut down dashboard?') && shutdownDashboard()" title="Shut down dashboard">&#9209; Dash</button>
      </div>
    </div>

    <!-- ── Separator ── -->
    <div class="tb-sep" aria-hidden="true"></div>

    <!-- ── Center: Brand ── -->
    <div class="brand">
      <img src="/static/logo.png" alt="PlugBoot" style="height: 26px; width: 26px; object-fit: contain; border-radius: 6px; flex-shrink:0;">
      <span class="brand-name">PlugBoot</span>
      <small class="brand-ver">v1</small>
    </div>

    <!-- ── Separator ── -->
    <div class="tb-sep" aria-hidden="true"></div>

    <!-- ── Right: Entity config toggles ── -->
    <div class="kpis-entity">
      <span class="kpi toggle-kpi" :class="{warn: !entityConfig.status}" @click="toggleEntityConfig('status', entityConfig.status)" title="Click to toggle entity status">
        <span class="kpi-dot" :class="entityConfig.status ? 'kpi-dot-on' : 'kpi-dot-off'"></span>
        <span class="kpi-label">Status</span>
        <span class="kpi-val" x-text="entityConfig.status ? 'ON' : 'OFF'"></span>
      </span>
      <span class="kpi toggle-kpi" :class="{warn: !entityConfig.autonomy}" @click="toggleEntityConfig('autonomy', entityConfig.autonomy)" title="Click to toggle autonomy">
        <span class="kpi-dot" :class="entityConfig.autonomy ? 'kpi-dot-on' : 'kpi-dot-off'"></span>
        <span class="kpi-label">Autonomy</span>
        <span class="kpi-val" x-text="entityConfig.autonomy ? 'ON' : 'OFF'"></span>
      </span>
      <span class="kpi toggle-kpi" :class="{warn: !entityConfig.toolboxes}" @click="toggleEntityConfig('toolboxes', entityConfig.toolboxes)" title="Click to toggle toolboxes status">
        <span class="kpi-dot" :class="entityConfig.toolboxes ? 'kpi-dot-on' : 'kpi-dot-off'"></span>
        <span class="kpi-label">Toolboxes</span>
        <span class="kpi-val" x-text="entityConfig.toolboxes ? 'ON' : 'OFF'"></span>
      </span>
      <span class="kpi toggle-kpi" :class="{warn: !entityConfig.inbox_gateway_delivery}" @click="toggleEntityConfig('inbox-gateway_delivery', entityConfig.inbox_gateway_delivery)" title="Click to toggle gateway delivery">
        <span class="kpi-dot" :class="entityConfig.inbox_gateway_delivery ? 'kpi-dot-on' : 'kpi-dot-off'"></span>
        <span class="kpi-label">Delivery</span>
        <span class="kpi-val" x-text="entityConfig.inbox_gateway_delivery ? 'ON' : 'OFF'"></span>
      </span>
      <span class="missions-cfg-btn" @click="ecoOpen=true; loadEco()" title="Open Missions config (Trig / Exec / Arch)">&#9881; Missions</span>
    </div>

    <!-- ── Controls: theme + entity switcher ── -->
    <div class="tb-controls">
      <button class="theme-toggle" @click="toggleTheme()" x-text="theme==='dark' ? '&#9728;' : '&#9790;'" title="Toggle light / dark theme"></button>
      <select class="tb-entity-select" x-model="entity" @change="switchEntity()" title="Switch active entity">
        <option value="os">_os</option>
        <template x-for="p in projects" :key="p"><option :value="p" x-text="p"></option></template>
      </select>
    </div>

  </header>

  <!-- ================= MAIN GRID ================= -->
  <main class="grid" :style="'grid-template-columns:1fr 6px ' + (minSide ? 'var(--minw,74px)' : sideW + '%') + ';grid-template-rows:' + (minTop?'auto':(minMid?'1fr':topH+'%')) + ' 6px ' + (minMid?'auto':'1fr')">

    <!-- ============ TOP: MISSIONS ============ -->
    <section class="col top" :class="{min: minTop}">
      <div class="minbar" x-show="minTop" @click="minTop=false">
        <b>Missions</b>
        <span class="mmetric hi"><span x-text="planningMissions().length"></span> plan</span>
        <span class="mmetric hi accent"><span x-text="executionMissions().length"></span> exec</span>
        <span class="mmetric"><span x-text="archivedMissions.length"></span> arch</span>
        <span class="mmetric warn" x-show="fqMissionsCount>0" x-text="fqMissionsCount + ' need tasks'"></span>
        <span class="news" x-show="newsFor(['inbox','mission','move','arch']).length">
          <template x-for="n in newsFor(['inbox','mission','move','arch'])" :key="n.id">
            <span class="news-tag" :class="n.kind" x-text="n.text"></span>
          </template>
        </span>
        <span class="caret">&#9656;</span>
      </div>
      <div class="pane" x-show="!minTop" style="flex:1">
        <div class="pane-head">
          <h3>Missions</h3>
          <button class="mini" @click="missionComposer=true" style="margin-left:8px">+ Launch</button>
          <input class="filter" placeholder="filter" x-model="filter.m" style="margin-left:8px" />
          <select x-model="sort.m"><option>priority</option><option>recent</option></select>
          <select x-model="relGroup" title="Link cards by" @change="drawMissionRel()" style="margin-left:6px">
            <option value="type">link: type</option>
            <option value="model">link: model</option>
            <option value="klass">link: class</option>
            <option value="source">link: source</option>
            <option value="depends_on">link: dependencies</option>
          </select>
          <button class="mini ghost" style="margin-left:auto" @click="toggleTop()" title="Minimize">–</button>
        </div>
        <div class="mission-board">
          <div class="ms-col" data-klass="PLANNING"
               @dragover.prevent="$event.dataTransfer.dropEffect='move'; $el.classList.add('drag-over')"
               @dragleave="if(!$el.contains($event.relatedTarget)) $el.classList.remove('drag-over')"
               @drop.prevent="$el.classList.remove('drag-over'); onMissionDrop($event,'PLANNING')">
            <div class="ms-head">Planning <span class="cnt" x-text="planningMissions().length"></span></div>
            <div class="cards">
              <template x-for="m in planningMissions()" :key="m.name">
                <div class="mcard sm" draggable="true" @dragstart="onMissionDrag($event,m)"
                     @click="openMission(m)" @mouseenter="relHover=m.name; drawMissionRel()" @mouseleave="relHover=null; drawMissionRel()" :data-name="m.name">
                  <div class="mcard-top"><b x-text="m.name"></b><span class="pill" :class="prioClass(m.priority)" x-text="m.priority"></span></div>
                  <p x-text="m.objective"></p>
                  <div class="bar"><i :style="'width:'+m.pct+'%'"></i></div>
                  <div class="mtags"><template x-for="t in mTags(m)" :key="t"><span class="mt" :class="t.includes('needs tasks') ? 'mt alert' : ''" x-text="t"></span></template></div>
                </div>
              </template>
              <span x-show="!planningMissions().length" class="kv">no planning missions</span>
            </div>
          </div>
          <div class="ms-col" data-klass="EXECUTION"
               @dragover.prevent="$event.dataTransfer.dropEffect='move'; $el.classList.add('drag-over')"
               @dragleave="if(!$el.contains($event.relatedTarget)) $el.classList.remove('drag-over')"
               @drop.prevent="$el.classList.remove('drag-over'); onMissionDrop($event,'EXECUTION')">
            <div class="ms-head">Execution <span class="cnt" x-text="executionMissions().length"></span></div>
            <div class="cards">
              <template x-for="m in executionMissions()" :key="m.name">
                <div class="mcard sm" draggable="true" @dragstart="onMissionDrag($event,m)"
                     @click="openMission(m)" @mouseenter="relHover=m.name; drawMissionRel()" @mouseleave="relHover=null; drawMissionRel()" :data-name="m.name">
                  <div class="mcard-top"><b x-text="m.name"></b><span class="pill" :class="prioClass(m.priority)" x-text="m.priority"></span></div>
                  <p x-text="m.objective"></p>
                  <div class="bar"><i :style="'width:'+m.pct+'%'"></i></div>
                  <div class="mtags"><template x-for="t in mTags(m)" :key="t"><span class="mt" :class="t.includes('needs tasks') ? 'mt alert' : ''" x-text="t"></span></template></div>
                </div>
              </template>
              <span x-show="!executionMissions().length" class="kv">no execution missions</span>
            </div>
          </div>
          <div class="ms-col" data-klass="ARCHIVE"
               @dragover.prevent="$event.dataTransfer.dropEffect='move'; $el.classList.add('drag-over')"
               @dragleave="if(!$el.contains($event.relatedTarget)) $el.classList.remove('drag-over')"
               @drop.prevent="$el.classList.remove('drag-over'); onMissionDrop($event,'ARCHIVE')">
            <div class="ms-head">Archive <span class="cnt" x-text="archivedMissions.length"></span></div>
            <div class="cards">
              <template x-for="am in archivedMissions" :key="am.name">
                <div class="mcard sm arch" draggable="true" @dragstart="onMissionDrag($event,am,'archived')"
                     @click="openArchived(am)" @mouseenter="relHover=am.name; drawMissionRel()" @mouseleave="relHover=null; drawMissionRel()" :data-name="am.name">
                  <div class="mcard-top"><b x-text="am.name"></b><span class="pill" :class="am.category==='completed'?'':'low'" x-text="am.category"></span></div>
                  <p x-text="am.objective || ''"></p>
                </div>
              </template>
              <span x-show="!archivedMissions.length" class="kv">no archived missions</span>
            </div>
          </div>
        </div>
        <div class="mission-map-legend" style="position:relative;z-index:4;padding:3px 6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-height:18px;">
          <span class="mission-map-hint">hover a mission to trace its links</span>
          <template x-for="item in missionRelLegend" :key="item.label">
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:.63rem;color:var(--muted);">
              <span :style="'width:7px;height:7px;border-radius:50%;background:'+item.color+';flex-shrink:0'"></span>
              <span x-text="item.label + (item.count !== null ? ' ('+item.count+')' : '')"></span>
            </span>
          </template>
        </div>
        <canvas class="rel-canvas" id="mission-rel"
                @mousemove="relMove($event)" @mouseleave="relLeave()"></canvas>
      </div>
    </section>

    <div class="resizer v" @mousedown="startResizeV($event)"></div>

    <!-- ============ RIGHT SIDEBAR: RUNTIME / BOARD ============ -->
    <aside class="col side" :class="{min: minSide}">
      <button class="side-toggle" @click="minSide=!minSide" :title="minSide ? 'Expand Runtime/Board' : 'Minimize Runtime/Board'">
        <span class="chev" x-text="minSide ? '&#8249;' : '&#8250;'"></span>
      </button>

      <div class="side-rail" x-show="minSide" @click="minSide=false">
        <div class="rail-head">
          <span class="rail-title">Runtime / Board</span>
        </div>
        <div class="rail-metrics">
          <span class="mmetric hi"><span class="w">review</span><span class="w">queue</span><b x-text="rq.length"></b></span>
          <span class="mmetric hi"><span class="w">backlog</span><b x-text="bl.length"></b></span>
          <span class="mmetric hi"><span class="w">active</span><span class="w">pillars</span><b x-text="(pillarActives||[]).length"></b></span>
          <span class="mmetric hi"><span class="w">evolution</span><span class="w">objectives</span><b x-text="(evoActives||[]).length"></b></span>
          <span class="mmetric warn" x-show="fqTotal>0"><span class="w">fill</span><span class="w">gaps</span><b x-text="fqTotal"></b></span>
          <span class="mmetric"><span class="w">freshness</span><b x-text="(runtimeMetrics.freshness?.last_synced)?'synced':'—'"></b></span>
          <span class="mmetric" x-show="events.length"><span class="w">recent</span><span class="w">events</span><b x-text="events.length"></b></span>
        </div>
        <div class="rail-news" x-show="newsFor(['inbox','mission','move','arch']).length">
          <template x-for="n in newsFor(['inbox','mission','move','arch'])" :key="n.id">
            <span class="news-tag" :class="n.kind" x-text="n.text"></span>
          </template>
        </div>
      </div>

      <section class="pane" x-show="!minSide" style="flex:1">
        <div class="right-tabs">
          <button :class="{on: rightTab==='runtime'}" @click="rightTab='runtime'">Runtime</button>
          <button :class="{on: rightTab==='board'}" @click="rightTab='board'">Board</button>
        </div>

        <!-- RUNTIME -->
        <div class="tabpane" x-show="rightTab==='runtime'">
          <div style="overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:10px">

            <div class="rt-section expandable" :class="{open:expand.fresh}">
              <div class="ex-head" @click="expand.fresh=!expand.fresh"><span class="caret">&#9656;</span>
                <h4 style="margin:0">Freshness <span class="cnt ro-badge">RO</span></h4></div>
              <div class="ex-body">
                <div class="ro-grid">
                  <div class="ro-item"><span class="ro-label">sync_status</span><span class="ro-val" x-text="freshness.sync_status || '—'"></span></div>
                  <div class="ro-item"><span class="ro-label">sync_count</span><span class="ro-val" x-text="freshness.sync_count ?? '—'"></span></div>
                  <div class="ro-item"><span class="ro-label">last_synced</span><span class="ro-val" x-text="freshness.last_synced ? freshness.last_synced.slice(0,19) : '—'"></span></div>
                  <div class="ro-item"><span class="ro-label">last_edited</span><span class="ro-val" x-text="freshness.last_edited || '—'"></span></div>
                </div>
              </div>
            </div>

            <div class="rt-section expandable" :class="{open:expand.metrics}">
              <div class="ex-head" @click="expand.metrics=!expand.metrics"><span class="caret">&#9656;</span>
                <h4 style="margin:0">Runtime Metrics <span class="cnt ro-badge">RO</span></h4></div>
              <div class="ex-body">
                <div class="ro-grid">
                  <div class="ro-item"><span class="ro-label">review_queue</span><span class="ro-val" x-text="runtimeMetrics.review_queue ?? 0"></span></div>
                  <div class="ro-item"><span class="ro-label">backlog</span><span class="ro-val" x-text="runtimeMetrics.backlog ?? 0"></span></div>
                  <template x-if="runtimeMetrics.pillars">
                    <div class="ro-item"><span class="ro-label">pillars</span><span class="ro-val" x-text="'A:' + (runtimeMetrics.pillars.actives||0) + ' V:' + (runtimeMetrics.pillars.validated||0) + ' S:' + (runtimeMetrics.pillars.suggestions||0)"></span></div>
                  </template>
                  <template x-if="runtimeMetrics.evolution_objectives">
                    <div class="ro-item"><span class="ro-label">evolution_obj</span><span class="ro-val" x-text="'A:' + (runtimeMetrics.evolution_objectives.actives||0) + ' V:' + (runtimeMetrics.evolution_objectives.validated||0) + ' S:' + (runtimeMetrics.evolution_objectives.suggestions||0)"></span></div>
                  </template>
                  <template x-if="runtimeMetrics.fill_queue">
                    <div class="ro-item"><span class="ro-label">fill_queue</span><span class="ro-val" x-text="Object.entries(runtimeMetrics.fill_queue||{}).map(([k,v])=>k+':'+v).join(' ')"></span></div>
                  </template>
                </div>

                <h4 style="margin-top:10px">Active Pillars &amp; Objectives</h4>
                <div class="sub-label" style="margin-top:4px">Pillars</div>
                <div class="flexlist">
                  <template x-for="p in pillarActives" :key="p">
                    <span class="chip mono" x-text="p"></span>
                  </template>
                  <span x-show="!pillarActives.length" class="kv">none active</span>
                </div>
                <div class="sub-label" style="margin-top:6px">Objectives</div>
                <div class="flexlist">
                  <template x-for="e in evoActives" :key="e">
                    <span class="chip mono" x-text="e"></span>
                  </template>
                  <span x-show="!evoActives.length" class="kv">none active</span>
                </div>
              </div>
            </div>

            <div class="rt-section">
              <h4 style="cursor:pointer" @click="rqManager.open=true">Review Queue <span class="cnt" x-text="rq.length"></span> <span class="ro-badge" title="open manager">&#9881;</span></h4>
              <div class="chip-list">
                <template x-for="(it,i) in rq" :key="i">
                  <span class="chip editable" @click="reviewItem(i)" :title="'Click to review: ' + it">
                    <span x-text="it"></span>
                    <template x-if="rqFeedback[it] !== undefined"><span class="chip-note" title="you left feedback">&#128172;</span></template>
                  </span>
                </template>
                <span x-show="!rq.length" class="kv">nothing pending review</span>
              </div>
              <div class="add-row">
                <input type="text" x-model="newRqItem" placeholder="add review item…" @keydown.enter="addRqItem()" />
                <button class="mini" @click="addRqItem()">+</button>
              </div>
            </div>

            <div class="rt-section">
              <h4 style="cursor:pointer" @click="blManager.open=true">Backlog <span class="cnt" x-text="bl.length"></span> <span class="ro-badge" title="open manager">&#9881;</span></h4>
              <div class="chip-list">
                <template x-for="(it,i) in bl" :key="i">
                  <span class="chip editable" @click="reviewBlItem(i)" :title="'Click to review: ' + it">
                    <span x-text="it"></span>
                    <template x-if="blFeedback[it] !== undefined"><span class="chip-note" title="you left feedback">&#128172;</span></template>
                  </span>
                </template>
                <span x-show="!bl.length" class="kv">empty</span>
              </div>
              <div class="add-row">
                <input type="text" x-model="newBlItem" placeholder="add backlog item…" @keydown.enter="addBlItem()" />
                <button class="mini" @click="addBlItem()">+</button>
              </div>
            </div>

            <div class="rt-section">
              <h4 style="cursor:pointer" @click="pillarModal.open=true">Pillars <span class="cnt"><span x-text="pillarActives.length"></span> active · <span x-text="plCounts.v"></span>/<span x-text="plCounts.vt"></span> valid · <span x-text="plCounts.s"></span> sug</span> <span class="ro-badge" title="open manager">&#9881;</span></h4>
              <div class="sub-label">Actives</div>
              <div class="chip-list">
                <template x-for="p in pillarActives" :key="p">
                  <span class="chip editable mono" @click="openActivePillar(p)" :title="'Click to edit: ' + p">
                    <span x-text="p"></span>
                  </span>
                </template>
              </div>
              <div class="add-row">
                <input type="text" x-model="newPillar" placeholder="new pillar" @keydown.enter="addPillar()" />
                <button class="mini" @click="addPillar()">add</button>
              </div>
            </div>

            <div class="rt-section">
              <h4 style="cursor:pointer" @click="evoModal.open=true">Evolution OBJ <span class="cnt"><span x-text="evoActives.length"></span> active · <span x-text="evoCounts.v"></span>/<span x-text="evoCounts.vt"></span> valid · <span x-text="evoCounts.s"></span> sug</span> <span class="ro-badge" title="open manager">&#9881;</span></h4>
              <div class="sub-label">Actives</div>
              <div class="chip-list">
                <template x-for="e in evoActives" :key="e">
                  <span class="chip editable mono" @click="openActiveEvo(e)" :title="'Click to edit: ' + e">
                    <span x-text="e"></span>
                  </span>
                </template>
              </div>
              <div class="add-row">
                <input type="text" x-model="newEvo" placeholder="new evolution objective" @keydown.enter="addEvo()" />
                <button class="mini" @click="addEvo()">add</button>
              </div>
            </div>

            <div class="rt-section expandable" :class="{open:expand.sug}">
              <div class="ex-head" @click="expand.sug=!expand.sug"><span class="caret">&#9656;</span>
                <h4 style="margin:0">Fill Queue <span class="cnt" x-text="fqTotal"></span> <span class="ro-badge">RO</span></h4></div>
              <div class="ex-body">
                <div class="flexlist">
                  <template x-for="(n,k) in fq" :key="k">
                    <span class="chip" :class="{active:n>0}" x-text="k+': '+n"></span>
                  </template>
                </div>
                <div class="fq-items">
                  <template x-for="(it,i) in fqItems" :key="i">
                    <div class="fq-row"><span class="fq-grp" x-text="it.group"></span><span class="fq-txt" x-text="it.text"></span></div>
                  </template>
                  <span x-show="!fqItems.length" class="kv">fill queue is empty</span>
                </div>
              </div>
            </div>

            <div class="rt-section">
              <h4>Recent Events <span class="cnt" x-text="events.length"></span> <span class="ro-badge">RO</span></h4>
              <div style="max-height:160px;overflow:auto">
                <div x-for="(e,i) in events" :key="i"><div class="evt" x-text="e"></div></div>
                <span x-show="!events.length" class="kv">no events</span>
              </div>
            </div>

            <div class="rt-section expandable" :class="{open:expand.all}">
              <div class="ex-head" @click="expand.all=!expand.all"><span class="caret">&#9656;</span>
                <h4 style="margin:0">All Fields (raw read-only)</h4></div>
              <div class="ex-body">
                <div class="inspect">
                  <template x-for="row in rtInspect" :key="row.path">
                    <div class="insp-row" :style="'padding-left:'+row.depth*14+'px'">
                      <span class="k" x-text="row.key"></span>
                      <span class="sep">:</span>
                      <span class="v" :class="row.kind" x-text="row.val"></span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- BOARD -->
        <div class="tabpane" x-show="rightTab==='board'">
          <button class="mini" @click="saveBoard()" style="align-self:flex-end;margin-bottom:8px">save board</button>
          <textarea class="editor" x-model="board"></textarea>
        </div>
      </section>
    </aside>

    <div class="resizer h" @mousedown="startResizeH('L', $event)"></div>

    <!-- ============ BOTTOM: SOURCES & FLOW ============ -->
    <section class="col mid bottom" :class="{min: minMid}">
      <div class="minbar" x-show="minMid" @click="minMid=false">
        <b>Sources &amp; Flow</b>
        <span class="mmetric hi"><span x-text="inboxRaw.length"></span> inbox</span>
        <span class="mmetric"><span x-text="gatewayCount"></span> gateway</span>
        <span class="mmetric"><span x-text="promptsList.length"></span> prompts</span>
        <span class="mmetric warn" x-show="(runtimeMetrics.inbox_raw||0)>0" x-text="(runtimeMetrics.inbox_raw||0) + ' new'"></span>
        <span class="news" x-show="newsFor(['inbox']).length">
          <template x-for="n in newsFor(['inbox'])" :key="n.id">
            <span class="news-tag" :class="n.kind" x-text="n.text"></span>
          </template>
        </span>
        <span class="caret">&#9656;</span>
      </div>
      <div class="pane" x-show="!minMid" style="flex:1; display:flex; flex-direction:column; overflow:hidden;">
        <div class="pane-head">
          <h3>Sources &amp; Flow <span class="badge" x-text="entity"></span></h3>
          <button class="mini ghost" style="margin-left:auto" @click="toggleMid()" title="Minimize">–</button>
        </div>
        <div class="src-stack" style="position:relative; z-index:1;">
          <div class="src-tier">
            <div class="lb-title"><span class="dot"></span> Inbox (raw)
              <span class="cnt chip mono" x-text="inboxRaw.length" style="margin-left:auto"></span>
            </div>
            <div class="tier-body">
              <div class="flexlist">
                <template x-for="r in inboxRaw" :key="r">
                  <span class="chip raw-chip" :data-name="r" :title="inboxRawMeta(r)" x-text="r"
                        @mouseenter="flowHover = r" @mouseleave="flowHover = null"
                        @click="openNodeDrawer('raw:' + r)"></span>
                </template>
                <span x-show="!inboxRaw.length" class="kv">empty</span>
              </div>
            </div>
          </div>
          <div class="src-tier grow">
            <div class="lb-title"><span class="dot"></span> Gateway
              <span class="cnt chip mono" x-text="gatewayCount" style="margin-left:auto"></span>
            </div>
            <div class="tier-body gw-grid">
              <template x-for="p in gatewayPillars" :key="p.name">
                <div class="gw-pillar" :style="gwPillarStyle(p.name)">
                  <div class="gw-ph" x-text="p.name"></div>
                  <div class="gw-aspects">
                    <template x-for="a in p.aspects" :key="a.name">
                      <div class="gw-aspect">
                        <div class="gw-ah" x-text="a.name"></div>
                        <div class="gw-fgs">
                          <template x-for="fg in a.fgs" :key="fg.name">
                            <div class="fg-block">
                              <span class="chip fg fg-chip" :data-name="fg.name" :data-path="fg.path" :title="fg.path"
                                    @click="fg.open=!fg.open; openNodeDrawer('gw:' + fg.path)"
                                    @mouseenter="flowHover = fg.path" @mouseleave="flowHover = null">
                                <span class="fg-caret" :class="{open: fg.open}">&#9656;</span>
                                <span x-text="fg.name"></span>
                                <span class="cnt mono" x-text="fg.count" style="margin-left:4px"></span>
                              </span>
                              <template x-if="fg.open">
                                <div class="fg-items">
                                  <template x-for="it in fg.items" :key="it">
                                    <span class="chip sm" x-text="it"></span>
                                  </template>
                                </div>
                              </template>
                            </div>
                          </template>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </template>
              <span x-show="!gatewayCount" class="kv">empty</span>
            </div>
          </div>
          <div class="src-tier">
            <div class="lb-title"><span class="dot"></span>
              <span x-text="isOs ? 'OS Prompts' : 'Project Data'"></span>
              <span class="cnt chip mono" x-text="promptsList.length" style="margin-left:auto"></span>
            </div>
            <div class="tier-body">
              <div class="flexlist">
                <template x-for="p in promptsList" :key="p.fullName || p.name">
                  <span class="chip mono prompt-chip" :data-name="p.fullName || p.name" :class="{ matched: promptPillar(p.name) }" :style="promptPillarStyle(p.name)" :title="p.role + ' — ' + (p.when_to_use||'')" x-text="p.name" @click="openPrompt(p)"
                        @mouseenter="flowHover = p.fullName || p.name" @mouseleave="flowHover = null"></span>
                </template>
                <span x-show="!promptsList.length" class="kv">none indexed</span>
              </div>
            </div>
          </div>
        </div>
        <canvas id="flow-rel" style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:10;"></canvas>
        <div class="flowbar" style="margin-top:4px; z-index:11; position:relative; display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
          <span class="flow-hint" style="white-space:nowrap;">hover a chip to highlight its data pipelines</span>
          <template x-for="(color, name) in pillarPalette" :key="name">
            <span style="display:inline-flex;align-items:center;gap:4px;font-size:.63rem;color:var(--muted);white-space:nowrap;">
              <span :style="'width:7px;height:7px;border-radius:50%;background:'+color+';flex-shrink:0'"></span>
              <span x-text="name"></span>
            </span>
          </template>
        </div>
      </div>
    </section>
  </main>

  <!-- ================= BOTTOM METRICS BAR ================= -->
  <footer class="bottombar">

    <!-- ── Left: Runtime KPI badges ── -->
    <div class="tb-group-left">
      <span class="bm" title="Total active missions"><b x-text="kpi.missions">0</b> Missions</span>
      <span class="bm" title="Total pillars"><b x-text="kpi.pillars">0</b> Pillars</span>
      <span class="bm" title="Evolution items"><b x-text="kpi.evo">0</b> Evolution</span>
      <span class="bm bm-reviewq" :class="rq.length > 0 ? 'warn bm-pulse-warn' : ''" title="Items pending review"><b x-text="rq.length">0</b> Review Q</span>
      <span class="bm" title="Backlog items"><b x-text="bl.length">0</b> Backlog</span>
      <span class="bm" :class="inboxRaw.length > 10 ? 'warn' : ''" title="Inbox messages"><b x-text="inboxRaw.length">0</b> Inbox</span>
      <span class="bm" :class="gatewayCount > 5 ? 'warn' : ''" title="Active gateway tasks"><b x-text="gatewayCount">0</b> Gateway</span>
      <span class="bm" title="Loaded prompts"><b x-text="promptsList.length">0</b> Prompts</span>
    </div>

    <!-- ── Separator ── -->
    <div class="tb-bb-sep" aria-hidden="true"></div>

    <!-- ── Right: Config control group (clickable) ── -->
    <div class="tb-group-right" @click="toolboxesOpen = !toolboxesOpen" title="Click to open Toolboxes Control">
      <span class="bm-config-label">&#128736; Config</span>
      <span class="bm" title="Active / total domains"><b x-text="activeDomainsCount"></b>/<b x-text="totalDomainsCount"></b> Domains</span>
      <span class="bm" title="Active / total toolboxes"><b x-text="activeToolboxesCount"></b>/<b x-text="totalToolboxesCount"></b> Toolboxes</span>
      <span class="bm" title="Active / total skills"><b x-text="activeSkillsCount"></b>/<b x-text="totalSkillsCount"></b> Skills</span>
      <span class="bm" title="Active / total agents"><b x-text="activeAgentsCount"></b>/<b x-text="totalAgentsCount"></b> Agents</span>
    </div>

  </footer>

  <!-- ================= TOOLBOXES POPUP ================= -->
  <div class="popup" x-show="toolboxesOpen" x-transition @click.outside="toolboxesOpen=false">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3>Toolboxes Control</h3>
      <button class="mini ghost" @click="toolboxesOpen=false">Close</button>
    </div>
    <div class="tb-grid">
      <template x-for="(domVal, domName) in toolboxDomains" :key="domName">
        <div class="tb-card">
          <div class="tbc-head">
            <strong x-text="domName"></strong>
            <span class="sw" :class="{on:domVal.status}" @click="toggleToolbox(['toolboxes', domName], !domVal.status)"></span>
          </div>
          <template x-for="(catVal, catName) in (domVal.toolboxes || {})" :key="catName">
            <div class="tb-cat">
              <div class="tb-cat-head">
                <span x-text="catName"></span>
                <span class="sw sm" :class="{on:catVal.status}" @click="toggleToolbox(['toolboxes', domName, 'toolboxes', catName], !catVal.status)"></span>
              </div>
              <template x-if="catVal.agents && typeof catVal.agents === 'object' && Object.keys(catVal.agents).length">
                <div>
                  <div class="tb-sub">Agents</div>
                  <template x-for="(agVal, agName) in catVal.agents" :key="agName">
                    <template x-if="agVal && typeof agVal === 'object' && 'status' in agVal">
                      <div class="tb-item">
                        <div>
                          <span class="nm" x-text="agName"></span>
                          <select class="mat-select" :value="agVal.maturity||'stub'"
                            @change="patchToolbox([domName,'toolboxes',catName,'agents',agName], 'maturity', $event.target.value)">
                            <option>stub</option><option>functional</option><option>hardened</option><option>battle-tested</option>
                          </select>
                          <small class="desc" x-text="agVal.role || agVal.description || ''"></small>
                        </div>
                        <span class="sw sm" :class="{on:agVal.status}"
                          @click="toggleToolbox(['toolboxes', domName, 'toolboxes', catName, 'agents', agName], !agVal.status)"></span>
                      </div>
                    </template>
                  </template>
                </div>
              </template>
              <template x-if="catVal.skills && typeof catVal.skills === 'object' && Object.keys(catVal.skills).length">
                <div>
                  <div class="tb-sub">Skills</div>
                  <template x-for="(skVal, skName) in catVal.skills" :key="skName">
                    <template x-if="skVal && typeof skVal === 'object' && 'status' in skVal">
                      <div class="tb-item">
                        <div>
                          <span class="nm" x-text="skName"></span>
                          <select class="mat-select" :value="skVal.maturity||'stub'"
                            @change="patchToolbox([domName,'toolboxes',catName,'skills',skName], 'maturity', $event.target.value)">
                            <option>stub</option><option>functional</option><option>hardened</option><option>battle-tested</option>
                          </select>
                          <small class="desc" x-text="skVal.role || skVal.description || ''"></small>
                        </div>
                        <span class="sw sm" :class="{on:skVal.status}"
                          @click="toggleToolbox(['toolboxes', domName, 'toolboxes', catName, 'skills', skName], !skVal.status)"></span>
                      </div>
                    </template>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>

  <!-- ================= ECOSYSTEM POPOVER ================= -->
  <div class="eco-pop" x-show="ecoOpen" x-transition @click.outside="ecoOpen=false">
    <h3>&#9881; Missions Config — Trig / Exec / Arch</h3>
    <div class="eco-toggles">
      <template x-for="t in missionToggles" :key="t.g + t.m">
        <span class="kpi-ms" :class="{warn: !t.on}"
          @click="toggleMission(t)"
          :title="t.g + ' / ' + t.m">
          <b x-text="t.g"></b> <span x-text="t.l"></span>
          <span x-text="t.on ? '✓' : '✗'"></span>
        </span>
      </template>
    </div>
  </div>

  <!-- ================= MISSION WINDOW ================= -->
  <div class="floating mission-window" x-show="activeMission" x-transition :style="'left:'+win.x+'px;top:'+win.y+'px;width:520px;max-height:75vh'">
    <div class="fw-head" @mousedown="startDrag($event)">
      <b x-text="activeMission?.name"></b>
      <span class="pill" :class="prioClass(activeMission?._priority)" x-text="activeMission?._priority"></span>
      <span class="save-status" :class="missionSave.status" x-show="missionSave.status!=='idle'" x-text="missionSave.msg" style="margin-left:4px"></span>
      <button @click="cancelMission()">&#10005;</button>
    </div>
    <template x-if="missionSave.status==='saving'">
      <div class="hint" style="margin:0 8px 4px">&#9203; Saving… your changes are being written to the mission file.</div>
    </template>
    <template x-if="activeMission && missionNeedsTasks(activeMission.name)">
      <div class="fq-banner">&#9888; AGENT ACTION REQUIRED — fill_queue.missions flags this mission: <b>generate tasks from its goals</b>. The daemon never creates tasks programmatically. Read this section before doing anything with the mission.</div>
    </template>
    <div class="fw-body">
      <div class="field">
        <label>Objective <span class="rw-badge">RW</span></label>
        <textarea class="rw-textarea" x-model="activeMission._objective" rows="2" @input="markUnsaved()"></textarea>
      </div>
      <div style="display:flex;gap:10px">
        <div class="field" style="flex:1"><label>Priority <span class="rw-badge">RW</span></label>
          <select class="rw-select" x-model="activeMission._priority" @change="markUnsaved()">
            <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
          </select></div>
        <div class="field" style="flex:1"><label>State.class <span class="rw-badge">RW</span></label>
          <select class="rw-select" x-model="activeMission._stateClass" @change="markUnsaved()">
            <option>PLANNING</option><option>EXECUTION</option><option>DONE</option>
          </select></div>
        <div class="field" style="flex:1"><label>State.progress <span class="rw-badge">RW</span></label>
          <select class="rw-select" x-model="activeMission._stateProgress" @change="markUnsaved()">
            <option>pending</option><option>in-progress</option><option>completed</option><option>blocked</option>
          </select></div>
      </div>
      <template x-if="activeMission && activeMission.readiness">
        <div class="field"><label>Readiness · ready_to_advance <span class="rw-badge">RW</span></label>
          <span class="tog" :class="{on:activeMission.readiness.ready_to_advance}" @click="setReady(activeMission.name, !activeMission.readiness.ready_to_advance)" x-text="activeMission.readiness.ready_to_advance?'true':'false'"></span>
        </div>
      </template>
      <div class="field"><label>Depends on</label><div class="val" x-text="arr(activeMission?.depends_on)"></div></div>

      <template x-if="activeMission && activeMission._model==='standard'">
        <div class="sub-sec">
          <div class="sub-head"><h4>Rounds</h4></div>
          <label style="font-size:.72rem;color:var(--muted)"><input type="checkbox" x-model="activeMission._roundsStatus" @change="markUnsaved()"> status — repeat after completion</label>
          <label style="font-size:.72rem;color:var(--muted)"><input type="checkbox" x-model="activeMission._roundsPersistent" @change="markUnsaved()"> persistent — unlimited (ignore max)</label>
          <div class="field"><label>max (rounds)</label><input type="number" class="rw-input" style="width:90px" x-model="activeMission._roundsMax" @input="markUnsaved()" /></div>
        </div>
      </template>

      <template x-if="activeMission && activeMission._model==='research'">
        <div class="sub-sec">
          <div class="sub-head"><h4>Research params</h4></div>
          <div class="field"><label>Subjects (comma-sep)</label><input class="rw-input" x-model="activeMission._subjects" @input="markUnsaved()" placeholder="e.g. auth, billing" /></div>
          <template x-for="lf in [{f:'_pillars',l:'Pillars'},{f:'_evoObj',l:'Evolution objectives'}]" :key="lf.f">
            <div class="field">
              <label x-text="lf.l"></label>
              <div style="display:flex;gap:6px;align-items:center">
                <select class="rw-select" :value="listMode(activeMission[lf.f])" @change="setListMode(lf.f, $event.target.value)">
                  <option value="none">none</option><option value="all">all</option><option value="list">list</option>
                </select>
                <input class="rw-input" style="flex:1" x-show="listMode(activeMission[lf.f])==='list'" :value="listToCsv(activeMission[lf.f])" @input="onListCsv(lf.f, $event.target.value)" placeholder="a, b, c" />
              </div>
            </div>
          </template>
          <div class="sub-head" style="margin-top:8px"><h4>Levels</h4></div>
          <div style="display:flex;gap:8px">
            <div class="field" style="flex:1"><label>Depth</label>
              <select class="rw-select" x-model="activeMission._depth" @change="markUnsaved()"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></div>
            <div class="field" style="flex:1"><label>Details</label>
              <select class="rw-select" x-model="activeMission._details" @change="markUnsaved()"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></div>
            <div class="field" style="flex:1"><label>Precise</label>
              <select class="rw-select" x-model="activeMission._precise" @change="markUnsaved()"><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></div>
          </div>
          <div class="sub-head" style="margin-top:8px"><h4>Sources</h4></div>
          <div style="display:flex;flex-wrap:wrap;gap:10px">
            <label style="font-size:.72rem;color:var(--muted)"><input type="checkbox" x-model="activeMission._srcTraining" @change="markUnsaved()"> training_data</label>
            <label style="font-size:.72rem;color:var(--muted)"><input type="checkbox" x-model="activeMission._srcWeb" @change="markUnsaved()"> web</label>
            <label style="font-size:.72rem;color:var(--muted)"><input type="checkbox" x-model="activeMission._srcNbLm" @change="markUnsaved()"> notebook_lm</label>
            <label style="font-size:.72rem;color:var(--muted)"><input type="checkbox" x-model="activeMission._srcYt" @change="markUnsaved()"> youtube</label>
          </div>
        </div>
      </template>

      <template x-if="activeMission && activeMission._model==='evolution'">
        <div class="sub-sec">
          <div class="sub-head"><h4>Evolution params</h4></div>
          <div class="field"><label>Type</label>
            <select class="rw-select" x-model="activeMission._type" @change="markUnsaved()"><option>FAST</option><option>DEEP</option><option>RESEARCH</option><option>INBOX</option></select></div>
          <template x-for="lf in [{f:'_pillars',l:'Pillars'},{f:'_evoObj',l:'Evolution objectives'},{f:'_actionGates',l:'Action gates'}]" :key="lf.f">
            <div class="field">
              <label x-text="lf.l"></label>
              <div style="display:flex;gap:6px;align-items:center">
                <select class="rw-select" :value="listMode(activeMission[lf.f])" @change="setListMode(lf.f, $event.target.value)">
                  <option value="all">all</option><option value="list">list</option><option value="none">none</option>
                </select>
                <input class="rw-input" style="flex:1" x-show="listMode(activeMission[lf.f])==='list'" :value="listToCsv(activeMission[lf.f])" @input="onListCsv(lf.f, $event.target.value)" placeholder="a, b, c" />
              </div>
            </div>
          </template>
          <div class="sub-head" style="margin-top:8px"><h4>Readiness</h4></div>
          <label style="font-size:.72rem;color:var(--muted)"><input type="checkbox" x-model="activeMission._readyParams" @change="markUnsaved()"> mission_params_read</label>
          <label style="font-size:.72rem;color:var(--muted)"><input type="checkbox" x-model="activeMission._readyPrompt" @change="markUnsaved()"> evolution_os_prompt_read</label>
          <label style="font-size:.72rem;color:var(--muted)"><input type="checkbox" x-model="activeMission._readyAdvance" @change="markUnsaved()"> ready_to_advance</label>
        </div>
      </template>

      <template x-for="subKey in missionSubKeys()" :key="subKey">
        <div class="sub-sec">
          <div class="sub-head">
            <h4 x-text="missionSubTitle(subKey)"></h4>
            <button class="mini" @click="addSubItem(subKey)">+ add</button>
          </div>
          <template x-for="si in subItems(subKey)" :key="si.name">
            <div class="sub-card">
              <div class="sub-card-top">
                <b x-text="si.name"></b>
                <button class="x" @click="removeSubItem(subKey, si.name)">&#10005;</button>
              </div>
              <template x-for="f in subFieldDefs(subKey)" :key="f.k">
                <div class="field" style="margin:4px 0">
                  <label x-text="f.l"></label>
                  <textarea x-show="f.t==='ta'" class="rw-textarea" rows="2"
                    x-model="si.entry[f.k]" @input="subItemField(subKey, si.name, f.k, si.entry[f.k])"></textarea>
                  <select x-show="f.t==='sel'" class="rw-select"
                    x-model="si.entry[f.k]" @change="subItemField(subKey, si.name, f.k, si.entry[f.k])">
                    <template x-for="o in f.opts" :key="o"><option x-text="o"></option></template>
                  </select>
                  <input x-show="f.t==='num'" type="number" class="rw-input" style="width:80px"
                    x-model="si.entry[f.k]" @input="subItemField(subKey, si.name, f.k, si.entry[f.k])" />
                  <input x-show="f.t==='chk'" type="checkbox"
                    x-model="si.entry[f.k]" @change="subItemField(subKey, si.name, f.k, si.entry[f.k])" />
                  <div x-show="f.t==='list'" class="list-edit">
                    <template x-for="(li,idx) in (si.entry[f.k]||[])" :key="idx">
                      <div class="list-row">
                        <input class="rw-input" style="flex:1" x-model="si.entry[f.k][idx]"
                          @input="subItemField(subKey, si.name, f.k, si.entry[f.k])" />
                        <button class="x" @click="subItemListPop(subKey, si.name, f.k, idx)">&#10005;</button>
                      </div>
                    </template>
                    <button class="mini" @click="subItemListPush(subKey, si.name, f.k)">+ line</button>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <span x-show="!subItems(subKey).length" class="kv" x-text="'no ' + missionSubTitle(subKey).toLowerCase() + ' yet'"></span>
        </div>
      </template>

      <template x-if="activeMission && activeMission._model==='standard' && activeMission._goals && Object.keys(activeMission._goals).length && (!activeMission._tasks || !Object.keys(activeMission._tasks).length)">
        <div class="hint">&#9881; AUTO MODE: tasks will be generated from your goals on next sync (save goals first).</div>
      </template>

      <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
        <button class="mini primary" @click="saveMission()" :disabled="missionSave.status==='saving'">Save</button>
        <button class="mini" @click="cancelMission()">Cancel</button>
        <button class="mini" @click="advanceMission(activeMission.name)" style="margin-left:auto">Advance stage</button>
        <button class="mini danger" @click="deleteMission()" :disabled="missionSave.status==='saving'">Delete</button>
      </div>
    </div>
  </div>

  <!-- ================= MISSION COMPOSER ================= -->
  <div class="floating composer" x-show="missionComposer" x-transition :style="'left:'+cwin.x+'px;top:'+cwin.y+'px;width:420px'">
    <div class="fw-head" @mousedown="startDragC($event)"><b>Launch Mission</b><button @click="missionComposer=false">&#10005;</button></div>
    <div class="fw-body">
      <div class="field"><label>Name</label><input type="text" x-model="newMission.name" placeholder="my_mission" style="width:100%" /></div>
      <div class="field"><label>Objective</label><textarea x-model="newMission.objective" rows="3" style="width:100%;font-family:var(--mono);font-size:.8rem"></textarea></div>
      <div class="field"><label>Bucket</label>
        <select x-model="newMission.bucket" style="width:100%">
          <option value="standard">standard</option>
          <option value="research">research</option>
          <option value="evolution">evolution</option>
        </select>
      </div>
      <div class="field" x-show="newMission.bucket === 'evolution'"><label>Evolution Mode</label>
        <select x-model="newMission.evoMode" style="width:100%">
          <option value="FAST">FAST</option>
          <option value="DEEP">DEEP</option>
          <option value="RESEARCH">RESEARCH</option>
          <option value="INBOX">INBOX</option>
        </select>
      </div>
      <div class="field"><label>Priority</label>
        <select x-model="newMission.priority" style="width:100%">
          <option>LOW</option><option>MEDIUM</option><option>HIGH</option><option>CRITICAL</option>
        </select>
      </div>
      <button class="mini" @click="launchMission()" style="width:100%;margin-top:6px">Create mission</button>
    </div>
  </div>

  <!-- ================= PROMPT WINDOW ================= -->
  <div class="floating prompt-window" x-show="activePrompt" x-transition :style="'left:'+pwin.x+'px;top:'+pwin.y+'px;width:440px;max-height:55vh'">
    <div class="fw-head" @mousedown="startDragP($event)">
      <b x-text="activePrompt?.name"></b><button @click="activePrompt=null">&#10005;</button>
    </div>
    <div class="fw-body">
      <div class="field"><label>Role</label><div class="val ro-val" x-text="activePrompt?.role"></div></div>
      <div class="field"><label>Contains</label>
        <div class="flexlist">
          <template x-for="c in (Array.isArray(activePrompt?.contains) ? activePrompt.contains : [])" :key="c">
            <span class="chip mono" x-text="c"></span>
          </template>
        </div>
      </div>
      <div class="field"><label>When to use</label><div class="val ro-val" x-text="activePrompt?.when_to_use"></div></div>
      <div class="field"><label>Triggers</label>
        <div class="flexlist">
          <template x-for="t in (Array.isArray(activePrompt?.triggers) ? activePrompt.triggers : [])" :key="t">
            <span class="chip mono" x-text="t"></span>
          </template>
        </div>
      </div>
      <div class="field"><label>Path</label><div class="val ro-val" x-text="activePrompt?.path || '—'"></div></div>
    </div>
  </div>

  <!-- ================= REVIEW FEEDBACK MODAL (Review Queue) ================= -->
  <div class="modal-overlay" x-show="reviewModal.open" x-transition @click.self="reviewModal.open=false"
       style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:50">
    <div class="floating review-window" x-show="reviewModal.open" :style="'left:'+rwin.x+'px;top:'+rwin.y+'px;width:520px;max-height:75vh'">
      <div class="fw-head" @mousedown="drag('rwin',$event)">
        <b>Review Item</b>
        <span class="save-status" :class="reviewSave.status" x-show="reviewSave.status!=='idle'" x-text="reviewSave.msg" style="margin-left:4px"></span>
        <button style="margin-left:auto" @click="reviewModal.open=false">&#10005;</button>
      </div>
      <div class="fw-body">
        <div class="field">
          <label>Item</label>
          <div class="val" style="word-break:break-word" x-text="reviewModal.item"></div>
        </div>
        <div class="field">
          <label>Feedback <span class="rw-badge">RW</span></label>
          <textarea class="rw-textarea" x-model="reviewModal.feedback" rows="5" @input="markReviewDirty()"
            placeholder="e.g. keep this — needs another pass on X… (leave empty to clear feedback)"></textarea>
          <span class="hint" style="margin-top:6px">Save stores this feedback for agents and keeps the item in the queue. Delete removes the item entirely.</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
          <button class="mini primary" @click="saveReview()" :disabled="reviewSave.status==='saving'">Save</button>
          <button class="mini" @click="reviewModal.open=false">Cancel</button>
          <button class="mini danger" @click="deleteReview()" :disabled="reviewSave.status==='saving'" style="margin-left:auto">Delete</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= REVIEW FEEDBACK MODAL (Backlog) ================= -->
  <div class="modal-overlay" x-show="blModal.open" x-transition @click.self="blModal.open=false"
       style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:50">
    <div class="floating review-window" x-show="blModal.open" :style="'left:'+bwin.x+'px;top:'+bwin.y+'px;width:520px;max-height:75vh'">
      <div class="fw-head" @mousedown="drag('bwin',$event)">
        <b>Backlog Item</b>
        <span class="save-status" :class="blSave.status" x-show="blSave.status!=='idle'" x-text="blSave.msg" style="margin-left:4px"></span>
        <button style="margin-left:auto" @click="blModal.open=false">&#10005;</button>
      </div>
      <div class="fw-body">
        <div class="field">
          <label>Item</label>
          <div class="val" style="word-break:break-word" x-text="blModal.item"></div>
        </div>
        <div class="field">
          <label>Feedback <span class="rw-badge">RW</span></label>
          <textarea class="rw-textarea" x-model="blModal.feedback" rows="5" @input="markBlDirty()"
            placeholder="e.g. keep this — revisit after Q3… (leave empty to clear feedback)"></textarea>
          <span class="hint" style="margin-top:6px">Save stores this feedback for agents and keeps the item in the backlog. Delete removes the item entirely.</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
          <button class="mini primary" @click="saveBlReview()" :disabled="blSave.status==='saving'">Save</button>
          <button class="mini" @click="blModal.open=false">Cancel</button>
          <button class="mini danger" @click="deleteBlReview()" :disabled="blSave.status==='saving'" style="margin-left:auto">Delete</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= PILLARS MANAGER MODAL ================= -->
  <div class="modal-overlay" x-show="pillarModal.open" x-transition @click.self="pillarModal.open=false"
       style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:50">
    <div class="floating review-window" x-show="pillarModal.open" :style="'left:'+plwin.x+'px;top:'+plwin.y+'px;width:560px;max-height:80vh'">
      <div class="fw-head" @mousedown="drag('plwin',$event)">
        <b>Pillars Manager</b>
        <span class="ro-badge" style="margin-left:6px" x-text="pillarActives.length + ' active'"></span>
        <button style="margin-left:auto" @click="pillarModal.open=false">&#10005;</button>
      </div>
      <div class="fw-body" style="overflow:auto">
        <div class="sub-label">Actives</div>
        <div class="flexlist">
          <template x-for="p in pillarActives" :key="p">
            <span class="chip editable mono" @click="openActivePillar(p)" :title="'Click to edit: ' + p">
              <span x-text="p"></span>
            </span>
          </template>
          <span x-show="!pillarActives.length" class="kv">none active</span>
        </div>

        <div class="sub-label" style="margin-top:8px">Validated</div>
        <template x-for="pv in pillarValidated" :key="pv.name">
          <div class="validated-card">
            <div class="vc-head">
              <b x-text="pv.name"></b>
              <span class="tog" :class="{on:pv._active}" x-text="pv._active?'ACTIVE':'inactive'"
                @click="togglePillarActive(pv.name, 'validated')" style="cursor:pointer"></span>
              <button class="mini" style="margin-left:6px" @click="openPillarEditor(pv.name, 'validated')">Edit</button>
              <button class="mini danger" @click="deletePillarEntry('validated', pv.name)">Delete</button>
            </div>
            <div class="vc-field"><label>description</label>
              <input type="text" :value="pv.description||''" @change="updatePillarValidatedField(pv.name, 'description', $event.target.value)" /></div>
            <div class="vc-field"><label>why</label>
              <input type="text" :value="pv.why||''" @change="updatePillarValidatedField(pv.name, 'why', $event.target.value)" /></div>
          </div>
        </template>
        <div class="extend-form">
          <input type="text" x-model="newValidatedPillar.name" placeholder="pillar name" />
          <input type="text" x-model="newValidatedPillar.description" placeholder="description" />
          <input type="text" x-model="newValidatedPillar.why" placeholder="why" />
          <button class="mini" @click="addValidatedPillarEntry()">+ Add Validated Pillar</button>
        </div>

        <div class="sub-label" style="margin-top:8px">Suggestions <span class="hint-inline">(active shown first)</span></div>
        <template x-for="ps in pillarSuggestions" :key="ps.name">
          <div class="suggestion-card">
            <div class="sc-head">
              <b x-text="ps.name"></b>
              <button class="mini" :class="ps._active?'danger':'primary'" @click="togglePillarActive(ps.name, 'suggestions')"
                x-text="ps._active ? 'Deactivate' : 'Activate'"></button>
              <button class="mini" style="margin-left:6px" @click="openPillarEditor(ps.name, 'suggestions')">Edit</button>
              <button class="mini danger" @click="deletePillarEntry('suggestions', ps.name)">Delete</button>
            </div>
            <div class="sc-detail" x-show="ps.description"><span class="kv" x-text="ps.description"></span></div>
            <div class="sc-detail" x-show="ps.why"><span class="kv" x-text="'Why: ' + ps.why"></span></div>
          </div>
        </template>
        <span x-show="!pillarSuggestions.length" class="kv">no suggestions</span>
      </div>
    </div>
  </div>

  <!-- ================= EVOLUTION OBJ MANAGER MODAL ================= -->
  <div class="modal-overlay" x-show="evoModal.open" x-transition @click.self="evoModal.open=false"
       style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:50">
    <div class="floating review-window" x-show="evoModal.open" :style="'left:'+evwin.x+'px;top:'+evwin.y+'px;width:560px;max-height:80vh'">
      <div class="fw-head" @mousedown="drag('evwin',$event)">
        <b>Evolution OBJ Manager</b>
        <span class="ro-badge" style="margin-left:6px" x-text="evoActives.length + ' active'"></span>
        <button style="margin-left:auto" @click="evoModal.open=false">&#10005;</button>
      </div>
      <div class="fw-body" style="overflow:auto">
        <div class="sub-label">Actives</div>
        <div class="flexlist">
          <template x-for="e in evoActives" :key="e">
            <span class="chip editable mono" @click="openActiveEvo(e)" :title="'Click to edit: ' + e">
              <span x-text="e"></span>
            </span>
          </template>
          <span x-show="!evoActives.length" class="kv">none active</span>
        </div>

        <div class="sub-label" style="margin-top:8px">Validated</div>
        <template x-for="ev in evoValidated" :key="ev.name">
          <div class="validated-card">
            <div class="vc-head">
              <b x-text="ev.name"></b>
              <span class="tog" :class="{on:ev._active}" x-text="ev._active?'ACTIVE':'inactive'"
                @click="toggleEvoActive(ev.name, 'validated')" style="cursor:pointer"></span>
              <button class="mini" style="margin-left:6px" @click="openEvoEditor(ev.name, 'validated')">Edit</button>
              <button class="mini danger" @click="deleteEvoEntry('validated', ev.name)">Delete</button>
            </div>
            <div class="vc-field"><label>description</label>
              <input type="text" :value="ev.description||''" @change="patch('runtime', ['evolution_objectives','validated',ev.name,'description'], $event.target.value)" /></div>
            <div class="vc-field"><label>objective</label>
              <input type="text" :value="ev.objective||''" @change="patch('runtime', ['evolution_objectives','validated',ev.name,'objective'], $event.target.value)" /></div>
          </div>
        </template>
        <div class="extend-form">
          <input type="text" x-model="newValidatedEvo.name" placeholder="objective name" />
          <input type="text" x-model="newValidatedEvo.description" placeholder="description" />
          <input type="text" x-model="newValidatedEvo.objective" placeholder="objective" />
          <button class="mini" @click="addValidatedEvoEntry()">+ Add Validated Objective</button>
        </div>

        <div class="sub-label" style="margin-top:8px">Suggestions <span class="hint-inline">(active shown first)</span></div>
        <template x-for="es in evoSuggestions" :key="es.name">
          <div class="suggestion-card">
            <div class="sc-head">
              <b x-text="es.name"></b>
              <button class="mini" :class="es._active?'danger':'primary'" @click="toggleEvoActive(es.name, 'suggestions')"
                x-text="es._active ? 'Deactivate' : 'Activate'"></button>
              <button class="mini" style="margin-left:6px" @click="openEvoEditor(es.name, 'suggestions')">Edit</button>
              <button class="mini danger" @click="deleteEvoEntry('suggestions', es.name)">Delete</button>
            </div>
            <div class="sc-detail" x-show="es.description"><span class="kv" x-text="es.description"></span></div>
            <div class="sc-detail" x-show="es.objective"><span class="kv" x-text="'Objective: ' + es.objective"></span></div>
          </div>
        </template>
        <span x-show="!evoSuggestions.length" class="kv">no suggestions</span>
      </div>
    </div>
  </div>

  <!-- ================= REVIEW QUEUE MANAGER MODAL ================= -->
  <div class="modal-overlay" x-show="rqManager.open" x-transition @click.self="rqManager.open=false"
       style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:50">
    <div class="floating review-window" x-show="rqManager.open" :style="'left:'+rwin.x+'px;top:'+rwin.y+'px;width:560px;max-height:80vh'">
      <div class="fw-head" @mousedown="drag('rwin',$event)">
        <b>Review Queue Manager</b>
        <span class="ro-badge" style="margin-left:6px" x-text="rq.length + ' items'"></span>
        <button style="margin-left:auto" @click="rqManager.open=false">&#10005;</button>
      </div>
      <div class="fw-body" style="overflow:auto">
        <div class="sub-label">Items</div>
        <template x-for="(it,i) in rq" :key="i">
          <div class="manager-row" @click="reviewItem(i)" :title="'Edit: ' + it">
            <span class="mono" x-text="it"></span>
            <template x-if="rqFeedback[it] !== undefined"><span class="chip-note" title="you left feedback">&#128172;</span></template>
          </div>
        </template>
        <span x-show="!rq.length" class="kv">nothing pending review</span>
        <div class="add-row" style="margin-top:10px">
          <input type="text" x-model="newRqItem" placeholder="add review item…" @keydown.enter="addRqItem()" />
          <button class="mini" @click="addRqItem()">+</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= BACKLOG MANAGER MODAL ================= -->
  <div class="modal-overlay" x-show="blManager.open" x-transition @click.self="blManager.open=false"
       style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:50">
    <div class="floating review-window" x-show="blManager.open" :style="'left:'+bwin.x+'px;top:'+bwin.y+'px;width:560px;max-height:80vh'">
      <div class="fw-head" @mousedown="drag('bwin',$event)">
        <b>Backlog Manager</b>
        <span class="ro-badge" style="margin-left:6px" x-text="bl.length + ' items'"></span>
        <button style="margin-left:auto" @click="blManager.open=false">&#10005;</button>
      </div>
      <div class="fw-body" style="overflow:auto">
        <div class="sub-label">Items</div>
        <template x-for="(it,i) in bl" :key="i">
          <div class="manager-row" @click="reviewBlItem(i)" :title="'Edit: ' + it">
            <span class="mono" x-text="it"></span>
            <template x-if="blFeedback[it] !== undefined"><span class="chip-note" title="you left feedback">&#128172;</span></template>
          </div>
        </template>
        <span x-show="!bl.length" class="kv">empty</span>
        <div class="add-row" style="margin-top:10px">
          <input type="text" x-model="newBlItem" placeholder="add backlog item…" @keydown.enter="addBlItem()" />
          <button class="mini" @click="addBlItem()">+</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= PILLAR EDITOR WINDOW ================= -->
  <div class="modal-overlay" x-show="pillarEditor.open" x-transition @click.self="pillarEditor.open=false"
       style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:51">
    <div class="floating review-window" x-show="pillarEditor.open" :style="'left:'+plwin.x+'px;top:'+plwin.y+'px;width:520px;max-height:80vh'">
      <div class="fw-head" @mousedown="drag('plwin',$event)">
        <b>Edit Pillar</b>
        <span class="ro-badge" style="margin-left:6px" x-text="pillarEditor.bucket"></span>
        <button style="margin-left:auto" @click="pillarEditor.open=false">&#10005;</button>
      </div>
      <div class="fw-body">
        <div class="field"><label>Name</label>
          <input type="text" x-model="pillarEditor.name" /></div>
        <div class="field"><label>Status</label>
          <span class="tog" :class="{on:pillarEditor.status}" x-text="pillarEditor.status?'ACTIVE':'inactive'"
            @click="pillarEditor.status=!pillarEditor.status" style="cursor:pointer"></span></div>
        <div class="field"><label>description</label>
          <input type="text" x-model="pillarEditor.description" /></div>
        <div class="field"><label>why</label>
          <input type="text" x-model="pillarEditor.why" /></div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
          <button class="mini primary" @click="savePillarEditor()">Save</button>
          <button class="mini" @click="pillarEditor.open=false">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= EVOLUTION OBJ EDITOR WINDOW ================= -->
  <div class="modal-overlay" x-show="evoEditor.open" x-transition @click.self="evoEditor.open=false"
       style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:51">
    <div class="floating review-window" x-show="evoEditor.open" :style="'left:'+evwin.x+'px;top:'+evwin.y+'px;width:520px;max-height:80vh'">
      <div class="fw-head" @mousedown="drag('evwin',$event)">
        <b>Edit Evolution OBJ</b>
        <span class="ro-badge" style="margin-left:6px" x-text="evoEditor.bucket"></span>
        <button style="margin-left:auto" @click="evoEditor.open=false">&#10005;</button>
      </div>
      <div class="fw-body">
        <div class="field"><label>Name</label>
          <input type="text" x-model="evoEditor.name" /></div>
        <div class="field"><label>Status</label>
          <span class="tog" :class="{on:evoEditor.status}" x-text="evoEditor.status?'ACTIVE':'inactive'"
            @click="evoEditor.status=!evoEditor.status" style="cursor:pointer"></span></div>
        <div class="field"><label>description</label>
          <input type="text" x-model="evoEditor.description" /></div>
        <div class="field"><label>objective</label>
          <input type="text" x-model="evoEditor.objective" /></div>
        <div style="display:flex;gap:8px;align-items:center;margin-top:10px">
          <button class="mini primary" @click="saveEvoEditor()">Save</button>
          <button class="mini" @click="evoEditor.open=false">Cancel</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= CHAT ================= -->
  <div class="floating chat-window" :class="{ minimized: chatMin }" hx-ext="sse" sse-connect="/events">
    <div class="fw-head" @click="chatMin = !chatMin">
      <b>Agent</b><button @click.stop="chatMin=!chatMin" x-text="chatMin ? 'open' : '–'"></button>
    </div>
    <div class="fw-body chat-log" id="chat-log" sse-swap="message" hx-swap="beforeend"></div>
  </div>
  <div class="chat-fab" x-show="chatMin" @click="chatMin=false" @mousedown.stop="startDragFab($event)">A</div>

  <!-- ================= DETAIL DRAWER ================= -->
  <div class="detail-drawer" :class="{ open: detailDrawer.open }">
    <div class="detail-drawer-head">
      <h3 x-text="detailDrawer.title"></h3>
      <button class="x" @click="detailDrawer.open = false">&#10005;</button>
    </div>
    <div class="detail-drawer-body">
      <p style="color: var(--muted); margin-bottom: 0.85rem;" x-text="detailDrawer.desc"></p>
      <h4 style="margin-bottom: 0.4rem; text-transform: uppercase; font-size: 0.72rem; color: var(--accent-2);">Files inside:</h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.4rem; padding: 0;">
        <template x-for="item in detailDrawer.items">
          <li style="background: var(--bg); border: 1px solid var(--border-soft); border-radius: 4px; padding: 0.4rem; font-family: var(--mono); font-size: 0.72rem;">
            <b x-text="item.name || item"></b>
            <span style="display: block; font-size: 0.64rem; color: var(--muted);" x-text="item.description || ''"></span>
          </li>
        </template>
      </ul>
    </div>
  </div>
`;

const OVERRIDE_CSS = `
  /* ════════════════════════════════════════════════════════════
     TOPBAR — fluid, never clips, horizontal-scrolls if needed
     ════════════════════════════════════════════════════════════ */

  /* Container: allow horizontal scroll instead of clipping */
  .topbar {
    display: flex;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden;
    scrollbar-width: none;
    gap: clamp(0.12rem, 0.32vw, 0.42rem);
    min-height: 2.4rem;
    height: auto;
    padding: 0.26rem clamp(0.4rem, 0.7vw, 0.8rem);
    align-items: center;
  }
  .topbar::-webkit-scrollbar { display: none; }

  /* Thin vertical rule between major groups */
  .tb-sep {
    width: 1px;
    align-self: stretch;
    background: var(--border-soft, var(--border));
    flex-shrink: 0;
    margin: 0.2rem clamp(0.15rem, 0.3vw, 0.35rem);
    opacity: 0.55;
    border-radius: 1px;
  }

  /* Left group: global daemon controls — fixed priority, never compress */
  .kpis-fixed {
    display: flex;
    align-items: center;
    gap: clamp(0.1rem, 0.28vw, 0.35rem);
    flex-shrink: 0;
    flex-wrap: nowrap;
  }

  /* Freshness KPI: truncate if very long */
  .tb-freshness {
    max-width: clamp(90px, 11vw, 180px) !important;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: default !important;
  }

  /* Danger button cluster: tinted background groups the two shutdown actions */
  .tb-danger-group {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: color-mix(in srgb, var(--status-error, #e85c4a) 9%, transparent);
    border: 1px solid color-mix(in srgb, var(--status-error, #e85c4a) 28%, transparent);
    border-radius: 0.5rem;
    padding: 1px 3px;
    flex-shrink: 0;
  }
  .tb-danger-btn {
    border-color: color-mix(in srgb, var(--status-error, #e85c4a) 60%, var(--border)) !important;
    color: var(--status-error, #e85c4a) !important;
    background: transparent !important;
    transition: background 0.14s ease, color 0.14s ease !important;
  }
  .tb-danger-btn:hover {
    background: color-mix(in srgb, var(--status-error, #e85c4a) 14%, transparent) !important;
  }
  .tb-restart-btn {
    border-color: color-mix(in srgb, var(--accent, #f2a93b) 50%, var(--border)) !important;
    flex-shrink: 0;
    transition: background 0.14s ease !important;
  }
  .tb-restart-btn:hover {
    background: color-mix(in srgb, var(--accent, #f2a93b) 10%, transparent) !important;
  }

  /* KPI status dot */
  .kpi-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    flex-shrink: 0;
    background: var(--border-soft, var(--border));
    transition: background 0.2s ease, box-shadow 0.2s ease;
  }
  .kpi-dot-on  { background: var(--status-success, #3ecf79) !important; box-shadow: 0 0 0 2px color-mix(in srgb, var(--status-success, #3ecf79) 28%, transparent); }
  .kpi-dot-off { background: var(--status-error, #e85c4a) !important; }

  /* KPI label parts */
  .kpi .kpi-label { color: var(--muted); font-weight: 500; }
  .kpi .kpi-val   { font-weight: 800; }
  .kpi.warn .kpi-val { color: var(--status-warn, #f2a93b); }

  /* KPI chip: shared */
  .kpi {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 1;
    min-width: 0;
    font-size: clamp(0.48rem, 0.8vw, 0.72rem);
    padding: 0.16rem clamp(0.16rem, 0.42vw, 0.6rem);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    border-radius: 0.45rem;
    border: 0.15rem solid var(--border);
    background: var(--surface-alt);
    transition: border-color 0.14s ease, background 0.14s ease, transform 0.1s ease;
  }
  .kpi.toggle-kpi:hover {
    border-color: var(--accent, #f2a93b);
    background: color-mix(in srgb, var(--accent, #f2a93b) 8%, var(--surface-alt));
    transform: translateY(-1px);
  }
  .kpi.toggle-kpi:active { transform: translateY(0); }
  .kpi.warn { border-color: color-mix(in srgb, var(--status-warn, #f2a93b) 55%, var(--border)) !important; }

  /* Brand: always visible center anchor, never shrinks */
  .brand {
    display: flex;
    align-items: center;
    gap: clamp(4px, 0.45vw, 8px);
    flex-shrink: 0;
    white-space: nowrap;
    font-size: clamp(0.72rem, 1.05vw, 1rem);
    font-weight: 800;
    letter-spacing: 0.02rem;
  }
  .brand img {
    height: clamp(18px, 1.8vw, 26px) !important;
    width: clamp(18px, 1.8vw, 26px) !important;
  }
  .brand-name { letter-spacing: 0.03rem; }
  .brand-ver  { color: var(--muted); font-weight: 500; font-size: 0.75em; margin-top: 0.1em; }

  /* Right group: entity toggles — compress then scroll with topbar */
  .kpis-entity {
    display: flex;
    align-items: center;
    gap: clamp(0.1rem, 0.28vw, 0.3rem);
    flex-shrink: 1;
    min-width: 0;
    flex-wrap: nowrap;
    justify-content: flex-end;
  }

  /* Missions ⚙ button */
  .missions-cfg-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--accent, #f2a93b);
    color: var(--accent-contrast, #1a1a1a);
    padding: 3px clamp(4px, 0.55vw, 10px);
    border-radius: 6px;
    border: 2px solid var(--border);
    font-size: clamp(0.48rem, 0.8vw, 0.72rem);
    font-weight: 800;
    letter-spacing: 0.04rem;
    white-space: nowrap;
    flex-shrink: 0;
    cursor: pointer;
    transition: opacity 0.14s ease, transform 0.1s ease, box-shadow 0.14s ease;
  }
  .missions-cfg-btn:hover { opacity: 0.86; transform: translateY(-1px); box-shadow: 0 2px 6px color-mix(in srgb, var(--accent, #f2a93b) 30%, transparent); }
  .missions-cfg-btn:active { transform: translateY(0); opacity: 1; }

  /* Mini buttons */
  .mini {
    flex-shrink: 0;
    font-size: clamp(0.48rem, 0.78vw, 0.65rem);
    padding: clamp(1px, 0.2vw, 3px) clamp(3px, 0.45vw, 9px);
    white-space: nowrap;
    transition: background 0.14s ease, border-color 0.14s ease;
  }

  /* Controls area (theme + select) */
  .tb-controls {
    display: flex;
    align-items: center;
    gap: clamp(3px, 0.4vw, 7px);
    flex-shrink: 0;
    margin-left: clamp(3px, 0.4vw, 7px);
  }
  .theme-toggle {
    flex-shrink: 0;
    font-size: clamp(0.68rem, 0.95vw, 0.9rem);
    padding: clamp(0.18rem, 0.3vw, 0.4rem) clamp(0.3rem, 0.5vw, 0.62rem);
    transition: background 0.14s ease, transform 0.1s ease;
    cursor: pointer;
  }
  .theme-toggle:hover { transform: rotate(12deg) scale(1.1); }
  .tb-entity-select {
    font-size: clamp(0.52rem, 0.82vw, 0.78rem) !important;
    padding: clamp(0.16rem, 0.28vw, 0.38rem) clamp(0.22rem, 0.4vw, 0.65rem) !important;
    min-width: 0;
    max-width: clamp(58px, 7.5vw, 120px);
    background: var(--surface-alt);
    color: var(--text);
    border: 0.15rem solid var(--border);
    border-radius: 0.55rem;
    cursor: pointer;
    transition: border-color 0.14s ease;
  }
  .tb-entity-select:hover { border-color: var(--accent, #f2a93b); }
  .switcher { display: none !important; } /* replaced by .tb-entity-select */

  /* ════════════════════════════════════════════════════════════
     BOTTOMBAR — fixed footer, fluid width, horizontal-scrolls
     ════════════════════════════════════════════════════════════ */

  .bottombar {
    display: flex !important;
    align-items: center !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scrollbar-width: none !important;
    gap: clamp(0.15rem, 0.35vw, 0.48rem) !important;
    height: auto !important;
    min-height: 2.1rem;
    padding: 0.22rem clamp(0.45rem, 0.85vw, 1.2rem) !important;
    cursor: default;
  }
  .bottombar::-webkit-scrollbar { display: none; }

  /* Left KPI group */
  .tb-group-left {
    display: flex;
    align-items: center;
    gap: clamp(0.14rem, 0.32vw, 0.45rem);
    flex-shrink: 1;
    min-width: 0;
    flex-wrap: nowrap;
  }

  /* Bottombar vertical separator */
  .tb-bb-sep {
    width: 1px;
    height: clamp(14px, 1.4em, 22px);
    background: var(--border-soft, var(--border));
    flex-shrink: 0;
    margin: 0 clamp(2px, 0.3vw, 6px);
    opacity: 0.6;
    border-radius: 1px;
  }

  /* Right config group: clear hover/active affordance */
  .tb-group-right {
    display: flex;
    align-items: center;
    gap: clamp(0.14rem, 0.32vw, 0.45rem);
    margin-left: auto;
    flex-shrink: 0;
    flex-wrap: nowrap;
    cursor: pointer;
    padding: 0.14rem clamp(0.22rem, 0.45vw, 0.55rem);
    border-radius: 0.5rem;
    border: 1px solid transparent;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .tb-group-right:hover {
    border-color: var(--border-soft, var(--border));
    background: color-mix(in srgb, var(--accent-2, #1a8c7b) 7%, var(--surface-alt));
  }
  .tb-group-right:active {
    background: color-mix(in srgb, var(--accent-2, #1a8c7b) 14%, var(--surface-alt));
  }

  /* Config label inside right group */
  .bm-config-label {
    font-size: clamp(0.46rem, 0.72vw, 0.78rem);
    color: var(--muted);
    white-space: nowrap;
    flex-shrink: 0;
    margin-right: 2px;
  }

  /* BM badges: constrained, hover-aware */
  .bottombar .bm {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: clamp(0.44rem, 0.72vw, 0.72rem);
    padding: clamp(0.09rem, 0.18vw, 0.28rem) clamp(0.14rem, 0.3vw, 0.55rem);
    flex-shrink: 1;
    min-width: 0;
    white-space: nowrap;
    transition: border-color 0.14s ease, background 0.14s ease;
    cursor: default;
  }
  .tb-group-left .bm:hover { border-color: var(--accent, #f2a93b); }

  /* Review Q: pulse animation when count > 0 */
  @keyframes bm-pulse {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--status-warn, #f2a93b) 50%, transparent); }
    60%       { box-shadow: 0 0 0 4px color-mix(in srgb, var(--status-warn, #f2a93b) 0%, transparent); }
  }
  .bm-pulse-warn {
    animation: bm-pulse 2.5s ease-in-out infinite;
  }

  /* adjust grid height — driven by ResizeObserver */
  .grid {
    height: calc(100vh - 2.4rem - var(--bottombar-h, 2.8rem));
  }

  /* ── React root needs full height ── */
  #root { height: 100%; }

  /* ── Chat window / FAB: track real bottombar height ── */
  .chat-window {
    bottom: calc(var(--bottombar-h, 2.8rem) + 6px) !important;
  }
  .chat-fab {
    bottom: calc(var(--bottombar-h, 2.8rem) + 6px) !important;
    right: 20px !important;
  }

  /* ── Mission board cards: scroll when panel is short, don't clip ── */
  .ms-col .cards {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    scrollbar-width: thin;
    scrollbar-color: var(--border-soft) transparent;
  }

  /* ── Gateway dynamic text compression: show all items at any count ── */
  .gw-grid {
    flex-wrap: wrap !important;
    align-content: flex-start !important;
    gap: 5px !important;
  }
  .gw-pillar {
    flex: 1 1 0 !important;
    min-width: 0 !important;
    max-width: none !important;
    overflow: hidden;
  }
  .gw-aspects {
    flex-wrap: wrap !important;
    gap: 3px !important;
    justify-content: flex-start !important;
  }
  .gw-aspect {
    min-width: 0 !important;
    flex: 1 1 auto !important;
  }
  .gw-fgs {
    gap: 2px !important;
  }
  .fg-chip {
    font-size: clamp(0.4rem, 0.55vw, 0.6rem) !important;
    padding: 1px 3px !important;
    max-width: 100% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  .gw-ph {
    font-size: clamp(0.44rem, 0.6vw, 0.68rem) !important;
    padding-bottom: 2px !important;
  }
  .gw-ah {
    font-size: clamp(0.4rem, 0.5vw, 0.62rem) !important;
    margin: 1px 0 !important;
  }
  .fg-items .chip.sm {
    font-size: clamp(0.38rem, 0.48vw, 0.6rem) !important;
    padding: 0px 3px !important;
  }

  /* ── MAPPING UX: mission relationships stay legible beneath card content ── */
  .mission-board { isolation: isolate; }
  .mission-board .ms-col { position: relative; z-index: 3; transition: border-color .16s ease, background .16s ease, box-shadow .16s ease; }
  #mission-rel { z-index: 2 !important; }
  .mcard.sm { position: relative; z-index: 4; transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease, opacity .16s ease; }
  .mcard.sm:hover { transform: translate(-1px, -2px); border-color: var(--accent); box-shadow: var(--shadow); }
  .mcard.sm:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .ms-col.drag-over { border: 0.18rem dashed var(--accent) !important; background: color-mix(in srgb, var(--accent) 11%, var(--surface-alt)) !important; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--accent) 22%, transparent); }
  .ms-col .cards > .kv { display: grid; min-height: 4.5rem; place-items: center; text-align: center; border: 1px dashed var(--border-soft); border-radius: .45rem; color: var(--muted); font-style: italic; }
  .mission-map-legend { border-top: 1px dashed var(--border-soft); margin-top: .2rem; background: color-mix(in srgb, var(--surface) 55%, transparent); border-radius: .35rem; }

  /* ── MAPPING UX: stable layered flow map and traceable nodes ── */
  .src-stack { isolation: isolate; }
  #flow-rel { z-index: 2 !important; }
  .src-tier { position: relative; z-index: 3; transition: border-color .16s ease, box-shadow .16s ease; }
  .src-tier:hover { border-color: color-mix(in srgb, var(--accent-2) 65%, var(--border)); }
  .raw-chip, .prompt-chip, .chip.fg { position: relative; z-index: 4; transition: transform .14s ease, border-color .14s ease, background .14s ease, box-shadow .14s ease; }
  .raw-chip:hover, .prompt-chip:hover, .chip.fg:hover { transform: translateY(-1px); border-color: var(--accent) !important; box-shadow: 0 2px 0 color-mix(in srgb, var(--border) 55%, transparent); }
  .raw-chip:focus-visible, .prompt-chip:focus-visible, .chip.fg:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .gw-pillar { transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease; }
  .gw-pillar:hover { border-color: var(--gw-pillar, var(--accent-2)); box-shadow: 0 3px 0 color-mix(in srgb, var(--border) 65%, transparent); }
  .flowbar { z-index: 12 !important; padding: .18rem .32rem; border-radius: .35rem; background: color-mix(in srgb, var(--surface) 82%, transparent); }
  .flow-hint { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  @media (max-width: 760px) {
    .mission-board { gap: .38rem; }
    .mission-board .ms-col { padding: .32rem; }
    .src-tier { align-items: flex-start; }
    .lb-title { min-width: 5rem; }
    .raw-chip { max-width: 10rem; overflow: hidden; text-overflow: ellipsis; }
  }
  /* ════════════════════════════════════════════════════════════
     SYSTEM-WIDE UI REFINEMENT — drafting-panel hierarchy & states
     UI-only: no state, event, data, or network behavior is altered.
     ════════════════════════════════════════════════════════════ */
  :where(.pane, .rt-section, .popup, .floating, .detail-drawer, .eco-pop) {
    scrollbar-color: var(--border-soft) transparent;
  }
  :where(.pane, .rt-section, .popup, .floating, .detail-drawer, .eco-pop) ::-webkit-scrollbar { width: .42rem; height: .42rem; }
  :where(.pane, .rt-section, .popup, .floating, .detail-drawer, .eco-pop) ::-webkit-scrollbar-thumb { background: var(--border-soft); border-radius: .5rem; }

  /* Main panels become calmer, clearer working surfaces. */
  .pane {
    border: 2px solid var(--border);
    border-radius: .7rem;
    background: color-mix(in srgb, var(--surface) 84%, var(--surface-alt));
    box-shadow: 0 .16rem 0 color-mix(in srgb, var(--border) 50%, transparent);
    overflow: hidden;
  }
  .pane-head {
    min-height: 2.35rem;
    margin: 0 !important;
    padding: .46rem .58rem;
    border-bottom: 1px solid var(--border-soft);
    background: color-mix(in srgb, var(--surface-alt) 70%, var(--surface));
  }
  .pane-head h3 { color: var(--text); letter-spacing: .06em; }
  .pane-head select, .pane-head .filter {
    min-height: 1.75rem;
    border-color: var(--border-soft);
    box-shadow: none;
    transition: border-color .15s ease, background .15s ease;
  }
  .pane-head select:hover, .pane-head .filter:hover { border-color: var(--accent); }
  .pane-head .filter:focus, .pane-head select:focus { border-color: var(--accent); outline: 2px solid color-mix(in srgb, var(--accent) 30%, transparent); outline-offset: 1px; }

  /* Resizers are visible handles instead of unexplained divider lines. */
  .resizer { position: relative; background: color-mix(in srgb, var(--border-soft) 75%, transparent) !important; transition: background .16s ease; }
  .resizer::after { content: ""; position: absolute; background: var(--muted); border-radius: 99px; opacity: .4; transition: opacity .16s ease, background .16s ease; }
  .resizer.v::after { width: 2px; height: 2rem; left: 50%; top: 50%; transform: translate(-50%, -50%); }
  .resizer.h::after { height: 2px; width: 2rem; left: 50%; top: 50%; transform: translate(-50%, -50%); }
  .resizer:hover { background: color-mix(in srgb, var(--accent) 45%, var(--border-soft)) !important; }
  .resizer:hover::after { background: var(--accent-contrast); opacity: 1; }

  /* Collapsed surfaces remain informative and clearly actionable. */
  .minbar, .side-rail {
    border: 2px solid var(--border);
    border-radius: .7rem;
    background: linear-gradient(90deg, color-mix(in srgb, var(--accent-2) 9%, var(--surface-alt)), var(--surface-alt));
    box-shadow: 0 .14rem 0 color-mix(in srgb, var(--border) 40%, transparent);
    transition: border-color .15s ease, transform .15s ease;
  }
  .minbar:hover, .side-rail:hover { border-color: var(--accent); transform: translateY(-1px); }
  .side-toggle { transition: color .15s ease, background .15s ease, transform .15s ease; }
  .side-toggle:hover { transform: translateY(-50%) translateX(-2px); }

  /* Sidebar tabs form an explicit segmented navigator. */
  .right-tabs { gap: .25rem; padding: .28rem; border: 1px solid var(--border-soft); border-radius: .58rem; background: color-mix(in srgb, var(--surface-alt) 65%, var(--surface)); }
  .right-tabs button {
    border-radius: .4rem;
    transition: color .14s ease, background .14s ease, box-shadow .14s ease, transform .14s ease;
  }
  .right-tabs button:hover { background: color-mix(in srgb, var(--accent) 10%, var(--surface-alt)); color: var(--text); }
  .right-tabs button.on { box-shadow: inset 0 -2px 0 var(--accent), 0 1px 0 color-mix(in srgb, var(--border) 35%, transparent); }
  .tabpane { animation: panel-in .18s ease both; }
  @keyframes panel-in { from { opacity: .45; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }

  /* Runtime, board, and metadata groups share a compact paper-card grammar. */
  .rt-section, .tb-card, .sub-sec, .validated-card, .suggestion-card, .archived-card, .manager-row {
    box-shadow: 0 .12rem 0 color-mix(in srgb, var(--border) 22%, transparent);
    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
  }
  .rt-section:hover, .tb-card:hover, .validated-card:hover, .suggestion-card:hover, .archived-card:hover, .manager-row:hover {
    border-color: color-mix(in srgb, var(--accent-2) 54%, var(--border-soft));
    box-shadow: 0 .2rem 0 color-mix(in srgb, var(--border) 32%, transparent);
  }
  .rt-section h4, .tb-card .tbc-head strong { color: var(--text); }
  .ro-grid { background: color-mix(in srgb, var(--bg) 65%, var(--surface-alt)); }
  .ro-item { border-left: 2px solid color-mix(in srgb, var(--accent-2) 45%, var(--border-soft)); padding-left: .35rem; }
  .ro-val { letter-spacing: .01em; }
  .chip-list, .flexlist { row-gap: .36rem; }
  .chip { transition: border-color .14s ease, background .14s ease, transform .14s ease; }
  .chip:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, var(--surface-alt)); transform: translateY(-1px); }
  .chip-note { filter: saturate(.9); }

  /* Expandable rows and dense operational controls get a clear scan rhythm. */
  .ex-head, .switchrow, .manager-row { border-radius: .42rem; transition: background .14s ease, color .14s ease; }
  .ex-head { padding: .22rem .28rem; cursor: pointer; }
  .ex-head:hover { background: color-mix(in srgb, var(--accent-2) 8%, var(--surface-alt)); }
  .ex-head .caret { transition: transform .16s ease, color .16s ease; }
  .expandable.open .ex-head .caret { color: var(--accent); transform: rotate(90deg); }
  .switchrow { padding: .34rem .3rem; border-bottom: 1px dotted var(--border-soft); }
  .switchrow:last-child { border-bottom: 0; }
  .switchrow:hover { background: color-mix(in srgb, var(--accent-2) 6%, transparent); }
  .add-row { padding-top: .38rem; border-top: 1px dotted var(--border-soft); }
  .add-row .mini { min-width: 1.9rem; }
  .sub-head { padding-bottom: .3rem; border-bottom: 1px solid var(--border-soft); }
  .sub-card { border-color: var(--border-soft); transition: border-color .14s ease, background .14s ease; }
  .sub-card:hover { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 5%, var(--surface)); }
  .list-row { padding: .15rem; border-radius: .35rem; }
  .list-row:focus-within { background: color-mix(in srgb, var(--accent) 7%, transparent); }

  /* Sources & Flow content reads as a layered field guide, not a flat pile. */
  .src-tier { box-shadow: inset .22rem 0 0 color-mix(in srgb, var(--accent-2) 48%, transparent); }
  .src-tier.grow { box-shadow: inset .22rem 0 0 var(--accent-2); }
  .lb-title { color: var(--text); }
  .lb-title .dot { box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-2) 15%, transparent); }
  .gw-aspect { border-top: 1px dotted var(--border-soft); padding-top: .2rem; }
  .fg-block { border-left: 2px solid color-mix(in srgb, var(--gw-pillar, var(--accent-2)) 45%, transparent); padding-left: .28rem; }
  .fg-items { background: color-mix(in srgb, var(--surface) 58%, transparent); border-radius: 0 .35rem .35rem 0; padding: .2rem .26rem .2rem .45rem; }
  .flowbar { border: 1px solid color-mix(in srgb, var(--border-soft) 80%, transparent); }

  /* Buttons, fields and switches advertise their interaction affordance consistently. */
  .mini, .x, .fw-head button, .theme-toggle, .side-toggle, .right-tabs button {
    transition: transform .13s ease, box-shadow .13s ease, border-color .13s ease, background .13s ease;
  }
  .mini:hover:not(:disabled), .x:hover, .fw-head button:hover { transform: translateY(-1px); box-shadow: 0 2px 0 color-mix(in srgb, var(--border) 44%, transparent); }
  .mini:active:not(:disabled), .x:active, .fw-head button:active { transform: translateY(0); box-shadow: none; }
  :is(.rw-input, .rw-textarea, .rw-select, .add-row input, .vc-field input, .extend-form input, .mat-select) {
    transition: border-color .14s ease, box-shadow .14s ease, background .14s ease;
  }
  :is(.rw-input, .rw-textarea, .rw-select, .add-row input, .vc-field input, .extend-form input, .mat-select):focus {
    border-color: var(--accent) !important;
    outline: 2px solid color-mix(in srgb, var(--accent) 28%, transparent);
    outline-offset: 1px;
  }
  .rw-textarea { line-height: 1.45; }
  .field label { letter-spacing: .055em; }
  .tog, .sw { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--border) 30%, transparent); }

  /* Popups, windows, and the node drawer get a reliable visual elevation scale. */
  .popup, .eco-pop { border-radius: .8rem; box-shadow: .42rem .42rem 0 color-mix(in srgb, var(--border) 72%, transparent), 0 1rem 2rem rgba(0,0,0,.12); }
  .floating { border-radius: .8rem; box-shadow: .42rem .42rem 0 color-mix(in srgb, var(--border) 68%, transparent), 0 1rem 2rem rgba(0,0,0,.14); }
  .fw-head { background: linear-gradient(90deg, color-mix(in srgb, var(--accent-2) 8%, var(--surface-alt)), var(--surface-alt)); }
  .fw-head b { letter-spacing: .025em; }
  .fw-body { background: color-mix(in srgb, var(--surface) 80%, var(--surface-alt)); }
  .modal-overlay { backdrop-filter: blur(2px); }
  .detail-drawer { box-shadow: -.35rem 0 0 color-mix(in srgb, var(--border) 55%, transparent), -1rem 0 2rem rgba(0,0,0,.11); }
  .detail-drawer-head { background: linear-gradient(90deg, color-mix(in srgb, var(--accent-2) 10%, var(--surface-alt)), var(--surface-alt)); }
  .detail-drawer-body li { transition: border-color .14s ease, transform .14s ease; }
  .detail-drawer-body li:hover { border-color: var(--accent) !important; transform: translateX(-2px); }

  /* Small status surfaces get clearer urgency without adding new behavior. */
  .hint { border-color: color-mix(in srgb, var(--accent) 52%, var(--border)); background: color-mix(in srgb, var(--accent) 7%, var(--bg)); }
  .fq-banner { box-shadow: inset .24rem 0 0 var(--accent); }
  .save-status { box-shadow: 0 1px 0 color-mix(in srgb, var(--border) 28%, transparent); }
  .news-tag { box-shadow: 0 1px 0 color-mix(in srgb, var(--border) 30%, transparent); }
  .pill { letter-spacing: .035em; }
  .mcard.sm.arch { filter: saturate(.76); }

  @media (max-width: 760px) {
    .pane-head { padding: .38rem .45rem; gap: .35rem; }
    .pane-head h3 { font-size: .7rem; }
    .right-tabs { padding: .2rem; }
    .rt-section { padding: .55rem; margin-bottom: .55rem; }
    .popup { inset: calc(var(--topbar-h, 2.8rem) + 8px) 8px calc(var(--bottombar-h, 2.8rem) + 8px) 8px; padding: .65rem; }
    .floating { max-width: calc(100vw - 16px); }
    .ro-grid { grid-template-columns: 1fr; }
    .detail-drawer.open { width: min(22rem, 92vw); }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  }

  /* ════════════════════════════════════════════════════════════
     PRODUCTION WATER LAYOUT — content adapts to its own boundary
     Reflow and local scroll always win over collision, clipping, or
     unreadably small text. This layer is visual only.
     ════════════════════════════════════════════════════════════ */
  .grid, .col, .pane, .tabpane, .src-stack, .mission-board,
  .ms-col, .cards, .src-tier, .tier-body, .gw-grid, .gw-pillar,
  .gw-aspects, .gw-aspect, .rt-section, .popup, .floating,
  .detail-drawer, .detail-drawer-body { min-width: 0; min-height: 0; }

  /* Stable application chrome: dense controls remain reachable by scrolling. */
  .topbar, .bottombar {
    overscroll-behavior-inline: contain;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
  }
  .topbar > *, .bottombar > * { scroll-snap-align: start; }
  .topbar .kpis-fixed, .topbar .kpis-entity, .tb-controls,
  .tb-group-left, .tb-group-right { flex: 0 0 auto; min-width: max-content; }
  .topbar .kpi, .topbar .mini, .bottombar .bm { flex: 0 0 auto; }
  .topbar .tb-sep, .bottombar .tb-bb-sep { flex: 0 0 auto; }
  .tb-freshness { max-width: min(15rem, 34vw) !important; }

  /* Each primary region has a resilient header and independently scrollable body. */
  .col { overflow: hidden; }
  .pane { display: flex; flex-direction: column; }
  .pane-head { flex: 0 0 auto; flex-wrap: wrap; }
  .pane-head h3 { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .pane-head .filter { flex: 1 1 7rem; min-width: 5rem; max-width: 15rem; }
  .pane-head select { flex: 0 1 auto; max-width: min(12rem, 35vw); }
  .tabpane, .tabpane > div { min-height: 0; }
  .tabpane > div { overflow: auto !important; overscroll-behavior: contain; }

  /* Missions: readable cards, lanes scroll independently, mapping UI is isolated. */
  .mission-board { grid-template-columns: repeat(3, minmax(0, 1fr)); overflow: hidden; }
  .ms-col { overflow: hidden; }
  .ms-col .cards { overflow: auto !important; overscroll-behavior: contain; padding: .14rem; }
  .mcard.sm { flex: 0 0 auto; min-width: 0; }
  .mcard-top { min-width: 0; }
  .mcard-top b { min-width: 0; }
  .mcard.sm p { overflow-wrap: anywhere; }
  .mcard .mtags { max-height: 3.05em; overflow: hidden; }
  .mission-map-legend {
    flex: 0 0 auto;
    flex-wrap: nowrap !important;
    overflow-x: auto;
    overflow-y: hidden;
    gap: .5rem !important;
    padding: .34rem .48rem !important;
    scroll-snap-type: x proximity;
    border: 1px solid color-mix(in srgb, var(--border-soft) 78%, transparent);
  }
  .mission-map-legend > * { flex: 0 0 auto; scroll-snap-align: start; }
  .mission-map-hint { color: var(--muted); font-size: clamp(.57rem, .62vw, .68rem); white-space: nowrap; padding-right: .25rem; border-right: 1px solid var(--border-soft); }
  #mission-rel { clip-path: inset(0); }

  /* Vertical source map: inbox/gateway/prompts use the available height without losing items. */
  .src-stack { overflow: hidden; }
  .src-tier { min-height: fit-content; overflow: hidden; }
  .src-tier:not(.grow) { max-height: none; }
  .src-tier.grow { flex: 1 1 9rem; overflow: hidden; }
  .tier-body { min-width: 0; max-height: 100%; overflow: auto !important; overscroll-behavior: contain; scrollbar-width: thin; }
  .src-tier .tier-body .flexlist { overflow: visible; }
  .src-tier .gw-grid { overflow: auto !important; align-content: start; padding: .1rem; }
  .gw-grid { display: grid !important; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); }
  .gw-pillar { min-width: min(100%, 10rem) !important; overflow: visible; align-self: start; }
  .gw-aspects { width: 100%; }
  .gw-aspect { min-width: min(100%, 8.5rem) !important; flex: 1 1 8.5rem !important; }
  .gw-ph { overflow-wrap: anywhere; }
  .gw-ah { overflow-wrap: anywhere; }
  .fg-chip { min-width: 0; max-width: 100% !important; font-size: clamp(.56rem, .62vw, .7rem) !important; padding: .12rem .32rem !important; }
  .fg-chip > span:nth-child(2) { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .fg-items { max-height: 7rem; overflow: auto; }
  .raw-chip, .prompt-chip { max-width: min(100%, 16rem); overflow: hidden; text-overflow: ellipsis; }
  #flow-rel { clip-path: inset(0); }
  .flowbar {
    flex: 0 0 auto;
    flex-wrap: nowrap !important;
    overflow-x: auto;
    overflow-y: hidden;
    max-width: calc(100% - .5rem);
    scrollbar-width: none;
    scroll-snap-type: x proximity;
  }
  .flowbar::-webkit-scrollbar, .mission-map-legend::-webkit-scrollbar { display: none; }
  .flowbar > * { flex: 0 0 auto; scroll-snap-align: start; }
  .flow-hint { max-width: min(16rem, 55vw); }

  /* Runtime & Board: strict sidebar flow — cards stack, then the list scrolls. */
  .col.side > .pane { min-height: 0; overflow: hidden; }
  .right-tabs { flex: 0 0 auto; }
  .tabpane { flex: 1 1 0; min-height: 0; overflow: hidden; }
  .tabpane > div[style*="overflow-y:auto"] {
    flex: 1 1 0 !important;
    min-height: 0 !important;
    width: 100%;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: .05rem .1rem .5rem;
    box-sizing: border-box;
  }
  .tabpane > div[style*="overflow-y:auto"] > .rt-section {
    flex: 0 0 auto !important;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .rt-section { min-width: 0; overflow: hidden; }
  .rt-section h4, .ex-head { min-width: 0; flex-wrap: wrap; row-gap: .25rem; }
  .rt-section h4 .cnt { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  .ex-body { min-width: 0; overflow: hidden; }
  .ro-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 8rem), 1fr)); min-width: 0; }
  .ro-item, .ro-val, .manager-row .mono, .inspect, .field .val { min-width: 0; overflow-wrap: anywhere; word-break: break-word; }
  .chip-list, .flexlist { max-width: 100%; min-width: 0; }
  .chip { max-width: 100%; }

  /* Floating and modal surfaces obey the viewport instead of their old fixed width. */
  .popup { inset: calc(var(--topbar-h, 2.6rem) + .7rem) .8rem calc(var(--bottombar-h, 2.8rem) + .7rem) .8rem; }
  .floating { max-width: calc(100vw - 1.25rem); max-height: calc(100vh - var(--topbar-h, 2.6rem) - var(--bottombar-h, 2.8rem) - 1.25rem); }
  .mission-window, .review-window { width: min(520px, calc(100vw - 1.25rem)) !important; }
  .composer { width: min(420px, calc(100vw - 1.25rem)) !important; }
  .prompt-window { width: min(440px, calc(100vw - 1.25rem)) !important; }
  .fw-head { gap: .45rem; }
  .fw-head b { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fw-body { min-height: 0; overflow: auto; }
  .detail-drawer { max-width: 100vw; }
  .detail-drawer.open { width: min(22rem, 92vw); }
  .field > div[style*="display:flex"] { flex-wrap: wrap; }
  .field > div[style*="display:flex"] > :is(input, select) { min-width: 0; }

  /* Minimized states are intentionally compact, never a cropped maximized panel. */
  .minbar { min-width: 0; gap: .35rem; overflow-x: auto; scrollbar-width: none; }
  .minbar::-webkit-scrollbar { display: none; }
  .minbar > * { flex: 0 0 auto; }
  .side-rail { overflow-y: auto; overscroll-behavior: contain; }
  .rail-title, .rail-news, .news-tag { max-width: 100%; }

  @media (max-width: 820px) {
    .col { padding: .45rem; gap: .45rem; }
    .pane-head .filter { flex-basis: 5.75rem; }
    .mission-board { gap: .42rem; }
    .ms-col { padding: .32rem; }
    .mcard.sm { padding: .34rem !important; }
    .src-tier { padding: .4rem .45rem; gap: .42rem; }
    .lb-title { min-width: 4.35rem; font-size: .61rem; }
    .gw-grid { grid-template-columns: 1fr; }
    .gw-pillar { min-width: 0 !important; }
    .gw-aspect { min-width: 0 !important; flex-basis: 100% !important; }
    .tb-group-right { margin-left: 0; }
  }
  @media (max-width: 560px) {
    .topbar, .bottombar { gap: .28rem !important; padding-inline: .42rem !important; }
    .brand-name, .brand-ver, .tb-sep { display: none; }
    .topbar .kpi { font-size: .61rem; }
    .pane-head { padding: .38rem; }
    .pane-head h3 { flex: 1 1 100%; }
    .pane-head .filter { max-width: none; }
    .mission-board { gap: .28rem; }
    .ms-col { padding: .25rem; }
    .mcard-top b { font-size: .65rem !important; }
    .mcard.sm p { font-size: .58rem !important; }
    .mission-map-hint { display: none; }
    .flow-hint { display: none; }
    .popup { inset: calc(var(--topbar-h, 2.6rem) + .4rem) .4rem calc(var(--bottombar-h, 2.8rem) + .4rem) .4rem; }
    .floating { max-width: calc(100vw - .8rem); }
    .ro-grid { grid-template-columns: 1fr; }
  }

`;

export default function App() {
  useEffect(() => {
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    // inject responsive overrides for topbar and bottombar
    const overrideStyle = document.createElement("style");
    overrideStyle.id = "pb-overrides";
    overrideStyle.textContent = OVERRIDE_CSS;
    document.head.appendChild(overrideStyle);

    // Patch drawMissionRel: column-aware edge selection
    // Planning → always RIGHT edge; Archive → always LEFT edge.
    // Execution → LEFT edge with Planning, RIGHT edge with Archive.
    const patchedJs = appJsRaw.replace(
      `            let x0, y0, x1, y1;
            if (ptA.rect.cx < ptB.rect.cx) {
              x0 = ptA.rect.right; y0 = ptA.rect.cy;  // right border → left border
              x1 = ptB.rect.left;  y1 = ptB.rect.cy;
            } else {
              x0 = ptA.rect.left;  y0 = ptA.rect.cy;  // left border → right border
              x1 = ptB.rect.right; y1 = ptB.rect.cy;
            }`,
      `            let x0, y0, x1, y1;
            {
              const _ek = (pt, otherKlass) => {
                const k = byName[pt.name]?.klass;
                if (k === 'PLANNING') return pt.rect.right;
                if (k === 'ARCHIVE')  return pt.rect.left;
                return otherKlass === 'PLANNING' ? pt.rect.left : pt.rect.right;
              };
              const _ka = byName[ptA.name]?.klass, _kb = byName[ptB.name]?.klass;
              x0 = _ek(ptA, _kb); y0 = ptA.rect.cy;
              x1 = _ek(ptB, _ka); y1 = ptB.rect.cy;
            }`
    );

    // Patch drawFlowRel: tiers are stacked vertically, so connect via bottom→top edges
    // with vertical bezier control points instead of horizontal ones.
    const patchedJs2 = patchedJs
      // 1. Switch bezier control points from horizontal to vertical
      .replace(
        `        // Cubic bezier: control points pulled horizontally
        const cpOffset = Math.abs(xB - xA) * 0.45;
        const cp1x = xA + cpOffset;
        const cp2x = xB - cpOffset;

        ctx.beginPath();
        ctx.moveTo(xA, yA);
        ctx.bezierCurveTo(cp1x, yA, cp2x, yB, xB, yB);
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
          ctx.moveTo(xA, yA);
          ctx.bezierCurveTo(cp1x, yA, cp2x, yB, xB, yB);`,
        `        // Cubic bezier: control points pulled vertically (tiers stacked top→bottom)
        const cpOffset = Math.abs(yB - yA) * 0.45;
        const cp1y = yA + cpOffset;
        const cp2y = yB - cpOffset;

        ctx.beginPath();
        ctx.moveTo(xA, yA);
        ctx.bezierCurveTo(xA, cp1y, xB, cp2y, xB, yB);
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
          ctx.moveTo(xA, yA);
          ctx.bezierCurveTo(xA, cp1y, xB, cp2y, xB, yB);`
      )
      // 2. Raw inbox chip: connect from its bottom edge to FG chip's top edge
      .replace(
        `              drawLink(rRaw.right, rRaw.cy, rFG.left, rFG.cy, pColor, isActive);`,
        `              drawLink(rRaw.cx, rRaw.bottom, rFG.cx, rFG.top, pColor, isActive);`
      )
      // 3. FG chip: connect from its bottom edge to prompt chip's top edge
      .replace(
        `              drawLink(rFG.right, rFG.cy, rPR.left, rPR.cy, pColor, isActive);`,
        `              drawLink(rFG.cx, rFG.bottom, rPR.cx, rPR.top, pColor, isActive);`
      );

    // inject app.js into global scope (defines os() function)
    const appScript = document.createElement("script");
    appScript.textContent = patchedJs2;
    document.head.appendChild(appScript);

    // patch os() to fix startResizeH (was hardcoded 110px) and clamp float windows to viewport
    const patchScript = document.createElement("script");
    patchScript.textContent = `
      (function() {
        var _origOs = window.os;
        if (typeof _origOs !== 'function') return;
        window.os = function() {
          var data = _origOs();

          // fix startResizeH: measure actual chrome instead of hardcoded 110px
          data.startResizeH = function(which, e) {
            e.preventDefault();
            var self = this;
            var move = function(ev) {
              var topbar = document.querySelector('.topbar');
              var bottombar = document.querySelector('.bottombar');
              var topH = topbar ? topbar.offsetHeight : 40;
              var botH = bottombar ? bottombar.offsetHeight : 44;
              var usable = window.innerHeight - topH - botH - 12;
              var h = ((ev.clientY - topH) / usable) * 100;
              self.topH = Math.min(75, Math.max(20, h));
              document.documentElement.style.setProperty('--top', self.topH + '%');
              self.drawMissionRel(); self.drawFlowRel();
            };
            var up = function() {
              document.removeEventListener('mousemove', move);
              document.removeEventListener('mouseup', up);
              localStorage.setItem('pb-top', data.topH);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
          };

          // clamp initial float window positions to viewport
          ['win','pwin','cwin','rwin','bwin','plwin','evwin'].forEach(function(key) {
            var w = data[key];
            if (!w) return;
            w.x = Math.min(w.x, Math.max(0, window.innerWidth - 560));
            w.y = Math.min(w.y, Math.max(0, window.innerHeight - 300));
          });

          // missionRelLegend: computes color-index for the mission relational map
          var palette = ['#f2a93b','#1a8c7b','#e0556b','#5a7fd6','#9b59b6','#27ae60','#e67e22','#16a085','#d9534f','#3a8ed6'];
          Object.defineProperty(data, 'missionRelLegend', {
            get: function() {
              var mode = this.relGroup;
              if (mode === 'depends_on') return [{color:'#5a7fd6',label:'depends_on (mission links)',count:null}];
              var all = (this.missions||[]).concat(this.archivedMissions||[]);
              var groups = {};
              all.forEach(function(m) {
                var keys=[];
                if(mode==='source'){var s=(m.raw&&m.raw.sources)||[];keys=Array.isArray(s)?s.map(function(x){return 'src:'+x;}):[]}
                else if(mode==='klass')keys=[m.klass];
                else if(mode==='model')keys=[m.model];
                else keys=[m.type?m.type:m.model];
                keys.forEach(function(k){(groups[k]=groups[k]||[]).push(m.name);});
              });
              var keys=Object.keys(groups).filter(function(k){return groups[k].length>=2;});
              return keys.map(function(k,i){return {color:palette[i%palette.length],label:k.length>18?k.slice(0,17)+'…':k,count:groups[k].length};});
            },
            configurable: true
          });

          // Keep the map's full drawing surface intact. The HTML legend above the
          // canvas supplements the map; it must not erase live relationship paths.

          return data;
        };
      })();
    `;
    document.head.appendChild(patchScript);

    const loadScript = (src: string, defer = false): Promise<void> =>
      new Promise((resolve) => {
        const s = document.createElement("script");
        s.src = src;
        if (defer) s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.head.appendChild(s);
      });

    (async () => {
      await loadScript("https://unpkg.com/cytoscape@3.28.1/dist/cytoscape.min.js");
      await loadScript("https://unpkg.com/htmx.org@1.9.12");
      await loadScript("https://unpkg.com/htmx.org@1.9.12/dist/ext/sse.js");

      // guard: only load Alpine if os() was successfully defined
      if (typeof (window as any).os !== "function") {
        console.error("PlugBoot: os() failed to define — Alpine init skipped");
        return;
      }
      // Alpine must load last
      await loadScript("https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js", true);
    })();

    // track bottombar height so grid can adjust
    let roBottombar: ResizeObserver | null = null;
    let roGrid: ResizeObserver | null = null;

    const watchBottombar = () => {
      const bottombar = document.querySelector(".bottombar") as HTMLElement | null;
      if (bottombar) {
        roBottombar = new ResizeObserver(() => {
          document.documentElement.style.setProperty(
            "--bottombar-h",
            bottombar.offsetHeight + "px"
          );
        });
        roBottombar.observe(bottombar);
      } else {
        setTimeout(watchBottombar, 300);
      }
    };
    watchBottombar();

    // fire synthetic resize when grid panels change size so canvases re-measure
    const watchGrid = () => {
      const grid = document.querySelector(".grid") as HTMLElement | null;
      if (grid) {
        roGrid = new ResizeObserver(() =>
          window.dispatchEvent(new Event("resize"))
        );
        roGrid.observe(grid);
      } else {
        setTimeout(watchGrid, 500);
      }
    };
    watchGrid();

    return () => {
      roBottombar?.disconnect();
      roGrid?.disconnect();
    };
  }, []);

  return (
    <div
      {...({ "x-data": "os()", "x-init": "init()" } as Record<string, string>)}
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      dangerouslySetInnerHTML={{ __html: INNER_HTML }}
    />
  );
}
