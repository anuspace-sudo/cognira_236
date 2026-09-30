"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  Palette,
  Bell,
  Shield,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Smartphone,
  Laptop,
  Monitor,
  KeyRound,
  ExternalLink,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface WorkspaceSettings {
  workspaceName: string;
  organization: string;
  language: string;
  timezone: string;
  dateFormat: string;
  theme: "dark" | "system";
  density: "comfortable" | "compact";
  highContrast: boolean;
  notifyQueryCompletion: boolean;
  notifyReportUpdates: boolean;
  notifyAiInsights: boolean;
  notifySystem: boolean;
  twoFactorEnabled: boolean;
  defaultTimeRange: "This Month" | "Last Month" | "This Quarter" | "All Time";
  showTelemetry: boolean;
}

const DEFAULT_SETTINGS: WorkspaceSettings = {
  workspaceName: "Cognira",
  organization: "Aurion Motors",
  language: "en-US",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  theme: "dark",
  density: "comfortable",
  highContrast: false,
  notifyQueryCompletion: true,
  notifyReportUpdates: true,
  notifyAiInsights: true,
  notifySystem: false,
  twoFactorEnabled: true,
  defaultTimeRange: "This Month",
  showTelemetry: true,
};

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const INITIAL_SESSIONS: ActiveSession[] = [
  {
    id: "sess_curr",
    device: "Windows 11 PC",
    browser: "Chrome 129",
    ip: "10.240.18.92 (Aurion Intranet)",
    location: "Bengaluru, India",
    lastActive: "Active Now",
    isCurrent: true,
  },
  {
    id: "sess_mobile",
    device: "iPhone 15 Pro",
    browser: "Safari Mobile 18",
    ip: "10.240.32.14 (Aurion VPN)",
    location: "Chennai, India",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "sess_kiosk",
    device: "Dealership Kiosk Display",
    browser: "Edge 128",
    ip: "10.240.45.08 (Apex Mumbai)",
    location: "Mumbai, India",
    lastActive: "Yesterday",
    isCurrent: false,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "appearance" | "notifications" | "security" | "preferences"
  >("general");

  const [settings, setSettings] = useState<WorkspaceSettings>(DEFAULT_SETTINGS);
  const [persistedSettings, setPersistedSettings] = useState<WorkspaceSettings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [saveToast, setSaveToast] = useState(false);

  // Load stored settings on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cognira_settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings(parsed);
        setPersistedSettings(parsed);
      }
    } catch {
      // fallback to defaults
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("cognira_settings", JSON.stringify(settings));
    setPersistedSettings(settings);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleCancel = () => {
    setSettings(persistedSettings);
  };

  const revokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(persistedSettings);

  return (
    <div className="saas-settings-container">
      {/* 1. Header */}
      <div className="saas-page-header">
        <div className="saas-header-text">
          <span className="saas-eyebrow">CONFIGURATION</span>
          <h1 className="saas-title">Settings</h1>
          <p className="saas-description">
            Manage your Cognira workspace and account preferences.
          </p>
        </div>

        {/* Global Save / Cancel Bar */}
        <div className="saas-header-actions">
          {isDirty && (
            <span className="unsaved-changes-pill">Unsaved changes</span>
          )}
          <button
            type="button"
            className="saas-btn-secondary"
            onClick={handleCancel}
            disabled={!isDirty}
          >
            <RotateCcw size={14} />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            className="saas-btn-primary"
            onClick={handleSave}
            disabled={!isDirty && !saveToast}
          >
            <Check size={15} />
            <span>{saveToast ? "Saved!" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveToast && (
        <div className="saas-toast-banner" role="status">
          <CheckCircle2 size={16} />
          <span>Preferences updated and persisted across your workspace.</span>
        </div>
      )}

      {/* 2. Internal Tab Navigation */}
      <div className="saas-tabs-bar" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "general"}
          className={`saas-tab-btn ${activeTab === "general" ? "is-active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          <Sliders size={15} />
          <span>General</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "appearance"}
          className={`saas-tab-btn ${activeTab === "appearance" ? "is-active" : ""}`}
          onClick={() => setActiveTab("appearance")}
        >
          <Palette size={15} />
          <span>Appearance</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "notifications"}
          className={`saas-tab-btn ${activeTab === "notifications" ? "is-active" : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          <Bell size={15} />
          <span>Notifications</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "security"}
          className={`saas-tab-btn ${activeTab === "security" ? "is-active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Shield size={15} />
          <span>Security</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "preferences"}
          className={`saas-tab-btn ${activeTab === "preferences" ? "is-active" : ""}`}
          onClick={() => setActiveTab("preferences")}
        >
          <SlidersHorizontal size={15} />
          <span>Preferences</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="saas-card-surface">
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="saas-section-stack">
            <div className="saas-section-header">
              <h3>Workspace Profile</h3>
              <p>Identify your organizational context and geographic regional formats.</p>
            </div>

            <div className="saas-form-grid">
              <div className="saas-field-group">
                <label htmlFor="ws-name">Workspace name</label>
                <input
                  id="ws-name"
                  type="text"
                  className="saas-input"
                  value={settings.workspaceName}
                  onChange={(e) =>
                    setSettings({ ...settings, workspaceName: e.target.value })
                  }
                  placeholder="Cognira"
                />
                <span className="field-hint">Visible in top navigation and system reports.</span>
              </div>

              <div className="saas-field-group">
                <label htmlFor="org-name">Organization</label>
                <input
                  id="org-name"
                  type="text"
                  className="saas-input is-locked"
                  value={settings.organization}
                  disabled
                />
                <span className="field-hint">Managed by Aurion Enterprise Directory.</span>
              </div>

              <div className="saas-field-group">
                <label htmlFor="ws-lang">Language</label>
                <select
                  id="ws-lang"
                  className="saas-select"
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                >
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">Hindi (हिन्दी)</option>
                  <option value="de-DE">German (Deutsch)</option>
                  <option value="ja-JP">Japanese (日本語)</option>
                </select>
                <span className="field-hint">Language used for assistant replies and interface labels.</span>
              </div>

              <div className="saas-field-group">
                <label htmlFor="ws-tz">Timezone</label>
                <select
                  id="ws-tz"
                  className="saas-select"
                  value={settings.timezone}
                  onChange={(e) =>
                    setSettings({ ...settings, timezone: e.target.value })
                  }
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST · UTC+05:30)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST · UTC+04:00)</option>
                  <option value="Europe/London">Europe/London (GMT · UTC+00:00)</option>
                  <option value="Europe/Berlin">Europe/Berlin (CET · UTC+01:00)</option>
                  <option value="America/New_York">America/New_York (EST · UTC-05:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT · UTC+08:00)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST · UTC+09:00)</option>
                </select>
                <span className="field-hint">Used for timestamping queries and historical exports.</span>
              </div>

              <div className="saas-field-group">
                <label htmlFor="ws-datefmt">Date format</label>
                <select
                  id="ws-datefmt"
                  className="saas-select"
                  value={settings.dateFormat}
                  onChange={(e) =>
                    setSettings({ ...settings, dateFormat: e.target.value })
                  }
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 29/09/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/29/2026)</option>
                  <option value="DD MMM YYYY">DD MMM YYYY (e.g. 29 Sep 2026)</option>
                </select>
                <span className="field-hint">Determines date display across tables and exports.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPEARANCE */}
        {activeTab === "appearance" && (
          <div className="saas-section-stack">
            <div className="saas-section-header">
              <h3>Theme & Display</h3>
              <p>Customize the visual presentation of your Cognira workspace.</p>
            </div>

            <div className="saas-theme-selector-grid">
              <label
                className={`theme-card-option ${
                  settings.theme === "dark" ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={settings.theme === "dark"}
                  onChange={() => setSettings({ ...settings, theme: "dark" })}
                />
                <div className="theme-preview-box preview-dark">
                  <div className="preview-topbar" />
                  <div className="preview-body">
                    <div className="preview-chart-bar" />
                    <div className="preview-chart-bar" />
                    <div className="preview-chart-bar" />
                  </div>
                </div>
                <div className="theme-text-meta">
                  <strong>Dark (Default)</strong>
                  <span>Pure black automotive enterprise aesthetic</span>
                </div>
              </label>

              <label
                className={`theme-card-option ${
                  settings.theme === "system" ? "is-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={settings.theme === "system"}
                  onChange={() => setSettings({ ...settings, theme: "system" })}
                />
                <div className="theme-preview-box preview-system">
                  <div className="preview-topbar" />
                  <div className="preview-body">
                    <div className="preview-chart-bar" />
                    <div className="preview-chart-bar" />
                    <div className="preview-chart-bar" />
                  </div>
                </div>
                <div className="theme-text-meta">
                  <strong>System</strong>
                  <span>Synchronizes with your operating system color scheme</span>
                </div>
              </label>
            </div>

            <div className="saas-divider" />

            <div className="saas-toggle-row">
              <div className="toggle-text-block">
                <strong>Interface Density</strong>
                <span>Optimize vertical spacing for data-dense telemetry.</span>
              </div>
              <div className="density-toggle-group">
                <button
                  type="button"
                  className={`density-btn ${settings.density === "comfortable" ? "is-active" : ""}`}
                  onClick={() => setSettings({ ...settings, density: "comfortable" })}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  className={`density-btn ${settings.density === "compact" ? "is-active" : ""}`}
                  onClick={() => setSettings({ ...settings, density: "compact" })}
                >
                  Compact
                </button>
              </div>
            </div>

            <div className="saas-toggle-row">
              <div className="toggle-text-block">
                <strong>High Contrast Tables</strong>
                <span>Sharpen grid lines and elevate border contrast for accessibility.</span>
              </div>
              <label className="saas-switch">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) =>
                    setSettings({ ...settings, highContrast: e.target.checked })
                  }
                />
                <span className="switch-slider" />
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="saas-section-stack">
            <div className="saas-section-header">
              <h3>Notification Channels</h3>
              <p>Configure which events trigger internal alerts and badge updates.</p>
            </div>

            <div className="saas-toggle-list">
              <div className="saas-toggle-row">
                <div className="toggle-text-block">
                  <strong>Query completion</strong>
                  <span>Notify when background OLAP aggregation or large CSV exports finish.</span>
                </div>
                <label className="saas-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifyQueryCompletion}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifyQueryCompletion: e.target.checked,
                      })
                    }
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <div className="saas-toggle-row">
                <div className="toggle-text-block">
                  <strong>Report updates</strong>
                  <span>Receive notification when weekly dealership sales rollups are generated.</span>
                </div>
                <label className="saas-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifyReportUpdates}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifyReportUpdates: e.target.checked,
                      })
                    }
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <div className="saas-toggle-row">
                <div className="toggle-text-block">
                  <strong>AI insights</strong>
                  <span>Proactive anomaly detection when a region or model deviates from target.</span>
                </div>
                <label className="saas-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifyAiInsights}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifyAiInsights: e.target.checked,
                      })
                    }
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              <div className="saas-toggle-row">
                <div className="toggle-text-block">
                  <strong>System notifications</strong>
                  <span>Aurion enterprise database schema updates and maintenance windows.</span>
                </div>
                <label className="saas-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifySystem}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifySystem: e.target.checked,
                      })
                    }
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY */}
        {activeTab === "security" && (
          <div className="saas-section-stack">
            <div className="saas-section-header">
              <h3>Authentication & Active Sessions</h3>
              <p>Review active authenticated devices and enterprise credential policies.</p>
            </div>

            {/* Change Password Link */}
            <div className="saas-action-card">
              <div className="action-card-text">
                <div className="action-card-title-group">
                  <Lock size={16} className="cyan-icon" />
                  <strong>Change Password</strong>
                </div>
                <span>Update your account password using your current authorized session.</span>
              </div>
              <Link href="/app/profile#password-section" className="saas-btn-secondary">
                <span>Manage in Profile</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            {/* Two-Factor Authentication */}
            <div className="saas-toggle-row security-toggle-row">
              <div className="toggle-text-block">
                <div className="action-card-title-group">
                  <Shield size={16} className="cyan-icon" />
                  <strong>Two-factor authentication</strong>
                </div>
                <span>
                  Requires approval via Aurion Authenticator Mobile app upon employee sign-in.
                </span>
              </div>
              <label className="saas-switch">
                <input
                  type="checkbox"
                  checked={settings.twoFactorEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      twoFactorEnabled: e.target.checked,
                    })
                  }
                />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="saas-divider" />

            {/* Active Sessions */}
            <div className="sessions-block">
              <div className="sessions-header">
                <strong>Active Sessions</strong>
                <span>Signed-in client sessions recognized by Aurion SSO.</span>
              </div>

              <div className="sessions-list">
                {sessions.map((sess) => (
                  <div key={sess.id} className="session-item">
                    <div className="session-icon">
                      {sess.device.includes("PC") ? (
                        <Laptop size={18} />
                      ) : sess.device.includes("iPhone") ? (
                        <Smartphone size={18} />
                      ) : (
                        <Monitor size={18} />
                      )}
                    </div>

                    <div className="session-details">
                      <div className="session-title-line">
                        <strong>{sess.device}</strong>
                        {sess.isCurrent && (
                          <span className="session-current-badge">This Device</span>
                        )}
                      </div>
                      <div className="session-meta-line">
                        <span>{sess.browser}</span>
                        <span>•</span>
                        <span>{sess.location}</span>
                        <span>•</span>
                        <span>{sess.ip}</span>
                      </div>
                    </div>

                    <div className="session-action">
                      {sess.isCurrent ? (
                        <span className="session-active-indicator">Active Now</span>
                      ) : (
                        <button
                          type="button"
                          className="session-revoke-btn"
                          onClick={() => revokeSession(sess.id)}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="saas-section-stack">
            <div className="saas-section-header">
              <h3>BI Engine Defaults</h3>
              <p>Configure query execution behavior, default intervals, and SQL telemetry.</p>
            </div>

            <div className="saas-form-grid">
              <div className="saas-field-group">
                <label htmlFor="pref-timerange">Default time range for new queries</label>
                <select
                  id="pref-timerange"
                  className="saas-select"
                  value={settings.defaultTimeRange}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultTimeRange: e.target.value as any,
                    })
                  }
                >
                  <option value="This Month">This Month</option>
                  <option value="Last Month">Last Month</option>
                  <option value="This Quarter">This Quarter</option>
                  <option value="All Time">All Time</option>
                </select>
                <span className="field-hint">Initial temporal window applied when no specific date is mentioned.</span>
              </div>
            </div>

            <div className="saas-divider" />

            <div className="saas-toggle-row">
              <div className="toggle-text-block">
                <strong>Show SQL & Telemetry Dialogs</strong>
                <span>Expose execution latency, records scanned, and ANSI SQL syntax options.</span>
              </div>
              <label className="saas-switch">
                <input
                  type="checkbox"
                  checked={settings.showTelemetry}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      showTelemetry: e.target.checked,
                    })
                  }
                />
                <span className="switch-slider" />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
