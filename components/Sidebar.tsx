"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Clock3, FileText, LogOut, MessageSquare, Settings, Shield } from "lucide-react";
import { useEffect, useState } from "react";

const items = [
  ["/app", "Ask", MessageSquare],
  ["/app/history", "History", Clock3],
  ["/app/reports", "Reports", FileText],
  ["/app/analytics", "Analytics", BarChart3],
  ["/app/admin", "Administration", Shield],
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState({ id: "EMP001", role: "Employee", name: "Arjun Venkat" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cognira_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser({
          id: parsed.id || "EMP001",
          role: parsed.role || "Employee",
          name: parsed.name || (parsed.id === "MGR001" ? "Priya Sharma" : parsed.id === "ADM001" ? "Vikram Malhotra" : "Arjun Venkat"),
        });
      }
    } catch {
      // fallback
    }

    const openNavigation = () => setIsMobileOpen(true);
    window.addEventListener("cognira:toggle-navigation", openNavigation);
    return () => window.removeEventListener("cognira:toggle-navigation", openNavigation);
  }, []);

  const logout = () => {
    localStorage.removeItem("cognira_user");
    setIsMobileOpen(false);
    router.push("/login");
  };

  return (
    <>
    {isMobileOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setIsMobileOpen(false)} />}
    <aside className={`sidebar ${isMobileOpen ? "is-mobile-open" : ""}`}>
      <div className="side-brand">
        <span className="brand-mark">A</span>
        <div>
          <b>COGNIRA</b>
          <small>AURION MOTORS</small>
        </div>
      </div>

      <nav className="side-nav" aria-label="Sidebar navigation">
        {items.map((item) => {
          const [href, label, Icon] = item as [string, string, typeof MessageSquare];
          return (
            <Link className={path === href ? "active" : ""} href={href} key={href} onClick={() => setIsMobileOpen(false)}>
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="side-bottom">
        <button className="sidebar-user" type="button" onClick={() => { setIsMobileOpen(false); router.push("/app/profile"); }}>
          <span className="side-user-avatar">{user.name ? user.name.split(" ").map(n => n[0]).join("") : user.id.slice(-1)}</span>
          <span className="side-user-meta">
            <strong>{user.id}</strong>
            <small>{user.role}</small>
          </span>
          <span className="side-user-chevron">⌄</span>
        </button>

        <div className="side-user-extra">
          <Link href="/app/profile" onClick={() => setIsMobileOpen(false)}>Profile</Link>
          <Link href="/app/settings" onClick={() => setIsMobileOpen(false)}>Settings</Link>
          <button type="button" onClick={logout}>
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
    </>
  );
} 
