# PlugBoot Dashboard — UI/UX Fix Handoff

> **For the implementing agent:** Read this entire document before touching any file. Every section describes the **root cause**, the **exact file + line range**, and the **exact fix to apply**. Do NOT improvise — implement exactly as described.

---

## Overview of 3 Problems to Fix

| # | Problem | Files |
|---|---------|-------|
| 1 | Topbar buttons clip/disappear at small viewport widths | `style.css`, `index.html` |
| 2 | Mission map: lines start from card center (not edge), cards scroll off-screen | `style.css`, `app.js` |
| 3 | Sources & Flow: canvas lines fan out explosively, overlap text, items scroll off-screen | `style.css`, `app.js`, `index.html` |

---

## Problem 1 — Topbar Buttons Clipping at Small Widths

### Root Cause
The topbar (`header.topbar`) is a single flex row containing:
- Left fixed controls (Freshness, Manager Boot, 3 buttons)
- Two flex spacers (`flex:1`)
- Center brand block
- Right entity config chips
- Theme toggle + entity switcher

When the viewport narrows (< ~850px), the spacers push everything and the fixed controls on the left **get pushed off the left edge** because `overflow-x: auto` scrolls the whole bar but the buttons are behind the scroll start. The real issue is the two `flex:1` spacers — they consume all space first, squeezing the real controls to zero width.

### Fix — `style.css`

**Find this rule (around line 65):**
```css
.topbar {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.45rem 1rem;
  border-bottom: 0.22rem solid var(--border);
  background: var(--surface);
  overflow-x: auto;
  scrollbar-width: none;
  min-height: 2.8rem;
  flex-shrink: 0;
}
```

**Replace with:**
```css
.topbar {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.35rem 0.7rem;
  border-bottom: 0.22rem solid var(--border);
  background: var(--surface);
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-soft) transparent;
  min-height: 2.6rem;
  flex-shrink: 0;
  flex-wrap: nowrap;
}
```

**Find this rule (around line 84):**
```css
.kpis-fixed { display: flex; gap: 0.4rem; flex-shrink: 0; }
```

**Replace with:**
```css
.kpis-fixed { display: flex; gap: 0.35rem; flex-shrink: 0; align-items: center; min-width: 0; }
```

**Find this rule (around line 76):**
```css
.kpis-entity {
  display: flex; align-items: center; gap: 0.35rem;
  overflow-x: auto; min-width: 0; flex-shrink: 1;
  ...
}
```

**Replace with:**
```css
.kpis-entity {
  display: flex; align-items: center; gap: 0.3rem;
  min-width: 0; flex-shrink: 1; overflow: visible;
}
```

### Fix — `index.html`

**Find the two spacer divs (around lines 27 and 36):**
```html
<!-- Spacer 1 -->
<div style="flex: 1;"></div>
...
<!-- Spacer 2 -->
<div style="flex: 1;"></div>
```

**Replace BOTH spacers with smaller min-width spacers:**
```html
<!-- Spacer 1 -->
<div style="flex: 0 1 2rem; min-width: 0.5rem;"></div>
...
<!-- Spacer 2 -->
<div style="flex: 0 1 2rem; min-width: 0.5rem;"></div>
```

**Also find the `.mini` buttons in the topbar (lines 21-23):**
```html
<button class="mini" @click="confirm('Restart daemon?') && restartDaemon()" ...>Restart Daemon</button>
<button class="mini" style="border-color: var(--status-error);" ...>Stop Daemon</button>
<button class="mini" style="border-color: var(--status-error);" ...>Stop Dashboard</button>
```

**Replace with compact labels that save space:**
```html
<button class="mini" @click="confirm('Restart daemon?') && restartDaemon()" title="Restart daemon process via manager">↺ Daemon</button>
<button class="mini" style="border-color: var(--status-error);" @click="confirm('Shut down daemon?') && shutdownDaemon()" title="Shut down daemon completely">⏹ Daemon</button>
<button class="mini" style="border-color: var(--status-error);" @click="confirm('Shut down dashboard?') && shutdownDashboard()" title="Shut down dashboard">⏹ Dash</button>
```

**And add this CSS rule for small screens (add at the bottom of `style.css`):**
```css
/* ── Responsive topbar: compress on small screens ── */
@media (max-width: 900px) {
  .topbar { gap: 0.3rem; padding: 0.3rem 0.5rem; }
  .kpi { padding: 0.2rem 0.4rem; font-size: 0.65rem; }
  .mini { padding: 2px 6px; font-size: 0.6rem; }
  .brand span { display: none; } /* hide text, keep logo */
}
```

---

