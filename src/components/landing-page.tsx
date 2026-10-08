"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import { LayoutGroup, motion, useInView, useReducedMotion } from "motion/react";
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Copy, GitCommitHorizontal,
  LockKeyhole, Menu, Monitor, Radio, RefreshCw, Route, Workflow, X,
} from "lucide-react";

const REPO = "https://github.com/adityahimaone/switchyard";
const NODE_AGENT = "https://github.com/adityahimaone/node-agent";
const navItems = [
  ["Architecture", "architecture"], ["Lifecycle", "lifecycle"], ["Executors", "executors"], ["API", "api"], ["Deploy", "deploy"],
] as const;

const statuses = [
  ["Triage", "triage", "hollow"], ["Todo", "todo", "hollow"], ["Scheduled", "scheduled", "dashed"],
  ["Ready", "ready", "filled"], ["Running", "running", "pulse"], ["Blocked", "blocked", "filled"],
  ["Review", "review", "filled"], ["Done", "done", "filled"], ["Archived", "archived", "hollow"],
] as const;

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, transform: "translateY(6px)" }} whileInView={{ opacity: 1, transform: "translateY(0px)" }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduced ? 0 : 0.26, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}

function Section({ id, eyebrow, title, lead, children }: { id: string; eyebrow?: string; title: string; lead?: string; children: ReactNode }) {
  return <section id={id} className={`section page-shell section-${id}`} aria-labelledby={`${id}-title`}><Reveal><header className="section-heading">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="section-title" id={`${id}-title`}>{title}</h2>{lead && <p className="section-lead">{lead}</p>}</header></Reveal>{children}</section>;
}

function LogoMark({ size = 24 }: { size?: number }) {
  return <Image className="logo-mark" src="/brand/switchyard-favicon-blue-180.png" width={size} height={size} alt="" aria-hidden="true" priority={size === 24} />;
}

function ThemeSwitch() {
  const [theme, setTheme] = useState("system");
  const themeRef = useRef("system");
  useEffect(() => {
    const saved = localStorage.getItem("switchyard-theme") || "system";
    themeRef.current = saved;
    setTheme(saved);
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => {
      if (themeRef.current === "system") document.documentElement.dataset.theme = query.matches ? "dark" : "light";
    };
    const syncControl = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      themeRef.current = value;
      setTheme(value);
    };
    query.addEventListener("change", syncSystem);
    window.addEventListener("switchyard-theme-change", syncControl);
    return () => {
      query.removeEventListener("change", syncSystem);
      window.removeEventListener("switchyard-theme-change", syncControl);
    };
  }, []);
  const change = (value: string) => {
    themeRef.current = value;
    setTheme(value);
    localStorage.setItem("switchyard-theme", value);
    const dark = value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.dataset.themeMode = value;
    window.dispatchEvent(new CustomEvent("switchyard-theme-change", { detail: value }));
  };
  return <label className="theme-control"><span className="sr-only">Color theme</span><select className="theme-select" value={theme} onChange={(event) => change(event.target.value)} aria-label="Color theme"><option value="light">Light</option><option value="system">System</option><option value="dark">Dark</option></select></label>;
}

function Navigation() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: "-20% 0px -68% 0px" });
    navItems.forEach(([, id]) => { const target = document.getElementById(id); if (target) observer.observe(target); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (open) sheetRef.current?.querySelector<HTMLElement>("a")?.focus();
    else if (wasOpen.current) toggleRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);
  const handleSheetKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { setOpen(false); return; }
    if (event.key !== "Tab" || !sheetRef.current) return;
    const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>("a, button, select"));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };
  return <>
    <div className="site-nav-wrap page-shell"><nav className="site-nav glass" aria-label="Main navigation">
      <a className="brand" href="#top" aria-label="Switchyard home"><LogoMark size={20} /><span>Switchyard</span></a>
      <div className="nav-links">{navItems.map(([label, id]) => <a key={id} className={`nav-link${active === id ? " active" : ""}`} href={`#${id}`} aria-current={active === id ? "location" : undefined}>{label}</a>)}</div>
      <div className="nav-actions"><ThemeSwitch /><a className="button button-ghost nav-github" href={REPO} target="_blank" rel="noreferrer">GitHub <ArrowRight size={14} /></a><button ref={toggleRef} className="icon-button menu-toggle" type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X size={18} /> : <Menu size={18} />}</button></div>
    </nav></div>
    <nav ref={sheetRef} id="mobile-nav" className="mobile-sheet glass-strong" data-open={open} onKeyDown={handleSheetKey} aria-label="Mobile navigation" aria-hidden={!open} inert={!open}>{navItems.map(([label, id]) => <a key={id} href={`#${id}`} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>{label}</a>)}<a href={REPO} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>View on GitHub</a><ThemeSwitch /></nav>
  </>;
}

