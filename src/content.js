const SOURCE = "con-intel-overlay";

function storageKey(gameId) {
  return `con-intel-strokes:${gameId}`;
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
  script.async = false;
  script.onload = () => script.remove();
  script.onerror = () => {
    console.error("[con-intel] failed to inject page script", script.src);
  };
  (document.head || document.documentElement).appendChild(script);
}

injectPageScript();

window.addEventListener("message", async (event) => {
  if (event.source !== window) return;
  const msg = event.data;
  if (!msg || msg.source !== SOURCE) return;

  const storage = extensionStorage();
  if (!storage) return;

  if (msg.type === "load") {
    const data = await storage.get(storageKey(msg.gameId));
    window.postMessage(
      {
        source: SOURCE,
        type: "loaded",
        gameId: msg.gameId,
        strokes: data[storageKey(msg.gameId)] || [],
      },
      "*"
    );
    return;
  }

  if (msg.type === "save") {
    await storage.set({
      [storageKey(msg.gameId)]: msg.strokes || [],
    });
    return;
  }

  if (msg.type === "load-ui") {
    const data = await storage.get("con-intel-ui");
    window.postMessage(
      {
        source: SOURCE,
        type: "loaded-ui",
        ui: data["con-intel-ui"] || null,
      },
      "*"
    );
    return;
  }

  if (msg.type === "save-ui") {
    await storage.set({ "con-intel-ui": msg.ui || {} });
  }
});
