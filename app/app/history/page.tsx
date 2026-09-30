"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Search, Trash2 } from "lucide-react";
import { clearQueryHistory, deleteQueryFromHistory, readQueryHistory, type QueryHistoryEntry } from "../../../services/workspaceStore";

export default function History() {
	const router = useRouter();
	const [entries, setEntries] = useState<QueryHistoryEntry[]>([]);
	const [search, setSearch] = useState("");

	useEffect(() => {
		const refresh = () => setEntries(readQueryHistory());
		refresh();
		window.addEventListener("cognira:history-updated", refresh);
		return () => window.removeEventListener("cognira:history-updated", refresh);
	}, []);

	const filtered = useMemo(() => {
		const term = search.trim().toLowerCase();
		return entries.filter((entry) => !term || `${entry.query} ${entry.resultType}`.toLowerCase().includes(term));
	}, [entries, search]);

	const reopen = (entry: QueryHistoryEntry) => {
		window.localStorage.setItem("cognira_pending_query", entry.query);
		router.push("/app");
	};

	const clearHistory = () => {
		clearQueryHistory();
		setEntries([]);
	};

	return (
		<div className="page">
			<div className="page-title">
				<div><span className="eyebrow">ACTIVITY</span><h1>Query History</h1><p>Previously submitted business questions.</p></div>
				<div className="history-controls">
					<label className="search-mini"><Search size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search history" aria-label="Search history" /></label>
					{entries.length > 0 && <button className="table-btn" type="button" onClick={clearHistory}><Trash2 size={14}/>Clear history</button>}
				</div>
			</div>

			{filtered.length ? (
				<div className="table-card history-table-card">
					<div className="table-wrap"><table><thead><tr><th>Question</th><th>Area</th><th>Time</th><th aria-label="Actions" /></tr></thead>
						<tbody>{filtered.map((entry) => <tr key={entry.id}>
							<td><button className="history-query" type="button" onClick={() => reopen(entry)}>{entry.query}</button></td>
							<td>{entry.resultType}</td>
							<td><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time></td>
							<td className="history-actions"><button className="table-btn" type="button" onClick={() => reopen(entry)}>Open</button><button className="table-btn" type="button" aria-label={`Delete ${entry.query}`} onClick={() => setEntries(deleteQueryFromHistory(entry.id))}><Trash2 size={14}/></button></td>
						</tr>)}</tbody>
					</table></div>
				</div>
			) : (
				<section className="history-empty">
					<Clock3 size={24}/>
					<h2>{search ? "No matching queries" : "No queries yet"}</h2>
					<p>{search ? "Try a different search term." : "Start exploring your business data with Cognira."}</p>
					{!search && <Link className="primary-btn" href="/app">Ask Cognira</Link>}
				</section>
			)}
		</div>
	);
}
