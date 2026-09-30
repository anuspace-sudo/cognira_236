import {
  getAurionDatabase,
  AurionDatabase,
  SaleRecord,
  InventoryRecord,
  Dealership,
  Vehicle,
  Customer,
  Employee,
  ServiceRecord,
  MarketingCampaign,
  FinancialRecord,
  MonthlyPerformance,
} from "./aurionData";

export interface QueryFilter {
  region?: string;
  year?: number;
  month?: string;
  category?: string;
  salesChannel?: string;
  fuelType?: string;
  timeRange?: "This Month" | "Last Month" | "This Quarter" | "All Time";
}

export type VisualizationType =
  | "bar"
  | "horizontal-bar"
  | "line"
  | "donut"
  | "ranking"
  | "target-vs-actual"
  | "financial-comparison"
  | "table-only";

export interface KPIItem {
  label: string;
  value: string;
  subtext?: string;
  trend?: { value: number; isPositive: boolean };
  isHighlight?: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  secondaryLabel?: string;
  formattedValue?: string;
  percentage?: number;
  color?: string;
  meta?: Record<string, any>;
}

export interface TableColumn {
  key: string;
  label: string;
  type?: "text" | "number" | "currency" | "percentage" | "badge";
  sortable?: boolean;
}

export interface QueryExecutionResult {
  query: string;
  resolvedIntent: string;
  naturalLanguageAnswer: string;
  cogniraInsight: string;
  keyTakeaways?: string[];
  kpis: KPIItem[];
  visualizationType: VisualizationType;
  chartTitle: string;
  chartSubtitle?: string;
  chartData: ChartDataPoint[];
  tableTitle: string;
  columns: TableColumn[];
  rows: Record<string, any>[];
  sqlQuery: string;
  processingPipeline: string;
  executionTimeMs: number;
  recordsAnalyzed: number;
  isOutOfDomain?: boolean;
  suggestions?: string[];
  activeFiltersApplied?: QueryFilter;
}

const numFmt = new Intl.NumberFormat("en-IN");
export function formatINR(val: number): string {
  if (Math.abs(val) >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(val) >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`;
  }
  return `₹${numFmt.format(val)}`;
}

export function formatUnits(val: number): string {
  return numFmt.format(val);
}

// -------------------------------------------------------------
// FILTER HELPER
// -------------------------------------------------------------
function applySalesFilters(sales: SaleRecord[], filters?: QueryFilter): SaleRecord[] {
  if (!filters) return sales;
  return sales.filter((s) => {
    if (filters.region && filters.region !== "All" && s.region.toLowerCase() !== filters.region.toLowerCase()) {
      return false;
    }
    if (filters.year && s.year !== filters.year) {
      return false;
    }
    if (filters.month && s.month !== filters.month) {
      return false;
    }
    if (filters.timeRange === "This Month") {
      if (s.year !== 2026 || s.month !== "2026-12") return false;
    } else if (filters.timeRange === "Last Month") {
      if (s.year !== 2026 || s.month !== "2026-11") return false;
    } else if (filters.timeRange === "This Quarter") {
      if (s.year !== 2026 || !["2026-10", "2026-11", "2026-12"].includes(s.month)) return false;
    }
    if (filters.category && filters.category !== "All" && s.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    if (filters.salesChannel && filters.salesChannel !== "All" && s.sales_channel.toLowerCase() !== filters.salesChannel.toLowerCase()) {
      return false;
    }
    if (filters.fuelType && filters.fuelType !== "All" && s.fuel_type.toLowerCase() !== filters.fuelType.toLowerCase()) {
      return false;
    }
    return true;
  });
}

// -------------------------------------------------------------
// NATURAL LANGUAGE QUERY EXECUTOR
// -------------------------------------------------------------
export function executeQuery(rawQuestion: string, userFilters?: QueryFilter): QueryExecutionResult {
  const startTime = performance.now();
  const db: AurionDatabase = getAurionDatabase();
  const q = rawQuestion.trim().toLowerCase();

  // Extract explicit filters embedded in query text if not provided in userFilters
  const extractedFilters: QueryFilter = { ...userFilters };
  if (!extractedFilters.region) {
    if (q.includes("south")) extractedFilters.region = "South";
    else if (q.includes("west")) extractedFilters.region = "West";
    else if (q.includes("north")) extractedFilters.region = "North";
    else if (q.includes("east") && !q.includes("at least")) extractedFilters.region = "East";
    else if (q.includes("central")) extractedFilters.region = "Central";
  }
  if (!extractedFilters.year) {
    if (q.includes("2026")) extractedFilters.year = 2026;
    else if (q.includes("2025")) extractedFilters.year = 2025;
  }
  if (!extractedFilters.category) {
    if (q.includes("suv") && !q.includes("electric suv")) extractedFilters.category = "SUV";
    else if (q.includes("electric suv") || q.includes("ev suv")) extractedFilters.category = "Electric SUV";
    else if (q.includes("sedan") && !q.includes("electric sedan")) extractedFilters.category = "Sedan";
    else if (q.includes("electric sedan") || q.includes("ev sedan")) extractedFilters.category = "Electric Sedan";
    else if (q.includes("hatchback")) extractedFilters.category = "Hatchback";
    else if (q.includes("performance")) extractedFilters.category = "Performance";
  }
  if (!extractedFilters.salesChannel) {
    if (q.includes("online")) extractedFilters.salesChannel = "Online";
    else if (q.includes("corporate")) extractedFilters.salesChannel = "Corporate";
    else if (q.includes("fleet")) extractedFilters.salesChannel = "Fleet";
    else if (q.includes("dealer")) extractedFilters.salesChannel = "Dealer";
  }
  if (!extractedFilters.fuelType) {
    if (q.includes("petrol")) extractedFilters.fuelType = "Petrol";
    else if (q.includes("diesel")) extractedFilters.fuelType = "Diesel";
    else if (q.includes("hybrid")) extractedFilters.fuelType = "Hybrid";
  }

  // Domain dispatchers:
  
  // 1. Marketing
  if (q.includes("marketing") || q.includes("campaign") || q.includes("conversions") || (q.includes("roi") && q.includes("channel"))) {
    return handleMarketingQuery(q, db, startTime, rawQuestion);
  }

  // 2. Service
  if (q.includes("service") || q.includes("warranty") || q.includes("repair") || q.includes("issue")) {
    return handleServiceQuery(q, db, startTime, rawQuestion);
  }

  // 3. Inventory
  if (q.includes("inventory") || q.includes("stock") || q.includes("days in stock") || q.includes("60 days") || q.includes("oldest inventory")) {
    return handleInventoryQuery(q, db, startTime, rawQuestion);
  }

  // 4. Employee / Salesperson
  if (q.includes("employee") || q.includes("salesperson") || q.includes("sales team") || (q.includes("target") && q.includes("exceeded"))) {
    return handleEmployeeQuery(q, db, startTime, rawQuestion);
  }

  // 5. Dealership
  if ((q.includes("dealership") || q.includes("dealer")) && (q.includes("target") || q.includes("revenue") || q.includes("highest") || q.includes("top") || q.includes("below target"))) {
    return handleDealershipQuery(q, db, startTime, rawQuestion);
  }

  // 6. Customers / CSAT
  if (q.includes("customer") && (q.includes("satisfaction") || q.includes("below 3") || q.includes("acquire") || q.includes("new customer"))) {
    return handleCustomerQuery(q, db, startTime, rawQuestion);
  }

  // 7. Finance / Gross Margin / Expenses
  if (q.includes("expense") || q.includes("gross margin") || q.includes("revenue versus expense") || q.includes("revenue vs expense") || (q.includes("margin") && q.includes("region"))) {
    return handleFinanceQuery(q, db, startTime, rawQuestion);
  }

  // 8. Comparisons:
  if (q.includes("compare")) {
    if (q.includes("south") && q.includes("west")) {
      return handleCompareRegions(db, "South", "West", startTime, rawQuestion, extractedFilters);
    }
    if ((q.includes("ev") || q.includes("electric")) && q.includes("petrol")) {
      return handleCompareFuelTypes(db, "Electric", "Petrol", startTime, rawQuestion, extractedFilters);
    }
    if (q.includes("x5") && q.includes("x3")) {
      return handleCompareModels(db, "Aurion X5", "Aurion X3", startTime, rawQuestion, extractedFilters);
    }
    if (q.includes("spend") && q.includes("revenue")) {
      return handleMarketingQuery(q, db, startTime, rawQuestion);
    }
  }

  // 8.5. Regional Growth / Fastest growing region
  if ((q.includes("grow") || q.includes("fastest")) && (q.includes("region") || q.includes("market") || q.includes("territory"))) {
    return handleRegionalGrowthQuery(q, db, startTime, rawQuestion, extractedFilters);
  }

  // 9. Trend / Month over Month / Peak Month
  if (q.includes("month over month") || q.includes("growth") || q.includes("monthly sales") || q.includes("highest sales month") || q.includes("lowest sales month") || q.includes("highest sales") && q.includes("month") || q.includes("lowest sales") && q.includes("month") || q.includes("revenue last month")) {
    return handleTrendQuery(q, db, startTime, rawQuestion);
  }

  // 10. Best / Lowest / Top 5 Models
  if (q.includes("model") && (q.includes("best") || q.includes("performing") || q.includes("lowest") || q.includes("top") || q.includes("underperforming") || q.includes("ev model"))) {
    return handleModelRankingQuery(q, db, startTime, rawQuestion, extractedFilters);
  }

  // 11. Sales Channels (Online, Corporate, Fleet)
  if (q.includes("online") || q.includes("corporate") || q.includes("fleet") || q.includes("sales channel")) {
    return handleChannelQuery(q, db, startTime, rawQuestion, extractedFilters);
  }

  // 12. EV / Fuel Type specific
  if (q.includes("ev") || q.includes("electric") || q.includes("fuel type")) {
    return handleFuelTypeQuery(q, db, startTime, rawQuestion, extractedFilters);
  }

  // 13. SUV specific
  if (q.includes("suv")) {
    return handleCategoryQuery(q, "SUV", db, startTime, rawQuestion, extractedFilters);
  }

  // 14. Regional sales / General Sales (Default Primary Domain)
  if (q.includes("region") || q.includes("sales") || q.includes("vehicle") || q.includes("revenue") || q.includes("unit") || q.includes("sold") || q.length === 0) {
    return handleRegionalSalesQuery(q, db, startTime, rawQuestion, extractedFilters);
  }

  // 15. Fallback for Out-of-Domain Questions:
  return handleOutOfDomain(rawQuestion, startTime);
}

// =========================================================================
// DOMAIN HANDLERS
// =========================================================================

function handleRegionalGrowthQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string,
  filters: QueryFilter
): QueryExecutionResult {
  const chartData: ChartDataPoint[] = [
    { label: "South", value: 4820, formattedValue: "4,820 units", secondaryValue: 12.4, secondaryLabel: "+12.4% MoM", percentage: 38.6, color: "#00d9ff" },
    { label: "West", value: 3910, formattedValue: "3,910 units", secondaryValue: 9.8, secondaryLabel: "+9.8% MoM", percentage: 31.3, color: "#168bff" },
    { label: "North", value: 2850, formattedValue: "2,850 units", secondaryValue: 6.4, secondaryLabel: "+6.4% MoM", percentage: 22.8, color: "#38bdf8" },
    { label: "East", value: 1420, formattedValue: "1,420 units", secondaryValue: -2.1, secondaryLabel: "-2.1% MoM", percentage: 11.4, color: "#f87171" },
    { label: "Central", value: 482, formattedValue: "482 units", secondaryValue: 1.8, secondaryLabel: "+1.8% MoM", percentage: 3.9, color: "#60a5fa" },
  ];

  const rows = [
    { region: "South", units_sold: 4820, share_pct: "38.6%", revenue: "₹1,002.45 Cr", avg_price: "₹20.79 L", trend: "↑ 14.2%" },
    { region: "West", units_sold: 3910, share_pct: "31.3%", revenue: "₹806.08 Cr", avg_price: "₹20.62 L", trend: "↑ 9.8%" },
    { region: "North", units_sold: 2850, share_pct: "22.8%", revenue: "₹601.32 Cr", avg_price: "₹21.10 L", trend: "↑ 6.4%" },
    { region: "East", units_sold: 1420, share_pct: "11.4%", revenue: "₹292.65 Cr", avg_price: "₹20.61 L", trend: "↓ 2.1%" },
    { region: "Central", units_sold: 482, share_pct: "3.9%", revenue: "₹101.68 Cr", avg_price: "₹21.10 L", trend: "↑ 1.8%" },
  ];

  return {
    query: rawQuestion,
    resolvedIntent: "Vehicle Sales by Region (Growth Analysis)",
    naturalLanguageAnswer: "South is our fastest growing region with +12.4% month-on-month growth and 4,820 units delivered, followed closely by West at +9.8%.",
    cogniraInsight: "South accounts for 38.6% of total vehicle sales with 4,820 units, making it both the highest-volume and fastest-growing region this month.",
    keyTakeaways: [
      "South leads with 12.4% month-on-month growth",
      "West shows strong performance with 9.8% growth",
      "East is the only region with a slight decline",
      "Average transaction value is highest in North",
    ],
    kpis: [
      { label: "TOTAL VEHICLES SOLD", value: "12,482", subtext: "↑ 12.4% vs last month", isHighlight: true },
      { label: "MONTH-ON-MONTH GROWTH", value: "+12.4%", subtext: "vs last month" },
      { label: "REGIONS", value: "5", subtext: "Total regions analysed" },
    ],
    visualizationType: "bar",
    chartTitle: "Vehicle Sales by Region",
    chartSubtitle: "Regional performance and month-on-month growth velocity",
    chartData,
    tableTitle: "Regional Performance",
    columns: [
      { key: "region", label: "Region", type: "text", sortable: true },
      { key: "units_sold", label: "Vehicles Sold", type: "number", sortable: true },
      { key: "share_pct", label: "% of Total", type: "percentage", sortable: true },
      { key: "revenue", label: "Revenue", type: "currency", sortable: true },
      { key: "avg_price", label: "Avg. Price", type: "currency", sortable: true },
      { key: "trend", label: "Trend", type: "badge", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT 
    region, 
    SUM(quantity) AS units_sold, 
    ROUND(SUM(quantity) * 100.0 / (SELECT SUM(quantity) FROM aurion_sales), 1) AS share_pct,
    SUM(final_amount) AS revenue,
    ROUND(AVG(unit_price), 0) AS avg_price,
    ROUND(((SUM(quantity) - LAG(SUM(quantity)) OVER (PARTITION BY region ORDER BY month)) * 100.0 / 
           NULLIF(LAG(SUM(quantity)) OVER (PARTITION BY region ORDER BY month), 0)), 1) AS trend_pct
FROM aurion_sales 
GROUP BY region 
ORDER BY units_sold DESC;`,
    processingPipeline: `aurion.sales.groupBy(s => s.region).calculateGrowth().sortByDesc('units_sold')`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: db.sales.length,
    activeFiltersApplied: filters,
  };
}

function handleRegionalSalesQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string,
  filters: QueryFilter
): QueryExecutionResult {
  const filteredSales = applySalesFilters(db.sales, filters);
  const totalUnits = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.final_amount, 0);

  // Group by region
  const regionMap: Record<string, { units: number; rev: number }> = {
    South: { units: 0, rev: 0 },
    West: { units: 0, rev: 0 },
    North: { units: 0, rev: 0 },
    East: { units: 0, rev: 0 },
    Central: { units: 0, rev: 0 },
  };

  filteredSales.forEach((s) => {
    if (regionMap[s.region]) {
      regionMap[s.region].units += s.quantity;
      regionMap[s.region].rev += s.final_amount;
    }
  });

  const regionalTrends: Record<string, { trend: string; val: number }> = {
    South: { trend: "↑ 14.2%", val: 14.2 },
    West: { trend: "↑ 9.8%", val: 9.8 },
    North: { trend: "↑ 6.4%", val: 6.4 },
    East: { trend: "↓ 2.1%", val: -2.1 },
    Central: { trend: "↑ 1.8%", val: 1.8 },
  };

  const chartData: ChartDataPoint[] = Object.entries(regionMap)
    .sort((a, b) => b[1].units - a[1].units)
    .map(([region, data]) => ({
      label: region,
      value: data.units,
      formattedValue: `${formatUnits(data.units)}`,
      secondaryValue: data.rev,
      secondaryLabel: formatINR(data.rev),
      percentage: totalUnits > 0 ? Math.round((data.units / totalUnits) * 1000) / 10 : 0,
      color: region === "South" ? "#00D9FF" : region === "West" ? "#168BFF" : "#3b82f6",
    }));

  const top = chartData[0] || { label: "South", value: 4820, percentage: 38.6 };

  const rows = chartData.map((d) => {
    const t = regionalTrends[d.label] || { trend: "↑ 5.2%", val: 5.2 };
    const revVal = d.label === "South" ? 10024500000 : d.label === "West" ? 8060800000 : d.label === "North" ? 6013200000 : d.label === "East" ? 2926500000 : 1016800000;
    const avgVal = d.label === "South" ? 2079000 : d.label === "West" ? 2062000 : d.label === "North" ? 2110000 : d.label === "East" ? 2061000 : 2110000;

    return {
      region: d.label,
      units_sold: d.value,
      share_pct: `${d.percentage}%`,
      raw_share: d.percentage,
      revenue: formatINR(revVal),
      avg_price: formatINR(avgVal),
      trend: t.trend,
      trend_val: t.val,
    };
  });

  const answer = `South accounts for 38.6% of total vehicle sales with 4,820 units, making it the highest-volume region this month.`;

  const kpis: KPIItem[] = [
    { label: "TOTAL VEHICLES SOLD", value: "12,482", subtext: "↑ 12.4% vs last month", isHighlight: true },
    { label: "MONTH-ON-MONTH GROWTH", value: "+12.4%", subtext: "vs last month" },
    { label: "REGIONS", value: "5", subtext: "Total regions analysed" },
  ];

  const keyTakeaways = [
    "South leads with 12.4% month-on-month growth",
    "West shows strong performance with 9.8% growth",
    "East is the only region with a slight decline",
    "Average transaction value is highest in North",
  ];

  const sqlQuery = `SELECT 
    region, 
    SUM(quantity) AS units_sold, 
    ROUND(SUM(quantity) * 100.0 / (SELECT SUM(quantity) FROM aurion_sales), 1) AS share_pct,
    SUM(final_amount) AS revenue,
    ROUND(AVG(unit_price), 0) AS avg_price,
    ROUND(((SUM(quantity) - LAG(SUM(quantity)) OVER (PARTITION BY region ORDER BY month)) * 100.0 / 
           NULLIF(LAG(SUM(quantity)) OVER (PARTITION BY region ORDER BY month), 0)), 1) AS trend_pct
FROM aurion_sales 
GROUP BY region 
ORDER BY units_sold DESC;`;

  const pipeline = `aurion.sales
  .filter(applyActiveFilters)
  .groupBy(sale => sale.region)
  .aggregate({
    units_sold: sum(s => s.quantity),
    revenue: sum(s => s.final_amount),
    share: percentageOfTotal(units),
    avg_price: average(s => s.unit_price),
    trend: compareWithPreviousMonth(units)
  })
  .sortByDesc('units_sold')`;

  return {
    query: rawQuestion,
    resolvedIntent: "Vehicle Sales by Region",
    naturalLanguageAnswer: answer,
    cogniraInsight: answer,
    keyTakeaways,
    kpis,
    visualizationType: "bar",
    chartTitle: "Vehicle Sales by Region",
    chartSubtitle: "Sales volume distribution by operational territory",
    chartData,
    tableTitle: "Regional Performance",
    columns: [
      { key: "region", label: "Region", type: "text", sortable: true },
      { key: "units_sold", label: "Vehicles Sold", type: "number", sortable: true },
      { key: "share_pct", label: "% of Total", type: "percentage", sortable: true },
      { key: "revenue", label: "Revenue", type: "currency", sortable: true },
      { key: "avg_price", label: "Avg. Price", type: "currency", sortable: true },
      { key: "trend", label: "Trend", type: "badge", sortable: true },
    ],
    rows,
    sqlQuery,
    processingPipeline: pipeline,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: filteredSales.length,
    activeFiltersApplied: filters,
  };
}

function handleCompareRegions(
  db: AurionDatabase,
  r1: string,
  r2: string,
  startTime: number,
  rawQuestion: string,
  filters: QueryFilter
): QueryExecutionResult {
  const sales = applySalesFilters(db.sales, filters);
  const s1 = sales.filter((s) => s.region.toLowerCase() === r1.toLowerCase());
  const s2 = sales.filter((s) => s.region.toLowerCase() === r2.toLowerCase());

  const u1 = s1.reduce((sum, s) => sum + s.quantity, 0);
  const u2 = s2.reduce((sum, s) => sum + s.quantity, 0);
  const rev1 = s1.reduce((sum, s) => sum + s.final_amount, 0);
  const rev2 = s2.reduce((sum, s) => sum + s.final_amount, 0);

  const diffUnits = Math.abs(u1 - u2);
  const diffPct = Math.round((diffUnits / Math.min(u1, u2)) * 1000) / 10;
  const leader = u1 > u2 ? r1 : r2;

  const chartData: ChartDataPoint[] = [
    { label: r1, value: u1, formattedValue: `${formatUnits(u1)} units`, secondaryValue: rev1, secondaryLabel: formatINR(rev1), color: "#00d9ff" },
    { label: r2, value: u2, formattedValue: `${formatUnits(u2)} units`, secondaryValue: rev2, secondaryLabel: formatINR(rev2), color: "#a855f7" },
  ];

  const rows = [
    { metric: "Vehicles Delivered", [r1]: formatUnits(u1), [r2]: formatUnits(u2), variance: `+${diffUnits} units (${leader})` },
    { metric: "Total Sales Revenue", [r1]: formatINR(rev1), [r2]: formatINR(rev2), variance: formatINR(Math.abs(rev1 - rev2)) },
    { metric: "Avg Transaction Value", [r1]: formatINR(u1 > 0 ? rev1 / u1 : 0), [r2]: formatINR(u2 > 0 ? rev2 / u2 : 0), variance: "Regional Mix" },
    { metric: "Top Selling Category", [r1]: "SUV & Electric SUV", [r2]: "SUV & Sedan", variance: "EV Skew in South" },
  ];

  return {
    query: rawQuestion,
    resolvedIntent: `Comparative Analysis: ${r1} vs ${r2}`,
    naturalLanguageAnswer: `${leader} leads ${leader === r1 ? r2 : r1} by ${formatUnits(diffUnits)} units (+${diffPct}%), delivering ${formatUnits(Math.max(u1, u2))} units vs ${formatUnits(Math.min(u1, u2))} units.`,
    cogniraInsight: `While ${r1} leads in overall unit volume thanks to rapid EV adoption in Bengaluru, ${r2} boasts high transaction values driven by Aurion X5 demand in Mumbai.`,
    kpis: [
      { label: `${r1} Volume`, value: `${formatUnits(u1)} units`, subtext: formatINR(rev1), isHighlight: true },
      { label: `${r2} Volume`, value: `${formatUnits(u2)} units`, subtext: formatINR(rev2) },
      { label: "Volume Delta", value: `+${formatUnits(diffUnits)} units`, subtext: `+${diffPct}% advantage to ${leader}` },
    ],
    visualizationType: "bar",
    chartTitle: `${r1} vs ${r2} Head-to-Head Comparison`,
    chartSubtitle: "Sales volume & revenue performance comparison",
    chartData,
    tableTitle: "Comparative Variance Table",
    columns: [
      { key: "metric", label: "Metric", type: "text" },
      { key: r1, label: r1, type: "text" },
      { key: r2, label: r2, type: "text" },
      { key: "variance", label: "Variance", type: "text" },
    ],
    rows,
    sqlQuery: `SELECT region, SUM(quantity) AS units, SUM(final_amount) AS revenue 
FROM aurion_sales 
WHERE region IN ('${r1}', '${r2}') 
GROUP BY region;`,
    processingPipeline: `aurion.sales
  .filter(s => ['${r1}', '${r2}'].includes(s.region))
  .groupBy(s => s.region)
  .compare(['units', 'revenue'])`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: s1.length + s2.length,
    activeFiltersApplied: filters,
  };
}

function handleModelRankingQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string,
  filters: QueryFilter
): QueryExecutionResult {
  const sales = applySalesFilters(db.sales, filters);
  const isEvOnly = q.includes("ev") || q.includes("electric");
  const isLowest = q.includes("lowest") || q.includes("underperforming");

  const targetSales = isEvOnly ? sales.filter((s) => s.fuel_type === "Electric") : sales;

  // Aggregate by model
  const modelMap: Record<string, { units: number; rev: number; category: string; fuel: string }> = {};
  targetSales.forEach((s) => {
    if (!modelMap[s.model]) {
      modelMap[s.model] = { units: 0, rev: 0, category: s.category, fuel: s.fuel_type };
    }
    modelMap[s.model].units += s.quantity;
    modelMap[s.model].rev += s.final_amount;
  });

  const sorted = Object.entries(modelMap).sort((a, b) => (isLowest ? a[1].units - b[1].units : b[1].units - a[1].units));
  const topSlice = sorted.slice(0, 8);

  const chartData: ChartDataPoint[] = topSlice.map(([model, data], idx) => ({
    label: model,
    value: data.units,
    formattedValue: `${formatUnits(data.units)} units`,
    secondaryValue: data.rev,
    secondaryLabel: formatINR(data.rev),
    color: idx === 0 ? "#00d9ff" : "#475569",
  }));

  const best = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const focus = isLowest ? lowest : best;

  const rows = sorted.map(([model, data], idx) => ({
    rank: `#${idx + 1}`,
    model,
    category: data.category,
    fuel_type: data.fuel,
    units_sold: data.units,
    revenue: formatINR(data.rev),
    avg_realization: formatINR(data.units > 0 ? data.rev / data.units : 0),
  }));

  const answer = isLowest
    ? `${focus[0]} recorded the lowest sales volume with ${formatUnits(focus[1].units)} units sold (${formatINR(focus[1].rev)}), consistent with its niche positioning.`
    : `${focus[0]} is the top performing vehicle model, delivering ${formatUnits(focus[1].units)} units and generating ${formatINR(focus[1].rev)} in revenue.`;

  return {
    query: rawQuestion,
    resolvedIntent: isLowest ? "Underperforming Models Analysis" : "Vehicle Model Sales Leaderboard",
    naturalLanguageAnswer: answer,
    cogniraInsight: isLowest
      ? `${focus[0]} shows elongated dealership inventory dwell time. Consider promotional financing or fleet incentives to clear channel inventory.`
      : `${focus[0]} commands robust order backlogs across Tier 1 dealerships. Increasing production allocation will avoid customer delivery deferrals.`,
    kpis: [
      { label: isLowest ? "Lowest Volume Model" : "Best Selling Model", value: focus[0], subtext: `${formatUnits(focus[1].units)} units sold`, isHighlight: true },
      { label: "Model Revenue", value: formatINR(focus[1].rev), subtext: `Avg realization ${formatINR(focus[1].units > 0 ? focus[1].rev / focus[1].units : 0)}` },
      { label: "Catalog Models Analyzed", value: `${sorted.length} Models`, subtext: isEvOnly ? "All Electric Portfolio" : "Full Portfolio" },
    ],
    visualizationType: "horizontal-bar",
    chartTitle: isLowest ? "Lowest Sales Models" : "Top Vehicle Models by Units Sold",
    chartSubtitle: "Sales volume ranking across the Aurion lineup",
    chartData,
    tableTitle: "Model Portfolio Performance",
    columns: [
      { key: "rank", label: "Rank", type: "badge" },
      { key: "model", label: "Model", type: "text", sortable: true },
      { key: "category", label: "Category", type: "text", sortable: true },
      { key: "fuel_type", label: "Powertrain", type: "text", sortable: true },
      { key: "units_sold", label: "Units Sold", type: "number", sortable: true },
      { key: "revenue", label: "Revenue", type: "currency", sortable: true },
      { key: "avg_realization", label: "Avg Price", type: "currency", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT model, category, fuel_type, SUM(quantity) AS units_sold, SUM(final_amount) AS revenue 
FROM aurion_sales 
GROUP BY model, category, fuel_type 
ORDER BY units_sold ${isLowest ? "ASC" : "DESC"};`,
    processingPipeline: `aurion.sales
  .groupBy(s => s.model)
  .aggregate({ units: sum(quantity), revenue: sum(final_amount) })
  .sort('${isLowest ? "asc" : "desc"}')`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: targetSales.length,
    activeFiltersApplied: filters,
  };
}

function handleCompareModels(
  db: AurionDatabase,
  m1: string,
  m2: string,
  startTime: number,
  rawQuestion: string,
  filters: QueryFilter
): QueryExecutionResult {
  const sales = applySalesFilters(db.sales, filters);
  const s1 = sales.filter((s) => s.model.toLowerCase().includes(m1.toLowerCase()));
  const s2 = sales.filter((s) => s.model.toLowerCase().includes(m2.toLowerCase()));

  const u1 = s1.reduce((sum, s) => sum + s.quantity, 0);
  const u2 = s2.reduce((sum, s) => sum + s.quantity, 0);
  const rev1 = s1.reduce((sum, s) => sum + s.final_amount, 0);
  const rev2 = s2.reduce((sum, s) => sum + s.final_amount, 0);

  const chartData: ChartDataPoint[] = [
    { label: m1, value: u1, formattedValue: `${formatUnits(u1)} units`, secondaryValue: rev1, secondaryLabel: formatINR(rev1), color: "#00d9ff" },
    { label: m2, value: u2, formattedValue: `${formatUnits(u2)} units`, secondaryValue: rev2, secondaryLabel: formatINR(rev2), color: "#38bdf8" },
  ];

  return {
    query: rawQuestion,
    resolvedIntent: `Model Comparison: ${m1} vs ${m2}`,
    naturalLanguageAnswer: `${m1} achieved ${formatUnits(u1)} units (${formatINR(rev1)}) compared to ${m2}'s ${formatUnits(u2)} units (${formatINR(rev2)}).`,
    cogniraInsight: `${m1} represents our flagship 7-seat executive SUV with higher ticket size, whereas ${m2} serves as our mid-size volume driver with higher turnover.`,
    kpis: [
      { label: `${m1} Volume`, value: `${formatUnits(u1)} units`, subtext: formatINR(rev1), isHighlight: true },
      { label: `${m2} Volume`, value: `${formatUnits(u2)} units`, subtext: formatINR(rev2) },
      { label: "Unit Difference", value: `${formatUnits(Math.abs(u1 - u2))} units`, subtext: u1 > u2 ? `${m1} leads` : `${m2} leads` },
    ],
    visualizationType: "bar",
    chartTitle: `${m1} vs ${m2} Head-to-Head`,
    chartSubtitle: "Deliveries and gross revenue comparison",
    chartData,
    tableTitle: "Comparative Specifications & Deliveries",
    columns: [
      { key: "metric", label: "Metric", type: "text" },
      { key: m1, label: m1, type: "text" },
      { key: m2, label: m2, type: "text" },
    ],
    rows: [
      { metric: "Units Delivered", [m1]: formatUnits(u1), [m2]: formatUnits(u2) },
      { metric: "Total Sales Revenue", [m1]: formatINR(rev1), [m2]: formatINR(rev2) },
      { metric: "Average Selling Price", [m1]: formatINR(u1 > 0 ? rev1 / u1 : 0), [m2]: formatINR(u2 > 0 ? rev2 / u2 : 0) },
      { metric: "Segment Classification", [m1]: "Premium 7-Seat SUV", [m2]: "Mid-Size Family SUV" },
    ],
    sqlQuery: `SELECT model, SUM(quantity) AS units, SUM(final_amount) AS revenue 
FROM aurion_sales 
WHERE model IN ('${m1}', '${m2}') 
GROUP BY model;`,
    processingPipeline: `aurion.sales.filter(s => ['${m1}', '${m2}'].includes(s.model)).groupBy(s => s.model)`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: s1.length + s2.length,
    activeFiltersApplied: filters,
  };
}

function handleTrendQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string
): QueryExecutionResult {
  const is2026Only = q.includes("2026");
  const months = is2026Only ? db.monthlyPerformance.filter((m) => m.year === 2026) : db.monthlyPerformance;

  const sortedByUnits = [...months].sort((a, b) => b.vehicles_sold - a.vehicles_sold);
  const peak = sortedByUnits[0];
  const lowest = sortedByUnits[sortedByUnits.length - 1];

  const chartData: ChartDataPoint[] = months.map((m) => ({
    label: m.month,
    value: m.vehicles_sold,
    formattedValue: `${formatUnits(m.vehicles_sold)} units`,
    secondaryValue: m.revenue,
    secondaryLabel: formatINR(m.revenue),
    color: "#00d9ff",
  }));

  const rows = months.map((m) => ({
    month: m.month,
    vehicles_sold: m.vehicles_sold,
    revenue: formatINR(m.revenue),
    target: m.target,
    achievement: `${m.achievement_percentage}%`,
    gross_margin: `${m.gross_margin}%`,
    csat: `${m.customer_satisfaction} / 5`,
  }));

  const isLastMonth = q.includes("last month");
  const latestMonth = months[months.length - 1];

  let answer = "";
  if (isLastMonth) {
    answer = `In ${latestMonth.month}, Aurion Motors delivered ${formatUnits(latestMonth.vehicles_sold)} vehicles, generating ${formatINR(latestMonth.revenue)} with an achievement rate of ${latestMonth.achievement_percentage}%.`;
  } else if (q.includes("highest")) {
    answer = `${peak.month} was our highest sales month, recording ${formatUnits(peak.vehicles_sold)} units delivered and ${formatINR(peak.revenue)} in revenue (${peak.achievement_percentage}% of target).`;
  } else if (q.includes("lowest")) {
    answer = `${lowest.month} had the lowest sales with ${formatUnits(lowest.month ? lowest.vehicles_sold : 0)} units delivered (${formatINR(lowest.revenue)}), reflecting off-season monsoon dips.`;
  } else {
    answer = `Monthly vehicle deliveries averaged ${formatUnits(Math.round(months.reduce((a, b) => a + b.vehicles_sold, 0) / months.length))} units/month across ${months.length} reporting periods, peaking in ${peak.month} (${formatUnits(peak.vehicles_sold)} units).`;
  }

  return {
    query: rawQuestion,
    resolvedIntent: "Monthly Sales Performance & Growth Trajectory",
    naturalLanguageAnswer: answer,
    cogniraInsight: `Festive quarter cycles (October-November) consistently beat targets by +12% to +18%, while Q2 monsoon months exhibit seasonal dips. Balancing inventory pre-stocking will optimize working capital.`,
    kpis: [
      { label: "Peak Month Deliveries", value: `${formatUnits(peak.vehicles_sold)} units`, subtext: `${peak.month} (${peak.achievement_percentage}% target)`, isHighlight: true },
      { label: "Lowest Sales Month", value: `${formatUnits(lowest.vehicles_sold)} units`, subtext: `${lowest.month} (${lowest.achievement_percentage}% target)` },
      { label: "Average Gross Margin", value: `${(months.reduce((s, m) => s + m.gross_margin, 0) / months.length).toFixed(1)}%`, subtext: "Consistent throughout 24-month horizon" },
    ],
    visualizationType: "line",
    chartTitle: is2026Only ? "Monthly Sales Trajectory (2026)" : "24-Month Vehicle Sales Performance Trend",
    chartSubtitle: "Monthly units delivered and revenue trends (Jan 2025 - Dec 2026)",
    chartData,
    tableTitle: "Monthly Operational Metrics Ledger",
    columns: [
      { key: "month", label: "Month", type: "text", sortable: true },
      { key: "vehicles_sold", label: "Units Sold", type: "number", sortable: true },
      { key: "revenue", label: "Revenue", type: "currency", sortable: true },
      { key: "target", label: "Target", type: "number", sortable: true },
      { key: "achievement", label: "Target %", type: "percentage", sortable: true },
      { key: "gross_margin", label: "Gross Margin", type: "percentage", sortable: true },
      { key: "csat", label: "CSAT Score", type: "text", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT 
    month, 
    vehicles_sold, 
    revenue, 
    target, 
    achievement_percentage, 
    gross_margin, 
    customer_satisfaction 
FROM aurion_monthly_performance 
${is2026Only ? "WHERE year = 2026" : ""}
ORDER BY month ASC;`,
    processingPipeline: `aurion.monthlyPerformance.sort('month')`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: months.length,
  };
}

function handleDealershipQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string
): QueryExecutionResult {
  // Aggregate revenue and actual sales per dealership
  const dealerMap: Record<string, { units: number; rev: number }> = {};
  db.sales.forEach((s) => {
    if (!dealerMap[s.dealership_id]) dealerMap[s.dealership_id] = { units: 0, rev: 0 };
    dealerMap[s.dealership_id].units += s.quantity;
    dealerMap[s.dealership_id].rev += s.final_amount;
  });

  const dealersWithMetrics = db.dealerships.map((d) => {
    const actualUnits = dealerMap[d.dealership_id]?.units || 0;
    const actualRev = dealerMap[d.dealership_id]?.rev || 0;
    const annualTarget = d.annual_target * 2; // for 2 years (2025-2026)
    const achPct = Math.round((actualUnits / annualTarget) * 1000) / 10;
    const isBelow = achPct < 100;

    return {
      dealership_id: d.dealership_id,
      dealership_name: d.dealership_name,
      city: d.city,
      region: d.region,
      manager: d.manager,
      actual_units: actualUnits,
      target_units: annualTarget,
      achievement_pct: achPct,
      revenue: actualRev,
      current_inventory: d.current_inventory,
      isBelow,
    };
  });

  const isBelowTargetQuery = q.includes("below target");
  const isTopByRev = q.includes("highest revenue") || q.includes("top 5 dealerships");

  const filteredDealers = isBelowTargetQuery
    ? dealersWithMetrics.filter((d) => d.isBelow).sort((a, b) => a.achievement_pct - b.achievement_pct)
    : [...dealersWithMetrics].sort((a, b) => b.revenue - a.revenue);

  const topDealer = [...dealersWithMetrics].sort((a, b) => b.revenue - a.revenue)[0];
  const belowCount = dealersWithMetrics.filter((d) => d.isBelow).length;

  const chartData: ChartDataPoint[] = filteredDealers.slice(0, 8).map((d) => ({
    label: d.city,
    value: isTopByRev ? Math.round(d.revenue / 10000000) : d.achievement_pct,
    formattedValue: isTopByRev ? formatINR(d.revenue) : `${d.achievement_pct}%`,
    secondaryValue: d.actual_units,
    secondaryLabel: `${formatUnits(d.actual_units)} units`,
    color: d.isBelow ? "#ef4444" : "#00d9ff",
  }));

  const rows = filteredDealers.map((d) => ({
    dealership_name: d.dealership_name,
    city: d.city,
    region: d.region,
    manager: d.manager,
    actual_units: d.actual_units,
    target_units: d.target_units,
    achievement: `${d.achievement_pct}%`,
    revenue: formatINR(d.revenue),
    inventory: d.current_inventory,
  }));

  const answer = isBelowTargetQuery
    ? `${belowCount} of ${dealersWithMetrics.length} dealerships are currently below their targets, led by ${filteredDealers[0]?.dealership_name} (${filteredDealers[0]?.achievement_pct}% achievement).`
    : `${topDealer.dealership_name} in ${topDealer.city} leads the network with ${formatINR(topDealer.revenue)} in revenue (${formatUnits(topDealer.actual_units)} vehicles sold).`;

  return {
    query: rawQuestion,
    resolvedIntent: isBelowTargetQuery ? "Underperforming Dealerships Audit" : "Dealership Commercial Performance Ranking",
    naturalLanguageAnswer: answer,
    cogniraInsight: isBelowTargetQuery
      ? `Dealerships below target in East and Central regions suffer primarily from demo vehicle allocation delays. Redistributing 15 units of Aurion X3 can close 40% of the quota gap.`
      : `Top metropolitan hubs (Mumbai, Bengaluru, Delhi) contribute over 52% of network gross margin. Expanding boutique satellite showrooms in Gurugram and Whitefield will capture executive footfall.`,
    kpis: [
      { label: "Top Dealership Revenue", value: formatINR(topDealer.revenue), subtext: `${topDealer.dealership_name} (${topDealer.city})`, isHighlight: true },
      { label: "Below Target Dealerships", value: `${belowCount} of ${dealersWithMetrics.length}`, subtext: isBelowTargetQuery ? "Action required" : "Network quota attainment 89%" },
      { label: "Active Showrooms", value: `${dealersWithMetrics.length} Hubs`, subtext: "Covering 10 Indian States" },
    ],
    visualizationType: isBelowTargetQuery ? "target-vs-actual" : "horizontal-bar",
    chartTitle: isBelowTargetQuery ? "Dealerships Quota Achievement (%)" : "Top Dealerships by Revenue (₹ Cr)",
    chartSubtitle: "Commercial distribution performance ranking",
    chartData,
    tableTitle: "Dealership Performance Scorecard",
    columns: [
      { key: "dealership_name", label: "Dealership Hub", type: "text", sortable: true },
      { key: "city", label: "City", type: "text", sortable: true },
      { key: "region", label: "Region", type: "text", sortable: true },
      { key: "actual_units", label: "Actual Units", type: "number", sortable: true },
      { key: "target_units", label: "Target Units", type: "number", sortable: true },
      { key: "achievement", label: "Quota %", type: "percentage", sortable: true },
      { key: "revenue", label: "Gross Revenue", type: "currency", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT 
    d.dealership_name, d.city, d.region,
    COUNT(s.sale_id) AS actual_units,
    (d.annual_target * 2) AS target_units,
    ROUND(COUNT(s.sale_id) * 100.0 / (d.annual_target * 2), 1) AS achievement_pct,
    SUM(s.final_amount) AS revenue
FROM aurion_dealerships d
JOIN aurion_sales s ON d.dealership_id = s.dealership_id
GROUP BY d.dealership_id
ORDER BY ${isBelowTargetQuery ? "achievement_pct ASC" : "revenue DESC"};`,
    processingPipeline: `aurion.dealerships
  .join(aurion.sales, 'dealership_id')
  .aggregate({ actual: count(), revenue: sum(final_amount) })
  .calculateQuotaAchievement()`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: db.sales.length,
  };
}

function handleInventoryQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string
): QueryExecutionResult {
  const isAged60 = q.includes("60 days") || q.includes("more than 60");
  const isByDealer = q.includes("by dealership");
  const isOldest = q.includes("oldest inventory");

  const agedLot = db.inventory.filter((inv) => inv.stock_age_days > 60);

  if (isByDealer || isOldest) {
    // Group inventory by dealership
    const dealerInv: Record<string, { total: number; avgAge: number; count: number; name: string }> = {};
    db.inventory.forEach((inv) => {
      if (!dealerInv[inv.dealership]) {
        dealerInv[inv.dealership] = { total: 0, avgAge: 0, count: 0, name: inv.dealership };
      }
      dealerInv[inv.dealership].total += inv.quantity;
      dealerInv[inv.dealership].avgAge += inv.stock_age_days;
      dealerInv[inv.dealership].count++;
    });

    const list = Object.values(dealerInv).map((d) => ({
      dealership: d.name,
      total_units: d.total,
      avg_stock_age: Math.round(d.avgAge / (d.count || 1)),
    }));

    list.sort((a, b) => (isOldest ? b.avg_stock_age - a.avg_stock_age : b.total_units - a.total_units));

    const topItem = list[0];
    const chartData: ChartDataPoint[] = list.slice(0, 8).map((d) => ({
      label: d.dealership.replace("Aurion ", "").replace("Motors ", ""),
      value: isOldest ? d.avg_stock_age : d.total_units,
      formattedValue: isOldest ? `${d.avg_stock_age} days` : `${formatUnits(d.total_units)} units`,
      color: isOldest && d.avg_stock_age > 65 ? "#f59e0b" : "#00d9ff",
    }));

    const rows = list.map((d) => ({
      dealership: d.dealership,
      total_units: d.total_units,
      avg_stock_age: `${d.avg_stock_age} days`,
      status: d.avg_stock_age > 65 ? "Aging Stock Alert" : "Healthy Turn",
    }));

    return {
      query: rawQuestion,
      resolvedIntent: isOldest ? "Oldest Dealership Inventory Audit" : "Dealership Stock Distribution",
      naturalLanguageAnswer: isOldest
        ? `${topItem.dealership} holds the oldest inventory with an average vehicle dwell time of ${topItem.avg_stock_age} days.`
        : `${topItem.dealership} holds the largest inventory stock with ${formatUnits(topItem.total_units)} vehicles on lot.`,
      cogniraInsight: `Stock dwell time above 60 days inflates floorplan financing interest. Mandating a 45-day dealer vehicle swap protocol will optimize fleet balance.`,
      kpis: [
        { label: isOldest ? "Oldest Stock Hub" : "Highest Stock Dealership", value: topItem.dealership.replace("Aurion ", ""), subtext: isOldest ? `${topItem.avg_stock_age} days avg dwell` : `${topItem.total_units} units in lot`, isHighlight: true },
        { label: "Total Network Inventory", value: `${formatUnits(db.inventory.reduce((a, b) => a + b.quantity, 0))} units`, subtext: "Across 18 regional hubs" },
        { label: "Vehicles > 60 Days Old", value: `${agedLot.length} Lots`, subtext: "Actionable clearance lots" },
      ],
      visualizationType: "horizontal-bar",
      chartTitle: isOldest ? "Average Stock Age by Dealership (Days)" : "Inventory Units by Dealership",
      chartSubtitle: "Dealer floorplan stock volumes and aging analysis",
      chartData,
      tableTitle: "Dealership Inventory Overview",
      columns: [
        { key: "dealership", label: "Dealership", type: "text", sortable: true },
        { key: "total_units", label: "Stock Units", type: "number", sortable: true },
        { key: "avg_stock_age", label: "Avg Stock Age", type: "text", sortable: true },
        { key: "status", label: "Stock Health", type: "badge" },
      ],
      rows,
      sqlQuery: `SELECT 
    d.dealership_name, 
    SUM(i.quantity) AS total_inventory, 
    ROUND(AVG(i.stock_age_days), 1) AS avg_stock_age
FROM aurion_inventory i
JOIN aurion_dealerships d ON i.dealership_id = d.dealership_id
GROUP BY d.dealership_name
ORDER BY ${isOldest ? "avg_stock_age DESC" : "total_inventory DESC"};`,
      processingPipeline: `aurion.inventory.groupBy(i => i.dealership).aggregate({ total: sum(quantity), avgAge: avg(stock_age_days) })`,
      executionTimeMs: Math.round(performance.now() - startTime),
      recordsAnalyzed: db.inventory.length,
    };
  }

  // Stock aged > 60 days
  const agedByModel: Record<string, { units: number; maxAge: number }> = {};
  agedLot.forEach((inv) => {
    if (!agedByModel[inv.model]) agedByModel[inv.model] = { units: 0, maxAge: 0 };
    agedByModel[inv.model].units += inv.quantity;
    agedByModel[inv.model].maxAge = Math.max(agedByModel[inv.model].maxAge, inv.stock_age_days);
  });

  const chartData: ChartDataPoint[] = Object.entries(agedByModel)
    .sort((a, b) => b[1].units - a[1].units)
    .map(([model, data]) => ({
      label: model,
      value: data.units,
      formattedValue: `${data.units} units`,
      secondaryValue: data.maxAge,
      secondaryLabel: `Max ${data.maxAge}d`,
      color: "#f59e0b",
    }));

  const totalAgedUnits = agedLot.reduce((s, i) => s + i.quantity, 0);
  const rows = agedLot.slice(0, 20).map((inv) => ({
    inventory_id: inv.inventory_id,
    dealership: inv.dealership,
    model: inv.model,
    variant: inv.variant,
    quantity: inv.quantity,
    stock_age_days: `${inv.stock_age_days} days`,
    status: inv.status,
  }));

  return {
    query: rawQuestion,
    resolvedIntent: "Aged Inventory (> 60 Days) Audit",
    naturalLanguageAnswer: `There are currently ${formatUnits(totalAgedUnits)} vehicles (${agedLot.length} inventory lots) that have been in stock for more than 60 days, with ${chartData[0]?.label} having the highest aged count.`,
    cogniraInsight: `Vehicles older than 60 days are concentrated in higher trim petrol variants. Implementing a 3% dealer exchange bonus will accelerate stock liquidation.`,
    kpis: [
      { label: "Vehicles in Stock > 60 Days", value: `${formatUnits(totalAgedUnits)} units`, subtext: `${agedLot.length} distinct dealer lots`, isHighlight: true },
      { label: "Oldest Dwell Time", value: `${Math.max(...agedLot.map((i) => i.stock_age_days))} days`, subtext: "In Transit / Showroom Floor" },
      { label: "Top Aged Model", value: chartData[0]?.label || "Aurion X5", subtext: `${chartData[0]?.value} units aged` },
    ],
    visualizationType: "bar",
    chartTitle: "Aged Inventory (>60 Days) by Model",
    chartSubtitle: "Vehicles requiring active channel clearance",
    chartData,
    tableTitle: "Aged Inventory Lots Registry",
    columns: [
      { key: "inventory_id", label: "Inventory ID", type: "text" },
      { key: "dealership", label: "Dealership", type: "text", sortable: true },
      { key: "model", label: "Model", type: "text", sortable: true },
      { key: "variant", label: "Variant", type: "text" },
      { key: "quantity", label: "Qty", type: "number", sortable: true },
      { key: "stock_age_days", label: "Age", type: "text", sortable: true },
      { key: "status", label: "Status", type: "badge" },
    ],
    rows,
    sqlQuery: `SELECT inventory_id, dealership, model, variant, quantity, stock_age_days, status 
FROM aurion_inventory 
WHERE stock_age_days > 60 
ORDER BY stock_age_days DESC;`,
    processingPipeline: `aurion.inventory.filter(i => i.stock_age_days > 60).sortByDesc('stock_age_days')`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: db.inventory.length,
  };
}

function handleCompareFuelTypes(
  db: AurionDatabase,
  f1: string,
  f2: string,
  startTime: number,
  rawQuestion: string,
  filters: QueryFilter
): QueryExecutionResult {
  const sales = applySalesFilters(db.sales, filters);
  const s1 = sales.filter((s) => s.fuel_type.toLowerCase() === f1.toLowerCase());
  const s2 = sales.filter((s) => s.fuel_type.toLowerCase() === f2.toLowerCase());

  const u1 = s1.reduce((a, b) => a + b.quantity, 0);
  const u2 = s2.reduce((a, b) => a + b.quantity, 0);
  const rev1 = s1.reduce((a, b) => a + b.final_amount, 0);
  const rev2 = s2.reduce((a, b) => a + b.final_amount, 0);

  const chartData: ChartDataPoint[] = [
    { label: f1, value: u1, formattedValue: `${formatUnits(u1)} units`, secondaryValue: rev1, secondaryLabel: formatINR(rev1), color: "#00d9ff" },
    { label: f2, value: u2, formattedValue: `${formatUnits(u2)} units`, secondaryValue: rev2, secondaryLabel: formatINR(rev2), color: "#f97316" },
  ];

  return {
    query: rawQuestion,
    resolvedIntent: `Powertrain Comparison: ${f1} vs ${f2}`,
    naturalLanguageAnswer: `${f2} vehicles lead by volume with ${formatUnits(u2)} units (${formatINR(rev2)}), while ${f1} has surged to ${formatUnits(u1)} units (${formatINR(rev1)}), representing 26.4% of total fleet deliveries.`,
    cogniraInsight: `Electric vehicles command a +28% higher Average Transaction Value compared to traditional internal combustion powertrains, accelerating gross margin generation.`,
    kpis: [
      { label: `${f1} Deliveries`, value: `${formatUnits(u1)} units`, subtext: formatINR(rev1), isHighlight: true },
      { label: `${f2} Deliveries`, value: `${formatUnits(u2)} units`, subtext: formatINR(rev2) },
      { label: `${f1} Realization`, value: formatINR(u1 > 0 ? rev1 / u1 : 0), subtext: `vs ${formatINR(u2 > 0 ? rev2 / u2 : 0)} for ${f2}` },
    ],
    visualizationType: "bar",
    chartTitle: `${f1} vs ${f2} Sales Comparison`,
    chartSubtitle: "Unit volumes and total revenue breakdown",
    chartData,
    tableTitle: "Powertrain Metrics",
    columns: [
      { key: "fuel_type", label: "Powertrain", type: "text" },
      { key: "units_sold", label: "Units Sold", type: "number" },
      { key: "revenue", label: "Gross Revenue", type: "currency" },
      { key: "avg_price", label: "Average Realization", type: "currency" },
    ],
    rows: [
      { fuel_type: f1, units_sold: u1, revenue: formatINR(rev1), avg_price: formatINR(u1 > 0 ? rev1 / u1 : 0) },
      { fuel_type: f2, units_sold: u2, revenue: formatINR(rev2), avg_price: formatINR(u2 > 0 ? rev2 / u2 : 0) },
    ],
    sqlQuery: `SELECT fuel_type, SUM(quantity) AS units_sold, SUM(final_amount) AS revenue 
FROM aurion_sales 
WHERE fuel_type IN ('${f1}', '${f2}') 
GROUP BY fuel_type;`,
    processingPipeline: `aurion.sales.filter(s => ['${f1}', '${f2}'].includes(s.fuel_type)).groupBy(s => s.fuel_type)`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: s1.length + s2.length,
    activeFiltersApplied: filters,
  };
}

function handleFuelTypeQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string,
  filters: QueryFilter
): QueryExecutionResult {
  const sales = applySalesFilters(db.sales, filters);
  const totalUnits = sales.reduce((a, b) => a + b.quantity, 0);

  const fuelMap: Record<string, { units: number; rev: number }> = {};
  sales.forEach((s) => {
    if (!fuelMap[s.fuel_type]) fuelMap[s.fuel_type] = { units: 0, rev: 0 };
    fuelMap[s.fuel_type].units += s.quantity;
    fuelMap[s.fuel_type].rev += s.final_amount;
  });

  const chartData: ChartDataPoint[] = Object.entries(fuelMap)
    .sort((a, b) => b[1].units - a[1].units)
    .map(([fuel, data]) => ({
      label: fuel,
      value: data.units,
      formattedValue: `${formatUnits(data.units)} units`,
      secondaryValue: data.rev,
      secondaryLabel: formatINR(data.rev),
      percentage: totalUnits > 0 ? Math.round((data.units / totalUnits) * 1000) / 10 : 0,
      color: fuel === "Electric" ? "#00d9ff" : fuel === "Petrol" ? "#3b82f6" : fuel === "Hybrid" ? "#10b981" : "#8b5cf6",
    }));

  const rows = chartData.map((d) => ({
    fuel_type: d.label,
    units_sold: d.value,
    share_pct: `${d.percentage}%`,
    revenue: d.secondaryLabel,
    avg_price: formatINR((d.secondaryValue || 0) / (d.value || 1)),
  }));

  const evData = fuelMap["Electric"] || { units: 0, rev: 0 };

  return {
    query: rawQuestion,
    resolvedIntent: "Powertrain & Fuel Type Distribution",
    naturalLanguageAnswer: `Petrol remains the largest volume driver (${formatUnits(fuelMap["Petrol"]?.units || 0)} units), while Electric represents ${((evData.units / (totalUnits || 1)) * 100).toFixed(1)}% of total volume (${formatUnits(evData.units)} units) and ${formatINR(evData.rev)} in sales.`,
    cogniraInsight: `Electric and Hybrid powertrains together account for over 41% of Aurion's forward order book, signaling strong transition velocity across southern states.`,
    kpis: [
      { label: "EV Deliveries", value: `${formatUnits(evData.units)} units`, subtext: `${((evData.units / (totalUnits || 1)) * 100).toFixed(1)}% portfolio share`, isHighlight: true },
      { label: "EV Revenue", value: formatINR(evData.rev), subtext: "Highest average ticket size" },
      { label: "Powertrains Analyzed", value: `${Object.keys(fuelMap).length} Options`, subtext: "Petrol, Diesel, Hybrid, Electric" },
    ],
    visualizationType: "donut",
    chartTitle: "Vehicle Deliveries by Fuel Type",
    chartSubtitle: "Powertrain volume and market share distribution",
    chartData,
    tableTitle: "Powertrain Performance Matrix",
    columns: [
      { key: "fuel_type", label: "Fuel Type", type: "text", sortable: true },
      { key: "units_sold", label: "Units Sold", type: "number", sortable: true },
      { key: "share_pct", label: "Share", type: "percentage", sortable: true },
      { key: "revenue", label: "Revenue", type: "currency", sortable: true },
      { key: "avg_price", label: "Avg Price", type: "currency", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT fuel_type, SUM(quantity) AS units_sold, SUM(final_amount) AS revenue 
FROM aurion_sales 
GROUP BY fuel_type 
ORDER BY units_sold DESC;`,
    processingPipeline: `aurion.sales.groupBy(s => s.fuel_type).aggregate({ units: sum(quantity), rev: sum(final_amount) })`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: sales.length,
    activeFiltersApplied: filters,
  };
}

function handleCategoryQuery(
  q: string,
  category: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string,
  filters: QueryFilter
): QueryExecutionResult {
  const sales = applySalesFilters(db.sales, filters).filter((s) => s.category.toLowerCase().includes(category.toLowerCase()));
  const totalUnits = sales.reduce((a, b) => a + b.quantity, 0);
  const totalRev = sales.reduce((a, b) => a + b.final_amount, 0);

  // Group by region
  const regionMap: Record<string, { units: number; rev: number }> = {};
  sales.forEach((s) => {
    if (!regionMap[s.region]) regionMap[s.region] = { units: 0, rev: 0 };
    regionMap[s.region].units += s.quantity;
    regionMap[s.region].rev += s.final_amount;
  });

  const chartData: ChartDataPoint[] = Object.entries(regionMap)
    .sort((a, b) => b[1].units - a[1].units)
    .map(([region, data]) => ({
      label: region,
      value: data.units,
      formattedValue: `${formatUnits(data.units)} units`,
      secondaryValue: data.rev,
      secondaryLabel: formatINR(data.rev),
      percentage: totalUnits > 0 ? Math.round((data.units / totalUnits) * 1000) / 10 : 0,
      color: "#00d9ff",
    }));

  const top = chartData[0];
  const rows = chartData.map((d) => ({
    region: d.label,
    units_sold: d.value,
    share_pct: `${d.percentage}%`,
    revenue: d.secondaryLabel,
  }));

  return {
    query: rawQuestion,
    resolvedIntent: `${category} Regional Deliveries & Distribution`,
    naturalLanguageAnswer: `${top.label} leads ${category} sales with ${formatUnits(top.value)} units (${top.percentage}% share), generating ${top.secondaryLabel} in revenue.`,
    cogniraInsight: `SUVs (including Aurion X1, X3, X5, and EV-X) account for over 56% of total company gross revenues, with southern and western corridors leading conversion rates.`,
    kpis: [
      { label: `Total ${category} Volume`, value: `${formatUnits(totalUnits)} units`, subtext: `${formatINR(totalRev)} gross revenue`, isHighlight: true },
      { label: `Top ${category} Region`, value: top.label, subtext: `${formatUnits(top.value)} units delivered` },
      { label: "Segment Share", value: "56.4%", subtext: "Of total Aurion vehicle revenues" },
    ],
    visualizationType: "bar",
    chartTitle: `${category} Deliveries by Region`,
    chartSubtitle: `Geographic volume distribution for ${category} line`,
    chartData,
    tableTitle: `${category} Regional Breakdown`,
    columns: [
      { key: "region", label: "Region", type: "text", sortable: true },
      { key: "units_sold", label: "Units Sold", type: "number", sortable: true },
      { key: "share_pct", label: "Share", type: "percentage", sortable: true },
      { key: "revenue", label: "Revenue", type: "currency", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT region, SUM(quantity) AS units_sold, SUM(final_amount) AS revenue 
FROM aurion_sales 
WHERE category LIKE '%${category}%' 
GROUP BY region 
ORDER BY units_sold DESC;`,
    processingPipeline: `aurion.sales.filter(s => s.category.includes('${category}')).groupBy(s => s.region)`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: sales.length,
    activeFiltersApplied: filters,
  };
}

function handleCustomerQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string
): QueryExecutionResult {
  const isBelow3 = q.includes("below 3");
  const isNewCustomers = q.includes("new customer") || q.includes("acquire");

  if (isBelow3) {
    const lowSat = db.customers.filter((c) => c.satisfaction_score < 3.0);
    const rows = lowSat.map((c) => ({
      customer_id: c.customer_id,
      name: c.name,
      city: c.city,
      region: c.region,
      customer_type: c.customer_type,
      satisfaction_score: c.satisfaction_score,
      acquisition_channel: c.acquisition_channel,
    }));

    const chartData: ChartDataPoint[] = lowSat.slice(0, 8).map((c) => ({
      label: c.name.split(" ")[0],
      value: c.satisfaction_score,
      formattedValue: `${c.satisfaction_score} ★`,
      color: "#ef4444",
    }));

    return {
      query: rawQuestion,
      resolvedIntent: "Low Satisfaction Customer Escalations (< 3.0 Score)",
      naturalLanguageAnswer: `There are ${lowSat.length} customers with satisfaction ratings below 3.0, primarily citing delivery delays and post-delivery accessory fitment issues.`,
      cogniraInsight: `Over 70% of low-satisfaction tickets are concentrated in commercial fleet deliveries. Deploying dedicated account managers reduces dissatisfaction churn by 85%.`,
      kpis: [
        { label: "Dissatisfied Customers (<3.0)", value: `${lowSat.length} Accounts`, subtext: "Requires service outreach", isHighlight: true },
        { label: "Lowest Score Recorded", value: "2.1 ★", subtext: "Fleet accounts in North region" },
        { label: "Overall Customer CSAT", value: "4.4 ★", subtext: "Across 650 active profiles" },
      ],
      visualizationType: "bar",
      chartTitle: "Customer Satisfaction Scores (Flagged Accounts)",
      chartSubtitle: "Accounts requiring prompt customer experience remediation",
      chartData,
      tableTitle: "Actionable Customer Remediation List",
      columns: [
        { key: "customer_id", label: "Customer ID", type: "text" },
        { key: "name", label: "Customer / Entity", type: "text", sortable: true },
        { key: "city", label: "City", type: "text", sortable: true },
        { key: "customer_type", label: "Type", type: "text" },
        { key: "satisfaction_score", label: "CSAT Score", type: "number", sortable: true },
        { key: "acquisition_channel", label: "Acquisition Channel", type: "text" },
      ],
      rows,
      sqlQuery: `SELECT customer_id, name, city, region, customer_type, satisfaction_score 
FROM aurion_customers 
WHERE satisfaction_score < 3.0 
ORDER BY satisfaction_score ASC;`,
      processingPipeline: `aurion.customers.filter(c => c.satisfaction_score < 3.0).sortBy('satisfaction_score')`,
      executionTimeMs: Math.round(performance.now() - startTime),
      recordsAnalyzed: db.customers.length,
    };
  }

  // New customers acquired
  const totalNew = db.monthlyPerformance.reduce((s, m) => s + m.new_customers, 0);
  const byYear2026 = db.monthlyPerformance.filter((m) => m.year === 2026).reduce((s, m) => s + m.new_customers, 0);
  const byYear2025 = db.monthlyPerformance.filter((m) => m.year === 2025).reduce((s, m) => s + m.new_customers, 0);

  const chartData: ChartDataPoint[] = [
    { label: "2025", value: byYear2025, formattedValue: `${formatUnits(byYear2025)} customers`, color: "#3b82f6" },
    { label: "2026", value: byYear2026, formattedValue: `${formatUnits(byYear2026)} customers`, color: "#00d9ff" },
  ];

  return {
    query: rawQuestion,
    resolvedIntent: "New Customer Acquisition Volume",
    naturalLanguageAnswer: `Aurion Motors acquired ${formatUnits(byYear2026)} new customers in 2026 (+${((byYear2026 - byYear2025) / byYear2025 * 100).toFixed(1)}% YoY growth), bringing total acquisitions to ${formatUnits(totalNew)} across the two-year reporting period.`,
    cogniraInsight: `Digital acquisition channels (Online Booking Portal & Search) saw a 42% uplift in conversion velocity in 2026 compared to traditional walk-in channels.`,
    kpis: [
      { label: "2026 New Customers", value: formatUnits(byYear2026), subtext: "Acquisitions this year", isHighlight: true },
      { label: "2025 New Customers", value: formatUnits(byYear2025), subtext: "Baseline year acquisitions" },
      { label: "YoY Customer Growth", value: `+${((byYear2026 - byYear2025) / byYear2025 * 100).toFixed(1)}%`, subtext: "Sustained organic momentum" },
    ],
    visualizationType: "bar",
    chartTitle: "New Customer Acquisitions by Year",
    chartSubtitle: "Year-over-Year client portfolio expansion",
    chartData,
    tableTitle: "Customer Acquisition Performance",
    columns: [
      { key: "period", label: "Period", type: "text" },
      { key: "acquisitions", label: "New Customers", type: "number" },
      { key: "growth", label: "Growth YoY", type: "text" },
    ],
    rows: [
      { period: "FY 2025", acquisitions: byYear2025, growth: "Baseline" },
      { period: "FY 2026", acquisitions: byYear2026, growth: `+${((byYear2026 - byYear2025) / byYear2025 * 100).toFixed(1)}%` },
    ],
    sqlQuery: `SELECT year, SUM(new_customers) AS total_acquired 
FROM aurion_monthly_performance 
GROUP BY year;`,
    processingPipeline: `aurion.monthlyPerformance.groupBy(m => m.year).sum('new_customers')`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: db.monthlyPerformance.length,
  };
}

function handleServiceQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string
): QueryExecutionResult {
  const isRevenue = q.includes("revenue") || q.includes("cost");
  const isIssueFrequency = q.includes("issue") || q.includes("frequently") || q.includes("common");

  if (isIssueFrequency) {
    const issueMap: Record<string, number> = {};
    db.serviceRecords.forEach((s) => {
      issueMap[s.issue_category] = (issueMap[s.issue_category] || 0) + 1;
    });

    const chartData: ChartDataPoint[] = Object.entries(issueMap)
      .sort((a, b) => b[1] - a[1])
      .map(([issue, count]) => ({
        label: issue,
        value: count,
        formattedValue: `${count} cases`,
        percentage: Math.round((count / db.serviceRecords.length) * 1000) / 10,
        color: issue === "Periodic Maintenance" ? "#00d9ff" : "#3b82f6",
      }));

    const top = chartData[0];
    const rows = chartData.map((d) => ({
      issue_category: d.label,
      incident_count: d.value,
      share_of_incidents: `${d.percentage}%`,
      recommended_action: d.label === "Periodic Maintenance" ? "Streamline express bay" : "OTA Firmware patch rollout",
    }));

    return {
      query: rawQuestion,
      resolvedIntent: "Vehicle Service Issue Frequency & Root Cause Analysis",
      naturalLanguageAnswer: `“${top.label}” occurs most frequently with ${top.value} service logs (${top.percentage}% of all service visits), followed by Software Updates and Electrical diagnostic checks.`,
      cogniraInsight: `Software updates account for 18% of physical service center visits. Transitioning to Over-The-Air (OTA) updates will save ₹1.2 Cr in operational workshop costs annually.`,
      kpis: [
        { label: "Most Common Issue", value: top.label, subtext: `${top.value} logged service visits`, isHighlight: true },
        { label: "Total Service Logs", value: `${formatUnits(db.serviceRecords.length)} records`, subtext: "Jan 2025 - Dec 2026" },
        { label: "Resolution Rate", value: "95.4%", subtext: "Resolved within SLA window" },
      ],
      visualizationType: "horizontal-bar",
      chartTitle: "Vehicle Service Issues by Frequency",
      chartSubtitle: "Distribution of maintenance and repair categories",
      chartData,
      tableTitle: "Service Incident Breakdown",
      columns: [
        { key: "issue_category", label: "Issue Category", type: "text", sortable: true },
        { key: "incident_count", label: "Logged Incidents", type: "number", sortable: true },
        { key: "share_of_incidents", label: "% Share", type: "percentage", sortable: true },
        { key: "recommended_action", label: "Strategic Action", type: "text" },
      ],
      rows,
      sqlQuery: `SELECT issue_category, COUNT(*) AS incident_count, 
       ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM aurion_service_records), 1) AS share_pct 
FROM aurion_service_records 
GROUP BY issue_category 
ORDER BY incident_count DESC;`,
      processingPipeline: `aurion.serviceRecords.groupBy(s => s.issue_category).count()`,
      executionTimeMs: Math.round(performance.now() - startTime),
      recordsAnalyzed: db.serviceRecords.length,
    };
  }

  // Service revenue by region
  const regionRev: Record<string, number> = {};
  db.serviceRecords.forEach((s) => {
    regionRev[s.region] = (regionRev[s.region] || 0) + s.service_cost;
  });

  const totalRev = Object.values(regionRev).reduce((a, b) => a + b, 0);
  const chartData: ChartDataPoint[] = Object.entries(regionRev)
    .sort((a, b) => b[1] - a[1])
    .map(([region, rev]) => ({
      label: region,
      value: Math.round(rev / 100000), // in Lakhs
      formattedValue: formatINR(rev),
      secondaryValue: rev,
      percentage: Math.round((rev / (totalRev || 1)) * 1000) / 10,
      color: "#00d9ff",
    }));

  const top = chartData[0];
  const rows = chartData.map((d) => ({
    region: d.label,
    service_revenue: formatINR(d.secondaryValue || 0),
    share: `${d.percentage}%`,
  }));

  return {
    query: rawQuestion,
    resolvedIntent: "Regional Service & Aftersales Revenue",
    naturalLanguageAnswer: `${top.label} generates the highest service revenue at ${formatINR(top.secondaryValue || 0)} (${top.percentage}% of network total), driven by its large installed vehicle base.`,
    cogniraInsight: `Aftersales service revenue operates at a healthy 44% gross margin. Expanding extended warranty bundles during initial delivery will secure recurring maintenance cashflows.`,
    kpis: [
      { label: "Top Service Region", value: top.label, subtext: `${formatINR(top.secondaryValue || 0)} in revenue`, isHighlight: true },
      { label: "Total Service Revenue", value: formatINR(totalRev), subtext: "Across 18 authorized workshops" },
      { label: "Avg Service Cost / Visit", value: formatINR(totalRev / db.serviceRecords.length), subtext: "Regular + Repairs blended" },
    ],
    visualizationType: "bar",
    chartTitle: "Service Revenue by Region",
    chartSubtitle: "Workshop service billing volume",
    chartData,
    tableTitle: "Regional Aftersales Revenue Summary",
    columns: [
      { key: "region", label: "Region", type: "text", sortable: true },
      { key: "service_revenue", label: "Service Revenue", type: "currency", sortable: true },
      { key: "share", label: "% Share", type: "percentage", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT region, SUM(service_cost) AS total_service_revenue 
FROM aurion_service_records 
GROUP BY region 
ORDER BY total_service_revenue DESC;`,
    processingPipeline: `aurion.serviceRecords.groupBy(s => s.region).sum('service_cost')`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: db.serviceRecords.length,
  };
}

function handleMarketingQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string
): QueryExecutionResult {
  const isChannelConversions = q.includes("channel") && q.includes("conversions");
  const isSpendVsRevenue = q.includes("spend") && q.includes("revenue");

  if (isChannelConversions) {
    const channelMap: Record<string, { conversions: number; spend: number; leads: number }> = {};
    db.marketingCampaigns.forEach((c) => {
      if (!channelMap[c.channel]) channelMap[c.channel] = { conversions: 0, spend: 0, leads: 0 };
      channelMap[c.channel].conversions += c.conversions;
      channelMap[c.channel].spend += c.spend;
      channelMap[c.channel].leads += c.leads;
    });

    const chartData: ChartDataPoint[] = Object.entries(channelMap)
      .sort((a, b) => b[1].conversions - a[1].conversions)
      .map(([channel, data]) => ({
        label: channel,
        value: data.conversions,
        formattedValue: `${data.conversions} vehicles`,
        secondaryValue: data.spend,
        secondaryLabel: formatINR(data.spend),
        color: "#00d9ff",
      }));

    const top = chartData[0];
    const rows = chartData.map((d) => ({
      channel: d.label,
      conversions: d.value,
      spend: d.secondaryLabel,
      cost_per_acquisition: formatINR((d.secondaryValue || 0) / (d.value || 1)),
    }));

    return {
      query: rawQuestion,
      resolvedIntent: "Marketing Channel Conversion Performance",
      naturalLanguageAnswer: `“${top.label}” generates the most direct vehicle conversions with ${top.value} units sold, at an efficient CPA of ${formatINR((top.secondaryValue || 0) / (top.value || 1))}.`,
      cogniraInsight: `Google Search and Dealer Events generate the highest lead-to-booking conversion rate (3.0% - 4.2%), whereas Outdoor Billboards serve primarily top-of-funnel brand recall.`,
      kpis: [
        { label: "Top Converting Channel", value: top.label, subtext: `${top.value} vehicle bookings`, isHighlight: true },
        { label: "Total Campaign Bookings", value: `${db.marketingCampaigns.reduce((s, c) => s + c.conversions, 0)} units`, subtext: "Directly attributed" },
        { label: "Avg Cost Per Booking", value: formatINR(db.marketingCampaigns.reduce((s, c) => s + c.spend, 0) / db.marketingCampaigns.reduce((s, c) => s + c.conversions, 0)), subtext: "Across all marketing media" },
      ],
      visualizationType: "horizontal-bar",
      chartTitle: "Vehicle Conversions by Marketing Channel",
      chartSubtitle: "Direct customer bookings attributed to media channels",
      chartData,
      tableTitle: "Channel Efficiency Matrix",
      columns: [
        { key: "channel", label: "Media Channel", type: "text", sortable: true },
        { key: "conversions", label: "Bookings", type: "number", sortable: true },
        { key: "spend", label: "Campaign Spend", type: "currency", sortable: true },
        { key: "cost_per_acquisition", label: "Cost Per Sale (CPA)", type: "currency", sortable: true },
      ],
      rows,
      sqlQuery: `SELECT channel, SUM(conversions) AS total_conversions, SUM(spend) AS total_spend, 
       ROUND(SUM(spend) / SUM(conversions), 0) AS cost_per_acquisition 
FROM aurion_marketing_campaigns 
GROUP BY channel 
ORDER BY total_conversions DESC;`,
      processingPipeline: `aurion.marketingCampaigns.groupBy(c => c.channel).aggregate({ conversions: sum(conversions), spend: sum(spend) })`,
      executionTimeMs: Math.round(performance.now() - startTime),
      recordsAnalyzed: db.marketingCampaigns.length,
    };
  }

  // Marketing ROI or Spend vs Revenue by Campaign
  const chartData: ChartDataPoint[] = db.marketingCampaigns
    .sort((a, b) => b.roi - a.roi)
    .map((c) => ({
      label: c.campaign_name.replace("Aurion ", ""),
      value: c.roi,
      formattedValue: `${c.roi}% ROI`,
      secondaryValue: c.revenue_generated,
      secondaryLabel: formatINR(c.revenue_generated),
      color: c.roi > 1000 ? "#00d9ff" : "#3b82f6",
    }));

  const top = chartData[0];
  const totalSpend = db.marketingCampaigns.reduce((s, c) => s + c.spend, 0);
  const totalRev = db.marketingCampaigns.reduce((s, c) => s + c.revenue_generated, 0);

  const rows = db.marketingCampaigns.map((c) => ({
    campaign_name: c.campaign_name,
    channel: c.channel,
    region: c.region,
    spend: formatINR(c.spend),
    conversions: c.conversions,
    revenue_generated: formatINR(c.revenue_generated),
    roi: `${c.roi}%`,
  }));

  return {
    query: rawQuestion,
    resolvedIntent: isSpendVsRevenue ? "Marketing Spend vs Attributed Revenue" : "Marketing Campaign ROI Benchmark",
    naturalLanguageAnswer: `Marketing investments generated ${formatINR(totalRev)} in vehicle bookings from ${formatINR(totalSpend)} in total spend, led by “${top.label}” delivering ${top.formattedValue}.`,
    cogniraInsight: `Email showcases and regional dealer events deliver disproportionately high ROI (>1,000%) by engaging pre-qualified high-intent luxury sedan and SUV buyers.`,
    kpis: [
      { label: "Top ROI Campaign", value: top.label, subtext: top.formattedValue, isHighlight: true },
      { label: "Attributed Revenue", value: formatINR(totalRev), subtext: `From ${formatINR(totalSpend)} media spend` },
      { label: "Blended Marketing ROI", value: `${Math.round((totalRev / totalSpend) * 100)}%`, subtext: "10 active campaign initiatives" },
    ],
    visualizationType: "horizontal-bar",
    chartTitle: "Campaign Return on Investment (ROI %)",
    chartSubtitle: "Direct revenue yield vs campaign media spend",
    chartData,
    tableTitle: "Marketing Campaign Performance Ledger",
    columns: [
      { key: "campaign_name", label: "Campaign", type: "text", sortable: true },
      { key: "channel", label: "Channel", type: "text", sortable: true },
      { key: "spend", label: "Spend", type: "currency", sortable: true },
      { key: "conversions", label: "Sales", type: "number", sortable: true },
      { key: "revenue_generated", label: "Revenue", type: "currency", sortable: true },
      { key: "roi", label: "ROI", type: "percentage", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT campaign_name, channel, spend, conversions, revenue_generated, roi 
FROM aurion_marketing_campaigns 
ORDER BY roi DESC;`,
    processingPipeline: `aurion.marketingCampaigns.sortByDesc('roi')`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: db.marketingCampaigns.length,
  };
}

function handleEmployeeQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string
): QueryExecutionResult {
  const salesStaff = db.employees.filter((e) => e.department === "Sales" && e.sales_target > 0);
  const isExceededTarget = q.includes("exceeded") || q.includes("target");

  const staffWithQuota = salesStaff.map((e) => ({
    ...e,
    achievement_pct: Math.round((e.sales_achieved / e.sales_target) * 1000) / 10,
  }));

  staffWithQuota.sort((a, b) => b.achievement_pct - a.achievement_pct);
  const exceededList = staffWithQuota.filter((e) => e.achievement_pct >= 100);

  const top = staffWithQuota[0];
  const chartData: ChartDataPoint[] = staffWithQuota.slice(0, 8).map((e) => ({
    label: e.name,
    value: e.achievement_pct,
    formattedValue: `${e.achievement_pct}%`,
    secondaryValue: e.sales_achieved,
    secondaryLabel: `${e.sales_achieved} / ${e.sales_target} units`,
    color: e.achievement_pct >= 100 ? "#00d9ff" : "#ef4444",
  }));

  const rows = staffWithQuota.map((e) => ({
    name: e.name,
    role: e.role,
    dealership: e.dealership,
    region: e.region,
    sales_achieved: e.sales_achieved,
    sales_target: e.sales_target,
    achievement: `${e.achievement_pct}%`,
    performance_score: `${e.performance_score} / 100`,
  }));

  const answer = isExceededTarget
    ? `${exceededList.length} of ${salesStaff.length} sales specialists exceeded their quotas, led by ${top.name} at ${top.dealership} with ${top.achievement_pct}% quota achievement.`
    : `Sales team performance is led by ${top.name} (${top.achievement_pct}% quota attainment), with network-wide consultant performance averaging 94.2%.`;

  return {
    query: rawQuestion,
    resolvedIntent: "Salesforce Quota Attainment & Performance Ranking",
    naturalLanguageAnswer: answer,
    cogniraInsight: `Consultants specializing in Corporate Fleet accounts achieved 118% quota on average, outperforming retail walk-in specialists. Cross-training retail advisors on fleet leases will boost mid-market conversions.`,
    kpis: [
      { label: "Top Performing Salesperson", value: top.name, subtext: `${top.achievement_pct}% Quota (${top.dealership})`, isHighlight: true },
      { label: "Quota Overachievers", value: `${exceededList.length} of ${salesStaff.length}`, subtext: "Eligible for annual president club" },
      { label: "Avg Quota Achievement", value: "94.2%", subtext: "Across sales specialists" },
    ],
    visualizationType: "horizontal-bar",
    chartTitle: "Salesperson Quota Achievement (%)",
    chartSubtitle: "Individual sales deliveries vs assigned targets",
    chartData,
    tableTitle: "Salesforce Scorecard",
    columns: [
      { key: "name", label: "Consultant", type: "text", sortable: true },
      { key: "dealership", label: "Dealership", type: "text", sortable: true },
      { key: "sales_achieved", label: "Delivered", type: "number", sortable: true },
      { key: "sales_target", label: "Target", type: "number", sortable: true },
      { key: "achievement", label: "Quota %", type: "percentage", sortable: true },
      { key: "performance_score", label: "Score", type: "text", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT name, role, dealership, region, sales_achieved, sales_target,
       ROUND(sales_achieved * 100.0 / sales_target, 1) AS achievement_pct, performance_score 
FROM aurion_employees 
WHERE department = 'Sales' AND sales_target > 0 
ORDER BY achievement_pct DESC;`,
      processingPipeline: `aurion.employees.filter(e => e.department === 'Sales').calculateAchievement()`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: salesStaff.length,
  };
}

function handleFinanceQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string
): QueryExecutionResult {
  const isMarginByRegion = q.includes("gross margin");

  if (isMarginByRegion) {
    // Gross margin by region
    const marginMap: Record<string, { rev: number; exp: number }> = {
      South: { rev: 0, exp: 0 },
      West: { rev: 0, exp: 0 },
      North: { rev: 0, exp: 0 },
      East: { rev: 0, exp: 0 },
      Central: { rev: 0, exp: 0 },
    };

    db.financialRecords.forEach((f) => {
      if (marginMap[f.region]) {
        if (f.type === "Revenue") marginMap[f.region].rev += f.amount;
        else marginMap[f.region].exp += f.amount;
      }
    });

    const chartData: ChartDataPoint[] = Object.entries(marginMap).map(([region, data]) => {
      const marginPct = data.rev > 0 ? Math.round(((data.rev - data.exp) / data.rev) * 1000) / 10 : 15.0;
      return {
        label: region,
        value: Math.max(0, marginPct),
        formattedValue: `${marginPct}%`,
        secondaryValue: data.rev,
        secondaryLabel: formatINR(data.rev),
        color: marginPct > 18 ? "#00d9ff" : "#3b82f6",
      };
    }).sort((a, b) => b.value - a.value);

    const top = chartData[0];
    const rows = chartData.map((d) => ({
      region: d.label,
      gross_margin_pct: `${d.value}%`,
      total_revenue: d.secondaryLabel,
    }));

    return {
      query: rawQuestion,
      resolvedIntent: "Regional Gross Margin Analysis",
      naturalLanguageAnswer: `${top.label} boasts the highest operating gross margin at ${top.value}%, driven by strong premium variant adoption and high dealership turnover efficiency.`,
      cogniraInsight: `Central and East regions exhibit lower gross margins due to higher logistical freight tariffs from central manufacturing hubs. Localizing PDI facilities can recoup 1.8% in margin.`,
      kpis: [
        { label: "Top Margin Region", value: `${top.value}%`, subtext: `${top.label} Region`, isHighlight: true },
        { label: "Blended Company Margin", value: "17.4%", subtext: "Across 24 reporting months" },
        { label: "Lowest Region Margin", value: `${chartData[chartData.length - 1]?.value}%`, subtext: chartData[chartData.length - 1]?.label },
      ],
      visualizationType: "bar",
      chartTitle: "Operating Gross Margin by Region (%)",
      chartSubtitle: "Net operational profitability variance across territories",
      chartData,
      tableTitle: "Regional Margin Performance",
      columns: [
        { key: "region", label: "Region", type: "text", sortable: true },
        { key: "gross_margin_pct", label: "Gross Margin", type: "percentage", sortable: true },
        { key: "total_revenue", label: "Revenue Base", type: "currency", sortable: true },
      ],
      rows,
      sqlQuery: `SELECT region, 
       ROUND((SUM(CASE WHEN type = 'Revenue' THEN amount ELSE 0 END) - 
              SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END)) * 100.0 / 
              SUM(CASE WHEN type = 'Revenue' THEN amount ELSE 0 END), 1) AS gross_margin_pct 
FROM aurion_financial_records 
GROUP BY region 
ORDER BY gross_margin_pct DESC;`,
      processingPipeline: `aurion.financialRecords.groupBy(f => f.region).calculateGrossMargin()`,
      executionTimeMs: Math.round(performance.now() - startTime),
      recordsAnalyzed: db.financialRecords.length,
    };
  }

  // Revenue vs Expenses overall
  const totalRev = db.financialRecords.filter((f) => f.type === "Revenue").reduce((s, f) => s + f.amount, 0);
  const totalExp = db.financialRecords.filter((f) => f.type === "Expense").reduce((s, f) => s + f.amount, 0);
  const netOperatingIncome = totalRev - totalExp;

  const chartData: ChartDataPoint[] = [
    { label: "Total Revenue", value: Math.round(totalRev / 10000000), formattedValue: formatINR(totalRev), color: "#00d9ff" },
    { label: "Total Operating Expenses", value: Math.round(totalExp / 10000000), formattedValue: formatINR(totalExp), color: "#f43f5e" },
    { label: "Net Operating Income", value: Math.round(netOperatingIncome / 10000000), formattedValue: formatINR(netOperatingIncome), color: "#10b981" },
  ];

  const expByCategory: Record<string, number> = {};
  db.financialRecords.filter((f) => f.type === "Expense").forEach((f) => {
    expByCategory[f.category] = (expByCategory[f.category] || 0) + f.amount;
  });

  const rows = [
    { category: "Vehicle Sales (Commercial)", type: "Revenue", amount: formatINR(totalRev * 0.94) },
    { category: "Aftersales Service Billing", type: "Revenue", amount: formatINR(totalRev * 0.06) },
    ...Object.entries(expByCategory).map(([cat, amt]) => ({
      category: `${cat} Overhead`,
      type: "Expense",
      amount: formatINR(amt),
    })),
  ];

  return {
    query: rawQuestion,
    resolvedIntent: "Corporate Financial Audit: Revenue vs Expenses",
    naturalLanguageAnswer: `Aurion Motors generated ${formatINR(totalRev)} in total revenue against ${formatINR(totalExp)} in operating expenses, resulting in a healthy net operating income of ${formatINR(netOperatingIncome)} (17.2% net operating margin).`,
    cogniraInsight: `Salaries and Logistics form 58% of total operational expenditure. Automating parts distribution across regional hubs will compress supply-chain lead times and lower freight expenses.`,
    kpis: [
      { label: "Total Revenue", value: formatINR(totalRev), subtext: "Vehicle Sales + Service", isHighlight: true },
      { label: "Operating Expenses", value: formatINR(totalExp), subtext: "Salaries, Logistics, Marketing" },
      { label: "Net Operating Margin", value: formatINR(netOperatingIncome), subtext: `${((netOperatingIncome / totalRev) * 100).toFixed(1)}% operating margin` },
    ],
    visualizationType: "bar",
    chartTitle: "Revenue vs Expenses Overview (₹ Cr)",
    chartSubtitle: "Enterprise P&L Summary (2025-2026)",
    chartData,
    tableTitle: "Financial Line Items Breakdown",
    columns: [
      { key: "category", label: "Line Item", type: "text", sortable: true },
      { key: "type", label: "Cashflow Type", type: "badge" },
      { key: "amount", label: "Total Amount", type: "currency", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT type, category, SUM(amount) AS total_amount 
FROM aurion_financial_records 
GROUP BY type, category 
ORDER BY type DESC, total_amount DESC;`,
    processingPipeline: `aurion.financialRecords.groupBy(['type', 'category']).sum('amount')`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: db.financialRecords.length,
  };
}

function handleChannelQuery(
  q: string,
  db: AurionDatabase,
  startTime: number,
  rawQuestion: string,
  filters: QueryFilter
): QueryExecutionResult {
  const sales = applySalesFilters(db.sales, filters);
  const totalUnits = sales.reduce((a, b) => a + b.quantity, 0);

  const channelMap: Record<string, { units: number; rev: number }> = {};
  sales.forEach((s) => {
    if (!channelMap[s.sales_channel]) channelMap[s.sales_channel] = { units: 0, rev: 0 };
    channelMap[s.sales_channel].units += s.quantity;
    channelMap[s.sales_channel].rev += s.final_amount;
  });

  const chartData: ChartDataPoint[] = Object.entries(channelMap)
    .sort((a, b) => b[1].units - a[1].units)
    .map(([ch, data]) => ({
      label: ch,
      value: data.units,
      formattedValue: `${formatUnits(data.units)} units`,
      secondaryValue: data.rev,
      secondaryLabel: formatINR(data.rev),
      percentage: totalUnits > 0 ? Math.round((data.units / totalUnits) * 1000) / 10 : 0,
      color: ch === "Online" ? "#00d9ff" : ch === "Dealer" ? "#3b82f6" : ch === "Corporate" ? "#10b981" : "#8b5cf6",
    }));

  const onlineUnits = channelMap["Online"]?.units || 0;
  const corporateUnits = (channelMap["Corporate"]?.units || 0) + (channelMap["Fleet"]?.units || 0);

  const rows = chartData.map((d) => ({
    sales_channel: d.label,
    units_sold: d.value,
    share: `${d.percentage}%`,
    revenue: d.secondaryLabel,
    avg_ticket: formatINR((d.secondaryValue || 0) / (d.value || 1)),
  }));

  const answer = q.includes("online")
    ? `Aurion Motors sold ${formatUnits(onlineUnits)} vehicles online through direct digital booking channels, generating ${formatINR(channelMap["Online"]?.rev || 0)}.`
    : q.includes("fleet") || q.includes("corporate")
    ? `Corporate and Fleet sales accounted for ${formatUnits(corporateUnits)} vehicles delivered, contributing ${formatINR((channelMap["Corporate"]?.rev || 0) + (channelMap["Fleet"]?.rev || 0))} in B2B enterprise revenue.`
    : `Dealerships remain the primary sales channel with ${formatUnits(channelMap["Dealer"]?.units || 0)} units delivered, while Online sales reached ${formatUnits(onlineUnits)} units (${((onlineUnits / (totalUnits || 1)) * 100).toFixed(1)}% share).`;

  return {
    query: rawQuestion,
    resolvedIntent: "Sales Channel Distribution (Dealer, Online, Corporate, Fleet)",
    naturalLanguageAnswer: answer,
    cogniraInsight: `Online reservations have an 88% completion rate when paired with home test-drives. Expanding doorstep delivery across Bengaluru, Mumbai, and Delhi will increase direct margin retention.`,
    kpis: [
      { label: "Online Channel Deliveries", value: `${formatUnits(onlineUnits)} units`, subtext: `${((onlineUnits / (totalUnits || 1)) * 100).toFixed(1)}% total share`, isHighlight: true },
      { label: "Corporate & Fleet Volume", value: `${formatUnits(corporateUnits)} units`, subtext: "High volume enterprise B2B" },
      { label: "Dealer Showroom Share", value: `${(( (channelMap["Dealer"]?.units || 0) / (totalUnits || 1)) * 100).toFixed(1)}%`, subtext: "Core physical retail channel" },
    ],
    visualizationType: "donut",
    chartTitle: "Vehicle Sales by Distribution Channel",
    chartSubtitle: "Channel volume and market share breakdown",
    chartData,
    tableTitle: "Sales Channel Performance Summary",
    columns: [
      { key: "sales_channel", label: "Channel", type: "text", sortable: true },
      { key: "units_sold", label: "Units Sold", type: "number", sortable: true },
      { key: "share", label: "Share", type: "percentage", sortable: true },
      { key: "revenue", label: "Total Revenue", type: "currency", sortable: true },
      { key: "avg_ticket", label: "Avg Transaction Value", type: "currency", sortable: true },
    ],
    rows,
    sqlQuery: `SELECT sales_channel, SUM(quantity) AS units_sold, SUM(final_amount) AS revenue,
       ROUND(SUM(quantity) * 100.0 / (SELECT SUM(quantity) FROM aurion_sales), 1) AS share_pct 
FROM aurion_sales 
GROUP BY sales_channel 
ORDER BY units_sold DESC;`,
    processingPipeline: `aurion.sales.groupBy(s => s.sales_channel).aggregate({ units: sum(quantity), rev: sum(final_amount) })`,
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: sales.length,
    activeFiltersApplied: filters,
  };
}

function handleOutOfDomain(rawQuestion: string, startTime: number): QueryExecutionResult {
  return {
    query: rawQuestion,
    resolvedIntent: "Query Out of Available Scope",
    naturalLanguageAnswer: "I don't have enough data to answer that question.",
    cogniraInsight: `Cognira is connected to the Aurion Motors enterprise business intelligence database. Try asking one of the suggested business queries below.`,
    kpis: [],
    visualizationType: "table-only",
    chartTitle: "No Visualization Available",
    chartData: [],
    tableTitle: "Suggested Business Questions",
    columns: [
      { key: "topic", label: "Business Domain", type: "text" },
      { key: "suggested_question", label: "Recommended Question to Ask", type: "text" },
    ],
    rows: [
      { topic: "Sales & Volume", suggested_question: "Show vehicle sales by region." },
      { topic: "Model Performance", suggested_question: "Which model is performing best?" },
      { topic: "Powertrains", suggested_question: "Compare EV and petrol sales." },
      { topic: "Dealerships", suggested_question: "Which dealerships are below target?" },
      { topic: "Inventory", suggested_question: "Which vehicles have been in inventory for more than 60 days?" },
      { topic: "Financials", suggested_question: "Show revenue versus expenses." },
    ],
    sqlQuery: "-- No database execution performed for out-of-domain prompt.",
    processingPipeline: "No data pipeline triggered. Prompt does not map to Aurion Motors schema.",
    executionTimeMs: Math.round(performance.now() - startTime),
    recordsAnalyzed: 0,
    isOutOfDomain: true,
    suggestions: [
      "Show vehicle sales by region.",
      "Which model is performing best?",
      "Compare sales between South and West.",
      "Which dealerships are below target?",
      "Which vehicles have been in inventory for more than 60 days?",
      "Show revenue versus expenses.",
    ],
  };
}
