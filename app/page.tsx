import Link from "next/link";
import { ArrowRight, BarChart3, Database, MessageSquare, ShieldCheck } from "lucide-react";
import "./landing.css";

const features = [
  { icon: MessageSquare, title: "Natural Language", text: "Ask about vehicles, sales, production, inventory, dealerships and service without writing SQL." },
  { icon: BarChart3, title: "Business Insights", text: "Turn permitted company data into structured answers, tables and visual summaries." },
  { icon: ShieldCheck, title: "Access Governance", text: "Every request is evaluated against the user's company role and permitted data." },
  { icon: Database, title: "Secure Data Layer", text: "COGNIRA is designed around controlled database access and validated queries." },
];

const workflowSteps = [
  { number: "01", title: "ASK", text: "Start with a natural-language question or business prompt." },
  { number: "02", title: "UNDERSTAND", text: "COGNIRA interprets the business context and desired outcome." },
  { number: "03", title: "VALIDATE", text: "Access, policy and role permissions are reviewed before any query runs." },
  { number: "04", title: "QUERY", text: "Only approved data sources are queried with secure execution paths." },
  { number: "05", title: "INSIGHT", text: "Results are delivered as clear summaries, tables and visual explanations." },
];

const securityFeatures = [
  { title: "Role-based data access", text: "Permissions stay aligned with each user’s business role and data scope." },
  { title: "Policy-aware queries", text: "Every request is evaluated for the right business context before data is exposed." },
  { title: "Controlled data surfaces", text: "COGNIRA is built to work with approved enterprise data sources and governed outputs." },
  { title: "Audit-ready responses", text: "Decision support remains traceable for the teams relying on it every day." },
  { title: "Secure by design", text: "The platform is structured around least-privilege access and clear business controls." },
];

export default function Home() {
  return <main className="landing">
    <header className="landing-header">
      <Link href="/" className="landing-brand" aria-label="COGNIRA home"><span className="landing-mark" aria-hidden="true">A</span><span><b>COGNIRA</b><small>AURION MOTORS</small></span></Link>
      <nav className="landing-nav" aria-label="Primary navigation"><a className="is-active" href="#home">Home</a><a href="#about">About</a><a href="#how-it-works">How It Works</a><a href="#features">Features</a><a href="#security">Security</a></nav>
      <Link href="/login" className="landing-open">Open COGNIRA <ArrowRight size={18} /></Link>
    </header>

    <section className="landing-hero" id="home">
      <div className="landing-showroom" aria-hidden="true" />
      <div className="landing-hero-copy">
        <p className="landing-eyebrow">AURION MOTORS · BUSINESS INTELLIGENCE</p>
        <h1>Turn <span>Business Data</span><br />Into Clearer Decisions.</h1>
        <p className="landing-description">COGNIRA gives authorized AURION MOTORS teams a conversational way to explore business data, generate insights and make faster, smarter decisions.</p>
        <div className="landing-actions"><Link href="/login" className="landing-primary">Open COGNIRA <ArrowRight size={18} /></Link><a href="#features" className="landing-secondary">Explore Platform</a></div>
      </div>
    </section>

    <section className="landing-process-band" aria-label="How COGNIRA turns questions into insights">
      <div className="landing-process">
        {[ ["01", "ASK", "Natural language or voice"], ["02", "UNDERSTAND", "Business context and intent"], ["03", "VALIDATE", "Permission and business rules"], ["04", "QUERY", "Secure database execution"], ["05", "INSIGHT", "Tables, charts and reports"] ].map(([number, title, text]) => <div className="process-step" key={number}><span>{number}</span><div><b>{title}</b><small>{text}</small></div></div>)}
      </div>
    </section>

    <section className="landing-about" id="about" aria-label="About COGNIRA">
      <div className="landing-section-header">
        <p className="landing-kicker">ABOUT</p>
        <h2>Business Intelligence, Built for AURION MOTORS</h2>
      </div>
      <div className="landing-about-grid">
        <div className="landing-about-copy">
          <p>COGNIRA brings conversational business intelligence to AURION MOTORS teams so they can explore operational performance without waiting on manual reporting.</p>
          <p>From sales and inventory to production and dealer activity, the platform turns business questions into structured answers that support better decisions in real time.</p>
        </div>
        <div className="landing-about-metrics" aria-label="COGNIRA performance overview">
          <div className="landing-stat">
            <span>Live decision support</span>
            <strong>24/7</strong>
          </div>
          <div className="landing-stat">
            <span>Business questions</span>
            <strong>Natural language</strong>
          </div>
          <div className="landing-stat">
            <span>Focus</span>
            <strong>Enterprise clarity</strong>
          </div>
        </div>
      </div>
    </section>

    <section className="landing-steps" id="how-it-works" aria-label="How COGNIRA works">
      <div className="landing-section-header">
        <p className="landing-kicker">HOW IT WORKS</p>
        <h2>From question to clear action</h2>
      </div>
      <div className="landing-steps-grid">
        {workflowSteps.map(({ number, title, text }) => <article className="landing-step" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>

    <section className="landing-features" id="features" aria-label="COGNIRA capabilities">
      <div className="landing-section-header">
        <p className="landing-kicker">FEATURES</p>
        <h2>Enterprise tools for faster operational insight</h2>
      </div>
      <div className="landing-features-grid">
        {features.map(({ icon: Icon, title, text }) => <article className="landing-feature" key={title}><div className="landing-feature-icon"><Icon size={25} strokeWidth={1.7} /></div><div><h2>{title}</h2><p>{text}</p></div></article>)}
      </div>
    </section>

    <section className="landing-security" id="security" aria-label="COGNIRA security and governance">
      <div className="landing-section-header">
        <p className="landing-kicker">SECURITY</p>
        <h2>Governed access for confident business decisions</h2>
      </div>
      <div className="landing-security-grid">
        {securityFeatures.map(({ title, text }) => <article className="landing-security-item" key={title}><div className="landing-security-bullet" aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></article>)}
      </div>
    </section>

    <section className="landing-cta" aria-label="Open COGNIRA">
      <div className="landing-cta-card">
        <p className="landing-kicker">READY TO MOVE FASTER?</p>
        <h2>Turn Questions Into Clearer Decisions.</h2>
        <Link href="/login" className="landing-primary">Open COGNIRA <ArrowRight size={18} /></Link>
      </div>
    </section>

    <footer className="landing-footer">
      <div className="landing-footer-container">
        <div className="landing-footer-main">
          <div className="landing-footer-brand">
            <span className="landing-mark" aria-hidden="true">A</span>
            <div>
              <b>COGNIRA</b>
              <small>AURION MOTORS</small>
            </div>
          </div>
          <p>COGNIRA helps teams ask better questions, understand their operations and act with more confidence.</p>
        </div>
        <nav className="landing-footer-column" aria-label="Footer navigation">
          <strong>Product</strong>
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="#security">Security</a>
        </nav>
        <div className="landing-footer-column landing-footer-note">
          <strong>COGNIRA</strong>
          <p>Conversational Business Intelligence</p>
          <span>AURION MOTORS</span>
        </div>
        <div className="landing-footer-bottom">
          <span>© 2026 AURION MOTORS · COGNIRA</span>
          <div className="landing-footer-legal">
            <a href="#security">Privacy</a>
            <a href="#security">Security</a>
            <a href="#home">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  </main>;
}
