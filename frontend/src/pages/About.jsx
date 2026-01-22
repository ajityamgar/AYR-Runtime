// src/pages/about.jsx
import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/* ---------------- Background FX ---------------- */
const BackgroundFX = ({ mouseX, mouseY, active }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Base glow gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(34,211,238,0.13),transparent_55%),radial-gradient(900px_circle_at_85%_25%,rgba(56,189,248,0.10),transparent_60%),radial-gradient(1100px_circle_at_55%_95%,rgba(34,211,238,0.08),transparent_60%)]" />

      {/* Soft grid */}
      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:72px_72px]" />

      {/* Micro dots */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0)] [background-size:22px_22px]" />

      {/* Spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(560px circle at ${mouseX}px ${mouseY}px, rgba(34,211,238,0.20), transparent 60%)`,
        }}
      />

      {/* Top shimmer */}
      <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
    </div>
  );
};

const Particles = () => {
  const dots = useMemo(() => {
    const count = 22;
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 1 + Math.random() * 2.4;
      const dur = 4 + Math.random() * 6;
      const delay = Math.random() * 4;
      const opacity = 0.14 + Math.random() * 0.22;
      return { id: i, left, top, size, dur, delay, opacity };
    });
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0">
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full bg-cyan-300/70"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            opacity: d.opacity,
            animation: `floatUp ${d.dur}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px);   opacity: 0.12; }
          50%  { transform: translateY(-18px); opacity: 0.35; }
          100% { transform: translateY(0px);   opacity: 0.12; }
        }
      `}</style>
    </div>
  );
};

/* ---------------- UI Helpers ---------------- */
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
    {children}
  </span>
);

const Bullet = ({ children }) => (
  <li className="list-disc ml-5 text-sm text-white/60 leading-relaxed">
    {children}
  </li>
);

