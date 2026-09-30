"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  X,
  KeyRound,
  Users,
} from "lucide-react";
import "./login.css";

interface DemoRole {
  id: string;
  role: string;
  name: string;
  email: string;
  department: string;
  password: string;
}

const DEMO_ROLES: DemoRole[] = [
  {
    id: "EMP001",
    role: "Employee",
    name: "Arjun Venkat",
    email: "arjun.venkat@aurionmotors.com",
    department: "Sales & Distribution",
    password: "aurion2026",
  },
  {
    id: "MGR001",
    role: "Manager",
    name: "Priya Sharma",
    email: "priya.sharma@aurionmotors.com",
    department: "Regional Operations",
    password: "aurion2026",
  },
  {
    id: "ADM001",
    role: "Administrator",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@aurionmotors.com",
    department: "Executive IT & Systems",
    password: "aurion2026",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [id, setId] = useState("EMP001");
  const [password, setPassword] = useState("aurion2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Demo role dropdown state
  const [selectedDemoRole, setSelectedDemoRole] = useState<DemoRole>(DEMO_ROLES[0]);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmployeeId, setForgotEmployeeId] = useState("");
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check if previous ID was remembered
    const remembered = localStorage.getItem("cognira_remembered_id");
    if (remembered) {
      setId(remembered);
      const matched = DEMO_ROLES.find(
        (r) => r.id.toLowerCase() === remembered.toLowerCase()
      );
      if (matched) {
        setSelectedDemoRole(matched);
      }
    }
  }, []);

  const handleSelectDemoRole = (role: DemoRole) => {
    setSelectedDemoRole(role);
    setId(role.id);
    setPassword(role.password);
    setError("");
    setDemoDropdownOpen(false);
  };

  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    const cleanId = id.trim();
    const cleanPw = password.trim();

    if (!cleanId) {
      setError("Please enter your Employee ID.");
      return;
    }
    if (!cleanPw) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);

    // Simulate authenticating against Aurion Enterprise Directory
    setTimeout(() => {
      const matchedRole = DEMO_ROLES.find(
        (r) => r.id.toLowerCase() === cleanId.toLowerCase()
      );

      const userSession = matchedRole
        ? {
            id: matchedRole.id,
            role: matchedRole.role,
            name: matchedRole.name,
            email: matchedRole.email,
            department: matchedRole.department,
          }
        : {
            id: cleanId.toUpperCase(),
            role: "Employee",
            name: "Aurion Team Member",
            email: `${cleanId.toLowerCase()}@aurionmotors.com`,
            department: "Enterprise Operations",
          };

      if (rememberMe) {
        localStorage.setItem("cognira_remembered_id", userSession.id);
      } else {
        localStorage.removeItem("cognira_remembered_id");
      }

      localStorage.setItem("cognira_user", JSON.stringify(userSession));
      setIsLoading(false);
      router.push("/app");
    }, 450);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmployeeId.trim()) {
      setForgotStatus("Please enter your Employee ID.");
      return;
    }
    setForgotStatus(
      `Password reset instructions have been dispatched to the enterprise directory email associated with ${forgotEmployeeId.trim().toUpperCase()}.`
    );
  };

  return (
    <main className="cinematic-login-root">
      {/* 1. CINEMATIC BACKGROUND ATMOSPHERE (EXACT REFERENCE SHOWROOM & GLOBE) */}
      <div className="login-backdrop-container" aria-hidden="true">
        <div className="cinematic-backdrop-image" />
        <div className="subtle-tech-vignette" />
      </div>

      {/* 2. TOP BRANDING BAR */}
      <header className="login-top-header">
        <Link href="/" className="login-brand-identity" aria-label="COGNIRA Aurion Motors">
          <div className="brand-chevron-mark">
            <svg viewBox="0 0 40 40" fill="none">
              <path
                d="M20 5L36 34H26.5L20 20.5L13.5 34H4L20 5Z"
                fill="url(#cyanChevron)"
              />
              <defs>
                <linearGradient id="cyanChevron" x1="4" y1="5" x2="36" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00D9FF" />
                  <stop offset="1" stopColor="#168BFF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-title-wrap">
            <span className="brand-product-name">COGNIRA</span>
            <span className="brand-company-name">AURION MOTORS</span>
          </div>
        </Link>

        <div className="login-top-tagline">
          <span>AI BUSINESS INTELLIGENCE</span>
        </div>
      </header>

      {/* 3. CENTER / RIGHT: PREMIUM LOGIN CARD */}
      <div className="login-main-stage">
        {/* Left atmospheric slogan */}
        <div className="login-left-art-caption" aria-hidden="true">
          <div className="slogan-content">
            <div className="slogan-accent-line" />
            <div className="slogan-stack">
              <span>DRIVEN</span>
              <span>BY DATA</span>
              <span>POWERED</span>
              <span>BY INTELLIGENCE</span>
            </div>
          </div>
          <div className="copyright-note">
            © 2026 Aurion Motors. All rights reserved.
          </div>
        </div>

        {/* Right side login card wrapper with Back to home positioned above */}
        <div className="login-card-container">
          {/* Explicit Back to home navigation above the card */}
          <div className="login-card-top-nav">
            <Link href="/" className="back-to-home-link" id="back-to-home-link">
              <span className="back-arrow">←</span>
              <span>Back to home</span>
            </Link>
          </div>

          <div className="login-card-panel">
            {/* Card Header */}
            <div className="card-header-block">
              <span className="welcome-eyebrow">WELCOME TO</span>
              <h1 className="card-product-title">COGNIRA</h1>
              <span className="card-subtitle-tag">AI BUSINESS INTELLIGENCE</span>
              <p className="card-instruction">
                Sign in to access your Aurion Motors workspace.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSignIn} className="login-form-body">
              {/* Employee ID Input */}
              <div className="form-group">
                <label htmlFor="employee-id">Employee ID</label>
                <div className="input-field-wrapper">
                  <UserRound size={17} className="input-icon" />
                  <input
                    id="employee-id"
                    type="text"
                    value={id}
                    onChange={(e) => {
                      setId(e.target.value);
                      setError("");
                    }}
                    placeholder="EMP001"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-field-wrapper">
                  <LockKeyhole size={17} className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Form Options: Remember me & Forgot password */}
              <div className="form-options-row">
                <label className="remember-me-toggle">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="custom-checkbox">
                    {rememberMe && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => {
                    setForgotEmployeeId(id || "EMP001");
                    setForgotStatus(null);
                    setForgotModalOpen(true);
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="login-error-banner" role="alert">
                  <X size={14} />
                  <span>{error}</span>
                </div>
              )}

              {/* Primary Submit Button */}
              <button
                type="submit"
                className="login-primary-submit-btn"
                disabled={isLoading}
                id="sign-in-submit-btn"
              >
                {isLoading ? (
                  <span className="btn-loading-spinner" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="login-or-divider">
              <span className="divider-line" />
              <span className="divider-label">OR</span>
              <span className="divider-line" />
            </div>

            {/* Demo Account Dropdown Section */}
            <div className="demo-account-section">
              <label className="demo-label">Demo account (Optional)</label>

              <div className="demo-dropdown-wrapper">
                <button
                  type="button"
                  className="demo-dropdown-trigger"
                  onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={demoDropdownOpen}
                  id="demo-account-dropdown-btn"
                >
                  <div className="demo-trigger-left">
                    <Users size={16} className="demo-icon" />
                    <span className="demo-selected-name">
                      {selectedDemoRole.role} — {selectedDemoRole.id}
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`dropdown-chevron ${demoDropdownOpen ? "is-open" : ""}`}
                  />
                </button>

                {demoDropdownOpen && (
                  <div className="demo-dropdown-menu" role="listbox">
                    {DEMO_ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        role="option"
                        aria-selected={selectedDemoRole.id === role.id}
                        className={`demo-menu-item ${
                          selectedDemoRole.id === role.id ? "is-active" : ""
                        }`}
                        onClick={() => handleSelectDemoRole(role)}
                      >
                        <div className="item-text-group">
                          <strong>
                            {role.role} — {role.id}
                          </strong>
                          <small>
                            {role.name} · {role.department}
                          </small>
                        </div>
                        {selectedDemoRole.id === role.id && (
                          <Check size={14} className="item-check" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="demo-roles-hint">
                Available roles: Employee · Manager · Administrator
              </div>
            </div>

            {/* Security Notice */}
            <div className="login-security-footer">
              <ShieldCheck size={15} className="security-icon" />
              <span>Authorized Aurion Motors users only.</span>
            </div>
          </div>
        </div>

        {/* Right side floating text */}
        <div className="login-right-art-caption" aria-hidden="true">
          <span>DATA</span>
          <span>ANALYTICS</span>
          <span>INSIGHTS</span>
          <span>INTELLIGENCE</span>
        </div>
      </div>

      {/* 4. FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div
          className="login-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setForgotModalOpen(false);
          }}
        >
          <div
            className="login-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-modal-title"
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <KeyRound size={20} className="modal-icon" />
                <h3 id="forgot-modal-title">Password Recovery</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setForgotModalOpen(false)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <p className="modal-description">
              Enter your Aurion Employee ID. A secure temporary authorization token will be
              dispatched through the Aurion Internal Directory.
            </p>

            <form onSubmit={handleForgotSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="forgot-id">Employee ID</label>
                <div className="input-field-wrapper">
                  <UserRound size={17} className="input-icon" />
                  <input
                    id="forgot-id"
                    type="text"
                    value={forgotEmployeeId}
                    onChange={(e) => setForgotEmployeeId(e.target.value)}
                    placeholder="EMP001"
                    required
                  />
                </div>
              </div>

              {forgotStatus && (
                <div className="modal-status-note" role="status">
                  <Sparkles size={14} />
                  <span>{forgotStatus}</span>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setForgotModalOpen(false)}
                >
                  Close
                </button>
                <button type="submit" className="modal-submit-btn">
                  Send Recovery Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
