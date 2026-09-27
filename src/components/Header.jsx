"use client";

import React, { useState } from "react";
import { extensionBridge } from "../lib/extensionBridge";
import {
  Layers,
  Search,
  Bookmark,
  Pin,
  Maximize2,
  RotateCw,
  Sparkles,
  BookOpen,
  HelpCircle,
  BarChart2,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Compass,
  Database,
} from "lucide-react";

export default function Header({
  sessions = {},
  activeSessionId = "",
  activeSession = null,
  currentView = "graph",
  onViewChange = () => {},
  searchQuery = "",
  onSearchChange = () => {},
  onFitView = () => {},
  onRelayout = () => {},
  onOpenDigest = () => {},
  onOpenFlashcards = () => {},
  onOpenQuiz = () => {},
  onOpenDebt = () => {},
  onOpenBackup = () => {},
  onFilterPinnedToggle = () => {},
  isFilterPinned = false,
}) {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const nodeCount = Object.keys(activeSession?.graph?.nodes || {}).length;
  const edgeCount = Array.isArray(activeSession?.graph?.edges) ? activeSession.graph.edges.length : 0;
  const sessionList = Object.values(sessions || {});

  const handleSwitchSession = (id) => {
    setShowWorkspaceMenu(false);
    extensionBridge.switchWorkspace(id).catch((err) => console.error("Switch error:", err));
  };

  const handleCreateSession = () => {
    const name = prompt("Enter new workspace name:", `Research ${sessionList.length + 1}`);
    if (name && name.trim()) {
      extensionBridge.createWorkspace(name.trim()).catch((err) => console.error("Create error:", err));
    }
  };

  const handleRenameSession = () => {
    if (!activeSession) return;
    const name = prompt("Rename workspace:", activeSession.name);
    if (name && name.trim()) {
      extensionBridge.renameWorkspace(activeSession.id, name.trim()).catch((err) => console.error("Rename error:", err));
    }
  };

  const handleDeleteSession = () => {
    if (!activeSession) return;
    if (sessionList.length <= 1) {
      alert("Cannot delete the only remaining workspace.");
      return;
    }
    if (confirm(`Are you sure you want to delete workspace "${activeSession.name}"?`)) {
      extensionBridge.deleteWorkspace(activeSession.id).catch((err) => console.error("Delete error:", err));
    }
  };

  return (
    <header style={{
      height: "56px",
      background: "var(--surface)",
      borderBottom: "1px solid var(--border)",
      backdropFilter: "var(--blur)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      zIndex: 50,
      position: "relative",
    }}>
      {/* Left Section: Brand, Workspace Dropdown & Search */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, maxWidth: "560px" }}>
        {/* Brand / Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "var(--radius-sm)",
            background: "linear-gradient(135deg, var(--blue-bright), #0369a1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 12px var(--blue-glow)",
          }}>
            <Layers size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: "14px", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Cognitive Graph <span style={{ fontSize: "11px", color: "var(--blue)", fontWeight: 500 }}>Web</span>
          </span>
        </div>

        {/* Workspace Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              padding: "5px 12px",
              borderRadius: "var(--radius-sm)",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            <span style={{ maxWidth: "130px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {activeSession ? activeSession.name : "Select Workspace"}
            </span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>

          {showWorkspaceMenu && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "6px",
              width: "220px",
              background: "var(--surface-solid)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-modal)",
              zIndex: 100,
              padding: "6px",
            }}>
              <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)", padding: "4px 8px 6px" }}>
                Workspaces ({sessionList.length})
              </div>
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                {sessionList.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSwitchSession(s.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "6px 8px",
                      borderRadius: "var(--radius-xs)",
                      fontSize: "12px",
                      background: s.id === activeSessionId ? "var(--surface-active)" : "transparent",
                      color: s.id === activeSessionId ? "var(--blue)" : "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                      {Object.keys(s.graph?.nodes || {}).length} nodes
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--border)", marginTop: "6px", paddingTop: "6px" }}>
                <button
                  onClick={handleCreateSession}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 8px",
                    borderRadius: "var(--radius-xs)",
                    fontSize: "11px",
                    color: "var(--blue)",
                    fontWeight: 500,
                  }}
                >
                  <Plus size={13} />
                  <span>+ New Workspace</span>
                </button>
                <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                  <button
                    onClick={handleRenameSession}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      padding: "4px 6px",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      borderRadius: "var(--radius-xs)",
                      background: "var(--surface-raised)",
                    }}
                  >
                    <Edit2 size={10} />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={handleDeleteSession}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      padding: "4px 6px",
                      fontSize: "10px",
                      color: "var(--danger-light)",
                      borderRadius: "var(--radius-xs)",
                      background: "var(--surface-raised)",
                    }}
                  >
                    <Trash2 size={10} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar (Only shown in graph view) */}
        {currentView === "graph" && (
          <div style={{
            position: "relative",
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}>
            <Search size={14} color="var(--text-dim)" style={{ position: "absolute", left: "10px" }} />
            <input
              type="text"
              placeholder="Search graph nodes, tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 12px 6px 32px",
                fontSize: "12px",
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-full)",
              }}
            />
          </div>
        )}
      </div>

      {/* Center Section: Full-Screen View Navigation Pills */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        background: "var(--surface-solid)",
        padding: "3px",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
      }}>
        <button
          onClick={() => onViewChange("graph")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            fontWeight: 600,
            background: currentView === "graph" ? "var(--surface-raised)" : "transparent",
            color: currentView === "graph" ? "var(--blue)" : "var(--text-secondary)",
            border: currentView === "graph" ? "1px solid var(--border-strong)" : "1px solid transparent",
          }}
        >
          <Layers size={13} />
          <span>Graph Canvas</span>
        </button>

        <button
          onClick={() => onViewChange("memory")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            fontWeight: 600,
            background: currentView === "memory" ? "var(--surface-raised)" : "transparent",
            color: currentView === "memory" ? "var(--amber-light)" : "var(--text-secondary)",
            border: currentView === "memory" ? "1px solid var(--border-strong)" : "1px solid transparent",
          }}
        >
          <Bookmark size={13} />
          <span>Memory Palace</span>
        </button>

        <button
          onClick={() => onViewChange("notes")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            fontWeight: 600,
            background: currentView === "notes" ? "var(--surface-raised)" : "transparent",
            color: currentView === "notes" ? "var(--blue)" : "var(--text-secondary)",
            border: currentView === "notes" ? "1px solid var(--border-strong)" : "1px solid transparent",
          }}
        >
          <FileText size={13} />
          <span>Structured Notes</span>
        </button>

        <button
          onClick={() => onViewChange("landmarks")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 12px",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            fontWeight: 600,
            background: currentView === "landmarks" ? "var(--surface-raised)" : "transparent",
            color: currentView === "landmarks" ? "var(--amber-light)" : "var(--text-secondary)",
            border: currentView === "landmarks" ? "1px solid var(--border-strong)" : "1px solid transparent",
          }}
        >
          <Pin size={13} />
          <span>Landmarks</span>
        </button>
      </div>

      {/* Right Section: Stats Pill & Action Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Graph Stats Pill */}
        <div style={{
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          padding: "4px 10px",
          borderRadius: "var(--radius-full)",
          fontSize: "11px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--text-secondary)",
        }}>
          <span><strong style={{ color: "var(--text-primary)" }}>{nodeCount}</strong> nodes</span>
          <span style={{ color: "var(--text-dim)" }}>·</span>
          <span><strong style={{ color: "var(--text-primary)" }}>{edgeCount}</strong> edges</span>
        </div>

        {/* Toolbar Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {currentView === "graph" && (
            <>
              {/* Pinned Filter */}
              <button
                onClick={onFilterPinnedToggle}
                title={isFilterPinned ? "Show All Nodes" : "Filter Pinned Nodes"}
                style={{
                  padding: "7px",
                  borderRadius: "var(--radius-sm)",
                  background: isFilterPinned ? "var(--amber-glow)" : "var(--surface-raised)",
                  border: `1px solid ${isFilterPinned ? "var(--amber)" : "var(--border)"}`,
                  color: isFilterPinned ? "var(--amber-light)" : "var(--text-secondary)",
                }}
              >
                <Pin size={14} />
              </button>

              {/* Fit View */}
              <button
                onClick={onFitView}
                title="Fit & Center View"
                style={{
                  padding: "7px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <Maximize2 size={14} />
              </button>

              {/* Relayout */}
              <button
                onClick={onRelayout}
                title="Relayout Physics Graph"
                style={{
                  padding: "7px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <RotateCw size={14} />
              </button>

              <div style={{ width: "1px", height: "18px", background: "var(--border)", margin: "0 4px" }} />
            </>
          )}

          {/* AI Digest */}
          <button
            onClick={onOpenDigest}
            title="AI Research Digest"
            style={{
              padding: "5px 10px",
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(3, 105, 161, 0.25))",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              color: "var(--blue)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            <Sparkles size={13} />
            <span>AI Digest</span>
          </button>

          {/* Flash Notes */}
          <button
            onClick={onOpenFlashcards}
            title="Flash Notes & Spaced Recall"
            style={{
              padding: "6px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <BookOpen size={14} />
          </button>

          {/* Active Recall Quiz */}
          <button
            onClick={onOpenQuiz}
            title="AI Active Recall Quiz"
            style={{
              padding: "6px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--blue)",
            }}
          >
            <HelpCircle size={14} />
          </button>

          {/* Research Debt */}
          <button
            onClick={onOpenDebt}
            title="Research Debt & Retention Report"
            style={{
              padding: "6px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <BarChart2 size={14} />
          </button>

          {/* Full Backup & Recovery */}
          <button
            onClick={onOpenBackup}
            title="Full Backup & Disaster Recovery"
            style={{
              padding: "6px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--blue)",
            }}
          >
            <Database size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