## Problem 2 — Mission Map: Wrong Line Origins + Cards Need Scrolling

### Root Cause A — Lines start from card center, not border

In `app.js`, the `rectOf()` function returns the card's center Y (`cy`) and left/right edges — that part is correct. BUT the canvas element `#mission-rel` is positioned with `position: absolute; inset: 0` inside the `.pane` container. The `.pane` has `overflow: hidden` and `flex: 1`. 

**The real bug:** When cards inside the `.cards` columns are **scrolled** (because the column is too small and uses `overflow-y: auto`), the card's `getBoundingClientRect()` returns its ACTUAL screen position, but the canvas `cr0` offset is computed from the canvas's viewport position. When the `.cards` div is scrolled, the cards' screen positions shift UP out of the visible area — but their `cy` values go **negative** relative to the canvas. This causes lines to originate from garbage Y coordinates (appearing to come from the middle of nowhere or outside the card).

**Root Cause B — Cards scroll off-screen**

The `.cards` div inside each `.ms-col` has:
```css
.ms-col .cards { overflow-y: auto; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; min-height: 0; padding: 0.15rem; }
```

This allows scrolling. The board uses `grid-template-columns: repeat(3, 1fr)` with fixed `1fr` columns, and cards have no font scaling to fit the available space.

### Fix A — Disable scroll in mission columns; use CSS to shrink cards instead

**In `style.css`, find (around line 236):**
```css
.ms-col .cards { overflow-y: auto; display: flex; flex-direction: column; gap: 0.4rem; flex: 1; min-height: 0; padding: 0.15rem; }
```

**Replace with:**
```css
.ms-col .cards {
  overflow: hidden;           /* NO scroll — all cards must fit */
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
  min-height: 0;
  padding: 0.1rem;
}
```

**In `style.css`, find (around line 237):**
```css
.mcard.sm { background: var(--surface-alt); border: 0.15rem solid var(--border); border-radius: 0.55rem; padding: 0.5rem; box-shadow: var(--shadow-sm); cursor: grab; }
```

**Replace with:**
```css
.mcard.sm {
  background: var(--surface-alt);
  border: 0.15rem solid var(--border);
  border-radius: 0.55rem;
  padding: 0.35rem 0.5rem;    /* less vertical padding */
  box-shadow: var(--shadow-sm);
  cursor: grab;
  flex-shrink: 1;             /* allow shrinking if needed */
  min-height: 0;
  overflow: hidden;
}
```

**In `style.css`, find (around line 239):**
```css
.mcard.sm p { font-size: 0.72rem; color: var(--muted); margin: 0.2rem 0; line-height: 1.25; max-height: 2.2rem; overflow: hidden; }
```

**Replace with:**
```css
.mcard.sm p {
  font-size: 0.68rem;
  color: var(--muted);
  margin: 0.1rem 0;
  line-height: 1.2;
  max-height: 1.8rem;     /* tighter */
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

### Fix B — Lines anchored to card edges (not card centers that are off-screen)

**In `app.js`, find the `drawMissionRel` function (around line 1433). Find the `rectOf` helper:**

```javascript
const rectOf = c => {
  const r = c.getBoundingClientRect();
  return {
    left: r.left - cr0.left,
    right: r.right - cr0.left,
    cx: r.left - cr0.left + r.width / 2,
    cy: r.top - cr0.top + r.height / 2,
    width: r.width,
    height: r.height
  };
};
```

**This is correct. The problem is that the canvas's `cr0` is taken from `cv.getBoundingClientRect()` ONCE at draw time, but the card columns may be scrolled. The fix: clamp the computed cy to be within [0, H] before drawing. Add this guard:**

After the existing `rectOf` definition, add:

```javascript
// Guard: if a card is scrolled off-screen, skip drawing lines to it.
const isVisible = rect => rect.cy >= 0 && rect.cy <= H && rect.left >= -10 && rect.right <= W + 10;
```

Then in the `depends_on` section (around line 1549), find:
```javascript
deps.forEach(depName => {
  const depCardEl = cards.find(el => el.getAttribute('data-name') === depName);
  if (!depCardEl) return;
  const rA = rectOf(depCardEl);
  const rB = rectOf(c);
  const isActive = isCurrentActive || activeCard === depName || !activeCard;
  
  let x0 = rA.right, y0 = rA.cy;
  let x1 = rB.left, y1 = rB.cy;
  if (rA.cx > rB.cx) { x0 = rA.left; x1 = rB.right; }
  
  drawTrace(x0, y0, x1, y1, '#5a7fd6', isActive);
});
```

**Replace with:**
```javascript
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
  
  drawTrace(x0, y0, x1, y1, '#5a7fd6', isActive);
});
```

**Also fix the group-based mapping section (around line 1607). Find:**
```javascript
for (let j = 0; j < pts.length - 1; j++) {
  const ptA = pts[j], ptB = pts[j + 1];
  let x0 = ptA.rect.right, y0 = ptA.rect.cy;
  let x1 = ptB.rect.left, y1 = ptB.rect.cy;
  
  if (ptA.rect.cx > ptB.rect.cx) {
    x0 = ptA.rect.left;
    x1 = ptB.rect.right;
  }
  
  const isLinkActive = isGroupActive && (!activeCard || activeCard === ptA.name || activeCard === ptB.name);
  drawTrace(x0, y0, x1, y1, color, isLinkActive);
}
```

**Replace with:**
```javascript
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
  drawTrace(x0, y0, x1, y1, color, isLinkActive);
}
```

---

## Problem 3 — Sources & Flow: Explosive Canvas Lines Overlapping Text

### Root Cause

The current `drawFlowRel` function in `app.js` (around line 1661) draws a canvas overlay (`#flow-rel`) positioned `position: absolute; inset: 0` **inside the `.pane` container** of the Sources & Flow section. The pane contains 3 tiers stacked vertically:

