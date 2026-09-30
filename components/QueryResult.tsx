"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Code2,
  Download,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Database,
  Layers,
  Clock,
  Sparkles,
} from "lucide-react";
import DynamicVisualization from "./Visualizations";
import {
  executeQuery,
  QueryExecutionResult,
  QueryFilter,
} from "../services/queryEngine";

interface QueryResultProps {
  question: string;
  onSelectSuggestion?: (query: string) => void;
}

export default function QueryResult({ question, onSelectSuggestion }: QueryResultProps) {
  const [sqlOpen, setSqlOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<QueryFilter>({
    timeRange: "This Month",
  });

  // Table sorting & pagination
  const [sortCol, setSortCol] = useState<string>("");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [tableSearch, setTableSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  // Reset pagination on question change
  useEffect(() => {
    setCurrentPage(1);
    setTableSearch("");
  }, [question]);

  // Execute query engine with active filters
  const result: QueryExecutionResult = useMemo(() => {
    return executeQuery(question, activeFilters);
  }, [question, activeFilters]);

  // Filtered & Sorted Table Rows
  const processedRows = useMemo(() => {
    let rows = [...result.rows];

    // Search filter
    if (tableSearch.trim()) {
      const term = tableSearch.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((val) => String(val).toLowerCase().includes(term))
      );
    }

    // Column sort
    if (sortCol) {
      rows.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];

        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA;
        }

        const strA = String(valA || "").replace(/[₹,%L\sCr]/g, "");
        const strB = String(valB || "").replace(/[₹,%L\sCr]/g, "");
        const numA = parseFloat(strA);
        const numB = parseFloat(strB);

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortAsc ? numA - numB : numB - numA;
        }

        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return rows;
  }, [result.rows, sortCol, sortAsc, tableSearch]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / rowsPerPage));
  const paginatedRows = processedRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (key: string) => {
    if (sortCol === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(key);
      setSortAsc(true);
    }
  };

  const handleTimeRangeChange = (range: "This Month" | "Last Month" | "This Quarter" | "All Time") => {
    setCurrentPage(1);
    setActiveFilters((prev) => ({
      ...prev,
      timeRange: range,
    }));
    setTimeDropdownOpen(false);
  };

  return (
    <div className="cognira-workspace-result">
      {/* 1. QUERY RESULT HEADER */}
      <div className="query-result-header">
        <div className="header-meta-group">
          <span className="query-eyebrow">QUERY RESULT</span>
          <h1 className="query-main-title">{result.resolvedIntent || "Vehicle Sales by Region"}</h1>
          <p className="query-subtitle">
            Results for: <span>{question}</span>
          </p>
        </div>

        <div className="query-header-actions">
          {/* [ This Month ] Dropdown Filter */}
          <div className="time-filter-dropdown-wrapper">
            <button
              type="button"
              className="header-action-btn time-filter-btn"
              onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
              title="Change date filter"
              aria-haspopup="true"
              aria-expanded={timeDropdownOpen}
            >
              <Calendar size={13} />
              <span>{activeFilters.timeRange || "This Month"}</span>
              <ChevronDown size={12} className={timeDropdownOpen ? "rotate-180" : ""} />
            </button>
            {timeDropdownOpen && (
              <div className="time-filter-menu" role="menu">
                {(["This Month", "Last Month", "This Quarter", "All Time"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    role="menuitem"
                    className={`time-filter-option ${(activeFilters.timeRange || "This Month") === range ? "is-selected" : ""}`}
                    onClick={() => handleTimeRangeChange(range)}
                  >
                    <span>{range}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* [ Export CSV ] */}
          <button
            type="button"
            className="header-action-btn"
            onClick={() => downloadCSV(result)}
            title="Export currently displayed result to CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          {/* [ View SQL ] */}
          <button
            type="button"
            className="header-action-btn header-action-sql"
            onClick={() => setSqlOpen(true)}
            title="Inspect generated query logic and SQL"
          >
            <Code2 size={13} />
            <span>View SQL</span>
          </button>
        </div>
      </div>

      {/* Out of Domain Fallback State */}
      {result.isOutOfDomain ? (
        <section className="data-unavailable out-of-domain-box" role="status">
          <div className="out-of-domain-header">
            <strong>{result.naturalLanguageAnswer}</strong>
            <p>
              I don&apos;t have enough data to answer that question. You can explore the Aurion Motors database using the suggested queries below:
            </p>
          </div>

          <div className="suggested-queries-box">
            <span className="suggested-label">TRY ASKING:</span>
            <div className="suggested-pill-grid">
              {result.suggestions?.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="suggested-chip"
                  onClick={() => onSelectSuggestion && onSelectSuggestion(item)}
                >
                  <Sparkles size={13} />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* 2. KPI SUMMARY (THREE COMPACT CARDS) */}
          {result.kpis && result.kpis.length > 0 && (
            <div className="kpi-section">
              {result.kpis.slice(0, 3).map((kpi, idx) => {
                const subtext = kpi.subtext || "";
                const isPos = subtext.includes("↑") || subtext.startsWith("+");
                const isNeg = subtext.includes("↓") || subtext.startsWith("-");

                return (
                  <div key={idx} className="kpi-card-pure">
                    <span className="kpi-card-label">{kpi.label}</span>
                    <div className="kpi-card-metric">{kpi.value}</div>
                    {subtext && (
                      <div className="kpi-card-subtext">
                        {isPos ? (
                          <span className="kpi-trend-pos">{subtext}</span>
                        ) : isNeg ? (
                          <span className="kpi-trend-neg">{subtext}</span>
                        ) : (
                          <span className="kpi-meta-text">{subtext}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. MAIN VISUALIZATION (ONE PRIMARY CHART) */}
          {result.visualizationType !== "table-only" && result.chartData.length > 0 && (
            <section className="main-chart-card">
              <div className="chart-header-row">
                <div className="chart-title-group">
                  <h2 className="chart-title">{result.chartTitle}</h2>
                  {result.chartSubtitle && (
                    <span className="chart-subtitle">{result.chartSubtitle}</span>
                  )}
                </div>
                <span className="chart-type-tag">
                  {result.visualizationType.toUpperCase().replace("-", " ")}
                </span>
              </div>

              <div className="chart-canvas-area">
                <DynamicVisualization type={result.visualizationType} data={result.chartData} />
              </div>
            </section>
          )}

          {/* 4. REGIONAL PERFORMANCE + COGNIRA INSIGHT (SIDE BY SIDE) */}
          <div className="data-and-insight-layout">
            {/* Left: Regional Performance Data Table */}
            <section className="performance-table-card">
              <div className="table-header-row">
                <div className="table-title-group">
                  <h3>{result.tableTitle || "Regional Performance"}</h3>
                  <span className="table-count-badge">
                    {processedRows.length} {processedRows.length === 1 ? "Record" : "Records"}
                  </span>
                </div>

                {result.rows.length > 5 && (
                  <div className="table-search-field">
                    <Search size={13} />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => {
                        setTableSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Filter rows..."
                      aria-label="Filter rows"
                    />
                    {tableSearch && (
                      <button
                        type="button"
                        className="table-search-clear"
                        onClick={() => setTableSearch("")}
                        aria-label="Clear filter"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="table-wrapper">
                <table className="pure-black-table">
                  <thead>
                    <tr>
                      {result.columns.map((col) => (
                        <th key={col.key}>
                          {col.sortable !== false ? (
                            <button
                              type="button"
                              className="th-sort-button"
                              onClick={() => handleSort(col.key)}
                            >
                              <span>{col.label}</span>
                              {sortCol === col.key && (
                                <span className="sort-arrow">{sortAsc ? " ↑" : " ↓"}</span>
                              )}
                            </button>
                          ) : (
                            <span>{col.label}</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRows.length > 0 ? (
                      paginatedRows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {result.columns.map((col) => {
                            const val = row[col.key];

                            // Subtle progress indicator for % of Total
                            if (col.key === "share_pct" || col.type === "percentage") {
                              const numPct = parseFloat(String(val).replace("%", ""));
                              return (
                                <td key={col.key} className="cell-share">
                                  <div className="share-cell-wrap">
                                    <span className="share-value">{val}</span>
                                    <div className="share-bar-track">
                                      <div
                                        className="share-bar-fill"
                                        style={{ width: `${Math.min(100, isNaN(numPct) ? 0 : numPct)}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              );
                            }

                            // Trend badge: positive green/cyan, negative red
                            if (col.key === "trend" || col.type === "badge") {
                              const str = String(val || "");
                              const isPos = str.includes("↑") || str.startsWith("+");
                              const isNeg = str.includes("↓") || str.startsWith("-");
                              return (
                                <td key={col.key}>
                                  <span
                                    className={`trend-badge ${
                                      isPos ? "trend-badge-pos" : isNeg ? "trend-badge-neg" : "trend-badge-neutral"
                                    }`}
                                  >
                                    {val}
                                  </span>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={col.key}
                                className={col.type === "currency" ? "cell-tabular" : ""}
                              >
                                {val !== undefined && val !== null ? String(val) : "—"}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={result.columns.length} className="table-empty-cell">
                          No matching records.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination */}
              {totalPages > 1 && (
                <div className="table-pagination-pure">
                  <span className="pagination-text">
                    Showing {(currentPage - 1) * rowsPerPage + 1}–
                    {Math.min(currentPage * rowsPerPage, processedRows.length)} of {processedRows.length}
                  </span>
                  <div className="pagination-btns">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={13} />
                      <span>Prev</span>
                    </button>
                    <span className="page-indicator">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <span>Next</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Right: Compact Cognira Insight Panel */}
            <aside className="cognira-insight-panel">
              <div className="insight-panel-header">
                <div className="insight-title-group">
                  <span className="insight-sparkle">✦</span>
                  <h4 className="insight-title">COGNIRA INSIGHT</h4>
                </div>
                <span className="insight-sublabel">Based on current data</span>
              </div>

              <p className="insight-narrative">
                {result.naturalLanguageAnswer || result.cogniraInsight}
              </p>

              <div className="takeaways-block">
                <div className="takeaways-header">Key Takeaways</div>
                <ul className="takeaways-list">
                  {(result.keyTakeaways && result.keyTakeaways.length > 0
                    ? result.keyTakeaways
                    : [
                        "South leads with 12.4% month-on-month growth",
                        "West shows strong performance with 9.8% growth",
                        "East is the only region with a slight decline",
                        "Average transaction value is highest in North",
                      ]
                  ).map((point, pIdx) => (
                    <li key={pIdx} className="takeaway-item">
                      <span className="takeaway-bullet">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </>
      )}

      {/* VIEW SQL & LOGIC MODAL */}
      {sqlOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSqlOpen(false);
          }}
        >
          <section className="sql-modal" role="dialog" aria-modal="true" aria-labelledby="sql-modal-title">
            <div className="sql-modal-header">
              <div>
                <span className="query-eyebrow">QUERY EXECUTION DETAILS</span>
                <h3 id="sql-modal-title">Query Logic &amp; ANSI SQL Equivalent</h3>
              </div>
              <button
                className="workspace-icon-button"
                type="button"
                aria-label="Close query details"
                onClick={() => setSqlOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Execution Telemetry */}
            <div className="sql-telemetry-grid">
              <div className="telemetry-pill">
                <Database size={13} />
                <span>Records Scanned: <strong>{result.recordsAnalyzed}</strong></span>
              </div>
              <div className="telemetry-pill">
                <Clock size={13} />
                <span>Latency: <strong>{result.executionTimeMs} ms</strong></span>
              </div>
              <div className="telemetry-pill">
                <Layers size={13} />
                <span>Engine: <strong>Aurion OLAP In-Memory</strong></span>
              </div>
            </div>

            {/* SQL Block */}
            <div className="sql-code-container">
              <span className="code-label">ANSI SQL EQUIVALENT:</span>
              <pre>
                <code>{result.sqlQuery}</code>
              </pre>
            </div>

            {/* Processing Pipeline */}
            <div className="sql-code-container pipeline-box">
              <span className="code-label">IN-MEMORY PROCESSING PIPELINE:</span>
              <pre>
                <code>{result.processingPipeline}</code>
              </pre>
            </div>

            <p className="sql-modal-footnote">
              Data is calculated deterministically against the Aurion Motors relational database. All entity foreign keys (customer, vehicle, dealership, salesperson) remain synchronized across tables.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// REAL CSV EXPORT UTILITY
// -------------------------------------------------------------
function downloadCSV(result: QueryExecutionResult) {
  if (!result.rows || result.rows.length === 0) return;

  const headers = result.columns.map((c) => c.label);
  const keys = result.columns.map((c) => c.key);

  const lines = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ...result.rows.map((row) =>
      keys.map((k) => `"${String(row[k] !== undefined ? row[k] : "").replace(/"/g, '""')}"`).join(",")
    ),
  ];

  const csvContent = lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `aurion_${result.resolvedIntent.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
