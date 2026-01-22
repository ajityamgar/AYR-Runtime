import React, { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const BackgroundFX = ({ mouseX, mouseY, active }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Deep base gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(34,211,238,0.10),transparent_55%),radial-gradient(850px_circle_at_80%_30%,rgba(56,189,248,0.08),transparent_60%),radial-gradient(900px_circle_at_50%_90%,rgba(34,211,238,0.06),transparent_60%)]" />

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:70px_70px]" />

      {/* Noise-like overlay */}
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0)] [background-size:22px_22px]" />

      {/* Mouse spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(520px circle at ${mouseX}px ${mouseY}px, rgba(34,211,238,0.16), transparent 60%)`,
        }}
      />
    </div>
  );
};

const Particles = () => {
  const dots = useMemo(() => {
    const count = 18;
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 1 + Math.random() * 2.3;
      const dur = 4 + Math.random() * 6;
      const delay = Math.random() * 4;
      const opacity = 0.18 + Math.random() * 0.25;
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

      {/* keyframes */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px);   opacity: 0.15; }
          50%  { transform: translateY(-14px); opacity: 0.35; }
          100% { transform: translateY(0px);   opacity: 0.15; }
        }
      `}</style>
    </div>
  );
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
    {children}
  </span>
);

const StatMini = ({ icon, label }) => {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/75 transition hover:bg-white/7 hover:border-cyan-400/25">
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </div>
  );
};

const TiltCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [style, setStyle] = useState({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
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
      transform: `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`,
    });
  };

  const onLeave = () => {
    setStyle({
      transform: "perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0px)",
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

const FeatureCard = ({ title, desc, icon = "⚡" }) => {
  return (
    <TiltCard>
      <div className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-cyan-400/35 hover:bg-white/7 hover:shadow-[0_0_60px_rgba(34,211,238,0.14)] overflow-hidden">
        {/* glow edge */}
        <div className="pointer-events-none absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.18),transparent_55%)]" />

        <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-200 text-xl transition-transform duration-300 group-hover:scale-[1.08] group-hover:-rotate-3">
          {icon}
        </div>

        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/55">{desc}</p>

        <div className="mt-6 flex items-center gap-2 text-xs text-white/40">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-300/60" />
          <span>Built for learning + debugging</span>
        </div>
      </div>
    </TiltCard>
  );
};

const MiniIDEPreview = ({ code, output, active = "run" }) => {
  return (
    <TiltCard className="relative">
      <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
        {/* animated border glow */}
        <div className="pointer-events-none absolute -inset-[2px] rounded-[30px] opacity-70 blur-[18px] bg-[conic-gradient(from_180deg,rgba(34,211,238,0.18),rgba(56,189,248,0.06),rgba(34,211,238,0.18))] animate-spinSlow" />
        <div className="absolute inset-0 rounded-[28px] bg-[#070B12]/40" />

        <style>{`
          @keyframes spinSlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spinSlow {
            animation: spinSlow 9s linear infinite;
          }
        `}</style>

        {/* content */}
        <div className="relative">
          {/* top bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="h-3 w-3 rounded-full bg-white/10" />
              <div className="h-3 w-3 rounded-full bg-white/10" />
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-[11px] border ${
                  active === "run"
                    ? "border-cyan-400/45 bg-cyan-500/15 text-white"
                    : "border-white/10 bg-white/5 text-white/60"
                }`}
              >
                Run
              </span>
              <span
                className={`rounded-full px-3 py-1 text-[11px] border ${
                  active === "debug"
                    ? "border-cyan-400/45 bg-cyan-500/15 text-white"
                    : "border-white/10 bg-white/5 text-white/60"
                }`}
              >
                Debug
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">
                Back
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">
                Next
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* editor */}
            <div className="rounded-2xl border border-white/10 bg-[#070B12] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">
                  editor.ayr
                </div>
                <div className="flex gap-2">
                  <Badge>Monaco</Badge>
                  <Badge>Hindi</Badge>
                </div>
              </div>

              <pre className="text-xs leading-relaxed text-white/85 whitespace-pre-wrap">
                {code}
              </pre>
            </div>

            {/* output */}
            <div className="rounded-2xl border border-white/10 bg-[#070B12] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold text-white/80">Output</div>
                <Badge>Live</Badge>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                <pre className="text-xs text-white/80 whitespace-pre-wrap">
                  {output}
                </pre>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                  <div className="text-[11px] text-white/45">Vars</div>
                  <div className="text-[11px] text-white/80">x, y, name</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                  <div className="text-[11px] text-white/45">Timeline</div>
                  <div className="text-[11px] text-white/80">12 states</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-2">
                  <div className="text-[11px] text-white/45">Problems</div>
                  <div className="text-[11px] text-white/80">0 errors</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Step-by-step Debugging</Badge>
            <Badge>Time Travel Timeline</Badge>
            <Badge>Human-friendly Errors</Badge>
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

