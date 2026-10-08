"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { LayoutGroup, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import {
  AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, Copy, Github, GitCommitHorizontal,
  LockKeyhole, Monitor, Moon, Radio, RefreshCw, Route, ShieldCheck, Sparkles, Sun, Terminal, Workflow,
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
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, transform: "translateY(10px)" }} whileInView={{ opacity: 1, transform: "translateY(0px)" }} viewport={{ once: true, amount: 0.15, margin: "-60px" }} transition={{ duration: reduced ? 0 : 0.34, delay: reduced ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}

function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return <section id={id} className={`section page-shell section-${id}`} aria-labelledby={`${id}-title`}><Reveal><header className="section-heading"><h2 className="section-title" id={`${id}-title`}>{title}</h2>{lead && <p className="section-lead">{lead}</p>}</header></Reveal>{children}</section>;
}

function LogoMark({ size = 24 }: { size?: number }) {
  return <Image className="logo-mark" src="/brand/switchyard-favicon-blue-180.png" width={size} height={size} alt="" aria-hidden="true" priority={size === 24} />;
}

function applyTheme(value: string) {
  const dark = value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.themeMode = value;
}

const themeModes = [
  ["light", "Light", Sun],
  ["system", "System", Monitor],
  ["dark", "Dark", Moon],
] as const;

function ThemeSwitch() {
  const [theme, setTheme] = useState("system");
  const themeRef = useRef("system");
  const groupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const saved = localStorage.getItem("switchyard-theme") || "system";
    themeRef.current = saved;
    setTheme(saved);
    // Hydration reconciles the server-rendered <html>, so re-apply the stored theme here.
    applyTheme(saved);
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => {
      if (themeRef.current === "system") applyTheme("system");
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
    applyTheme(value);
    window.dispatchEvent(new CustomEvent("switchyard-theme-change", { detail: value }));
  };
  const index = Math.max(0, themeModes.findIndex(([value]) => value === theme));
  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : themeModes.length - 1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? themeModes.length - 1 : (index + step) % themeModes.length;
    change(themeModes[next][0]);
    groupRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]")[next]?.focus();
  };
  return <div ref={groupRef} className="theme-switch" role="radiogroup" aria-label="Color theme" onKeyDown={handleKey}>
    <span className="theme-thumb" style={{ transform: `translateX(${index * 100}%)` }} aria-hidden="true" />
    {themeModes.map(([value, label, Icon]) => <button key={value} className="theme-option" type="button" role="radio" aria-checked={theme === value} aria-label={label} tabIndex={theme === value ? 0 : -1} onClick={() => change(value)}><Icon size={15} aria-hidden="true" /></button>)}
  </div>;
}