function CopyButton({ value, compact = false }: { value: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  };
  return <><button className="copy-button" onClick={copy} type="button" aria-label={copied ? "Copied to clipboard" : "Copy code"}>{copied ? <Check size={14} /> : <Copy size={14} />}{compact ? null : copied ? "Copied" : "Copy"}</button><span className="copy-live" aria-live="polite">{copied ? "Copied" : ""}</span></>;
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return <div className="code-block">{label && <span className="copy-live">{label}</span>}<CopyButton value={code} /><pre className="mono"><code>{code}</code></pre></div>;
}

function LifecycleRail() {
  const railRef = useRef<HTMLDivElement>(null);
  const inView = useInView(railRef, { once: false, amount: 0.4 });
  const reduced = useReducedMotion();
  return <div ref={railRef} className="status-rail" aria-label="Task status lifecycle">{statuses.map(([label, key, shape]) => <div className="status-step" key={key}><span className={`status-dot ${shape === "hollow" || shape === "dashed" ? shape : ""} ${shape === "pulse" && inView && !reduced ? "pulse" : ""}`} style={{ "--lamp": `var(--c-${key})` } as React.CSSProperties} /><span>{label}</span></div>)}</div>;
}

function HeroBoard() {
  const prefersReduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState(prefersReduced ? 4 : 0);
  const frame = useRef<HTMLDivElement>(null);
  const isVisible = useInView(frame, { once: true, amount: 0.25 });
  useEffect(() => {
    if (prefersReduced) { setPhase(4); return; }
    if (!isVisible) return;
    setPhase(0);
    const timers = [600, 1200, 1800, 2400].map((delay, index) => setTimeout(() => setPhase(index + 1), delay));
    return () => timers.forEach(clearTimeout);
  }, [run, prefersReduced, isVisible]);
  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>(".task-card");
    frame.current?.querySelectorAll(".task-card").forEach((item) => item.removeAttribute("data-lit"));
    card?.setAttribute("data-lit", "true");
  }, []);
  const task = (lamp: string, extra?: ReactNode) => <motion.article layoutId="review-gate-task" className="task-card" style={{ "--lamp": `var(--c-${lamp})` } as React.CSSProperties}><div className={`coupler${lamp === "running" ? " coupler-running" : ""}`} /><h4>Add rate-limit tests</h4><p>cover validation edge cases</p><div className="task-meta"><span>dsh</span><span>Mac</span></div>{extra}</motion.article>;
  const activeTask = prefersReduced ? null : task(phase === 1 ? "running" : "ready");
  const col = (name: string, lamp: string, children: ReactNode) => <div className="board-column" key={name}><h3><span className={`status-dot ${lamp === "todo" ? "hollow" : ""}`} style={{ "--lamp": `var(--c-${lamp})` } as React.CSSProperties} />{name}</h3>{children}</div>;
  const card = (title: string, summary: string, executor: string, host: string, lamp: string, extra?: ReactNode) => <article className="task-card" style={{ "--lamp": `var(--c-${lamp})` } as React.CSSProperties}><div className={`coupler${lamp === "running" ? " coupler-running" : ""}`} /><h4>{title}</h4><p>{summary}</p><div className="task-meta"><span>{executor}</span><span>{host}</span></div>{extra}</article>;
  return <div className="hero-visual"><div className="board-frame glass" ref={frame} onPointerMove={onPointerMove}>
    <div className="board-topline"><div><strong>Engineering board</strong><span className="footnote"> · Task flow preview</span></div><div className="board-controls"><span className="chip">one dispatcher</span><button className="replay" type="button" onClick={() => setRun((value) => value + 1)} aria-label="Replay task lifecycle animation"><RefreshCw size={13} />Replay</button></div></div>
    <div className="board-scroll"><LayoutGroup id="hero-task"><div className="board-columns">
      {col("Ready", "ready", (!prefersReduced && phase === 0) ? activeTask : (prefersReduced ? task("ready") : null))}
      {col("Running", "running", (!prefersReduced && phase === 1) ? activeTask : null)}
      {col("Blocked", "blocked", card("Update node service", "executor unavailable", "shell", "Windows", "blocked"))}
      {col("Review", "review", (!prefersReduced && phase >= 2 && phase <= 3) ? task("review", <><span className="task-meta"><span className="diff-chip">+42 −7</span></span>{phase === 3 && <span className="commit-mini is-highlighted"><Check size={12} /> Commit</span>}</>) : (prefersReduced ? task("review", <><span className="task-meta"><span className="diff-chip">+42 −7</span></span><span className="commit-mini is-highlighted"><Check size={12} /> Commit</span></>) : null))}
      {col("Done", "done", (!prefersReduced && phase >= 4) ? task("done", <span className="task-meta"><span>approved</span></span>) : (prefersReduced ? task("done", <span className="task-meta"><span>approved</span></span>) : null))}
    </div></LayoutGroup></div>
  </div></div>;
}

