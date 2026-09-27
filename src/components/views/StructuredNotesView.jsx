"use client";

import React, { useState, useEffect } from "react";
import { extensionBridge } from "../../lib/extensionBridge";
import {
  FileText,
  Search,
  Tag,
  Plus,
  X,
  Check,
  BookOpen,
  Layout,
  Layers,
  Sparkles,
  ExternalLink,
  Code,
  Scale,
  FileCode,
} from "lucide-react";

export default function StructuredNotesView({ activeSession, selectedUrl, onSelectNode }) {
  const nodes = activeSession?.graph?.nodes || {};
  const nodeUrls = Object.keys(nodes);

  const [activeUrl, setActiveUrl] = useState(selectedUrl || nodeUrls[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [templateType, setTemplateType] = useState("article");
  const [fields, setFields] = useState({
    claim: "",
    evidence: "",
    openQuestion: "",
    steps: "",
    gotchas: "",
    result: "",
    pros: "",
    cons: "",
    verdict: "",
    freeform: "",
  });
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync active node data
  useEffect(() => {
    if (!activeUrl && nodeUrls.length > 0) {
      setActiveUrl(nodeUrls[0]);
    }
  }, [nodeUrls, activeUrl]);

  useEffect(() => {
    if (activeUrl && nodes[activeUrl]) {
      const node = nodes[activeUrl];
      const sn = node.structuredNotes;

      if (sn && sn.templateType) {
        setTemplateType(sn.templateType);
        setFields(sn.fields || {});
      } else {
        setTemplateType("article");
        setFields({
          claim: "",
          evidence: "",
          openQuestion: "",
          steps: "",
          gotchas: "",
          result: "",
          pros: "",
          cons: "",
          verdict: "",
          freeform: node.notes || "",
        });
      }
      setTags(Array.isArray(node.tags) ? [...node.tags] : []);
    }
  }, [activeUrl, nodes]);

  const activeNode = activeUrl ? nodes[activeUrl] : null;

  // Filter nodes for sidebar
  const filteredUrls = nodeUrls.filter((url) => {
    const node = nodes[url];
    const title = (node.title || node.domain || url).toLowerCase();
    const query = searchQuery.toLowerCase();
    return !query || title.includes(query) || (node.tags || []).some((t) => t.toLowerCase().includes(query));
  });

  const handleFieldChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!activeUrl || !activeNode) return;
    setIsSaving(true);

    let summaryNotes = fields.freeform || "";
    if (templateType === "article") {
      const parts = [];
      if (fields.claim) parts.push(`Claim: ${fields.claim}`);
      if (fields.evidence) parts.push(`Evidence: ${fields.evidence}`);
      if (fields.openQuestion) parts.push(`Open Question: ${fields.openQuestion}`);
      summaryNotes = parts.join("\n\n") || fields.freeform;
    } else if (templateType === "tutorial") {
      const parts = [];
      if (fields.steps) parts.push(`Steps: ${fields.steps}`);
      if (fields.gotchas) parts.push(`Gotchas: ${fields.gotchas}`);
      if (fields.result) parts.push(`Result: ${fields.result}`);
      summaryNotes = parts.join("\n\n") || fields.freeform;
    } else if (templateType === "comparison") {
      const parts = [];
      if (fields.pros) parts.push(`Pros: ${fields.pros}`);
      if (fields.cons) parts.push(`Cons: ${fields.cons}`);
      if (fields.verdict) parts.push(`Verdict: ${fields.verdict}`);
      summaryNotes = parts.join("\n\n") || fields.freeform;
    }

    const structuredNotesPayload = {
      templateType,
      fields,
    };

    try {
      await extensionBridge.saveNote(activeUrl, summaryNotes, tags, structuredNotesPayload);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1600);
    } catch (err) {
      setIsSaving(false);
      console.error("Save note failed:", err);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault();
      const trimmed = newTagInput.trim().toLowerCase();
      if (!tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setNewTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div style={{ flex: 1, height: "100%", display: "flex", background: "var(--bg)", overflow: "hidden" }}>
      {/* 1. Left Node Selector Column */}
      <div style={{
        width: "320px",
        height: "100%",
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{ padding: "16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 600,
            color: "var(--blue)",
            marginBottom: "10px",
          }}>
            <FileText size={13} />
            <span>Research Nodes ({nodeUrls.length})</span>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={13} color="var(--text-dim)" style={{ position: "absolute", left: "10px", top: "9px" }} />
            <input
              type="text"
              placeholder="Filter nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px 6px 30px",
                fontSize: "12px",
                background: "var(--surface-solid)",
              }}
            />
          </div>
        </div>

        {/* Node List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {filteredUrls.map((url) => {
            const n = nodes[url];
            const isSelected = url === activeUrl;
            const snType = n.structuredNotes?.templateType;
            const hasNotes = !!(n.notes && n.notes.trim());

            return (
              <button
                key={url}
                onClick={() => setActiveUrl(url)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: isSelected ? "var(--surface-active)" : "transparent",
                  border: `1px solid ${isSelected ? "var(--border-focus)" : "transparent"}`,
                  marginBottom: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {n.favicon ? (
                    <img src={n.favicon} alt="" style={{ width: "14px", height: "14px", borderRadius: "2px" }} onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <FileText size={13} color="var(--text-dim)" />
                  )}
                  <span style={{
                    fontSize: "12px",
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}>
                    {n.title || n.domain || url}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "var(--text-dim)" }}>
                  <span>{n.domain || "Webpage"}</span>
                  {snType && (
                    <span style={{
                      background: "rgba(56, 189, 248, 0.1)",
                      color: "var(--blue)",
                      padding: "1px 5px",
                      borderRadius: "3px",
                      textTransform: "capitalize",
                    }}>
                      {snType}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main High-Resolution Editor Workspace */}
      <div style={{ flex: 1, height: "100%", overflowY: "auto", padding: "32px 48px", display: "flex", flexDirection: "column" }}>
        {activeNode ? (
          <div style={{ maxWidth: "880px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Top Node Title & Actions */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--blue)", fontWeight: 600 }}>
                  Structured Analysis Studio
                </span>
                <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginTop: "4px" }}>
                  {activeNode.title || activeNode.domain || activeUrl}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>{activeNode.domain}</span>
                  <span>•</span>
                  <span>{activeNode.visits || 1} visits tracked</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => extensionBridge.openTab(activeUrl)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ExternalLink size={13} />
                  <span>Open URL</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: saveSuccess ? "var(--green)" : "var(--blue-bright)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {saveSuccess ? <Check size={13} /> : null}
                  <span>{saveSuccess ? "Saved to Extension" : isSaving ? "Saving..." : "Save Notes"}</span>
                </button>
              </div>
            </div>

            {/* Template Selector Tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--surface-solid)", padding: "4px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <button
                onClick={() => setTemplateType("article")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: templateType === "article" ? "var(--surface-raised)" : "transparent",
                  color: templateType === "article" ? "var(--blue)" : "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  border: templateType === "article" ? "1px solid var(--border-strong)" : "1px solid transparent",
                }}
              >
                <BookOpen size={14} />
                <span>Article / Thesis</span>
              </button>

              <button
                onClick={() => setTemplateType("tutorial")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: templateType === "tutorial" ? "var(--surface-raised)" : "transparent",
                  color: templateType === "tutorial" ? "var(--blue)" : "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  border: templateType === "tutorial" ? "1px solid var(--border-strong)" : "1px solid transparent",
                }}
              >
                <FileCode size={14} />
                <span>Tutorial / Guide</span>
              </button>

              <button
                onClick={() => setTemplateType("comparison")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: templateType === "comparison" ? "var(--surface-raised)" : "transparent",
                  color: templateType === "comparison" ? "var(--blue)" : "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  border: templateType === "comparison" ? "1px solid var(--border-strong)" : "1px solid transparent",
                }}
              >
                <Scale size={14} />
                <span>Comparison</span>
              </button>

              <button
                onClick={() => setTemplateType("freeform")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: templateType === "freeform" ? "var(--surface-raised)" : "transparent",
                  color: templateType === "freeform" ? "var(--blue)" : "var(--text-secondary)",
                  fontWeight: 600,
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  border: templateType === "freeform" ? "1px solid var(--border-strong)" : "1px solid transparent",
                }}
              >
                <FileText size={14} />
                <span>Freeform Markdown</span>
              </button>
            </div>

            {/* Template Fields */}
            {templateType === "article" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    1. Core Claim / Thesis
                  </label>
                  <input
                    type="text"
                    placeholder="What is the central assertion or discovery of this paper/article?"
                    value={fields.claim || ""}
                    onChange={(e) => handleFieldChange("claim", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    2. Empirical Evidence & Supporting Data
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Key data points, benchmarks, or supporting arguments..."
                    value={fields.evidence || ""}
                    onChange={(e) => handleFieldChange("evidence", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13px", lineHeight: "1.6" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    3. Limitations & Open Questions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What questions remain unanswered or what are the critical caveats?"
                    value={fields.openQuestion || ""}
                    onChange={(e) => handleFieldChange("openQuestion", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13px", lineHeight: "1.6" }}
                  />
                </div>
              </div>
            )}

            {templateType === "tutorial" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    1. Implementation Steps & Architecture
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Step 1, Step 2, architecture setup, commands..."
                    value={fields.steps || ""}
                    onChange={(e) => handleFieldChange("steps", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13px", lineHeight: "1.6" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    2. Gotchas & Edge Cases
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Key pitfalls, version incompatibilities, or subtle bugs..."
                    value={fields.gotchas || ""}
                    onChange={(e) => handleFieldChange("gotchas", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13px", lineHeight: "1.6" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    3. Expected Result & Verification
                  </label>
                  <input
                    type="text"
                    placeholder="How do you test/confirm that the solution works?"
                    value={fields.result || ""}
                    onChange={(e) => handleFieldChange("result", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13px" }}
                  />
                </div>
              </div>
            )}

            {templateType === "comparison" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--green-light)", display: "block", marginBottom: "6px" }}>
                      Pros & Advantages
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Strengths, benefits, performance gains..."
                      value={fields.pros || ""}
                      onChange={(e) => handleFieldChange("pros", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", fontSize: "13px", lineHeight: "1.6" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--danger-light)", display: "block", marginBottom: "6px" }}>
                      Cons & Drawbacks
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Weaknesses, costs, complexities..."
                      value={fields.cons || ""}
                      onChange={(e) => handleFieldChange("cons", e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", fontSize: "13px", lineHeight: "1.6" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                    Final Verdict & Tradeoff Recommendation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="When should you choose this over alternatives?"
                    value={fields.verdict || ""}
                    onChange={(e) => handleFieldChange("verdict", e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", fontSize: "13px", lineHeight: "1.6" }}
                  />
                </div>
              </div>
            )}

            {templateType === "freeform" && (
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", display: "block", marginBottom: "6px" }}>
                  Freeform Markdown Notes
                </label>
                <textarea
                  rows={10}
                  placeholder="Record full research thoughts, synthesized notes, and takeaways..."
                  value={fields.freeform || ""}
                  onChange={(e) => handleFieldChange("freeform", e.target.value)}
                  style={{ width: "100%", padding: "12px", fontSize: "13px", lineHeight: "1.7" }}
                />
              </div>
            )}

            {/* Tags Management */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "16px" }}>
              <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-dim)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                <Tag size={12} />
                <span>Node Tags</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "var(--surface-raised)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--radius-full)",
                      padding: "4px 10px 4px 12px",
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    #{t}
                    <button onClick={() => handleRemoveTag(t)} style={{ color: "var(--text-muted)" }}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ Add tag (Enter)"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  style={{
                    background: "transparent",
                    border: "1px dashed var(--border)",
                    borderRadius: "var(--radius-full)",
                    padding: "4px 12px",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                    width: "130px",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--text-dim)" }}>
            <FileText size={36} style={{ margin: "0 auto 12px" }} />
            <p>Select a node from the sidebar to edit structured research notes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
