// web/src/lib/graphEngine.js
// Cytoscape Configuration and Graph Physics Stylesheet for Cognitive Graph Web

export const COSE_LAYOUT = {
  name: "cose",
  animate: true,
  animationDuration: 450,
  animationEasing: "ease-out",
  nodeRepulsion: () => 18000,
  idealEdgeLength: () => 140,
  edgeElasticity: () => 100,
  gravity: 0.2,
  padding: 60,
  randomize: false,
  componentSpacing: 80,
  numIter: 500,
  fit: true,
};

export const CYTOSCAPE_STYLES = [
  {
    selector: "node",
    style: {
      shape: "ellipse",
      "background-color": "#0d131f",
      "background-image": "data(favicon)",
      "background-fit": "cover",
      "background-clip": "node",
      "background-opacity": 1,
      width: "48px",
      height: "48px",
      label: "data(label)",
      "text-wrap": "ellipsis",
      "text-max-width": "120px",
      "font-size": "10.5px",
      "font-family": "var(--font-mono)",
      "font-weight": "500",
      color: "#cbd5e1",
      "text-valign": "bottom",
      "text-margin-y": "8px",
      "text-background-color": "#0d131f",
      "text-background-opacity": 0.94,
      "text-background-padding": "3px 6px",
      "text-background-shape": "roundrectangle",
      "text-border-color": "rgba(255, 255, 255, 0.12)",
      "text-border-width": "1px",
      "text-border-opacity": 1,
      "border-width": "2.5px",
      "border-color": "rgba(255, 255, 255, 0.18)",
      "border-opacity": 1,
      "overlay-padding": "4px",
      "z-index": 10,
      "transition-property": "background-color, border-color, border-width, width, height, opacity, color",
      "transition-duration": "0.18s",
      "transition-timing-function": "ease-out",
    },
  },
  {
    selector: "node.bookmarked",
    style: {
      "border-width": "5px",
    },
  },
  {
    selector: "node.topic-node",
    style: {
      "border-color": "#f97316",
      "border-width": "3px",
      "background-color": "#18110b",
      "z-index": 25,
    },
  },
  {
    selector: "node.bookmarked.topic-node",
    style: {
      "border-width": "5.5px",
    },
  },
  {
    selector: "node.journey-start",
    style: {
      "border-color": "#f97316",
      "border-width": "3px",
      "background-color": "#18110b",
      "z-index": 35,
    },
  },
  {
    selector: "node.bookmarked.journey-start",
    style: {
      "border-width": "5.5px",
    },
  },
  {
    selector: "node.journey-middle",
    style: {
      "border-color": "#eab308",
      "border-width": "2.5px",
      "background-color": "#15160d",
      "z-index": 20,
    },
  },
  {
    selector: "node.bookmarked.journey-middle",
    style: {
      "border-width": "5px",
    },
  },
  {
    selector: "node.journey-end",
    style: {
      "border-color": "#10b981",
      "border-width": "3px",
      "background-color": "#0c1813",
      "z-index": 35,
    },
  },
  {
    selector: "node.bookmarked.journey-end",
    style: {
      "border-width": "5.5px",
    },
  },
  {
    selector: "node.pinned",
    style: {
      "border-color": "#f59e0b",
      "border-width": "3.5px",
      "z-index": 100,
    },
  },
  {
    selector: "node.bookmarked.pinned",
    style: {
      "border-width": "5.5px",
    },
  },
  {
    selector: "node.annotated",
    style: {
      "border-color": "#38bdf8",
      "border-width": "2.5px",
    },
  },
  {
    selector: "node.bookmarked.annotated",
    style: {
      "border-width": "5px",
    },
  },
  {
    selector: "node.highlighted",
    style: {
      "border-color": "#ffffff",
      "border-width": "4px",
      "z-index": 150,
    },
  },
  {
    selector: "node.node-hovered",
    style: {
      "border-color": "#38bdf8",
      "border-width": "3.5px",
      "z-index": 160,
    },
  },
  {
    selector: "node.selected",
    style: {
      "border-color": "#38bdf8",
      "border-width": "4.5px",
      "z-index": 200,
    },
  },
  {
    selector: ".faded",
    style: { opacity: 0.12 },
  },
  {
    selector: "node.pinned.faded",
    style: { opacity: 0.65 },
  },
  {
    selector: "node.journey-start.faded",
    style: { opacity: 0.5 },
  },
  {
    selector: "node.journey-end.faded",
    style: { opacity: 0.5 },
  },
  // Edges
  {
    selector: "edge",
    style: {
      width: 2,
      "line-color": "rgba(100, 116, 139, 0.35)",
      "target-arrow-color": "rgba(148, 163, 184, 0.45)",
      "target-arrow-shape": "triangle",
      "arrow-scale": 0.9,
      "curve-style": "bezier",
      "control-point-step-size": 45,
      opacity: 0.8,
      "transition-property": "line-color, target-arrow-color, width, opacity",
      "transition-duration": "0.18s",
      "transition-timing-function": "ease-out",
    },
  },
  {
    selector: "edge.edge-discovery",
    style: {
      "line-color": "rgba(249, 115, 22, 0.55)",
      "target-arrow-color": "#f97316",
    },
  },
  {
    selector: "edge.edge-middle",
    style: {
      "line-color": "rgba(234, 179, 8, 0.48)",
      "target-arrow-color": "#eab308",
    },
  },
  {
    selector: "edge.edge-final",
    style: {
      "line-color": "rgba(16, 185, 129, 0.55)",
      "target-arrow-color": "#10b981",
    },
  },
  {
    selector: "edge.edge-hovered",
    style: {
      width: 3,
      opacity: 0.95,
      "line-color": "#cbd5e1",
      "target-arrow-color": "#cbd5e1",
      "z-index": 40,
    },
  },
  {
    selector: "edge.edge-hovered.edge-discovery",
    style: {
      "line-color": "#fb923c",
      "target-arrow-color": "#f97316",
    },
  },
  {
    selector: "edge.edge-hovered.edge-middle",
    style: {
      "line-color": "#facc15",
      "target-arrow-color": "#eab308",
    },
  },
  {
    selector: "edge.edge-hovered.edge-final",
    style: {
      "line-color": "#34d399",
      "target-arrow-color": "#10b981",
    },
  },
  {
    selector: "edge.highlighted",
    style: {
      width: 3.2,
      opacity: 1,
      "line-color": "#38bdf8",
      "target-arrow-color": "#38bdf8",
      "z-index": 50,
    },
  },
];