/* ---------------- Tilt Wrapper ---------------- */
const TiltCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({
    transform: "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)",
  });

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    const rx = clamp(((y / r.height) * 2 - 1) * -6, -8, 8);
    const ry = clamp(((x / r.width) * 2 - 1) * 6, -8, 8);

    setStyle({
      transform: `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`,
    });
  };

  const onLeave = () => {
    setStyle({
      transform:
        "perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)",
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-200 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

/* ---------------- Premium Card ---------------- */
const PremiumCard = ({ icon, title, desc, children }) => {
  return (
    <TiltCard>
      <div className="group relative rounded-[28px] border border-white/10 bg-white/5 p-7 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-300 hover:bg-white/7 hover:border-cyan-400/30 hover:shadow-[0_0_80px_rgba(34,211,238,0.12)] overflow-hidden">
        {/* animated border glow */}
        <div className="pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-60 blur-[18px] bg-[conic-gradient(from_180deg,rgba(34,211,238,0.16),rgba(56,189,248,0.06),rgba(34,211,238,0.16))] animate-spinSlow" />
        <div className="absolute inset-0 rounded-[28px] bg-[#070B12]/35" />

        <style>{`
          @keyframes spinSlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spinSlow { animation: spinSlow 12s linear infinite; }
        `}</style>

        <div className="relative">
          <div className="flex items-center gap-3">
            {icon ? (
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-200 text-lg transition-transform duration-300 group-hover:scale-[1.08] group-hover:-rotate-3">
                {icon}
              </div>
            ) : null}

            <h3 className="text-xl font-extrabold text-white">{title}</h3>
          </div>

          {desc ? (
            <p className="mt-3 text-sm leading-relaxed text-white/55">{desc}</p>
          ) : null}

          {children ? <div className="mt-5">{children}</div> : null}
        </div>
      </div>
    </TiltCard>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <TiltCard>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/7 hover:border-cyan-400/25 hover:shadow-[0_0_55px_rgba(34,211,238,0.10)]">
        <div className="text-3xl font-extrabold text-white">{value}</div>
        <div className="mt-1 text-xs text-white/45">{label}</div>
      </div>
    </TiltCard>
  );
};

/* ---------------- Feature Pill ---------------- */
const Pill = ({ icon, title, desc }) => {
  return (
    <TiltCard>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/7 hover:border-cyan-400/25">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-200">
            {icon}
          </div>
          <div className="text-white font-semibold">{title}</div>
        </div>
        <p className="mt-3 text-sm text-white/55 leading-relaxed">{desc}</p>
      </div>
    </TiltCard>
  );
};

/* =========================================================
   ABOUT PAGE (10/10)
========================================================= */
export default function About() {
  const navigate = useNavigate();

  // Mouse spotlight
  const wrapRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [mouseActive, setMouseActive] = useState(false);

  const handleMouseMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setMouseActive(true)}
      onMouseLeave={() => setMouseActive(false)}
      className="relative min-h-screen bg-[#070B12] text-white overflow-hidden"
    >
      <BackgroundFX mouseX={mouse.x} mouseY={mouse.y} active={mouseActive} />
      <Particles />

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-4 pt-14 pb-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          {/* Left */}
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>Hindi Keywords</Badge>
              <Badge>Web IDE</Badge>
              <Badge>Debugger</Badge>
              <Badge>Timeline</Badge>
            </div>

            <h1 className="mt-5 text-5xl md:text-6xl font-extrabold tracking-tight">
              AYR Runtime
            </h1>

            <p className="mt-4 text-lg text-white/70">
              Debugging-first platform for learning programming.
            </p>

            <p className="mt-7 max-w-2xl text-sm leading-relaxed text-white/55">
              AYR Runtime beginner-friendly Hindi-keyword language hai jisme tum
              browser ke andar hi code likh sakte ho, run kar sakte ho aur
              step-by-step debug kar sakte ho — without setup.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link
                to="/code-now"
                className="rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-semibold text-black hover:bg-cyan-400 text-center"
              >
                Start Coding Now →
              </Link>
              <Link
                to="/learn"
                className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/90 hover:bg-white/10 text-center"
              >
                Learn AYR Runtime →
              </Link>
            </div>
          </div>

          {/* Right stats */}
          <div className="grid gap-4">
            <StatCard label="Hindi Keywords" value="✅" />
            <StatCard label="Run in Browser" value="⚡" />
            <StatCard label="Step Debugging" value="🐞" />
            <StatCard label="Time Travel" value="🕒" />
          </div>
        </div>
      </section>

      {/* PROBLEM → SOLUTION → RESULT */}
      <section className="relative mx-auto max-w-7xl px-4 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold">Problem → Solution → Result</h2>
          <p className="mt-2 text-sm text-white/55">
            Confusion kam, learning fast.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PremiumCard
            icon="😵"
            title="Problem"
            desc="Beginners installation + errors me stuck ho jaate hai."
          >
            <ul className="space-y-2">
              <Bullet>Setup issues</Bullet>
              <Bullet>Unclear errors</Bullet>
              <Bullet>No step-by-step view</Bullet>
            </ul>
          </PremiumCard>

          <PremiumCard
            icon="🧩"
            title="Solution"
            desc="Hindi syntax + Web IDE + timeline debugger."
          >
            <ul className="space-y-2">
              <Bullet>Readable code</Bullet>
              <Bullet>Browser me direct run</Bullet>
              <Bullet>Back/Next debugging</Bullet>
            </ul>
          </PremiumCard>

          <PremiumCard
            icon="🚀"
            title="Result"
            desc="Confidence + speed + clarity in learning."
          >
            <ul className="space-y-2">
              <Bullet>Fast practice</Bullet>
              <Bullet>Debugging skill improve</Bullet>
              <Bullet>Real internals understanding</Bullet>
            </ul>
          </PremiumCard>
        </div>
      </section>

      {/* WHAT YOU CAN DO */}
      <section className="relative mx-auto max-w-7xl px-4 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold">What You Can Do</h2>
          <p className="mt-2 text-sm text-white/55">
            Write → Run → Debug → Learn
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Pill
            icon="✍️"
            title="Write Programs"
            desc="Hindi keywords: dikhao, agar, warna, jabtak, kaam, wapas"
          />
          <Pill
            icon="⚡"
            title="Run Instantly"
            desc="No installation. Browser-based Web IDE."
          />
          <Pill
            icon="🐞"
            title="Debug Like Pro"
            desc="Problems + Variables + Timeline panels."
          />
        </div>
      </section>

      {/* INTERNALS */}
      <section className="relative mx-auto max-w-7xl px-4 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold">How It Works</h2>
          <p className="mt-2 text-sm text-white/55">
            Real language pipeline: Lexer → Parser → Interpreter
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <PremiumCard
            icon="🔤"
            title="Lexer"
            desc="Code ko tokens me break karta hai (keywords, numbers, strings)."
          />
          <PremiumCard
            icon="🧱"
            title="Parser"
            desc="Tokens → AST nodes (IfNode, WhileNode, FunctionNode)."
          />
          <PremiumCard
            icon="🧠"
            title="Interpreter"
            desc="AST execute karta hai + env maintain + timeline store."
          />
        </div>
      </section>

      {/* ROADMAP */}
      <section className="relative mx-auto max-w-7xl px-4 pb-14">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold">Roadmap</h2>
          <p className="mt-2 text-sm text-white/55">
            Next upgrades for AYR Runtime.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PremiumCard
            icon="🛠️"
            title="Language"
            desc="Parser improvements + more builtins"
          >
            <ul className="space-y-2">
              <Bullet>Dictionary / Tuple literals</Bullet>
              <Bullet>More built-in functions</Bullet>
              <Bullet>Type rules upgrades</Bullet>
            </ul>
          </PremiumCard>

          <PremiumCard icon="🧪" title="IDE" desc="Better learning workflow">
            <ul className="space-y-2">
              <Bullet>Jump-to-line from Timeline</Bullet>
              <Bullet>Hover tooltips + highlighting</Bullet>
              <Bullet>Practice tracking</Bullet>
            </ul>
          </PremiumCard>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20">
        <TiltCard>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-12 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:bg-white/7 hover:border-cyan-400/25 hover:shadow-[0_0_90px_rgba(34,211,238,0.12)]">
            <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-300 text-2xl">
              🚀
            </div>
            <h2 className="text-4xl font-extrabold">Start Your Journey</h2>
            <p className="mt-3 text-white/60">
              Learn first, then build real programs in Web IDE.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/learn"
                className="rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-sm font-semibold text-white/90 hover:bg-white/10"
              >
                Learn AYR Runtime →
              </Link>

              <Link
                to="/code-now"
                className="rounded-2xl bg-cyan-500 px-10 py-4 text-sm font-semibold text-black hover:bg-cyan-400"
              >
                Open IDE →
              </Link>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* FOOTER */}
      <div className="relative border-t border-white/10 bg-white/5">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-white/40">
          AYR Runtime • Debugging-first learning platform
        </div>
      </div>
    </div>
  );
}
