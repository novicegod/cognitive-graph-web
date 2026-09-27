"use client";

import React, { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import { COSE_LAYOUT, CYTOSCAPE_STYLES, buildCytoscapeElements } from "../lib/graphEngine";
import { extensionBridge } from "../lib/extensionBridge";
import { Maximize2, RotateCw, Compass, PlusCircle, ExternalLink } from "lucide-react";

export default function GraphCanvas({
  graph = { nodes: {}, edges: [] },
  searchQuery = "",
  isFilterPinned = false,
  selectedNodeUrl = null,
  onSelectNode = () => {},
  fitTrigger = 0,
  relayoutTrigger = 0,
}) {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const cyRef = useRef(null);

  const nodeCount = Object.keys(graph?.nodes || {}).length;
  const graphSignature = JSON.stringify({
    nodes: Object.keys(graph?.nodes || {}).length,
    edges: (graph?.edges || []).length,
    nodeIds: Object.keys(graph?.nodes || {}).sort(),
  });

  // Initialize and Update Cytoscape Graph
  useEffect(() => {
    if (!containerRef.current) return;

    const elements = buildCytoscapeElements(graph);

    if (!cyRef.current) {
      const cy = cytoscape({
        container: containerRef.current,
        elements,
        style: CYTOSCAPE_STYLES,
        layout: COSE_LAYOUT,
        minZoom: 0.15,
        maxZoom: 4,
        wheelSensitivity: 0.18,
      });

      // Events
      cy.on("tap", "node", (evt) => {
        const node = evt.target;
        const data = node.data();
        onSelectNode(data);
      });

      cy.on("dbltap", "node", (evt) => {
        const node = evt.target;
        const url = node.data("url");
        if (url && !url.startsWith("topic:") && url.startsWith("http")) {
          extensionBridge.openTab(url);
        }
      });

      cy.on("tap", (evt) => {
        if (evt.target === cy) {
          onSelectNode(null);
        }
      });

      // Hover 1-Hop Neighbors
      cy.on("mouseover", "node", (evt) => {
        const node = evt.target;
        node.addClass("node-hovered");
        const neighborhood = node.neighborhood();
        neighborhood.nodes().addClass("node-hovered");
        neighborhood.edges().addClass("edge-hovered");
      });

      cy.on("mouseout", "node", (evt) => {
        const node = evt.target;
        node.removeClass("node-hovered");
        const neighborhood = node.neighborhood();
        neighborhood.nodes().removeClass("node-hovered");
        neighborhood.edges().removeClass("edge-hovered");
      });

      cyRef.current = cy;
    } else {
      // Dynamic updates without full teardown
      const cy = cyRef.current;
      cy.batch(() => {
        cy.elements().remove();
        cy.add(elements);
      });
      cy.layout(COSE_LAYOUT).run();
    }
  }, [graphSignature]);
  
  // Handle Search Filtering & Pinned Filtering
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      const allNodes = cy.nodes();
      const allEdges = cy.edges();

      const query = searchQuery.trim().toLowerCase();

      if (!query && !isFilterPinned) {
        allNodes.removeClass("faded highlighted");
        allEdges.removeClass("faded highlighted");
        return;
      }

      allNodes.forEach((node) => {
        const data = node.data();
        let matchesSearch = true;
        if (query) {
          const title = (data.title || "").toLowerCase();
          const label = (data.label || "").toLowerCase();
          const notes = (data.notes || "").toLowerCase();
          const tags = Array.isArray(data.tags) ? data.tags.join(" ").toLowerCase() : "";
          matchesSearch = title.includes(query) || label.includes(query) || notes.includes(query) || tags.includes(query);
        }

        let matchesPin = true;
        if (isFilterPinned) {
          matchesPin = !!data.pinned;
        }

        if (matchesSearch && matchesPin) {
          node.removeClass("faded");
          if (query) node.addClass("highlighted");
        } else {
          node.addClass("faded");
          node.removeClass("highlighted");
        }
      });

      allEdges.forEach((edge) => {
        const src = edge.source();
        const tgt = edge.target();
        if (src.hasClass("faded") || tgt.hasClass("faded")) {
          edge.addClass("faded");
        } else {
          edge.removeClass("faded");
        }
      });
    });
  }, [searchQuery, isFilterPinned]);

  // Selected Node Highlight
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.nodes().removeClass("selected");
      if (selectedNodeUrl) {
        const target = cy.getElementById(selectedNodeUrl);
        if (target && target.length > 0) {
          target.addClass("selected");
        }
      }
    });
  }, [selectedNodeUrl]);

  // Fit View Trigger
  useEffect(() => {
    if (fitTrigger > 0 && cyRef.current) {
      cyRef.current.animate({
        fit: { padding: 50 },
        duration: 350,
        easing: "ease-out",
      });
    }
  }, [fitTrigger]);

  // Relayout Trigger
  useEffect(() => {
    if (relayoutTrigger > 0 && cyRef.current) {
      cyRef.current.layout(COSE_LAYOUT).run();
    }
  }, [relayoutTrigger]);

  if (nodeCount === 0) {
    return (
      <div style={{
        flex: 1,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        color: "var(--text-secondary)",
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
          color: "var(--text-dim)",
        }}>
          <Compass size={28} />
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
          Empty Workspace
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "420px", textAlign: "center", lineHeight: "1.6" }}>
          Browse the web or search on Google/Bing in Chrome. Pages and search topics will automatically synthesize into this graph in real time!
        </p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      {/* Cytoscape Viewport Canvas */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          background: "transparent",
        }}
      />
    </div>
  );
}
