"use client";

import React, { useState } from "react";
import { extensionBridge } from "../lib/extensionBridge";
import {
  X,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Database,
  FileJson,
} from "lucide-react";

export default function BackupModal({ isOpen, onClose }) {
  const [includeApiKeys, setIncludeApiKeys] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importStrategy, setImportStrategy] = useState("merge"); // "merge" | "replace"
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { type: "success" | "error", message: string }

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backupData = await extensionBridge.exportBackup(includeApiKeys);
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      a.download = `cognitive_graph_backup_${dateStr}${includeApiKeys ? "_with_keys" : ""}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    } catch (err) {
      setIsExporting(false);
      alert("Failed to export backup: " + (err.message || "Unknown error"));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setImportFile(file || null);
    setImportStatus(null);
  };

  const handleImport = () => {
    if (!importFile) {
      setImportStatus({ type: "error", message: "Please select a valid .json backup file first." });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        let parsed;
        try {
          parsed = JSON.parse(e.target.result);
        } catch (jsonErr) {
          throw new Error("Invalid JSON formatting: " + jsonErr.message);
        }

        // Send to background service worker for schema validation & safe write
        const res = await extensionBridge.importBackup(parsed, importStrategy);
        setIsImporting(false);
        const sessionCount = Object.keys(res.sessions || {}).length;
        setImportStatus({
          type: "success",
          message: `Backup successfully ${importStrategy === "replace" ? "restored (replaced all)" : "merged"}! (${sessionCount} active workspaces)`,
        });
        setImportFile(null);
      } catch (err) {
        setIsImporting(false);
        setImportStatus({
          type: "error",
          message: "Import rejected: " + (err.message || "Schema validation failed."),
        });
      }
    };

    reader.onerror = () => {
      setIsImporting(false);
      setImportStatus({ type: "error", message: "Failed to read backup file from disk." });
    };

    reader.readAsText(importFile);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(3, 7, 18, 0.82)",
      backdropFilter: "blur(6px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-modal)",
        maxWidth: "580px",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Modal Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-solid)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Database size={18} color="var(--blue)" />
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Full Backup & Disaster Recovery
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "4px",
              borderRadius: "4px",
              color: "var(--text-dim)",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Section 1: Export */}
          <div style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Download size={16} color="var(--blue)" />
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                Export Full Backup
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "14px" }}>
              Serialize all workspaces, graphs, Memory Palace passages, and structured notes into a single portable <code>.json</code> file.
            </p>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={includeApiKeys}
                onChange={(e) => setIncludeApiKeys(e.target.checked)}
              />
              <span>Include AI API Keys in backup file (uncheck for safe public sharing)</span>
            </label>

            <button
              onClick={handleExport}
              disabled={isExporting}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-sm)",
                background: "var(--blue-bright)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Download size={13} />
              <span>{isExporting ? "Exporting..." : "Download JSON Backup"}</span>
            </button>
          </div>

          {/* Section 2: Import */}
          <div style={{
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Upload size={16} color="var(--amber-light)" />
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                Import Full Backup
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "14px" }}>
              Restore from a previously exported backup file. Data is validated before writing to ensure zero corruptions.
            </p>

            <div style={{ marginBottom: "14px" }}>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                style={{
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  background: "var(--surface-solid)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xs)",
                  padding: "6px 10px",
                  width: "100%",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-primary)", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="modal-import-strategy"
                  value="merge"
                  checked={importStrategy === "merge"}
                  onChange={() => setImportStrategy("merge")}
                />
                <span><strong>Merge</strong> (Combine with current data)</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--danger-light)", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="modal-import-strategy"
                  value="replace"
                  checked={importStrategy === "replace"}
                  onChange={() => setImportStrategy("replace")}
                />
                <span><strong>Replace</strong> (Overwrite existing)</span>
              </label>
            </div>

            <button
              onClick={handleImport}
              disabled={isImporting}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-sm)",
                background: "var(--amber)",
                color: "#000",
                fontWeight: 700,
                fontSize: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Upload size={13} />
              <span>{isImporting ? "Validating & Restoring..." : "Validate & Restore Backup"}</span>
            </button>

            {importStatus && (
              <div style={{
                marginTop: "14px",
                padding: "10px 14px",
                borderRadius: "var(--radius-xs)",
                fontSize: "12px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                background: importStatus.type === "error" ? "rgba(244, 63, 94, 0.12)" : "rgba(16, 185, 129, 0.12)",
                border: `1px solid ${importStatus.type === "error" ? "var(--danger)" : "var(--green)"}`,
                color: importStatus.type === "error" ? "var(--danger-light)" : "var(--green-light)",
              }}>
                {importStatus.type === "error" ? <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "1px" }} /> : <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: "1px" }} />}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