function Architecture() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const diagramVisible = useInView(diagramRef, { once: true, amount: 0.25 });
  return <><div ref={diagramRef} className="arch-wrap glass-card">
    <p className="arch-label">Control plane · VPS</p>
    <svg className={`arch-svg${diagramVisible ? " is-visible" : ""}`} viewBox="0 0 980 330" role="img" aria-labelledby="diagram-title diagram-desc">
      <title id="diagram-title">Switchyard control and execution planes</title><desc id="diagram-desc">Boards feed a single dispatcher and node-agent server. The server routes tasks over gRPC or HTTP fallback to Mac and Windows workers. Results return to the review gate and board.</desc>
      <g className="arch-edges" aria-hidden="true">
        <line x1="176" y1="105" x2="226" y2="105" className="arch-edge" />
        <line x1="390" y1="105" x2="440" y2="105" className="arch-edge" />
        <line x1="540" y1="105" x2="658" y2="105" className="arch-edge" />
        <line x1="440" y1="228" x2="390" y2="228" className="arch-edge" />
        <line x1="226" y1="228" x2="176" y2="228" className="arch-edge" />
        <line x1="540" y1="138" x2="540" y2="196" className="arch-edge" />
        <line x1="778" y1="112" x2="778" y2="180" className="arch-edge" />
      </g>
      <rect x="10" y="10" width="620" height="300" rx="16" fill="none" stroke="var(--c-line-strong)" strokeDasharray="5 5"/><text x="28" y="38" className="arch-subtext">CONTROL PLANE · VPS</text>
      <rect x="658" y="10" width="312" height="300" rx="16" fill="none" stroke="var(--c-line-strong)" strokeDasharray="5 5"/><text x="678" y="38" className="arch-subtext">EXECUTION PLANE · WORKERS</text>
      <g aria-hidden="true"><rect className="arch-box" x="30" y="72" width="146" height="66" rx="10"/><text x="48" y="101" className="arch-text">Kanban boards</text><text x="48" y="122" className="arch-subtext">SQLite per board</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="226" y="72" width="164" height="66" rx="10"/><text x="244" y="101" className="arch-text">Single dispatcher</text><text x="244" y="122" className="arch-subtext">poll every 30s</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="440" y="72" width="200" height="66" rx="10"/><text x="458" y="101" className="arch-text">Node-agent server</text><text x="458" y="122" className="arch-subtext">:8788 HTTP · :8789 gRPC</text></g>
      <text x="260" y="163" className="arch-subtext">POST /api/dispatch</text><text x="682" y="155" className="arch-subtext">gRPC preferred · HTTP fallback</text>
      <g aria-hidden="true"><rect className="arch-box" x="440" y="195" width="200" height="66" rx="10"/><text x="458" y="224" className="arch-text">Review gate</text><text x="458" y="245" className="arch-subtext">diff + approve</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="226" y="195" width="164" height="66" rx="10"/><text x="244" y="224" className="arch-text">Board</text><text x="244" y="245" className="arch-subtext">review → done</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="678" y="72" width="270" height="66" rx="10"/><text x="698" y="101" className="arch-text">Mac agent</text><text x="698" y="122" className="arch-subtext">hermes · codex · commandcode · shell · dsh · claude</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="678" y="180" width="270" height="66" rx="10"/><text x="698" y="209" className="arch-text">Windows agent</text><text x="698" y="230" className="arch-subtext">registered workspace host</text></g>
      <text x="684" y="282" className="arch-subtext">POST /api/nodes/:id/result</text>
    </svg>
    <ol className="arch-mobile"><li><strong>Control plane:</strong> boards store tasks in SQLite per board.</li><li>The single dispatcher polls every 30 seconds and sends <code className="mono">POST /api/dispatch</code> to the node-agent server.</li><li><strong>Execution plane:</strong> Mac and Windows workers run on the hosts that own the source code. gRPC is preferred; HTTP long-poll is the fallback.</li><li>Workers return results through <code className="mono">POST /api/nodes/:id/result</code>.</li><li>The review gate fetches the diff. A person approves before the task moves to done.</li></ol><ol className="sr-only"><li>Kanban boards use SQLite per board and feed a single dispatcher that polls every 30 seconds.</li><li>The dispatcher sends <code>POST /api/dispatch</code> to the node-agent server on the control plane, using HTTP port 8788 and gRPC port 8789.</li><li>The server routes the task to a registered Mac or Windows worker on the execution plane. gRPC is preferred and HTTP long-poll is the fallback.</li><li>Workers return task results with <code>POST /api/nodes/:id/result</code>.</li><li>The review gate fetches the diff. A person approves the changes before the task can move from review to done.</li></ol>
  </div><p className="arch-callout">Paths like <code className="mono">/Users/…</code> and <code className="mono">C:\…</code> are routed to their registered host, never executed on the VPS.</p></>;
}