export function buildCytoscapeElements(graph) {
  if (!graph || typeof graph !== "object") return [];
  const elements = [];
  const nodes = graph.nodes || {};
  const edges = graph.edges || [];
  const nodeKeys = Object.keys(nodes);

  const inDegree = {};
  const outDegree = {};
  nodeKeys.forEach((k) => {
    inDegree[k] = 0;
    outDegree[k] = 0;
  });

  edges.forEach((e) => {
    if (nodes[e.source] && nodes[e.target]) {
      outDegree[e.source] = (outDegree[e.source] || 0) + 1;
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    }
  });

  const distFromStart = {};
  const queue = [];
  nodeKeys.forEach((k) => {
    const isTopic = nodes[k].type === "topic" || k.startsWith("topic:");
    if (inDegree[k] === 0 || isTopic) {
      distFromStart[k] = 0;
      queue.push(k);
    } else {
      distFromStart[k] = Infinity;
    }
  });

  while (queue.length > 0) {
    const curr = queue.shift();
    const currDist = distFromStart[curr];
    edges.forEach((e) => {
      if (e.source === curr && nodes[e.target]) {
        if (distFromStart[e.target] > currDist + 1) {
          distFromStart[e.target] = currDist + 1;
          queue.push(e.target);
        }
      }
    });
  }

  const hasMultipleNodes = nodeKeys.length >= 2;
  const hasEdges = edges.length >= 1;

  nodeKeys.forEach((url) => {
    const n = nodes[url];
    const isTopic = n.type === "topic" || url.startsWith("topic:");
    const isPinned = !!n.pinned;
    const hasNotes = !!(n.notes && n.notes.trim());
    const hasTags = Array.isArray(n.tags) && n.tags.length > 0;
    const passagesCount = Array.isArray(n.savedParagraphs) ? n.savedParagraphs.length : 0;

    let isStart = false;
    let isEnd = false;
    let isMiddle = false;

    if (hasMultipleNodes && hasEdges) {
      if (inDegree[url] === 0 && outDegree[url] > 0) {
        isStart = true;
      } else if (isTopic && outDegree[url] > 0) {
        isStart = true;
      } else if (inDegree[url] > 0 && outDegree[url] === 0) {
        isEnd = true;
      } else if (distFromStart[url] > 0 && distFromStart[url] !== Infinity) {
        isMiddle = true;
      }
    } else if (isTopic) {
      isStart = true;
    }

    const classes = [];
    if (isTopic) classes.push("topic-node");
    if (isStart) classes.push("journey-start");
    if (isMiddle) classes.push("journey-middle");
    if (isEnd) classes.push("journey-end");
    if (isPinned) classes.push("pinned");
    if (n.bookmarkedManually) classes.push("bookmarked");
    if (hasNotes || hasTags || passagesCount > 0) classes.push("annotated");

    let domain = n.domain || "";
    if (!domain && !isTopic) {
      try {
        domain = new URL(url).hostname.toLowerCase();
      } catch (e) {
        domain = "Webpage";
      }
    }
    if (isTopic && !domain) domain = url.replace(/^topic:/i, "");

    let faviconUrl = n.favicon;
    if (!faviconUrl && domain && domain.includes(".")) {
      faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    }
    const displayLabel = isTopic ? url.replace(/^topic:/i, "") : (domain || "Webpage");

    elements.push({
      data: {
        id: url,
        label: displayLabel,
        title: n.title || (isTopic ? `Topic: ${displayLabel}` : domain),
        url,
        type: isTopic ? "topic" : "page",
        favicon: faviconUrl || "none",
        domain: domain,
        isStart: isStart,
        isEnd: isEnd,
        visits: n.visits || 1,
        notes: n.notes || "",
        tags: n.tags || [],
        pinned: isPinned,
        bookmarkedManually: !!n.bookmarkedManually,
        savedParagraphs: n.savedParagraphs || [],
        structuredNotes: n.structuredNotes || undefined,
        timestamp: n.timestamp || 0,
      },
      classes: classes.join(" "),
    });
  });

  const edgeSeen = new Set();
  edges.forEach((e, i) => {
    if (!nodes[e.source] || !nodes[e.target]) return;
    const key = `${e.source}->${e.target}`;
    if (edgeSeen.has(key)) return;
    edgeSeen.add(key);

    const srcIsStart = (inDegree[e.source] === 0 && outDegree[e.source] > 0) || (nodes[e.source]?.type === "topic");
    const tgtIsEnd = (inDegree[e.target] > 0 && outDegree[e.target] === 0);

    const edgeClasses = [];
    if (srcIsStart) {
      edgeClasses.push("edge-discovery");
    } else if (tgtIsEnd) {
      edgeClasses.push("edge-final");
    } else {
      edgeClasses.push("edge-middle");
    }

    elements.push({
      data: { id: `e${i}`, source: e.source, target: e.target },
      classes: edgeClasses.join(" "),
    });
  });

  return elements;
}
