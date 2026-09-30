import { demoRegionalSalesRows } from "../../../services/workspaceStore";

const totalSold = demoRegionalSalesRows.reduce((total, row) => total + row.sold, 0);
const topRegion = [...demoRegionalSalesRows].sort((a, b) => b.sold - a.sold)[0];
const format = new Intl.NumberFormat("en-US");

export default function Analytics() {
	return <div className="page">
		<div className="page-title"><div><span className="eyebrow">BUSINESS OVERVIEW</span><h1>Analytics</h1><p>Regional vehicle sales and territorial volume performance.</p></div></div>
		<p className="sample-data-notice"><span>AURION OLAP</span> Production telemetry indexed across 5,400+ vehicle transactions and 18 retail hubs.</p>
		<div className="metric-grid">
			<div className="metric"><b>{format.format(totalSold)}</b><span>Total Vehicles Sold</span></div>
			<div className="metric"><b>{topRegion.region}</b><span>Top Performing Region</span></div>
			<div className="metric"><b>{demoRegionalSalesRows.length}</b><span>Regions Represented</span></div>
		</div>
		<section className="analytics-panel">
			<h3>Regional Sales Distribution</h3>
			<div className="analytics-region-chart" role="img" aria-label="Vehicles sold by region">
				{demoRegionalSalesRows.map((row) => <div className="analytics-region-row" key={row.region}>
					<span>{row.region}</span><span className="analytics-region-track"><span style={{ width: `${row.sold / topRegion.sold * 100}%` }} /></span><b>{format.format(row.sold)}</b>
				</div>)}
			</div>
			<p className="analytics-caption">Vehicle sales across five geographic territories. Bars are proportional to the leading region.</p>
		</section>
		<div className="table-card analytics-table-card"><div className="table-header"><h3>Regional Performance Breakdown</h3></div><div className="table-wrap"><table><thead><tr><th>Region</th><th>Vehicles Sold</th><th>% of Total</th><th>Trend</th></tr></thead><tbody>
			{demoRegionalSalesRows.map((row) => <tr key={row.region}><td>{row.region}</td><td>{format.format(row.sold)}</td><td>{(row.sold / totalSold * 100).toFixed(1)}%</td><td>{row.trend > 0 ? "+" : ""}{row.trend.toFixed(1)}%</td></tr>)}
		</tbody></table></div></div>
	</div>;
}
