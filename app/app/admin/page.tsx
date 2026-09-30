"use client";
import { useEffect, useState, type FormEvent } from "react";

type UserRow = { id: string; name: string; role: string; status: "Active" | "Inactive" };
const initialUsers: UserRow[] = [
	{ id: "EMP001", name: "Arun Mehta", role: "Employee", status: "Active" },
	{ id: "EMP002", name: "Kavya Nair", role: "Employee", status: "Active" },
	{ id: "MGR001", name: "Priya Sharma", role: "Manager", status: "Active" },
	{ id: "MGR002", name: "Rohan Iyer", role: "Manager", status: "Active" },
	{ id: "ADM001", name: "Suresh Kumar", role: "Administrator", status: "Active" },
];
const usersKey = "cognira_demo_users";

export default function Admin() {
	const [rows, setRows] = useState(initialUsers);
	const [isLoaded, setIsLoaded] = useState(false);
	const [isAdding, setIsAdding] = useState(false);
	const [formError, setFormError] = useState("");

	useEffect(() => {
		try {
			const stored = window.localStorage.getItem(usersKey);
			if (stored) {
				const parsed: unknown = JSON.parse(stored);
				if (Array.isArray(parsed)) setRows(parsed);
			}
		} catch {
			setRows(initialUsers);
		}
		setIsLoaded(true);
	}, []);

	useEffect(() => {
		if (isLoaded) window.localStorage.setItem(usersKey, JSON.stringify(rows));
	}, [isLoaded, rows]);

	const addUser = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const id = String(form.get("id") || "").trim().toUpperCase();
		const name = String(form.get("name") || "").trim();
		const role = String(form.get("role") || "Employee");
		if (!/^[A-Z0-9-]{3,20}$/.test(id) || !name) {
			setFormError("Enter a valid company ID and employee name.");
			return;
		}
		if (rows.some((row) => row.id.toLowerCase() === id.toLowerCase())) {
			setFormError("That company ID already exists.");
			return;
		}
		setRows((current) => [...current, { id, name, role, status: "Active" }]);
		setFormError("");
		setIsAdding(false);
	};

	return <div className="page">
		<div className="page-title"><div><span className="eyebrow">GOVERNANCE</span><h1>User Management</h1><p>Manage Aurion Motors enterprise accounts and role-based clearance scopes.</p></div><button className="primary-btn" type="button" onClick={() => setIsAdding(true)}>Add User</button></div>
		<p className="sample-data-notice"><span>AURION IAM</span> Active directory synchronization for personnel access to regional OLAP clusters.</p>
		<div className="table-card"><div className="table-wrap"><table><thead><tr><th>Company ID</th><th>Name</th><th>Role</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.id}</td><td>{row.name}</td><td>{row.role}</td><td><span className="status">{row.status}</span></td><td><button className="table-btn" type="button" onClick={() => setRows((current) => current.map((user) => user.id === row.id ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" } : user))}>Toggle status</button></td></tr>)}</tbody></table></div></div>
		{isAdding && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsAdding(false); }}>
			<form className="sql-modal admin-user-form" onSubmit={addUser} aria-labelledby="add-user-title">
				<span className="eyebrow">LOCAL DEMO USER</span><h2 id="add-user-title">Add user</h2>
				<label>Company ID<input name="id" required maxLength={20} autoComplete="off" placeholder="EMP003" /></label>
				<label>Employee name<input name="name" required maxLength={80} placeholder="Employee name" /></label>
				<label>Role<select name="role" defaultValue="Employee"><option>Employee</option><option>Manager</option><option>Administrator</option></select></label>
				{formError && <p className="form-error" role="alert">{formError}</p>}
				<div className="report-actions"><button type="button" onClick={() => { setIsAdding(false); setFormError(""); }}>Cancel</button><button className="primary-btn" type="submit">Add user</button></div>
			</form>
		</div>}
	</div>;
}