function SiteHeader() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  const scrollState = useRef({ reduced: false, open: false });
  const reduced = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: "-20% 0px -68% 0px" });
    navItems.forEach(([, id]) => { const target = document.getElementById(id); if (target) observer.observe(target); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let last = window.scrollY;
    let travel = 0;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const bar = progressRef.current;
      if (bar) {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, Math.max(0, y / scrollable)) : 0})`;
        bar.style.opacity = y > 8 ? "1" : "0";
      }
      header.dataset.condensed = y > 12 ? "true" : "false";
      travel = y - last > 0 ? Math.max(0, travel) + (y - last) : Math.min(0, travel) + (y - last);
      last = y;
      const state = scrollState.current;
      const active = document.activeElement;
      const keyboardFocus = active instanceof Element && header.contains(active) && active.matches(":focus-visible");
      if (state.reduced || state.open || keyboardFocus) header.dataset.hidden = "false";
      else if (travel > 28 && y > 620) header.dataset.hidden = "true";
      else if (travel < -10 || y <= 620) header.dataset.hidden = "false";
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    scrollState.current.reduced = !!reduced;
    if (reduced && headerRef.current) headerRef.current.dataset.hidden = "false";
  }, [reduced]);
  useEffect(() => {
    scrollState.current.open = open;
    if (open && headerRef.current) headerRef.current.dataset.hidden = "false";
  }, [open]);
  useEffect(() => {
    if (open) sheetRef.current?.querySelector<HTMLElement>("a")?.focus();
    else if (wasOpen.current) toggleRef.current?.focus({ preventScroll: true });
    wasOpen.current = open;
  }, [open]);

  const handleSheetKey = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") { setOpen(false); return; }
    if (event.key !== "Tab" || !sheetRef.current) return;
    const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>("a, button"));
    if (!items.length) return;
    const first = items[0];
    const lastItem = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); lastItem.focus(); }
    else if (!event.shiftKey && document.activeElement === lastItem) { event.preventDefault(); first.focus(); }
  };

  return <>
    <header id="top" className="site-header" ref={headerRef}>
      <span className="scroll-progress" ref={progressRef} aria-hidden="true" />
      <div className="site-nav-wrap page-shell"><nav className="site-nav" aria-label="Main navigation">
        <a className="brand" href="#main" aria-label="Switchyard home"><LogoMark size={20} /><span>Switchyard</span></a>
        <div className="nav-links">{navItems.map(([label, id]) => <a key={id} className="nav-link" href={`#${id}`} aria-current={active === id ? "location" : undefined}>{active === id && <motion.span className="nav-link-pill" layoutId={reduced ? undefined : "nav-active"} transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }} />}<span>{label}</span></a>)}</div>
        <div className="nav-actions"><ThemeSwitch /><a className="button button-ghost nav-github" href={REPO} target="_blank" rel="noreferrer">GitHub <ArrowRight size={14} /></a><button ref={toggleRef} className="icon-button menu-toggle" type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}><span className="menu-icon" data-open={open} aria-hidden="true"><span /><span /></span></button></div>
      </nav></div>
      <div className="mobile-scrim" data-open={open} aria-hidden="true" onClick={() => setOpen(false)} />
      <nav ref={sheetRef} id="mobile-nav" className="mobile-sheet glass-strong" data-open={open} onKeyDown={handleSheetKey} aria-label="Mobile navigation" aria-hidden={!open} inert={!open}>
        {navItems.map(([label, id], position) => <a key={id} data-item href={`#${id}`} tabIndex={open ? 0 : -1} style={{ transitionDelay: open ? `${70 + position * 26}ms` : "0ms" }} onClick={() => setOpen(false)}>{label}</a>)}
        <a data-item href={REPO} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1} style={{ transitionDelay: open ? `${70 + navItems.length * 26}ms` : "0ms" }} onClick={() => setOpen(false)}>View on GitHub</a>
        <div data-item style={{ transitionDelay: open ? `${70 + (navItems.length + 1) * 26}ms` : "0ms" }}><ThemeSwitch /></div>
      </nav>
    </header>
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
  return <div className="code-block">{label && <span className="copy-live">{label}</span>}<CopyButton value={code} /><pre className="mono" tabIndex={0}><code>{code}</code></pre></div>;
}

function LifecycleRail({ active }: { active: number }) {
  const railRef = useRef<HTMLDivElement>(null);
  const inView = useInView(railRef, { once: false, amount: 0.4 });
  const reduced = useReducedMotion();
  return <div ref={railRef} className="status-rail" aria-label="Task status lifecycle">{statuses.map(([label, key, shape], index) => <div className="status-step" key={key} data-active={!reduced && inView && index === active}><span className={`status-dot ${shape === "hollow" || shape === "dashed" ? shape : ""} ${shape === "pulse" && inView && !reduced ? "pulse" : ""}`} style={{ "--lamp": `var(--c-${key})` } as CSSProperties} /><span>{label}</span></div>)}</div>;
}

const reviewSteps = [
  "The agent mutates the working tree but does not commit or push.",
  "The board fetches the diff from the workspace host.",
  <>You pick <strong>Commit</strong> or <strong>Commit &amp; Push</strong>.</>,
  "The board runs approval over SSH.",
  <>Status moves from <code className="mono">review</code> to <code className="mono">done</code>.</>,
];

function Lifecycle() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setActive((value) => (value + 1) % statuses.length), 1300);
    return () => clearInterval(timer);
  }, [reduced]);
  return <>
    <Reveal className="lifecycle-console"><Tilt><AgentConsole /></Tilt></Reveal>
    <Reveal><LifecycleRail active={active} /></Reveal>
    <div className="lifecycle-layout">
      <div className="lifecycle-steps">
        {reviewSteps.map((text, index) => <Reveal className="lifecycle-step" delay={index * 0.05} key={index}><span className="step-number">{index + 1}</span><p>{text}</p></Reveal>)}
      </div>
      <Reveal className="lifecycle-evidence" delay={0.1}>
        <CodeBlock code={`GET  /api/boards/{slug}/tasks/{id}/diff\nPOST /api/boards/{slug}/tasks/{id}/approve\n{"action": "commit", "message": "optional commit message"}`} label="Review gate API" />
        <div className="diff-preview mono">
          <div className="diff-line diff-line--add">+ assert.Equal(t, 429, resp.Code)</div>
          <div className="diff-line diff-line--del">− assert.Equal(t, 200, resp.Code)</div>
          <span className="diff-hold"><ShieldCheck size={13} aria-hidden="true" />awaiting human approval</span>
        </div>
      </Reveal>
    </div>
    <div className="guarantee-grid">{["Successful results become review, not done.", "A plain status PATCH cannot move a task from review to done.", "Failures retry up to 3 times, then become blocked.", "Shell tasks with an empty command are rejected up front."].map((text) => <div className="guarantee" key={text}><CheckCircle2 size={17} aria-hidden="true" /><span>{text}</span></div>)}</div>
  </>;
}