1. **INBOX (RAW)** — chips at the top
2. **GATEWAY** — pillars with aspects and functional group chips in the middle
3. **OS PROMPTS** — chips at the bottom

The canvas is `inset:0` meaning it covers the ENTIRE pane — including the headers, tier boxes, all text. The bezier curves are drawn to connect each raw chip → every matching fg chip → every matching prompt chip. Because there are many items (49+ gateway FGs, 8+ prompts, 3 raw items), hundreds of bezier curves are computed. Most of them fan out from the center of the visible space, creating a **spaghetti explosion**.

**Additionally:** The tiers use `overflow: auto` / `flex: 1` — so the GATEWAY tier can scroll. Items hidden below the scroll boundary still have screen coordinates far below the canvas, creating wild out-of-bounds lines.

### Fix Strategy

The correct approach is a **left-to-right swimlane layout** where:
- All three tiers are displayed as **horizontal rows** (not vertical stacked boxes)  
- Items in each row are displayed as small chips WITHOUT scrolling
- The canvas draws clean **straight horizontal bezier** curves between chips at their actual edges
- Lines only connect VISIBLE items (skip scrolled-out items)
- Lines are drawn at low opacity by default, and highlighted on hover

### Fix A — CSS: Make tiers horizontal swimlanes, no scroll ever

**In `style.css`, find (around line 254):**
```css
.src-stack { display: flex; flex-direction: column; gap: 8px; flex: 1; min-height: 0; }
.src-tier { background: var(--surface-alt); border: 2px solid var(--border); border-radius: 8px; padding: 6px 8px; display: flex; flex-direction: column; min-height: 0; }
.src-tier.grow { flex: 1; }
```

**Replace with:**
```css
/* Swimlane layout: 3 horizontal rows, fixed heights, no scroll ever */
.src-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-height: 0;
  position: relative;   /* canvas overlay positioned relative to this */
}
.src-tier {
  background: var(--surface-alt);
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 5px 8px;
  display: flex;
  flex-direction: row;   /* HORIZONTAL: label on left, chips to the right */
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-height: 0;
  overflow: hidden;      /* NO scroll — items must fit */
}
.src-tier.grow {
  flex: 1;              /* gateway takes remaining space */
  align-items: flex-start;
}
```

**Find (around line 257):**
```css
.lb-title { font-size: .7rem; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; color: var(--muted); display: flex; align-items: center; gap: 6px; }
```

**Replace with:**
```css
.lb-title {
  font-size: .68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;     /* label never wraps */
  min-width: 80px;    /* fixed label column width */
  writing-mode: horizontal-tb;
}
```

**Find (around line 259):**
```css
.tier-body { overflow: auto; margin-top: 5px; }
```

**Replace with:**
```css
.tier-body {
  overflow: hidden;     /* NO scroll */
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}
```

**Add these new rules (add to bottom of `style.css`):**
```css
/* ── Sources & Flow swimlane tiers ── */
.src-tier .tier-body .flexlist {
  flex-wrap: wrap;
  overflow: hidden;
  gap: 4px;
  align-content: flex-start;
  flex: 1;
}
.src-tier .gw-grid {
  flex-wrap: wrap;
  overflow: hidden;
  gap: 6px;
  flex: 1;
  align-content: flex-start;
}
/* Gateway pillar blocks: side by side horizontally */
.gw-pillar {
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
}
/* FG chips: smaller in swimlane mode */
.fg-chip {
  font-size: 0.6rem;
  padding: 1px 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}
/* Raw chips */
.raw-chip {
  cursor: pointer;
  white-space: nowrap;
}
.raw-chip:hover { border-color: var(--accent); }
/* Swimlane canvas */
#flow-rel {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;   /* above chips but pointer-events: none so clicks pass through */
  width: 100%;
  height: 100%;
}
```