const dispatchJson = `{
  "task_id": "t1",
  "board": "saas",
  "message": "Fix login validation",
  "workspace": "/Users/<user>/Development/saas",
  "executor": "dsh"
}`;
const registerJson = `{
  "node_id": "mac",
  "workspaces": ["/Users/<user>/Development"],
  "executors": ["hermes", "codex", "commandcode", "shell", "dsh", "claude"],
  "versions": {"commandcode": "..."}
}`;
const workspaceText = `Source of truth: ~/.hermes/workspaces.json

Workspace entries include path, host and OS.
Saves merge unknown keys back so other
consumers keep their workspace metadata.`;

function CodeTabs() {
  const [tab, setTab] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);
  const tabs = ["Dispatch payload", "Node registration", "Workspace entry"];
  const snippets = [dispatchJson, registerJson, workspaceText];
  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (tab + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setTab(next);
    tabListRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };
  return <div className="api-code"><div ref={tabListRef} className="tab-list" role="tablist" aria-label="API examples" onKeyDown={keyDown}>{tabs.map((name, index) => <button key={name} id={`api-tab-${index}`} role="tab" className="tab-button" aria-selected={tab === index} aria-controls="api-tabpanel" tabIndex={tab === index ? 0 : -1} onClick={() => setTab(index)}>{name}</button>)}</div><div ref={panelRef} id="api-tabpanel" role="tabpanel" aria-labelledby={`api-tab-${tab}`}><CopyButton value={snippets[tab]} compact /><pre className="mono"><code>{snippets[tab]}</code></pre></div></div>;
}

function TransportToy() {
  const [grpc, setGrpc] = useState(true);
  return <div className="transport-toy glass-card"><div className="board-topline"><strong>Worker connection</strong><span className="chip">Illustration · <code className="mono">{grpc ? "grpc" : "http"}</code></span></div><div className={`lane${grpc ? " active" : ""}`}><Radio size={17} /><code className="mono">gRPC stream</code><span className="lane-line" /><span>{grpc ? "active" : "available"}</span></div><div className={`lane${!grpc ? " active" : ""}`}><Route size={17} /><code className="mono">HTTP long-poll</code><span className="lane-line" /><span>{grpc ? "fallback" : "active"}</span></div><button className="button button-secondary transport-toggle" onClick={() => setGrpc(!grpc)} type="button"><RefreshCw size={15} />{grpc ? "Simulate drop" : "Restore gRPC"}</button><p className="footnote">Client-side illustration only. No network calls.</p></div>;
}

