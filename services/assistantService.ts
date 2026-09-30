export type AssistantAction = {
  label: string;
  href?: string;
  query?: string;
  onClick?: () => void;
};

export type AssistantReply = {
  text: string;
  actions?: AssistantAction[];
};

export type AssistantContext = {
  pathname: string;
  section: string;
  role: string;
  query: string;
  resultAvailable: boolean;
};

export const assistantExamples = [
  { label: "Regional Sales", query: "Which region sold the most vehicles?" },
  { label: "Best Model", query: "Which model is performing best?" },
  { label: "South vs West", query: "Compare sales between South and West." },
  { label: "Aged Inventory", query: "Which vehicles have been in inventory for more than 60 days?" },
  { label: "Dealer Quotas", query: "Which dealerships are below target?" },
  { label: "Financials", query: "Show revenue versus expenses." },
];

export function getAssistantContext(
  pathname: string,
  role = "Employee",
  query = "",
  resultAvailable = false,
): AssistantContext {
  const path = pathname || "/app";
  const sectionMap: Record<string, string> = {
    "/app": "Ask",
    "/app/history": "History",
    "/app/reports": "Reports",
    "/app/analytics": "Analytics",
    "/app/admin": "Administration",
    "/app/profile": "Profile",
    "/app/settings": "Settings",
  };

  return {
    pathname: path,
    section: sectionMap[path] || "Workspace",
    role,
    query,
    resultAvailable,
  };
}

export function getWelcomeReply(context: AssistantContext): AssistantReply {
  return {
    text: `Hi, I'm COGNIRA Assistant.\nI can help you understand your workspace, explore business insights, and get more from COGNIRA.`,
    actions: [
      { label: "Help Me Ask" },
      { label: "Explain This" },
      { label: "Show Me Around" },
    ],
  };
}

export function getQuickActionReply(action: string, context: AssistantContext): AssistantReply {
  switch (action) {
    case "help":
      return {
        text: `Sure. What would you like to know about AURION MOTORS?`,
        actions: assistantExamples.map((example) => ({
          label: example.label,
          query: example.query,
        })),
      };
    case "tour":
      return {
        text: "I can give you a quick tour of COGNIRA.",
        actions: [
          { label: "Start Tour" },
          { label: "Open History", href: "/app/history" },
          { label: "Open Reports", href: "/app/reports" },
        ],
      };
    case "explain":
      return getContextualExplainReply(context);
    default:
      return {
        text: "I can help you understand the workspace, explain results, or guide you to the right section.",
      };
  }
}

export function getContextualExplainReply(context: AssistantContext): AssistantReply {
  if (context.pathname === "/app" && !context.resultAvailable) {
    return {
      text: "There isn't a result to explain yet. Ask COGNIRA a business question first, and I can help explain the result.",
    };
  }

  if (context.pathname === "/app/history") {
    return {
      text: "This page contains your previous COGNIRA questions, saved results, and the recent signal from the workspace so you can quickly revisit earlier analysis.",
      actions: [{ label: "Open History", href: "/app/history" }],
    };
  }

  if (context.pathname === "/app/admin") {
    return {
      text: "This is the Administration area. You can review permissions, user access, controls, and governance settings for the business workspace.",
    };
  }

  if (context.pathname === "/app/reports") {
    return {
      text: "This report view is built for summarizing business performance. You can review the current output, export it, and use it for operational decisions.",
      actions: [{ label: "Export Result", href: "/app/reports" }],
    };
  }

  if (context.pathname === "/app/analytics") {
    return {
      text: "Analytics currently displays the built-in sample sales snapshot. Live data trends and business explanations require a connected query service.",
      actions: [{ label: "Open Analytics", href: "/app/analytics" }],
    };
  }

  if (context.pathname === "/app") {
    return {
      text: "In the built-in sample snapshot, South has the highest displayed vehicle sales, followed by West. These figures are demo data, not a live business result.",
    };
  }

  return {
    text: `Looks like you're viewing ${context.section}. I can help you understand the page, explain the current signals, or guide you to the next step.`,
  };
}

export function getNavigationReply(target: string, label: string): AssistantReply {
  const routeMap: Record<string, string> = {
    history: "History is in the left sidebar. I can open it for you.",
    analytics: "Analytics is available from the workspace navigation. I can open it for you.",
    reports: "Reports is available from the left sidebar. I can open it for you.",
    administration: "Administration is in the sidebar under the controls area. I can open it for you.",
    settings: "Settings is in the sidebar. I can open it for you.",
  };

  const hrefMap: Record<string, string> = {
    history: "/app/history",
    analytics: "/app/analytics",
    reports: "/app/reports",
    administration: "/app/admin",
    settings: "/app/settings",
  };

  return {
    text: routeMap[target] || `Sure. Opening ${label}.`,
    actions: [{ label: `Open ${label}`, href: hrefMap[target] || "/app" }],
  };
}

export function getDefaultAssistantReply(rawMessage: string, context: AssistantContext): AssistantReply {
  const lower = rawMessage.toLowerCase();

  if (lower.includes("history") || lower.includes("previous queries") || lower.includes("previous questions")) {
    return getNavigationReply("history", "History");
  }

  if (lower.includes("analytics") || lower.includes("chart") || lower.includes("trend")) {
    return getNavigationReply("analytics", "Analytics");
  }

  if (lower.includes("reports") || lower.includes("export") || lower.includes("download")) {
    return getNavigationReply("reports", "Reports");
  }

  if (lower.includes("what can i ask") || lower.includes("what should i ask")) {
    return {
      text: "You can ask about sales, production, inventory, dealerships, service operations, and regional performance. For example: “Show vehicle sales by region this month.”",
      actions: assistantExamples.slice(0, 3).map((example) => ({
        label: example.label,
        query: example.query,
      })),
    };
  }

  if (lower.includes("how do i use this") || lower.includes("show me around") || lower.includes("tour")) {
    return {
      text: "I can show you around COGNIRA. The main flow is simple: ask a business question, review the result, and use the insight to guide the next step.",
      actions: [
        { label: "Start Tour" },
        { label: "Open History", href: "/app/history" },
        { label: "Open Reports", href: "/app/reports" },
      ],
    };
  }

  if (lower.includes("where is") || lower.includes("take me to") || lower.includes("open ")) {
    const target = lower.includes("history")
      ? "history"
      : lower.includes("analytics")
        ? "analytics"
        : lower.includes("report")
          ? "reports"
          : lower.includes("admin")
            ? "administration"
            : lower.includes("settings")
              ? "settings"
              : "history";

    return getNavigationReply(target, target === "history" ? "History" : target === "analytics" ? "Analytics" : target === "reports" ? "Reports" : target === "administration" ? "Administration" : "Settings");
  }

  return {
    text: `You can ask about sales, production, inventory, dealerships, or service performance. For example: “Show vehicle sales by region this month.”`,
    actions: [{ label: "Help Me Ask" }, { label: "Explain This" }],
  };
}
