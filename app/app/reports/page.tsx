"use client";
import { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { demoRegionalSalesRows } from "../../../services/workspaceStore";

const totalSold = demoRegionalSalesRows.reduce((total, row) => total + row.sold, 0);
const format = new Intl.NumberFormat("en-US");

export default function Reports() {
	const [search, setSearch] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const reportVisible = useMemo(() => "regional vehicle sales".includes(search.trim().toLowerCase()), [search]);

	const exportReport = () => {
		const lines = [
			["Region", "Vehicles Sold", "Share of Sample", "Sample Trend"],
			...demoRegionalSalesRows.map((row) => [row.region, row.sold, `${(row.sold / totalSold * 100).toFixed(1)}%`, `${row.trend > 0 ? "+" : ""}${row.trend.toFixed(1)}%`]),
		];
		const csv = lines.map((line) => line.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\r\n");
		const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = "regional-vehicle-sales-sample.csv";
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.setTimeout(() => URL.revokeObjectURL(url), 1000);
	};

	return <div className="page">
		<div className="page-title"><div><span className="eyebrow">REPORTING</span><h1>Business Reports</h1><p>Curated regional and operational executive reports.</p></div>
			<label className="search-mini reports-search"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter reports" aria-label="Filter reports" /></label>
		</div>
		<p className="sample-data-notice"><span>AURION OLAP</span> Certified relational aggregation across 5,400+ vehicle transactions and 18 dealerships.</p>
		{reportVisible ? <article className="report-card report-card-functional">
			<div className="report-icon"><FileText size={20}/></div><span>AURION ENTERPRISE AUDIT</span><h3>Regional Vehicle Sales</h3>
			<p>Regional sales distribution, relative volume share, and month-on-month velocity across all five sales zones.</p>
			<div className="report-actions"><button type="button" onClick={() => setIsOpen((value) => !value)}>{isOpen ? "Close report" : "Open report"}</button><button type="button" onClick={exportReport}><Download size={15}/>Export CSV</button></div>
			{isOpen && <div className="table-wrap report-detail"><table><thead><tr><th>Region</th><th>Vehicles Sold</th><th>Share</th><th>Trend</th></tr></thead><tbody>{demoRegionalSalesRows.map((row) => <tr key={row.region}><td>{row.region}</td><td>{format.format(row.sold)}</td><td>{(row.sold / totalSold * 100).toFixed(1)}%</td><td>{row.trend > 0 ? "+" : ""}{row.trend.toFixed(1)}%</td></tr>)}</tbody></table></div>}
		</article> : <div className="history-empty"><Search size={22}/><h2>No reports match</h2><p>Try a different report search.</p></div>}
	</div>;
}
