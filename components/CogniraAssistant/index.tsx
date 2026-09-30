"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUp,
  Minus,
  Mic,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getAssistantContext,
  getDefaultAssistantReply,
  getQuickActionReply,
  getWelcomeReply,
  type AssistantAction,
  type AssistantContext,
} from "../../services/assistantService";

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  actions?: AssistantAction[];
};

type AssistantState = "idle" | "typing" | "listening" | "responding";

export default function CogniraAssistant() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [tourActive, setTourActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: 1,
    role: "assistant",
    text: "Hi, I'm COGNIRA Assistant.\nI can help you understand your workspace, explore business insights, and get more from COGNIRA.",
  }, {
    id: 2,
    role: "assistant",
    text: "How can I help?",
    actions: [
      { label: "Help Me Ask" },
      { label: "Explain This" },
      { label: "Show Me Around" },
    ],
  }]);
  const [role, setRole] = useState("Employee");
  const [resultAvailable, setResultAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("cognira_user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setRole(parsed?.role || "Employee");
      } catch {
        setRole("Employee");
      }
    }

    const syncResultState = () => {
      const hasResult = Boolean(document.querySelector(".result-card"));
      setResultAvailable(hasResult);
    };

    syncResultState();
    const observer = new MutationObserver(syncResultState);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const context = useMemo<AssistantContext>(
    () => getAssistantContext(pathname, role, "", resultAvailable),
    [pathname, role, resultAvailable],
  );

  const handleQuickAction = (action: string) => {
    const reply = getQuickActionReply(action, context);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        role: "assistant",
        text: reply.text,
        actions: reply.actions,
      },
    ]);

    if (action === "help") {
      setAssistantState("idle");
      return;
    }

    if (action === "tour") {
      setAssistantState("responding");
      window.setTimeout(() => setAssistantState("idle"), 500);
      return;
    }

    if (action === "explain") {
      setAssistantState("responding");
      window.setTimeout(() => setAssistantState("idle"), 500);
    }
  };

  const sendQueryToAsk = (query: string) => {
    if (pathname === "/app") {
      window.dispatchEvent(new CustomEvent("cognira:assistant-query", { detail: { query } }));
      return;
    }

    window.localStorage.setItem("cognira_pending_query", query);
    router.push("/app");
    setIsOpen(false);
  };

  const sendMessage = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const nextUserMessage: Message = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, nextUserMessage]);
    setInput("");
    const lowerMessage = trimmed.toLowerCase();
    const isHelpRequest = lowerMessage.includes("what can i ask") || lowerMessage.includes("what should i ask");
    const isBusinessQuestion = !isHelpRequest && /\b(sales?|production|inventory|dealerships?|service|vehicles?|models?|regions?|growth|outperform|compare)\b/i.test(trimmed);
    const reply = isBusinessQuestion
      ? (sendQueryToAsk(trimmed), {
          text: `Executing "${trimmed}" against the Aurion Motors enterprise database. Results are updating in the main workspace.`,
        })
      : getDefaultAssistantReply(trimmed, context);
    setMessages((prev) => [...prev, {
      id: Date.now() + 1,
      role: "assistant",
      text: reply.text,
      actions: reply.actions,
    }]);
    setAssistantState("idle");
  };

  const handleSubmit = () => {
    sendMessage(input);
  };

  const startListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setAssistantState("idle");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setAssistantState("listening");
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) setInput(transcript);
    };
    recognition.onerror = () => setAssistantState("idle");
    recognition.onend = () => setAssistantState("idle");
    recognitionRef.current = recognition;
    recognition.start();
  };

  const triggerTour = () => {
    setTourActive(true);
    const elements = document.querySelectorAll(".workspace-topbar, .side-nav a.active, .workspace .ask-center, .workspace .composer, .workspace-actions .workspace-action");
    elements.forEach((element) => element.classList.add("assistant-tour-target"));
    window.setTimeout(() => {
      elements.forEach((element) => element.classList.remove("assistant-tour-target"));
      setTourActive(false);
    }, 2200);
  };

  const handleActionClick = (action: AssistantAction) => {
    if (action.href) {
      router.push(action.href);
      setIsOpen(false);
      return;
    }

    if (action.label === "Start Tour") {
      triggerTour();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          text: "I can give you a quick tour of COGNIRA.\n1. ASK\nAsk business questions using natural language.\n2. HISTORY\nReview your previous questions and results.\n3. REPORTS\nCreate and access business reports.\n4. ANALYTICS\nExplore charts and business trends.\n5. ADMINISTRATION\nManage authorized users and system controls.",
        },
      ]);
      setAssistantState("idle");
      return;
    }

    if (action.label === "Help Me Ask") {
      handleQuickAction("help");
      return;
    }

    if (action.label === "Explain This") {
      handleQuickAction("explain");
      return;
    }

    if (action.label === "Show Me Around") {
      handleQuickAction("tour");
      return;
    }

    if (action.query) {
      sendQueryToAsk(action.query);
      return;
    }

    if (typeof action.onClick === "function") {
      action.onClick();
    }
  };

  const welcomeReply = useMemo(() => getWelcomeReply(context), [context]);

  const renderMessageActions = (actions?: AssistantAction[]) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="assistant-action-row">
        {actions.map((action, index) => {
          const label = action.label;
          const key = `${label}-${index}`;

          if (action.href) {
            return (
              <Link href={action.href} key={key} className="assistant-action-button" onClick={() => setIsOpen(false)}>
                {label}
              </Link>
            );
          }

          return (
            <button key={key} type="button" className="assistant-action-button" onClick={() => handleActionClick(action)}>
              {label}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          className="assistant-float-button"
          aria-label="Open COGNIRA Assistant"
          onClick={() => setIsOpen(true)}
        >
          <Sparkles size={24} />
        </button>
      )}

      {isOpen && (
        <div className={`assistant-panel ${isMinimized ? "is-minimized" : ""}`}>
          <div className="assistant-header">
            <div className="assistant-brand">
              <span className="assistant-mark">✦</span>
              <div>
                <strong>COGNIRA Assistant</strong>
                <small>Your intelligent workspace companion</small>
              </div>
            </div>
            <div className="assistant-header-actions">
              <button type="button" className="assistant-icon-button" aria-label="Minimize assistant" onClick={() => setIsMinimized((value) => !value)}>
                <Minus size={14} />
              </button>
              <button type="button" className="assistant-icon-button" aria-label="Close assistant" onClick={() => setIsOpen(false)}>
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="assistant-chat">
                {messages.map((msg) => (
                  <div key={msg.id} className={`assistant-message ${msg.role}`}>
                    <div className="assistant-message-bubble">
                      {msg.role === "assistant" && <span className="assistant-dot">✦</span>}
                      <span>{msg.text}</span>
                    </div>
                    {renderMessageActions(msg.actions)}
                  </div>
                ))}

                {assistantState === "typing" && (
                  <div className="assistant-thinking">
                    <span className="assistant-dot">✦</span>
                    <span>COGNIRA Assistant is thinking...</span>
                    <span className="assistant-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                )}

                {assistantState === "listening" && (
                  <div className="assistant-listening">Listening...</div>
                )}
              </div>

              <div className="assistant-composer">
                <div className="assistant-input-shell">
                  <Sparkles size={15} className="assistant-input-icon" />
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSubmit();
                      }
                    }}
                    placeholder="Ask COGNIRA Assistant..."
                    rows={1}
                  />
                  <button type="button" className="assistant-mic-button" aria-label="Voice input" onClick={startListening}>
                    <Mic size={15} />
                  </button>
                  <button type="button" className="assistant-send-button" aria-label="Send message" onClick={handleSubmit}>
                    <ArrowUp size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