const boardColumns = [
  ["Ready", "ready"], ["Running", "running"], ["Blocked", "blocked"], ["Review", "review"], ["Done", "done"],
] as const;

const CONSOLE_LOG = [
  { tone: "claim", text: "▸ claim task t1 · “Add rate-limit tests”" },
  { tone: "plan", text: "✦ plan: read limiter.go → write table tests → run go test" },
  { tone: "route", text: "→ dispatch via gRPC to mac-studio (owns /Users/dev/saas)" },
  { tone: "run", text: "  ok  saas/limiter  0.412s  (+42 −7)" },
  { tone: "gate", text: "\u23f8 held in REVIEW \u2014 waiting for a human to approve the diff" },
] as const;

const CONSOLE_HOLD = 1900;

type CommitState = "idle" | "ready" | "done";

function TaskCard({
  lamp, title, summary, executor, host, diff, commit, layoutId,
}: {
  lamp: string; title: string; summary: string; executor: string; host: string;
  diff?: boolean; commit?: CommitState; layoutId?: string;
}) {
  return <motion.article
    className="task-card"
    layoutId={layoutId}
    transition={{ layout: { duration: 0.3, ease: [0.23, 1, 0.32, 1] } }}
    style={{ "--lamp": `var(--c-${lamp})` } as CSSProperties}
  >
    <div className={`coupler${lamp === "running" ? " coupler-running" : ""}`} />
    <p className="task-card-title">{title}</p>
    <p>{summary}</p>
    <div className="task-meta"><span>{executor}</span><span>{host}</span></div>
    {diff !== undefined && <div className="task-meta"><span className="diff-chip" data-shown={diff}>+42 −7</span></div>}
    {commit && <span className="commit-mini" data-state={commit}><Check size={12} />{commit === "done" ? "Committed" : "Commit"}</span>}
  </motion.article>;
}

const heroTask = { title: "Add rate-limit tests", summary: "cover validation edge cases", executor: "dsh", host: "Mac" };

function EngineeringBoard() {
  const prefersReduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const isVisible = useInView(frame, { once: true, amount: 0.2 });
  const columnForPhase = phase >= 4 ? 4 : phase >= 2 ? 3 : phase;

  useEffect(() => {
    if (prefersReduced) { setPhase(4); return; }
    if (!isVisible) return;
    setPhase(0);
    const timers = [700, 1400, 2100, 2800].map((delay, index) => setTimeout(() => setPhase(index + 1), delay));
    return () => timers.forEach(clearTimeout);
  }, [run, prefersReduced, isVisible]);

  useEffect(() => {
    const el = scroller.current;
    if (!el || el.scrollWidth <= el.clientWidth + 1) return;
    const column = el.querySelectorAll<HTMLElement>(".board-column")[columnForPhase];
    if (!column) return;
    const left = column.offsetLeft - (el.clientWidth - column.clientWidth) / 2;
    el.scrollTo({ left: Math.max(0, Math.min(left, el.scrollWidth - el.clientWidth)), behavior: prefersReduced ? "auto" : "smooth" });
  }, [columnForPhase, prefersReduced]);

  const onPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const card = (event.target as HTMLElement).closest<HTMLElement>(".task-card");
    frame.current?.querySelectorAll(".task-card").forEach((item) => item.removeAttribute("data-lit"));
    card?.setAttribute("data-lit", "true");
  }, []);

  const blockedCard = <TaskCard lamp="blocked" title="Update node service" summary="executor unavailable" executor="shell" host="Windows" />;
  const movingCard = <TaskCard layoutId="hero-task" lamp={phase >= 4 ? "done" : phase >= 2 ? "review" : phase === 1 ? "running" : "ready"} {...heroTask} diff={phase >= 2} commit={phase >= 3 ? (phase >= 4 ? "done" : "ready") : undefined} />;

  const cardFor = (index: number) => {
    if (index === 2) return blockedCard;
    if (prefersReduced) return index === 3 ? <TaskCard lamp="review" {...heroTask} diff commit="ready" /> : null;
    return index === columnForPhase ? movingCard : null;
  };

  return <div className="board-frame glass-panel" ref={frame} onPointerMove={onPointerMove}>
    <div className="board-topline"><div><strong>Engineering board</strong><span className="footnote"> · Task flow preview</span></div><div className="board-controls"><span className="chip">one dispatcher</span><button className="replay" type="button" onClick={() => setRun((value) => value + 1)} aria-label="Replay task lifecycle animation"><RefreshCw size={13} />Replay</button></div></div>
    <div className="board-scroll" ref={scroller}><LayoutGroup id="hero-task"><div className="board-columns">
      {boardColumns.map(([name, lamp], index) => <div className="board-column" key={name}><p className="board-column-title"><span className="status-dot" style={{ "--lamp": `var(--c-${lamp})` } as CSSProperties} />{name}</p>{cardFor(index)}</div>)}
    </div></LayoutGroup></div>
  </div>;
}

