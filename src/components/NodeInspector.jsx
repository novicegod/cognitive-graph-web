"use client";

import React, { useState, useEffect } from "react";
import { extensionBridge } from "../lib/extensionBridge";
import {
  X,
  Pin,
  ExternalLink,
  Tag,
  Plus,
  FileText,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Check,
} from "lucide-react";

export default function NodeInspector({ node, url, onClose, onNodeUpdated }) {
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (node) {
      setNotes(node.notes || "");
      setTags(Array.isArray(node.tags) ? [...node.tags] : []);
    }
  }, [node, url]);

  if (!node || !url) return null;

  const isTopic = node.type === "topic" || url.startsWith("topic:");
  const domain = node.domain || "Webpage";
  const title = node.title || domain;
  const isPinned = !!node.pinned;
  const passages = Array.isArray(node.savedParagraphs) ? node.savedParagraphs : [];
  const visits = node.visits || 1;
  const dateFormatted = node.timestamp
    ? new Date(node.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Recently";

  const handleTogglePin = async () => {
    try {
      const res = await extensionBridge.togglePin(url, !isPinned);
      if (onNodeUpdated && res.node) {
        onNodeUpdated(res.node);
      }
    } catch (err) {
      console.error("Toggle pin failed:", err);
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const res = await extensionBridge.saveNote(url, notes, tags, node.structuredNotes);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1800);
      if (onNodeUpdated && res.node) {
        onNodeUpdated(res.node);
      }
    } catch (err) {
      setIsSaving(false);
      console.error("Save notes failed:", err);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      const trimmed = newTagInput.trim().toLowerCase();
      if (!tags.includes(trimmed)) {
        const updated = [...tags, trimmed];
        setTags(updated);
        setNewTagInput("");
        extensionBridge.saveNote(url, notes, updated, node.structuredNotes).then((res) => {
          if (onNodeUpdated && res.node) onNodeUpdated(res.node);
        });
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    extensionBridge.saveNote(url, notes, updated, node.structuredNotes).then((res) => {
      if (onNodeUpdated && res.node) onNodeUpdated(res.node);
    });
  };

  const handleOpenTab = () => {
    if (!isTopic && url.startsWith("http")) {
      extensionBridge.openTab(url);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      const res = await extensionBridge.generateFlashcards(url);
      alert(`Generated ${res.generatedCards?.length || 0} flash notes from this page!`);
    } catch (err) {
      alert("Failed to generate flashcards: " + err.message);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: "56px",
      right: 0,
      bottom: 0,
      width: "400px",
      maxWidth: "100vw",
      background: "var(--surface-solid)",
      borderLeft: "1px solid var(--border-strong)",
      boxShadow: "var(--shadow-modal)",
      zIndex: 90,
      display: "flex",
      flexDirection: "column",
      backdropFilter: "var(--blur-strong)",
      animation: "slide-in-right 0.22s ease-out",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
          {node.favicon ? (
            <img
              src={node.favicon}
              alt=""
              style={{ width: "20px", height: "20px", borderRadius: "4px", flexShrink: 0 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div style={{
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              background: isTopic ? "var(--orange-glow)" : "var(--surface-raised)",
              color: isTopic ? "var(--orange)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              flexShrink: 0
            }}>
              {isTopic ? "T" : "P"}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: isTopic ? "var(--orange-light)" : "var(--blue)",
              fontWeight: 600,
            }}>
              {isTopic ? "Search Topic Node" : domain}
            </span>
            <h3 style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: "2px",
            }}>
              {title}
            </h3>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {/* Pin Button */}
          <button
            onClick={handleTogglePin}
            title={isPinned ? "Unpin Node" : "Pin as Landmark"}
            style={{
              padding: "6px",
              borderRadius: "var(--radius-sm)",
              background: isPinned ? "var(--amber-glow)" : "var(--surface-raised)",
              border: `1px solid ${isPinned ? "var(--amber)" : "var(--border)"}`,
              color: isPinned ? "var(--amber-light)" : "var(--text-muted)",
            }}
          >
            <Pin size={15} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body Scroll Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Meta Pills Bar */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
          background: "var(--surface-raised)",
          border: "1px solid var(--border-subtle)",
          padding: "10px",
          borderRadius: "var(--radius-sm)",
          fontSize: "11px",
        }}>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Visits: </span>
            <strong style={{ color: "var(--text-primary)" }}>{visits}</strong>
          </div>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Last Activity: </span>
            <span style={{ color: "var(--text-secondary)" }}>{dateFormatted}</span>
          </div>
        </div>

        {/* URL Link Action */}
        {!isTopic && (
          <div>
            <label style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600 }}>
              Direct URL
            </label>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "6px",
              background: "var(--surface-solid)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "6px 10px",
            }}>
              <span style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}>
                {url}
              </span>
              <button
                onClick={handleOpenTab}
                title="Open in Chrome Tab"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  color: "var(--blue)",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                <ExternalLink size={13} />
                <span>Open</span>
              </button>
            </div>
          </div>
        )}

        {/* Tags Editor */}
        <div>
          <label style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
            <Tag size={12} />
            <span>Tags</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-full)",
                  padding: "2px 8px 2px 10px",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                #{t}
                <button onClick={() => handleRemoveTag(t)} style={{ color: "var(--text-muted)" }}>
                  <X size={11} />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="+ add tag (Enter)"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              style={{
                background: "transparent",
                border: "1px dashed var(--border)",
                borderRadius: "var(--radius-full)",
                padding: "2px 10px",
                fontSize: "11px",
                color: "var(--text-primary)",
                width: "110px",
              }}
            />
          </div>
        </div>

        {/* Notes Editor */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              <FileText size={12} />
              <span>Research Notes</span>
            </label>
            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: saveSuccess ? "var(--green)" : "var(--blue)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {saveSuccess ? <Check size={12} /> : null}
              <span>{saveSuccess ? "Saved" : isSaving ? "Saving..." : "Save Notes"}</span>
            </button>
          </div>
          <textarea
            rows={5}
            placeholder="Add key insights, thoughts, or conclusions about this node..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "12px",
              lineHeight: "1.6",
              borderRadius: "var(--radius-sm)",
              resize: "vertical",
            }}
          />
        </div>

        {/* Memory Palace Passages */}
        <div>
          <label style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-dim)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
            <Bookmark size={12} color="var(--amber)" />
            <span>Memory Palace Passages ({passages.length})</span>
          </label>
          {passages.length === 0 ? (
            <div style={{
              background: "var(--surface-raised)",
              border: "1px dashed var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "14px",
              textAlign: "center",
              fontSize: "11px",
              color: "var(--text-dim)",
            }}>
              No passages highlighted yet. Select text on this webpage and right-click "Save to Memory Palace".
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {passages.map((p, i) => (
                <div
                  key={p.id || i}
                  style={{
                    background: "var(--surface-raised)",
                    borderLeft: "3px solid var(--amber)",
                    borderTop: "1px solid var(--border-subtle)",
                    borderRight: "1px solid var(--border-subtle)",
                    borderBottom: "1px solid var(--border-subtle)",
                    borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                    padding: "10px 12px",
                    fontSize: "12px",
                    lineHeight: "1.5",
                    color: "var(--text-primary)",
                  }}
                >
                  "{p.editedContent || p.text}"
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flash Notes Action */}
        <button
          onClick={handleGenerateFlashcards}
          style={{
            marginTop: "10px",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontSize: "12px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <BookOpen size={14} color="var(--blue)" />
          <span>Generate Flash Cards for this Node</span>
        </button>
      </div>
    </div>
  );
}