### Fix B — JS: Replace explosive drawFlowRel with clean edge-anchored bezier

**In `app.js`, find and REPLACE the entire `drawFlowRel` function (around line 1661):**

The new function must:
1. Find the canvas `#flow-rel` positioned inside the `.pane` of the Sources & Flow section
2. Measure the canvas bounding box (`cr0`)
3. For each raw chip, find its right edge in canvas coordinates
4. For each fg-chip that matches (via the `this.gatewayPillars` data + `this.inbox.raw`), find its left edge in canvas coordinates
5. For each prompt-chip that matches any fg (by role/name keyword), find its left edge
6. Only draw lines between chips that are BOTH visible on screen (within canvas bounds)
7. Draw left-to-right bezier curves from right edge of source → left edge of target
8. When `this.flowHover` is set (a chip name), highlight only connected lines, dim rest

**Replace `drawFlowRel(offset = 0)` with:**

```javascript
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

  // Resize canvas to match container
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

  // Draw a single bezier from (xA, yA) → (xB, yB)
  // LEFT-TO-RIGHT: always goes from right edge of source to left edge of target
  const drawLink = (xA, yA, xB, yB, color, active) => {
    const alpha = active ? 0.75 : 0.08;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = active ? 2.0 : 1.0;
    ctx.setLineDash([]);

    // Cubic bezier: control points pulled horizontally
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
      ctx.bezierCurveTo(cp1x, yA, cp2x, yB, xB, yB);
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
},
```

### Fix C — HTML: Move canvas anchor point to `.pane` not inside `.src-stack`

**In `index.html`, find (around line 460 after recent changes):**
```html
<canvas id="flow-rel" style="position:absolute; inset:0; pointer-events:none; z-index:3;"></canvas>
```

**Verify it is a DIRECT child of the `.pane` div (the white box with border, not inside `.src-stack`). The `.pane` already has `position: relative` (from CSS line 298: `.pane { position: relative; }`). If the canvas is inside `.src-stack`, move it out to be a sibling of `.src-stack` but still inside `.pane`:**

```html
<!-- inside .pane, AFTER the closing </div> of .src-stack, BEFORE .flowbar -->
<canvas id="flow-rel" style="position:absolute; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:10;"></canvas>
<div class="flowbar" style="margin-top:4px; z-index:11; position:relative;">
  <span class="flow-hint">hover a chip to highlight its data pipelines</span>
</div>
```

---

## Summary of All File Changes

### `style.css`
1. `.topbar` — add `flex-wrap: nowrap`, reduce padding/gap
2. `.kpis-fixed`, `.kpis-entity` — fix flex shrink behavior
3. `.ms-col .cards` — remove `overflow-y: auto`, set to `overflow: hidden`
4. `.mcard.sm` — add `flex-shrink: 1; min-height: 0`
5. `.mcard.sm p` — reduce height, add line-clamp
6. `.src-tier` — change direction to `row`, remove scroll
7. `.lb-title` — add `flex-shrink: 0; min-width: 80px`
8. `.tier-body` — set `overflow: hidden; flex: 1`
9. Add `#flow-rel`, `.raw-chip`, `.fg-chip`, `.src-tier .tier-body .flexlist` rules
10. Add `@media (max-width: 900px)` topbar compression rule

### `app.js`
1. In `drawMissionRel`: add `isVisible` guard function, fix both edge cases to use correct border edges, skip invisible cards
2. Replace entire `drawFlowRel` function with new version that uses `chipRect()` → skip invisible chips → draws left-to-right bezier curves from proper element edges

### `index.html`
1. Replace two `flex:1` spacers with `flex: 0 1 2rem; min-width: 0.5rem`
2. Shorten button labels in topbar
3. Ensure `#flow-rel` canvas is a direct child of `.pane` (not inside `.src-stack`)

---

## Do NOT Change
- The YAML reading logic, API calls, or data model
- The mission card content (`mcard-top`, `.bar`, `.mtags`)
- The sidebar (Runtime/Board) layout
- The bottom bar
- Any window modals or floating dialogs
- The `drawTrace` function inside `drawMissionRel` (keep it, just fix where it's called)