function AgentConsole() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(1);
  const bodyRef = useRef<HTMLDivElement>(null);
  const settled = step > CONSOLE_LOG.length;

  useEffect(() => {
    if (reduced) { setStep(CONSOLE_LOG.length + 1); return; }
    const timer = setTimeout(() => {
      setStep((value) => (value >= CONSOLE_LOG.length + 2 ? 1 : value + 1));
    }, step > CONSOLE_LOG.length ? CONSOLE_HOLD * 1.7 : CONSOLE_HOLD);
    return () => clearTimeout(timer);
  }, [step, reduced]);

  // Follow the newest line on narrow screens, where the log scrolls.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [step]);

  return <div className="console glass-strong">
    <div className="console-bar">
      <span className="console-dot" style={{ "--dot": "#ff5f57" } as CSSProperties} />
      <span className="console-dot" style={{ "--dot": "#febc2e" } as CSSProperties} />
      <span className="console-dot" style={{ "--dot": "#28c840" } as CSSProperties} />
      <span className="console-title mono">switchyard · engineering board</span>
      <span className="console-live mono"><span className="console-live-dot" data-settled={settled} />one dispatcher</span>
    </div>
    <div className="console-body mono" ref={bodyRef} aria-hidden="true">
      {CONSOLE_LOG.slice(0, step).map((line) => <motion.div key={line.tone} className={`console-line console-line--${line.tone}`} initial={reduced ? false : { opacity: 0, transform: "translateX(-8px)" }} animate={{ opacity: 1, transform: "translateX(0px)" }} transition={{ duration: reduced ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}>{line.text}</motion.div>)}
      <span className="console-caret" />
    </div>
    <p className="copy-live" role="status">{settled ? "Task held in review, waiting for approval." : "Task running."}</p>
  </div>;
}

function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 80, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 80, damping: 20 });
  const rotateX = useTransform(springY, [-1, 1], [4, -4]);
  const rotateY = useTransform(springX, [-1, 1], [-5, 5]);

  return <div
    ref={ref}
    className={className}
    onPointerMove={(event) => {
      if (reduced || event.pointerType !== "mouse" || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
      pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
    }}
    onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}
  >
    <motion.div style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}>{children}</motion.div>
  </div>;
}

