"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { searchApplication } from "../services/workspaceStore";

export default function WorkspaceHeader() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<"notifications" | "profile" | null>(null);
  const [employee, setEmployee] = useState({
    id: "EMP001",
    role: "Employee",
    name: "Arjun Venkat",
    email: "arjun.venkat@aurionmotors.com",
  });
  const results = searchApplication(search);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("cognira_user");
      if (raw) {
        const user = JSON.parse(raw);
        setEmployee({
          id: user.id || "EMP001",
          role: user.role || "Employee",
          name:
            user.name ||
            (user.id === "MGR001"
              ? "Priya Sharma"
              : user.id === "ADM001"
              ? "Vikram Malhotra"
              : "Arjun Venkat"),
          email:
            user.email ||
            `${(user.id || "emp001").toLowerCase()}@aurionmotors.com`,
        });
      }
    } catch {
      window.localStorage.removeItem("cognira_user");
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") {
        setSearch("");
        setOpenMenu(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const signOut = () => {
    window.localStorage.removeItem("cognira_user");
    router.push("/login");
  };

  return (
    <header className="workspace-topbar">
      <div className="workspace-title">
        <button
          type="button"
          className="workspace-menu-toggle"
          aria-label="Open navigation"
          onClick={() => window.dispatchEvent(new CustomEvent("cognira:toggle-navigation"))}
        >
          <Menu size={18} />
        </button>
        <b>COGNIRA WORKSPACE</b>
        <span className="workspace-status">
          <i />
          AI BUSINESS INTELLIGENCE
        </span>
      </div>

      <div className="workspace-tools">
        <div className="workspace-search-wrap">
          <label className="workspace-search" aria-label="Search Cognira">
            <Search size={15} aria-hidden="true" />
            <input
              ref={searchRef}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setOpenMenu(null)}
              placeholder="Search pages and tools"
              aria-label="Search pages and tools"
              aria-expanded={Boolean(search.trim())}
              aria-controls="workspace-search-results"
            />
            <span className="workspace-search-shortcut">⌘ K / Ctrl K</span>
          </label>
          {search.trim() && (
            <div
              className="workspace-popover search-popover"
              id="workspace-search-results"
              role="listbox"
              aria-label="Search results"
            >
              {results.length ? (
                results.map((result) => (
                  <Link
                    key={result.href}
                    href={result.href}
                    role="option"
                    aria-selected="false"
                    onClick={(event) => {
                      event.preventDefault();
                      setSearch("");
                      router.push(result.href);
                    }}
                  >
                    <span>
                      <b>{result.label}</b>
                      <small>{result.description}</small>
                    </span>
                    <span aria-hidden="true">↗</span>
                  </Link>
                ))
              ) : (
                <p className="workspace-search-empty">No matching pages or tools.</p>
              )}
            </div>
          )}
        </div>

        <div className="workspace-menu-wrap">
          <button
            type="button"
            className="workspace-icon-button"
            aria-label="Notifications"
            aria-expanded={openMenu === "notifications"}
            onClick={() =>
              setOpenMenu((current) =>
                current === "notifications" ? null : "notifications"
              )
            }
          >
            <Bell size={17} />
          </button>
          {openMenu === "notifications" && (
            <div className="workspace-popover notification-popover" role="status">
              <div className="notif-header">
                <b>Aurion System Telemetry</b>
                <span className="notif-badge">3 New</span>
              </div>
              <div className="notif-list">
                <div className="notif-item">
                  <span className="notif-dot notif-dot-green" />
                  <div>
                    <strong>OLAP Data Sync Completed</strong>
                    <p>All 5 regional repositories synchronized with 13,482 units indexed.</p>
                    <small>12 mins ago</small>
                  </div>
                </div>
                <div className="notif-item">
                  <span className="notif-dot notif-dot-cyan" />
                  <div>
                    <strong>Quota Velocity Update</strong>
                    <p>South region exceeded target (+12.4% MoM) led by Aurion EV-X.</p>
                    <small>1 hour ago</small>
                  </div>
                </div>
                <div className="notif-item">
                  <span className="notif-dot notif-dot-amber" />
                  <div>
                    <strong>Inventory Age Alert</strong>
                    <p>14 units flagged with stock age &gt; 60 days in East region.</p>
                    <small>3 hours ago</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="workspace-menu-wrap">
          <button
            type="button"
            className="workspace-user"
            aria-label={`Account menu for ${employee.id}`}
            aria-expanded={openMenu === "profile"}
            onClick={() =>
              setOpenMenu((current) => (current === "profile" ? null : "profile"))
            }
          >
            <span className="workspace-avatar">
              {employee.name
                ? employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : employee.id.slice(-1)}
            </span>
            <span className="workspace-user-meta">
              <b>{employee.id}</b>
              <small>{employee.role}</small>
            </span>
            <ChevronDown size={15} className="workspace-chevron" />
          </button>
          {openMenu === "profile" && (
            <div className="workspace-popover profile-popover" role="menu">
              <div className="profile-popover-header">
                <strong>{employee.name}</strong>
                <small>{employee.id} · {employee.role}</small>
              </div>
              <div className="profile-popover-links">
                <Link
                  href="/app/profile"
                  role="menuitem"
                  onClick={() => setOpenMenu(null)}
                >
                  <UserRound size={15} />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/app/settings"
                  role="menuitem"
                  onClick={() => setOpenMenu(null)}
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </Link>
                <button type="button" role="menuitem" onClick={signOut}>
                  <LogOut size={15} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}