"use client";

import React, { useState } from "react";
import { ChartDataPoint } from "../services/queryEngine";

interface VisualizationsProps {
  type: string;
  data: ChartDataPoint[];
  title?: string;
}

export default function DynamicVisualization({ type, data }: VisualizationsProps) {
  if (!data || data.length === 0) {
    return <div className="viz-empty">No visualization data available for this query slice.</div>;
  }

  switch (type) {
    case "line":
      return <LineChartComponent data={data} />;
    case "horizontal-bar":
    case "ranking":
      return <HorizontalBarComponent data={data} />;
    case "donut":
      return <DonutChartComponent data={data} />;
    case "target-vs-actual":
      return <TargetVsActualComponent data={data} />;
    case "bar":
    default:
      return <VerticalBarComponent data={data} />;
  }
}

// -------------------------------------------------------------
// 1. VERTICAL BAR CHART
// -------------------------------------------------------------
function VerticalBarComponent({ data }: { data: ChartDataPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="viz-wrap">
      <div className="viz-grid-lines" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="viz-vertical-bars">
        {data.map((d, idx) => {
          const heightPct = Math.max(8, Math.round((d.value / maxValue) * 100));
          const isHovered = hoveredIdx === idx;
          const displayVal = d.formattedValue || (typeof d.value === "number" ? d.value.toLocaleString() : d.value);

          return (
            <div
              key={d.label}
              className={`viz-bar-col ${isHovered ? "is-hovered" : ""}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Value label directly above bar */}
              <div className="viz-bar-value-label">
                {displayVal}
              </div>

              <div className="viz-tooltip-hover">
                <strong>{displayVal}</strong>
                {d.secondaryLabel && <span>{d.secondaryLabel}</span>}
                {d.percentage !== undefined && <small>{d.percentage}% share</small>}
              </div>

              <div className="viz-bar-track">
                <div
                  className="viz-bar-fill"
                  style={{
                    height: `${heightPct}%`,
                    background: isHovered
                      ? "linear-gradient(180deg, #3be2ff 0%, #00d9ff 100%)"
                      : "linear-gradient(180deg, #00d9ff 0%, #168bff 100%)",
                    boxShadow: isHovered
                      ? "0 0 16px rgba(0, 217, 255, 0.4)"
                      : "0 0 6px rgba(0, 217, 255, 0.12)",
                  }}
                />
              </div>

              <span className="viz-col-label" title={d.label}>{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. HORIZONTAL BAR / RANKING CHART
// -------------------------------------------------------------
function HorizontalBarComponent({ data }: { data: ChartDataPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="viz-hbar-list">
      {data.map((d, idx) => {
        const widthPct = Math.max(4, Math.round((d.value / maxValue) * 100));
        const isHovered = hoveredIdx === idx;

        return (
          <div
            key={d.label}
            className={`viz-hbar-item ${isHovered ? "is-hovered" : ""}`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="viz-hbar-info">
              <span className="viz-hbar-rank">#{idx + 1}</span>
              <span className="viz-hbar-label">{d.label}</span>
              <span className="viz-hbar-value">
                {d.formattedValue || d.value}
                {d.secondaryLabel && <span className="viz-hbar-secondary">{d.secondaryLabel}</span>}
              </span>
            </div>

            <div className="viz-hbar-track">
              <div
                className="viz-hbar-fill"
                style={{
                  width: `${widthPct}%`,
                  background: isHovered
                    ? "#00d9ff"
                    : idx === 0
                    ? "linear-gradient(90deg, #00d9ff 0%, rgba(0, 217, 255, 0.5) 100%)"
                    : "#334155",
                  boxShadow: isHovered ? "0 0 12px rgba(0, 217, 255, 0.3)" : "none",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------
// 3. SMOOTH LINE / AREA CHART
// -------------------------------------------------------------
function LineChartComponent({ data }: { data: ChartDataPoint[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values, 1);
  const range = maxVal - minVal || 1;

  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Generate coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * plotWidth;
    const y = height - paddingY - ((d.value - minVal) / range) * plotHeight;
    return { x, y, ...d };
  });

  // Build SVG path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    pathD += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const activePoint = activeIdx !== null ? points[activeIdx] : null;

  return (
    <div className="viz-line-container">
      {activePoint && (
        <div
          className="viz-line-tooltip"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / height) * 100}%`,
          }}
        >
          <strong>{activePoint.label}</strong>
          <div>{activePoint.formattedValue || activePoint.value}</div>
          {activePoint.secondaryLabel && <small>{activePoint.secondaryLabel}</small>}
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="viz-line-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d9ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00d9ff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        <line x1={paddingX} y1={paddingY + plotHeight / 2} x2={width - paddingX} y2={paddingY + plotHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="rgba(255,255,255,0.12)" />

        {/* Shaded Area */}
        <path d={areaD} fill="url(#lineAreaGrad)" />

        {/* Line Stroke */}
        <path d={pathD} fill="none" stroke="#00d9ff" strokeWidth="2.5" strokeLinecap="round" />

        {/* Interactive Data Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={activeIdx === i ? 6 : 3.5}
              fill={activeIdx === i ? "#00d9ff" : "#050505"}
              stroke="#00d9ff"
              strokeWidth="2"
              className="viz-line-point"
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
            />
          </g>
        ))}
      </svg>

      <div className="viz-line-labels">
        {data.filter((_, i) => i === 0 || i === Math.floor(data.length / 2) || i === data.length - 1).map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. DONUT CHART WITH ACCURATE SVG ARCS
// -------------------------------------------------------------
function DonutChartComponent({ data }: { data: ChartDataPoint[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 70;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  const defaultColors = ["#00d9ff", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];

  let cumulativeOffset = 0;
  const segments = data.map((d, idx) => {
    const pct = d.value / total;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeOffset;
    cumulativeOffset += pct * circumference;
    const color = d.color || defaultColors[idx % defaultColors.length];

    return {
      ...d,
      pct: Math.round(pct * 1000) / 10,
      strokeDasharray,
      strokeDashoffset,
      color,
    };
  });

  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div className="viz-donut-layout">
      <div className="viz-donut-graphic">
        <svg viewBox="0 0 200 200" className="viz-donut-svg">
          {segments.map((seg, idx) => (
            <circle
              key={seg.label}
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="butt"
              className="viz-donut-segment"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                transition: "all 0.2s ease",
                cursor: "pointer",
                filter: hoveredIdx === idx ? "brightness(1.2) drop-shadow(0 0 6px rgba(0, 217, 255, 0.6))" : "none",
              }}
            />
          ))}
        </svg>

        <div className="viz-donut-center">
          {activeSegment ? (
            <>
              <strong>{activeSegment.pct}%</strong>
              <span>{activeSegment.label}</span>
            </>
          ) : (
            <>
              <strong>100%</strong>
              <span>Distribution</span>
            </>
          )}
        </div>
      </div>

      <div className="viz-donut-legend">
        {segments.map((seg, idx) => (
          <div
            key={seg.label}
            className={`viz-legend-row ${hoveredIdx === idx ? "is-active" : ""}`}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span className="viz-legend-bullet" style={{ background: seg.color }}></span>
            <span className="viz-legend-label">{seg.label}</span>
            <span className="viz-legend-pct">{seg.pct}%</span>
            <span className="viz-legend-val">{seg.formattedValue || seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. TARGET VS ACTUAL (BULLET / QUOTA GAUGE)
// -------------------------------------------------------------
function TargetVsActualComponent({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="viz-bullet-list">
      {data.map((d) => {
        const achPct = d.value; // e.g. 84.5%
        const isBelow = achPct < 100;

        return (
          <div key={d.label} className="viz-bullet-item">
            <div className="viz-bullet-header">
              <span className="viz-bullet-title">{d.label}</span>
              <span className={`viz-bullet-badge ${isBelow ? "is-below" : "is-exceeded"}`}>
                {achPct}% Quota
              </span>
            </div>

            <div className="viz-bullet-track">
              {/* Target 100% Marker */}
              <div className="viz-bullet-target-marker" style={{ left: "80%" }} title="Assigned Quota (100%)">
                <span className="viz-marker-tag">100% Target</span>
              </div>

              {/* Progress bar scaled where 80% width = 100% target */}
              <div
                className={`viz-bullet-fill ${isBelow ? "fill-warn" : "fill-pass"}`}
                style={{ width: `${Math.min(100, Math.round((achPct / 100) * 80))}%` }}
              />
            </div>

            <div className="viz-bullet-meta">
              <span>Actual: {d.formattedValue || `${achPct}%`}</span>
              {d.secondaryLabel && <span>Volume: {d.secondaryLabel}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
