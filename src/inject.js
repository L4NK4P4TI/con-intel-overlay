(() => {
  const VERSION = "1.0.1";
  const SOURCE = "con-intel-overlay";
  const FORMAT = "con-intel-overlay";
  const WRAP_MARGIN = 240;
  const PALETTE = [
    "#ff4d4d",
    "#ff8a1f",
    "#ffd400",
    "#3ddc84",
    "#2ad4ff",
    "#4d7cff",
    "#b56bff",
    "#f5f7fa",
  ];
  const ICO = {
    pen: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.2 2.6 13.4 4.8 6.2 12H4v-2.2z"/><path d="m10 3.8 2.2 2.2"/></svg>`,
    arrow: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13 13 3"/><path d="M8 3h5v5"/></svg>`,
    marker: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 2.5v7"/><circle cx="8" cy="12.2" r="2.1" fill="currentColor" stroke="none"/></svg>`,
    text: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3.5 3.5h9"/><path d="M8 3.5v9"/><path d="M5.5 12.5h5"/></svg>`,
    range: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="8" cy="8" r="5.5"/><path d="M8 8h5.5"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/></svg>`,
    measure: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 13.5 13.5 2.5"/><path d="M4.2 11.8 5.1 12.7M6.2 9.8 7.4 11M8.2 7.8 9.7 9.3M10.2 5.8 12 7.6"/></svg>`,
    eraser: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.2 8.8 5.4a1.6 1.6 0 0 1 2.3 0L13 7.3 8.2 12.1H5.5z"/><path d="M7 12.1h6"/></svg>`,
    eye: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1.8 8s2.4-4.2 6.2-4.2S14.2 8 14.2 8s-2.4 4.2-6.2 4.2S1.8 8 1.8 8z"/><circle cx="8" cy="8" r="1.6"/></svg>`,
    eyeOff: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="m3 3 10 10"/><path d="M6.4 6.5A2 2 0 0 0 9.5 9.6"/><path d="M1.8 8s2.4-4.2 6.2-4.2c.7 0 1.4.1 2 .4M14.2 8s-1 1.8-2.6 2.9M4.3 4.9C2.8 5.8 1.8 8 1.8 8"/></svg>`,
    undo: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5H11a3 3 0 1 1 0 6H8"/><path d="M4.5 6.5 7 4M4.5 6.5 7 9"/></svg>`,
    export: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9.5V3"/><path d="M5.5 5.5 8 3l2.5 2.5"/><path d="M3.5 12.5h9"/></svg>`,
    import: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v6.5"/><path d="M5.5 7.5 8 10l2.5-2.5"/><path d="M3.5 12.5h9"/></svg>`,
    trash: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5h9"/><path d="M6 5V3.5h4V5"/><path d="M5 5.5v7h6v-7"/><path d="M7 7.5v3.5M9 7.5v3.5"/></svg>`,
    min: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M3.5 8h9"/></svg>`,
  };
  const LOG = (...args) => console.info("[con-intel]", ...args);

  LOG("page script loaded", VERSION, location.href);

  const state = {
    tool: "pen",
    visible: true,
    color: "#ff4d4d",
    width: 3,
    strokes: [],
    draft: null,
    gameId: null,
    overlay: null,
    ctx: null,
    toolbar: null,
    toolbarRoot: null,
    saveTimer: 0,
    textEdit: null,
    textEditorHost: null,
    hoverStrokeId: null,
    pointerScreen: null,
    erasing: false,
    rangeKind: "reach",
    rangeEdit: null,
    measureEdit: null,
    panelLeft: 12,
    panelTop: null,
    expandedLeft: 12,
    expandedTop: null,
    dockCorner: "bottom-left",
    panelCollapsed: false,
    panelDragging: false,
    uiSaveTimer: 0,
  };

  function hup() {
    return window.hup || null;
  }

  function getMapApi() {
    const game = hup();
    const widget = game?.ui?.mapWidget;
    if (!widget) return null;

    if (widget.viewport && typeof widget.viewport.toMapPos === "function") {
      return {
        kind: "modern",
        toMap: (screen) => widget.viewport.toMapPos(screen),
        fromMap: (mapPos) => widget.viewport.fromMapPos(mapPos),
        wrapWidth: () => (widget.viewport.isContinuous ? widget.viewport.totalWidth || 0 : 0),
        getCanvas: () => document.getElementById("map_canvas"),
        getContainer: () =>
          document.getElementById("mapContainer") || document.getElementById("map_canvas")?.parentElement,
      };
    }

    const renderer = widget.mapRenderer;
    if (renderer && typeof renderer.toMapPos === "function" && typeof renderer.fromMapPos === "function") {
      return {
        kind: "legacy",
        toMap: (screen) => renderer.toMapPos(screen),
        fromMap: (mapPos) => renderer.fromMapPos(mapPos),
        wrapWidth: () => {
          const continuous = typeof game.isContinuousMap === "function" && game.isContinuousMap();
          return continuous && renderer.mapSize ? renderer.mapSize.width : 0;
        },
        getCanvas: () => {
          const named = document.getElementById("map_canvas");
          if (named) return named;
          const container = document.getElementById("mapContainer");
          if (!container) return null;
          return [...container.querySelectorAll("canvas")].find((c) => c.id !== "con-intel-overlay-canvas") || null;
        },
        getContainer: () => document.getElementById("mapContainer"),
      };
    }

    return null;
  }

  function getGameId() {
    const raw = hup()?.config?.userData?.gameID ?? hup()?.getGameID?.();
    const id = Number(raw);
    return id > 0 ? String(id) : null;
  }

  function mapExtent() {
    const game = hup();
    const widget = game?.ui?.mapWidget;
    const viewport = widget?.viewport;
    const renderer = widget?.mapRenderer;
    const width = Number(viewport?.totalWidth || renderer?.mapSize?.width || 0);
    const height = Number(viewport?.totalHeight || renderer?.mapSize?.height || 0);
    return { width, height };
  }

  function wrapDeltaX(fromX, toX, width) {
    if (!width) return toX - fromX;
    let dx = toX - fromX;
    dx -= Math.round(dx / width) * width;
    return dx;
  }

  function mapSeparation(a, b) {
    const wrap = getMapApi()?.wrapWidth() || mapExtent().width || 0;
    return Math.hypot(wrapDeltaX(a.x, b.x, wrap), b.y - a.y);
  }

  function mapRadiusKm(radius) {
    return Math.max(0, Number(radius) || 0);
  }

  function mapDistanceKm(a, b) {
    if (!a || !b) return 0;
    return mapSeparation(a, b);
  }

  function formatKm(km) {
    if (!Number.isFinite(km) || km < 0) return "—";
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km).toLocaleString("en-US")} km`;
  }

  function showBoot(message) {
    let el = document.getElementById("con-intel-boot");
    if (!el) {
      el = document.createElement("div");
      el.id = "con-intel-boot";
      el.style.cssText = [
        "position:fixed",
        "top:12px",
        "left:12px",
        "z-index:2147483647",
        "padding:8px 12px",
        "background:rgba(10,16,24,0.94)",
        "color:#8fd4f2",
        "border:1px solid rgba(143,212,242,0.7)",
        "border-radius:6px",
        "font:12px/1.35 Segoe UI,sans-serif",
        "pointer-events:none",
      ].join(";");
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = message;
    return el;
  }

  function hideBoot() {
    document.getElementById("con-intel-boot")?.remove();
  }

  function injectStyles() {
    if (document.getElementById("con-intel-style")) return;
    const style = document.createElement("style");
    style.id = "con-intel-style";
    style.textContent = `
      #con-intel-overlay-canvas {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 20 !important;
      }
      #con-intel-host {
        position: fixed !important;
        z-index: 2147483646 !important;
        pointer-events: auto !important;
        width: auto !important;
        transition: left 0.28s cubic-bezier(0.22, 1, 0.32, 1), top 0.28s cubic-bezier(0.22, 1, 0.32, 1) !important;
      }
      #con-intel-host.dragging,
      #con-intel-host.no-motion {
        transition: none !important;
      }
      #con-intel-text-host {
        position: fixed !important;
        z-index: 2147483647 !important;
        pointer-events: auto !important;
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function waitForMap() {
    showBoot(`CoN Intel v${VERSION}: waiting for map…`);
    return new Promise((resolve) => {
      const tryFind = () => {
        const api = getMapApi();
        const container = api?.getContainer();
        if (api && container) {
          resolve({ api, container, canvas: api.getCanvas() });
          return true;
        }
        return false;
      };
      if (tryFind()) return;
      const observer = new MutationObserver(() => {
        if (tryFind()) observer.disconnect();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  function toMap(screen) {
    return getMapApi().toMap(screen);
  }

  function fromMap(mapPos) {
    return getMapApi().fromMap(mapPos);
  }

  function wrapCopies(mapPos) {
    const width = getMapApi()?.wrapWidth() || 0;
    const copies = [mapPos];
    if (width) {
      copies.push({ x: mapPos.x + width, y: mapPos.y });
      copies.push({ x: mapPos.x - width, y: mapPos.y });
    }
    return copies;
  }

  function screenPoints(mapPos, canvas) {
    return wrapCopies(mapPos)
      .map((p) => fromMap(p))
      .filter(
        (p) =>
          p.x > -WRAP_MARGIN &&
          p.x < canvas.width + WRAP_MARGIN &&
          p.y > -WRAP_MARGIN &&
          p.y < canvas.height + WRAP_MARGIN
      );
  }

  function eventToScreen(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function simplify(points, minDist = 4) {
    if (points.length < 2) return points;
    const out = [points[0]];
    for (let i = 1; i < points.length; i += 1) {
      const prev = out[out.length - 1];
      const cur = points[i];
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      if (dx * dx + dy * dy >= minDist * minDist) out.push(cur);
    }
    const last = points[points.length - 1];
    if (out[out.length - 1] !== last) out.push(last);
    return out;
  }

  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function scheduleSave() {
    clearTimeout(state.saveTimer);
    state.saveTimer = setTimeout(() => {
      if (!state.gameId) return;
      window.postMessage(
        {
          source: SOURCE,
          type: "save",
          gameId: state.gameId,
          strokes: state.strokes,
        },
        "*"
      );
    }, 250);
  }

  function scheduleSaveUi() {
    clearTimeout(state.uiSaveTimer);
    state.uiSaveTimer = setTimeout(() => {
      window.postMessage(
        {
          source: SOURCE,
          type: "save-ui",
          ui: {
            left: state.panelLeft,
            top: state.panelTop,
            collapsed: state.panelCollapsed,
            expandedLeft: state.expandedLeft,
            expandedTop: state.expandedTop,
            dockCorner: state.dockCorner,
          },
        },
        "*"
      );
    }, 200);
  }

  function loadStrokes() {
    window.postMessage({ source: SOURCE, type: "load", gameId: state.gameId }, "*");
  }

  function sanitizeStrokes(raw) {
    if (!Array.isArray(raw)) return [];
    const types = new Set(["pen", "arrow", "marker", "text", "range", "measure"]);
    const out = [];
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      if (!types.has(item.type) || !Array.isArray(item.points)) continue;
      const points = item.points
        .filter((p) => p && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y)))
        .map((p) => ({ x: Number(p.x), y: Number(p.y) }));
      if (!points.length) continue;
      const stroke = {
        id: typeof item.id === "string" && item.id ? item.id : uid(),
        type: item.type,
        color: typeof item.color === "string" && /^#[0-9a-fA-F]{6}$/.test(item.color) ? item.color : "#ff4d4d",
        width: Math.min(8, Math.max(1, Number(item.width) || 3)),
        points,
      };
      if (item.type === "text") {
        stroke.label = String(item.label || "").slice(0, 4000);
        if (!stroke.label.trim()) continue;
      }
      if (item.type === "range") {
        const origin = points[0];
        const rim = points[1];
        const oldKind = item.kind;
        let kind = oldKind === "sensors" || oldKind === "radar" || oldKind === "sight" ? "sensors" : "reach";
        let heading = Number(item.heading);
        let combatRadius = Number(item.combatRadius);
        let radarRadius = Number(item.radarRadius);
        let sightRadius = Number(item.sightRadius);
        const oldRadius =
          rim && origin ? Math.hypot(rim.x - origin.x, rim.y - origin.y) : 0;
        if (!Number.isFinite(heading)) {
          heading = rim && origin ? Math.atan2(rim.y - origin.y, rim.x - origin.x) : 0;
        }
        if (!Number.isFinite(combatRadius) || combatRadius < 0) combatRadius = oldRadius;
        if (kind === "sensors") combatRadius = 0;
        if (!Number.isFinite(radarRadius) || radarRadius <= 0) {
          if (oldKind === "radar") radarRadius = oldRadius;
          else if (kind === "reach") radarRadius = Math.max(1, combatRadius * 0.22);
          else radarRadius = Math.max(1, oldRadius || 1);
        }
        if (!Number.isFinite(sightRadius) || sightRadius <= 0) {
          if (oldKind === "sight") sightRadius = oldRadius;
          else if (kind === "reach") sightRadius = Math.max(1, combatRadius * 0.1);
          else sightRadius = Math.max(1, radarRadius * 0.45);
        }
        if (kind === "reach" && combatRadius < 1) continue;
        if (kind === "sensors" && radarRadius < 1 && sightRadius < 1) continue;
        stroke.points = [origin];
        stroke.kind = kind;
        stroke.heading = heading;
        stroke.combatRadius = combatRadius;
        stroke.radarRadius = radarRadius;
        stroke.sightRadius = sightRadius;
      }
      if (item.type === "measure") {
        if (points.length < 2) continue;
        stroke.points = points.slice(0, 2);
      }
      out.push(stroke);
      if (out.length >= 4000) break;
    }
    return out;
  }

  function parseSketchPayload(text) {
    const data = JSON.parse(text);
    if (Array.isArray(data)) return { gameId: null, strokes: sanitizeStrokes(data) };
    if (!data || typeof data !== "object") throw new Error("Not a CoN Intel sketch file");
    const strokes = sanitizeStrokes(data.strokes);
    if (!strokes.length && !Array.isArray(data.strokes)) throw new Error("Not a CoN Intel sketch file");
    return {
      gameId: data.gameId != null && String(data.gameId) ? String(data.gameId) : null,
      strokes,
    };
  }

  function exportStrokes() {
    if (!state.strokes.length) {
      window.alert("Nothing to export yet.");
      return;
    }
    const payload = {
      format: FORMAT,
      version: VERSION,
      gameId: state.gameId,
      exportedAt: new Date().toISOString(),
      strokes: state.strokes,
    };
    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
    const name = `con-intel-${state.gameId || "match"}-${stamp}.json`;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    LOG("exported", name, state.strokes.length);
  }

  function mergeImportedStrokes(incoming) {
    const seen = new Set(state.strokes.map((s) => s.id));
    let added = 0;
    for (const stroke of incoming) {
      if (seen.has(stroke.id)) continue;
      seen.add(stroke.id);
      state.strokes.push(stroke);
      added += 1;
    }
    return added;
  }

  function importSketchFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseSketchPayload(String(reader.result || ""));
        if (!parsed.strokes.length) {
          window.alert("That file has no usable marks.");
          return;
        }
        if (parsed.gameId && state.gameId && parsed.gameId !== String(state.gameId)) {
          const ok = window.confirm(
            `This sketch is from match ${parsed.gameId}. You are in ${state.gameId}. Marks may not line up on a different map. Import anyway?`
          );
          if (!ok) return;
        }
        const added = mergeImportedStrokes(parsed.strokes);
        scheduleSave();
        updateStatus();
        window.alert(
          added
            ? `Imported ${added} mark${added === 1 ? "" : "s"}. Send teammates the same file; duplicates are skipped.`
            : "Those marks are already on this match."
        );
      } catch (err) {
        LOG("import failed", err);
        window.alert("Could not import that file. Use a CoN Intel .json export.");
      }
    };
    reader.readAsText(file);
  }

  function drawArrowhead(ctx, from, to, size) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle - Math.PI / 6),
      to.y - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - size * Math.cos(angle + Math.PI / 6),
      to.y - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }

  function strokeScreenPath(stroke, canvas) {
    if (!stroke.points.length) return [];
    const width = getMapApi()?.wrapWidth() || 0;
    const offsets = width ? [0, width, -width] : [0];
    return offsets.map((dx) =>
      stroke.points.map((p) => fromMap({ x: p.x + dx, y: p.y }))
    ).filter((path) =>
      path.some(
        (p) =>
          p.x > -WRAP_MARGIN &&
          p.x < canvas.width + WRAP_MARGIN &&
          p.y > -WRAP_MARGIN &&
          p.y < canvas.height + WRAP_MARGIN
      )
    );
  }

  function wrapTextLines(ctx, label, maxWidth) {
    const lines = [];
    for (const paragraph of String(label).split("\n")) {
      if (!paragraph) {
        lines.push("");
        continue;
      }
      let current = "";
      const pushCurrent = () => {
        if (current) lines.push(current);
        current = "";
      };
      for (const word of paragraph.split(/\s+/)) {
        if (!word) continue;
        const candidate = current ? `${current} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxWidth) {
          current = candidate;
          continue;
        }
        pushCurrent();
        if (ctx.measureText(word).width <= maxWidth) {
          current = word;
          continue;
        }
        let chunk = "";
        for (const ch of word) {
          const next = chunk + ch;
          if (chunk && ctx.measureText(next).width > maxWidth) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk = next;
          }
        }
        current = chunk;
      }
      pushCurrent();
    }
    return lines.length ? lines : [""];
  }

  function markerStem(stroke) {
    return 16 + (stroke.width || 3) * 2;
  }

  function markerRadius(stroke) {
    return 5 + (stroke.width || 3);
  }

  function polarOffset(origin, heading, radius) {
    return {
      x: origin.x + Math.cos(heading) * radius,
      y: origin.y + Math.sin(heading) * radius,
    };
  }

  function rangeLayout(stroke) {
    const origin = stroke.points[0];
    const heading = Number.isFinite(stroke.heading) ? stroke.heading : 0;
    const kind = stroke.kind === "sensors" ? "sensors" : "reach";
    const combatRadius = kind === "reach" ? Math.max(0, Number(stroke.combatRadius) || 0) : 0;
    const radarRadius = Math.max(0, Number(stroke.radarRadius) || 0);
    const sightRadius = Math.max(0, Number(stroke.sightRadius) || 0);
    const probe = kind === "reach" ? polarOffset(origin, heading, combatRadius) : { x: origin.x, y: origin.y };
    return {
      kind,
      origin,
      heading,
      combatRadius,
      radarRadius,
      sightRadius,
      probe,
      radarHandle: polarOffset(probe, heading, radarRadius),
      sightHandle: polarOffset(probe, heading, sightRadius),
    };
  }

  function applyReachFromDrag(stroke, mapPos) {
    const origin = stroke.points[0];
    const dx = mapPos.x - origin.x;
    const dy = mapPos.y - origin.y;
    const radius = Math.hypot(dx, dy);
    stroke.kind = "reach";
    stroke.heading = Math.atan2(dy, dx);
    stroke.combatRadius = radius;
    stroke.radarRadius = Math.max(1, radius * 0.22);
    stroke.sightRadius = Math.max(1, radius * 0.1);
  }

  function applySensorsFromDrag(stroke, mapPos) {
    const origin = stroke.points[0];
    const dx = mapPos.x - origin.x;
    const dy = mapPos.y - origin.y;
    const radius = Math.max(1, Math.hypot(dx, dy));
    stroke.kind = "sensors";
    stroke.heading = Math.atan2(dy, dx);
    stroke.combatRadius = 0;
    stroke.radarRadius = radius;
    stroke.sightRadius = Math.max(1, radius * 0.45);
  }

  function moveRangeOrigin(stroke, mapPos) {
    stroke.points[0] = { x: mapPos.x, y: mapPos.y };
  }

  function setRangeHeading(stroke, mapPos, lockedCombatRadius) {
    const origin = stroke.points[0];
    if (!origin) return;
    stroke.heading = Math.atan2(mapPos.y - origin.y, mapPos.x - origin.x);
    if (stroke.kind !== "sensors") {
      stroke.combatRadius = lockedCombatRadius != null ? lockedCombatRadius : stroke.combatRadius;
    }
  }

  function setSensorRadius(stroke, which, mapPos) {
    const layout = rangeLayout(stroke);
    const radius = Math.max(1, Math.hypot(mapPos.x - layout.probe.x, mapPos.y - layout.probe.y));
    if (which === "radar") stroke.radarRadius = radius;
    else stroke.sightRadius = radius;
  }

  function wrapOffsets() {
    const width = getMapApi()?.wrapWidth() || 0;
    return width ? [0, width, -width] : [0];
  }

  function strokeMapCircle(ctx, center, radius, canvas, dash, alpha) {
    if (!center || radius < 1) return;
    const steps = Math.max(64, Math.min(128, Math.round(radius / 10) + 48));
    for (const dx of wrapOffsets()) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.setLineDash(dash);
      ctx.beginPath();
      let visible = false;
      for (let i = 0; i <= steps; i += 1) {
        const angle = (i / steps) * Math.PI * 2;
        const p = fromMap({
          x: center.x + Math.cos(angle) * radius + dx,
          y: center.y + Math.sin(angle) * radius,
        });
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
        if (
          p.x > -WRAP_MARGIN &&
          p.x < canvas.width + WRAP_MARGIN &&
          p.y > -WRAP_MARGIN &&
          p.y < canvas.height + WRAP_MARGIN
        ) {
          visible = true;
        }
      }
      if (visible) ctx.stroke();
      ctx.restore();
    }
  }

  function rangeCopies(stroke, canvas) {
    const layout = rangeLayout(stroke);
    if (!layout.origin) return [];
    const width = getMapApi()?.wrapWidth() || 0;
    const offsets = width ? [0, width, -width] : [0];
    const copies = [];
    for (const dx of offsets) {
      const shift = (p) => fromMap({ x: p.x + dx, y: p.y });
      const origin = shift(layout.origin);
      const probe = shift(layout.probe);
      const radarHandle = shift(layout.radarHandle);
      const sightHandle = shift(layout.sightHandle);
      const combatR = Math.hypot(probe.x - origin.x, probe.y - origin.y);
      const radarR = Math.hypot(radarHandle.x - probe.x, radarHandle.y - probe.y);
      const sightR = Math.hypot(sightHandle.x - probe.x, sightHandle.y - probe.y);
      const span = Math.max(combatR, radarR, sightR);
      if (
        origin.x < -WRAP_MARGIN - span ||
        origin.x > canvas.width + WRAP_MARGIN + span ||
        origin.y < -WRAP_MARGIN - span ||
        origin.y > canvas.height + WRAP_MARGIN + span
      ) {
        continue;
      }
      copies.push({
        kind: layout.kind,
        origin,
        probe,
        radarHandle,
        sightHandle,
        combatR,
        radarR,
        sightR,
      });
    }
    return copies;
  }

  function paintOutlinedLabel(ctx, text, x, y, color) {
    ctx.save();
    ctx.font = "700 11px Segoe UI, Tahoma, sans-serif";
    ctx.textBaseline = "bottom";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  function paintRange(ctx, stroke, canvas) {
    const showHandles = state.tool === "range";
    const color = stroke.color;
    const layout = rangeLayout(stroke);
    if (layout.kind === "reach" && layout.combatRadius > 1) {
      strokeMapCircle(ctx, layout.origin, layout.combatRadius, canvas, [], 0.32);
    }
    strokeMapCircle(ctx, layout.probe, layout.radarRadius, canvas, [7, 5], 0.55);
    strokeMapCircle(ctx, layout.probe, layout.sightRadius, canvas, [2, 4], 0.72);

    for (const copy of rangeCopies(stroke, canvas)) {
      if (copy.kind === "reach") {
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(copy.origin.x, copy.origin.y);
        ctx.lineTo(copy.probe.x, copy.probe.y);
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(copy.origin.x, copy.origin.y, 4 + stroke.width, 0, Math.PI * 2);
      ctx.fill();
      if (copy.kind === "reach") {
        ctx.beginPath();
        ctx.arc(copy.probe.x, copy.probe.y, 4 + stroke.width * 0.6, 0, Math.PI * 2);
        ctx.fill();
        paintOutlinedLabel(ctx, "C", copy.origin.x + 7, copy.origin.y - 6, color);
        paintOutlinedLabel(
          ctx,
          formatKm(mapRadiusKm(layout.combatRadius)),
          copy.origin.x + 7,
          copy.origin.y + 12,
          color
        );
      }
      ctx.beginPath();
      ctx.arc(copy.radarHandle.x, copy.radarHandle.y, 3.5 + stroke.width * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(copy.sightHandle.x, copy.sightHandle.y, 3 + stroke.width * 0.35, 0, Math.PI * 2);
      ctx.fill();
      paintOutlinedLabel(
        ctx,
        `R ${formatKm(mapRadiusKm(layout.radarRadius))}`,
        copy.radarHandle.x + 6,
        copy.radarHandle.y - 4,
        color
      );
      paintOutlinedLabel(
        ctx,
        `S ${formatKm(mapRadiusKm(layout.sightRadius))}`,
        copy.sightHandle.x + 6,
        copy.sightHandle.y - 4,
        color
      );

      if (showHandles) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 224, 130, 0.95)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(copy.origin.x, copy.origin.y, 9 + stroke.width, 0, Math.PI * 2);
        ctx.stroke();
        if (copy.kind === "reach") {
          ctx.beginPath();
          ctx.arc(copy.probe.x, copy.probe.y, 8 + stroke.width, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(copy.radarHandle.x, copy.radarHandle.y, 7 + stroke.width, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(copy.sightHandle.x, copy.sightHandle.y, 6 + stroke.width, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function rangeHitKind(stroke, screen, canvas) {
    const pad = Math.max(12, (stroke.width || 3) + 8);
    let best = null;
    let bestDist = Infinity;
    const consider = (mode, dist, hitPad) => {
      if (dist <= hitPad && dist < bestDist) {
        best = mode;
        bestDist = dist;
      }
    };
    for (const copy of rangeCopies(stroke, canvas)) {
      consider("sight", Math.hypot(copy.sightHandle.x - screen.x, copy.sightHandle.y - screen.y), pad + 2);
      consider("radar", Math.hypot(copy.radarHandle.x - screen.x, copy.radarHandle.y - screen.y), pad + 2);
      if (copy.kind === "reach") {
        consider("orbit", Math.hypot(copy.probe.x - screen.x, copy.probe.y - screen.y), pad + 4);
      }
      consider("move", Math.hypot(copy.origin.x - screen.x, copy.origin.y - screen.y), pad + 6);
    }
    return best;
  }

  function rangeHitsEraser(stroke, screen, canvas) {
    if (rangeHitKind(stroke, screen, canvas)) return true;
    const pad = Math.max(12, (stroke.width || 3) + 8);
    for (const copy of rangeCopies(stroke, canvas)) {
      if (
        copy.kind === "reach" &&
        copy.combatR > 4 &&
        Math.abs(Math.hypot(screen.x - copy.origin.x, screen.y - copy.origin.y) - copy.combatR) <= pad
      ) {
        return true;
      }
      if (copy.kind === "reach" && distToSegment(screen, copy.origin, copy.probe) <= pad) return true;
      if (
        copy.radarR > 4 &&
        Math.abs(Math.hypot(screen.x - copy.probe.x, screen.y - copy.probe.y) - copy.radarR) <= pad
      ) {
        return true;
      }
      if (
        copy.sightR > 4 &&
        Math.abs(Math.hypot(screen.x - copy.probe.x, screen.y - copy.probe.y) - copy.sightR) <= pad
      ) {
        return true;
      }
    }
    return false;
  }

  function findRangeHandle(screen, canvas) {
    if (!screen || !canvas) return null;
    for (let i = state.strokes.length - 1; i >= 0; i -= 1) {
      const stroke = state.strokes[i];
      if (stroke.type !== "range") continue;
      const mode = rangeHitKind(stroke, screen, canvas);
      if (mode) return { index: i, id: stroke.id, mode };
    }
    return null;
  }

  function paintMeasure(ctx, stroke, canvas) {
    const a = stroke.points[0];
    const b = stroke.points[1] || a;
    if (!a) return;
    const label = formatKm(mapDistanceKm(a, b));
    const showHandles = state.tool === "measure";
    for (const path of strokeScreenPath({ points: [a, b] }, canvas)) {
      if (path.length < 2) continue;
      ctx.save();
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      ctx.lineTo(path[1].x, path[1].y);
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(path[0].x, path[0].y, 4 + stroke.width, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(path[1].x, path[1].y, 4 + stroke.width, 0, Math.PI * 2);
      ctx.fill();
      const mid = { x: (path[0].x + path[1].x) / 2, y: (path[0].y + path[1].y) / 2 };
      paintOutlinedLabel(ctx, label, mid.x + 8, mid.y - 6, stroke.color);
      if (showHandles) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 224, 130, 0.95)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(path[0].x, path[0].y, 9 + stroke.width, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(path[1].x, path[1].y, 9 + stroke.width, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function measureHitKind(stroke, screen, canvas) {
    const pad = Math.max(12, (stroke.width || 3) + 8);
    let best = null;
    let bestDist = Infinity;
    const consider = (mode, dist, hitPad) => {
      if (dist <= hitPad && dist < bestDist) {
        best = mode;
        bestDist = dist;
      }
    };
    for (const path of strokeScreenPath({ points: stroke.points.slice(0, 2) }, canvas)) {
      if (path.length < 2) continue;
      consider("a", Math.hypot(path[0].x - screen.x, path[0].y - screen.y), pad + 4);
      consider("b", Math.hypot(path[1].x - screen.x, path[1].y - screen.y), pad + 4);
      consider("move", distToSegment(screen, path[0], path[1]), pad);
    }
    return best;
  }

  function findMeasureHandle(screen, canvas) {
    if (!screen || !canvas) return null;
    for (let i = state.strokes.length - 1; i >= 0; i -= 1) {
      const stroke = state.strokes[i];
      if (stroke.type !== "measure") continue;
      const mode = measureHitKind(stroke, screen, canvas);
      if (mode) return { index: i, id: stroke.id, mode };
    }
    return null;
  }

  function paintStroke(ctx, stroke, canvas) {
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    if (stroke.type === "range") {
      paintRange(ctx, stroke, canvas);
      ctx.restore();
      return;
    }

    if (stroke.type === "measure") {
      paintMeasure(ctx, stroke, canvas);
      ctx.restore();
      return;
    }

    if (stroke.type === "marker" || stroke.type === "text") {
      for (const p of screenPoints(stroke.points[0], canvas)) {
        if (stroke.type === "text" && stroke.label) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, markerRadius(stroke), 0, Math.PI * 2);
          ctx.fill();
          const size = 12 + stroke.width * 2;
          ctx.font = `700 ${size}px Segoe UI, Tahoma, sans-serif`;
          ctx.textBaseline = "bottom";
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.lineWidth = Math.max(3, size / 5);
          ctx.strokeStyle = "rgba(0,0,0,0.85)";
          const lines = wrapTextLines(ctx, stroke.label, 280);
          lines.forEach((line, i) => {
            const x = p.x + 8;
            const y = p.y - 8 - (lines.length - 1 - i) * (size + 3);
            ctx.strokeText(line, x, y);
            ctx.fillStyle = stroke.color;
            ctx.fillText(line, x, y);
          });
        } else if (stroke.type === "marker") {
          const radius = markerRadius(stroke);
          const stem = markerStem(stroke);
          const cy = p.y + stem + radius;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, cy - radius);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return;
    }

    for (const path of strokeScreenPath(stroke, canvas)) {
      if (path.length === 1) {
        ctx.beginPath();
        ctx.arc(path[0].x, path[0].y, stroke.width, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i += 1) ctx.lineTo(path[i].x, path[i].y);
      ctx.stroke();
      if (stroke.type === "arrow" && path.length >= 2) {
        drawArrowhead(ctx, path[path.length - 2], path[path.length - 1], 12 + stroke.width * 2);
      }
    }
    ctx.restore();
  }

  function distToSegment(point, a, b) {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const len2 = vx * vx + vy * vy;
    if (!len2) return Math.hypot(point.x - a.x, point.y - a.y);
    let t = ((point.x - a.x) * vx + (point.y - a.y) * vy) / len2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(point.x - (a.x + t * vx), point.y - (a.y + t * vy));
  }

  function pointInBox(point, box) {
    return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
  }

  function textHitBoxes(ctx, stroke, canvas) {
    const boxes = [];
    if (!stroke.points[0]) return boxes;
    const size = 12 + stroke.width * 2;
    ctx.font = `700 ${size}px Segoe UI, Tahoma, sans-serif`;
    const lines = wrapTextLines(ctx, stroke.label || "", 280);
    const lineH = size + 3;
    for (const p of screenPoints(stroke.points[0], canvas)) {
      const pinR = 8 + stroke.width + 6;
      boxes.push({ x: p.x - pinR, y: p.y - pinR, w: pinR * 2, h: pinR * 2 });
      lines.forEach((line, i) => {
        const w = Math.max(16, ctx.measureText(line || " ").width + 6);
        const x = p.x + 6;
        const y = p.y - 8 - (lines.length - 1 - i) * lineH - size;
        boxes.push({ x, y, w, h: lineH + 4 });
      });
    }
    return boxes;
  }

  function strokeHits(stroke, screen, canvas, ctx) {
    if (!stroke?.points?.length) return false;
    const pad = Math.max(12, (stroke.width || 3) + 8);
    if (stroke.type === "text") {
      return textHitBoxes(ctx, stroke, canvas).some((box) => pointInBox(screen, box));
    }
    if (stroke.type === "range") {
      return rangeHitsEraser(stroke, screen, canvas);
    }
    if (stroke.type === "measure") {
      return measureHitKind(stroke, screen, canvas) != null;
    }
    if (stroke.type === "marker") {
      const radius = markerRadius(stroke);
      const stem = markerStem(stroke);
      return screenPoints(stroke.points[0], canvas).some((p) => {
        const circle = { x: p.x, y: p.y + stem + radius };
        if (Math.hypot(circle.x - screen.x, circle.y - screen.y) <= radius + pad) return true;
        return distToSegment(screen, p, { x: p.x, y: circle.y - radius }) <= pad;
      });
    }
    for (const path of strokeScreenPath(stroke, canvas)) {
      if (path.length === 1) {
        if (Math.hypot(path[0].x - screen.x, path[0].y - screen.y) <= pad) return true;
        continue;
      }
      for (let i = 1; i < path.length; i += 1) {
        if (distToSegment(screen, path[i - 1], path[i]) <= pad) return true;
      }
    }
    return false;
  }

  function findStrokeIndexAt(screen, canvas) {
    if (!screen || !canvas || !state.ctx) return -1;
    for (let i = state.strokes.length - 1; i >= 0; i -= 1) {
      if (strokeHits(state.strokes[i], screen, canvas, state.ctx)) return i;
    }
    return -1;
  }

  function eraseAtScreen(screen) {
    if (!state.visible || !state.overlay) return false;
    const idx = findStrokeIndexAt(screen, state.overlay);
    if (idx < 0) return false;
    state.strokes.splice(idx, 1);
    state.hoverStrokeId = null;
    scheduleSave();
    updateStatus();
    return true;
  }

  function render() {
    const api = getMapApi();
    const overlay = state.overlay;
    if (!api || !overlay || !state.ctx) return;
    const mapCanvas = api.getCanvas();
    const container = api.getContainer();
    const width = mapCanvas?.width || container?.clientWidth || overlay.width;
    const height = mapCanvas?.height || container?.clientHeight || overlay.height;
    if (width && height && (overlay.width !== width || overlay.height !== height)) {
      overlay.width = width;
      overlay.height = height;
    }
    const ctx = state.ctx;
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!state.visible) {
      syncTextEditor();
      return;
    }
    if (state.measureEdit) {
      state.hoverStrokeId = state.measureEdit.id;
    } else if (state.rangeEdit) {
      state.hoverStrokeId = state.rangeEdit.id;
    } else if (state.tool === "eraser" && state.pointerScreen) {
      const idx = findStrokeIndexAt(state.pointerScreen, overlay);
      state.hoverStrokeId = idx >= 0 ? state.strokes[idx].id : null;
    } else if (state.tool === "range" && state.pointerScreen && !state.draft) {
      state.hoverStrokeId = findRangeHandle(state.pointerScreen, overlay)?.id || null;
    } else if (state.tool === "measure" && state.pointerScreen && !state.draft) {
      state.hoverStrokeId = findMeasureHandle(state.pointerScreen, overlay)?.id || null;
    } else if (state.tool !== "eraser") {
      state.hoverStrokeId = null;
    }
    for (const stroke of state.strokes) {
      if (stroke.id === state.hoverStrokeId) {
        ctx.save();
        ctx.shadowColor = "rgba(255, 224, 130, 0.95)";
        ctx.shadowBlur = 18;
        paintStroke(ctx, { ...stroke, color: "#ffe082" }, overlay);
        ctx.restore();
      }
      paintStroke(ctx, stroke, overlay);
    }
    if (state.draft) paintStroke(ctx, state.draft, overlay);
    if (state.textEdit) {
      paintStroke(
        ctx,
        {
          type: "text",
          color: state.color,
          width: state.width,
          points: [state.textEdit.mapPos],
          label: state.textEdit.value || "…",
        },
        overlay
      );
    }
    syncTextEditor();
  }

  function loop() {
    render();
    requestAnimationFrame(loop);
  }

  function startDraft(mapPos) {
    state.draft = {
      id: uid(),
      type: state.tool,
      color: state.color,
      width: state.width,
      points: [mapPos],
    };
    if (state.tool === "range") {
      state.draft.kind = state.rangeKind === "sensors" ? "sensors" : "reach";
      state.draft.heading = 0;
      state.draft.combatRadius = 0;
      state.draft.radarRadius = 0;
      state.draft.sightRadius = 0;
      state.draft.points = [mapPos];
    }
    if (state.tool === "measure") {
      state.draft.points = [mapPos, { x: mapPos.x, y: mapPos.y }];
    }
  }

  function finishDraft() {
    if (!state.draft) return;
    if (state.draft.type === "pen") {
      state.draft.points = simplify(state.draft.points);
    }
    if (state.draft.type === "range") {
      const layout = rangeLayout(state.draft);
      const origin = fromMap(layout.origin);
      const extent =
        layout.kind === "sensors"
          ? fromMap(layout.radarHandle)
          : fromMap(layout.probe);
      if (Math.hypot(extent.x - origin.x, extent.y - origin.y) < 12) {
        state.draft = null;
        updateStatus();
        return;
      }
      state.draft.points = [layout.origin];
    }
    if (state.draft.type === "measure") {
      const origin = fromMap(state.draft.points[0]);
      const tip = fromMap(state.draft.points[1] || state.draft.points[0]);
      if (Math.hypot(tip.x - origin.x, tip.y - origin.y) < 12) {
        state.draft = null;
        updateStatus();
        return;
      }
      state.draft.points = [state.draft.points[0], state.draft.points[1]];
    }
    if (state.draft.points.length) state.strokes.push(state.draft);
    state.draft = null;
    scheduleSave();
    updateStatus();
  }

  function beginTextEdit(mapPos) {
    const preset = ui("#con-intel-label")?.value?.trim() || "";
    if (preset) {
      state.strokes.push({
        id: uid(),
        type: "text",
        color: state.color,
        width: state.width,
        points: [mapPos],
        label: preset,
      });
      scheduleSave();
      updateStatus();
      return;
    }
    cancelTextEdit();
    state.textEdit = { mapPos, value: "" };
    ensureTextEditor();
    const input = state.textEditorHost.shadowRoot.querySelector("textarea");
    input.value = "";
    input.style.height = "";
    syncTextEditor();
    setTimeout(() => input.focus(), 0);
  }

  function commitTextEdit() {
    if (!state.textEdit) return;
    const label = state.textEdit.value.trim();
    if (label) {
      state.strokes.push({
        id: uid(),
        type: "text",
        color: state.color,
        width: state.width,
        points: [state.textEdit.mapPos],
        label,
      });
      const field = ui("#con-intel-label");
      if (field) field.value = label;
      scheduleSave();
    }
    cancelTextEdit();
    updateStatus();
  }

  function cancelTextEdit() {
    state.textEdit = null;
    if (state.textEditorHost) {
      state.textEditorHost.style.display = "none";
    }
  }

  function ensureTextEditor() {
    if (state.textEditorHost) {
      state.textEditorHost.style.display = "block";
      return;
    }
    const host = document.createElement("div");
    host.id = "con-intel-text-host";
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { all: initial; }
        .box { display: flex; flex-direction: column; gap: 6px; }
        textarea {
          display: block;
          width: 220px;
          min-width: 180px;
          max-width: 320px;
          min-height: 72px;
          padding: 6px 8px;
          color: #e8eef5;
          background: rgba(10, 16, 24, 0.96);
          border: 1px solid #8fd4f2;
          border-radius: 4px;
          font: 13px/1.35 Segoe UI, Tahoma, sans-serif;
          outline: none;
          resize: both;
          white-space: pre-wrap;
        }
        .row { display: flex; gap: 6px; }
        button {
          appearance: none;
          border: 1px solid rgba(143, 212, 242, 0.45);
          background: #142434;
          color: #e8eef5;
          border-radius: 4px;
          padding: 5px 10px;
          font: 12px Segoe UI, Tahoma, sans-serif;
          cursor: pointer;
        }
        button.save { background: #1e6d93; border-color: #8fd4f2; }
        .hint {
          color: #9fb3c4;
          font: 11px Segoe UI, Tahoma, sans-serif;
        }
      </style>
      <div class="box">
        <textarea placeholder="Line 1&#10;Line 2" rows="4"></textarea>
        <div class="row">
          <button class="save" type="button">Save</button>
          <button class="cancel" type="button">Cancel</button>
        </div>
        <div class="hint">Enter for a new line · Ctrl+Enter or Save</div>
      </div>
    `;
    const input = root.querySelector("textarea");
    const grow = () => {
      input.style.height = "auto";
      input.style.height = `${Math.min(220, Math.max(72, input.scrollHeight))}px`;
    };
    input.addEventListener("input", () => {
      if (state.textEdit) state.textEdit.value = input.value;
      grow();
    });
    input.addEventListener("keydown", (event) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        commitTextEdit();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        cancelTextEdit();
      }
    });
    root.querySelector(".save").addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      commitTextEdit();
    });
    root.querySelector(".cancel").addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      cancelTextEdit();
    });
    input.addEventListener("keyup", (event) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
    });
    input.addEventListener("keypress", (event) => {
      event.stopPropagation();
      event.stopImmediatePropagation();
    });
    document.body.appendChild(host);
    state.textEditorHost = host;
  }

  function syncTextEditor() {
    if (!state.textEdit || !state.textEditorHost || !state.overlay) {
      if (state.textEditorHost && !state.textEdit) state.textEditorHost.style.display = "none";
      return;
    }
    const overlay = state.overlay;
    const p = fromMap(state.textEdit.mapPos);
    const rect = overlay.getBoundingClientRect();
    const x = rect.left + (p.x / overlay.width) * rect.width + 10;
    const y = rect.top + (p.y / overlay.height) * rect.height - 18;
    state.textEditorHost.style.display = "block";
    state.textEditorHost.style.left = `${Math.max(8, x)}px`;
    state.textEditorHost.style.top = `${Math.max(8, y)}px`;
  }

  function isDrawChord(event) {
    return event.altKey && event.button === 0;
  }

  function isOnToolbar(event) {
    return !!(
      event.target &&
      event.target.closest &&
      (event.target.closest("#con-intel-host") || event.target.closest("#con-intel-text-host"))
    );
  }

  function eat(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function bindMapDrawEvents() {
    const drawCanvas = () => state.overlay || getMapApi()?.getCanvas();

    const overMap = (event) => {
      const target = event.target;
      if (!target) return false;
      const container = getMapApi()?.getContainer();
      const canvas = getMapApi()?.getCanvas();
      if (canvas && (target === canvas || canvas.contains(target))) return true;
      return !!(container && (target === container || container.contains(target))) && !isOnToolbar(event);
    };

    const onDown = (event) => {
      if (isOnToolbar(event)) return;
      if (state.textEdit && overMap(event)) {
        commitTextEdit();
        if (!isDrawChord(event)) return;
      }
      if (!overMap(event)) return;
      if (state.draft) {
        eat(event);
        return;
      }
      if (!isDrawChord(event)) return;
      eat(event);
      const surface = drawCanvas();
      if (!surface) return;
      const mapPos = toMap(eventToScreen(event, surface));
      if (state.tool === "marker") {
        startDraft(mapPos);
        finishDraft();
        return;
      }
      if (state.tool === "text") {
        beginTextEdit(mapPos);
        return;
      }
      if (state.tool === "eraser") {
        state.erasing = true;
        eraseAtScreen(eventToScreen(event, surface));
        return;
      }
      if (state.tool === "range") {
        const handle = findRangeHandle(eventToScreen(event, surface), surface);
        if (handle) {
          const stroke = state.strokes[handle.index];
          state.rangeEdit = {
            id: stroke.id,
            mode: handle.mode,
            combatRadius: stroke.combatRadius,
            radarRadius: stroke.radarRadius,
            sightRadius: stroke.sightRadius,
          };
          state.hoverStrokeId = stroke.id;
          return;
        }
        const overRange = findStrokeIndexAt(eventToScreen(event, surface), surface);
        if (overRange >= 0 && state.strokes[overRange].type === "range") return;
      }
      if (state.tool === "measure") {
        const handle = findMeasureHandle(eventToScreen(event, surface), surface);
        if (handle) {
          const stroke = state.strokes[handle.index];
          state.measureEdit = {
            id: stroke.id,
            mode: handle.mode,
            grab: mapPos,
            start: stroke.points.slice(0, 2).map((p) => ({ x: p.x, y: p.y })),
          };
          state.hoverStrokeId = stroke.id;
          return;
        }
      }
      startDraft(mapPos);
    };

    const onMove = (event) => {
      const surface = drawCanvas();
      if (surface && overMap(event) && !isOnToolbar(event)) {
        state.pointerScreen = eventToScreen(event, surface);
      } else if (!state.erasing) {
        state.pointerScreen = null;
      }
      if (state.tool === "eraser" && state.erasing) {
        eat(event);
        if (surface) eraseAtScreen(eventToScreen(event, surface));
        return;
      }
      if (state.rangeEdit) {
        eat(event);
        if (!surface) return;
        const stroke = state.strokes.find((item) => item.id === state.rangeEdit.id);
        if (!stroke) return;
        const mapPos = toMap(eventToScreen(event, surface));
        if (state.rangeEdit.mode === "move") moveRangeOrigin(stroke, mapPos);
        else if (state.rangeEdit.mode === "orbit") {
          setRangeHeading(stroke, mapPos, state.rangeEdit.combatRadius);
          stroke.radarRadius = state.rangeEdit.radarRadius;
          stroke.sightRadius = state.rangeEdit.sightRadius;
        }
        else if (state.rangeEdit.mode === "radar") setSensorRadius(stroke, "radar", mapPos);
        else if (state.rangeEdit.mode === "sight") setSensorRadius(stroke, "sight", mapPos);
        scheduleSave();
        return;
      }
      if (state.measureEdit) {
        eat(event);
        if (!surface) return;
        const stroke = state.strokes.find((item) => item.id === state.measureEdit.id);
        if (!stroke) return;
        const mapPos = toMap(eventToScreen(event, surface));
        if (state.measureEdit.mode === "a") stroke.points[0] = mapPos;
        else if (state.measureEdit.mode === "b") stroke.points[1] = mapPos;
        else {
          const dx = mapPos.x - state.measureEdit.grab.x;
          const dy = mapPos.y - state.measureEdit.grab.y;
          stroke.points = state.measureEdit.start.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        }
        scheduleSave();
        return;
      }
      if (!state.draft || state.draft.type === "text") return;
      eat(event);
      if (!surface) return;
      const mapPos = toMap(eventToScreen(event, surface));
      if (state.draft.type === "range") {
        if (state.draft.kind === "sensors") applySensorsFromDrag(state.draft, mapPos);
        else applyReachFromDrag(state.draft, mapPos);
        return;
      }
      if (state.tool === "arrow" || state.draft.type === "measure") {
        state.draft.points = [state.draft.points[0], mapPos];
        return;
      }
      state.draft.points.push(mapPos);
    };

    const onUp = (event) => {
      if (state.erasing) {
        state.erasing = false;
        eat(event);
        return;
      }
      if (state.rangeEdit) {
        state.rangeEdit = null;
        eat(event);
        scheduleSave();
        return;
      }
      if (state.measureEdit) {
        state.measureEdit = null;
        eat(event);
        scheduleSave();
        return;
      }
      if (!state.draft || state.draft.type === "text") return;
      eat(event);
      finishDraft();
    };

    const opts = { capture: true, passive: false };
    window.addEventListener("pointerdown", onDown, opts);
    window.addEventListener("pointermove", onMove, opts);
    window.addEventListener("pointerup", onUp, opts);
    window.addEventListener("pointercancel", onUp, opts);

    const setDrawCursor = (on) => {
      const container = getMapApi()?.getContainer();
      if (container) container.style.cursor = on ? "crosshair" : "";
    };
    window.addEventListener("keydown", (event) => {
      if (event.key === "Alt") setDrawCursor(true);
    });
    window.addEventListener("keyup", (event) => {
      if (event.key === "Alt") setDrawCursor(false);
    });
    window.addEventListener("blur", () => setDrawCursor(false));
  }

  function ui(selector) {
    return state.toolbarRoot?.querySelector(selector) || null;
  }

  function setTool(tool) {
    state.tool = tool;
    for (const id of ["pen", "arrow", "marker", "text", "range", "measure", "eraser"]) {
      ui(`#con-intel-${id}`)?.classList.toggle("active", tool === id);
    }
    const note = ui("#con-intel-note-wrap");
    if (note) note.hidden = tool !== "text";
    const range = ui("#con-intel-range-wrap");
    if (range) range.hidden = tool !== "range";
    updateStatus();
    applyPanelLayout();
  }

  function setRangeKind(kind) {
    state.rangeKind = kind === "sensors" ? "sensors" : "reach";
    ui("#con-intel-kind-reach")?.classList.toggle("active", state.rangeKind === "reach");
    ui("#con-intel-kind-sensors")?.classList.toggle("active", state.rangeKind === "sensors");
    if (state.draft?.type === "range") state.draft.kind = state.rangeKind;
  }

  function toggleMarksVisible() {
    state.visible = !state.visible;
    const btn = ui("#con-intel-hide");
    if (!btn) return;
    btn.title = state.visible ? "Hide marks (Alt+H)" : "Show marks (Alt+H)";
    const label = btn.querySelector(".lbl");
    if (label) label.textContent = state.visible ? "Hide" : "Show";
    const on = btn.querySelector(".eye");
    const off = btn.querySelector(".eye-off");
    if (on) on.style.display = state.visible ? "block" : "none";
    if (off) off.style.display = state.visible ? "none" : "block";
  }

  function fromTypingField(event) {
    const path = typeof event.composedPath === "function" ? event.composedPath() : [event.target];
    return path.some(
      (node) =>
        node &&
        (node.tagName === "INPUT" ||
          node.tagName === "TEXTAREA" ||
          node.id === "con-intel-text-host")
    );
  }

  function setColor(color) {
    state.color = color;
    const picker = ui("#con-intel-color");
    if (picker) picker.value = color;
    syncPalette();
  }

  function syncPalette() {
    const current = String(state.color || "").toLowerCase();
    ui("#con-intel-palette")
      ?.querySelectorAll(".swatch")
      .forEach((el) => {
        el.classList.toggle("active", (el.dataset.color || "").toLowerCase() === current);
      });
  }

  function updateStatus() {
    const el = ui("#con-intel-status");
    if (!el) return;
    const action =
      state.tool === "eraser"
        ? "Hold Alt + click a mark"
        : state.tool === "measure"
          ? "Alt-drag to measure km · drag ends to adjust"
          : state.tool === "range"
          ? state.rangeKind === "sensors"
            ? "Alt-drag radar size · origin moves · R/S dots resize"
            : "Alt-drag combat size (locks) · origin moves · hub slides · R/S dots resize"
          : state.tool === "text" || state.tool === "marker"
            ? "Hold Alt + click"
            : "Hold Alt + drag";
    el.textContent = `${getMapApi()?.kind || "?"} · ${state.gameId} · ${action} · ${state.strokes.length}`;
  }

  function clampPanel(left, top, size) {
    const host = state.toolbar;
    const w = size?.w || host?.offsetWidth || (state.panelCollapsed ? 52 : 248);
    const h = size?.h || host?.offsetHeight || (state.panelCollapsed ? 52 : 280);
    const maxL = Math.max(8, window.innerWidth - w - 8);
    const maxT = Math.max(8, window.innerHeight - h - 8);
    return {
      left: Math.min(maxL, Math.max(8, Number(left) || 8)),
      top: Math.min(maxT, Math.max(8, Number(top) || 8)),
    };
  }

  function nearestCorner(x, y) {
    const horiz = x < window.innerWidth / 2 ? "left" : "right";
    const vert = y < window.innerHeight / 2 ? "top" : "bottom";
    return `${vert}-${horiz}`;
  }

  function originForCorner(corner) {
    const horiz = (corner || "").endsWith("right") ? "100%" : "0%";
    const vert = (corner || "").startsWith("bottom") ? "100%" : "0%";
    return `${horiz} ${vert}`;
  }

  function posForCorner(corner, w, h) {
    const m = 12;
    const left = (corner || "").endsWith("left") ? m : window.innerWidth - w - m;
    const top = (corner || "").startsWith("top") ? m : window.innerHeight - h - m;
    return clampPanel(left, top, { w, h });
  }

  function restoreExpandedPos(corner) {
    const w = 248;
    const h = state.toolbar?.offsetHeight || 320;
    const left = Number.isFinite(state.expandedLeft) ? state.expandedLeft : state.panelLeft;
    const top = Number.isFinite(state.expandedTop) ? state.expandedTop : state.panelTop;
    const cx = left + w / 2;
    const cy = top + (Number.isFinite(state.expandedTop) ? h / 2 : h / 2);
    if (nearestCorner(cx, cy) === corner) return clampPanel(left, top, { w, h });
    return posForCorner(corner, w, h);
  }

  function popSurface(kind) {
    const el = kind === "fab" ? ui("#con-intel-fab") : ui(".panel");
    if (!el) return;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }

  function applyPanelLayout() {
    const host = state.toolbar;
    if (!host) return;
    const panel = ui(".panel");
    const fab = ui("#con-intel-fab");
    host.classList.toggle("collapsed", state.panelCollapsed);
    host.classList.toggle("dragging", state.panelDragging);
    if (panel) panel.style.display = state.panelCollapsed ? "none" : "flex";
    if (fab) fab.style.display = state.panelCollapsed ? "flex" : "none";
    if (!Number.isFinite(state.panelTop)) {
      const h = host.offsetHeight || 280;
      state.panelTop = Math.max(8, window.innerHeight - h - 84);
      state.expandedTop = state.panelTop;
    }
    const pos = clampPanel(state.panelLeft, state.panelTop);
    state.panelLeft = pos.left;
    state.panelTop = pos.top;
    host.style.left = `${pos.left}px`;
    host.style.top = `${pos.top}px`;
    host.style.right = "auto";
    host.style.bottom = "auto";
    host.style.width = state.panelCollapsed ? "auto" : "248px";
    const size = state.panelCollapsed
      ? { w: 52, h: 52 }
      : { w: host.offsetWidth || 248, h: host.offsetHeight || 280 };
    const corner =
      state.dockCorner || nearestCorner(state.panelLeft + size.w / 2, state.panelTop + size.h / 2);
    host.style.setProperty("--dock-origin", originForCorner(corner));
  }

  function setPanelCollapsed(collapsed) {
    const host = state.toolbar;
    const next = !!collapsed;
    if (!host || next === state.panelCollapsed) return;

    if (next) {
      const w = host.offsetWidth || 248;
      const h = host.offsetHeight || 280;
      state.expandedLeft = state.panelLeft;
      state.expandedTop = state.panelTop;
      state.dockCorner = nearestCorner(state.panelLeft + w / 2, state.panelTop + h / 2);
      host.classList.add("no-motion");
      state.panelCollapsed = true;
      applyPanelLayout();
      host.offsetWidth;
      host.classList.remove("no-motion");
      const dock = posForCorner(state.dockCorner, 52, 52);
      state.panelLeft = dock.left;
      state.panelTop = dock.top;
      applyPanelLayout();
      popSurface("fab");
    } else {
      const corner =
        state.dockCorner ||
        nearestCorner(state.panelLeft + 26, state.panelTop + 26);
      state.dockCorner = corner;
      const restore = restoreExpandedPos(corner);
      host.classList.add("no-motion");
      state.panelCollapsed = false;
      applyPanelLayout();
      host.offsetWidth;
      host.classList.remove("no-motion");
      state.panelLeft = restore.left;
      state.panelTop = restore.top;
      applyPanelLayout();
      popSurface("panel");
    }
    scheduleSaveUi();
  }

  function bindPanelDrag(handle, onTap) {
    if (!handle) return;
    let startX = 0;
    let startY = 0;
    let origL = 0;
    let origT = 0;
    let moved = false;
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (event.target.closest("button") && event.target.closest("button") !== handle) return;
      event.preventDefault();
      event.stopPropagation();
      handle.setPointerCapture(event.pointerId);
      startX = event.clientX;
      startY = event.clientY;
      origL = state.panelLeft;
      origT = Number.isFinite(state.panelTop) ? state.panelTop : 8;
      moved = false;
      state.panelDragging = true;
      state.toolbar?.classList.add("dragging");
    });
    handle.addEventListener("pointermove", (event) => {
      if (!state.panelDragging) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      if (!moved) return;
      const pos = clampPanel(origL + dx, origT + dy);
      state.panelLeft = pos.left;
      state.panelTop = pos.top;
      applyPanelLayout();
    });
    const endDrag = (event) => {
      if (!state.panelDragging) return;
      state.panelDragging = false;
      state.toolbar?.classList.remove("dragging");
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch (_err) {
        /* already released */
      }
      if (!moved && typeof onTap === "function") onTap();
      else {
        if (moved && state.panelCollapsed) {
          const corner = nearestCorner(state.panelLeft + 26, state.panelTop + 26);
          state.dockCorner = corner;
          const dock = posForCorner(corner, 52, 52);
          state.panelLeft = dock.left;
          state.panelTop = dock.top;
          applyPanelLayout();
        }
        if (moved && !state.panelCollapsed) {
          state.expandedLeft = state.panelLeft;
          state.expandedTop = state.panelTop;
        }
        scheduleSaveUi();
      }
    };
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
  }

  function createToolbar() {
    const host = document.createElement("div");
    host.id = "con-intel-host";
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { all: initial; }
        * { box-sizing: border-box; }
        .panel {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px;
          width: 248px;
          color: #e8eef5;
          font: 12px/1.4 Segoe UI, Tahoma, sans-serif;
          background: rgba(10, 16, 24, 0.94);
          border: 1px solid rgba(90, 170, 210, 0.55);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
          user-select: none;
        }
        .titlebar {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: grab;
          touch-action: none;
        }
        .titlebar:active { cursor: grabbing; }
        .titlebar h1 { flex: 1; }
        .fab {
          display: none;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          align-items: center;
          justify-content: center;
          background: rgba(10, 16, 24, 0.94);
          border: 2px solid #8fd4f2;
          color: #8fd4f2;
          font: 700 11px/1 Segoe UI, Tahoma, sans-serif;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: grab;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
          touch-action: none;
          user-select: none;
        }
        .panel, .fab {
          transform-origin: var(--dock-origin, 0% 100%);
        }
        .panel.pop, .fab.pop {
          animation: intel-pop 0.22s cubic-bezier(0.22, 1, 0.32, 1);
        }
        @keyframes intel-pop {
          from { opacity: 0; transform: scale(0.72); }
          to { opacity: 1; transform: scale(1); }
        }
        h1 {
          margin: 0;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8fd4f2;
        }
        .row { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
        .tools { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
        .tools .split {
          width: 1px;
          height: 22px;
          margin: 0 2px;
          background: rgba(143, 212, 242, 0.35);
        }
        button.icon {
          width: 28px;
          height: 28px;
          min-height: 28px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        button.icon svg,
        button.tool svg,
        button.danger svg { width: 14px; height: 14px; display: block; pointer-events: none; flex-shrink: 0; }
        button.tool {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          width: auto;
          height: auto;
          min-height: 28px;
          padding: 4px 8px;
        }
        button.tool.eraser { color: #ffb070; border-color: rgba(224, 138, 77, 0.65); }
        button.tool.eraser.active { background: #6a3214; border-color: #ffb070; color: #ffe0c2; }
        .range-opts { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
        .range-opts .hint { color: #7f93a6; font-size: 10px; width: 100%; }
        button {
          appearance: none;
          -webkit-appearance: none;
          border: 1px solid rgba(143, 212, 242, 0.35);
          background: #142434;
          color: #e8eef5;
          border-radius: 4px;
          padding: 6px 8px;
          font: 12px/1.2 Segoe UI, Tahoma, sans-serif;
          cursor: pointer;
          text-indent: 0;
          text-transform: none;
          letter-spacing: normal;
          min-height: 26px;
          overflow: visible;
        }
        button.active { background: #1e6d93; border-color: #8fd4f2; }
        button.danger {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          color: #f0b4b4;
          border-color: rgba(200, 80, 80, 0.45);
          background: #2a1518;
        }
        button.danger svg { width: 14px; height: 14px; }
        .kbd {
          color: #7f93a6;
          font-size: 10px;
        }
        button.fab {
          display: none;
          width: 52px;
          height: 52px;
          min-height: 52px;
          padding: 0;
          border-radius: 50%;
          border: 2px solid #8fd4f2;
          background: rgba(10, 16, 24, 0.94);
          color: #8fd4f2;
          font: 700 11px/1 Segoe UI, Tahoma, sans-serif;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: grab;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
          touch-action: none;
        }
        .palette {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 5px;
        }
        button.swatch {
          width: 22px;
          height: 22px;
          min-height: 22px;
          padding: 0;
          border-radius: 4px;
          border: 2px solid rgba(232, 238, 245, 0.35);
          box-shadow: none;
        }
        button.swatch.active {
          border-color: #ffffff;
          box-shadow: 0 0 0 2px #8fd4f2;
        }
        label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #e8eef5;
          font: 12px/1.2 Segoe UI, Tahoma, sans-serif;
        }
        .status {
          color: #9fb3c4;
          font-size: 11px;
        }
        input[type="color"] {
          width: 28px;
          height: 22px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }
        input[type="range"] { width: 90px; }
        textarea {
          width: 100%;
          min-height: 56px;
          padding: 5px 6px;
          color: #e8eef5;
          background: #142434;
          border: 1px solid rgba(143, 212, 242, 0.35);
          border-radius: 4px;
          font: 12px/1.35 Segoe UI, Tahoma, sans-serif;
          resize: vertical;
          white-space: pre-wrap;
        }
        label.note {
          flex-direction: column;
          align-items: stretch;
          gap: 4px;
        }
        [hidden] { display: none !important; }
      </style>
      <button class="fab" id="con-intel-fab" type="button" title="Open intel overlay">Intel</button>
      <div class="panel">
        <div class="titlebar" id="con-intel-drag">
          <h1>Intel overlay v${VERSION}</h1>
          <button id="con-intel-collapse" class="icon" type="button" title="Collapse">${ICO.min}</button>
        </div>
        <div class="tools">
          <button id="con-intel-pen" class="tool active" type="button" title="Pen (Alt+1)">${ICO.pen} Pen</button>
          <button id="con-intel-arrow" class="tool" type="button" title="Arrow (Alt+2)">${ICO.arrow} Arrow</button>
          <button id="con-intel-marker" class="tool" type="button" title="Marker (Alt+3)">${ICO.marker} Marker</button>
          <button id="con-intel-text" class="tool" type="button" title="Text (Alt+4)">${ICO.text} Text</button>
          <button id="con-intel-range" class="tool" type="button" title="Range (Alt+5)">${ICO.range} Range</button>
          <button id="con-intel-measure" class="tool" type="button" title="Measure km (Alt+6)">${ICO.measure} Measure</button>
          <span class="split"></span>
          <button id="con-intel-eraser" class="tool eraser" type="button" title="Eraser (Alt+7)">${ICO.eraser} Eraser</button>
        </div>
        <div class="kbd">Alt+1–7 tools · hold Alt and click the map to draw</div>
        <div id="con-intel-range-wrap" class="range-opts" hidden>
          <button id="con-intel-kind-reach" class="tool active" type="button" title="Combat range plus radar and sight on the perimeter">Reach</button>
          <button id="con-intel-kind-sensors" class="tool" type="button" title="Radar and sight from a unit, no combat ring">Radar+Sight</button>
          <div class="hint">Combat size locks after place. Drag the center to move. Drag the hub on the ring to slide. Drag the R or S dots to resize radar and sight.</div>
        </div>
        <label class="note" id="con-intel-note-wrap" hidden>Note <textarea id="con-intel-label" rows="3" placeholder="optional, then Alt-click"></textarea></label>
        <div id="con-intel-palette" class="palette">
          ${PALETTE.map(
            (color) =>
              `<button class="swatch" type="button" data-color="${color}" title="${color}" style="background:${color}"></button>`
          ).join("")}
          <input id="con-intel-color" type="color" value="${state.color}" title="Custom color">
        </div>
        <div class="row">
          <label>Width <input id="con-intel-width" type="range" min="1" max="8" value="${state.width}"></label>
        </div>
        <div class="row">
          <button id="con-intel-hide" class="tool" type="button" title="Hide marks (Alt+H)">
            <span class="eye">${ICO.eye}</span>
            <span class="eye-off" style="display:none">${ICO.eyeOff}</span>
            <span class="lbl">Hide</span>
          </button>
          <button id="con-intel-undo" class="tool" type="button" title="Undo (Ctrl+Z)">${ICO.undo} Undo</button>
          <button id="con-intel-export" class="tool" type="button" title="Export">${ICO.export} Export</button>
          <button id="con-intel-import" class="tool" type="button" title="Import">${ICO.import} Import</button>
          <input id="con-intel-import-file" type="file" accept="application/json,.json" hidden>
        </div>
        <button id="con-intel-clear" class="danger" type="button" title="Delete every mark in this match">${ICO.trash} Clear all</button>
        <div id="con-intel-status" class="status"></div>
      </div>
    `;
    document.body.appendChild(host);
    state.toolbar = host;
    state.toolbarRoot = root;

    ui("#con-intel-hide").onclick = () => toggleMarksVisible();
    ui("#con-intel-collapse").onclick = (event) => {
      event.stopPropagation();
      setPanelCollapsed(true);
    };
    bindPanelDrag(ui("#con-intel-drag"));
    bindPanelDrag(ui("#con-intel-fab"), () => setPanelCollapsed(false));
    window.addEventListener("resize", () => {
      if (state.panelCollapsed) {
        const corner =
          state.dockCorner || nearestCorner(state.panelLeft + 26, state.panelTop + 26);
        state.dockCorner = corner;
        const dock = posForCorner(corner, 52, 52);
        state.panelLeft = dock.left;
        state.panelTop = dock.top;
      }
      applyPanelLayout();
    });
    ui("#con-intel-pen").onclick = () => setTool("pen");
    ui("#con-intel-arrow").onclick = () => setTool("arrow");
    ui("#con-intel-marker").onclick = () => setTool("marker");
    ui("#con-intel-text").onclick = () => setTool("text");
    ui("#con-intel-range").onclick = () => setTool("range");
    ui("#con-intel-measure").onclick = () => setTool("measure");
    ui("#con-intel-kind-reach").onclick = () => setRangeKind("reach");
    ui("#con-intel-kind-sensors").onclick = () => setRangeKind("sensors");
    ui("#con-intel-eraser").onclick = () => setTool("eraser");
    ui("#con-intel-palette").addEventListener("click", (event) => {
      const swatch = event.target.closest(".swatch");
      if (!swatch) return;
      setColor(swatch.dataset.color);
    });
    const stopKeys = (event) => event.stopPropagation();
    ui("#con-intel-label").addEventListener("keydown", stopKeys);
    ui("#con-intel-label").addEventListener("keyup", stopKeys);
    ui("#con-intel-color").oninput = (e) => {
      setColor(e.target.value);
    };
    syncPalette();
    ui("#con-intel-width").oninput = (e) => {
      state.width = Number(e.target.value);
    };
    ui("#con-intel-undo").onclick = () => {
      state.strokes.pop();
      scheduleSave();
      updateStatus();
    };
    ui("#con-intel-clear").onclick = () => {
      if (!state.strokes.length) return;
      if (!confirm("Clear ALL intel marks in this match? This is not the eraser.")) return;
      state.strokes = [];
      scheduleSave();
      updateStatus();
    };
    ui("#con-intel-export").onclick = () => exportStrokes();
    ui("#con-intel-import").onclick = () => ui("#con-intel-import-file")?.click();
    ui("#con-intel-import-file").onchange = (event) => {
      const file = event.target.files && event.target.files[0];
      event.target.value = "";
      importSketchFile(file);
    };

    applyPanelLayout();
    host.classList.add("no-motion");
    window.postMessage({ source: SOURCE, type: "load-ui" }, "*");
    requestAnimationFrame(() => host.classList.remove("no-motion"));

    window.addEventListener(
      "keydown",
      (event) => {
        if (fromTypingField(event)) return;
        if (event.altKey && !event.ctrlKey && !event.metaKey) {
          const tools = {
            Digit1: "pen",
            Digit2: "arrow",
            Digit3: "marker",
            Digit4: "text",
            Digit5: "range",
            Digit6: "measure",
            Digit7: "eraser",
            Numpad1: "pen",
            Numpad2: "arrow",
            Numpad3: "marker",
            Numpad4: "text",
            Numpad5: "range",
            Numpad6: "measure",
            Numpad7: "eraser",
          };
          const tool = tools[event.code];
          if (tool) {
            event.preventDefault();
            event.stopImmediatePropagation();
            setTool(tool);
            return;
          }
          if (event.code === "KeyH") {
            event.preventDefault();
            event.stopImmediatePropagation();
            toggleMarksVisible();
          }
        }
      },
      true
    );

    window.addEventListener("keydown", (event) => {
      if (fromTypingField(event)) return;
      if (event.target && event.target.closest && event.target.closest("#con-intel-host")) return;
      if (event.key === "Escape" && (state.draft || state.textEdit || state.rangeEdit || state.measureEdit)) {
        state.draft = null;
        state.rangeEdit = null;
        state.measureEdit = null;
        cancelTextEdit();
        updateStatus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        state.strokes.pop();
        scheduleSave();
        updateStatus();
      }
    });
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const msg = event.data;
    if (!msg || msg.source !== SOURCE) return;
    if (msg.type === "loaded-ui") {
      const uiState = msg.ui && typeof msg.ui === "object" ? msg.ui : null;
      if (uiState) {
        if (Number.isFinite(Number(uiState.left))) state.panelLeft = Number(uiState.left);
        if (Number.isFinite(Number(uiState.top))) state.panelTop = Number(uiState.top);
        if (Number.isFinite(Number(uiState.expandedLeft))) state.expandedLeft = Number(uiState.expandedLeft);
        if (Number.isFinite(Number(uiState.expandedTop))) state.expandedTop = Number(uiState.expandedTop);
        if (typeof uiState.dockCorner === "string") state.dockCorner = uiState.dockCorner;
        state.panelCollapsed = !!uiState.collapsed;
        state.toolbar?.classList.add("no-motion");
        if (state.panelCollapsed) {
          const corner =
            state.dockCorner || nearestCorner(state.panelLeft + 26, state.panelTop + 26);
          state.dockCorner = corner;
          const dock = posForCorner(corner, 52, 52);
          state.panelLeft = dock.left;
          state.panelTop = dock.top;
        }
        applyPanelLayout();
        requestAnimationFrame(() => state.toolbar?.classList.remove("no-motion"));
      }
      return;
    }
    if (msg.type !== "loaded") return;
    if (String(msg.gameId) !== String(state.gameId)) return;
    state.strokes = Array.isArray(msg.strokes) ? msg.strokes : [];
    updateStatus();
  });

  async function start() {
    if (window.__conIntelStarted) return;
    window.__conIntelStarted = true;

    const outerShell = window === window.top && document.getElementById("ifm");
    if (outerShell && !document.getElementById("map_canvas")) {
      LOG("outer play.php shell, map lives in iframe");
      return;
    }

    injectStyles();
    LOG("waiting for map API");
    const { api, container, canvas } = await waitForMap();
    LOG("map found", api.kind, canvas && canvas.width, canvas && canvas.height);
    state.gameId = getGameId() || "unknown";

    const overlay = document.createElement("canvas");
    overlay.id = "con-intel-overlay-canvas";
    overlay.width = canvas?.width || container.clientWidth || 1920;
    overlay.height = canvas?.height || container.clientHeight || 1080;
    overlay.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;pointer-events:none !important;z-index:20;";
    container.appendChild(overlay);
    state.overlay = overlay;
    state.ctx = overlay.getContext("2d");

    bindMapDrawEvents();
    createToolbar();
    hideBoot();
    loadStrokes();
    updateStatus();
    loop();
    LOG("overlay ready", { gameId: state.gameId, kind: api.kind });
  }

  start().catch((err) => {
    LOG("start failed", err);
    showBoot("CoN Intel failed: " + (err && err.message ? err.message : err));
  });
})();