function Architecture() {
  const diagramRef = useRef<HTMLDivElement>(null);
  const diagramVisible = useInView(diagramRef, { once: true, amount: 0.25 });
  return <><div ref={diagramRef} className="arch-wrap glass-panel">
    <svg className={`arch-svg${diagramVisible ? " is-visible" : ""}`} viewBox="0 0 980 344" role="img" aria-labelledby="diagram-title diagram-desc">
      <title id="diagram-title">Switchyard control and execution planes</title><desc id="diagram-desc">Kanban boards feed a single dispatcher, which posts tasks to the node-agent server on the control plane. The server dispatches over gRPC, with HTTP long-poll as the fallback, to the Mac and Windows agents that own the source code. Results return to the review gate, then through the board and back to the boards.</desc>
      <defs><marker id="arch-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path className="arch-arrow-head" d="M0 1 L7 4 L0 7 Z" /></marker></defs>
      <rect x="10" y="10" width="630" height="322" rx="16" fill="none" stroke="var(--c-line-strong)" strokeDasharray="5 5" /><text x="30" y="40" className="arch-subtext">CONTROL PLANE · VPS</text>
      <rect x="670" y="10" width="300" height="322" rx="16" fill="none" stroke="var(--c-line-strong)" strokeDasharray="5 5" /><text x="690" y="40" className="arch-subtext">EXECUTION PLANE · WORKERS</text><text x="690" y="60" className="arch-subtext">gRPC preferred · HTTP fallback</text>
      <g className="arch-edges" aria-hidden="true">
        <line className="arch-edge" x1="184" y1="126" x2="222" y2="126" markerEnd="url(#arch-arrow)" />
        <line className="arch-edge" x1="382" y1="126" x2="430" y2="126" markerEnd="url(#arch-arrow)" />
        <line className="arch-edge" x1="630" y1="126" x2="690" y2="126" markerEnd="url(#arch-arrow)" />
        <line className="arch-edge" x1="655" y1="126" x2="655" y2="278" />
        <line className="arch-edge" x1="655" y1="278" x2="690" y2="278" markerEnd="url(#arch-arrow)" />
        <line className="arch-edge" x1="530" y1="168" x2="530" y2="244" markerEnd="url(#arch-arrow)" />
        <line className="arch-edge" x1="430" y1="286" x2="382" y2="286" markerEnd="url(#arch-arrow)" />
        <path className="arch-edge" d="M222 286 H109 V168" markerEnd="url(#arch-arrow)" />
      </g>
      <g aria-hidden="true"><rect className="arch-box" x="34" y="84" width="150" height="84" rx="10" /><text x="52" y="116" className="arch-text">Kanban boards</text><text x="52" y="136" className="arch-subtext">SQLite per board</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="222" y="84" width="160" height="84" rx="10" /><text x="240" y="116" className="arch-text">Single dispatcher</text><text x="240" y="136" className="arch-subtext">poll every 30s</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="430" y="84" width="200" height="84" rx="10" /><text x="448" y="116" className="arch-text">Node-agent server</text><text x="448" y="136" className="arch-subtext">:8788 HTTP · :8789 gRPC</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="430" y="244" width="200" height="84" rx="10" /><text x="448" y="276" className="arch-text">Review gate</text><text x="448" y="296" className="arch-subtext">diff + approve</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="222" y="244" width="160" height="84" rx="10" /><text x="240" y="276" className="arch-text">Board</text><text x="240" y="296" className="arch-subtext">review → done</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="690" y="84" width="270" height="84" rx="10" /><text x="708" y="114" className="arch-text">Mac agent</text><text x="708" y="134" className="arch-subtext">hermes · codex · claude</text><text x="708" y="151" className="arch-subtext">commandcode · dsh · shell</text></g>
      <g aria-hidden="true"><rect className="arch-box" x="690" y="236" width="270" height="84" rx="10" /><text x="708" y="266" className="arch-text">Windows agent</text><text x="708" y="286" className="arch-subtext">registered workspace host</text></g>
      <text x="240" y="196" className="arch-subtext">POST /api/dispatch</text><text x="540" y="210" className="arch-subtext">result</text><text x="690" y="204" className="arch-subtext">POST /api/nodes/:id/result</text>
    </svg>
    <ol className="arch-mobile"><li><strong>Control plane:</strong> boards store tasks in SQLite per board.</li><li>The single dispatcher polls every 30 seconds and sends <code className="mono">POST /api/dispatch</code> to the node-agent server.</li><li><strong>Execution plane:</strong> Mac and Windows agents run on the hosts that own the source code. gRPC is preferred; HTTP long-poll is the fallback.</li><li>Workers return results through <code className="mono">POST /api/nodes/:id/result</code>.</li><li>The review gate fetches the diff. A person approves before the task moves to done.</li></ol>
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
  return <div className="api-code"><div ref={tabListRef} className="tab-list" role="tablist" aria-label="API examples" onKeyDown={keyDown}>{tabs.map((name, index) => <button key={name} id={`api-tab-${index}`} role="tab" className="tab-button" aria-selected={tab === index} aria-controls="api-tabpanel" tabIndex={tab === index ? 0 : -1} onClick={() => setTab(index)}>{name}</button>)}</div><div id="api-tabpanel" role="tabpanel" aria-labelledby={`api-tab-${tab}`}><CopyButton value={snippets[tab]} compact /><pre className="mono" tabIndex={0}><code>{snippets[tab]}</code></pre></div></div>;
}

