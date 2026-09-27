"use client";

import React, { useState, useEffect } from "react";
import { extensionBridge } from "../../lib/extensionBridge";
import {
  BookOpen,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function FlashcardsView({ activeSession }) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterState, setFilterState] = useState("all"); // "all" | "unreviewed" | "mastered" | "learning"
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (activeSession && Array.isArray(activeSession.flashcards)) {
      setCards(activeSession.flashcards);
    }
  }, [activeSession]);

  const filteredCards = cards.filter((c) => {
    if (filterState === "unreviewed") return !c.recallState || c.recallState === "unreviewed";
    if (filterState === "mastered") return c.recallState === "easy";
    if (filterState === "learning") return c.recallState === "hard" || c.recallState === "good";
    return true;
  });

  const currentCard = filteredCards[currentIndex] || null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRateRecall = async (rating) => {
    if (!currentCard) return;

    const updatedCards = cards.map((c) => {
      if (c.id === currentCard.id) {
        return {
          ...c,
          recallState: rating,
          reviewCount: (c.reviewCount || 0) + 1,
          lastReviewed: Date.now(),
          forgotCount: rating === "hard" ? (c.forgotCount || 0) + 1 : (c.forgotCount || 0),
        };
      }
      return c;
    });

    setCards(updatedCards);
    setIsFlipped(false);

    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }

    try {
      await extensionBridge.saveFlashcards(updatedCards);
    } catch (err) {
      console.error("Save flashcards rating failed:", err);
    }
  };

  const handleSyncWorkspace = async () => {
    setIsSyncing(true);
    try {
      const res = await extensionBridge.generateFlashcards();
      if (res.flashcards) {
        setCards(res.flashcards);
      }
      setIsSyncing(false);
    } catch (err) {
      setIsSyncing(false);
      alert("Failed to sync flashcards: " + err.message);
    }
  };

  const handleDeleteCard = async (id) => {
    if (!confirm("Delete this flash note?")) return;
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    if (currentIndex >= updated.length && updated.length > 0) {
      setCurrentIndex(updated.length - 1);
    }
    try {
      await extensionBridge.saveFlashcards(updated);
    } catch (err) {
      console.error("Delete flashcard failed:", err);
    }
  };

  const masteredCount = cards.filter((c) => c.recallState === "easy").length;
  const learningCount = cards.filter((c) => c.recallState === "good" || c.recallState === "hard").length;
  const unreviewedCount = cards.filter((c) => !c.recallState || c.recallState === "unreviewed").length;

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
            color: "var(--blue)",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "6px",
          }}>
            <BookOpen size={14} />
            <span>Active Recall Studio</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>
            Flash Notes & Spaced Review
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
            Self-paced active recall cards generated automatically from your reading highlights and structured notes.
          </p>
        </div>

        <button
          onClick={handleSyncWorkspace}
          disabled={isSyncing}
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
          <RefreshCw size={13} className={isSyncing ? "pulse" : ""} />
          <span>{isSyncing ? "Scanning Notes..." : "Auto-Generate Flashcards"}</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div style={{
        maxWidth: "1000px",
        width: "100%",
        margin: "0 auto 24px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
      }}>
        <button
          onClick={() => setFilterState("all")}
          style={{
            background: filterState === "all" ? "var(--surface-active)" : "var(--surface)",
            border: `1px solid ${filterState === "all" ? "var(--border-focus)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            padding: "14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{cards.length}</div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", marginTop: "2px" }}>Total Cards</div>
        </button>

        <button
          onClick={() => setFilterState("unreviewed")}
          style={{
            background: filterState === "unreviewed" ? "var(--surface-active)" : "var(--surface)",
            border: `1px solid ${filterState === "unreviewed" ? "var(--border-focus)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            padding: "14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--amber-light)" }}>{unreviewedCount}</div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", marginTop: "2px" }}>Unreviewed</div>
        </button>

        <button
          onClick={() => setFilterState("learning")}
          style={{
            background: filterState === "learning" ? "var(--surface-active)" : "var(--surface)",
            border: `1px solid ${filterState === "learning" ? "var(--border-focus)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            padding: "14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--blue)" }}>{learningCount}</div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", marginTop: "2px" }}>In Progress</div>
        </button>

        <button
          onClick={() => setFilterState("mastered")}
          style={{
            background: filterState === "mastered" ? "var(--surface-active)" : "var(--surface)",
            border: `1px solid ${filterState === "mastered" ? "var(--border-focus)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            padding: "14px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--green-light)" }}>{masteredCount}</div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", marginTop: "2px" }}>Mastered</div>
        </button>
      </div>

      {/* Main Study Flipper Area */}
      <div style={{ maxWidth: "720px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
        {currentCard ? (
          <div>
            {/* Card Counter & Progress */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", fontSize: "12px", color: "var(--text-secondary)" }}>
              <span>Card {currentIndex + 1} of {filteredCards.length}</span>
              <span style={{ textTransform: "capitalize", color: "var(--blue)" }}>
                Source: {currentCard.nodeTitle}
              </span>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={handleFlip}
              style={{
                perspective: "1000px",
                cursor: "pointer",
                minHeight: "280px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  minHeight: "280px",
                  background: "var(--surface)",
                  border: `2px solid ${isFlipped ? "var(--blue)" : "var(--border-strong)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "36px 32px",
                  boxShadow: "var(--shadow-modal)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                }}
              >
                {/* Front / Back Label */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: isFlipped ? "var(--green-light)" : "var(--amber-light)",
                  }}>
                    {isFlipped ? "Answer / Back" : "Prompt / Front"}
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                    Click to flip
                  </span>
                </div>

                {/* Card Content */}
                <div style={{ margin: "20px 0", textAlign: "center" }}>
                  <p style={{
                    fontSize: isFlipped ? "15px" : "18px",
                    fontWeight: isFlipped ? 400 : 600,
                    lineHeight: "1.7",
                    color: "var(--text-primary)",
                    whiteSpace: "pre-wrap",
                  }}>
                    {isFlipped ? currentCard.back : currentCard.front}
                  </p>
                </div>

                {/* Card Footer Hint */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)" }}>
                  <span>{currentCard.nodeDomain}</span>
                  <span>{isFlipped ? "Rate your recall below" : "Reveal answer"}</span>
                </div>
              </div>
            </div>

            {/* Rating Action Buttons (Shown when flipped) */}
            {isFlipped ? (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginTop: "16px",
              }}>
                <button
                  onClick={() => handleRateRecall("hard")}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(244, 63, 94, 0.1)",
                    border: "1px solid var(--danger)",
                    color: "var(--danger-light)",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  Hard / Again
                </button>

                <button
                  onClick={() => handleRateRecall("good")}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(56, 189, 248, 0.1)",
                    border: "1px solid var(--blue)",
                    color: "var(--blue)",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  Good / Recalled
                </button>

                <button
                  onClick={() => handleRateRecall("easy")}
                  style={{
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid var(--green)",
                    color: "var(--green-light)",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  Easy / Mastered
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCards.length - 1));
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                  }}
                >
                  <ArrowLeft size={13} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleFlip}
                  style={{
                    padding: "8px 24px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface-raised)",
                    border: "1px solid var(--border-strong)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--blue)",
                  }}
                >
                  Flip Card (Space)
                </button>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0));
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    fontSize: "12px",
                  }}
                >
                  <span>Next</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 24px",
            textAlign: "center",
          }}>
            <BookOpen size={32} color="var(--text-dim)" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
              No Flashcards in this Category
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto 20px", lineHeight: "1.6" }}>
              Click <strong>"Auto-Generate Flashcards"</strong> to synthesize active recall question cards from your saved passages and reading notes.
            </p>
            <button
              onClick={handleSyncWorkspace}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-sm)",
                background: "var(--blue-bright)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              Generate Cards Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
