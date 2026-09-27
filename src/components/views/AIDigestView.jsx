"use client";

import React, { useState } from "react";
import { extensionBridge } from "../../lib/extensionBridge";
import {
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Copy,
  Download,
  Check,
  BookOpen,
  ArrowRight,
  Layers,
} from "lucide-react";

export default function AIDigestView({ activeSession }) {
  const [markdown, setMarkdown] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [providerUsed, setProviderUsed] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    setMarkdown("");

    try {
      const res = await extensionBridge.generateDigest();
      if (res && res.markdown) {
        setMarkdown(res.markdown);
        setProviderUsed(res.provider || "AI");
        setIsGenerating(false);
      } else {
        throw new Error("No digest markdown returned by the AI provider.");
      }
    } catch (err) {
      setIsGenerating(false);
      setErrorMsg(err.message || "Failed to generate AI digest.");
    }
  };

  const handleCopy = () => {
    if (!markdown) return;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleDownload = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(activeSession?.name || "research").toLowerCase().replace(/\s+/g, "_")}_digest.md`;
    a.click();
    URL.revokeObjectURL(url);
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
        maxWidth: "900px",
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
            color: "var(--blue)",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "6px",
          }}>
            <Sparkles size={14} />
            <span>AI Research Synthesis Engine</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>
            Sequential Research Walkthrough
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
            Synthesize all tracked nodes, search topics, and highlighted passages into a structured research briefing.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            color: "var(--green-light)",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            padding: "6px 12px",
            borderRadius: "var(--radius-full)",
          }}>
            <ShieldCheck size={13} />
            <span>100% Private (Key Never Leaves Extension)</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-sm)",
              background: "var(--blue-bright)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Sparkles size={13} />
            <span>{isGenerating ? "Synthesizing..." : "Synthesize Digest"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: "900px", width: "100%", margin: "0 auto" }}>
        {errorMsg && (
          <div style={{
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid var(--danger)",
            color: "var(--danger-light)",
            padding: "14px",
            borderRadius: "var(--radius-sm)",
            fontSize: "13px",
            marginBottom: "20px",
          }}>
            {errorMsg}
          </div>
        )}

        {isGenerating && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "60px 40px",
            textAlign: "center",
          }}>
            <RefreshCw size={36} color="var(--blue)" className="pulse" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Synthesizing Research Sequence...
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              The extension's background worker is analyzing the knowledge graph topology and notes.
            </p>
          </div>
        )}

        {markdown && !isGenerating && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "36px 40px",
            boxShadow: "var(--shadow-lg)",
          }}>
            {/* Action Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "16px", marginBottom: "24px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                Synthesized with {providerUsed}
              </span>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-xs)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                    color: copied ? "var(--green)" : "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? "Copied Markdown" : "Copy Markdown"}</span>
                </button>

                <button
                  onClick={handleDownload}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--radius-xs)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                    color: "var(--blue)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Download size={13} />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            {/* Markdown Display */}
            <div style={{
              fontSize: "14px",
              lineHeight: "1.8",
              color: "var(--text-primary)",
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font)",
            }}>
              {markdown}
            </div>
          </div>
        )}

        {!markdown && !isGenerating && !errorMsg && (
          <div style={{
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "60px 40px",
            textAlign: "center",
          }}>
            <BookOpen size={36} color="var(--text-dim)" style={{ margin: "0 auto 16px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              No Digest Generated Yet
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", maxWidth: "460px", margin: "0 auto 24px", lineHeight: "1.6" }}>
              Click <strong>"Synthesize Digest"</strong> above. The background service worker will group your navigation paths and excerpts into an executive research report.
            </p>
            <button
              onClick={handleGenerate}
              style={{
                padding: "10px 24px",
                borderRadius: "var(--radius-sm)",
                background: "var(--blue-bright)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Sparkles size={14} />
              <span>Generate Digest Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
