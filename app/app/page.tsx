"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Mic } from "lucide-react";
import QueryResult from "../../components/QueryResult";
import { saveQueryToHistory } from "../../services/workspaceStore";

const primarySuggestedQueries = [
  "Which region is growing fastest?",
  "Show EV sales this month",
  "Top 5 models by revenue",
  "Which dealerships are below target?",
];

const defaultQuestion = "Show vehicle sales by region this month";

export default function Workspace() {
  const [q, setQ] = useState("");
  const [submitted, setSubmitted] = useState(defaultQuestion);

  useEffect(() => {
    const onAssistantPrompt = (event: Event) => {
      const customEvent = event as CustomEvent<{ query?: string }>;
      const nextQuery = customEvent.detail?.query ?? "";
      if (nextQuery) submitQuery(nextQuery);
    };

    const pendingQuery = window.localStorage.getItem("cognira_pending_query");
    if (pendingQuery) {
      window.localStorage.removeItem("cognira_pending_query");
      submitQuery(pendingQuery);
    }

    window.addEventListener("cognira:assistant-query", onAssistantPrompt);
    return () => window.removeEventListener("cognira:assistant-query", onAssistantPrompt);
  }, []);

  const submitQuery = (value: string) => {
    const nextQuery = value.trim();
    if (!nextQuery) return;
    setQ(nextQuery);
    setSubmitted(nextQuery);
    saveQueryToHistory(nextQuery, getResultType(nextQuery));
  };

  return (
    <div className="workspace">
      <main className="workspace-content workspace-results">
        {/* 1-4. Query Result, KPIs, Chart, Table & Cognira Insight */}
        <QueryResult question={submitted} onSelectSuggestion={submitQuery} />

        {/* 5-6. Ask Cognira Command Bar & 4 Small Suggested Queries */}
        <div className="workspace-composer-block">
          <QueryComposer
            q={q}
            setQ={setQ}
            onSubmit={submitQuery}
            suggestions={primarySuggestedQueries}
          />
        </div>
      </main>
    </div>
  );
}

function QueryComposer({
  q,
  setQ,
  onSubmit,
  suggestions,
}: {
  q: string;
  setQ: (value: string) => void;
  onSubmit: (value: string) => void;
  suggestions: string[];
}) {
  const [voiceMessage, setVoiceMessage] = useState("");

  const startVoiceInput = () => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setVoiceMessage("Voice input is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) {
          setQ(transcript);
          setVoiceMessage("");
          onSubmit(transcript);
        }
      };
      recognition.onerror = () =>
        setVoiceMessage("Voice input could not start. Check microphone permission.");
      recognition.start();
      setVoiceMessage("Listening...");
    } catch {
      setVoiceMessage("Voice input error. Please type your query.");
    }
  };

  return (
    <div className="composer-container-pure">
      {/* 5. ASK COGNIRA COMMAND BAR */}
      <div className="command-bar-pure">
        <span className="command-bar-sparkle">✦</span>
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask Cognira anything about Aurion Motors..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(q);
            }
          }}
          rows={1}
          aria-label="Ask Cognira command input"
        />
        <div className="command-bar-actions">
          <button
            className="command-bar-mic"
            type="button"
            title="Voice query input"
            aria-label="Voice query input"
            onClick={startVoiceInput}
          >
            <Mic size={18} />
          </button>
          <button
            className="command-bar-send"
            type="button"
            aria-label="Submit query"
            onClick={() => onSubmit(q)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {voiceMessage && (
        <p className="composer-status" role="status">
          {voiceMessage}
        </p>
      )}

      {/* 6. SMALL SUGGESTED QUERIES (DIRECTLY BELOW COMMAND BAR) */}
      <div className="suggested-queries-bar">
        <span className="suggested-label">Try asking:</span>
        <div className="suggested-pills-list">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              className="suggested-query-pill"
              onClick={() => onSubmit(item)}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getResultType(query: string) {
  const normalized = query.toLowerCase();
  if (normalized.includes("inventory") || normalized.includes("stock")) return "Inventory";
  if (normalized.includes("dealership") || normalized.includes("dealer")) return "Dealerships";
  if (normalized.includes("service") || normalized.includes("repair")) return "Service";
  if (normalized.includes("marketing") || normalized.includes("campaign") || normalized.includes("roi")) return "Marketing";
  if (normalized.includes("finance") || normalized.includes("expense") || normalized.includes("margin")) return "Finance";
  if (normalized.includes("employee") || normalized.includes("salesperson")) return "Employees";
  if (normalized.includes("customer") || normalized.includes("csat")) return "Customers";
  if (normalized.includes("month") || normalized.includes("trend") || normalized.includes("growth")) return "Trends";
  if (normalized.includes("model")) return "Models";
  return "Sales";
}
