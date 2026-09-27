"use client";

import React, { useState } from "react";
import { extensionBridge } from "../../lib/extensionBridge";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Zap,
  Award,
} from "lucide-react";

export default function QuizModeView({ activeSession }) {
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [providerUsed, setProviderUsed] = useState("");

  const handleStartQuiz = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    setQuestions([]);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);

    try {
      const res = await extensionBridge.generateQuiz(questionCount);
      if (res && Array.isArray(res.questions) && res.questions.length > 0) {
        setQuestions(res.questions);
        setProviderUsed(res.provider || "AI");
        setIsGenerating(false);
      } else {
        throw new Error("No quiz questions were returned by the AI provider.");
      }
    } catch (err) {
      setIsGenerating(false);
      setErrorMsg(err.message || "Failed to generate AI quiz.");
    }
  };

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const currentQ = questions[currentIdx];
    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const currentQ = questions[currentIdx];

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
        maxWidth: "800px",
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
            <span>AI Active Recall Mode</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--text-primary)" }}>
            Intelligence Knowledge Quiz
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
            Test your comprehension of research discoveries with AI-generated multiple-choice challenges.
          </p>
        </div>

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
          <span>API Key Kept In Local Extension</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto" }}>
        {/* Intro State / Launcher */}
        {questions.length === 0 && !isGenerating && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 40px",
            textAlign: "center",
            boxShadow: "var(--shadow-lg)",
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(3, 105, 161, 0.3))",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <HelpCircle size={28} color="var(--blue)" />
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Ready to Test Your Research Retention?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", maxWidth: "480px", margin: "0 auto 28px", lineHeight: "1.6" }}>
              Our AI engine analyzes all tracked webpage nodes, structured notes, and Memory Palace passages in <strong>"{activeSession?.name || 'this workspace'}"</strong> to create tailored active recall questions.
            </p>

            {errorMsg && (
              <div style={{
                background: "rgba(244, 63, 94, 0.1)",
                border: "1px solid var(--danger)",
                color: "var(--danger-light)",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                marginBottom: "20px",
                textAlign: "left",
              }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: "inline-flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Questions:</span>
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: questionCount === num ? "var(--surface-active)" : "var(--surface-raised)",
                    border: `1px solid ${questionCount === num ? "var(--border-focus)" : "var(--border)"}`,
                    color: questionCount === num ? "var(--blue)" : "var(--text-secondary)",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                >
                  {num} Questions
                </button>
              ))}
            </div>

            <div>
              <button
                onClick={handleStartQuiz}
                style={{
                  padding: "12px 32px",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--blue-bright)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 0 16px var(--blue-glow)",
                }}
              >
                <Sparkles size={16} />
                <span>Generate Active Recall Quiz</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
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
              Synthesizing Active Recall Quiz...
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Request is executing securely inside the Chrome Extension background service worker.
            </p>
          </div>
        )}

        {/* Interactive Quiz Runner */}
        {questions.length > 0 && !isFinished && currentQ && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "36px 40px",
            boxShadow: "var(--shadow-lg)",
          }}>
            {/* Quiz Progress Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--blue)", textTransform: "uppercase" }}>
                Question {currentIdx + 1} of {questions.length}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Score: <strong style={{ color: "var(--green-light)" }}>{score}</strong> / {currentIdx}
                </span>
                <span style={{ fontSize: "10px", background: "var(--surface-raised)", padding: "2px 6px", borderRadius: "4px", color: "var(--text-dim)", textTransform: "uppercase" }}>
                  {providerUsed}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", lineHeight: "1.5", marginBottom: "24px" }}>
              {currentQ.question}
            </h2>

            {/* Options List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {(currentQ.options || []).map((opt, i) => {
                let btnBackground = "var(--surface-solid)";
                let btnBorder = "var(--border)";
                let btnColor = "var(--text-primary)";

                if (isAnswered) {
                  if (i === currentQ.correctIndex) {
                    btnBackground = "rgba(16, 185, 129, 0.12)";
                    btnBorder = "var(--green)";
                    btnColor = "var(--green-light)";
                  } else if (i === selectedOption) {
                    btnBackground = "rgba(244, 63, 94, 0.12)";
                    btnBorder = "var(--danger)";
                    btnColor = "var(--danger-light)";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(i)}
                    disabled={isAnswered}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "14px 18px",
                      borderRadius: "var(--radius-sm)",
                      background: btnBackground,
                      border: `1px solid ${btnBorder}`,
                      color: btnColor,
                      fontSize: "13px",
                      lineHeight: "1.5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: isAnswered ? "default" : "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{opt}</span>
                    {isAnswered && i === currentQ.correctIndex && (
                      <CheckCircle2 size={16} color="var(--green)" />
                    )}
                    {isAnswered && i === selectedOption && i !== currentQ.correctIndex && (
                      <XCircle size={16} color="var(--danger)" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {isAnswered && (
              <div style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "16px",
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: selectedOption === currentQ.correctIndex ? "var(--green-light)" : "var(--amber-light)" }}>
                  {selectedOption === currentQ.correctIndex ? "Correct Answer!" : "Incorrect"}
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {isAnswered && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleNext}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--blue-bright)",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>{currentIdx < questions.length - 1 ? "Next Question" : "View Final Results"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Finished / Summary Card */}
        {isFinished && (
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "48px 40px",
            textAlign: "center",
            boxShadow: "var(--shadow-lg)",
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-md)",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Award size={28} color="var(--green-light)" />
            </div>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              Active Recall Quiz Completed!
            </h2>
            <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--blue)", margin: "16px 0" }}>
              {Math.round((score / questions.length) * 100)}%
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "28px" }}>
              You answered <strong>{score}</strong> out of <strong>{questions.length}</strong> questions correctly.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button
                onClick={handleStartQuiz}
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
                <RotateCcw size={14} />
                <span>Retry Quiz</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
