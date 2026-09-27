"use client";

import React, { useEffect, useState } from "react";
import { extensionBridge, ConnectionState, DEFAULT_EXTENSION_ID } from "../lib/extensionBridge";
import ConnectionStatusBanner from "../components/ConnectionStatusBanner";
import Header from "../components/Header";
import GraphCanvas from "../components/GraphCanvas";
import NodeInspector from "../components/NodeInspector";
import MemoryPalaceView from "../components/views/MemoryPalaceView";
import StructuredNotesView from "../components/views/StructuredNotesView";
import LandmarksHighlightView from "../components/views/LandmarksHighlightView";
import FlashcardsView from "../components/views/FlashcardsView";
import QuizModeView from "../components/views/QuizModeView";
import ResearchDebtView from "../components/views/ResearchDebtView";
import AIDigestView from "../components/views/AIDigestView";
import BackupModal from "../components/BackupModal";
import {
  Globe,
  RefreshCw,
} from "lucide-react";

export default function HomePage() {
  const [connectionState, setConnectionState] = useState(ConnectionState.CHECKING);
  const [stateData, setStateData] = useState(null);
  const [extensionId, setExtensionId] = useState(DEFAULT_EXTENSION_ID);
  const [currentView, setCurrentView] = useState("graph"); // "graph" | "memory" | "notes" | "landmarks" | "flashcards" | "quiz" | "debt" | "digest"
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterPinned, setIsFilterPinned] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [relayoutTrigger, setRelayoutTrigger] = useState(0);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = extensionBridge.subscribe(({ state, data, extensionId }) => {
      setConnectionState(state);
      setStateData(data);
      setExtensionId(extensionId);

      // If active session node data updated, sync selectedNode
      if (selectedNode && data?.sessions && data?.activeSessionId) {
        const activeS = data.sessions[data.activeSessionId];
        const updatedN = activeS?.graph?.nodes?.[selectedNode.url];
        if (updatedN) {
          setSelectedNode(updatedN);
        }
      }
    });

    extensionBridge.connect();

    return () => {
      unsubscribe();
    };
  }, []);
  const activeSession = stateData?.sessions && stateData?.activeSessionId
    ? stateData.sessions[stateData.activeSessionId]
    : null;

  const handleNodeSelect = (nodeData) => {
    if (!nodeData) {
      setSelectedNode(null);
      return;
    }
    const fullNode = activeSession?.graph?.nodes?.[nodeData.url] || nodeData;
    setSelectedNode(fullNode);
  };

  const handleNodeUpdated = (updatedNode) => {
    setSelectedNode(updatedNode);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* 1. Real-time Connection Status Indicator Bar */}
      <ConnectionStatusBanner
        connectionState={connectionState}
        stateData={stateData}
        extensionId={extensionId}
      />

      {/* 2. Top Header & Control Bar with View Navigation */}
      <Header
        sessions={stateData?.sessions || {}}
        activeSessionId={stateData?.activeSessionId || ""}
        activeSession={activeSession}
        currentView={currentView}
        onViewChange={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isFilterPinned={isFilterPinned}
        onFilterPinnedToggle={() => setIsFilterPinned(!isFilterPinned)}
        onFitView={() => setFitTrigger((prev) => prev + 1)}
        onRelayout={() => setRelayoutTrigger((prev) => prev + 1)}
        onOpenDigest={() => setCurrentView("digest")}
        onOpenFlashcards={() => setCurrentView("flashcards")}
        onOpenQuiz={() => setCurrentView("quiz")}
        onOpenDebt={() => setCurrentView("debt")}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Backup & Disaster Recovery Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />

      {/* 3. Main Full-Screen View Container */}
      <main style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex" }}>
        {connectionState === ConnectionState.CONNECTED ? (
          <>
            {currentView === "graph" && (
              <div style={{ flex: 1, width: "100%", height: "100%", position: "relative", display: "flex" }}>
                <GraphCanvas
                  graph={activeSession?.graph || { nodes: {}, edges: [] }}
                  searchQuery={searchQuery}
                  isFilterPinned={isFilterPinned}
                  selectedNodeUrl={selectedNode?.url || null}
                  onSelectNode={handleNodeSelect}
                  fitTrigger={fitTrigger}
                  relayoutTrigger={relayoutTrigger}
                />

                {/* Slide-Over Node Inspector Drawer for Graph Canvas */}
                {selectedNode && (
                  <NodeInspector
                    node={selectedNode}
                    url={selectedNode.url}
                    onClose={() => setSelectedNode(null)}
                    onNodeUpdated={handleNodeUpdated}
                  />
                )}
              </div>
            )}

            {currentView === "memory" && (
              <MemoryPalaceView
                activeSession={activeSession}
                onNodeSelect={handleNodeSelect}
              />
            )}

            {currentView === "notes" && (
              <StructuredNotesView
                activeSession={activeSession}
                selectedUrl={selectedNode?.url || null}
                onSelectNode={handleNodeSelect}
              />
            )}

            {currentView === "landmarks" && (
              <LandmarksHighlightView
                activeSession={activeSession}
              />
            )}

            {currentView === "flashcards" && (
              <FlashcardsView
                activeSession={activeSession}
              />
            )}

            {currentView === "quiz" && (
              <QuizModeView
                activeSession={activeSession}
              />
            )}

            {currentView === "debt" && (
              <ResearchDebtView
                activeSession={activeSession}
              />
            )}

            {currentView === "digest" && (
              <AIDigestView
                activeSession={activeSession}
              />
            )}
          </>
        ) : (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
          }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              padding: "40px",
              maxWidth: "600px",
              width: "100%",
              boxShadow: "var(--shadow-lg)",
              backdropFilter: "var(--blur)",
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(3, 105, 161, 0.3))",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}>
                <Globe size={24} color="var(--blue)" />
              </div>

              <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "10px", color: "var(--text-primary)" }}>
                Connect Cognitive Graph Extension
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.6", marginBottom: "24px" }}>
                This web dashboard functions as a high-resolution remote screen for your local Chrome Extension. To connect:
              </p>

              <div style={{
                background: "var(--surface-solid)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                marginBottom: "24px",
                textAlign: "left",
                fontSize: "13px",
                lineHeight: "1.8",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                  <span style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 600,
                    flexShrink: 0,
                    color: "var(--blue)",
                  }}>1</span>
                  <span>Ensure <strong>Cognitive Graph</strong> is installed and enabled in this Chrome browser profile.</span>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                  <span style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 600,
                    flexShrink: 0,
                    color: "var(--blue)",
                  }}>2</span>
                  <span>
                    Pinned Extension ID: <code style={{ fontFamily: "var(--font-mono)", color: "var(--blue)", fontSize: "11px" }}>{extensionId}</code>
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <span style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-strong)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 600,
                    flexShrink: 0,
                    color: "var(--blue)",
                  }}>3</span>
                  <span>Click <strong>Retry Handshake</strong> once enabled.</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => extensionBridge.connect()}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--blue-bright)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <RefreshCw size={15} />
                  <span>Retry Handshake</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
