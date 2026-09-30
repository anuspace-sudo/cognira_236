"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserRound,
  Mail,
  Building2,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  BadgeAlert,
} from "lucide-react";

interface AuthenticatedUser {
  id: string;
  role: string;
  name: string;
  email: string;
  department: string;
  location?: string;
  phone?: string;
}

const DEFAULT_USER: AuthenticatedUser = {
  id: "EMP001",
  role: "Employee",
  name: "Arjun Venkat",
  email: "arjun.venkat@aurionmotors.com",
  department: "Sales & Distribution",
  location: "Aurion Silicon Hub Bengaluru",
  phone: "+91 98400 12890",
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<AuthenticatedUser>(DEFAULT_USER);
  const [persistedUser, setPersistedUser] = useState<AuthenticatedUser>(DEFAULT_USER);
  const [profileSuccessToast, setProfileSuccessToast] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Load user from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cognira_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged: AuthenticatedUser = {
          id: parsed.id || "EMP001",
          role: parsed.role || "Employee",
          name: parsed.name || (parsed.id === "MGR001" ? "Priya Sharma" : parsed.id === "ADM001" ? "Vikram Malhotra" : "Arjun Venkat"),
          email: parsed.email || `${(parsed.id || "emp001").toLowerCase()}@aurionmotors.com`,
          department: parsed.department || (parsed.id === "MGR001" ? "Regional Operations" : parsed.id === "ADM001" ? "Executive IT" : "Sales & Distribution"),
          location: parsed.location || "Aurion Silicon Hub Bengaluru",
          phone: parsed.phone || "+91 98400 12890",
        };
        setUser(merged);
        setPersistedUser(merged);
      }
    } catch {
      // fallback
    }
  }, []);

  const isProfileDirty = JSON.stringify(user) !== JSON.stringify(persistedUser);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("cognira_user", JSON.stringify(user));
    setPersistedUser(user);
    setProfileSuccessToast(true);
    setTimeout(() => setProfileSuccessToast(false), 3000);
  };

  const handleCancelProfile = () => {
    setUser(persistedUser);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword.trim()) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("New password must contain at least one numerical digit.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    // Success simulation
    setPasswordSuccess("Your enterprise password has been updated successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(""), 4000);
  };

  const handleSignOut = () => {
    localStorage.removeItem("cognira_user");
    router.push("/login");
  };

  return (
    <div className="saas-settings-container">
      {/* 1. Page Header */}
      <div className="saas-page-header">
        <div className="saas-header-text">
          <span className="saas-eyebrow">IDENTITY &amp; ACCESS</span>
          <h1 className="saas-title">Profile</h1>
          <p className="saas-description">
            Manage your Aurion Motors account information and security credentials.
          </p>
        </div>

        <div className="saas-header-actions">
          <button
            type="button"
            className="saas-btn-danger"
            onClick={handleSignOut}
            title="Sign out of Cognira"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {profileSuccessToast && (
        <div className="saas-toast-banner" role="status">
          <CheckCircle2 size={16} />
          <span>Profile changes saved successfully.</span>
        </div>
      )}

      {/* 2. User Identity Banner */}
      <div className="profile-identity-card">
        <div className="profile-avatar-large">
          <span>{user.name.split(" ").map((n) => n[0]).join("")}</span>
        </div>

        <div className="profile-identity-info">
          <div className="profile-name-line">
            <h2>{user.name}</h2>
            <span className="profile-status-badge">
              <ShieldCheck size={13} />
              <span>Authorized Aurion User</span>
            </span>
          </div>

          <div className="profile-meta-tags">
            <span className="meta-tag">
              <strong>ID:</strong> {user.id}
            </span>
            <span className="meta-tag">
              <strong>Role:</strong> {user.role}
            </span>
            <span className="meta-tag">
              <strong>Dept:</strong> {user.department}
            </span>
            <span className="meta-tag">
              <MapPin size={12} />
              {user.location || "Bengaluru HQ"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Account Details Section */}
      <div className="saas-card-surface">
        <div className="saas-section-header">
          <h3>Personal &amp; Contact Information</h3>
          <p>Update your display name, contact phone, and internal notifications address.</p>
        </div>

        <form onSubmit={handleSaveProfile} className="saas-form-grid">
          <div className="saas-field-group">
            <label htmlFor="user-name">Full name</label>
            <div className="saas-input-with-icon">
              <UserRound size={16} />
              <input
                id="user-name"
                type="text"
                className="saas-input"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="saas-field-group">
            <label htmlFor="user-email">Email address</label>
            <div className="saas-input-with-icon">
              <Mail size={16} />
              <input
                id="user-email"
                type="email"
                className="saas-input"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="saas-field-group">
            <label htmlFor="user-id">Employee ID</label>
            <input
              id="user-id"
              type="text"
              className="saas-input is-locked"
              value={user.id}
              disabled
            />
            <span className="field-hint">Primary cryptographic identifier. Cannot be modified.</span>
          </div>

          <div className="saas-field-group">
            <label htmlFor="user-role">Role</label>
            <input
              id="user-role"
              type="text"
              className="saas-input is-locked"
              value={user.role}
              disabled
            />
            <span className="field-hint">Role governs OLAP permission scopes.</span>
          </div>

          <div className="saas-field-group">
            <label htmlFor="user-dept">Department</label>
            <div className="saas-input-with-icon">
              <Building2 size={16} />
              <input
                id="user-dept"
                type="text"
                className="saas-input"
                value={user.department}
                onChange={(e) => setUser({ ...user, department: e.target.value })}
              />
            </div>
          </div>

          <div className="saas-field-group">
            <label htmlFor="user-phone">Phone number</label>
            <div className="saas-input-with-icon">
              <Phone size={16} />
              <input
                id="user-phone"
                type="tel"
                className="saas-input"
                value={user.phone || ""}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                placeholder="+91 98400 12890"
              />
            </div>
          </div>

          <div className="profile-form-actions-full">
            <button
              type="button"
              className="saas-btn-secondary"
              onClick={handleCancelProfile}
              disabled={!isProfileDirty}
            >
              <RotateCcw size={14} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="saas-btn-primary"
              disabled={!isProfileDirty}
            >
              <Check size={15} />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. CHANGE PASSWORD SECTION */}
      <div id="password-section" className="saas-card-surface">
        <div className="saas-section-header">
          <div className="title-with-icon">
            <Lock size={17} className="cyan-icon" />
            <h3>Change Password</h3>
          </div>
          <p>Ensure your account uses a secure password with a minimum of 8 characters.</p>
        </div>

        <form onSubmit={handlePasswordChange} className="password-form-stack">
          {passwordError && (
            <div className="saas-error-banner" role="alert">
              <AlertCircle size={15} />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="saas-toast-banner" role="status">
              <CheckCircle2 size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <div className="saas-field-group">
            <label htmlFor="curr-pw">Current password</label>
            <div className="saas-input-with-icon">
              <Lock size={16} />
              <input
                id="curr-pw"
                type={showCurrent ? "text" : "password"}
                className="saas-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowCurrent(!showCurrent)}
                aria-label={showCurrent ? "Hide current password" : "Show current password"}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="password-grid-row">
            <div className="saas-field-group">
              <label htmlFor="new-pw">New password</label>
              <div className="saas-input-with-icon">
                <Lock size={16} />
                <input
                  id="new-pw"
                  type={showNew ? "text" : "password"}
                  className="saas-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  className="input-eye-btn"
                  onClick={() => setShowNew(!showNew)}
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="saas-field-group">
              <label htmlFor="confirm-pw">Confirm new password</label>
              <div className="saas-input-with-icon">
                <Lock size={16} />
                <input
                  id="confirm-pw"
                  type="password"
                  className="saas-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>
          </div>

          <div className="password-submit-row">
            <button type="submit" className="saas-btn-primary">
              <Check size={15} />
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* 5. Security & Session Sign-Out Card */}
      <div className="saas-card-surface danger-zone-card">
        <div className="danger-zone-content">
          <div>
            <h4>Sign out of session</h4>
            <p>End your authenticated session on this browser. You will be redirected to login.</p>
          </div>
          <button
            type="button"
            className="saas-btn-danger"
            onClick={handleSignOut}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
