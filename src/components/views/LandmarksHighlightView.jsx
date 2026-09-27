"use client";

import React, { useState } from "react";
import { extensionBridge } from "../../lib/extensionBridge";
import {
  Pin,
  Compass,
  Search,
  ExternalLink,
  Tag,
  CheckCircle,
  Flag,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";

export default function LandmarksHighlightView({ activeSession }) {
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState("landmarks"); // "landmarks" | "journey"

  const nodes = activeSession?.graph?.nodes || {};
  const edges = activeSession?.graph?.edges || [];
  const nodeUrls = Object.keys(nodes);

  const inDegree = {};
  const outDegree = {};
  nodeUrls.forEach((k) => {
    inDegree[k] = 0;
    outDegree[k] = 0;
  });

  edges.forEach((e) => {
    if (nodes[e.source] && nodes[e.target]) {
      outDegree[e.source] = (outDegree[e.source] || 0) + 1;
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    }
  });

  const pinnedNodes = [];
  const startNodes = [];
  const middleNodes = [];
  const endNodes = [];

  nodeUrls.forEach((url) => {
    const node = nodes[url];
    const isTopic = node.type === "topic" || url.startsWith("topic:");
    const isPinned = !!node.pinned;

    if (isPinned) {
      pinnedNodes.push({ url, ...node });
    }

    if ((inDegree[url] === 0 && outDegree[url] > 0) || isTopic) {
      startNodes.push({ url, ...node });
    } else if (inDegree[url] > 0 && outDegree[url] === 0) {
      endNodes.push({ url, ...node });
    } else {
      middleNodes.push({ url, ...node });
    }
  });

  const handleTogglePin = async (url, currentPinned) => {
    try {
      await extensionBridge.togglePin(url, !currentPinned);
    } catch (err) {
      console.error("Toggle pin failed:", err);
    }
  };

  const handleOpenUrl = (url) => {
    if (url && url.startsWith("http")) {
      extensionBridge.openTab(url);
    }
  };

  const filteredPinned = pinnedNodes.filter((n) => {
    const title = (n.title || n.domain || n.url).toLowerCase();
    return !filterQuery || title.includes(filterQuery.toLowerCase());
  });

  return (
    <div style={{
      flex: 1,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
      overflowY: "auto",
      padding: "32px 40px",
    }}>
      {/* Header Bar */}
      <div style={{
        maxWidth: "1100px",
        width: "100%",
        margin: "0 auto 28px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "var(--amber-light)",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "6px",
          }}>
            <Pin size={14} />
            <span>Landmark & Path Highlights Control</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>
            Landmarks & Research Pathways
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
            Pin landmark nodes that persist across filters and view the color-coded semantic progression of your research.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div style={{
          display: "flex",
          gap: "4px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          padding: "4px",
          borderRadius: "var(--radius-md)",
        }}>
          <button
            onClick={() => setActiveTab("landmarks")}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              background: activeTab === "landmarks" ? "var(--surface-active)" : "transparent",
              color: activeTab === "landmarks" ? "var(--amber-light)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Pin size={13} />
            <span>Pinned Landmarks ({pinnedNodes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("journey")}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-sm)",
              background: activeTab === "journey" ? "var(--surface-active)" : "transparent",
              color: activeTab === "journey" ? "var(--blue)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Compass size={13} />
            <span>Journey Path Hierarchy</span>
          </button>
        </div>
      </div>

      {activeTab === "landmarks" && (
        <div style={{ maxWidth: "1100px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Search Filter */}
          <div style={{ position: "relative", maxWidth: "400px" }}>
            <Search size={14} color="var(--text-dim)" style={{ position: "absolute", left: "12px", top: "11px" }} />
            <input
              type="text"
              placeholder="Search pinned landmarks..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 14px 8px 36px",
                fontSize: "13px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
              }}
            />
          </div>

          {/* Landmarks Grid */}
          {filteredPinned.length === 0 ? (
            <div style={{
              background: "var(--surface)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "48px 24px",
              textAlign: "center",
            }}>
              <Pin size={32} color="var(--amber-light)" style={{ margin: "0 auto 12px", opacity: 0.6 }} />
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
                No Landmark Nodes Pinned
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto", lineHeight: "1.6" }}>
                Click the pin icon on any node inspector in the graph or below to keep landmark sources highlighted with high-visibility ochre borders.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {filteredPinned.map((n) => (
                <div
                  key={n.url}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    borderTop: "4px solid var(--amber)",
                    padding: "20px",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                        {n.favicon ? (
                          <img src={n.favicon} alt="" style={{ width: "18px", height: "18px", borderRadius: "3px" }} onError={(e) => { e.target.style.display = "none"; }} />
                        ) : (
                          <Pin size={15} color="var(--amber)" />
                        )}
                        <span style={{ fontSize: "11px", color: "var(--amber-light)", fontWeight: 600, textTransform: "uppercase" }}>
                          Landmark
                        </span>
                      </div>

                      <button
                        onClick={() => handleTogglePin(n.url, true)}
                        title="Unpin Node"
                        style={{
                          padding: "4px 8px",
                          borderRadius: "var(--radius-xs)",
                          background: "var(--amber-glow)",
                          border: "1px solid var(--amber)",
                          color: "var(--amber-light)",
                          fontSize: "11px",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Pin size={11} />
                        <span>Pinned</span>
                      </button>
                    </div>

                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", lineHeight: "1.4", marginBottom: "6px" }}>
                      {n.title || n.domain || n.url}
                    </h3>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginBottom: "10px" }}>
                      {n.domain || "Webpage"}
                    </div>

                    {n.notes && (
                      <p style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        lineHeight: "1.5",
                        background: "var(--surface-solid)",
                        padding: "8px 10px",
                        borderRadius: "var(--radius-xs)",
                        marginBottom: "10px",
                        maxHeight: "80px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {n.notes}
                      </p>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                      {n.visits || 1} visits tracked
                    </span>
                    <button
                      onClick={() => handleOpenUrl(n.url)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        color: "var(--blue)",
                        fontWeight: 600,
                      }}
                    >
                      <ExternalLink size={12} />
                      <span>Open Tab</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "journey" && (
        <div style={{ maxWidth: "1100px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Discovery Stage (Orange) */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: "4px solid var(--orange)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--orange)" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--orange-light)" }}>
                Stage 1: Discovery & Entry Topics ({startNodes.length})
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
              {startNodes.map((n) => (
                <div key={n.url} style={{ background: "var(--surface-solid)", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.title || n.domain}
                  </span>
                  <button
                    onClick={() => handleTogglePin(n.url, !!n.pinned)}
                    style={{ padding: "4px", color: n.pinned ? "var(--amber-light)" : "var(--text-dim)" }}
                  >
                    <Pin size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Exploration (Yellow) */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: "4px solid var(--amber)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--amber)" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--amber-light)" }}>
                Stage 2: Deep-Dive Exploration ({middleNodes.length})
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
              {middleNodes.map((n) => (
                <div key={n.url} style={{ background: "var(--surface-solid)", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.title || n.domain}
                  </span>
                  <button
                    onClick={() => handleTogglePin(n.url, !!n.pinned)}
                    style={{ padding: "4px", color: n.pinned ? "var(--amber-light)" : "var(--text-dim)" }}
                  >
                    <Pin size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* End Synthesis (Green) */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: "4px solid var(--green)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--green)" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--green-light)" }}>
                Stage 3: Final Reference & Synthesis ({endNodes.length})
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
              {endNodes.map((n) => (
                <div key={n.url} style={{ background: "var(--surface-solid)", border: "1px solid var(--border)", padding: "10px 12px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.title || n.domain}
                  </span>
                  <button
                    onClick={() => handleTogglePin(n.url, !!n.pinned)}
                    style={{ padding: "4px", color: n.pinned ? "var(--amber-light)" : "var(--text-dim)" }}
                  >
                    <Pin size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
