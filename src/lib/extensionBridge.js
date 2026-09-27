// web/src/lib/extensionBridge.js
// Robust Chrome Extension External Port Connection Bridge for Cognitive Graph

export const DEFAULT_EXTENSION_ID = "lfkcnjkeolaiklemgjedlmbjiekbohkh";

export const ConnectionState = {
  CHECKING: "CHECKING",
  NOT_INSTALLED: "NOT_INSTALLED",
  DISABLED_OR_UNREACHABLE: "DISABLED_OR_UNREACHABLE",
  CONNECTED: "CONNECTED",
};

class ExtensionBridge {
  constructor() {
    this.extensionId = DEFAULT_EXTENSION_ID;
    this.port = null;
    this.state = ConnectionState.CHECKING;
    this.listeners = new Set();
    this.pendingRequests = new Map();
    this.reconnectTimer = null;
    this.reqCounter = 0;
    this.lastStateData = null;

    if (typeof window !== "undefined") {
      const savedId = localStorage.getItem("cg_extension_id");
      if (savedId && savedId.trim()) {
        this.extensionId = savedId.trim();
      }
    }
  }

  setExtensionId(newId) {
    if (!newId || !newId.trim()) return;
    this.extensionId = newId.trim();
    if (typeof window !== "undefined") {
      localStorage.setItem("cg_extension_id", this.extensionId);
    }
    this.disconnect();
    this.connect();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener({ state: this.state, data: this.lastStateData, extensionId: this.extensionId });
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener({ state: this.state, data: this.lastStateData, extensionId: this.extensionId });
      } catch (err) {
        console.error("[ExtensionBridge] Listener error:", err);
      }
    });
  }

  connect() {
    if (typeof window === "undefined") return;

    if (!window.chrome || !window.chrome.runtime || !window.chrome.runtime.connect) {
      this.state = ConnectionState.NOT_INSTALLED;
      this.notify();
      return;
    }

    try {
      this.state = ConnectionState.CHECKING;
      this.notify();

      if (this.port) {
        try {
          this.port.disconnect();
        } catch (e) {}
        this.port = null;
      }

      this.port = window.chrome.runtime.connect(this.extensionId, { name: "CognitiveGraph_WebBridge" });

      let handshakeTimedOut = false;
      const handshakeTimeout = setTimeout(() => {
        handshakeTimedOut = true;
        if (this.state !== ConnectionState.CONNECTED) {
          this.state = ConnectionState.DISABLED_OR_UNREACHABLE;
          this.notify();
        }
      }, 2500);

      this.port.onDisconnect.addListener(() => {
        clearTimeout(handshakeTimeout);
        const lastErr = window.chrome.runtime.lastError?.message || "";
        console.warn("[ExtensionBridge] Port disconnected:", lastErr);

        // Reject any in-flight pending requests with disconnection notice
        this.pendingRequests.forEach(({ reject, timeoutId }) => {
          clearTimeout(timeoutId);
          reject(new Error("Extension disconnected. Reconnecting..."));
        });
        this.pendingRequests.clear();

        if (lastErr.includes("Could not establish connection") || lastErr.includes("Receiving end does not exist")) {
          this.state = ConnectionState.NOT_INSTALLED;
        } else {
          this.state = ConnectionState.DISABLED_OR_UNREACHABLE;
        }
        this.port = null;
        this.notify();
        this.scheduleReconnect(1500);
      });

      this.port.onMessage.addListener((msg) => {
        if (!msg || typeof msg !== "object") return;
        clearTimeout(handshakeTimeout);

        // Handle Broadcasts
        if (msg.action === "STATE_BROADCAST") {
          if (msg.data) {
            this.lastStateData = { ...this.lastStateData, ...msg.data };
            this.notify();
          }
          return;
        }

        // Handle RPC Responses
        if (msg.id && this.pendingRequests.has(msg.id)) {
          const { resolve, reject, timeoutId } = this.pendingRequests.get(msg.id);
          clearTimeout(timeoutId);
          this.pendingRequests.delete(msg.id);

          if (msg.ok) {
            resolve(msg.data);
          } else {
            reject(new Error(msg.error || "Port request failed"));
          }
        }

        // Initial handshake response
        if (msg.action === "GET_STATE_RESPONSE" && msg.ok) {
          this.state = ConnectionState.CONNECTED;
          this.lastStateData = msg.data;
          this.notify();
        }
      });

      // Send initial handshake request
      this.send("GET_STATE")
        .then((stateData) => {
          clearTimeout(handshakeTimeout);
          this.state = ConnectionState.CONNECTED;
          this.lastStateData = stateData;
          this.notify();
        })
        .catch((err) => {
          console.warn("[ExtensionBridge] Handshake failed:", err);
          if (!handshakeTimedOut) {
            this.state = ConnectionState.DISABLED_OR_UNREACHABLE;
            this.notify();
            this.scheduleReconnect(2500);
          }
        });

    } catch (err) {
      console.warn("[ExtensionBridge] Connection error:", err);
      this.state = ConnectionState.NOT_INSTALLED;
      this.notify();
      this.scheduleReconnect(3000);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.port) {
      try {
        this.port.disconnect();
      } catch (e) {}
      this.port = null;
    }
    this.state = ConnectionState.CHECKING;
  }

  scheduleReconnect(delay = 2500) {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.state !== ConnectionState.CONNECTED) {
        console.log("[ExtensionBridge] Attempting auto-reconnect...");
        this.connect();
      }
    }, delay);
  }

  send(action, payload = {}) {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        return reject(new Error("Bridge port is not connected"));
      }

      const id = "req_" + (++this.reqCounter) + "_" + Date.now();
      const timeoutId = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${action} timed out after 15s`));
        }
      }, 15000);

      this.pendingRequests.set(id, { resolve, reject, timeoutId });

      try {
        this.port.postMessage({ id, action, payload });
      } catch (err) {
        clearTimeout(timeoutId);
        this.pendingRequests.delete(id);
        reject(err);
      }
    });
  }

  // Convenience API wrappers
  getState() {
    return this.send("GET_STATE");
  }

  switchWorkspace(sessionId) {
    return this.send("SWITCH_WORKSPACE", { sessionId });
  }

  saveNote(url, notes, tags, structuredNotes) {
    return this.send("SAVE_NOTE", { url, notes, tags, structuredNotes });
  }

  savePassages(url, savedParagraphs) {
    return this.send("SAVE_PASSAGES", { url, savedParagraphs });
  }

  updateNode(url, updates) {
    return this.send("UPDATE_NODE", { url, updates });
  }

  togglePin(url, pinned) {
    return this.send("TOGGLE_PIN", { url, pinned });
  }

  generateFlashcards(url = null) {
    return this.send("GENERATE_FLASHCARDS", { url });
  }

  saveFlashcards(flashcards) {
    return this.send("SAVE_FLASHCARDS", { flashcards });
  }

  generateQuiz(questionCount = 5) {
    return this.send("GENERATE_QUIZ", { questionCount });
  }

  generateDigest() {
    return this.send("GENERATE_DIGEST");
  }

  getResearchDebt() {
    return this.send("GET_RESEARCH_DEBT");
  }

  createWorkspace(name) {
    return this.send("CREATE_WORKSPACE", { name });
  }

  renameWorkspace(sessionId, name) {
    return this.send("RENAME_WORKSPACE", { sessionId, name });
  }

  deleteWorkspace(sessionId) {
    return this.send("DELETE_WORKSPACE", { sessionId });
  }

  openTab(url) {
    return this.send("OPEN_TAB", { url });
  }

  exportBackup(includeApiKeys = false) {
    return this.send("EXPORT_BACKUP", { includeApiKeys });
  }

  importBackup(backupData, strategy = "merge") {
    return this.send("IMPORT_BACKUP", { backupData, strategy });
  }
}

export const extensionBridge = new ExtensionBridge();
