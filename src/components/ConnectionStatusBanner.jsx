"use client";

import React, { useState } from "react";
import { ConnectionState, extensionBridge, DEFAULT_EXTENSION_ID } from "../lib/extensionBridge";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Settings, ShieldCheck, ExternalLink } from "lucide-react";

export default function ConnectionStatusBanner({ connectionState, stateData, extensionId }) {
  const [showConfig, setShowConfig] = useState(false);
  const [customId, setCustomId] = useState(extensionId || DEFAULT_EXTENSION_ID);

  const handleSaveId = (e) => {
    e.preventDefault();
    extensionBridge.setExtensionId(customId);
    setShowConfig(false);
  };

  const handleResetId = () => {
    setCustomId(DEFAULT_EXTENSION_ID);
    extensionBridge.setExtensionId(DEFAULT_EXTENSION_ID);
    setShowConfig(false);
  };

  if (connectionState === ConnectionState.CONNECTED) {
    return (
      <div style={{
        background: "rgba(16, 185, 129, 0.08)",
        borderBottom: "1px solid rgba(16, 185, 129, 0.2)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "var(--green)",
            boxShadow: "0 0 10px var(--green)",
          }} className="pulse" />
          <span style={{ fontWeight: 600, color: "var(--green-light)" }}>Bridge Active</span>
          <span style={{ color: "var(--text-dim)" }}>•</span>
          <span style={{ color: "var(--text-secondary)" }}>Connected to local Chrome Profile storage (100% private)</span>
          {stateData?.version && (
            <span style={{
              background: "rgba(255,255,255,0.06)",
              padding: "1px 6px",
              borderRadius: "4px",
              fontSize: "11px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)"
            }}>
              v{stateData.version}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
            ID: {extensionId.slice(0, 8)}...{extensionId.slice(-6)}
          </span>
          <button
            onClick={() => setShowConfig(!showConfig)}
            title="Configure Extension ID"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--text-muted)",
              fontSize: "11px"
            }}
          >
            <Settings size={13} />
          </button>
        </div>

        {showConfig && (
          <div style={{
            position: "fixed",
            top: "40px",
            right: "16px",
            background: "var(--surface-solid)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            boxShadow: "var(--shadow-modal)",
            zIndex: 1000,
            width: "360px",
          }}>
            <h4 style={{ marginBottom: "8px", fontSize: "13px", fontWeight: 600 }}>Extension ID Configuration</h4>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              The web app connects via Chrome port bridge to the pinned extension ID.
            </p>
            <form onSubmit={handleSaveId}>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  marginBottom: "10px"
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleResetId}
                  style={{
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    padding: "4px 8px"
                  }}
                >
                  Reset Default
                </button>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setShowConfig(false)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      fontSize: "11px"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "4px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--blue-bright)",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 600
                    }}
                  >
                    Save & Connect
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  if (connectionState === ConnectionState.CHECKING) {
    return (
      <div style={{
        background: "rgba(56, 189, 248, 0.08)",
        borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "12px",
        color: "var(--blue)",
      }}>
        <RefreshCw size={13} className="pulse" />
        <span>Connecting to local Cognitive Graph Chrome extension...</span>
      </div>
    );
  }

  const isNotInstalled = connectionState === ConnectionState.NOT_INSTALLED;

  return (
    <div style={{
      background: isNotInstalled ? "rgba(244, 63, 94, 0.08)" : "rgba(245, 158, 11, 0.08)",
      borderBottom: `1px solid ${isNotInstalled ? "rgba(244, 63, 94, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: "12px",
      flexWrap: "wrap",
      gap: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isNotInstalled ? (
          <XCircle size={16} color="var(--danger-light)" />
        ) : (
          <AlertTriangle size={16} color="var(--amber-light)" />
        )}
        <div>
          <span style={{ fontWeight: 600, color: isNotInstalled ? "var(--danger-light)" : "var(--amber-light)" }}>
            {isNotInstalled ? "Extension Not Detected in this Browser" : "Extension Unreachable or Disabled"}
          </span>
          <span style={{ margin: "0 6px", color: "var(--text-dim)" }}>•</span>
          <span style={{ color: "var(--text-secondary)" }}>
            {isNotInstalled
              ? "Open this page in Google Chrome with the Cognitive Graph extension enabled to mirror your local knowledge graph."
              : "Ensure Cognitive Graph is enabled on chrome://extensions or verify your pinned extension ID."}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={() => extensionBridge.connect()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "var(--surface-raised)",
            border: "1px solid var(--border-strong)",
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: "11px",
            fontWeight: 500
          }}
        >
          <RefreshCw size={12} />
          <span>Retry Connection</span>
        </button>

        <button
          onClick={() => setShowConfig(!showConfig)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "var(--surface-raised)",
            border: "1px solid var(--border-strong)",
            padding: "4px 10px",
            borderRadius: "var(--radius-sm)",
            fontSize: "11px",
            color: "var(--text-muted)"
          }}
        >
          <Settings size={12} />
          <span>Configure ID</span>
        </button>
      </div>

      {showConfig && (
        <div style={{
          width: "100%",
          marginTop: "8px",
          background: "var(--surface-solid)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius-md)",
          padding: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600 }}>Target Extension ID:</span>
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value)}
              style={{
                flex: 1,
                padding: "4px 8px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)"
              }}
            />
            <button
              onClick={handleSaveId}
              style={{
                padding: "4px 12px",
                background: "var(--blue-bright)",
                color: "#fff",
                borderRadius: "var(--radius-sm)",
                fontSize: "11px",
                fontWeight: 600
              }}
            >
              Update
            </button>
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-dim)" }}>
            Default Pinned ID: <code style={{ color: "var(--blue)", fontFamily: "var(--font-mono)" }}>{DEFAULT_EXTENSION_ID}</code>
          </p>
        </div>
      )}
    </div>
  );
}