function TransportToy() {
  const [grpc, setGrpc] = useState(true);
  const fastLane = useRef<HTMLSpanElement>(null);
  const slowLane = useRef<HTMLSpanElement>(null);
  // The packet travels the full track, so its distance comes from the measured line.
  useEffect(() => {
    const measure = () => {
      for (const ref of [fastLane, slowLane]) {
        const el = ref.current;
        if (el) el.style.setProperty("--lane-w", `${el.clientWidth}px`);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return <div className="transport-toy glass-panel"><div className="board-topline"><strong>Worker connection</strong><span className="chip">Illustration · <code className="mono">{grpc ? "grpc" : "http"}</code></span></div><div className={`lane${grpc ? " active" : ""}`}><Radio size={17} /><code className="mono">gRPC stream</code><span className="lane-line" ref={grpc ? fastLane : slowLane}><span className="lane-packet" style={{ "--packet-dur": grpc ? "1.2s" : "3.2s" } as CSSProperties} /></span><span>{grpc ? "active" : "available"}</span></div><div className={`lane${!grpc ? " active" : ""}`}><Route size={17} /><code className="mono">HTTP long-poll</code><span className="lane-line" ref={grpc ? slowLane : fastLane}><span className="lane-packet" style={{ "--packet-dur": grpc ? "3.2s" : "1.2s" } as CSSProperties} /></span><span>{grpc ? "fallback" : "active"}</span></div><button className="button button-secondary transport-toggle" onClick={() => setGrpc(!grpc)} type="button"><RefreshCw size={15} />{grpc ? "Simulate drop" : "Restore gRPC"}</button><p className="footnote">Client-side illustration only. No network calls.</p></div>;
}

const executors = [
  ["hermes", "Hermes on the workspace host."],
  ["codex", "Codex on the workspace host."],
  ["claude", "Claude CLI on the workspace host."],
  ["commandcode", "CommandCode on the workspace host."],
  ["dsh", "DSH CLI on the workspace host."],
  ["shell", "Direct remote commands; command is the only executed input."],
] as const;

const apiRoutes = [
  ["GET / POST", "/api/boards", "Boards and tasks"],
  ["PATCH", "/api/boards/{slug}/tasks/{id}/status", "Status transitions"],
  ["PATCH", "/api/boards/{slug}/tasks/{id}/assignee", "Change assignee"],
  ["GET", "/api/boards/{slug}/tasks/{id}/diff", "Workspace diff"],
  ["POST", "/api/boards/{slug}/tasks/{id}/approve", "Commit or push"],
  ["GET/POST/PUT/DELETE", "/api/workspaces*", "Workspaces and health"],
  ["GET", "/api/flow/active", "Active flow tasks"],
  ["POST", "/api/remote/dispatch", "Manual dispatch"],
  ["GET", "/api/nodes", "Node status"],
] as const;

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
    <SiteHeader />
    <main id="main">
      <section className="hero page-shell" aria-labelledby="hero-title" itemScope itemType="https://schema.org/SoftwareApplication">
        <div className="hero-copy">
          <p className="hero-badge"><Sparkles size={13} aria-hidden="true" />The control plane for coding agents<span className="hero-badge-tag mono">human-in-the-loop</span></p>
          <h1 id="hero-title" className="hero-title">Let AI write the code. <span className="text-gradient">You approve what ships.</span></h1>
        </div>
        <div className="hero-aside">
          <p className="hero-lead">Queue tasks, dispatch them to the machine that owns your code, and let Claude, Codex or Hermes do the work. Every diff is held in review until you inspect and approve it. Autonomy for your agents, control for you.</p>
          <div className="hero-actions"><a className="button button-primary hero-cta" href={REPO} target="_blank" rel="noreferrer"><Github size={16} />View on GitHub <ArrowRight size={15} /></a><a className="button button-secondary" href="#architecture">Read the architecture</a></div>
          <ul className="hero-meta mono" aria-label="Technology stack">{["Go", "SQLite", "React + Vite", "gRPC with HTTP fallback"].map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <EngineeringBoard />
      </section>
      <div className="page-shell"><div className="principle-grid" aria-label="Why Switchyard exists">{[
        { icon: Monitor, title: "Agents run where the code lives.", body: "Your repo sits on a Mac or Windows box. Switchyard routes the agent to that host instead of dragging your source to a server.", wide: true },
        { icon: GitCommitHorizontal, title: "Agents shouldn’t commit on their own.", body: "A passing run still needs a human look at the diff.", wide: false },
        { icon: Workflow, title: "One dispatcher, one queue.", body: "Two schedulers claiming the same task is a bug, not a feature.", wide: false },
      ].map(({ icon: Icon, title, body, wide }, index) => <Reveal key={title} className={`principle${wide ? " principle--wide" : ""}`} delay={index * 0.06}><span className="principle-icon"><Icon size={19} aria-hidden="true" /></span><h2 className="principle-title">{title}</h2><p>{body}</p></Reveal>)}</div></div>
      <Section id="architecture" title="Two planes, one queue" lead="The VPS runs the control plane. Node-agent runs the execution plane on every host that owns source code. Remote workspaces are never used as cwd by local VPS processes."><Architecture /></Section>
      <Section id="lifecycle" title="Success lands in review, never in done" lead="Every executor goes through the same gate."><Lifecycle /></Section>
      <Section id="executors" title="Pick a runtime only when you need to" lead="Tasks store human intent as a title and description. Choose an executor only to force a specific runtime. Every executor below runs through node-agent on the workspace host."><div className="executor-marquee"><div className="executor-track">{[0, 1].map((pass) => <div className="executor-set" key={pass} aria-hidden={pass === 1}>{executors.map(([name, description]) => <article className="executor-card" key={name}><Terminal className="executor-icon" size={16} aria-hidden="true" />{pass === 0 ? <h3>{name}</h3> : <p className="executor-name mono">{name}</p>}<p>{description}</p></article>)}</div>)}</div></div><p className="executor-legacy"><code className="mono">auto</code> still routes through legacy SSH from the VPS for backward compatibility.</p><div className="warning-note"><AlertTriangle size={18} /><span>CommandCode runs with <code className="mono">--yolo</code>, which lets the worker edit files and run shell commands. Use it only on trusted nodes.</span></div><div className="match-demo"><div><p>Node capabilities</p><span className="chip mono">hermes · codex · claude · commandcode · dsh · shell</span></div><ArrowRight className="problem-icon" size={19} aria-hidden="true" /><div><p>Request</p><span className="chip mono">dsh</span><span className="footnote">The server picks a node by workspace prefix plus executor capability. A node without that executor is rejected with <code className="mono">executor unavailable</code>.</span></div></div></Section>
      <Section id="transport" title="gRPC when it’s up, HTTP when it isn’t" lead="Node-agent prefers gRPC and falls back to HTTP long-poll when the stream drops. Operators can see which path a task took."><div className="transport-layout"><TransportToy /><div><table className="config-table"><thead><tr><th>Setting</th><th>Meaning</th></tr></thead><tbody><tr><td><code className="mono">NODE_AGENT_TRANSPORT=auto</code></td><td>gRPC preferred, HTTP fallback</td></tr><tr><td><code className="mono">NODE_AGENT_TRANSPORT=grpc</code></td><td>Fail-closed when gRPC is unavailable</td></tr><tr><td><code className="mono">NODE_AGENT_TRANSPORT=http</code></td><td>Forces the compatibility lane</td></tr></tbody></table><span className="security-chip"><LockKeyhole size={14} />Keep gRPC port <code className="mono">8789</code> private on the tailnet. Tailscale connects VPS and workers.</span></div></div></Section>
      <Section id="context" title="Less context in, less noise out" lead="Three layers keep agent prompts and shell output small."><div className="context-grid">{[["codegraph", "Structural index of the codebase on the workspace host.", "Used for hermes, codex and commandcode."], ["rtk", "Shortens verbose shell commands and output within bounded timeouts.", "800 ms hook check/rewrite · 2 s --ultra-compact cap"], ["caveman", "Optional compact output for shell over 8 KiB, with fail-open behavior.", "NODE_AGENT_SHELL_CAVEMAN=1"]].map(([name, text, detail]) => <Reveal key={name} className="context-card"><h3>{name}</h3><p>{text}</p><span className="mono">{detail}</span></Reveal>)}</div><p className="footnote">Shell tasks skip AGENTS/README/codegraph prompt injection by default.</p></Section>
      <Section id="api" title="A small, boring API" lead="A compact surface for boards, tasks, workspaces, flow and remote dispatch."><div className="api-layout"><div><ul className="api-list">{apiRoutes.map(([method, path, purpose]) => <li className="api-row" key={path}><span className="api-method mono">{method}</span><span className="api-path mono">{path}</span><span className="api-purpose">{purpose}</span></li>)}</ul><p className="footnote">All <code className="mono">/api/*</code> routes require the <code className="mono">kanban_session</code> HttpOnly cookie except the four <code className="mono">/api/auth/*</code> routes.</p></div><CodeTabs /></div></Section>
      <Section id="deploy" title="Roll out the VPS first" lead="Mac and Windows agents keep running with their previous capabilities until you upgrade them."><div className="deploy-layout"><div className="timeline-wrap"><ol className="timeline">{[<>Build and restart node-agent server on the VPS (HTTP <code className="mono">:8788</code>, gRPC <code className="mono">:8789</code>).</>, "Build and restart kanban-board (Switchyard).", <>Cross-build the worker binary (<code className="mono">GOOS=darwin GOARCH=arm64</code> for Apple Silicon).</>, "Reinstall the agent on Mac or Windows and restart the LaunchAgent or service.", <>Confirm node is <code className="mono">idle</code> and capability and <code className="mono">transports</code> show at <code className="mono">/api/nodes</code>.</>, <>Run a dispatch canary: expect <code className="mono">success=true</code>, a <code className="mono">delivery_id</code>, and transport <code className="mono">grpc</code> (or fallback <code className="mono">http</code>).</>].map((text, index) => <li key={index}><p>{text}</p></li>)}</ol></div><div><CodeBlock code={`go vet ./...\ngo test ./...\ngo build -o bin/kanban-board ./cmd/server\ncd web && pnpm build\npm2 restart kanban-board`} label="Build and deploy commands" /><div className="fact-card">Production serves static <code className="mono">web/dist</code> from the Go binary; no Node or Bun runtime stays alive.</div><div className="fact-card">Frontend builds are RAM-heavy on a 2 GB VPS.</div></div></div></Section>
      <Section id="faq" title="Questions about the review gate"><div className="faq-panel glass" onKeyDown={handleFaqKeyDown}>{faqs.map(([question, answer], index) => <div className="faq-item" key={question}><h3 style={{ margin: 0, fontSize: "inherit", fontWeight: "inherit" }}><button id={`faq-button-${index}`} className="faq-question" type="button" aria-expanded={openFaq === index} aria-controls={`faq-panel-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>{question}<ChevronDown size={17} aria-hidden="true" /></button></h3><div className="faq-answer-wrap" data-open={openFaq === index}><div id={`faq-panel-${index}`} className="faq-answer" role="region" aria-labelledby={`faq-button-${index}`} aria-hidden={openFaq !== index} inert={openFaq !== index}><p>{answer}</p></div></div></div>)}</div></Section>
      <section className="page-shell final-cta glass" aria-labelledby="final-title"><div className="mascot-mark"><Image src="/brand/mascot-switchyard.png" width={120} height={120} alt="" aria-hidden="true" priority={false} /></div><h2 id="final-title">Put a gate in front of your agents</h2><p>Control plane in Go, execution plane in node-agent.</p><div className="final-actions"><a className="button button-primary" href={REPO} target="_blank" rel="noreferrer">View on GitHub <ArrowRight size={16} /></a><a className="button button-secondary" href={NODE_AGENT} target="_blank" rel="noreferrer">node-agent repo</a></div></section>
    </main>
    <footer className="site-footer page-shell"><a className="brand" href="#main"><LogoMark size={22} /><span>Switchyard</span></a><nav className="footer-links" aria-label="Related links"><a href={REPO} target="_blank" rel="noreferrer">Switchyard</a><a href={NODE_AGENT} target="_blank" rel="noreferrer">node-agent</a><a href={`${REPO}/blob/main/design.md`} target="_blank" rel="noreferrer">Design spec</a><a href="https://commandcode.ai/docs/headless" target="_blank" rel="noreferrer">CommandCode headless docs</a><a href="https://github.com/rtk-ai/rtk" target="_blank" rel="noreferrer">RTK</a><a href="https://github.com/JuliusBrussee/caveman" target="_blank" rel="noreferrer">Caveman</a></nav><ThemeSwitch /><span className="footer-note">Part of a two-repo system · Switchyard is the control plane, node-agent is the execution plane.</span></footer>
  </>;
}