export default function Home() {
  const navigate = useNavigate();

  const [howStep, setHowStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({
    loading: false,
    ok: false,
    msg: "",
  });

  const wrapRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [mouseActive, setMouseActive] = useState(false);

  const handleMouseMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const demoCode = useMemo(() => {
    return `name = "Ajit"
age = 20

dikhao "Name = {name}"
dikhao "Age  = {age}"`;
  }, []);

  const preview = useMemo(() => {
    if (howStep === 1) {
      return {
        active: "run",
        code: `dikhao "Hello AYR Runtime!"`,
        out: `Hello AYR Runtime!`,
      };
    }
    if (howStep === 2) {
      return {
        active: "debug",
        code: `x = 10
y = 5

dikhao x + y
dikhao x * y`,
        out: `15\n50`,
      };
    }
    return {
      active: "debug",
      code: `x = 10
y = 0

dikhao x
dikhao x / y`,
      out: `10\n(then error in Problems tab)`,
    };
  }, [howStep]);

  const handleChange = (e) => {
    setStatus({ loading: false, ok: false, msg: "" });
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, ok: false, msg: "" });

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("subject", form.subject);
      fd.append("message", form.message);

      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbyn3hQyOSpR394y2PbP5YimpjAY95VgP1XGVRIcVR0fNfhKh8rmPE8Yk_ifU5NOM1JB/exec",
        { method: "POST", body: fd }
      );

      const text = await res.text();

      if (text.includes("OK")) {
        setStatus({
          loading: false,
          ok: true,
          msg: "Message sent successfully ✅",
        });
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus({ loading: false, ok: false, msg: "Failed: " + text });
      }
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, ok: false, msg: "Failed to send message ❌" });
    }
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
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-16 md:pt-20 md:pb-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          {/* LEFT */}
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge>Hindi Keywords</Badge>
              <Badge>Web IDE</Badge>
              <Badge>Debugger</Badge>
              <Badge>Timeline</Badge>
            </div>

            <h1 className="mt-5 text-5xl font-extrabold tracking-tight md:text-6xl">
              AYR Runtime
            </h1>

            <p className="mt-4 text-lg text-white/70">
              Hindi-Keyword Programming Language + Web IDE with Debugging
            </p>

            <p className="mt-7 max-w-2xl text-sm leading-relaxed text-white/55">
              AYR Runtime is a Hindi-keyword based programming language and
              runtime platform built completely from scratch using Python. Write
              code, run instantly, and debug step-by-step inside the browser.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-start gap-3 sm:flex-row sm:items-center">
              <Link
                to="/code-now"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-semibold text-black transition hover:bg-cyan-400"
              >
                &gt;_ Code Now
              </Link>

              <Link
                to="/learn"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Learn AYR Runtime
              </Link>

              <button
                onClick={() =>
                  navigate(`/code-now?code=${encodeURIComponent(demoCode)}`)
                }
                className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-8 py-4 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
              >
                Start Demo →
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <StatMini icon="✅" label="Beginner Friendly Syntax" />
              <StatMini icon="⚡" label="Run in Browser" />
              <StatMini icon="🐞" label="Step Debugging" />
              <StatMini icon="🕒" label="Time Travel Timeline" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <MiniIDEPreview
              code={preview.code}
              output={preview.out}
              active={preview.active}
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative mx-auto max-w-7xl px-4 pb-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Why Choose AYR Runtime?</h2>
          <p className="mt-3 text-sm text-white/55">
            Powerful features designed for modern development workflows
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon="🌱"
            title="Beginner Friendly Syntax"
            desc="Hindi-like keywords make programming more readable and easier to learn."
          />
          <FeatureCard
            icon="🖥️"
            title="Web-Based IDE"
            desc="No setup needed. Write and run AYR code directly in your browser."
          />
          <FeatureCard
            icon="🐞"
            title="Built-in Debugger"
            desc="Step through execution and navigate with Back/Next for timeline-style debugging."
          />
          <FeatureCard
            icon="🧠"
            title="Human-friendly error messages"
            desc="Clear, beginner-friendly runtime errors with line-based messages and expression context."
          />
          <FeatureCard
            icon="📊"
            title="Full Debug Panels"
            desc="Track execution using Output, Variables, Timeline, Memory, and Detail panels in real-time."
          />
          <FeatureCard
            icon="🧭"
            title="Step-by-Step Debugging"
            desc="Run in Debug mode and control execution using Step, Back, and Next for timeline-style debugging."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold">How It Works</h2>
          <p className="mt-3 text-sm text-white/55">
            Click steps to preview inside IDE
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-[380px_1fr] md:items-start">
          {/* Steps */}
          <div className="grid gap-4">
            {[
              {
                n: 1,
                title: "Write Your Code",
                desc: "Online editor me AYR code likho (Hindi keywords).",
              },
              {
                n: 2,
                title: "Run & Debug",
                desc: "Run output deta hai. Debug mode me step-by-step execution hota hai.",
              },
              {
                n: 3,
                title: "Time Travel (Back/Next)",
                desc: "Timeline navigate karo aur variables inspect karke concept fast clear karo.",
              },
            ].map((s) => {
              const active = howStep === s.n;
              return (
                <button
                  key={s.n}
                  onClick={() => setHowStep(s.n)}
                  className={`text-left rounded-[24px] border p-6 transition-all duration-300 ${
                    active
                      ? "border-cyan-400/45 bg-cyan-500/10 shadow-[0_0_45px_rgba(34,211,238,0.12)]"
                      : "border-white/10 bg-white/5 hover:bg-white/7 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-2xl font-bold ${
                        active
                          ? "bg-cyan-500/15 text-cyan-200"
                          : "bg-white/5 text-white/70"
                      }`}
                    >
                      {s.n}
                    </div>
                    <div className="text-white font-semibold">{s.title}</div>
                  </div>
                  <p className="mt-3 text-sm text-white/55 leading-relaxed">
                    {s.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <MiniIDEPreview
            code={preview.code}
            output={preview.out}
            active={preview.active}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-7xl px-4 pb-24">
        <TiltCard>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 md:p-12 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-cyan-400/20 hover:bg-white/7 hover:shadow-[0_0_65px_rgba(34,211,238,0.10)]">
            <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-300 text-2xl">
              🚀
            </div>
            <h2 className="text-4xl font-extrabold">
              Ready to Start Coding in AYR Runtime?
            </h2>
            <p className="mt-3 text-white/60">
              Write your first AYR program, run it instantly, and explore
              debugging with step-by-step execution.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/code-now"
                className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-10 py-4 text-sm font-semibold text-black transition hover:bg-cyan-400"
              >
                Start Coding Now →
              </Link>

              <button
                onClick={() =>
                  navigate(`/code-now?code=${encodeURIComponent(demoCode)}`)
                }
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Run Demo →
              </button>
            </div>
          </div>
        </TiltCard>
      </section>

      {/* CONTACT */}
      <section className="relative mx-auto max-w-7xl px-4 pb-28">
        <TiltCard>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-10 md:p-12 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition hover:border-cyan-400/20 hover:bg-white/7 hover:shadow-[0_0_70px_rgba(34,211,238,0.10)]">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold">Contact Us</h2>
              <p className="mt-3 text-sm text-white/55">
                Have feedback, feature ideas, or want to collaborate on AYR
                Runtime? Send a message and I’ll get back to you.
              </p>
            </div>

            {/* status */}
            {status.msg ? (
              <div
                className={`mx-auto mt-8 max-w-3xl rounded-2xl border p-4 text-sm ${
                  status.ok
                    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                    : "border-red-400/30 bg-red-500/10 text-red-200"
                }`}
              >
                {status.msg}
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 grid max-w-3xl gap-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm text-white/70">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070B12] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70">Email Address</label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Enter your email"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070B12] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70">Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#070B12] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-white/70">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows={5}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-[#070B12] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60"
                  required
                />
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
                <p className="text-xs text-white/40">
                  By submitting this form, you agree to be contacted back
                  regarding your request.
                </p>

                <button
                  type="submit"
                  disabled={status.loading}
                  className={`w-full sm:w-auto rounded-2xl px-8 py-3 text-sm font-semibold transition ${
                    status.loading
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-cyan-500 text-black hover:bg-cyan-400"
                  }`}
                >
                  {status.loading ? "Sending..." : "Send Message →"}
                </button>
              </div>
            </form>
          </div>
        </TiltCard>
      </section>
    </div>
  );
}