const faqs = [
  ["Can an agent commit or push without me?", "No. Agents mutate the working tree only. Commit and push happen through the review gate."],
  ["Why not run agents on the VPS?", "The code lives on your Mac or Windows machine. Node-agent runs the executor where the source is."],
  ["What happens if a task fails?", "It retries up to 3 times, then becomes blocked."],
  ["Why is my task stuck in review?", "That is expected. Open the diff, then pick Commit or Commit & Push."],
  ["Do I have to upgrade workers immediately?", "No. Old nodes keep their previous capabilities while you roll out the VPS changes first."],
  ["What if a worker is missing an executor?", "The dispatch is rejected with executor unavailable. Re-register the node after installing that executor."],
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const handleFaqKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>(".faq-question"));
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : buttons.length - 1)) % buttons.length;
    buttons[next]?.focus();
  };
  return <>
    <a className="skip-link" href="#main">Skip to content</a><div className="glow-field" aria-hidden="true"><span className="glow-orb glow-orb--blue" /><span className="glow-orb glow-orb--violet" /><span className="glow-orb glow-orb--cyan" /></div>
    <header id="top"><Navigation /></header>
    <main id="main">
      <section className="hero page-shell" aria-labelledby="hero-title"><div className="hero-copy"><p className="eyebrow">Control plane for coding agents</p><h1 id="hero-title">Queue tasks. Dispatch to the machine that owns the code. Nothing lands until you review the diff.</h1><p>Switchyard stores boards and tasks, claims them with a single dispatcher, runs them on the machine that owns your code, and holds every result in review until you inspect and approve it.</p><div className="hero-actions"><a className="button button-primary" href={REPO} target="_blank" rel="noreferrer">View on GitHub <ArrowRight size={16} /></a><a className="button button-secondary" href="#architecture">Read the architecture</a></div><div className="hero-meta" aria-label="Technology stack"><span className="chip mono">Go</span><span className="chip mono">SQLite</span><span className="chip mono">React + Vite</span><span className="chip mono">gRPC with HTTP fallback</span></div></div><HeroBoard /></section>
      <div className="page-shell"><div className="problem-strip" aria-label="Why Switchyard exists"><article className="problem-item"><Monitor className="problem-icon" size={20} /><div><strong>Agents run where the code lives.</strong><p>Your repo is on a Mac or Windows box, not on the server running the scheduler.</p></div></article><article className="problem-item"><GitCommitHorizontal className="problem-icon" size={20} /><div><strong>Agents shouldn’t commit on their own.</strong><p>A passing run still needs a human look at the diff.</p></div></article><article className="problem-item"><Workflow className="problem-icon" size={20} /><div><strong>One dispatcher, one queue.</strong><p>Two schedulers claiming the same task is a bug, not a feature.</p></div></article></div></div>
      <Section id="architecture" eyebrow="Architecture" title="Two planes, one queue" lead="The VPS runs the control plane. Node-agent runs the execution plane on every host that owns source code. Remote workspaces are never used as cwd by local VPS processes."><Architecture /></Section>
      <Section id="lifecycle" title="Success lands in review, never in done" lead="Every executor goes through the same gate."><Reveal><LifecycleRail /></Reveal><div className="stepper-wrap"><div className="stepper">{["Agent mutates the working tree but does not commit or push.", "Board fetches the diff from the workspace host.", <>You pick <strong>Commit</strong> or <strong>Commit &amp; Push</strong>.</>, "Board runs approval over SSH.", <>Status moves from <code className="mono">review</code> to <code className="mono">done</code>.</>].map((text, index) => <Reveal className="step-card glass-card" delay={index * 0.014} key={index}><span className="step-number">{index + 1}</span><p>{text}</p></Reveal>)}</div></div><div className="guarantee-grid">{["Successful results become review, not done.", "A plain status PATCH cannot move a task from review to done.", "Failures retry up to 3 times, then become blocked.", "Shell tasks with an empty command are rejected up front."].map((text) => <div className="guarantee" key={text}><CheckCircle2 size={17} /><span>{text}</span></div>)}</div><CodeBlock code={`GET  /api/boards/{slug}/tasks/{id}/diff\nPOST /api/boards/{slug}/tasks/{id}/approve\n{"action": "commit", "message": "optional commit message"}`} label="Review gate API" /></Section>
      <Section id="executors" title="Pick a runtime only when you need to" lead="Tasks store human intent as a title and description. Choose an executor only to force a specific runtime."><div className="executor-grid">{[["auto", "Legacy SSH from VPS", "Hermes on the VPS, file access over SSH. Kept for backward compatibility."], ["hermes", "node-agent", "Hermes on the workspace host."], ["codex", "node-agent", "Codex on the workspace host."], ["claude", "node-agent", "Claude CLI on the workspace host."], ["commandcode", "node-agent", "CommandCode on the workspace host."], ["dsh", "node-agent", "DSH CLI on the workspace host."], ["shell", "node-agent", "Direct remote commands; command is the only executed input."]].map(([name, route, description]) => <Reveal key={name} className="executor-card glass-card"><h3>{name}</h3><span className="mono">Route · {route}</span><p>{description}</p></Reveal>)}</div><div className="warning-note"><AlertTriangle size={18} /><span>CommandCode runs with <code className="mono">--yolo</code>, which lets the worker edit files and run shell commands. Use it only on trusted nodes.</span></div><div className="match-demo"><div><p>Node capabilities</p><span className="chip mono">hermes · codex · claude · commandcode · dsh · shell</span></div><ArrowRight className="problem-icon" size={19} /><div><p>Request</p><span className="chip mono">dsh</span><span className="footnote">The server picks a node by workspace prefix plus executor capability.</span></div><div><p>If missing</p><span className="chip mono">executor unavailable</span></div></div></Section>
      <Section id="transport" title="gRPC when it’s up, HTTP when it isn’t" lead="Node-agent prefers gRPC and falls back to HTTP long-poll when the stream drops. Operators can see which path a task took."><div className="transport-layout"><TransportToy /><div><table className="config-table"><thead><tr><th>Setting</th><th>Meaning</th></tr></thead><tbody><tr><td><code className="mono">NODE_AGENT_TRANSPORT=auto</code></td><td>gRPC preferred, HTTP fallback</td></tr><tr><td><code className="mono">NODE_AGENT_TRANSPORT=grpc</code></td><td>Fail-closed when gRPC is unavailable</td></tr><tr><td><code className="mono">NODE_AGENT_TRANSPORT=http</code></td><td>Forces the compatibility lane</td></tr></tbody></table><span className="security-chip"><LockKeyhole size={14} />Keep gRPC port <code className="mono">8789</code> private on the tailnet. Tailscale connects VPS and workers.</span></div></div></Section>
      <Section id="context" title="Less context in, less noise out" lead="Three layers keep agent prompts and shell output small."><div className="context-grid">{[["codegraph", "Structural index of the codebase on the workspace host.", "Used for hermes, codex and commandcode."], ["rtk", "Shortens verbose shell commands and output within bounded timeouts.", "800 ms hook check/rewrite · 2 s --ultra-compact cap"], ["caveman", "Optional compact output for shell over 8 KiB, with fail-open behavior.", "NODE_AGENT_SHELL_CAVEMAN=1"]].map(([name, text, detail]) => <Reveal key={name} className="context-card glass-card"><h3>{name}</h3><p>{text}</p><span className="mono">{detail}</span></Reveal>)}</div><p className="footnote">Shell tasks skip AGENTS/README/codegraph prompt injection by default.</p></Section>
      <Section id="api" title="A small, boring API" lead="A compact surface for boards, tasks, workspaces, flow and remote dispatch."><div className="api-layout"><div><div className="api-table-wrap"><table className="api-table"><thead><tr><th>Method</th><th>Path</th><th>Purpose</th></tr></thead><tbody>{[["GET / POST", "/api/boards", "Boards and tasks"], ["PATCH", "/api/boards/{slug}/tasks/{id}/status", "Status transitions"], ["PATCH", "/api/boards/{slug}/tasks/{id}/assignee", "Change assignee"], ["GET", "/api/boards/{slug}/tasks/{id}/diff", "Workspace diff"], ["POST", "/api/boards/{slug}/tasks/{id}/approve", "Commit or push"], ["GET/POST/PUT/DELETE", "/api/workspaces*", "Workspaces and health"], ["GET", "/api/flow/active", "Active flow tasks"], ["POST", "/api/remote/dispatch", "Manual dispatch"], ["GET", "/api/nodes", "Node status"]].map(([method, path, purpose]) => <tr key={path}><td className="mono">{method}</td><td className="mono">{path}</td><td>{purpose}</td></tr>)}</tbody></table></div><p className="footnote">All <code className="mono">/api/*</code> routes require the <code className="mono">kanban_session</code> HttpOnly cookie except the four <code className="mono">/api/auth/*</code> routes.</p></div><CodeTabs /></div></Section>
      <Section id="deploy" title="Roll out the VPS first" lead="Mac and Windows agents keep running with their previous capabilities until you upgrade them."><div className="deploy-layout"><div className="timeline-wrap"><ol className="timeline">{[<>Build and restart node-agent server on the VPS (HTTP <code className="mono">:8788</code>, gRPC <code className="mono">:8789</code>).</>, "Build and restart kanban-board (Switchyard).", <>Cross-build the worker binary (<code className="mono">GOOS=darwin GOARCH=arm64</code> for Apple Silicon).</>, "Reinstall the agent on Mac or Windows and restart the LaunchAgent or service.", <>Confirm node is <code className="mono">idle</code> and capability and <code className="mono">transports</code> show at <code className="mono">/api/nodes</code>.</>, <>Run a dispatch canary: expect <code className="mono">success=true</code>, a <code className="mono">delivery_id</code>, and transport <code className="mono">grpc</code> (or fallback <code className="mono">http</code>).</>].map((text, index) => <li key={index}><p>{text}</p></li>)}</ol></div><div><CodeBlock code={`go vet ./...\ngo test ./...\ngo build -o bin/kanban-board ./cmd/server\ncd web && pnpm build\npm2 restart kanban-board`} label="Build and deploy commands" /><div className="fact-card glass-card">Production serves static <code className="mono">web/dist</code> from the Go binary; no Node or Bun runtime stays alive.</div><div className="fact-card glass-card">Frontend builds are RAM-heavy on a 2 GB VPS.</div></div></div></Section>
      <Section id="faq" eyebrow="FAQ" title="Questions about the review gate"><div className="faq-panel glass" onKeyDown={handleFaqKeyDown}>{faqs.map(([question, answer], index) => <div className="faq-item" key={question}><h3 style={{ margin: 0, fontSize: "inherit", fontWeight: "inherit" }}><button id={`faq-button-${index}`} className="faq-question" type="button" aria-expanded={openFaq === index} aria-controls={`faq-panel-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>{question}<ChevronDown size={17} aria-hidden="true" /></button></h3><div id={`faq-panel-${index}`} className="faq-answer" role="region" aria-labelledby={`faq-button-${index}`} aria-hidden={openFaq !== index} inert={openFaq !== index} hidden={openFaq !== index} data-open={openFaq === index}>{answer}</div></div>)}</div></Section>
      <section className="page-shell final-cta glass" aria-labelledby="final-title"><div className="mascot-mark"><Image src="/brand/mascot-switchyard.png" width={120} height={120} alt="Switchyard mascot" /></div><h2 id="final-title">Put a gate in front of your agents</h2><p>Control plane in Go, execution plane in node-agent.</p><div className="final-actions"><a className="button button-primary" href={REPO} target="_blank" rel="noreferrer">View on GitHub <ArrowRight size={16} /></a><a className="button button-secondary" href={NODE_AGENT} target="_blank" rel="noreferrer">node-agent repo</a></div></section>
    </main>
    <footer className="site-footer page-shell"><a className="brand" href="#top"><LogoMark size={22} /><span>Switchyard</span></a><span>Part of a two-repo system</span><nav className="footer-links" aria-label="Related links"><a href={REPO} target="_blank" rel="noreferrer">Switchyard</a><a href={NODE_AGENT} target="_blank" rel="noreferrer">node-agent</a><a href={`${REPO}/blob/main/design.md`} target="_blank" rel="noreferrer">Design spec</a><a href="https://commandcode.ai/docs/headless" target="_blank" rel="noreferrer">CommandCode headless docs</a><a href="https://github.com/rtk-ai/rtk" target="_blank" rel="noreferrer">RTK</a><a href="https://github.com/JuliusBrussee/caveman" target="_blank" rel="noreferrer">Caveman</a></nav><ThemeSwitch /></footer>
  </>;
}
