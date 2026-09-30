export type QueryHistoryEntry = {
  id: string;
  query: string;
  createdAt: string;
  resultType: string;
};

export type SearchDestination = {
  label: string;
  description: string;
  href: string;
  keywords: string[];
};

const historyKey = "cognira_query_history";

export const demoRegionalSalesRows = [
  { region: "South", sold: 4820, trend: 14.2 },
  { region: "West", sold: 3910, trend: 9.8 },
  { region: "North", sold: 2850, trend: 6.4 },
  { region: "East", sold: 1420, trend: -2.1 },
  { region: "Central", sold: 482, trend: 1.8 },
] as const;

export const searchDestinations: SearchDestination[] = [
  { label: "Ask Cognira", description: "Ask a business question", href: "/app", keywords: ["ask", "query", "assistant", "workspace"] },
  { label: "Query history", description: "Reopen previous questions", href: "/app/history", keywords: ["history", "previous", "recent"] },
  { label: "Business reports", description: "Review and export reports", href: "/app/reports", keywords: ["reports", "report", "export"] },
  { label: "Analytics", description: "Explore business metrics", href: "/app/analytics", keywords: ["analytics", "chart", "sales", "trend"] },
  { label: "Administration", description: "Manage workspace access", href: "/app/admin", keywords: ["admin", "users", "roles", "permissions"] },
  { label: "Profile", description: "View your account", href: "/app/profile", keywords: ["profile", "account", "employee"] },
  { label: "Settings", description: "Manage workspace preferences", href: "/app/settings", keywords: ["settings", "preferences"] },
];

export function readQueryHistory(): QueryHistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(historyKey) || "[]");
    return Array.isArray(value)
      ? value.filter((entry): entry is QueryHistoryEntry =>
          typeof entry?.id === "string" &&
          typeof entry?.query === "string" &&
          typeof entry?.createdAt === "string" &&
          typeof entry?.resultType === "string",
        )
      : [];
  } catch {
    return [];
  }
}

export function saveQueryToHistory(query: string, resultType = "Sales"): QueryHistoryEntry[] {
  if (typeof window === "undefined") return [];

  const entry: QueryHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    query,
    createdAt: new Date().toISOString(),
    resultType,
  };
  const history = [entry, ...readQueryHistory()].slice(0, 100);
  window.localStorage.setItem(historyKey, JSON.stringify(history));
  window.dispatchEvent(new CustomEvent("cognira:history-updated"));
  return history;
}

export function deleteQueryFromHistory(id: string): QueryHistoryEntry[] {
  if (typeof window === "undefined") return [];
  const history = readQueryHistory().filter((entry) => entry.id !== id);
  window.localStorage.setItem(historyKey, JSON.stringify(history));
  window.dispatchEvent(new CustomEvent("cognira:history-updated"));
  return history;
}

export function clearQueryHistory(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(historyKey);
  window.dispatchEvent(new CustomEvent("cognira:history-updated"));
}

export function searchApplication(query: string): SearchDestination[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return searchDestinations.filter((destination) =>
    [destination.label, destination.description, ...destination.keywords]
      .some((value) => value.toLowerCase().includes(normalized)),
  );
}
