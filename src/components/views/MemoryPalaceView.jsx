"use client";

import React, { useState } from "react";
import { extensionBridge } from "../../lib/extensionBridge";
import {
  Bookmark,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Check,
  Copy,
  BookOpen,
  Filter,
  Sparkles,
  Calendar,
} from "lucide-react";

export default function MemoryPalaceView({ activeSession, onNodeSelect }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [editingPassageId, setEditingPassageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const nodes = activeSession?.graph?.nodes || {};
  const allPassages = [];

  Object.keys(nodes).forEach((url) => {
    const node = nodes[url];
    if (Array.isArray(node.savedParagraphs) && node.savedParagraphs.length > 0) {
      node.savedParagraphs.forEach((p, idx) => {
        allPassages.push({
          ...p,
          id: p.id || `passage_${url}_${idx}`,
          nodeUrl: url,
          nodeTitle: node.title || node.domain || "Webpage",
          nodeDomain: node.domain || "Webpage",
          nodeFavicon: node.favicon,
          timestamp: p.timestamp || node.timestamp || 0,
        });
      });
    }
  });

  // Sort by recent timestamp
  allPassages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // Extract unique domains
  const domains = Array.from(new Set(allPassages.map((p) => p.nodeDomain))).filter(Boolean);

  // Filter passages
  const filteredPassages = allPassages.filter((p) => {
    const text = (p.editedContent || p.text || "").toLowerCase();
    const title = (p.nodeTitle || "").toLowerCase();
    const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase()) || title.includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === "all" || p.nodeDomain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  const handleStartEdit = (p) => {
    setEditingPassageId(p.id);
    setEditText(p.editedContent || p.text || "");
  };

  const handleSaveEdit = async (passage) => {
    const node = nodes[passage.nodeUrl];
    if (!node || !Array.isArray(node.savedParagraphs)) return;

    const updatedParagraphs = node.savedParagraphs.map((p) => {
      if ((p.id && p.id === passage.id) || p.text === passage.text) {
        return {
          ...p,
          editedContent: editText.trim(),
          lastEditedAt: Date.now(),
        };
      }
      return p;
    });

    try {
      await extensionBridge.savePassages(passage.nodeUrl, updatedParagraphs);
      setEditingPassageId(null);
    } catch (err) {
      console.error("Save passage failed:", err);
    }
  };

  const handleDeletePassage = async (passage) => {
    if (!confirm("Are you sure you want to remove this saved passage?")) return;
    const node = nodes[passage.nodeUrl];
    if (!node || !Array.isArray(node.savedParagraphs)) return;

    const updatedParagraphs = node.savedParagraphs.filter((p) => {
      if (p.id && passage.id) return p.id !== passage.id;
      return p.text !== passage.text;
    });

    try {
      await extensionBridge.savePassages(passage.nodeUrl, updatedParagraphs);
    } catch (err) {
      console.error("Delete passage failed:", err);
    }
  };

  const handleCopyQuote = (p) => {
    const text = p.editedContent || p.text || "";
    navigator.clipboard.writeText(`"${text}" — saved from ${p.nodeTitle} (${p.nodeUrl})`);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleOpenPage = (url) => {
    if (url && url.startsWith("http")) {
      extensionBridge.openTab(url);
    }
  };

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
            <Bookmark size={14} />
            <span>Memory Palace Reading Room</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>
            Saved Highlights & Context Anchors
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
            Explore captured text selections, key excerpts, and quotes anchored with exact DOM positions.
          </p>
        </div>

        {/* Top Summary Stats */}
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "10px 18px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--amber-light)" }}>{allPassages.length}</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Passages</div>
          </div>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "10px 18px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--blue)" }}>{domains.length}</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase" }}>Sources</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        maxWidth: "1100px",
        width: "100%",
        margin: "0 auto 24px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        <div style={{
          position: "relative",
          flex: 1,
          minWidth: "260px",
        }}>
          <Search size={14} color="var(--text-dim)" style={{ position: "absolute", left: "12px", top: "11px" }} />
          <input
            type="text"
            placeholder="Search passage content, titles, or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Domain Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Filter size={13} color="var(--text-dim)" />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            style={{
              padding: "8px 12px",
              fontSize: "12px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <option value="all">All Sources ({domains.length})</option>
            {domains.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Passages List */}
      <div style={{
        maxWidth: "1100px",
        width: "100%",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}>
        {filteredPassages.length === 0 ? (
          <div style={{
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 24px",
            textAlign: "center",
          }}>
            <Bookmark size={32} color="var(--text-dim)" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
              No Memory Palace Passages Found
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto", lineHeight: "1.6" }}>
              To save passages, highlight any sentence or paragraph on a webpage in Chrome and right-click <strong>"Save to Memory Palace"</strong>.
            </p>
          </div>
        ) : (
          filteredPassages.map((p) => {
            const isEditing = editingPassageId === p.id;
            const textContent = p.editedContent || p.text;
            const dateStr = p.timestamp ? new Date(p.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

            return (
              <div
                key={p.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  borderLeft: "4px solid var(--amber)",
                  padding: "20px 24px",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  transition: "border-color 0.15s ease",
                }}
              >
                {/* Passage Source Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                    {p.nodeFavicon ? (
                      <img src={p.nodeFavicon} alt="" style={{ width: "16px", height: "16px", borderRadius: "3px" }} onError={(e) => { e.target.style.display = "none"; }} />
                    ) : (
                      <Bookmark size={14} color="var(--amber)" />
                    )}
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.nodeTitle}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>•</span>
                    <span style={{ fontSize: "11px", color: "var(--blue)", fontFamily: "var(--font-mono)" }}>
                      {p.nodeDomain}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {dateStr && (
                      <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px", marginRight: "6px" }}>
                        <Calendar size={11} />
                        {dateStr}
                      </span>
                    )}
                    <button
                      onClick={() => handleCopyQuote(p)}
                      title="Copy Quote with Citation"
                      style={{
                        padding: "5px 8px",
                        borderRadius: "var(--radius-xs)",
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border)",
                        fontSize: "11px",
                        color: copiedId === p.id ? "var(--green)" : "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {copiedId === p.id ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedId === p.id ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenPage(p.nodeUrl)}
                      title="Open in Tab & Highlight"
                      style={{
                        padding: "5px 8px",
                        borderRadius: "var(--radius-xs)",
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border)",
                        fontSize: "11px",
                        color: "var(--blue)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <ExternalLink size={11} />
                      <span>Jump to Page</span>
                    </button>

                    <button
                      onClick={() => (isEditing ? handleSaveEdit(p) : handleStartEdit(p))}
                      title={isEditing ? "Save Edits" : "Edit Passage"}
                      style={{
                        padding: "5px",
                        borderRadius: "var(--radius-xs)",
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border)",
                        color: isEditing ? "var(--green)" : "var(--text-muted)",
                      }}
                    >
                      {isEditing ? <Check size={13} /> : <Edit2 size={13} />}
                    </button>

                    <button
                      onClick={() => handleDeletePassage(p)}
                      title="Delete Passage"
                      style={{
                        padding: "5px",
                        borderRadius: "var(--radius-xs)",
                        background: "var(--surface-raised)",
                        border: "1px solid var(--border)",
                        color: "var(--danger-light)",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Passage Text Content */}
                {isEditing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <textarea
                      rows={3}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        background: "var(--surface-solid)",
                        border: "1px solid var(--border-focus)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button
                        onClick={() => setEditingPassageId(null)}
                        style={{ padding: "4px 10px", fontSize: "11px", color: "var(--text-muted)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(p)}
                        style={{
                          padding: "4px 12px",
                          background: "var(--green)",
                          color: "#fff",
                          borderRadius: "var(--radius-xs)",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <blockquote style={{
                    fontSize: "14px",
                    lineHeight: "1.7",
                    color: "var(--text-primary)",
                    background: "rgba(245, 158, 11, 0.04)",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-sm)",
                    fontStyle: "italic",
                  }}>
                    "{textContent}"
                  </blockquote>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
