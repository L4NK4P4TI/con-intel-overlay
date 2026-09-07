const SOURCE = "con-intel-overlay";
const MAX_STROKES = 4000;
const MAX_JSON_CHARS = 1_500_000;
const BUS_ORIGIN = window.location.origin;
const BUS_TOKEN = crypto.randomUUID();

function storageKey(gameId) {
  return `con-intel-strokes:${gameId}`;
}

function validGameId(id) {
  const s = String(id ?? "");
  return s === "unknown" || /^\d{1,12}$/.test(s);
}

function jsonFits(value) {
  try {
    return JSON.stringify(value).length <= MAX_JSON_CHARS;
  } catch (_err) {
    return false;
  }
}

function cloneStrokes(raw) {
  if (!Array.isArray(raw)) return [];
  const sliced = raw.slice(0, MAX_STROKES);
  if (!jsonFits(sliced)) return null;
  try {
    return JSON.parse(JSON.stringify(sliced));
  } catch (_err) {
    return null;
  }
}

function cloneUi(raw) {
  if (!raw || typeof raw !== "object") return {};
  const out = {};
  for (const key of ["left", "top", "expandedLeft", "expandedTop", "speedMultiplier"]) {
    const n = Number(raw[key]);
    if (Number.isFinite(n)) out[key] = n;
  }
  if (typeof raw.collapsed === "boolean") out.collapsed = raw.collapsed;
  if (typeof raw.dockCorner === "string" && raw.dockCorner.length <= 32) out.dockCorner = raw.dockCorner;
  if (raw.measureMode === "route" || raw.measureMode === "segment") out.measureMode = raw.measureMode;
  if (raw.arrowMode === "route" || raw.arrowMode === "segment") out.arrowMode = raw.arrowMode;
  if (typeof raw.arrowHeadStart === "string" && raw.arrowHeadStart.length <= 16) {
    out.arrowHeadStart = raw.arrowHeadStart;
  }
  if (typeof raw.arrowHeadEnd === "string" && raw.arrowHeadEnd.length <= 16) out.arrowHeadEnd = raw.arrowHeadEnd;
  if (typeof raw.lineStyle === "string" && raw.lineStyle.length <= 16) out.lineStyle = raw.lineStyle;
  if (typeof raw.markerIcon === "string" && raw.markerIcon.length <= 16) out.markerIcon = raw.markerIcon;
  if (raw.travelMode === "air" || raw.travelMode === "surface") out.travelMode = raw.travelMode;
  if (raw.speedVals && typeof raw.speedVals === "object") {
    const vals = {};
    for (const [k, v] of Object.entries(raw.speedVals)) {
      if (typeof k !== "string" || k.length > 24) continue;
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) vals[k] = n;
    }
    out.speedVals = vals;
  }
  return jsonFits(out) ? out : {};
}

function extensionStorage() {
  try {
    return typeof chrome !== "undefined" && chrome.storage && chrome.storage.local ? chrome.storage.local : null;
  } catch (_err) {
    return null;
  }
}

function injectPageScript() {
  if (document.documentElement?.dataset.conIntelInjected === "1") return;
  try {
    if (typeof chrome === "undefined" || !chrome.runtime?.getURL) return;
  } catch (_err) {
    return;
  }
  if (document.documentElement) document.documentElement.dataset.conIntelInjected = "1";

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("src/inject.js");
  script.dataset.conIntelToken = BUS_TOKEN;
  script.async = false;
  script.onload = () => script.remove();
  script.onerror = () => {
    console.error("[con-intel] failed to inject page script", script.src);
  };
  (document.head || document.documentElement).appendChild(script);
}

function reply(payload) {
  window.postMessage({ source: SOURCE, token: BUS_TOKEN, ...payload }, BUS_ORIGIN);
}

injectPageScript();

window.addEventListener("message", async (event) => {
  if (event.source !== window) return;
  if (event.origin !== BUS_ORIGIN) return;
  const msg = event.data;
  if (!msg || msg.source !== SOURCE || msg.token !== BUS_TOKEN) return;

  const storage = extensionStorage();
  if (!storage) return;

  if (msg.type === "load") {
    if (!validGameId(msg.gameId)) return;
    const key = storageKey(msg.gameId);
    const data = await storage.get(key);
    const strokes = cloneStrokes(data[key] || []);
    reply({ type: "loaded", gameId: String(msg.gameId), strokes: strokes || [] });
    return;
  }

  if (msg.type === "save") {
    if (!validGameId(msg.gameId)) return;
    const strokes = cloneStrokes(msg.strokes || []);
    if (!strokes) return;
    await storage.set({ [storageKey(msg.gameId)]: strokes });
    return;
  }

  if (msg.type === "load-ui") {
    const data = await storage.get("con-intel-ui");
    reply({ type: "loaded-ui", ui: cloneUi(data["con-intel-ui"] || null) });
    return;
  }

  if (msg.type === "save-ui") {
    const ui = cloneUi(msg.ui || {});
    await storage.set({ "con-intel-ui": ui });
  }
});
