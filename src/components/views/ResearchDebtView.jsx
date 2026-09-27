"use client";

import React, { useState, useEffect } from "react";
import { extensionBridge } from "../../lib/extensionBridge";
import {
  BarChart2,
  Clock,
  AlertTriangle,
  Pin,
  ExternalLink,
  RefreshCw,
  Info,
  CheckCircle,
  FileText,
} from "lucide-react";

export default function ResearchDebtView({ activeSession }) {
  const [debt, setDebt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebt = async () => {
    setIsLoading(true);
    try {
      const res = await extensionBridge.getResearchDebt();
      setDebt(res);
      setIsLoading(false);
    } catch (err) {
      console.error("Fetch research debt failed:", err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebt();
  }, [activeSession?.id]);

  const handleTogglePin = async (url) => {
    try {
      await extensionBridge.togglePin(url, true);
      fetchDebt();
    } catch (err) {
      console.error("Toggle pin failed:", err);
    }
  };

  const handleOpenTab = (url) => {
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
        maxWidth: "1000px",
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
            <BarChart2 size={14} />
            <span>Retention & Waste Diagnostics</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>
            Research Debt & Retention Audit
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
            Identify abandoned research branches, repeat refind time waste, and retention gaps in <strong>"{activeSession?.name || 'Workspace'}"</strong>.
          </p>
        </div>

        <button
          onClick={fetchDebt}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            fontWeight: 500,
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <RefreshCw size={13} className={isLoading ? "pulse" : ""} />
          <span>Recalculate Audit</span>
        </button>
      </div>

      {debt ? (
        <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Key Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
            {/* Time Lost */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              borderLeft: "4px solid var(--danger)",
              padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--danger-light)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
                <Clock size={14} />
                <span>Time Lost</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--danger-light)", marginTop: "8px" }}>
                {debt.timeLostFormatted || `${debt.timeLostMinutes || 0}m`}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
                Spent refinding visited pages
              </div>
            </div>

            {/* Dead-End Count */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              borderLeft: "4px solid var(--amber)",
              padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--amber-light)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
                <AlertTriangle size={14} />
                <span>Dead Ends</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--amber-light)", marginTop: "8px" }}>
                {debt.deadEndCount || 0}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
                Inactive nodes with 0 notes
              </div>
            </div>

            {/* Single Visits */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "18px 20px",
            }}>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                Never Revisited
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-primary)", marginTop: "8px" }}>
                {debt.neverRevisited || 0}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
                1-visit ephemeral pages
              </div>
            </div>

            {/* Revisited 3+ times */}
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "18px 20px",
            }}>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 600 }}>
                Core Anchor Nodes
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--green-light)", marginTop: "8px" }}>
                {debt.revisitedThricePlus || 0}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px" }}>
                Revisited 3+ times
              </div>
            </div>
          </div>

          {/* Heuristic Documentation Banner */}
          <div style={{
            background: "var(--surface-solid)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            fontSize: "12px",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
          }}>
            <Info size={16} color="var(--blue)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ color: "var(--text-primary)" }}>How Time-Lost is calculated:</strong>{" "}
              Time-Lost represents cumulative time wasted re-searching for unanchored pages:{" "}
              <code style={{ fontFamily: "var(--font-mono)", color: "var(--blue)" }}>(Visits - 1) × 3.0 minutes</code>.
              Dead ends are inactive branches with no structured notes and no Memory Palace excerpts.
            </div>
          </div>

          {/* Dead-End Nodes Section */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                Dead-End Branch Candidates ({debt.deadEndNodes?.length || 0})
              </h3>
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                Pages with 0 highlights or notes
              </span>
            </div>

            {(!debt.deadEndNodes || debt.deadEndNodes.length === 0) ? (
              <div style={{
                background: "var(--surface-raised)",
                border: "1px dashed var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "24px",
                textAlign: "center",
                fontSize: "13px",
                color: "var(--green-light)",
              }}>
                <CheckCircle size={20} style={{ margin: "0 auto 8px" }} />
                <span>Zero dead ends detected! All active pages have notes or highlights.</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {debt.deadEndNodes.map((item) => (
                  <div
                    key={item.url}
                    style={{
                      background: "var(--surface-solid)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.node?.title || item.node?.domain || item.url}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                        {item.node?.domain} • Inactive for {item.daysInactive} days • {item.node?.visits || 1} visits
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => handleTogglePin(item.url)}
                        title="Pin as Landmark to rescue from debt"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "var(--radius-xs)",
                          background: "var(--surface-raised)",
                          border: "1px solid var(--border)",
                          fontSize: "11px",
                          color: "var(--amber-light)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Pin size={12} />
                        <span>Pin Landmark</span>
                      </button>

                      <button
                        onClick={() => handleOpenTab(item.url)}
                        style={{
                          padding: "6px 12px",
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
                        <ExternalLink size={12} />
                        <span>Review Page</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ margin: "auto", textAlign: "center", color: "var(--text-dim)" }}>
          <RefreshCw size={28} className="pulse" style={{ margin: "0 auto 12px" }} />
          <p>Calculating research retention audit...</p>
        </div>
      )}
    </div>
  );
}
